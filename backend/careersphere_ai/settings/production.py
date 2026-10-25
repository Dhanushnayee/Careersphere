"""
CareerSphere AI — Production Settings
Phase 1 Foundation
"""
import os
from django.core.exceptions import ImproperlyConfigured
from .base import *

DEBUG = False

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
if not SECRET_KEY or "insecure" in SECRET_KEY.lower():
    raise ImproperlyConfigured(
        "CRITICAL: A secure DJANGO_SECRET_KEY must be provided in production environments."
    )

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",")
    if host.strip()
]
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured(
        "CRITICAL: DJANGO_ALLOWED_HOSTS must be explicitly defined in production."
    )

# Production PostgreSQL Database
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")

if not all([DB_NAME, DB_USER, DB_PASSWORD, DB_HOST]):
    raise ImproperlyConfigured(
        "CRITICAL: Complete PostgreSQL credentials (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST) "
        "are required for production deployment."
    )

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": DB_NAME,
        "USER": DB_USER,
        "PASSWORD": DB_PASSWORD,
        "HOST": DB_HOST,
        "PORT": os.getenv("DB_PORT", "5432"),
        "CONN_MAX_AGE": 600,
        "OPTIONS": {
            "sslmode": os.getenv("DB_SSL_MODE", "require"),
        },
    }
}

# Strict CORS Whitelist
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
CORS_ALLOW_CREDENTIALS = True

# Production Redis & Celery
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND")
if not CELERY_BROKER_URL:
    raise ImproperlyConfigured("CRITICAL: CELERY_BROKER_URL must be defined in production.")

# HTTPS & Security Headers
SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "True").lower() in ("true", "1")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_HSTS_SECONDS = 31536000  # 1 Year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Production Email Service
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() in ("true", "1")
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@careersphere.ai")
