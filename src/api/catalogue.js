import client from './client'

export const listerProduits = (params) => client.get('/catalogue/produits/', { params })
export const creerProduit = (data) => client.post('/catalogue/produits/', data)
export const getProduit = (id) => client.get(`/catalogue/produits/${id}/`)
export const modifierProduit = (id, data) => client.patch(`/catalogue/produits/${id}/`, data)
export const supprimerProduit = (id) => client.delete(`/catalogue/produits/${id}/`)