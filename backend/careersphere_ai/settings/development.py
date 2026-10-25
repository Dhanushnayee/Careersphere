"""
CareerSphere AI — Development Settings
Phase 1 Foundation
"""
import os
from .base import *

# Security: Development settings
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-dev-key-change-in-production-careersphere-2026")
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,0.0.0.0,backend").split(",")
    if host.strip()
]

# Database Configuration: PostgreSQL with SQLite fallback for quick local runs
DB_HOST = os.getenv("DB_HOST", "")
if DB_HOST:
    DATABASES = {
        "default": {
            "ENGINE": os.getenv("DB_ENGINE", "django.db.backends.postgresql"),
            "NAME": os.getenv("DB_NAME", "careersphere_db"),
            "USER": os.getenv("DB_USER", "careersphere_user"),
            "PASSWORD": os.getenv("DB_PASSWORD", "careersphere_secure_dev_password_2026"),
            "HOST": DB_HOST,
            "PORT": os.getenv("DB_PORT", "5432"),
            "CONN_MAX_AGE": 60,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "dev_careersphere.sqlite3",
        }
    }

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173",
    ).split(",")
    if origin.strip()
]
CORS_ALLOW_CREDENTIALS = True

# Celery & Redis
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/2")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Email Backend (Console for Development)
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
)

# Cookie & Session Settings for Development
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False
