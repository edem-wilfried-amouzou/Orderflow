import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setChargement(false)
      return
    }
    authApi
      .getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.clear()
      })
      .finally(() => setChargement(false))
  }, [])

  async function login(email, password) {
    const res = await authApi.login(email, password)
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    localStorage.setItem('role', res.data.role)
    const me = await authApi.getMe()
    setUser(me.data)
    return me.data
  }

  async function registerCommercant(data) {
    const res = await authApi.registerCommercant(data)
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    localStorage.setItem('role', res.data.role)
    const me = await authApi.getMe()
    setUser(me.data)
    return me.data
  }

  async function registerLivreur(data) {
    const res = await authApi.registerLivreur(data)
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    localStorage.setItem('role', res.data.role)
    const me = await authApi.getMe()
    setUser(me.data)
    return me.data
  }

  function logout() {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, chargement, login, registerCommercant, registerLivreur, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)