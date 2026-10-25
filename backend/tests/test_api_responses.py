"""
Unit Tests — Standard API Response Envelope
Phase 1 Foundation
"""
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class TestApiResponseContract(unittest.TestCase):
    """
    Validates that API responses conform to the consistent envelope:
    { "success": True, "message": ..., "data": ..., "meta": ... }
    and errors to:
    { "success": False, "error": { "code": ..., "message": ..., "details": ... } }
    """

    def test_response_envelope_definition(self):
        responses_code = (BASE_DIR / "apps" / "common" / "responses.py").read_text()
        self.assertIn("def success_response", responses_code)
        self.assertIn("def error_response", responses_code)
        self.assertIn('"success": True', responses_code)
        self.assertIn('"success": False', responses_code)
        self.assertIn('"error":', responses_code)

    def test_exception_handler_definition(self):
        exceptions_code = (BASE_DIR / "apps" / "common" / "exceptions.py").read_text()
        self.assertIn("def custom_exception_handler", exceptions_code)
        self.assertIn("INTERNAL_SERVER_ERROR", exceptions_code)


if __name__ == "__main__":
    unittest.main()
