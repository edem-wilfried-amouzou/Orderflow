import logging
import threading
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification

logger = logging.getLogger(__name__)


def async_task(func):
    """
    Décorateur simple pour exécuter une fonction dans un thread séparé.
    Permet d'éviter de bloquer la réponse HTTP pendant l'envoi d'e-mails.
    """
    def wrapper(*args, **kwargs):
        thread = threading.Thread(target=func, args=args, kwargs=kwargs)
        thread.daemon = True
        thread.start()
    return wrapper


@async_task
def _send_mail_safe(subject, message, recipient_list):
    """
    Fonction utilitaire interne d'envoi d'e-mail sécurisée.
    """
    if not recipient_list or not recipient_list[0]:
        logger.warning(f"Envoi annulé : aucune adresse destinataire valide pour '{subject}'.")
        return

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info(f"Email '{subject}' envoyé avec succès à {recipient_list}")
    except Exception as e:
        logger.error(f"Erreur SMTP lors de l'envoi de '{subject}' à {recipient_list} : {e}")


def envoyer_email_bienvenue(utilisateur):
    role_label = "commerçant" if utilisateur.role == "COMMERCANT" else "livreur"
    subject = "Bienvenue sur OrderFlow 🎉"
    message = (
        f"Bonjour {utilisateur.username},\n\n"
        f"Ton compte {role_label} OrderFlow a bien été créé.\n\n"
        f"— L'équipe OrderFlow"
    )
    _send_mail_safe(subject, message, [utilisateur.email])


def notifier_nouvelle_commande(commande):
    destinataire = commande.commercant.utilisateur
    titre = f"Nouvelle commande de {commande.client.nom}"
    message = f"{commande.client.nom} vient de passer la commande {commande.numero} ({commande.montant_total} FCFA)."
    
    # 1. La notification en base de données reste SYNCHRONE (rapide et sûre)
    Notification.objects.create(
        destinataire=destinataire,
        type=Notification.Type.NOUVELLE_COMMANDE,
        titre=titre,
        message=message,
        commande=commande
    )
    
    # 2. L'envoi de mail passe en ASYNCHRONE
    _send_mail_safe(titre, message, [destinataire.email])


def envoyer_email_changement_statut(commande):
    destinataire = commande.commercant.utilisateur
    statut_str = commande.get_statut_display()
    subject = f"Commande {commande.numero} — {statut_str}"
    message = f"La commande {commande.numero} de {commande.client.nom} est passée au statut : {statut_str}."
    
    _send_mail_safe(subject, message, [destinataire.email])