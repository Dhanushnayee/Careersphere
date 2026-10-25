"""
ASGI config for CareerSphere AI project.
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "careersphere_ai.settings.development")

application = get_asgi_application()
