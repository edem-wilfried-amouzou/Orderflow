# commandes/urls.py
from django.urls import path
from .views import (
    CommandeListCreateView, CommandeDetailView,
    CommandeHistoriqueView, CommandeValiderView, CommandeAnnulerView,
)

urlpatterns = [
    path('', CommandeListCreateView.as_view(), name='commande-list-create'),
    path('<int:pk>/', CommandeDetailView.as_view(), name='commande-detail'),
    path('<int:pk>/historique/', CommandeHistoriqueView.as_view(), name='commande-historique'),
    path('<int:pk>/valider/', CommandeValiderView.as_view(), name='commande-valider'),
    path('<int:pk>/annuler/', CommandeAnnulerView.as_view(), name='commande-annuler'),
]