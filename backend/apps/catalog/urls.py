from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookViewSet, CategoryViewSet, PublisherViewSet, WishlistViewSet, LanguageViewSet, ReviewViewSet, GlobalSearchView

router = DefaultRouter()
router.register(r"books", BookViewSet, basename="book")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"languages", LanguageViewSet, basename="language")
router.register(r"publishers", PublisherViewSet, basename="publisher")
router.register(r"wishlist", WishlistViewSet, basename="wishlist")
router.register(r"reviews", ReviewViewSet, basename="review")

urlpatterns = [
    path("", include(router.urls)),
    path("search/", GlobalSearchView.as_view(), name="global_search"),
]