from django.db import models

from apps.circulation.models import Loan


class Fine(models.Model):
    PENDING = "pending"
    PAID = "paid"
    WAIVED = "waived"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (PAID, "Paid"),
        (WAIVED, "Waived"),
    ]

    PAYMENT_METHODS = [
        ("cash", "Cash"),
        ("upi", "UPI"),
        ("bank_transfer", "Bank Transfer"),
        ("credit_card", "Credit Card"),
    ]

    loan = models.OneToOneField(Loan, on_delete=models.CASCADE, related_name="fine")
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    reason = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    waive_reason = models.TextField(blank=True, null=True)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "library_fine"

    def __str__(self):
        return f"Fine for {self.loan}"