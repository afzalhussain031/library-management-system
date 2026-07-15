from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookViewSet, CategoryViewSet, PublisherViewSet, WishlistViewSet, PersonalizedRecommendationsView

router = DefaultRouter()
router.register(r"books", BookViewSet, basename="book")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"publishers", PublisherViewSet, basename="publisher")
router.register(r"wishlist", WishlistViewSet, basename="wishlist")

urlpatterns = [
    path("recommendations/personalized/", PersonalizedRecommendationsView.as_view(), name="personalized-recommendations"),
    path("", include(router.urls)),
]