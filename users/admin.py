from django.contrib import admin
from .models import Commercant, Livreur, Client

# Register your models here.
# users/admin.py
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur


@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    list_display = ('email', 'username', 'role', 'telephone', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'username', 'telephone')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'telephone', 'photo_profil')}),
        ('Rôle', {'fields': ('role',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates importantes', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'role', 'password1', 'password2'),
        }),
    )



@admin.register(Commercant)
class CommercantAdmin(admin.ModelAdmin):
    list_display = ('nom_boutique', 'ville', 'utilisateur', 'created_at')
    search_fields = ('nom_boutique', 'ville')


@admin.register(Livreur)
class LivreurAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'commercant', 'zone', 'moto_id', 'disponible')
    list_filter = ('disponible', 'zone', 'commercant')
    search_fields = ('utilisateur__username', 'zone', 'moto_id')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('nom', 'telephone', 'commercant', 'created_at')
    list_filter = ('commercant',)
    search_fields = ('nom', 'telephone')

