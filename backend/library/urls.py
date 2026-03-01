from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, UserProfileView, CurrentUserView, RegisterView, StaffCreateView

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('register/', RegisterView.as_view(), name='register'),
    path('staff/create/', StaffCreateView.as_view(), name='staff-create'),
]