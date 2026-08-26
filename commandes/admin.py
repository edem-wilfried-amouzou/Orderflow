from django.contrib import admin

# Register your models here.
from .models import Commande, LigneCommande, HistoriqueCommande


class LigneCommandeInline(admin.TabularInline):
    model = LigneCommande
    extra = 1


class HistoriqueCommandeInline(admin.TabularInline):
    model = HistoriqueCommande
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ('numero', 'client', 'commercant', 'canal', 'statut', 'created_at')
    list_filter = ('statut', 'canal', 'commercant')
    search_fields = ('numero', 'client__nom', 'client__telephone')
    inlines = [LigneCommandeInline, HistoriqueCommandeInline]
    readonly_fields = ('numero',)