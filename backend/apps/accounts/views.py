from binascii import Error as BinasciiError

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import models
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Membership
from .serializers import (
    CustomUserProfileSerializer,
    CustomUserRegistrationSerializer,
    CustomUserUpdateSerializer,
    ForgotPasswordSerializer,
    PasswordChangeSerializer,
    ResetPasswordSerializer,
    StaffCreateSerializer,
)

# Fetch our CustomUser model setup from base.py settings
CustomUser = get_user_model()

# =========================================================================
# 🍪 JWT COOKIE UTILITIES
# =========================================================================


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


# =========================================================================
# 🔐 AUTHENTICATION & REGISTRATION VIEWS
# =========================================================================


class RegisterView(generics.CreateAPIView):
    """Public registration endpoint for students"""

    queryset = CustomUser.objects.all()
    serializer_class = CustomUserRegistrationSerializer
    permission_classes = [AllowAny]


class StaffCreateView(generics.CreateAPIView):
    """Protected endpoint to create staff users (admin only)"""

    queryset = CustomUser.objects.all()
    serializer_class = StaffCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Verify requester is admin/superuser
        if not self.request.user.is_staff and not self.request.user.is_superuser:
            raise PermissionDenied("Only staff can create staff accounts")
        serializer.save()


class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Interceptors login payloads containing 'user_id', normalizes it
    for SimpleJWT, and drops the refresh token into a highly secure cookie.
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        refresh = response.data.pop("refresh", None)
        if refresh:
            set_refresh_cookie(response, refresh)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """Regenerates access keys reading straight out of the encrypted secure cookie."""

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
    """Clears client browser authentication tokens securely."""

    permission_classes = [AllowAny]

    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_refresh_cookie(response)
        return response


# =========================================================================
# 👤 USER PROFILE & MANAGEMENT VIEWS
# =========================================================================


class CurrentUserView(APIView):
    """Returns dynamic account context directly from the active session token."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        membership = Membership.objects.filter(user=user).first()

        data = {
            "id": user.id,
            "user_id": user.user_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "date_joined": user.date_joined,
            "role": user.role,
            "phone_number": user.phone_number,
            "department": user.department,
            "student_name": user.student_name,
            "membership_valid_till": (
                membership.valid_till.isoformat() if membership else None
            ),
            "avatar": user.user_id[:2].upper(),
        }
        return Response(data)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Reads or performs atomic updates directly onto the CustomUser row."""

    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return CustomUserUpdateSerializer
        return CustomUserProfileSerializer


class PasswordChangeView(APIView):
    """Verifies existing secret key structures before saving a new pass."""

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


# =========================================================================
# 📊 METRICS & DASHBOARD DATA VIEWS
# =========================================================================


class DashboardView(APIView):
    """Compiles loans, active holdings, and pending liabilities directly via User ID."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.billing.models import Fine
        from apps.circulation.models import Loan

        user = request.user
        membership = Membership.objects.filter(user=user).first()

        currently_borrowed = Loan.objects.filter(
            borrower=user, returned_at__isnull=True
        ).count()

        total_borrowed = Loan.objects.filter(borrower=user).count()

        pending_fines = (
            Fine.objects.filter(loan__borrower=user, status="pending").aggregate(
                total=models.Sum("amount")
            )["total"]
            or 0
        )

        data = {
            "account_information": {
                "id": user.id,
                "user_id": user.user_id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone_number": user.phone_number,
            },
            "academic_details": {
                "department": user.department,
                "batch": user.batch,
                "student_name": user.student_name,
                "father_name": user.father_name,
                "mother_name": user.mother_name,
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


# =========================================================================
# 🔑 SECURITY & RECOVERY VIEWS
# =========================================================================


@method_decorator(csrf_exempt, name="dispatch")
class ForgotPasswordView(APIView):
    """Generates encrypted system tokens targeted to a confirmed CustomUser account email."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = CustomUser.objects.get(email=email)

        # Generate token
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Create reset link
        frontend_url = getattr(
            settings, "FRONTEND_URL", "http://localhost:5173"
        ).rstrip("/")
        reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"

        # Send email
        try:
            send_mail(
                subject="Reset your password",
                message=f"Click here to reset: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=f"""
                    <p>Click the link below to reset your password:</p>
                    <a href="{reset_link}">Reset Password</a>
                """,
                fail_silently=False,
            )
        except Exception as e:
            return Response(
                {"detail": f"Error sending email: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return JsonResponse(
            {
                "detail": "If an account exists for that email, instructions have been sent."
            },
            status=200,
        )


@method_decorator(csrf_exempt, name="dispatch")
class ResetPasswordView(APIView):
    """Decrypts incoming access strings to change a user's password securely."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["user_id"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            target_pk = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=target_pk)
        except (
            BinasciiError,
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            CustomUser.DoesNotExist,
        ):
            return JsonResponse({"detail": "Invalid reset link."}, status=400)

        if not default_token_generator.check_token(user, token):
            return JsonResponse({"detail": "Invalid or expired token."}, status=400)

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return JsonResponse(
            {"detail": "Password has been reset successfully."}, status=200
        )
