from rest_framework import serializers

from .models import Fine


class FineSerializer(serializers.ModelSerializer):
    loan_book_title = serializers.CharField(source="loan.copy.book.title", read_only=True)
    loan_book_author = serializers.CharField(source="loan.copy.book.author", read_only=True)
    borrower_name = serializers.CharField(source="loan.borrower.get_full_name", read_only=True)
    borrower_email = serializers.CharField(source="loan.borrower.email", read_only=True)
    borrower_id = serializers.CharField(source="loan.borrower.id", read_only=True)
    loan_due_at = serializers.DateTimeField(source="loan.due_at", read_only=True)
    loan_returned_at = serializers.DateTimeField(source="loan.returned_at", read_only=True)
    loan_issued_at = serializers.DateTimeField(source="loan.issued_at", read_only=True)
    loan_copy_barcode = serializers.CharField(source="loan.copy.barcode", read_only=True)
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
            "borrower_id",
            "loan_issued_at",
            "loan_due_at",
            "loan_returned_at",
            "loan_copy_barcode",
            "amount",
            "reason",
            "status",
            "waive_reason",
            "payment_method",
            "created_at",
            "is_paid",
        ]

    def get_is_paid(self, obj):
        return obj.status == "paid"