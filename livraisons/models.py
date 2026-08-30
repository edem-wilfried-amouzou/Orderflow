from django.db import models


class Livraison(models.Model):
    class Statut(models.TextChoices):
        ASSIGNEE = "ASSIGNEE", "Assignée"
        ACCEPTEE = "ACCEPTEE", "Acceptée"
        EN_COURS = "EN_COURS", "En cours"
        LIVREE = "LIVREE", "Livrée"
        ECHEC = "ECHEC", "Échec"

    commande = models.OneToOneField("commandes.Commande", on_delete=models.CASCADE, related_name="livraison")
    livreur = models.ForeignKey("users.Livreur", on_delete=models.CASCADE, related_name="livraisons")
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.ASSIGNEE)
    date_assignation = models.DateTimeField(auto_now_add=True)
    date_livraison = models.DateTimeField(null=True, blank=True)
    preuve_livraison = models.ImageField(upload_to="preuves/", null=True, blank=True)
    notes = models.TextField(blank=True)
    paiement_recu = models.BooleanField(default=False)