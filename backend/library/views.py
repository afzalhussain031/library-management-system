from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import Book, UserProfile
from .serializers import BookSerializer, UserProfileSerializer, RegisterSerializer
from .permissions import IsStaffOrReadOnly
from .serializers import StaffCreateSerializer

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
    authentication_classes = []
    permission_classes = [AllowAny]


class StaffCreateView(generics.CreateAPIView):
    """Endpoint to create staff/admin user accounts.

    This endpoint is protected: only authenticated staff users may create
    new staff accounts. The server enforces the `is_staff` flag and ignores
    any role information sent from the client.
    """
    serializer_class = StaffCreateSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnly]

def set_refresh_cookie(response, refresh_token: str):
    response.set_cookie(
        key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
        value=refresh_token,
        max_age=settings.SIMPLE_JWT['AUTH_COOKIE_MAX_AGE'],
        httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
        path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
    )

def clear_refresh_cookie(response):
    response.delete_cookie(
        key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
        path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
    )

class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # default serializer returns access + refresh in response body
        refresh = response.data.pop('refresh', None)
        if refresh:
            set_refresh_cookie(response, refresh)

        return response

class CookieTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        if not refresh:
            return Response({'detail': 'Refresh cookie not found.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={'refresh': refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        data = serializer.validated_data
        response = Response(data, status=status.HTTP_200_OK)

        # If rotation is ever enabled, refresh might be returned again
        new_refresh = data.get('refresh')
        if new_refresh:
            set_refresh_cookie(response, new_refresh)
            response.data.pop('refresh', None)

        return response

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_refresh_cookie(response)
        return response