from django.db import models

# Create your models here.



class AdresseDigitale(models.Model):
    quartier = models.CharField(max_length=150)
    indications_reperes = models.TextField(help_text="Repères visuels pour trouver le lieu")
    photo_repere = models.ImageField(upload_to='reperes/', null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.quartier