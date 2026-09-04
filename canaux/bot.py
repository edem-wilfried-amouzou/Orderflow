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

    conversation, _ = Conversation.objects.get_or_create(
        canal=canal, client_identifiant_externe=identifiant_client,
        defaults={"commercant": canal.commercant},
    )

    gestionnaires = {
        Conversation.Etat.DEBUT: gerer_debut,
        Conversation.Etat.CATALOGUE_ENVOYE: gerer_choix_produit,
        Conversation.Etat.PANIER_EN_COURS: gerer_choix_produit,
        Conversation.Etat.EN_ATTENTE_ADRESSE: gerer_adresse,
        Conversation.Etat.COMMANDE_CREEE: gerer_debut,
    }
    gestionnaires[conversation.etat](conversation, texte)


def gerer_debut(conversation, texte):
    produits = Produit.objects.filter(commercant=conversation.commercant, actif=True)
    if not produits.exists():
        envoyer_message(conversation, f"Bienvenue chez {conversation.commercant.nom_boutique} ! Notre catalogue est en cours de mise à jour, revenez bientôt.")
        return
    lignes = "\n".join(f"{i+1}. {p.nom} — {p.prix} FCFA" for i, p in enumerate(produits))
    envoyer_message(conversation, f"Bienvenue chez {conversation.commercant.nom_boutique} !\n\nNotre catalogue :\n{lignes}\n\nRépondez avec le numéro du produit souhaité.")
    conversation.etat = Conversation.Etat.CATALOGUE_ENVOYE
    conversation.save()


def gerer_choix_produit(conversation, texte):
    texte_normalise = texte.strip().lower()
    if texte_normalise in ("confirmer", "confirmé", "valider"):
        if not conversation.panier.exists():
            envoyer_message(conversation, "Votre panier est vide. Choisissez d'abord un produit.")
            return
        envoyer_message(conversation, "Parfait ! Indiquez votre quartier / adresse de livraison.")
        conversation.etat = Conversation.Etat.EN_ATTENTE_ADRESSE
        conversation.save()
        return

    produits = list(Produit.objects.filter(commercant=conversation.commercant, actif=True))
    try:
        produit = produits[int(texte_normalise) - 1]
    except (ValueError, IndexError):
        envoyer_message(conversation, "Numéro de produit non reconnu. Réessayez, ou tapez 'confirmer' pour valider votre panier.")
        return

    item, cree = PanierItem.objects.get_or_create(conversation=conversation, produit=produit, defaults={"quantite": 1})
    if not cree:
        item.quantite += 1
        item.save()

    conversation.etat = Conversation.Etat.PANIER_EN_COURS
    conversation.save()
    total = sum(i.total for i in conversation.panier.all())
    envoyer_message(conversation, f"{produit.nom} ajouté. Total actuel : {total} FCFA.\nAjoutez un autre produit ou tapez 'confirmer'.")


def gerer_adresse(conversation, texte):
    quartier = texte.strip()

    client, _ = Client.objects.get_or_create(
        commercant=conversation.commercant,
        telephone=conversation.client_identifiant_externe,
        defaults={"nom": "Client " + conversation.canal.get_type_display()},
    )
    conversation.client = client
    conversation.quartier_temp = quartier
    conversation.save()

    adresse = AdresseDigitale.objects.create(client=client, quartier=quartier)

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
        f"Merci ! Votre commande {commande.numero} est enregistrée (paiement à la livraison).\n"
        f"Suivez-la ici : {settings.FRONTEND_URL}/suivi/{commande.numero}",
    )