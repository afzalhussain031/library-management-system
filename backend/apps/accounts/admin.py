from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import CustomUser, Membership


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {"fields": ("user_id", "role", "email", "password")}),
        ("Personal", {"fields": ("first_name", "last_name", "phone_number")}),
        ("Academic", {"fields": ("department", "batch", "student_name")}),
        ("Family", {"fields": ("father_name", "mother_name")}),
        ("Other", {"fields": ("bio", "address")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        # Only editable fields in fieldsets, readonly fields go in readonly_fields
        ("Important dates", {"fields": ("last_login", "date_joined", "updated_at")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("user_id", "role", "email", "password1", "password2"),
            },
        ),
    )

    # Mark auto-generated fields as read-only
    readonly_fields = ("last_login", "date_joined", "created_at", "updated_at")

    list_display = ("user_id", "role", "email", "is_staff", "date_joined")
    list_filter = ("role", "is_staff", "is_superuser", "date_joined")
    search_fields = ("user_id", "email", "first_name")
    ordering = ("-date_joined",)
    filter_horizontal = ("groups", "user_permissions")


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("membership_id", "user", "valid_till")
    list_filter = ("valid_till", "created_at")
    search_fields = ("user__user_id", "membership_id")
    readonly_fields = ("created_at", "updated_at")
