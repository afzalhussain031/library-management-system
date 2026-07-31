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
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

# 5. Tell Django where to collect static files
STATIC_ROOT = BASE_DIR / "staticfiles"