from rest_framework import serializers

from .models import Loan, Reservation


class LoanSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="copy.book.title", read_only=True)
    book_author = serializers.CharField(source="copy.book.author", read_only=True)
    book_id = serializers.IntegerField(source="copy.book.id", read_only=True)
    issued_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Loan
        fields = [
            "id",
            "book_id",
            "book_title",
            "book_author",
            "issued_at",
            "due_at",
            "returned_at",
            "renewed_count",
            "notes",
        ]


class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_author = serializers.CharField(source="book.author", read_only=True)
    book_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id",
            "book_id",
            "book_title",
            "book_author",
            "user",
            "reserved_at",
            "status",
        ]