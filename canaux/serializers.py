from rest_framework import serializers
from .models import CanalConnecte


class CanalConnecteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanalConnecte
        fields = ("id", "type", "identifiant_externe", "statut_connexion", "connecte_le")