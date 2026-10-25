"""
CareerSphere AI — Accounts Serializers
Phase 2 Authentication and Role-Based Access Control
"""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from apps.accounts.models import User, UserRole


class UserPublicSerializer(serializers.ModelSerializer):
    """Safe read-only serializer for user profile previews."""
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = User
        fields = [
            "uuid",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "role_display",
            "is_email_verified",
            "created_at",
        ]
        read_only_fields = fields


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Validates user account registration with password criteria and assigned role."""
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "name", "role", "phone_number"]

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_role(self, value):
        valid_roles = [UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN]
        if value not in valid_roles:
            raise serializers.ValidationError(f"Invalid role. Must be one of: {valid_roles}")
        return value

    def create(self, validated_data):
        name = validated_data.pop("name", "")
        password = validated_data.pop("password")
        email = validated_data.get("email").lower().strip()

        first_name = name.split()[0] if name else ""
        last_name = " ".join(name.split()[1:]) if name and len(name.split()) > 1 else ""

        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            is_email_verified=False,
            **validated_data,
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Validates login credentials."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class OtpVerificationSerializer(serializers.Serializer):
    """Validates 6-digit email OTP verification."""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Validates request for password reset token/link."""
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Validates password reset confirmation with new password."""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value
