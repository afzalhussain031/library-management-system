from rest_framework import viewsets, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Q, Value
from django.db.models.functions import Concat
from django.db import transaction
import csv
import re
from datetime import date

from common.permissions.base import IsStaffOrReadOnly

from .models import Book, Category, Publisher, Wishlist, Language, Review
from .serializers import BookSerializer, CategorySerializer, PublisherSerializer, WishlistSerializer, LanguageSerializer, ReviewSerializer
from apps.accounts.models import CustomUser
from apps.inventory.models import BookCopy


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [IsStaffOrReadOnly]

    def _get_recommended_queryset_and_meta(self, user):
        """
        Calculates book recommendations based on user status:
        - If user has wishlist items (Regular User): recommends books matching categories/authors of wishlisted books (excluding wishlisted books themselves), sorted by popularity.
        - If user has no wishlist items (New User): recommends top most loaned books.
        Returns (queryset, meta_dict).
        """
        is_authenticated = user and user.is_authenticated
        wishlist_items = Wishlist.objects.filter(user=user) if is_authenticated else Wishlist.objects.none()
        has_wishlist = wishlist_items.exists()

        if has_wishlist:
            wishlist_book_ids = list(wishlist_items.values_list('book_id', flat=True))
            categories = list(Book.objects.filter(id__in=wishlist_book_ids).values_list('category_id', flat=True).distinct())
            authors = list(Book.objects.filter(id__in=wishlist_book_ids).values_list('author', flat=True).distinct())

            # Find books in same categories or by same authors, excluding already wishlisted books
            matching_qs = Book.objects.filter(
                Q(category_id__in=categories) | Q(author__in=authors)
            ).exclude(
                id__in=wishlist_book_ids
            ).annotate(loan_count=Count('copies__loans')).order_by('-loan_count', '-id').distinct()

            # If matching count is small, fallback to top loaned books (still excluding wishlisted books)
            if matching_qs.count() < 4:
                queryset = Book.objects.exclude(id__in=wishlist_book_ids).annotate(loan_count=Count('copies__loans')).order_by('-loan_count', '-id')
            else:
                queryset = matching_qs

            meta = {
                "recommendation_type": "wishlist",
                "title": "Recommended based on your Wishlist",
                "reason": "Based on books and topics in your wishlist"
            }
            return queryset, meta
        else:
            queryset = Book.objects.annotate(loan_count=Count('copies__loans')).order_by('-loan_count', '-id')
            meta = {
                "recommendation_type": "most_loaned",
                "title": "Popular Books (Most Loaned)",
                "reason": "Most popular books in the library"
            }
            return queryset, meta

    def get_queryset(self):
        queryset = Book.objects.all()
        
        # Filtering
        filter_param = self.request.query_params.get('filter')
        if filter_param:
            if filter_param.lower() == 'available':
                queryset = queryset.filter(copies__status='available').distinct()
            elif filter_param.lower() == 'recommended':
                queryset, _ = self._get_recommended_queryset_and_meta(self.request.user)

        # Faceted Filtering
        categories = self.request.query_params.getlist('category')
        if categories:
            queryset = queryset.filter(category__name__in=categories)
            
        authors = self.request.query_params.getlist('author')
        if authors:
            queryset = queryset.filter(author__in=authors)
            
        years = self.request.query_params.getlist('year')
        if years:
            queryset = queryset.filter(published_date__year__in=years)
            
        languages = self.request.query_params.getlist('language')
        if languages:
            queryset = queryset.filter(language__name__in=languages)
                
        # Sorting
        sort_param = self.request.query_params.get('sort')
        if sort_param:
            if sort_param.lower() == 'newest':
                queryset = queryset.order_by('-published_date')
            elif sort_param.lower() == 'author':
                queryset = queryset.order_by('author')
            elif sort_param.lower() in ['popularity', '-popularity']:
                queryset = queryset.annotate(loan_count=Count('copies__loans')).order_by('-loan_count')
                
        return queryset.select_related(
            'category', 'publisher', 'language', 'added_by'
        ).prefetch_related(
            'copies', 'copies__loans', 'reservations'
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def recommendations(self, request):
        queryset, meta = self._get_recommended_queryset_and_meta(request.user)
        
        # Optimize queries to prevent 504 Timeouts (N+1 query problem)
        queryset = queryset.select_related(
            'category', 'publisher', 'language', 'added_by'
        ).prefetch_related(
            'copies', 'copies__loans', 'reservations'
        )
        
        serializer = self.get_serializer(queryset[:10], many=True)
        return Response({
            "recommendation_type": meta["recommendation_type"],
            "title": meta["title"],
            "reason": meta["reason"],
            "results": serializer.data
        })

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        book_ids = request.data.get('book_ids', [])
        if not book_ids or not isinstance(book_ids, list):
            return Response({"detail": "No book IDs provided."}, status=400)

        books = Book.objects.filter(id__in=book_ids)
        from apps.circulation.models import Loan
        active_loan_book_ids = set(
            Loan.objects.filter(copy__book__in=books, copy__status=BookCopy.LOANED, returned_at__isnull=True)
            .values_list('copy__book_id', flat=True)
        )

        deletable_books = books.exclude(id__in=active_loan_book_ids)
        deleted_count = deletable_books.count()
        deletable_books.delete()

        protected_count = len(active_loan_book_ids)
        protected_titles = list(books.filter(id__in=active_loan_book_ids).values_list('title', flat=True)[:5])

        if deleted_count == 0 and protected_count > 0:
            titles_str = ", ".join(f"'{t}'" for t in protected_titles)
            return Response({
                "detail": f"None of the selected books could be deleted because all of them have copies currently on active loan: {titles_str}."
            }, status=400)

        return Response({
            "success": True,
            "deleted_count": deleted_count,
            "protected_count": protected_count,
            "protected_titles": protected_titles,
        })

    @action(detail=False, methods=['post'], url_path='bulk-upload', parser_classes=[MultiPartParser, FormParser])
    def bulk_upload(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"detail": "No file uploaded. Please select a CSV file."}, status=400)

        if not file_obj.name.lower().endswith('.csv'):
            return Response({"detail": "Invalid file format. Please upload a .csv file."}, status=400)

        content = file_obj.read()
        decoded_text = None
        for encoding in ['utf-8-sig', 'utf-8', 'latin-1', 'cp1252']:
            try:
                decoded_text = content.decode(encoding)
                break
            except UnicodeDecodeError:
                continue

        if not decoded_text:
            return Response({"detail": "Unable to decode CSV file. Please save it as UTF-8."}, status=400)

        lines = decoded_text.splitlines()
        reader = list(csv.reader(lines))
        if not reader:
            return Response({"detail": "The uploaded CSV file is empty."}, status=400)

        # 1. Detect header row by scanning for common keywords
        header_row_idx = -1
        for idx, row in enumerate(reader[:15]):
            normalized_cells = [cell.strip().lower() for cell in row]
            if any(k in normalized_cells for k in ['isbn', 'title', 'name of the book', 'book name', 'author']):
                header_row_idx = idx
                break

        if header_row_idx == -1:
            header_row_idx = 0

        header_row = reader[header_row_idx]
        data_rows = reader[header_row_idx + 1:]

        # 2. Map column headers to canonical names
        col_map = {}
        for col_idx, col_name in enumerate(header_row):
            clean_name = col_name.strip().lower()
            if any(k in clean_name for k in ['title', 'name of the book', 'book name', 'book_name']):
                col_map['title'] = col_idx
            elif 'isbn' in clean_name:
                col_map['isbn'] = col_idx
            elif any(k in clean_name for k in ['author', 'writer', 'written by']):
                col_map['author'] = col_idx
            elif any(k in clean_name for k in ['publisher', 'publication', 'press']):
                col_map['publisher'] = col_idx
            elif any(k in clean_name for k in ['sem', 'semester', 'category', 'subject', 'dept']):
                col_map['category'] = col_idx
            elif any(k in clean_name for k in ['quantity', 'copies', 'total received', 'received']):
                col_map['quantity'] = col_idx
            elif any(k in clean_name for k in ['published_date', 'publish date', 'published date', 'year']):
                col_map['published_date'] = col_idx
            elif any(k in clean_name for k in ['description', 'summary', 'about', 'desc']):
                col_map['description'] = col_idx

        if 'title' not in col_map and 'isbn' not in col_map:
            return Response({"detail": "Could not identify 'Title' or 'ISBN' column in the CSV header."}, status=400)

        created_count = 0
        skipped_count = 0
        copies_created_total = 0
        errors = []

        # --- High-Performance Batch Pre-fetching ---
        # 1. Parse and validate all rows in memory first
        parsed_rows = []
        isbns_to_lookup = set()
        categories_to_find = set()
        publishers_to_find = set()

        for row_num, row in enumerate(data_rows, start=header_row_idx + 2):
            if not any(cell.strip() for cell in row):
                continue  # Skip completely blank lines

            def get_val(key):
                idx = col_map.get(key)
                if idx is not None and idx < len(row):
                    return row[idx].strip()
                return ""

            title = get_val('title')
            raw_isbn = get_val('isbn')
            author = get_val('author')
            publisher_name = get_val('publisher')
            category_name = get_val('category')
            qty_raw = get_val('quantity')
            pub_date_raw = get_val('published_date')
            row_description = get_val('description')

            if not title and not raw_isbn:
                continue

            if not title:
                errors.append({"row": row_num, "title": "Missing Title", "reason": "Book title cannot be empty."})
                continue

            clean_isbn = re.sub(r'[-\s]', '', raw_isbn)
            if ('e' in clean_isbn.lower() or '.' in clean_isbn) and re.match(r'^\d+(\.\d+)?[eE]\+?\d+$', clean_isbn):
                try:
                    clean_isbn = str(int(float(clean_isbn)))
                except (ValueError, OverflowError):
                    pass

            if not clean_isbn or len(clean_isbn) not in [10, 13]:
                errors.append({"row": row_num, "title": title, "reason": f"Invalid ISBN '{raw_isbn}' (must be 10 or 13 digits)."})
                continue

            # Normalized category label
            cat_label = None
            if category_name:
                cat_label = category_name
                if re.match(r'^(I|V|X|\d)+', category_name, re.IGNORECASE) and "sem" not in category_name.lower():
                    cat_label = f"Semester {category_name}"
                categories_to_find.add(cat_label)

            if publisher_name:
                publishers_to_find.add(publisher_name)

            published_date = None
            if pub_date_raw:
                match = re.match(r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})', pub_date_raw)
                if match:
                    try:
                        published_date = date(int(match.group(1)), int(match.group(2)), int(match.group(3)))
                    except ValueError:
                        pass
                if not published_date:
                    year_match = re.search(r'\b(19\d\d|20\d\d)\b', pub_date_raw)
                    if year_match:
                        published_date = date(int(year_match.group(1)), 1, 1)
            if not published_date:
                published_date = date(2020, 1, 1)

            qty = 0
            if qty_raw:
                try:
                    qty = int(float(qty_raw))
                except (ValueError, TypeError):
                    qty = 0

            isbns_to_lookup.add(clean_isbn)
            parsed_rows.append({
                "row_num": row_num,
                "title": title,
                "clean_isbn": clean_isbn,
                "raw_isbn": raw_isbn,
                "author": author or "Unknown",
                "cat_label": cat_label,
                "publisher_name": publisher_name,
                "published_date": published_date,
                "qty": qty,
                "description": row_description or "",
            })

        # 2. Preload ALL Categories and Publishers cleanly into memory (fast O(1) in-memory lookup)
        cat_cache = {c.name.strip().lower(): c for c in Category.objects.all()}
        pub_cache = {p.name.strip().lower(): p for p in Publisher.objects.all()}

        def get_or_create_category(name_str):
            if not name_str:
                return None
            key = name_str.strip().lower()
            if key in cat_cache:
                return cat_cache[key]
            cat, _ = Category.objects.get_or_create(name=name_str.strip())
            cat_cache[key] = cat
            return cat

        def get_or_create_publisher(name_str):
            if not name_str:
                return None
            key = name_str.strip().lower()
            if key in pub_cache:
                return pub_cache[key]
            pub, _ = Publisher.objects.get_or_create(name=name_str.strip())
            pub_cache[key] = pub
            return pub

        # 3. Batch fetch existing books and pre-count existing physical copies
        book_cache = {b.isbn: b for b in Book.objects.filter(isbn__in=isbns_to_lookup).select_related('category', 'publisher')}
        
        # Prefetch existing accession numbers for these ISBNs cleanly without raw Q lists
        existing_acc_set = set(
            BookCopy.objects.filter(book__isbn__in=isbns_to_lookup).values_list('accession_number', flat=True)
        ) if isbns_to_lookup else set()

        # Prefetch copy counts grouped by book_id
        from django.db.models import Count
        copy_counts = dict(
            BookCopy.objects.filter(book__isbn__in=isbns_to_lookup)
            .values('book_id')
            .annotate(cnt=Count('id'))
            .values_list('book_id', 'cnt')
        )

        created_count = 0
        skipped_count = 0
        copies_created_total = 0
        books_to_update = []
        all_copies_to_create = []

        try:
            with transaction.atomic():
                for item in parsed_rows:
                    row_num = item["row_num"]
                    clean_isbn = item["clean_isbn"]
                    title = item["title"]
                    author = item["author"]
                    raw_isbn = item["raw_isbn"]
                    cat = get_or_create_category(item["cat_label"]) if item["cat_label"] else None
                    pub = get_or_create_publisher(item["publisher_name"]) if item["publisher_name"] else None

                    book = book_cache.get(clean_isbn)
                    if book:
                        # Check for duplicate ISBN reused across distinct book titles
                        clean_existing_title = re.sub(r'[^a-zA-Z0-9]', '', book.title).lower()
                        clean_new_title = re.sub(r'[^a-zA-Z0-9]', '', title).lower()
                        if clean_existing_title and clean_new_title and clean_existing_title not in clean_new_title and clean_new_title not in clean_existing_title:
                            errors.append({
                                "row": row_num,
                                "title": title,
                                "reason": f"ISBN '{raw_isbn}' is already registered to '{book.title}' by {book.author}. Skipping to prevent merging distinct books."
                            })
                            continue

                        skipped_count += 1
                        needs_update = False
                        if not book.category and cat:
                            book.category = cat
                            needs_update = True
                        if not book.publisher and pub:
                            book.publisher = pub
                            needs_update = True
                        if needs_update:
                            books_to_update.append(book)
                    else:
                        book = Book(
                            isbn=clean_isbn,
                            title=title,
                            author=author,
                            category=cat,
                            publisher=pub,
                            published_date=item["published_date"],
                            added_by=request.user if request.user.is_authenticated else None,
                            description=item["description"],
                        )
                        book._skip_desc_fetch = True
                        book.save(skip_desc_fetch=True)
                        book_cache[clean_isbn] = book
                        created_count += 1

                    # Physical copies
                    qty = item["qty"]
                    if qty > 0:
                        current_copy_count = copy_counts.get(book.id, 0)
                        copies_needed = max(0, qty - current_copy_count)
                        if copies_needed > 0:
                            prefix = f"ACC-{clean_isbn[-6:]}-"
                            seq = 1
                            created_for_this_book = 0
                            while created_for_this_book < copies_needed and seq <= current_copy_count + copies_needed + 500:
                                acc_no = f"{prefix}{seq:03d}"
                                if acc_no not in existing_acc_set:
                                    all_copies_to_create.append(BookCopy(
                                        book=book,
                                        accession_number=acc_no,
                                        shelf_location="",
                                        status="available"
                                    ))
                                    existing_acc_set.add(acc_no)
                                    created_for_this_book += 1
                                seq += 1
                            copy_counts[book.id] = current_copy_count + created_for_this_book

                # Perform bulk operations
                if books_to_update:
                    # De-duplicate instances before bulk_update to prevent PostgreSQL conflicts
                    unique_books_to_update = list({b.id: b for b in books_to_update}.values())
                    Book.objects.bulk_update(unique_books_to_update, ['category', 'publisher'])

                if all_copies_to_create:
                    BookCopy.objects.bulk_create(all_copies_to_create, batch_size=500)
                    copies_created_total = len(all_copies_to_create)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                "detail": f"Database import error: {str(e)}",
                "success": False
            }, status=400)

        return Response({
            "success": True,
            "created_books": created_count,
            "existing_books": skipped_count,
            "created_copies": copies_created_total,
            "errors": errors,
            "total_rows": len(data_rows),
        })


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(books_count=Count("books")).order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsStaffOrReadOnly]


class LanguageViewSet(viewsets.ModelViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = [IsStaffOrReadOnly]


class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.annotate(books_count=Count("books")).order_by("name")
    serializer_class = PublisherSerializer
    permission_classes = [IsStaffOrReadOnly]


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related("book")

    def perform_create(self, serializer):
        if not self.request.user.is_active:
            raise ValidationError({"detail": "Your account is currently suspended."})
        serializer.save(user=self.request.user)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return []

    def get_queryset(self):
        queryset = Review.objects.all().select_related('user', 'book')
        book_id = self.request.query_params.get('book')
        if book_id:
            queryset = queryset.filter(book_id=book_id)
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        if not self.request.user.is_active:
            raise ValidationError({"detail": "Your account is currently suspended. You cannot submit reviews."})
        serializer.save(user=self.request.user)
        
    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own reviews.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own reviews.")
        instance.delete()

class GlobalSearchView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({"books": [], "users": []})

        # Search Books
        books = Book.objects.filter(
            Q(title__icontains=query) |
            Q(author__icontains=query) |
            Q(category__name__icontains=query)
        ).select_related('category', 'language')[:5]

        book_results = [
            {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "cover": f"https://covers.openlibrary.org/b/isbn/{book.isbn}-M.jpg" if getattr(book, 'isbn', None) else None,
                "category": book.category.name if book.category else None,
            }
            for book in books
        ]

        user_results = []
        # Search Users if admin/staff
        if request.user.role in ['admin', 'staff', 'superadmin', 'librarian']:
            users = CustomUser.objects.annotate(
                full_name=Concat('first_name', Value(' '), 'last_name')
            ).filter(
                Q(user_id__icontains=query) |
                Q(student_name__icontains=query) |
                Q(email__icontains=query) |
                Q(full_name__icontains=query)
            )[:5]

            user_results = [
                {
                    "id": user.id,
                    "user_id": user.user_id,
                    "name": user.student_name or f"{user.first_name} {user.last_name}".strip(),
                    "role": user.role,
                    "email": user.email,
                }
                for user in users
            ]

        return Response({
            "books": book_results,
            "users": user_results
        })