import client from './client'

// Endpoint public — pas de token, la commande est retrouvée uniquement par son numéro.
export const getSuiviCommande = (numero) => client.get(`/suivi/${numero}/`)