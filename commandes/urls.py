from django.urls import path
from .views import (
    CommandeListCreateView, CommandeDetailView, CommandeHistoriqueView,
    ValiderCommandeView, AnnulerCommandeView, MarquerLivreeCommandeView,
    DashboardStatsView, DashboardActivite7jView, DashboardFinancesView, SuiviCommandeView,
)

urlpatterns = [
    path("commandes/", CommandeListCreateView.as_view()),
    path("commandes/<int:pk>/", CommandeDetailView.as_view()),
    path("commandes/<int:pk>/historique/", CommandeHistoriqueView.as_view()),
    path("commandes/<int:pk>/valider/", ValiderCommandeView.as_view()),
    path("commandes/<int:pk>/annuler/", AnnulerCommandeView.as_view()),
    path("commandes/<int:pk>/marquer-livree/", MarquerLivreeCommandeView.as_view()),
    path("dashboard/stats/", DashboardStatsView.as_view()),
    path("dashboard/activite-7j/", DashboardActivite7jView.as_view()),
    path("dashboard/finances/", DashboardFinancesView.as_view()),
    path("suivi/<str:numero>/", SuiviCommandeView.as_view()),
]