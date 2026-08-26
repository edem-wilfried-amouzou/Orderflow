from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import InscriptionSerializer, UtilisateurSerializer


class InscriptionView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — Créer un compte marchand"""
    permission_classes = [AllowAny]
    serializer_class = InscriptionSerializer


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Permet la connexion via email (déjà le cas par défaut car USERNAME_FIELD = 'email')"""
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['email'] = self.user.email
        return data


class LoginView(TokenObtainPairView):
    """POST /api/v1/auth/login/ — Connexion, retourne access + refresh token"""
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer


class MoiView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/auth/me/ — Profil de l'utilisateur connecté"""
    permission_classes = [IsAuthenticated]
    serializer_class = UtilisateurSerializer

    def get_object(self):
        return self.request.user