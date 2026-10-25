"""
CareerSphere AI — Role-Based Access Control (RBAC) Permissions
Phase 2 Authentication and Authorization
"""
from rest_framework.permissions import BasePermission
from apps.accounts.models import UserRole


class IsCandidateUser(BasePermission):
    """Allows access only to authenticated candidate users."""
    message = "Only candidates have permission to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.CANDIDATE
        )


class IsRecruiterUser(BasePermission):
    """Allows access only to authenticated recruiter users."""
    message = "Only recruiters or hiring managers have permission to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == UserRole.RECRUITER or request.user.is_staff)
        )


class IsAdminUser(BasePermission):
    """Allows access only to platform administrators."""
    message = "Administrator privileges are required for this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == UserRole.ADMIN or request.user.is_superuser)
        )


class IsEmailVerified(BasePermission):
    """Requires the user to have completed email OTP verification."""
    message = "Email verification via OTP is required to access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_email_verified", False)
        )
