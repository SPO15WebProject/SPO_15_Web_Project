import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    axios.get('/api/db/Me', { withCredentials: true })
      .then((res) => { if (!cancelled) setUser(res.data.user) })
      .catch(() => { if (!cancelled) setUser(null) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  // Jos pyynto antaa 401 tarkistetaan onko sessio vanhentunut
  // esim väärä salasana voi antaa 401
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config?.url ?? ''
        if ( // lähetä /Me pyyntö jos
          error.response?.status === 401 && // 401
          !url.endsWith('/Me') && // ei ole /Me pyyntö (rekursio)
          !url.endsWith('/Login') // ei ole login sivu (väärä salasana etc)
        ) {
          axios.get('/api/db/Me', { withCredentials: true }).catch(() => setUser(null)) //tarkistetaan eväste, jos error laitetaan käyttäjä null
        }
        return Promise.reject(error)
      }
    )

    return () => axios.interceptors.response.eject(id)
  }, [])

  const login = useCallback((userData) => {
    setUser({
      userid: userData.userid,
      nickname: userData.nickname,
      email: userData.email
    })
  }, [])

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/db/Logout', {}, { withCredentials: true })
    } catch (error) {
      console.error(error)
    } finally {
      setUser(null)
    }
  }, [])

  // päivittä sivun tiedot esim nimen muuton jälkeen
  const updateUser = useCallback((changes) => {
    setUser((prev) => (prev ? { ...prev, ...changes } : prev))
  }, [])

  const clearUser = useCallback(() => setUser(null), [])

  const value = useMemo(
    () => ({ user, loading, login, logout, updateUser, clearUser }),
    [user, loading, login, logout, updateUser, clearUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}