# notifications/urls.py
from django.urls import path
from .views import NotificationListView, NotificationMarquerLuView, PushTokenCreateView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/lu/', NotificationMarquerLuView.as_view(), name='notification-lu'),
    path('push-token/', PushTokenCreateView.as_view(), name='push-token'),
]