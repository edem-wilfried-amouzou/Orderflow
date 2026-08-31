import client from './client'

export const getStats = () => client.get('/dashboard/stats/')
export const getActivite7j = () => client.get('/dashboard/activite-7j/')
export const getFinances = () => client.get('/dashboard/finances/')