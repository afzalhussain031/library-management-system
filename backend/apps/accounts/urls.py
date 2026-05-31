from django.urls import path

from .views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    CurrentUserView,
    DashboardView,
    ForgotPasswordView,
    LogoutView,
    PasswordChangeView,
    RegisterView,
    ResetPasswordView,
    StaffCreateView,
    UserProfileView,
)

urlpatterns = [
    path("token/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("me/password/", PasswordChangeView.as_view(), name="password-change"),
    path("me/dashboard/", DashboardView.as_view(), name="dashboard"),
    path("register/", RegisterView.as_view(), name="register"),
    path("staff/create/", StaffCreateView.as_view(), name="staff-create"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]
