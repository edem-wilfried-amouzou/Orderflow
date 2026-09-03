from rest_framework import generics
from users.permissions import EstCommercant
from .models import Produit
from .serializers import ProduitSerializer


class ProduitListCreateView(generics.ListCreateAPIView):
    permission_classes = [EstCommercant]
    serializer_class = ProduitSerializer

    def get_queryset(self):
        qs = Produit.objects.filter(commercant=self.request.user.commercant)
        actif = self.request.query_params.get("actif")
        if actif is not None:
            qs = qs.filter(actif=actif.lower() in ("true", "1"))
        return qs

    def perform_create(self, serializer):
        serializer.save(commercant=self.request.user.commercant)


class ProduitDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [EstCommercant]
    serializer_class = ProduitSerializer

    def get_queryset(self):
        return Produit.objects.filter(commercant=self.request.user.commercant)