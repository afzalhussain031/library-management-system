from rest_framework import serializers
from .models import Book, Category, Publisher, Wishlist
from apps.inventory.models import BookCopy 
from apps.circulation.models import Loan, Reservation
from django.utils import timezone



class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = "__all__"


class BookSerializer(serializers.ModelSerializer):
    # Return full category and publisher objects instead of just IDs
    category = CategorySerializer(read_only=True)
    publisher = PublisherSerializer(read_only=True)
    added_by = serializers.PrimaryKeyRelatedField(read_only=True)
    published_date = serializers.DateField(required=False)

    # 2. Add two new custom fields
    total_copies = serializers.SerializerMethodField()
    available_copies = serializers.SerializerMethodField()

    lent_copies = serializers.SerializerMethodField()
    overdue_copies = serializers.SerializerMethodField()
    requests_count = serializers.SerializerMethodField()
    returned_copies = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = "__all__"

    # 3. Define how to calculate the fields
    def get_total_copies(self, obj):
        return obj.copies.count()
        
    def get_available_copies(self, obj):
        return obj.copies.filter(status=BookCopy.AVAILABLE).count()

    def get_lent_copies(self, obj):
        # Counts loans for this book where it hasn't been returned yet
        return Loan.objects.filter(copy__book=obj, returned_at__isnull=True).count()

    def get_overdue_copies(self, obj):
        # Counts loans for this book that are not returned AND past their due date
        return Loan.objects.filter(
            copy__book=obj, 
            returned_at__isnull=True, 
            due_at__lt=timezone.now()
        ).count()

    def get_requests_count(self, obj):
        # Counts pending reservations for this book
        return Reservation.objects.filter(book=obj, status=Reservation.PENDING).count()

    def get_returned_copies(self, obj):
        # Counts loans for this book that HAVE been returned
        return Loan.objects.filter(copy__book=obj, returned_at__isnull=False).count()

class WishlistSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ["id", "book", "book_id", "added_at"]
        read_only_fields = ["id", "added_at"]

    def create(self, validated_data):
        book_id = validated_data.pop("book_id")
        user = self.context["request"].user
        return Wishlist.objects.create(user=user, book_id=book_id, **validated_data)