"""Celery application entry point.

The project does not currently ship with Celery in requirements, so this
module stays import-safe even when celery is not installed.
"""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

try:
    from celery import Celery
except ImportError:  # pragma: no cover - optional dependency
    celery_app = None
else:
    celery_app = Celery("config")
    celery_app.config_from_object("django.conf:settings", namespace="CELERY")
    celery_app.autodiscover_tasks()