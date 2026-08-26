# livraisons/urls.py
from django.urls import path
from .views import (
    LivreursDisponiblesView, CommandesAAssignerView,
    AssignerLivreurView, ReattribuerLivreurView,
    PositionUpdateView, FlotteView,
)

urlpatterns = [
    path('livreurs-disponibles/', LivreursDisponiblesView.as_view(), name='livreurs-disponibles'),
    path('a-assigner/', CommandesAAssignerView.as_view(), name='commandes-a-assigner'),
    path('<int:commande_id>/assigner/', AssignerLivreurView.as_view(), name='assigner-livreur'),
    path('<int:commande_id>/reattribuer/', ReattribuerLivreurView.as_view(), name='reattribuer-livreur'),
    path('flotte/', FlotteView.as_view(), name='flotte'),
    path('livreurs/<int:pk>/position/', PositionUpdateView.as_view(), name='livreur-position'),
]