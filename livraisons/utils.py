from math import radians, sin, cos, sqrt, atan2
from users.models import Livreur
from .models import Livraison


def distance_km(lat1, lon1, lat2, lon2):
    rayon_terre = 6371
    phi1, phi2 = radians(lat1), radians(lat2)
    delta_phi = radians(lat2 - lat1)
    delta_lambda = radians(lon2 - lon1)
    a = sin(delta_phi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(delta_lambda / 2) ** 2
    return 2 * rayon_terre * atan2(sqrt(a), sqrt(1 - a))


def livreurs_disponibles_pour_attribution():
    en_mission = Livraison.objects.exclude(statut__in=[Livraison.Statut.LIVREE, Livraison.Statut.ECHEC]).values_list("livreur_id", flat=True)
    return Livreur.objects.filter(disponible=True).exclude(id__in=en_mission)


def trouver_livreur_le_plus_proche(commande):
    candidats = livreurs_disponibles_pour_attribution()
    if not candidats.exists():
        return None
    adresse = commande.adresse
    candidats_geolocalises = candidats.filter(latitude__isnull=False, longitude__isnull=False)
    if adresse.latitude is None or adresse.longitude is None or not candidats_geolocalises.exists():
        return candidats.first()
    return min(candidats_geolocalises, key=lambda l: distance_km(adresse.latitude, adresse.longitude, l.latitude, l.longitude))