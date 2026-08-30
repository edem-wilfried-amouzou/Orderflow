from rest_framework import serializers
from users.models import Livreur
from .models import Livraison


class LivreurSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source="utilisateur.get_full_name", read_only=True)

    class Meta:
        model = Livreur
        fields = ("id", "nom", "zone", "vehicule", "moto_id", "disponible", "latitude", "longitude", "derniere_position_maj")


class PositionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livreur
        fields = ("latitude", "longitude")


class MissionSerializer(serializers.ModelSerializer):
    numero = serializers.CharField(source="commande.numero")
    client_nom = serializers.CharField(source="commande.client.nom")
    client_telephone = serializers.CharField(source="commande.client.telephone")
    quartier = serializers.CharField(source="commande.adresse.quartier")
    indications_reperes = serializers.CharField(source="commande.adresse.indications_reperes")
    latitude = serializers.FloatField(source="commande.adresse.latitude")
    longitude = serializers.FloatField(source="commande.adresse.longitude")
    montant_total = serializers.DecimalField(source="commande.montant_total", max_digits=10, decimal_places=2)
    mode_paiement = serializers.CharField(source="commande.mode_paiement")

    class Meta:
        model = Livraison
        fields = ("id", "numero", "statut", "client_nom", "client_telephone", "quartier",
                  "indications_reperes", "latitude", "longitude", "montant_total", "mode_paiement")


class MissionStatutUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livraison
        fields = ("statut", "preuve_livraison", "notes", "paiement_recu")