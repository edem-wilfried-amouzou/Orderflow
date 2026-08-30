from django.urls import path
from .views import ProduitListCreateView, ProduitDetailView

urlpatterns = [
    path("produits/", ProduitListCreateView.as_view()),
    path("produits/<int:pk>/", ProduitDetailView.as_view()),
]