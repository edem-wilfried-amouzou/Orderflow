import client from './client'

export const listerCommandes = (params) => client.get('/commandes/', { params })
export const creerCommande = (data) => client.post('/commandes/', data)
export const getCommande = (id) => client.get(`/commandes/${id}/`)
export const getHistoriqueCommande = (id) => client.get(`/commandes/${id}/historique/`)
export const validerCommande = (id) => client.post(`/commandes/${id}/valider/`)
export const annulerCommande = (id) => client.post(`/commandes/${id}/annuler/`)