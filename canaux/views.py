from django.utils import timezone
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from users.permissions import EstCommercant
from .models import CanalConnecte
from .serializers import CanalConnecteSerializer

TYPES_VALIDES = {"WHATSAPP", "FACEBOOK", "INSTAGRAM"}


class CanalListeView(generics.ListAPIView):
    permission_classes = [EstCommercant]
    serializer_class = CanalConnecteSerializer

    def get_queryset(self):
        return CanalConnecte.objects.filter(commercant=self.request.user.commercant)


class ConnecterCanalManuelView(APIView):
    """Le commerçant colle l'identifiant externe + le token copiés depuis Meta for Developers."""
    permission_classes = [EstCommercant]

    def post(self, request):
        type_canal = request.data.get("type", "").upper()
        identifiant_externe = request.data.get("identifiant_externe", "").strip()
        token_acces = request.data.get("token_acces", "").strip()

        if type_canal not in TYPES_VALIDES:
            return Response({"erreur": "Type de canal invalide."}, status=400)
        if not identifiant_externe or not token_acces:
            return Response({"erreur": "Identifiant externe et token requis."}, status=400)

        canal, _ = CanalConnecte.objects.update_or_create(
            commercant=request.user.commercant, type=type_canal,
            defaults={
                "identifiant_externe": identifiant_externe,
                "token_acces": token_acces,
                "statut_connexion": CanalConnecte.StatutConnexion.CONNECTE,
                "connecte_le": timezone.now(),
            },
        )
        return Response(CanalConnecteSerializer(canal).data, status=201)


class CanalDeconnecterView(APIView):
    permission_classes = [EstCommercant]

    def delete(self, request, pk):
        try:
            canal = CanalConnecte.objects.get(pk=pk, commercant=request.user.commercant)
        except CanalConnecte.DoesNotExist:
            return Response(status=404)
        canal.statut_connexion = CanalConnecte.StatutConnexion.EN_ATTENTE
        canal.token_acces = ""
        canal.save()
        return Response(status=204)