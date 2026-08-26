# users/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Utilisateur, Commercant


class CommercantInscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commercant
        fields = ('nom_boutique', 'ville', 'adresse_boutique')


class InscriptionSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    commercant = CommercantInscriptionSerializer()

    class Meta:
        model = Utilisateur
        fields = ('email', 'username', 'telephone', 'password', 'commercant')

    def create(self, validated_data):
        commercant_data = validated_data.pop('commercant')
        password = validated_data.pop('password')

        utilisateur = Utilisateur(**validated_data, role=Utilisateur.Role.COMMERCANT)
        utilisateur.set_password(password)
        utilisateur.save()

        Commercant.objects.create(utilisateur=utilisateur, **commercant_data)
        return utilisateur


class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ('id', 'email', 'username', 'telephone', 'role', 'photo_profil')
        read_only_fields = ('id', 'role')