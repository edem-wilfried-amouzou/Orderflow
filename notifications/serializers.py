# notifications/serializers.py
from rest_framework import serializers
from .models import Notification, PushToken


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'type', 'titre', 'message', 'lu', 'commande', 'created_at')


class PushTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushToken
        fields = ('id', 'token', 'plateforme')

    def create(self, validated_data):
        utilisateur = self.context['request'].user
        token, _ = PushToken.objects.update_or_create(
            token=validated_data['token'],
            defaults={'utilisateur': utilisateur, 'plateforme': validated_data['plateforme']}
        )
        return token