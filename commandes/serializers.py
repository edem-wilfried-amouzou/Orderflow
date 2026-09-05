from rest_framework import serializers
from users.models import Client
from .models import AdresseDigitale, Commande, LigneCommande, HistoriqueCommande


class AdresseDigitaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdresseDigitale
        fields = ("id", "quartier", "indications_reperes", "photo_repere", "latitude", "longitude")
        read_only_fields = ("id",)


class LigneCommandeSerializer(serializers.ModelSerializer):
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = LigneCommande
        fields = ("id", "produit_ref", "produit", "quantite", "prix_unitaire", "total")


class HistoriqueCommandeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueCommande
        fields = ("id", "statut", "commentaire", "created_at")


class CommandeListSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source="client.nom", read_only=True)
    client_telephone = serializers.CharField(source="client.telephone", read_only=True)
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Commande
        fields = ("id", "numero", "client_nom", "client_telephone", "canal", "statut", "mode_paiement", "montant_total", "created_at", "updated_at")

class CommandeDetailSerializer(serializers.ModelSerializer):
    adresse = AdresseDigitaleSerializer(read_only=True)
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    client_nom = serializers.CharField(source="client.nom", read_only=True)
    client_telephone = serializers.CharField(source="client.telephone", read_only=True)
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Commande
        fields = ("id", "numero", "client_nom", "client_telephone", "adresse", "canal", "statut",
                  "mode_paiement", "frais_livraison", "montant_total", "lignes", "created_at", "updated_at")


class LigneCommandeCreateSerializer(serializers.Serializer):
    produit_ref = serializers.IntegerField(required=False, allow_null=True)
    produit = serializers.CharField(max_length=150)
    quantite = serializers.IntegerField(min_value=1, default=1)
    prix_unitaire = serializers.DecimalField(max_digits=10, decimal_places=2)


class CommandeCreateSerializer(serializers.Serializer):
    client_nom = serializers.CharField(max_length=150)
    client_telephone = serializers.CharField(max_length=20)
    canal = serializers.ChoiceField(choices=Commande.Canal.choices, default=Commande.Canal.MANUEL)
    mode_paiement = serializers.ChoiceField(choices=Commande.ModePaiement.choices, default=Commande.ModePaiement.A_LA_LIVRAISON)
    frais_livraison = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    adresse = AdresseDigitaleSerializer()
    lignes = LigneCommandeCreateSerializer(many=True)

    def validate_lignes(self, value):
        if not value:
            raise serializers.ValidationError("Une commande doit contenir au moins une ligne de produit.")
        return value

    def create(self, validated_data):
        commercant = self.context["commercant"]
        client, _ = Client.objects.get_or_create(
            commercant=commercant, telephone=validated_data["client_telephone"],
            defaults={"nom": validated_data["client_nom"]},
        )
        adresse_data = validated_data.pop("adresse")
        adresse = AdresseDigitale.objects.create(client=client, **adresse_data)
        commande = Commande.objects.create(
            commercant=commercant, client=client, adresse=adresse,
            canal=validated_data["canal"], mode_paiement=validated_data["mode_paiement"],
            frais_livraison=validated_data["frais_livraison"],
        )
        for ligne in validated_data["lignes"]:
            produit_ref_id = ligne.pop("produit_ref", None)
            LigneCommande.objects.create(
                commande=commande,
                produit_ref_id=produit_ref_id,  # accepte directement l'id, pas besoin de charger l'objet
                **ligne,
            )
        HistoriqueCommande.objects.create(commande=commande, statut=commande.statut, commentaire="Commande créée")
        return commande


class SuiviCommandeSerializer(serializers.ModelSerializer):
    quartier = serializers.CharField(source="adresse.quartier", read_only=True)
    livreur_nom = serializers.SerializerMethodField()
    livreur_telephone = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = ("numero", "statut", "quartier", "livreur_nom", "livreur_telephone", "created_at", "updated_at")

    def _livraison(self, obj):
        return getattr(obj, "livraison", None)

    def get_livreur_nom(self, obj):
        l = self._livraison(obj)
        return (l.livreur.utilisateur.get_full_name() or l.livreur.utilisateur.username) if l else None

    def get_livreur_telephone(self, obj):
        l = self._livraison(obj)
        return l.livreur.utilisateur.telephone if l else None