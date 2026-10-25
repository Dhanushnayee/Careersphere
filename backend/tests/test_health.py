"""
Unit Tests — Health & System Information Endpoints
Phase 1 Foundation
"""
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class TestHealthArchitecture(unittest.TestCase):
    """
    Validates the structure and contracts of health check endpoints.
    """

    def test_common_views_exist(self):
        views_path = BASE_DIR / "apps" / "common" / "views.py"
        self.assertTrue(views_path.exists())
        content = views_path.read_text()
        self.assertIn("RootHealthCheckView", content)
        self.assertIn("DetailedHealthCheckView", content)
        self.assertIn("SystemConfigView", content)

    def test_health_routes_in_urls(self):
        root_urls = (BASE_DIR / "careersphere_ai" / "urls.py").read_text()
        self.assertIn("RootHealthCheckView", root_urls)
        self.assertIn("health/", root_urls)

        common_urls = (BASE_DIR / "apps" / "common" / "urls.py").read_text()
        self.assertIn("DetailedHealthCheckView", common_urls)
        self.assertIn("SystemConfigView", common_urls)


if __name__ == "__main__":
    unittest.main()
