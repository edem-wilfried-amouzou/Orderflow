from django.db import models


class CanalConnecte(models.Model):
    class Type(models.TextChoices):
        WHATSAPP = "WHATSAPP", "WhatsApp"
        FACEBOOK = "FACEBOOK", "Facebook"
        INSTAGRAM = "INSTAGRAM", "Instagram"

    class StatutConnexion(models.TextChoices):
        EN_ATTENTE = "EN_ATTENTE", "En attente"
        CONNECTE = "CONNECTE", "Connecté"
        ERREUR = "ERREUR", "Erreur"

    commercant = models.ForeignKey("users.Commercant", on_delete=models.CASCADE, related_name="canaux")
    type = models.CharField(max_length=20, choices=Type.choices)
    identifiant_externe = models.CharField(max_length=255, blank=True)  # Phone number ID / Page ID / IG Business ID
    token_acces = models.CharField(max_length=500, blank=True)
    statut_connexion = models.CharField(max_length=20, choices=StatutConnexion.choices, default=StatutConnexion.EN_ATTENTE)
    connecte_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("commercant", "type")

    def __str__(self):
        return f"{self.get_type_display()} — {self.commercant.nom_boutique}"


class Conversation(models.Model):
    class Etat(models.TextChoices):
        DEBUT = "DEBUT", "Début"
        CATALOGUE_ENVOYE = "CATALOGUE_ENVOYE", "Catalogue envoyé"
        PANIER_EN_COURS = "PANIER_EN_COURS", "Panier en cours"
        EN_ATTENTE_ADRESSE = "EN_ATTENTE_ADRESSE", "En attente d'adresse"
        COMMANDE_CREEE = "COMMANDE_CREEE", "Commande créée"

    commercant = models.ForeignKey("users.Commercant", on_delete=models.CASCADE, related_name="conversations")
    canal = models.ForeignKey(CanalConnecte, on_delete=models.CASCADE, related_name="conversations")
    client_identifiant_externe = models.CharField(max_length=255)
    client = models.ForeignKey("users.Client", on_delete=models.SET_NULL, null=True, blank=True)
    etat = models.CharField(max_length=30, choices=Etat.choices, default=Etat.DEBUT)
    quartier_temp = models.CharField(max_length=150, blank=True)
    commande = models.ForeignKey("commandes.Commande", on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("canal", "client_identifiant_externe")


class PanierItem(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="panier")
    produit = models.ForeignKey("catalogue.Produit", on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField(default=1)

    @property
    def total(self):
        return self.quantite * self.produit.prix