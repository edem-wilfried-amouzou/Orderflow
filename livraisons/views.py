from django.utils import timezone
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from users.permissions import EstCommercant, EstLivreur
from commandes.models import Commande, HistoriqueCommande
from commandes.serializers import CommandeDetailSerializer
from notifications.emails import envoyer_email_changement_statut
from notifications.models import Notification
from .models import Livraison
from .utils import trouver_livreur_le_plus_proche
from .serializers import PositionUpdateSerializer, MissionSerializer, MissionStatutUpdateSerializer, LivreurSerializer


def assigner_automatiquement(commande):
    """Fonction centrale, réutilisée aussi par le bot de l'app canaux."""
    livreur = trouver_livreur_le_plus_proche(commande)
    if livreur is None:
        return None
    Livraison.objects.update_or_create(commande=commande, defaults={"livreur": livreur, "statut": Livraison.Statut.ASSIGNEE})
    commande.statut = Commande.Statut.ASSIGNEE
    commande.save()
    nom_livreur = livreur.utilisateur.get_full_name() or livreur.utilisateur.username
    HistoriqueCommande.objects.create(commande=commande, statut=commande.statut, commentaire=f"Livreur le plus proche assigné automatiquement : {nom_livreur}")
    Notification.objects.create(
        destinataire=commande.commercant.utilisateur, type=Notification.Type.LIVREUR_ASSIGNE,
        titre="Livreur assigné", message=f"{nom_livreur} a été assigné à la commande {commande.numero} de {commande.client.nom}.",
        commande=commande,
    )
    envoyer_email_changement_statut(commande)
    return livreur


class DemanderLivreurView(APIView):
    permission_classes = [EstCommercant]

    def post(self, request, commande_id):
        try:
            commande = Commande.objects.get(pk=commande_id, commercant=request.user.commercant)
        except Commande.DoesNotExist:
            return Response({"erreur": "Commande introuvable."}, status=404)
        if commande.statut != Commande.Statut.VALIDEE:
            return Response({"erreur": "La commande doit être validée avant de demander un livreur."}, status=400)
        livreur = assigner_automatiquement(commande)
        if livreur is None:
            return Response({"erreur": "Aucun livreur disponible actuellement. Réessaie dans quelques minutes."}, status=409)
        return Response(CommandeDetailSerializer(commande).data)


class FlotteView(generics.ListAPIView):
    permission_classes = [EstCommercant]
    serializer_class = LivreurSerializer

    def get_queryset(self):
        from users.models import Livreur
        return Livreur.objects.filter(
            livraisons__commande__commercant=self.request.user.commercant,
            livraisons__statut__in=[Livraison.Statut.ASSIGNEE, Livraison.Statut.ACCEPTEE, Livraison.Statut.EN_COURS],
        ).distinct()


class MesMissionsView(generics.ListAPIView):
    permission_classes = [EstLivreur]
    serializer_class = MissionSerializer

    def get_queryset(self):
        return Livraison.objects.filter(livreur=self.request.user.livreur).order_by("-date_assignation")


class MissionStatutUpdateView(generics.UpdateAPIView):
    permission_classes = [EstLivreur]
    serializer_class = MissionStatutUpdateSerializer

    def get_queryset(self):
        return Livraison.objects.filter(livreur=self.request.user.livreur)

    def perform_update(self, serializer):
        livraison = serializer.save()
        if livraison.statut == Livraison.Statut.LIVREE:
            livraison.date_livraison = timezone.now()
            livraison.save()
            livraison.commande.statut = Commande.Statut.LIVREE
            livraison.commande.save()
        elif livraison.statut == Livraison.Statut.EN_COURS:
            livraison.commande.statut = Commande.Statut.EN_LIVRAISON
            livraison.commande.save()
        elif livraison.statut == Livraison.Statut.ECHEC:
            livraison.commande.statut = Commande.Statut.ECHEC
            livraison.commande.save()
        HistoriqueCommande.objects.create(commande=livraison.commande, statut=livraison.commande.statut, commentaire=f"Mise à jour par le livreur : {livraison.get_statut_display()}")
        envoyer_email_changement_statut(livraison.commande)


class PositionUpdateView(generics.UpdateAPIView):
    permission_classes = [EstLivreur]
    serializer_class = PositionUpdateSerializer

    def get_object(self):
        return self.request.user.livreur

    def perform_update(self, serializer):
        serializer.save(derniere_position_maj=timezone.now())