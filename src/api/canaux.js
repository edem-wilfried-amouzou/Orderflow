import client from './client'

export const listerCanaux = () => client.get('/canaux/')
export const demarrerConnexion = (type) => client.get(`/canaux/connecter/${type}/`)
export const deconnecterCanal = (id) => client.delete(`/canaux/${id}/`)