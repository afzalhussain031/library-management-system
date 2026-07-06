from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsStaffOrReadOnly(BasePermission):
    """Allow safe methods for everyone and write methods for staff users."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsEmailVerified(BasePermission):
    """Allow access only to users whose email is verified.

    Staff and superusers bypass this check.
    """

    message = "Your email address must be verified to access this resource."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or user.is_superuser:
            return True
        return bool(getattr(user, "is_email_verified", False))