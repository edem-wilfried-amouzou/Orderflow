from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur, Commercant, Livreur, Client


@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    model = Utilisateur
    list_display = ("email", "username", "role", "telephone", "is_active")
    list_filter = ("role", "is_active")
    ordering = ("email",)
    fieldsets = UserAdmin.fieldsets + (("Rôle OrderFlow", {"fields": ("role", "telephone")}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Rôle OrderFlow", {"fields": ("email", "role", "telephone")}),)


admin.site.register(Commercant)
admin.site.register(Livreur)
admin.site.register(Client)