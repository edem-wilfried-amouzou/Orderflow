from django.contrib import admin

# Register your models here.
from .models import Notification, PushToken


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('titre', 'destinataire', 'type', 'lu', 'created_at')
    list_filter = ('type', 'lu')
    search_fields = ('titre', 'message', 'destinataire__email')


@admin.register(PushToken)
class PushTokenAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'plateforme', 'created_at')
    list_filter = ('plateforme',)