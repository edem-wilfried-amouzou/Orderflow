import client from './client'

export const demanderLivreur = (commandeId) =>
  client.post(`/livraisons/${commandeId}/demander-livreur/`)

export const getFlotte = () => client.get('/livraisons/flotte/')

// Côté livreur
export const getMesMissions = () => client.get('/livraisons/mes-missions/')
export const majStatutMission = (id, data) => client.patch(`/livraisons/${id}/statut/`, data)
export const majPosition = (latitude, longitude) =>
  client.patch('/livraisons/ma-position/', { latitude, longitude })