from rest_framework import serializers

from .models import Book, Category, Publisher, Wishlist


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

    class Meta:
        model = Book
        fields = "__all__"


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