from rest_framework import serializers
from .models import Loan, Reservation

class LoanSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="copy.book.title", read_only=True)
    book_author = serializers.CharField(source="copy.book.author", read_only=True)
    book_id = serializers.IntegerField(source="copy.book.id", read_only=True)
    issued_at = serializers.DateTimeField(read_only=True)
    
    # 1. Add the custom field
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Loan
        fields = [
            "id",
            "book_id",
            "book_title",
            "book_author",
            "user_name", # 2. Include the new field here
            "issued_at",
            "due_at",
            "returned_at",
            "renewed_count",
            "notes",
        ]
        
    # 3. Define how to fetch the name
    def get_user_name(self, obj):
        user = obj.borrower
        name = user.student_name or user.get_full_name()
        return name.strip() if name.strip() else user.user_id


class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_author = serializers.CharField(source="book.author", read_only=True)
    book_id = serializers.IntegerField(write_only=True)
    
    # 1. Add the custom field
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id",
            "book_id",
            "book_title",
            "book_author",
            "user",
            "user_name", # 2. Include the new field here
            "reserved_at",
            "status",
        ]

    # 3. Define how to fetch the name
    def get_user_name(self, obj):
        user = obj.user
        name = user.student_name or user.get_full_name()
        return name.strip() if name.strip() else user.user_id
