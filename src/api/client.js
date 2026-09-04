import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const client = axios.create({
  baseURL: API_URL,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshEnCours = null

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requeteOriginale = error.config

    if (error.response?.status === 401 && !requeteOriginale._retry) {
      requeteOriginale._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        deconnecterEtRediriger()
        return Promise.reject(error)
      }

      try {
        if (!refreshEnCours) {
          refreshEnCours = axios
            .post(`${API_URL}/auth/refresh/`, { refresh: refreshToken })
            .then((res) => {
              localStorage.setItem('access_token', res.data.access)
              return res.data.access
            })
            .finally(() => {
              refreshEnCours = null
            })
        }

        const nouveauToken = await refreshEnCours
        requeteOriginale.headers.Authorization = `Bearer ${nouveauToken}`
        return client(requeteOriginale)
      } catch (refreshError) {
        deconnecterEtRediriger()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

function deconnecterEtRediriger() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('role')
  window.location.href = '/login'
}

export default client