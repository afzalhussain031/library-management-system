from datetime import timedelta

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Book, BookCopy, Category, Fine, Loan, Publisher, Reservation, UserProfile
from .permissions import IsStaffOrReadOnly
from .serializers import (
    BookCopySerializer,
    BookSerializer,
    CategorySerializer,
    FineSerializer,
    LoanSerializer,
    PublisherSerializer,
    RegisterSerializer,
    ReservationSerializer,
    StaffCreateSerializer,
    UserProfileSerializer,
)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the profile for the currently authenticated user."""

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
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
            "date_joined": user.date_joined,
        }
        return Response(data)


class BookViewSet(viewsets.ModelViewSet):
    """Book API using DRF's ModelViewSet defaults. Routes should be registered via a router."""

    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsStaffOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsStaffOrReadOnly]


class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer
    permission_classes = [IsStaffOrReadOnly]


class BookCopyViewSet(viewsets.ModelViewSet):
    queryset = BookCopy.objects.select_related("book").all()
    serializer_class = BookCopySerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        return queryset.filter(status=BookCopy.AVAILABLE)


class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.select_related("copy", "borrower").all()
    serializer_class = LoanSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        return queryset.filter(borrower=self.request.user)

    def perform_create(self, serializer):
        copy = serializer.validated_data["copy"]
        if copy.status != BookCopy.AVAILABLE:
            raise ValidationError({"copy": "This copy is not available."})

        loan = serializer.save()
        copy.status = BookCopy.LOANED
        copy.save(update_fields=["status"])
        return loan

    def perform_update(self, serializer):
        loan = serializer.save()

        if loan.returned_at and loan.copy.status != BookCopy.AVAILABLE:
            loan.copy.status = BookCopy.AVAILABLE
            loan.copy.save(update_fields=["status"])

            if loan.returned_at > loan.due_at and not hasattr(loan, "fine"):
                overdue_days = max((loan.returned_at.date() - loan.due_at.date()).days, 1)
                Fine.objects.create(
                    loan=loan,
                    amount=overdue_days * 10,
                    reason="Overdue return",
                )

    @action(detail=True, methods=["post"])
    def return_loan(self, request, pk=None):
        loan = self.get_object()
        if loan.returned_at:
            return Response({"detail": "This loan is already closed."}, status=status.HTTP_400_BAD_REQUEST)

        loan.returned_at = timezone.now()
        loan.save(update_fields=["returned_at"])

        loan.copy.status = BookCopy.AVAILABLE
        loan.copy.save(update_fields=["status"])

        if loan.returned_at > loan.due_at and not hasattr(loan, "fine"):
            overdue_days = max((loan.returned_at.date() - loan.due_at.date()).days, 1)
            fine = Fine.objects.create(
                loan=loan,
                amount=overdue_days * 10,
                reason="Overdue return",
            )
            return Response(
                {"detail": "Book returned with fine.", "fine_id": fine.id},
                status=status.HTTP_200_OK,
            )

        return Response({"detail": "Book returned successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def renew(self, request, pk=None):
        loan = self.get_object()
        if loan.returned_at:
            raise ValidationError({"detail": "Returned loans cannot be renewed."})

        loan.renewed_count += 1
        loan.due_at = loan.due_at + timedelta(days=14)
        loan.save(update_fields=["renewed_count", "due_at"])
        return Response({"detail": "Loan renewed successfully.", "due_at": loan.due_at})


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related("book", "user").all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FineViewSet(viewsets.ModelViewSet):
    queryset = Fine.objects.select_related("loan").all()
    serializer_class = FineSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        return queryset.filter(loan__borrower=self.request.user)


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
        key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
        value=refresh_token,
        max_age=settings.SIMPLE_JWT["AUTH_COOKIE_MAX_AGE"],
        httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
        secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
    )


def clear_refresh_cookie(response):
    response.delete_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
        path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
    )


class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh = response.data.pop("refresh", None)
        if refresh:
            set_refresh_cookie(response, refresh)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])
        if not refresh:
            return Response({"detail": "Refresh cookie not found."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={"refresh": refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        data = serializer.validated_data
        response = Response(data, status=status.HTTP_200_OK)

        new_refresh = data.get("refresh")
        if new_refresh:
            set_refresh_cookie(response, new_refresh)
            response.data.pop("refresh", None)

        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_refresh_cookie(response)
        return response
