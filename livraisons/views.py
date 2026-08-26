from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from users.models import Livreur
from commandes.models import Commande, HistoriqueCommande
from commandes.serializers import CommandeDetailSerializer
from .serializers import (
    LivreurSerializer, PositionUpdateSerializer,
    AssignerLivreurSerializer, CommandeAAssignerSerializer,
)
from drf_spectacular.utils import extend_schema

class LivreursDisponiblesView(generics.ListAPIView):
    """GET /api/v1/livraisons/livreurs-disponibles/ — Écran 6"""
    permission_classes = [IsAuthenticated]
    serializer_class = LivreurSerializer

    def get_queryset(self):
        return Livreur.objects.filter(commercant=self.request.user.commercant, disponible=True)


class CommandesAAssignerView(generics.ListAPIView):
    """GET /api/v1/livraisons/a-assigner/ — Écran 6"""
    permission_classes = [IsAuthenticated]
    serializer_class = CommandeAAssignerSerializer

    def get_queryset(self):
        return Commande.objects.filter(
            commercant=self.request.user.commercant, statut=Commande.Statut.VALIDEE
        )


class AssignerLivreurView(APIView):
    """POST /api/v1/livraisons/{commande_id}/assigner/"""
    permission_classes = [IsAuthenticated]

    @extend_schema(request=AssignerLivreurSerializer)
    def post(self, request, commande_id):
        commande = Commande.objects.get(pk=commande_id, commercant=request.user.commercant)
        serializer = AssignerLivreurSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        livreur = Livreur.objects.get(id=serializer.validated_data['livreur_id'])
        commande.livreur = livreur
        commande.statut = Commande.Statut.ASSIGNEE
        commande.save()

        HistoriqueCommande.objects.create(
            commande=commande, statut=commande.statut,
            commentaire=f"Attribué à {livreur.utilisateur.get_full_name() or livreur.utilisateur.username}"
        )
        return Response(CommandeDetailSerializer(commande).data)


class ReattribuerLivreurView(AssignerLivreurView):
    """POST /api/v1/livraisons/{commande_id}/reattribuer/ — même logique qu'assigner"""
    pass


class PositionUpdateView(generics.UpdateAPIView):
    """PATCH /api/v1/livreurs/{id}/position/ — utilisé par l'app mobile livreur"""
    permission_classes = [IsAuthenticated]
    serializer_class = PositionUpdateSerializer
    queryset = Livreur.objects.all()

    def perform_update(self, serializer):
        serializer.save(derniere_position_maj=timezone.now())


class FlotteView(generics.ListAPIView):
    """GET /api/v1/livraisons/flotte/ — Écran 6, carte temps réel"""
    permission_classes = [IsAuthenticated]
    serializer_class = LivreurSerializer

    def get_queryset(self):
        return Livreur.objects.filter(
            commercant=self.request.user.commercant,
            commandes__statut=Commande.Statut.EN_LIVRAISON
        ).distinct()