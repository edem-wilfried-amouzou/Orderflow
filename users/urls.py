from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterCommercantView, RegisterLivreurView, LoginView, MeView

urlpatterns = [
    path("register/commercant/", RegisterCommercantView.as_view()),
    path("register/livreur/", RegisterLivreurView.as_view()),
    path("login/", LoginView.as_view()),
    path("refresh/", TokenRefreshView.as_view()),
    path("me/", MeView.as_view()),
]