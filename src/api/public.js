import axios from 'axios'

const publicClient = axios.create({ baseURL: import.meta.env.API_URL })

export const suivreCommande = (numero) => publicClient.get(`/suivi/${numero}/`)