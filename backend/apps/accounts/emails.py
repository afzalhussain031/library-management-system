import logging
import os
import requests
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, user_display: str, reset_link: str) -> bool:
    """
    Sends a password reset email.
    If BREVO_API_KEY is configured, sends via Brevo's HTTPS REST API (Port 443).
    Otherwise, falls back to Django's standard send_mail().
    """
    subject = "Reset Your Library Account Password"
    text_message = (
        f"Hello {user_display},\n\n"
        f"We received a request to reset your password. Use the link below to set a new password:\n"
        f"{reset_link}\n\n"
        f"This link will expire in 1 hour.\n\n"
        f"If you did not request a password reset, please ignore this email."
    )
    html_message = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
            <h2 style="color: #111827; margin-bottom: 12px; font-size: 20px;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">Hello <strong>{user_display}</strong>,</p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">We received a request to reset the password for your Library Management account. Click the button below to choose a new password:</p>
            <div style="margin: 24px 0;">
                <a href="{reset_link}" style="background-color: #facc15; color: #111827; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 9999px; display: inline-block; font-size: 14px;">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 12px; line-height: 1.5;">This link will expire in <strong>1 hour</strong>. If the button above does not work, copy and paste this link into your browser:</p>
            <p style="color: #3b82f6; font-size: 12px; word-break: break-all;"><a href="{reset_link}">{reset_link}</a></p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 11px;">If you didn't request this change, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
    """

    brevo_api_key = os.getenv("BREVO_API_KEY", "").strip()

    if brevo_api_key:
        try:
            sender_email = (
                os.getenv("BREVO_SENDER_EMAIL")
                or os.getenv("EMAIL_HOST_USER")
                or "afzalhussain031@gmail.com"
            )
            sender_name = os.getenv("BREVO_SENDER_NAME", "Library Support")

            payload = {
                "sender": {"name": sender_name, "email": sender_email},
                "to": [{"email": to_email, "name": user_display}],
                "subject": subject,
                "htmlContent": html_message,
                "textContent": text_message,
            }

            headers = {
                "accept": "application/json",
                "api-key": brevo_api_key,
                "content-type": "application/json",
            }

            response = requests.post(
                "https://api.brevo.com/v3/smtp/email",
                json=payload,
                headers=headers,
                timeout=10,
            )

            if response.status_code in (200, 201, 202):
                logger.info(f"Password reset email sent via Brevo to {to_email}")
                return True
            else:
                error_msg = f"Brevo API error ({response.status_code}): {response.text}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)
        except Exception as e:
            logger.exception(f"Failed to send email via Brevo: {e}")
            raise e
    else:
        # Fallback to standard Django send_mail (used in local development)
        from_email = getattr(
            settings, "DEFAULT_FROM_EMAIL", "Library Support <noreply@library.local>"
        )
        send_mail(
            subject=subject,
            message=text_message,
            from_email=from_email,
            recipient_list=[to_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
