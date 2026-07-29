from django.db import models

from apps.catalog.models import Book


class BookCopy(models.Model):
    AVAILABLE = "available"
    LOANED = "loaned"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"
    DAMAGED = "damaged"
    LOST = "lost"

    STATUS_CHOICES = [
        (AVAILABLE, "Available"),
        (LOANED, "Loaned"),
        (RESERVED, "Reserved"),
        (MAINTENANCE, "Maintenance"),
        (DAMAGED, "Damaged"),
        (LOST, "Lost"),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="copies")
    accession_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=AVAILABLE)
    condition = models.CharField(max_length=100, blank=True, default="Good")
    shelf_location = models.CharField(max_length=100, blank=True)
    acquired_at = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "library_bookcopy"

    def __str__(self):
        return f"{self.book.title} ({self.accession_number})"