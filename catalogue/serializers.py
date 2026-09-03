from rest_framework import serializers
from .models import Produit


class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = ("id", "nom", "description", "prix", "photo", "actif", "created_at")
        read_only_fields = ("id", "created_at")