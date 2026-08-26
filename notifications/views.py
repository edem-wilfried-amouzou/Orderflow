from django.shortcuts import render

# Create your views here.

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer, PushTokenSerializer


class NotificationListView(generics.ListAPIView):
    """GET /api/v1/notifications/"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(destinataire=self.request.user)


class NotificationMarquerLuView(generics.UpdateAPIView):
    """PATCH /api/v1/notifications/{id}/lu/"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(destinataire=self.request.user)

    def perform_update(self, serializer):
        serializer.save(lu=True)


class PushTokenCreateView(generics.CreateAPIView):
    """POST /api/v1/notifications/push-token/ — utilisé par l'app mobile"""
    permission_classes = [IsAuthenticated]
    serializer_class = PushTokenSerializer