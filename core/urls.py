from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("users.urls")),
    path("api/v1/catalogue/", include("catalogue.urls")),
    path("api/v1/", include("commandes.urls")),
    path("api/v1/livraisons/", include("livraisons.urls")),
    path("api/v1/notifications/", include("notifications.urls")),
    path("api/v1/paiements/", include("paiements.urls")),
    path("api/v1/canaux/", include("canaux.urls")),
    path("api/v1/webhooks/", include("canaux.webhook_urls")),
    path("api/v1/webhooks/fedapay/", include("paiements.webhook_urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)