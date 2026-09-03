from django.db import models


class Produit(models.Model):
    commercant = models.ForeignKey("users.Commercant", on_delete=models.CASCADE, related_name="produits")
    nom = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    photo = models.ImageField(upload_to="produits/", null=True, blank=True)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.nom