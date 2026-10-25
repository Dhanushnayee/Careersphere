from django.urls import path
from apps.accounts.views import (
    AuthStatusView,
    RegisterView,
    VerifyOtpView,
    LoginView,
    CurrentUserView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path("auth/status/", AuthStatusView.as_view(), name="auth-status"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/verify-otp/", VerifyOtpView.as_view(), name="auth-verify-otp"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/me/", CurrentUserView.as_view(), name="auth-me"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/password-reset/request/", PasswordResetRequestView.as_view(), name="auth-password-reset-request"),
    path("auth/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
]
