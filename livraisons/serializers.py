# livraisons/serializers.py
from rest_framework import serializers
from users.models import Livreur
from commandes.models import Commande


class LivreurSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='utilisateur.get_full_name', read_only=True)

    class Meta:
        model = Livreur
        fields = ('id', 'nom', 'zone', 'moto_id', 'disponible', 'latitude', 'longitude', 'derniere_position_maj')


class PositionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livreur
        fields = ('latitude', 'longitude')


class AssignerLivreurSerializer(serializers.Serializer):
    livreur_id = serializers.IntegerField()

    def validate_livreur_id(self, value):
        commercant = self.context['request'].user.commercant
        if not Livreur.objects.filter(id=value, commercant=commercant, disponible=True).exists():
            raise serializers.ValidationError("Livreur invalide ou indisponible.")
        return value


class CommandeAAssignerSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    quartier = serializers.CharField(source='adresse.quartier', read_only=True)
    montant_total = serializers.ReadOnlyField()

    class Meta:
        model = Commande
        fields = ('id', 'numero', 'client_nom', 'quartier', 'montant_total')