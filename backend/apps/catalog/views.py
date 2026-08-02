from rest_framework import viewsets, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Value
from django.db.models.functions import Concat

from common.permissions.base import IsStaffOrReadOnly

from .models import Book, Category, Publisher, Wishlist, Language, Review
from .serializers import BookSerializer, CategorySerializer, PublisherSerializer, WishlistSerializer, LanguageSerializer, ReviewSerializer
from apps.accounts.models import CustomUser


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


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsStaffOrReadOnly]


class LanguageViewSet(viewsets.ModelViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = [IsStaffOrReadOnly]


class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer
    permission_classes = [IsStaffOrReadOnly]


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related("book")

    def perform_create(self, serializer):
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