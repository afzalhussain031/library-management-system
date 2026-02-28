"""
Utility Functions for Library App
Contains reusable helper functions and decorators
"""

from functools import wraps
from rest_framework.response import Response
from rest_framework import status


def owned_by_user(view_func):
    """
    Decorator to check if the requested object is owned by the current user
    Useful for profile and user-specific operations
    """
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.user != request.user:
            return Response(
                {"error": "You don't have permission to access this object"},
                status=status.HTTP_403_FORBIDDEN
            )
        return view_func(self, request, *args, **kwargs)
    return wrapper


def get_user_initials(user):
    """
    Generate initials from user's first and last name
    Falls back to username if no name is available
    """
    if user.first_name and user.last_name:
        return f"{user.first_name[0]}{user.last_name[0]}".upper()
    elif user.first_name:
        return user.first_name[0].upper()
    return user.username[0].upper() if user.username else "U"


def validate_isbn(isbn: str) -> bool:
    """
    Basic ISBN validation (validates format, not checksum)
    Accepts ISBN-10 and ISBN-13 formats
    """
    # Remove hyphens and spaces
    isbn = isbn.replace("-", "").replace(" ", "")
    
    # ISBN-10: 10 digits
    if len(isbn) == 10 and isbn.isdigit():
        return True
    
    # ISBN-13: 13 digits starting with 978 or 979
    if len(isbn) == 13 and isbn.isdigit():
        if isbn.startswith("978") or isbn.startswith("979"):
            return True
    
    return False
