import os

from .base import *  # noqa: F401,F403

DEBUG = False
ALLOWED_HOSTS = [host for host in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",") if host] or ["localhost"]