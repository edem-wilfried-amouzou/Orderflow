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
    if canal.token_acces.startswith("GREENAPI:"):
        _envoyer_whatsapp_greenapi(canal, destinataire, texte)
    elif canal.token_acces.startswith("TWILIO:"):
        _envoyer_whatsapp_twilio(canal, destinataire, texte)
    else:
        _envoyer_whatsapp_meta(canal, destinataire, texte)


def _envoyer_whatsapp_greenapi(canal, destinataire, texte):
    _, api_token = canal.token_acces.split(":", 1)
    url = f"https://api.green-api.com/waInstance{canal.identifiant_externe}/sendMessage/{api_token}"
    requests.post(url, json={"chatId": f"{destinataire}@c.us", "message": texte})

def _envoyer_whatsapp_meta(canal, destinataire, texte):
    url = f"https://graph.facebook.com/v19.0/{canal.identifiant_externe}/messages"
    requests.post(url, headers={"Authorization": f"Bearer {canal.token_acces}"}, json={
        "messaging_product": "whatsapp", "to": destinataire,
        "type": "text", "text": {"body": texte},
    })


def _envoyer_whatsapp_twilio(canal, destinataire, texte):
    _, account_sid, auth_token = canal.token_acces.split(":", 2)
    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    requests.post(url, auth=(account_sid, auth_token), data={
        "From": f"whatsapp:{canal.identifiant_externe}",
        "To": f"whatsapp:{destinataire}",
        "Body": texte,
    })


def _envoyer_messenger(canal, destinataire, texte):
    requests.post("https://graph.facebook.com/v19.0/me/messages", params={"access_token": canal.token_acces}, json={
        "recipient": {"id": destinataire}, "message": {"text": texte},
    })


def _envoyer_instagram(canal, destinataire, texte):
    requests.post("https://graph.facebook.com/v19.0/me/messages", params={"access_token": canal.token_acces}, json={
        "recipient": {"id": destinataire}, "message": {"text": texte},
    })