import logging
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator, default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

logger = logging.getLogger(__name__)


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """
    Generate secure tokens for email verification.
    Includes the user's is_verified status in the hash so that a token
    becomes invalid immediately after verification.
    """
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) + str(user.is_verified) + str(user.is_active)
        )


email_verification_token_generator = EmailVerificationTokenGenerator()


def send_verification_email(user):
    """
    Send an email verification link to the registered user.
    """
    try:
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_verification_token_generator.make_token(user)
        verification_link = f"{settings.FRONTEND_URL}/verify-email?uid={uidb64}&token={token}"

        subject = "Verify your email for Library Management System"
        message = (
            f"Hello {user.first_name or user.user_id},\n\n"
            f"Thank you for registering at Library Management System. "
            f"Please verify your email address by clicking the link below:\n\n"
            f"{verification_link}\n\n"
            f"If you did not register for this account, please ignore this email.\n\n"
            f"Best regards,\n"
            f"Library Management Team"
        )
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Verification email sent successfully to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
        return False


def send_password_reset_email(user):
    """
    Send a password reset link to the user.
    """
    try:
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uidb64}&token={token}"

        subject = "Password Reset Request - Library Management System"
        message = (
            f"Hello {user.first_name or user.user_id},\n\n"
            f"We received a request to reset your password. "
            f"You can reset your password by clicking the link below:\n\n"
            f"{reset_link}\n\n"
            f"This link will expire in a short time. "
            f"If you did not request a password reset, please ignore this email.\n\n"
            f"Best regards,\n"
            f"Library Management Team"
        )

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Password reset email sent successfully to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
        return False
