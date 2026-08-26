from django.db import models

# Create your models here.
from django.utils import timezone
from users.models import Commercant, Client, Livreur
from adressage.models import AdresseDigitale


class Commande(models.Model):
    class Statut(models.TextChoices):
        NOUVELLE = 'NOUVELLE', 'Nouvelle'
        VALIDEE = 'VALIDEE', 'Validée'
        ASSIGNEE = 'ASSIGNEE', 'Assignée'
        EN_LIVRAISON = 'EN_LIVRAISON', 'En livraison'
        LIVREE = 'LIVREE', 'Livrée'
        ANNULEE = 'ANNULEE', 'Annulée'

    class Canal(models.TextChoices):
        WHATSAPP = 'WHATSAPP', 'WhatsApp'
        FACEBOOK = 'FACEBOOK', 'Facebook'
        TIKTOK = 'TIKTOK', 'TikTok'
        MANUEL = 'MANUEL', 'Manuel'

    numero = models.CharField(max_length=20, unique=True, editable=False)
    commercant = models.ForeignKey(Commercant, on_delete=models.CASCADE, related_name='commandes')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='commandes')
    adresse = models.OneToOneField(AdresseDigitale, on_delete=models.CASCADE, related_name='commande')
    livreur = models.ForeignKey(Livreur, on_delete=models.SET_NULL, null=True, blank=True, related_name='commandes')

    canal = models.CharField(max_length=20, choices=Canal.choices)
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.NOUVELLE)
    frais_livraison = models.DecimalField(max_digits=10, decimal_places=0, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.numero:
            annee = timezone.now().year
            dernier = Commande.objects.filter(numero__startswith=f'OF-{annee}-').order_by('-id').first()
            prochain_id = (int(dernier.numero.split('-')[-1]) + 1) if dernier else 1
            self.numero = f'OF-{annee}-{prochain_id:06d}'
        super().save(*args, **kwargs)

    @property
    def montant_total(self):
        return sum(ligne.total for ligne in self.lignes.all()) + self.frais_livraison

    def __str__(self):
        return self.numero


class LigneCommande(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='lignes')
    produit = models.CharField(max_length=200)
    quantite = models.PositiveIntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=0)

    @property
    def total(self):
        return self.quantite * self.prix_unitaire

    def __str__(self):
        return f"{self.produit} x{self.quantite}"


class HistoriqueCommande(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='historique')
    statut = models.CharField(max_length=20, choices=Commande.Statut.choices)
    commentaire = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.commande.numero} - {self.statut}"