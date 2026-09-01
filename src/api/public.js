import axios from 'axios'

// Client HTTP séparé de client.js : ces appels sont publics (page de suivi client),
// donc pas besoin/pas question d'y attacher le token JWT du commerçant ou du livreur.
const publicClient = axios.create({ baseURL: import.meta.env.VITE_API_URL })

export const suivreCommande = (numero) => publicClient.get(`/suivi/${numero}/`)