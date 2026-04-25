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

    class Meta:
        db_table = "library_userprofile"

    def __str__(self):
        return self.user.username