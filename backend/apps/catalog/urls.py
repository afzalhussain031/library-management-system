from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookViewSet, CategoryViewSet, PublisherViewSet

router = DefaultRouter()
router.register(r"books", BookViewSet, basename="book")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"publishers", PublisherViewSet, basename="publisher")

urlpatterns = [path("", include(router.urls))]