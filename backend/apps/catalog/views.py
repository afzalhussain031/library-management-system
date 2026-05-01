from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from common.permissions.base import IsStaffOrReadOnly

from .models import Book, Category, Publisher, Wishlist
from .serializers import BookSerializer, CategorySerializer, PublisherSerializer, WishlistSerializer


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsStaffOrReadOnly]

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