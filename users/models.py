from django.db import models

# Create your models here.

# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class Utilisateur(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrateur'
        COMMERCANT = 'COMMERCANT', 'Commerçant'
        LIVREUR = 'LIVREUR', 'Livreur'

    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices)
    photo_profil = models.ImageField(upload_to='profils/', null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class Commercant(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name='commercant')
    nom_boutique = models.CharField(max_length=150)
    ville = models.CharField(max_length=100, default='Lomé')
    adresse_boutique = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom_boutique


class Livreur(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name='livreur')
    commercant = models.ForeignKey(Commercant, on_delete=models.CASCADE, related_name='livreurs')
    zone = models.CharField(max_length=100)
    moto_id = models.CharField(max_length=50, blank=True)
    disponible = models.BooleanField(default=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    derniere_position_maj = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.utilisateur.get_full_name() or self.utilisateur.username} ({self.zone})"


class Client(models.Model):
    commercant = models.ForeignKey(Commercant, on_delete=models.CASCADE, related_name='clients')
    nom = models.CharField(max_length=150)
    telephone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} ({self.telephone})"