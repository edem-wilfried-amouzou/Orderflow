from django.shortcuts import render

# Create your views here.
# webhooks/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from decouple import config


class WhatsAppWebhookView(APIView):
    """GET+POST /api/v1/webhooks/whatsapp/"""
    permission_classes = [AllowAny]  # Meta n'envoie pas de token JWT, donc pas d'authentification classique

    def get(self, request):
        """Vérification initiale du webhook par Meta (une seule fois, à la config)"""
        mode = request.GET.get('hub.mode')
        token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')

        if mode == 'subscribe' and token == config('WHATSAPP_VERIFY_TOKEN'):
            return HttpResponse(challenge, content_type='text/plain', status=200)
        return HttpResponse('Verification failed', status=403)

    def post(self, request):
        """Réception d'un nouveau message WhatsApp"""
        data = request.data
        print("Webhook WhatsApp reçu :", data)  # utile pour debug pendant les tests

        try:
            entry = data['entry'][0]
            changes = entry['changes'][0]
            value = changes['value']

            if 'messages' not in value:
                # Peut être un accusé de lecture ou autre événement, pas un message
                return Response({'status': 'ignored'}, status=200)

            message = value['messages'][0]
            numero_expediteur = message['from']
            texte = message.get('text', {}).get('body', '')

            # Pour l'instant : on log juste. La création automatique de commande
            # viendra une fois qu'on aura défini le format de parsing du texte.
            print(f"Message de {numero_expediteur} : {texte}")

        except (KeyError, IndexError) as e:
            print("Format de webhook inattendu :", e)

        # Meta exige TOUJOURS un 200 rapide, sinon il considère l'envoi en échec et réessaie
        return Response({'status': 'received'}, status=200)