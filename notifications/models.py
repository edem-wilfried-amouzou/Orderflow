from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        NOUVELLE_COMMANDE = "NOUVELLE_COMMANDE", "Nouvelle commande"
        COMMANDE_VALIDEE = "COMMANDE_VALIDEE", "Commande validée"
        LIVREUR_ASSIGNE = "LIVREUR_ASSIGNE", "Livreur assigné"
        LIVRAISON_EN_COURS = "LIVRAISON_EN_COURS", "Livraison en cours"
        COMMANDE_LIVREE = "COMMANDE_LIVREE", "Commande livrée"
        COMMANDE_ANNULEE = "COMMANDE_ANNULEE", "Commande annulée"

    destinataire = models.ForeignKey("users.Utilisateur", on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=30, choices=Type.choices)
    titre = models.CharField(max_length=150)
    message = models.TextField()
    lu = models.BooleanField(default=False)
    commande = models.ForeignKey("commandes.Commande", on_delete=models.CASCADE, null=True, blank=True, related_name="notifications")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class PushToken(models.Model):
    utilisateur = models.ForeignKey("users.Utilisateur", on_delete=models.CASCADE, related_name="push_tokens")
    token = models.CharField(max_length=255, unique=True)
    plateforme = models.CharField(max_length=20, choices=[("ANDROID", "Android"), ("IOS", "iOS"), ("WEB", "Web")])
    created_at = models.DateTimeField(auto_now_add=True)