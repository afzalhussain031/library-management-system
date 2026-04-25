from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookCopyViewSet

router = DefaultRouter()
router.register(r"copies", BookCopyViewSet, basename="copy")

urlpatterns = [path("", include(router.urls))]