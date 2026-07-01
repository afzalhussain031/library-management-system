from rest_framework import serializers

from .models import Fine


class FineSerializer(serializers.ModelSerializer):
    loan_book_title = serializers.CharField(source="loan.copy.book.title", read_only=True)
    loan_book_author = serializers.CharField(source="loan.copy.book.author", read_only=True)
    borrower_name = serializers.CharField(source="loan.borrower.get_full_name", read_only=True)
    borrower_email = serializers.CharField(source="loan.borrower.email", read_only=True)
    is_paid = serializers.SerializerMethodField()

    class Meta:
        model = Fine
        fields = [
            "id",
            "loan",
            "loan_book_title",
            "loan_book_author",
            "borrower_name",
            "borrower_email",
            "amount",
            "reason",
            "status",
            "created_at",
            "is_paid",
        ]

    def get_is_paid(self, obj):
        return obj.status == "paid"