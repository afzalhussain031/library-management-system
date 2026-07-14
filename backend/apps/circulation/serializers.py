from rest_framework import serializers
from .models import Loan, Reservation
from django.utils import timezone

class LoanSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="copy.book.title", read_only=True)
    book_author = serializers.CharField(source="copy.book.author", read_only=True)
    book_id = serializers.IntegerField(source="copy.book.id", read_only=True)
    issued_at = serializers.DateTimeField(read_only=True)
    
    # 1. Add the custom field
    user_name = serializers.SerializerMethodField()

    # Calculated fields
    is_overdue = serializers.SerializerMethodField()
    overdue_days = serializers.SerializerMethodField()
    current_fine_estimate = serializers.SerializerMethodField()

    class Meta:
        model = Loan
        fields = [
            "id",
            "book_id",
            "book_title",
            "book_author",
            "user_name",
            "issued_at",
            "due_at",
            "returned_at",
            "renewed_count",
            "notes",
            "is_overdue",
            "overdue_days",
            "current_fine_estimate",
            "copy",
            "borrower",
        ]
        
    # 3. Define how to fetch the name
    def get_user_name(self, obj):
        user = obj.borrower
        name = user.student_name or user.get_full_name()
        return name.strip() if name.strip() else user.user_id

    # NEW: Implementation of our calculated fields
    def get_is_overdue(self, obj):
        # A book is not overdue if it has been returned
        if obj.returned_at:
            return False
        # It's overdue if the current server time is past the due date
        return timezone.now() > obj.due_at
    
    def get_overdue_days(self, obj):
        if not self.get_is_overdue(obj):
            return 0

        # We extract just the `.date()` to ignore hours/minutes (the "Midnight Problem")
        today = timezone.now().date()
        due_date = obj.due_at.date()
        
        # Calculate the difference in days
        diff_days = (today - due_date).days
        
        # Ensure it shows at least 1 day if it's past due
        return max(diff_days, 1)

    def get_current_fine_estimate(self, obj):
        DAILY_FINE_RATE = 10 # You can later move this to django settings if you want!
        return self.get_overdue_days(obj) * DAILY_FINE_RATE

class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_author = serializers.CharField(source="book.author", read_only=True)
    book_id = serializers.IntegerField(source="book.id", read_only=True)
    
    # 1. Add the custom field
    user_name = serializers.SerializerMethodField()
    allocated_copy_barcode = serializers.CharField(source="allocated_copy.barcode", read_only=True)

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
            "allocated_copy",
            "allocated_copy_barcode",
        ]

    # 3. Define how to fetch the name
    def get_user_name(self, obj):
        user = obj.user
        name = user.student_name or user.get_full_name()
        return name.strip() if name.strip() else user.user_id
