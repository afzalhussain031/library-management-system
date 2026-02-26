from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from .models import Book, UserProfile
from .serializers import BookSerializer, UserProfileSerializer, RegisterSerializer
from .permissions import IsStaffOrReadOnly

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the profile for the currently authenticated user."""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # return the profile for the currently authenticated user or 404
        return get_object_or_404(UserProfile, user=self.request.user)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
        }
        return Response(data)

class BookViewSet(viewsets.ModelViewSet):
    """Book API using DRF's ModelViewSet defaults. Routes should be registered via a router."""
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsStaffOrReadOnly]

    def perform_create(self, serializer):
        """Set the book owner to the authenticated user (server-side enforcement)."""
        serializer.save(user=self.request.user)

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]