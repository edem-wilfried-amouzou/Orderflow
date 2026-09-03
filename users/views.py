from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from notifications.emails import envoyer_email_bienvenue
from .serializers import (
    RegisterCommercantSerializer, RegisterLivreurSerializer,
    LoginSerializer, MeSerializer, CommercantProfilSerializer, LivreurProfilSerializer,
)


def _tokens_pour(utilisateur):
    refresh = RefreshToken.for_user(utilisateur)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterCommercantView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterCommercantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        utilisateur = serializer.save()
        envoyer_email_bienvenue(utilisateur)
        data = _tokens_pour(utilisateur)
        data.update({"role": utilisateur.role, "email": utilisateur.email})
        return Response(data, status=status.HTTP_201_CREATED)


class RegisterLivreurView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterLivreurSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        utilisateur = serializer.save()
        envoyer_email_bienvenue(utilisateur)
        data = _tokens_pour(utilisateur)
        data.update({"role": utilisateur.role, "email": utilisateur.email})
        return Response(data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        utilisateur = serializer.validated_data["utilisateur"]
        data = _tokens_pour(utilisateur)
        data.update({"role": utilisateur.role, "email": utilisateur.email})
        return Response(data)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MeSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        utilisateur = self.get_object()
        if utilisateur.role == "COMMERCANT" and "commercant" in request.data:
            s = CommercantProfilSerializer(utilisateur.commercant, data=request.data["commercant"], partial=True)
            s.is_valid(raise_exception=True)
            s.save()
        elif utilisateur.role == "LIVREUR" and "livreur" in request.data:
            s = LivreurProfilSerializer(utilisateur.livreur, data=request.data["livreur"], partial=True)
            s.is_valid(raise_exception=True)
            s.save()
        for champ in ("telephone", "username"):
            if champ in request.data:
                setattr(utilisateur, champ, request.data[champ])
        utilisateur.save()
        return Response(MeSerializer(utilisateur).data)