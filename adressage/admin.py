from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import AdresseDigitale


@admin.register(AdresseDigitale)
class AdresseDigitaleAdmin(admin.ModelAdmin):
    list_display = ('quartier', 'latitude', 'longitude', 'created_at')
    search_fields = ('quartier', 'indications_reperes')