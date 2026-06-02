from binascii import Error as BinasciiError

from common.permissions.base import IsStaffOrReadOnly
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import models
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Membership, UserProfile
from .serializers import (
    PasswordChangeSerializer,
    RegisterSerializer,
    StaffCreateSerializer,
    UserProfileReadSerializer,
    UserProfileUpdateSerializer,
)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(UserProfile, user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return UserProfileUpdateSerializer
        return UserProfileReadSerializer


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Password updated successfully."}, status=status.HTTP_200_OK
        )


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


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.billing.models import Fine
        from apps.circulation.models import Loan

        user = request.user
        profile = get_object_or_404(UserProfile, user=user)
        membership = Membership.objects.filter(user=user).first()

        # Count borrowed books (active loans)
        currently_borrowed = Loan.objects.filter(
            borrower=user, returned_at__isnull=True
        ).count()

        # Count total borrowed books (all loans)
        total_borrowed = Loan.objects.filter(borrower=user).count()

        # Calculate total pending fines
        pending_fines = (
            Fine.objects.filter(loan__borrower=user, status="pending").aggregate(
                total=models.Sum("amount")
            )["total"]
            or 0
        )

        data = {
            "account_information": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone_number": profile.phone_number,
                "enrollment_number": profile.enrollment_number,
            },
            "academic_details": {
                "department": profile.department,
                "batch": profile.batch,
                "student_name": profile.student_name,
                "father_name": profile.father_name,
                "mother_name": profile.mother_name,
            },
            "library_information": {
                "currently_borrowed": currently_borrowed,
                "total_borrowed": total_borrowed,
                "pending_fines": float(pending_fines),
                "membership_valid_till": (
                    membership.valid_till.isoformat() if membership else None
                ),
            },
        }

        return Response(data)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    authentication_classes = []
    permission_classes = [AllowAny]


class StaffCreateView(generics.CreateAPIView):
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
            return Response(
                {"detail": "Refresh cookie not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken(exc.args[0])

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


@method_decorator(csrf_exempt, name="dispatch")
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip()

        if not email:
            return JsonResponse({"detail": "Email is required."}, status=400)

        user = User.objects.filter(email__iexact=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = getattr(
                settings, "FRONTEND_URL", "http://localhost:5173"
            ).rstrip("/")
            reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"

            subject = "Reset your password"
            message = (
                "You requested a password reset for your library account. \n\n"
                f"Reset your password here: {reset_link}\n\n"
                "If you did not request this, you can ignore this email."
            )

            send_mail(
                subject=subject,
                message=message,
                from_email=None,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return JsonResponse(
            {
                "detail": "If an account exists for that email, password instructions have been sent."
            },
            status=200,
        )


@method_decorator(csrf_exempt, name="dispatch")
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get("uid") or ""
        token = request.data.get("token") or ""
        new_password = request.data.get("new_password") or ""

        if not uid or not token or not new_password:
            return JsonResponse(
                {"detail": "uid, token and new_password are required."},
                status=400,
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (
            BinasciiError,
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            User.DoesNotExist,
        ):
            return JsonResponse({"detail": "Invalid reset link."}, status=400)

        if not default_token_generator.check_token(user, token):
            return JsonResponse({"detail": "Invalid or expired token."}, status=400)

        try:
            validate_password(new_password, user=user)
        except ValidationError as exc:
            return JsonResponse({"detail": exc.messages}, status=400)

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return JsonResponse(
            {"detail": "Password has been reset successfully."}, status=200
        )
