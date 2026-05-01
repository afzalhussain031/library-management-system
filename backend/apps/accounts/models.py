from django.contrib.auth.models import User
from django.db import models


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
    student_name = models.CharField(max_length=255, blank=True)
    enrollment_number = models.CharField(max_length=50, blank=True, unique=True)
    father_name = models.CharField(max_length=255, blank=True)
    mother_name = models.CharField(max_length=255, blank=True)
    batch = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)

    class Meta:
        db_table = "library_userprofile"

    def __str__(self):
        return self.user.username


class Membership(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="membership")
    membership_id = models.CharField(max_length=50, unique=True)
    valid_till = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "library_membership"

    def __str__(self):
        return f"Membership for {self.user.username}"