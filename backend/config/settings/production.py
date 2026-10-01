import os
import dj_database_url
from .base import *  # noqa: F401,F403

DEBUG = False

# 1. Allowed Hosts
ALLOWED_HOSTS = [host for host in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",") if host] or ["localhost"]

# 2. Add WhiteNoise Middleware (Right after SecurityMiddleware)
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

# 3. Connect Supabase Database
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# 4. Add Vercel Frontend to CORS
FRONTEND_URL = os.getenv("FRONTEND_URL")
if FRONTEND_URL:
    clean_url = FRONTEND_URL.strip().rstrip("/")
    if clean_url not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(clean_url)

# Allow all Vercel subdomains (previews & production)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.vercel\.app$",
]


# 5. Tell Django where to collect static files
STATIC_ROOT = BASE_DIR / "staticfiles"

# 6. Production Email Delivery (SMTP e.g. Gmail, Brevo, SendGrid, Resend)
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL", EMAIL_HOST_USER or "Library Support <noreply@library.local>"
)