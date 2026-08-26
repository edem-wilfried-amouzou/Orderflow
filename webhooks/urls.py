# webhooks/urls.py
from django.urls import path
from .views import WhatsAppWebhookView

urlpatterns = [
    path('whatsapp/', WhatsAppWebhookView.as_view(), name='webhook-whatsapp'),
]