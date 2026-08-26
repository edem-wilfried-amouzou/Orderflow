from django.shortcuts import render

# Create your views here.
# commandes/views.py
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Commande, HistoriqueCommande
from .serializers import (
    CommandeListSerializer, CommandeDetailSerializer, CommandeCreateSerializer,
    HistoriqueCommandeSerializer,
)
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta


class CommandeListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/commandes/ — Écran 3 (liste) et Écran 5 (création)"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['statut', 'canal']
    search_fields = ['numero', 'client__nom', 'client__telephone']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Commande.objects.filter(commercant=self.request.user.commercant)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommandeCreateSerializer
        return CommandeListSerializer


class CommandeDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/commandes/{id}/ — Écran 4"""
    permission_classes = [IsAuthenticated]
    serializer_class = CommandeDetailSerializer

    def get_queryset(self):
        return Commande.objects.filter(commercant=self.request.user.commercant)


class CommandeHistoriqueView(generics.ListAPIView):
    """GET /api/v1/commandes/{id}/historique/"""
    permission_classes = [IsAuthenticated]
    serializer_class = HistoriqueCommandeSerializer

    def get_queryset(self):
        return HistoriqueCommande.objects.filter(
            commande_id=self.kwargs['pk'],
            commande__commercant=self.request.user.commercant
        )


class CommandeValiderView(APIView):
    """POST /api/v1/commandes/{id}/valider/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        commande = self._get_commande(request, pk)
        if commande.statut != Commande.Statut.NOUVELLE:
            return Response({'erreur': 'Seule une commande NOUVELLE peut être validée.'}, status=400)

        commande.statut = Commande.Statut.VALIDEE
        commande.save()
        HistoriqueCommande.objects.create(commande=commande, statut=commande.statut, commentaire="Commande validée")
        return Response(CommandeDetailSerializer(commande).data)

    def _get_commande(self, request, pk):
        return Commande.objects.get(pk=pk, commercant=request.user.commercant)


class CommandeAnnulerView(APIView):
    """POST /api/v1/commandes/{id}/annuler/ — Écran 4, bouton Annuler"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        commande = Commande.objects.get(pk=pk, commercant=request.user.commercant)
        commande.statut = Commande.Statut.ANNULEE
        commande.save()
        HistoriqueCommande.objects.create(
            commande=commande, statut=commande.statut,
            commentaire=request.data.get('raison', 'Commande annulée')
        )
        return Response(CommandeDetailSerializer(commande).data)



class DashboardStatsView(APIView):
    """GET /api/v1/dashboard/stats/ — Écran 2, les 4 compteurs du haut"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        commercant = request.user.commercant
        aujourdhui = timezone.now().date()
        qs = Commande.objects.filter(commercant=commercant, created_at__date=aujourdhui)

        return Response({
            'commandes_du_jour': qs.count(),
            'en_attente_traitement': qs.filter(statut=Commande.Statut.NOUVELLE).count(),
            'en_cours_livraison': qs.filter(statut=Commande.Statut.EN_LIVRAISON).count(),
            'livrees_avec_succes': qs.filter(statut=Commande.Statut.LIVREE).count(),
        })


class DashboardActivite7jView(APIView):
    """GET /api/v1/dashboard/activite-7j/ — Écran 2, graphique"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        commercant = request.user.commercant
        aujourdhui = timezone.now().date()
        resultats = []

        for i in range(6, -1, -1):
            jour = aujourdhui - timedelta(days=i)
            count = Commande.objects.filter(commercant=commercant, created_at__date=jour).count()
            resultats.append({'date': jour.isoformat(), 'jour': jour.strftime('%a'), 'nombre': count})

        return Response(resultats)


class DashboardFinancesView(APIView):
    """GET /api/v1/dashboard/finances/ — Écran 2, bloc violet"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        commercant = request.user.commercant
        aujourdhui = timezone.now().date()
        commandes_jour = Commande.objects.filter(commercant=commercant, created_at__date=aujourdhui)

        total_collecte = sum(c.montant_total for c in commandes_jour.filter(statut=Commande.Statut.LIVREE))

        total = commandes_jour.exclude(statut=Commande.Statut.ANNULEE).count()
        livrees = commandes_jour.filter(statut=Commande.Statut.LIVREE).count()
        taux_livraison = round((livrees / total * 100), 1) if total > 0 else 0

        return Response({
            'total_collecte_aujourdhui': total_collecte,
            'taux_livraison': taux_livraison,
        })
    