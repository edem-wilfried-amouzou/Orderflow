import client from './client'

export const listerNotifications = () => client.get('/notifications/')
export const marquerCommeLue = (id) => client.post(`/notifications/${id}/lu/`)
