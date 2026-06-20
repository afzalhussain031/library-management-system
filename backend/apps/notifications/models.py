from django.conf import settings
from django.db import models


class Notification(models.Model):
    """User notifications for library events"""

    TYPES = [
        ("book_issued", "Book Issued"),
        ("book_returned", "Book Returned"),
        ("book_overdue", "Book Overdue"),
        ("fine_created", "Fine Created"),
        ("fine_paid", "Fine Paid"),
        ("reservation_ready", "Reservation Ready"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=20, choices=TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "library_notification"
        ordering = ["-created_at"]

    def __str__(self):
        # Use user_id instead of username
        return f"{self.title} - {self.user.user_id}"
