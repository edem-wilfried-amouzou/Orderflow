from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from .models import CanalConnecte
from .bot import traiter_message_entrant


class MetaWebhookView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if (request.GET.get("hub.mode") == "subscribe"
                and request.GET.get("hub.verify_token") == settings.META_VERIFY_TOKEN):
            return Response(int(request.GET.get("hub.challenge")))
        return Response(status=403)

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