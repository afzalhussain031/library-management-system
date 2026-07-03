import os

from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

if FRONTEND_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS = [*CORS_ALLOWED_ORIGINS, FRONTEND_URL]

# Use Mailjet when credentials are configured; otherwise print emails to the terminal.
if os.getenv("MAILJET_API_KEY") and os.getenv("MAILJET_API_SECRET"):
    EMAIL_BACKEND = "django_mailjet.backends.MailjetBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
