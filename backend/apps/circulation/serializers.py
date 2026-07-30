from rest_framework import serializers
from .models import Loan, Reservation
from apps.catalog.models import Book
from django.utils import timezone
from datetime import timedelta

class LoanSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="copy.book.title", read_only=True)
    book_author = serializers.CharField(source="copy.book.author", read_only=True)
    book_id = serializers.IntegerField(source="copy.book.id", read_only=True)
    book_description = serializers.CharField(source="copy.book.description", read_only=True)
    book_isbn = serializers.CharField(source="copy.book.isbn", read_only=True)
    book_publisher = serializers.CharField(source="copy.book.publisher.name", read_only=True)
    book_category = serializers.CharField(source="copy.book.category.name", read_only=True)
    copy_accession_number = serializers.CharField(source="copy.accession_number", read_only=True)
    copy_condition = serializers.CharField(source="copy.condition", read_only=True)
    copy_shelf_location = serializers.CharField(source="copy.shelf_location", read_only=True)
    issued_at = serializers.DateTimeField(read_only=True)
    
    # 1. Add the custom field
    user_name = serializers.SerializerMethodField()

    # Calculated fields
    is_overdue = serializers.SerializerMethodField()
    overdue_days = serializers.SerializerMethodField()
    current_fine_estimate = serializers.SerializerMethodField()
    renewal_status = serializers.SerializerMethodField()

    class Meta:
        model = Loan
        fields = [
            "id",
            "book_id",
            "book_title",
            "book_author",
            "book_description",
            "book_isbn",
            "book_publisher",
            "book_category",
            "copy_accession_number",
            "copy_condition",
            "copy_shelf_location",
            "user_name",
            "issued_at",
            "due_at",
            "returned_at",
            "renewed_count",
            "notes",
            "is_overdue",
            "overdue_days",
            "current_fine_estimate",
            "renewal_status",
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
        # It's overdue if the current server time is past the due date (comparing just the dates)
        return timezone.now().date() > obj.due_at.date()
    
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

    def get_renewal_status(self, obj):
        if obj.returned_at:
            return {"can_renew": False, "reason": "Returned loans cannot be renewed."}
        if timezone.now().date() > obj.due_at.date():
            return {"can_renew": False, "reason": "Overdue loans cannot be renewed. Please return the book and clear your fines."}
        if obj.renewed_count >= 2:
            return {"can_renew": False, "reason": "Maximum renewal limit (2 times) reached for this book."}
        
        from apps.billing.models import Fine
        has_unpaid_fines = Fine.objects.filter(loan__borrower=obj.borrower, status=Fine.PENDING).exists()
        if has_unpaid_fines:
            return {"can_renew": False, "reason": "Cannot renew. You have unpaid fines on your account."}
            
        from apps.circulation.models import Reservation
        has_reservations = Reservation.objects.filter(book=obj.copy.book, status=Reservation.PENDING).exists()
        if has_reservations:
            return {"can_renew": False, "reason": "Cannot renew. Another student is waiting for this book."}
            
        return {"can_renew": True, "reason": ""}

class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    book = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), write_only=True
    )
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_author = serializers.CharField(source="book.author", read_only=True)
    book_id = serializers.IntegerField(source="book.id", read_only=True)
    book_description = serializers.CharField(source="book.description", read_only=True)
    book_isbn = serializers.CharField(source="book.isbn", read_only=True)
    book_publisher = serializers.CharField(source="book.publisher.name", read_only=True)
    book_category = serializers.CharField(source="book.category.name", read_only=True)
    
    # 1. Add the custom field
    user_name = serializers.SerializerMethodField()
    allocated_copy_barcode = serializers.CharField(source="allocated_copy.barcode", read_only=True)
    
    queue_position = serializers.SerializerMethodField()
    estimated_wait_days = serializers.SerializerMethodField()
    total_copies = serializers.SerializerMethodField()
    
    expires_at = serializers.SerializerMethodField()
    pickup_location = serializers.SerializerMethodField()
    
    loan_id = serializers.SerializerMethodField()
    fulfilled_at = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id",
            "book",
            "book_id",
            "book_title",
            "book_author",
            "book_description",
            "book_isbn",
            "book_publisher",
            "book_category",
            "user",
            "user_name", # 2. Include the new field here
            "reserved_at",
            "status",
            "allocated_copy",
            "allocated_copy_barcode",
            "queue_position",
            "estimated_wait_days",
            "total_copies",
            "is_extended",
            "expires_at",
            "pickup_location",
            "loan_id",
            "fulfilled_at",
            "cancellation_reason",
            "cancelled_at",
        ]

    # 3. Define how to fetch the name
    def get_user_name(self, obj):
        user = obj.user
        name = user.student_name or user.get_full_name()
        return name.strip() if name.strip() else user.user_id

    def get_queue_position(self, obj):
        if obj.status != Reservation.PENDING:
            return None
        return Reservation.objects.filter(
            book=obj.book,
            status=Reservation.PENDING,
            reserved_at__lt=obj.reserved_at
        ).count() + 1
        
    def get_total_copies(self, obj):
        from apps.inventory.models import BookCopy
        return BookCopy.objects.filter(book=obj.book).exclude(status=BookCopy.LOST).count()
        
    def get_estimated_wait_days(self, obj):
        if obj.status != Reservation.PENDING:
            return None
        
        queue_pos = self.get_queue_position(obj)
        copies = max(self.get_total_copies(obj), 1)
        return int(queue_pos * (14 / copies))

    def get_expires_at(self, obj):
        if not obj.ready_at:
            return None
        base_days = 2
        if obj.is_extended:
            base_days += 1
        return obj.ready_at + timedelta(days=base_days)

    def get_pickup_location(self, obj):
        if obj.allocated_copy and obj.allocated_copy.shelf_location:
            return f"Main Library, {obj.allocated_copy.shelf_location}"
        return "Main Library, Holds Desk"

    def get_loan_id(self, obj):
        if obj.status == Reservation.FULFILLED and obj.allocated_copy:
            loan = Loan.objects.filter(copy=obj.allocated_copy, borrower=obj.user).order_by('-issued_at').first()
            if loan:
                return loan.id
        return None

    def get_fulfilled_at(self, obj):
        if obj.status == Reservation.FULFILLED and obj.allocated_copy:
            loan = Loan.objects.filter(copy=obj.allocated_copy, borrower=obj.user).order_by('-issued_at').first()
            if loan:
                return loan.issued_at
        return None

