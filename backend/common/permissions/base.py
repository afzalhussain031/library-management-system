from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsStaffOrReadOnly(BasePermission):
    """Allow safe methods for everyone and write methods for staff users."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
            
        user = request.user
        if not user or not user.is_authenticated:
            return False
            
        return bool(user.is_staff or getattr(user, 'role', '') in ['staff', 'librarian', 'superadmin'])