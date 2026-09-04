import requests


def envoyer_message(conversation, texte):
    canal = conversation.canal
    fonctions = {
        canal.Type.WHATSAPP: _envoyer_whatsapp,
        canal.Type.FACEBOOK: _envoyer_messenger,
        canal.Type.INSTAGRAM: _envoyer_instagram,
    }
    fonctions[canal.type](canal, conversation.client_identifiant_externe, texte)


def _envoyer_whatsapp(canal, destinataire, texte):
    url = f"https://graph.facebook.com/v19.0/{canal.identifiant_externe}/messages"
    requests.post(url, headers={"Authorization": f"Bearer {canal.token_acces}"}, json={
        "messaging_product": "whatsapp", "to": destinataire,
        "type": "text", "text": {"body": texte},
    })


def _envoyer_messenger(canal, destinataire, texte):
    requests.post("https://graph.facebook.com/v19.0/me/messages", params={"access_token": canal.token_acces}, json={
        "recipient": {"id": destinataire}, "message": {"text": texte},
    })


def _envoyer_instagram(canal, destinataire, texte):
    requests.post("https://graph.facebook.com/v19.0/me/messages", params={"access_token": canal.token_acces}, json={
        "recipient": {"id": destinataire}, "message": {"text": texte},
    })