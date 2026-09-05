from decimal import Decimal
from django.conf import settings
from .models import CanalConnecte, Conversation, PanierItem
from catalogue.models import Produit
from users.models import Client
from commandes.models import Commande, LigneCommande, AdresseDigitale, HistoriqueCommande
from notifications.emails import notifier_nouvelle_commande
from .envoi import envoyer_message


def extraire_identifiant_et_texte(type_canal, entree):
    if type_canal == CanalConnecte.Type.WHATSAPP:
        try:
            value = entree["changes"][0]["value"]
            messages = value.get("messages")
            if not messages:
                return None, None, None
            message = messages[0]
            return value["metadata"]["phone_number_id"], message["from"], message.get("text", {}).get("body")
        except (KeyError, IndexError):
            return None, None, None

    try:
        messaging = entree["messaging"][0]
        return entree["id"], messaging["sender"]["id"], messaging.get("message", {}).get("text")
    except (KeyError, IndexError):
        return None, None, None


def traiter_message_entrant(type_canal, entree):
    identifiant_page, identifiant_client, texte = extraire_identifiant_et_texte(type_canal, entree)
    if not texte:
        return

    try:
        canal = CanalConnecte.objects.get(
            type=type_canal, identifiant_externe=identifiant_page,
            statut_connexion=CanalConnecte.StatutConnexion.CONNECTE,
        )
    except CanalConnecte.DoesNotExist:
        return

    _dispatch(canal, identifiant_client, texte)


def traiter_message_greenapi(payload):
    """Format standard Green API (typeWebhook='incomingMessageReceived')."""
    if payload.get("typeWebhook") != "incomingMessageReceived":
        return

    try:
        expediteur = payload["senderData"]["chatId"].replace("@c.us", "")
        texte = payload["messageData"]["textMessageData"]["textMessage"]
    except KeyError:
        return

    # L'idInstance identifie SANS AMBIGUÏTÉ le compte Green API concerné, donc le bon
    # CanalConnecte — indispensable dès qu'il y a plus d'un commerçant sur Green API.
    id_instance = str(payload.get("instanceData", {}).get("idInstance", "")).strip()
    if not id_instance:
        return

    try:
        canal = CanalConnecte.objects.get(
            type=CanalConnecte.Type.WHATSAPP,
            identifiant_externe=id_instance,
            statut_connexion=CanalConnecte.StatutConnexion.CONNECTE,
        )
    except CanalConnecte.DoesNotExist:
        return

    _dispatch(canal, expediteur, texte)


def _dispatch(canal, identifiant_client, texte):
    conversation, _ = Conversation.objects.get_or_create(
        canal=canal, client_identifiant_externe=identifiant_client,
        defaults={"commercant": canal.commercant},
    )
    gestionnaires = {
        Conversation.Etat.DEBUT: gerer_debut,
        Conversation.Etat.MENU: gerer_menu,
        Conversation.Etat.CATALOGUE: gerer_catalogue,
        Conversation.Etat.COMMANDE_CREEE: gerer_debut,
    }
    gestionnaires.get(conversation.etat, gerer_debut)(conversation, texte)


# --- Helpers d'affichage ---

def _texte_menu():
    return "Que souhaitez-vous faire ?\n\n1. Voir le catalogue\n2. Voir mon panier"


def _texte_catalogue(commercant):
    produits = list(Produit.objects.filter(commercant=commercant, actif=True))
    if not produits:
        return None, produits
    lignes = "\n".join(f"{i+1}. {p.nom} — {p.prix} FCFA" for i, p in enumerate(produits))
    return f"Catalogue :\n{lignes}\n\nRépondez avec le numéro d'un produit pour l'ajouter au panier.\n0. Retour au menu", produits


def _texte_panier(conversation):
    items = list(conversation.panier.all())
    if not items:
        return "Votre panier est vide."
    lignes = "\n".join(f"- {i.produit.nom} x{i.quantite} = {i.total} FCFA" for i in items)
    total = sum(i.total for i in items)
    return f"Votre panier :\n{lignes}\n\nTotal : {total} FCFA\n\nTapez 'confirmer' pour valider la commande, ou 0 pour revenir au menu."


# --- États ---

def gerer_debut(conversation, texte):
    envoyer_message(conversation, f"Bienvenue chez {conversation.commercant.nom_boutique} !\n\n{_texte_menu()}")
    conversation.etat = Conversation.Etat.MENU
    conversation.save()


def gerer_menu(conversation, texte):
    choix = texte.strip().lower()

    if choix == "1":
        message, _ = _texte_catalogue(conversation.commercant)
        if message is None:
            envoyer_message(conversation, "Notre catalogue est en cours de mise à jour, revenez bientôt.")
            return
        envoyer_message(conversation, message)
        conversation.etat = Conversation.Etat.CATALOGUE
        conversation.save()
        return

    if choix == "2":
        envoyer_message(conversation, _texte_panier(conversation))
        return  # reste en MENU, en attente de "confirmer" ou "0"

    if choix in ("confirmer", "confirmé", "valider"):
        if not conversation.panier.exists():
            envoyer_message(conversation, "Votre panier est vide. Tapez 1 pour voir le catalogue.")
            return
        creer_commande_depuis_panier(conversation)
        return

    if choix == "0":
        envoyer_message(conversation, _texte_menu())
        return

    envoyer_message(conversation, "Choix non reconnu.\n\n" + _texte_menu())


def gerer_catalogue(conversation, texte):
    choix = texte.strip().lower()

    if choix == "0":
        envoyer_message(conversation, _texte_menu())
        conversation.etat = Conversation.Etat.MENU
        conversation.save()
        return

    message, produits = _texte_catalogue(conversation.commercant)
    try:
        produit = produits[int(choix) - 1]
    except (ValueError, IndexError):
        envoyer_message(conversation, "Numéro non reconnu.\n\n" + (message or ""))
        return

    item, cree = PanierItem.objects.get_or_create(conversation=conversation, produit=produit, defaults={"quantite": 1})
    if not cree:
        item.quantite += 1
        item.save()

    envoyer_message(conversation, f"{produit.nom} ajouté au panier.\n\n{message}")


def creer_commande_depuis_panier(conversation):
    client, _ = Client.objects.get_or_create(
        commercant=conversation.commercant,
        telephone=conversation.client_identifiant_externe,
        defaults={"nom": "Client " + conversation.canal.get_type_display()},
    )
    conversation.client = client
    conversation.save()

    # AdresseDigitale reste obligatoire au niveau du modèle Commande : on met un placeholder,
    # le parcours livraison n'étant plus utilisé pour l'instant.
    adresse = AdresseDigitale.objects.create(client=client, quartier="Non renseigné")

    commande = Commande.objects.create(
        commercant=conversation.commercant,
        client=client,
        adresse=adresse,
        canal=conversation.canal.type,
        statut=Commande.Statut.NOUVELLE,
    )
    for item in conversation.panier.all():
        LigneCommande.objects.create(
            commande=commande, produit_ref=item.produit, produit=item.produit.nom,
            quantite=item.quantite, prix_unitaire=item.produit.prix,
        )
    HistoriqueCommande.objects.create(
        commande=commande, statut=Commande.Statut.NOUVELLE,
        commentaire=f"Commande créée via bot {conversation.canal.get_type_display()}",
    )

    conversation.commande = commande
    conversation.etat = Conversation.Etat.COMMANDE_CREEE
    conversation.save()

    notifier_nouvelle_commande(commande)

    envoyer_message(
        conversation,
        f"Merci ! Votre commande {commande.numero} est enregistrée.\n"
        f"Suivez-la ici : {settings.FRONTEND_URL}/suivi/{commande.numero}",
    )