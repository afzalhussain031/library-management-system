from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Publisher(models.Model):
    name = models.CharField(max_length=150, unique=True)
    address = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    published_date = models.DateField()
    isbn = models.CharField(max_length=13, unique=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='books',
    )
    publisher = models.ForeignKey(
        Publisher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='books',
    )
    added_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='added_books',
    )

    def __str__(self):
        return self.title


class BookCopy(models.Model):
    AVAILABLE = "available"
    LOANED = "loaned"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"

    STATUS_CHOICES = [
        (AVAILABLE, "Available"),
        (LOANED, "Loaned"),
        (RESERVED, "Reserved"),
        (MAINTENANCE, "Maintenance"),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='copies')
    accession_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=AVAILABLE)
    shelf_location = models.CharField(max_length=100, blank=True)
    acquired_at = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.book.title} ({self.accession_number})"


class Loan(models.Model):
    copy = models.ForeignKey(BookCopy, on_delete=models.CASCADE, related_name='loans')
    borrower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loans')
    issued_at = models.DateTimeField(auto_now_add=True)
    due_at = models.DateTimeField()
    returned_at = models.DateTimeField(null=True, blank=True)
    renewed_count = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.copy} -> {self.borrower.username}"


class Reservation(models.Model):
    PENDING = "pending"
    READY = "ready"
    CANCELLED = "cancelled"
    FULFILLED = "fulfilled"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (READY, "Ready"),
        (CANCELLED, "Cancelled"),
        (FULFILLED, "Fulfilled"),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reservations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    reserved_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    def __str__(self):
        return f"{self.book.title} reserved by {self.user.username}"


class Fine(models.Model):
    PENDING = "pending"
    PAID = "paid"
    WAIVED = "waived"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (PAID, "Paid"),
        (WAIVED, "Waived"),
    ]

    loan = models.OneToOneField(Loan, on_delete=models.CASCADE, related_name='fine')
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    reason = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Fine for {self.loan}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    role = models.CharField(
        max_length=20,
        choices=[
            ("student", "Student"),
            ("staff", "Staff"),
            ("librarian", "Librarian"),
        ],
        default="student",
    )
    phone_number = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=120, blank=True)
    student_id = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.user.username