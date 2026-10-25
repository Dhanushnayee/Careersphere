"""
CareerSphere AI — Django Core Package
Phase 1 Foundation
"""
from .celery import app as celery_app

__all__ = ("celery_app",)
