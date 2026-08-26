# commandes/serializers.py
from rest_framework import serializers
from .models import Commande, LigneCommande, HistoriqueCommande
from adressage.models import AdresseDigitale
from users.models import Client


class LigneCommandeSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()

    class Meta:
        model = LigneCommande
        fields = ('id', 'produit', 'quantite', 'prix_unitaire', 'total')


class AdresseDigitaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdresseDigitale
        fields = ('id', 'quartier', 'indications_reperes', 'photo_repere', 'latitude', 'longitude')


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ('id', 'nom', 'telephone')


class HistoriqueCommandeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueCommande
        fields = ('id', 'statut', 'commentaire', 'created_at')


class CommandeListSerializer(serializers.ModelSerializer):
    """Pour l'écran 3 : liste des commandes (version allégée)"""
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    client_telephone = serializers.CharField(source='client.telephone', read_only=True)
    montant_total = serializers.ReadOnlyField()

    class Meta:
        model = Commande
        fields = ('id', 'numero', 'client_nom', 'client_telephone', 'canal', 'statut', 'montant_total', 'created_at')


class CommandeDetailSerializer(serializers.ModelSerializer):
    """Pour l'écran 4 : détail complet avec lignes, adresse, historique"""
    client = ClientSerializer(read_only=True)
    adresse = AdresseDigitaleSerializer(read_only=True)
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    historique = HistoriqueCommandeSerializer(many=True, read_only=True)
    montant_total = serializers.ReadOnlyField()
    livreur_nom = serializers.CharField(source='livreur.utilisateur.get_full_name', read_only=True)

    class Meta:
        model = Commande
        fields = (
            'id', 'numero', 'client', 'adresse', 'lignes', 'historique',
            'canal', 'statut', 'frais_livraison', 'montant_total',
            'livreur', 'livreur_nom', 'created_at', 'updated_at',
        )


class CommandeCreateSerializer(serializers.ModelSerializer):
    """Pour l'écran 5 : création manuelle d'une commande"""
    client_nom = serializers.CharField(write_only=True)
    client_telephone = serializers.CharField(write_only=True)
    adresse = AdresseDigitaleSerializer()
    lignes = LigneCommandeSerializer(many=True)

    class Meta:
        model = Commande
        fields = ('client_nom', 'client_telephone', 'adresse', 'lignes', 'canal', 'frais_livraison')

    def create(self, validated_data):
        commercant = self.context['request'].user.commercant

        client_nom = validated_data.pop('client_nom')
        client_telephone = validated_data.pop('client_telephone')
        client, _ = Client.objects.get_or_create(
            commercant=commercant, telephone=client_telephone,
            defaults={'nom': client_nom}
        )

        adresse_data = validated_data.pop('adresse')
        adresse = AdresseDigitale.objects.create(**adresse_data)

        lignes_data = validated_data.pop('lignes')

        commande = Commande.objects.create(
            commercant=commercant, client=client, adresse=adresse, **validated_data
        )

        for ligne_data in lignes_data:
            LigneCommande.objects.create(commande=commande, **ligne_data)

        HistoriqueCommande.objects.create(
            commande=commande, statut=Commande.Statut.NOUVELLE, commentaire="Commande créée"
        )

        return commande