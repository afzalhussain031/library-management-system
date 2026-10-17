from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

def health_check(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("api/health/", health_check, name="health-check"),
    path("admin/", admin.site.urls),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.catalog.urls")),
    path("api/", include("apps.inventory.urls")),
    path("api/", include("apps.circulation.urls")),
    path("api/", include("apps.billing.urls")),
    path("api/", include("apps.notifications.urls")),

    path("api/analytics/", include("apps.analytics.urls")), 
]