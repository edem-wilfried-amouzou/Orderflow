from django.urls import path
from .webhook_views import MetaWebhookView

urlpatterns = [
    path("meta/", MetaWebhookView.as_view()),
]