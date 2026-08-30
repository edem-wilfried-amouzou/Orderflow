from django.db import models
from django.utils import timezone


class AdresseDigitale(models.Model):
    client = models.ForeignKey("users.Client", on_delete=models.CASCADE, null=True, blank=True, related_name="adresses")
    quartier = models.CharField(max_length=150)
    indications_reperes = models.TextField(blank=True)
    photo_repere = models.ImageField(upload_to="reperes/", null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.quartier


class Commande(models.Model):
    class Canal(models.TextChoices):
        WHATSAPP = "WHATSAPP", "WhatsApp"
        FACEBOOK = "FACEBOOK", "Facebook"
        INSTAGRAM = "INSTAGRAM", "Instagram"
        MANUEL = "MANUEL", "Manuel"

    class Statut(models.TextChoices):
        NOUVELLE = "NOUVELLE", "Nouvelle"
        VALIDEE = "VALIDEE", "Validée"
        ASSIGNEE = "ASSIGNEE", "Assignée"
        EN_LIVRAISON = "EN_LIVRAISON", "En livraison"
        LIVREE = "LIVREE", "Livrée"
        ANNULEE = "ANNULEE", "Annulée"
        ECHEC = "ECHEC", "Échec"

    class ModePaiement(models.TextChoices):
        IMMEDIAT = "IMMEDIAT", "Payé immédiatement"
        A_LA_LIVRAISON = "A_LA_LIVRAISON", "Paiement à la livraison"

    numero = models.CharField(max_length=30, unique=True, blank=True)
    commercant = models.ForeignKey("users.Commercant", on_delete=models.CASCADE, related_name="commandes")
    client = models.ForeignKey("users.Client", on_delete=models.CASCADE, related_name="commandes")
    adresse = models.OneToOneField(AdresseDigitale, on_delete=models.CASCADE)
    canal = models.CharField(max_length=20, choices=Canal.choices)
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.NOUVELLE)
    mode_paiement = models.CharField(max_length=20, choices=ModePaiement.choices, default=ModePaiement.A_LA_LIVRAISON)
    frais_livraison = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.numero:
            annee = timezone.now().year
            dernier = Commande.objects.filter(numero__startswith=f"OF-{annee}").count() + 1
            self.numero = f"OF-{annee}-{dernier:06d}"
        super().save(*args, **kwargs)

    @property
    def montant_total(self):
        return sum(l.total for l in self.lignes.all()) + self.frais_livraison

    def __str__(self):
        return self.numero


class LigneCommande(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="lignes")
    produit_ref = models.ForeignKey("catalogue.Produit", on_delete=models.SET_NULL, null=True, blank=True)
    produit = models.CharField(max_length=150)
    quantite = models.PositiveIntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total(self):
        return self.quantite * self.prix_unitaire


class HistoriqueCommande(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="historique")
    statut = models.CharField(max_length=20)
    commentaire = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]