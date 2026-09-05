from datetime import timedelta
from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from users.permissions import EstCommercant
from notifications.emails import notifier_nouvelle_commande, envoyer_email_changement_statut
from .models import Commande, HistoriqueCommande
from .serializers import (
    CommandeListSerializer, CommandeDetailSerializer, CommandeCreateSerializer,
    HistoriqueCommandeSerializer, SuiviCommandeSerializer,
)


class CommandeListCreateView(generics.ListCreateAPIView):
    permission_classes = [EstCommercant]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["statut", "canal"]
    search_fields = ["numero", "client__nom", "client__telephone"]
    ordering_fields = ["created_at", "updated_at"]

    def get_queryset(self):
        return Commande.objects.filter(commercant=self.request.user.commercant)

    def get_serializer_class(self):
        return CommandeCreateSerializer if self.request.method == "POST" else CommandeListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["commercant"] = self.request.user.commercant
        return context

    def create(self, request, *args, **kwargs):
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        commande = serializer.save()
        notifier_nouvelle_commande(commande)
        return Response(CommandeDetailSerializer(commande).data, status=status.HTTP_201_CREATED)



class CommandeDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [EstCommercant]
    serializer_class = CommandeDetailSerializer

    def get_queryset(self):
        return Commande.objects.filter(commercant=self.request.user.commercant)


class CommandeHistoriqueView(generics.ListAPIView):
    permission_classes = [EstCommercant]
    serializer_class = HistoriqueCommandeSerializer

    def get_queryset(self):
        return HistoriqueCommande.objects.filter(commande_id=self.kwargs["pk"], commande__commercant=self.request.user.commercant)


class ValiderCommandeView(APIView):
    permission_classes = [EstCommercant]

    def post(self, request, pk):
        try:
            commande = Commande.objects.get(pk=pk, commercant=request.user.commercant)
        except Commande.DoesNotExist:
            return Response({"erreur": "Commande introuvable."}, status=404)
        if commande.statut != Commande.Statut.NOUVELLE:
            return Response({"erreur": "Seule une commande nouvelle peut être validée."}, status=400)
        commande.statut = Commande.Statut.VALIDEE
        commande.save()
        HistoriqueCommande.objects.create(commande=commande, statut=commande.statut, commentaire="Commande validée par le commerçant")
        envoyer_email_changement_statut(commande)
        return Response(CommandeDetailSerializer(commande).data)


class AnnulerCommandeView(APIView):
    permission_classes = [EstCommercant]

    def post(self, request, pk):
        try:
            commande = Commande.objects.get(pk=pk, commercant=request.user.commercant)
        except Commande.DoesNotExist:
            return Response({"erreur": "Commande introuvable."}, status=404)
        if commande.statut in (Commande.Statut.LIVREE, Commande.Statut.ANNULEE):
            return Response({"erreur": "Cette commande ne peut plus être annulée."}, status=400)
        commande.statut = Commande.Statut.ANNULEE
        commande.save()
        HistoriqueCommande.objects.create(commande=commande, statut=commande.statut, commentaire="Commande annulée par le commerçant")
        envoyer_email_changement_statut(commande)
        return Response(CommandeDetailSerializer(commande).data)

class MarquerLivreeCommandeView(APIView):
    permission_classes = [EstCommercant]

    def post(self, request, pk):
        try:
            commande = Commande.objects.get(pk=pk, commercant=request.user.commercant)
        except Commande.DoesNotExist:
            return Response({"erreur": "Commande introuvable."}, status=404)
        if commande.statut in (Commande.Statut.LIVREE, Commande.Statut.ANNULEE):
            return Response({"erreur": "Cette commande ne peut plus être marquée comme livrée."}, status=400)
        commande.statut = Commande.Statut.LIVREE
        commande.save()
        HistoriqueCommande.objects.create(commande=commande, statut=commande.statut, commentaire="Commande marquée comme livrée par le commerçant")
        envoyer_email_changement_statut(commande)
        return Response(CommandeDetailSerializer(commande).data)

class DashboardStatsView(APIView):
    permission_classes = [EstCommercant]

    def get(self, request):
        qs = Commande.objects.filter(commercant=request.user.commercant)
        aujourdhui = timezone.now().date()
        return Response({
            "commandes_du_jour": qs.filter(created_at__date=aujourdhui).count(),
            "en_attente_traitement": qs.filter(statut=Commande.Statut.NOUVELLE).count(),
            "en_cours_livraison": qs.filter(statut=Commande.Statut.EN_LIVRAISON).count(),
            "livrees_avec_succes": qs.filter(statut=Commande.Statut.LIVREE).count(),
        })


class DashboardActivite7jView(APIView):
    permission_classes = [EstCommercant]

    def get(self, request):
        qs = Commande.objects.filter(commercant=request.user.commercant)
        aujourdhui = timezone.now().date()
        jours_fr = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
        resultat = []
        for i in range(6, -1, -1):
            jour = aujourdhui - timedelta(days=i)
            resultat.append({"date": jour.isoformat(), "jour": jours_fr[jour.weekday()], "nombre": qs.filter(created_at__date=jour).count()})
        return Response(resultat)


class DashboardFinancesView(APIView):
    permission_classes = [EstCommercant]

    def get(self, request):
        qs = Commande.objects.filter(commercant=request.user.commercant)
        aujourdhui = timezone.now().date()
        commandes_livrees_jour = qs.filter(created_at__date=aujourdhui, statut=Commande.Statut.LIVREE)
        total_collecte = sum((c.montant_total for c in commandes_livrees_jour), 0)
        total = qs.count()
        livrees = qs.filter(statut=Commande.Statut.LIVREE).count()
        taux_livraison = round((livrees / total) * 100, 1) if total else 0
        return Response({"total_collecte_aujourdhui": total_collecte, "taux_livraison": taux_livraison})


class SuiviCommandeView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = SuiviCommandeSerializer
    lookup_field = "numero"
    queryset = Commande.objects.all()

