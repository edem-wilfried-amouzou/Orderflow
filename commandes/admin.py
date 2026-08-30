from django.contrib import admin
from .models import AdresseDigitale, Commande, LigneCommande, HistoriqueCommande


class LigneCommandeInline(admin.TabularInline):
    model = LigneCommande
    extra = 0


class HistoriqueCommandeInline(admin.TabularInline):
    model = HistoriqueCommande
    extra = 0
    readonly_fields = ("statut", "commentaire", "created_at")


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ("numero", "commercant", "client", "canal", "statut", "created_at")
    list_filter = ("statut", "canal")
    search_fields = ("numero", "client__nom", "client__telephone")
    inlines = [LigneCommandeInline, HistoriqueCommandeInline]


admin.site.register(AdresseDigitale)