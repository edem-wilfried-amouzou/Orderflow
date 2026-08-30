from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import Utilisateur, Commercant, Livreur


class RegisterCommercantSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    telephone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)
    nom_boutique = serializers.CharField(max_length=150)
    secteur_activite = serializers.CharField(max_length=100, required=False, allow_blank=True)
    ville = serializers.CharField(max_length=100, required=False, allow_blank=True)
    adresse_boutique = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_email(self, value):
        if Utilisateur.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate_username(self, value):
        if Utilisateur.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def create(self, validated_data):
        utilisateur = Utilisateur.objects.create_user(
            username=validated_data["username"], email=validated_data["email"],
            telephone=validated_data.get("telephone", ""), password=validated_data["password"],
            role=Utilisateur.Role.COMMERCANT,
        )
        Commercant.objects.create(
            utilisateur=utilisateur, nom_boutique=validated_data["nom_boutique"],
            secteur_activite=validated_data.get("secteur_activite", ""),
            ville=validated_data.get("ville") or "Lomé",
            adresse_boutique=validated_data.get("adresse_boutique", ""),
        )
        return utilisateur


class RegisterLivreurSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    telephone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)
    zone = serializers.CharField(max_length=100, required=False, allow_blank=True)
    vehicule = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate_email(self, value):
        if Utilisateur.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate_username(self, value):
        if Utilisateur.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def create(self, validated_data):
        utilisateur = Utilisateur.objects.create_user(
            username=validated_data["username"], email=validated_data["email"],
            telephone=validated_data.get("telephone", ""), password=validated_data["password"],
            role=Utilisateur.Role.LIVREUR,
        )
        Livreur.objects.create(
            utilisateur=utilisateur, zone=validated_data.get("zone", ""),
            vehicule=validated_data.get("vehicule", ""),
        )
        return utilisateur


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        utilisateur = authenticate(username=data["email"], password=data["password"])
        if utilisateur is None:
            raise serializers.ValidationError("Email ou mot de passe incorrect.")
        data["utilisateur"] = utilisateur
        return data


class CommercantProfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commercant
        fields = ("nom_boutique", "secteur_activite", "ville", "adresse_boutique")


class LivreurProfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livreur
        fields = ("zone", "vehicule", "moto_id", "disponible", "latitude", "longitude", "derniere_position_maj")
        read_only_fields = ("derniere_position_maj",)


class MeSerializer(serializers.ModelSerializer):
    commercant = CommercantProfilSerializer(read_only=True)
    livreur = LivreurProfilSerializer(read_only=True)

    class Meta:
        model = Utilisateur
        fields = ("id", "username", "email", "telephone", "role", "commercant", "livreur")