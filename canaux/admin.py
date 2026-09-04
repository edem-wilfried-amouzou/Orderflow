from django.contrib import admin
from .models import CanalConnecte, Conversation, PanierItem

@admin.register(CanalConnecte)
class CanalConnecteAdmin(admin.ModelAdmin):
    list_display = ("commercant", "type", "identifiant_externe", "statut_connexion", "connecte_le")
    list_filter = ("type", "statut_connexion")

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("commercant", "canal", "client_identifiant_externe", "etat", "updated_at")
    list_filter = ("etat", "canal__type")

admin.site.register(PanierItem)