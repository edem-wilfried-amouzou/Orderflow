from django.urls import path
from .webhook_views import MetaWebhookView, GreenApiWebhookView

urlpatterns = [
    path("meta/", MetaWebhookView.as_view()),
    path("green/", GreenApiWebhookView.as_view()),
]