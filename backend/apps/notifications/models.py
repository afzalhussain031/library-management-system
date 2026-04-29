from django.contrib.auth.models import User
from django.db import models


class Notification(models.Model):
    TYPES = [
        ("book_issued", "Book Issued"),
        ("book_returned", "Book Returned"),
        ("book_overdue", "Book Overdue"),
        ("fine_created", "Fine Created"),
        ("fine_paid", "Fine Paid"),
        ("reservation_ready", "Reservation Ready"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=20, choices=TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "library_notification"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"
