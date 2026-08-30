from django.contrib import admin
from .models import Notification, PushToken

admin.site.register(Notification)
admin.site.register(PushToken)