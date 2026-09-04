import client from './client'

export const login = (email, password) =>
  client.post('/auth/login/', { email, password })

export const registerCommercant = (data) =>
  client.post('/auth/register/commercant/', data)

export const registerLivreur = (data) =>
  client.post('/auth/register/livreur/', data)

export const getMe = () => client.get('/auth/me/')

export const updateMe = (data) => client.patch('/auth/me/', data)