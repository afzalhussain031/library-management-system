from rest_framework import serializers

from .models import Book, Category, Publisher


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