"""Reusable helpers shared across backend apps."""

from functools import wraps

from rest_framework import status
from rest_framework.response import Response


def owned_by_user(view_func):
    """Guard a detail view so only the owning user can access it."""

    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.user != request.user:
            return Response(
                {"error": "You don't have permission to access this object"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return view_func(self, request, *args, **kwargs)

    return wrapper


def get_user_initials(user):
    """Build a short display label from a user object."""

    if user.first_name and user.last_name:
        return f"{user.first_name[0]}{user.last_name[0]}".upper()
    if user.first_name:
        return user.first_name[0].upper()
    return user.username[0].upper() if user.username else "U"


def validate_isbn(isbn: str) -> bool:
    """Basic ISBN format validation."""

    isbn = isbn.replace("-", "").replace(" ", "")

    if len(isbn) == 10 and isbn.isdigit():
        return True

    if len(isbn) == 13 and isbn.isdigit():
        if isbn.startswith("978") or isbn.startswith("979"):
            return True

    return False