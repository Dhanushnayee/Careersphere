"""
WSGI config for CareerSphere AI project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "careersphere_ai.settings.development")

application = get_wsgi_application()
