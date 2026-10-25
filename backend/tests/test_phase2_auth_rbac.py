"""
Unit Tests — Phase 2 Authentication, RBAC, and Security
CareerSphere AI
"""
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class TestPhase2AuthRbac(unittest.TestCase):
    """
    Validates Phase 2 Authentication, OTP validation contracts, and Role-Based Access Control guards.
    """

    def test_user_roles_declared(self):
        content = (BASE_DIR / "apps" / "accounts" / "models.py").read_text()
        self.assertIn("class UserRole(models.TextChoices):", content)
        self.assertIn("CANDIDATE = \"candidate\", \"Candidate\"", content)
        self.assertIn("RECRUITER = \"recruiter\"", content)
        self.assertIn("ADMIN = \"admin\"", content)

    def test_rbac_permission_guards_exist(self):
        content = (BASE_DIR / "apps" / "accounts" / "permissions.py").read_text()
        self.assertIn("class IsCandidateUser(BasePermission):", content)
        self.assertIn("class IsRecruiterUser(BasePermission):", content)
        self.assertIn("class IsAdminUser(BasePermission):", content)
        self.assertIn("class IsEmailVerified(BasePermission):", content)
        self.assertIn("request.user.role == UserRole.CANDIDATE", content)

    def test_auth_serializers_declared(self):
        content = (BASE_DIR / "apps" / "accounts" / "serializers.py").read_text()
        self.assertIn("class UserRegistrationSerializer(", content)
        self.assertIn("class UserLoginSerializer(", content)
        self.assertIn("class OtpVerificationSerializer(", content)
        self.assertIn("class PasswordResetRequestSerializer(", content)
        self.assertIn("class PasswordResetConfirmSerializer(", content)

    def test_auth_urls_contain_phase2_endpoints(self):
        urls_content = (BASE_DIR / "apps" / "accounts" / "urls.py").read_text()
        self.assertIn("auth/register/", urls_content)
        self.assertIn("auth/verify-otp/", urls_content)
        self.assertIn("auth/login/", urls_content)
        self.assertIn("auth/me/", urls_content)
        self.assertIn("auth/logout/", urls_content)
        self.assertIn("auth/password-reset/request/", urls_content)
        self.assertIn("auth/password-reset/confirm/", urls_content)

    def test_server_auth_routes_exist(self):
        server_content = (BASE_DIR.parent / "server.ts").read_text()
        self.assertIn("/api/v1/auth/register", server_content)
        self.assertIn("/api/v1/auth/verify-otp", server_content)
        self.assertIn("/api/v1/auth/login", server_content)
        self.assertIn("/api/v1/auth/me", server_content)
        self.assertIn("/api/v1/auth/logout", server_content)


if __name__ == "__main__":
    unittest.main()
