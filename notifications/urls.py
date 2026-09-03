from django.urls import path
from .views import NotificationListView, NotificationLuView, PushTokenView

urlpatterns = [
    path("", NotificationListView.as_view()),
    path("<int:pk>/lu/", NotificationLuView.as_view()),
    path("push-token/", PushTokenView.as_view()),
]