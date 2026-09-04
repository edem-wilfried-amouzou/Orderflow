from django.core.mail import send_mail
from django.conf import settings
from .models import Notification


def envoyer_email_bienvenue(utilisateur):
    role_label = "commerçant" if utilisateur.role == "COMMERCANT" else "livreur"
    send_mail(
        subject="Bienvenue sur OrderFlow 🎉",
        message=f"Bonjour {utilisateur.username},\n\nTon compte {role_label} OrderFlow a bien été créé.\n\n— L'équipe OrderFlow",
        from_email=settings.DEFAULT_FROM_EMAIL, recipient_list=[utilisateur.email], fail_silently=False,
    )


def notifier_nouvelle_commande(commande):
    destinataire = commande.commercant.utilisateur
    titre = f"Nouvelle commande de {commande.client.nom}"
    message = f"{commande.client.nom} vient de passer la commande {commande.numero} ({commande.montant_total} FCFA)."
    Notification.objects.create(destinataire=destinataire, type=Notification.Type.NOUVELLE_COMMANDE, titre=titre, message=message, commande=commande)
    send_mail(subject=titre, message=message, from_email=settings.DEFAULT_FROM_EMAIL, recipient_list=[destinataire.email], fail_silently=False)


def envoyer_email_changement_statut(commande):
    destinataire = commande.commercant.utilisateur
    send_mail(
        subject=f"Commande {commande.numero} — {commande.get_statut_display()}",
        message=f"La commande {commande.numero} de {commande.client.nom} est passée au statut : {commande.get_statut_display()}.",
        from_email=settings.DEFAULT_FROM_EMAIL, recipient_list=[destinataire.email], fail_silently=False,
    )