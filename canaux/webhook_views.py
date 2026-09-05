from django.http import HttpResponse, HttpResponseForbidden
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from .models import CanalConnecte
from .bot import traiter_message_entrant, traiter_message_greenapi
import json

class MetaWebhookView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if (request.GET.get("hub.mode") == "subscribe"
                and request.GET.get("hub.verify_token") == settings.META_VERIFY_TOKEN):
            challenge = request.GET.get("hub.challenge", "")
            return HttpResponse(challenge, content_type="text/plain")
        return HttpResponseForbidden()

    def post(self, request):
        payload = request.data
        objet = payload.get("object")

        type_canal = {
            "whatsapp_business_account": CanalConnecte.Type.WHATSAPP,
            "page": CanalConnecte.Type.FACEBOOK,
            "instagram": CanalConnecte.Type.INSTAGRAM,
        }.get(objet)

        if type_canal:
            for entree in payload.get("entry", []):
                traiter_message_entrant(type_canal, entree)

        return Response(status=200)

class GreenApiWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("GREEN API PAYLOAD:", json.dumps(request.data))  # ligne temporaire de debug
        traiter_message_greenapi(request.data)
        return Response(status=200)