from django.contrib.auth.models import User
from django.db import models

from apps.catalog.models import Book
from apps.inventory.models import BookCopy


class Loan(models.Model):
    copy = models.ForeignKey(BookCopy, on_delete=models.CASCADE, related_name="loans")
    borrower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="loans")
    issued_at = models.DateTimeField(auto_now_add=True)
    due_at = models.DateTimeField()
    returned_at = models.DateTimeField(null=True, blank=True)
    renewed_count = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "library_loan"

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

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="reservations")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reservations")
    reserved_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    class Meta:
        db_table = "library_reservation"

    def __str__(self):
        return f"{self.book.title} reserved by {self.user.username}"