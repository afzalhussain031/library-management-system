from rest_framework import serializers

from .models import Book, Category, Publisher


class BookSerializer(serializers.ModelSerializer):
    added_by = serializers.PrimaryKeyRelatedField(read_only=True)
    published_date = serializers.DateField(required=False)

    class Meta:
        model = Book
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = "__all__"