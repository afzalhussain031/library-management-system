from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count

from common.permissions.base import IsStaffOrReadOnly

from .models import Book, Category, Publisher, Wishlist
from .serializers import BookSerializer, CategorySerializer, PublisherSerializer, WishlistSerializer


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "author", "category__name"]

    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.query_params.get("search")
        if search_query and self.request.user and self.request.user.is_authenticated:
            search_query = search_query.strip()
            if search_query:
                from .models import SearchHistory
                last_search = SearchHistory.objects.filter(user=self.request.user).first()
                if not last_search or last_search.query != search_query:
                    SearchHistory.objects.create(user=self.request.user, query=search_query)
        return queryset

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
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


class PersonalizedRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        from apps.circulation.models import Loan
        
        # 1. Get the list of book IDs the user has already borrowed
        already_borrowed_ids = list(
            Loan.objects.filter(borrower=user)
            .values_list("copy__book_id", flat=True)
            .distinct()
        )
        
        # 2. Get wishlisted book IDs and categories
        wishlist_book_ids = list(
            Wishlist.objects.filter(user=user)
            .values_list("book_id", flat=True)
        )
        wishlist_categories = list(
            Wishlist.objects.filter(user=user)
            .values_list("book__category_id", flat=True)
            .distinct()
        )
        
        # 3. Get search history queries (top 5 unique, most recent first)
        from .models import SearchHistory
        raw_search_queries = (
            SearchHistory.objects.filter(user=user)
            .order_by("-searched_at")
            .values_list("query", flat=True)
        )
        search_queries = []
        for q in raw_search_queries:
            q_clean = q.strip()
            if q_clean and q_clean not in search_queries:
                search_queries.append(q_clean)
                if len(search_queries) == 5:
                    break
        
        # 4. Get the categories of books the user has borrowed, with count mapping
        favorite_categories = (
            Loan.objects.filter(borrower=user)
            .values("copy__book__category_id")
            .exclude(copy__book__category_id__isnull=True)
            .annotate(count=Count("copy__book__category_id"))
        )
        borrow_count_map = {
            item["copy__book__category_id"]: item["count"]
            for item in favorite_categories
        }
        
        # 5. Score all books in the library
        all_books = Book.objects.all().select_related("category", "publisher")
        score_map = {}
        for b in all_books:
            score = 0
            
            # - Wishlist Exact Match: Highest priority
            if b.id in wishlist_book_ids:
                score += 1000
                
            # - Search History Match: High priority, weighted by recency
            if search_queries:
                title_lower = b.title.lower() if b.title else ""
                author_lower = b.author.lower() if b.author else ""
                category_lower = b.category.name.lower() if (b.category and b.category.name) else ""
                for idx, q in enumerate(search_queries):
                    q_lower = q.lower()
                    if q_lower in title_lower or q_lower in author_lower or q_lower in category_lower:
                        score += int(500 / (2 ** idx))
                        break  # score once per book based on the most relevant (recent) match
                        
            # - Wishlist Category Match: Medium-high priority
            if b.category_id in wishlist_categories:
                score += 200
                
            # - Borrowing Category Match: Scaled by borrowing frequency
            if b.category_id in borrow_count_map:
                score += borrow_count_map[b.category_id] * 50
                
            score_map[b.id] = score
            
        # 6. Separate unborrowed and borrowed books
        unborrowed_candidates = [b for b in all_books if b.id not in already_borrowed_ids]
        borrowed_candidates = [b for b in all_books if b.id in already_borrowed_ids]
        
        # Sort each group: first by score (descending), then by id (ascending) to keep it stable
        unborrowed_candidates.sort(key=lambda b: (-score_map[b.id], b.id))
        borrowed_candidates.sort(key=lambda b: (-score_map[b.id], b.id))
        
        books_list = unborrowed_candidates[:6]
        
        # If not enough unborrowed books, fallback to borrowed books (sorted by score)
        if len(books_list) < 6:
            remaining = 6 - len(books_list)
            books_list.extend(borrowed_candidates[:remaining])
            
        final_books = books_list[:6]
        
        # Serialize the list of books
        serializer = BookSerializer(final_books, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)