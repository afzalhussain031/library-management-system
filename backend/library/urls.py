from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BookCopyViewSet,
    BookViewSet,
    CategoryViewSet,
    CurrentUserView,
    FineViewSet,
    LoanViewSet,
    PublisherViewSet,
    RegisterView,
    ReservationViewSet,
    StaffCreateView,
    UserProfileView,
)

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'publishers', PublisherViewSet, basename='publisher')
router.register(r'copies', BookCopyViewSet, basename='copy')
router.register(r'loans', LoanViewSet, basename='loan')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'fines', FineViewSet, basename='fine')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('register/', RegisterView.as_view(), name='register'),
    path('staff/create/', StaffCreateView.as_view(), name='staff-create'),
]