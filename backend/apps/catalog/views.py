from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q

from common.permissions.base import IsStaffOrReadOnly

from .models import Book, Category, Publisher, Wishlist
from .serializers import BookSerializer, CategorySerializer, PublisherSerializer, WishlistSerializer


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [IsStaffOrReadOnly]

    def _get_recommended_queryset_and_meta(self, user):
        """
        Calculates book recommendations based on user status:
        - If user has wishlist items (Regular User): recommends books matching categories/authors of wishlisted books + wishlisted books, sorted by popularity.
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

            matching_qs = Book.objects.filter(
                Q(category_id__in=categories) | Q(author__in=authors) | Q(id__in=wishlist_book_ids)
            ).annotate(loan_count=Count('copies__loans')).order_by('-loan_count', '-id').distinct()

            # If matching count is small, fallback to top loaned books
            if matching_qs.count() < 4:
                queryset = Book.objects.annotate(loan_count=Count('copies__loans')).order_by('-loan_count', '-id')
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
                
        # Sorting
        sort_param = self.request.query_params.get('sort')
        if sort_param:
            if sort_param.lower() == 'newest':
                queryset = queryset.order_by('-published_date')
            elif sort_param.lower() == 'author':
                queryset = queryset.order_by('author')
            elif sort_param.lower() == 'popularity':
                queryset = queryset.annotate(loan_count=Count('copies__loans')).order_by('-loan_count')
                
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def recommendations(self, request):
        queryset, meta = self._get_recommended_queryset_and_meta(request.user)
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