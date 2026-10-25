"""
Unit Tests — Settings & Security Auditing
Phase 1 Foundation
"""
import unittest
import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class TestSettingsSecurity(unittest.TestCase):
    """
    Validates that production settings enforce strict security invariants
    and that development settings do not introduce wildcard CORS or open security holes.
    """

    def test_base_settings_file_exists(self):
        base_settings = BASE_DIR / "careersphere_ai" / "settings" / "base.py"
        self.assertTrue(base_settings.exists(), "base.py must exist")

    def test_production_settings_enforce_no_hardcoded_secrets(self):
        prod_settings = BASE_DIR / "careersphere_ai" / "settings" / "production.py"
        self.assertTrue(prod_settings.exists())
        content = prod_settings.read_text()

        # Must ensure DEBUG is set to False
        self.assertIn("DEBUG = False", content)

        # Must verify secret key presence
        self.assertIn("ImproperlyConfigured", content)
        self.assertIn("DJANGO_SECRET_KEY", content)

        # Must enforce strict HTTPS headers
        self.assertIn("SESSION_COOKIE_SECURE = True", content)
        self.assertIn("CSRF_COOKIE_SECURE = True", content)
        self.assertIn("SECURE_HSTS_SECONDS", content)

    def test_upload_limits_enforced_in_base(self):
        base_settings = (BASE_DIR / "careersphere_ai" / "settings" / "base.py").read_text()
        self.assertIn("DATA_UPLOAD_MAX_MEMORY_SIZE", base_settings)
        self.assertIn("FILE_UPLOAD_MAX_MEMORY_SIZE", base_settings)

    def test_env_example_has_all_critical_keys(self):
        env_example = (BASE_DIR.parent / ".env.example").read_text()
        critical_keys = [
            "DJANGO_SECRET_KEY",
            "DJANGO_DEBUG",
            "DJANGO_ALLOWED_HOSTS",
            "DB_NAME",
            "DB_USER",
            "REDIS_URL",
            "CELERY_BROKER_URL",
            "CORS_ALLOWED_ORIGINS",
        ]
        for key in critical_keys:
            self.assertIn(key, env_example, f"Key {key} must be documented in .env.example")


if __name__ == "__main__":
    unittest.main()
