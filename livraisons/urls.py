from django.urls import path
from .views import DemanderLivreurView, FlotteView, MesMissionsView, MissionStatutUpdateView, PositionUpdateView

urlpatterns = [
    path("<int:commande_id>/demander-livreur/", DemanderLivreurView.as_view()),
    path("flotte/", FlotteView.as_view()),
    path("mes-missions/", MesMissionsView.as_view()),
    path("<int:pk>/statut/", MissionStatutUpdateView.as_view()),
    path("ma-position/", PositionUpdateView.as_view()),
]