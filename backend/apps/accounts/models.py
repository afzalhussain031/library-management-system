from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class CustomUserManager(BaseUserManager):
    """
    Custom user manager that uses user_id instead of username.
    """

    def create_user(
        self, user_id, email, password=None, role="student", **extra_fields
    ):
        """
        Create and save a regular user with user_id and password.
        """
        if not user_id:
            raise ValueError("The user_id field is required")
        if not email:
            raise ValueError("The email field is required")

        email = self.normalize_email(email)
        user = self.model(user_id=user_id, email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, user_id, email, password=None, **extra_fields):
        """
        Create and save a superuser with user_id and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "superadmin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(
            user_id=user_id, email=email, password=password, **extra_fields
        )


class CustomUser(AbstractUser):
    """
    Custom user model that uses user_id (Enrollment/Employee ID)
    instead of username for authentication.

    Fields:
    - user_id: Enrollment Number (students) or Employee ID (staff) - unique identifier
    - role: Determines what user_id represents (student, staff, librarian, superadmin)
    - email: User's email address (unique)
    - password: Hashed password
    - first_name, last_name: User's name
    - is_staff, is_superuser: Django permission flags
    - phone_number, department: Contact/work info
    - student_name, father_name, mother_name, batch: Student info
    - address, bio: Additional info
    """

    ROLE_CHOICES = [
        ("student", "Student"),
        ("staff", "Staff"),
        ("librarian", "Librarian"),
        ("superadmin", "Super Admin"),
    ]

    # Remove username field (AbstractUser has it by default)
    username = None

    # Single identifier: either Enrollment Number or Employee ID
    user_id = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text="Enrollment Number (students) or Employee ID (staff)",
    )

    # Determines what user_id represents
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")

    # Profile fields (merged from UserProfile, no duplication)
    bio = models.TextField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=120, blank=True)

    # Student-specific fields
    student_name = models.CharField(max_length=255, blank=True)
    father_name = models.CharField(max_length=255, blank=True)
    mother_name = models.CharField(max_length=255, blank=True)
    batch = models.CharField(max_length=50, blank=True)

    # Address info
    address = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Set user_id as the USERNAME_FIELD
    USERNAME_FIELD = "user_id"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["email", "role"]  # Required for createsuperuser

    # Use custom user manager
    objects = CustomUserManager()

    class Meta:
        db_table = "library_customuser"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user_id", "role"]),
            models.Index(fields=["email"]),
        ]

    def __str__(self):
        return f"{self.user_id} ({self.get_role_display()})"

    @property
    def is_student(self):
        return self.role == "student"

    @property
    def is_librarian_staff(self):
        return self.role in ["staff", "librarian"]


class Membership(models.Model):
    """One-to-one relationship with CustomUser for membership details"""

    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="membership"
    )
    membership_id = models.CharField(max_length=50, unique=True)
    valid_till = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "library_membership"

    def __str__(self):
        return f"Membership {self.membership_id} ({self.user.user_id})"
