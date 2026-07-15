from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from common.permissions.base import IsStaffOrReadOnly

from .models import Book, Category, Publisher, Wishlist
from .serializers import BookSerializer, CategorySerializer, PublisherSerializer, WishlistSerializer


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = Book.objects.all()
        
        # Filtering
        filter_param = self.request.query_params.get('filter')
        if filter_param:
            if filter_param.lower() == 'available':
                queryset = queryset.filter(copies__status='available').distinct()
            # Note: 'recommended' can be handled here if a specific recommendation logic exists.
                
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