import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // true kunnes palvelin on vastannut, ettei navbar vilku "Kirjaudu"-tilassa
  const [loading, setLoading] = useState(true)

  // Kysytään palvelimelta kuka on kirjautunut (httpOnly-eväste lähtee automaattisesti)
  useEffect(() => {
    let cancelled = false

    axios.get('/api/db/Me', { withCredentials: true })
      .then((res) => { if (!cancelled) setUser(res.data.user) })
      .catch(() => { if (!cancelled) setUser(null) }) // 401 = ei voimassa olevaa evästettä
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  // Jos jokin axios-pyyntö saa 401:n, tarkistetaan /Me:llä onko sessio oikeasti vanhentunut.
  // (401 voi tulla myös väärästä salasanasta, jolloin käyttäjää ei kuulu kirjata ulos.)
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config?.url ?? ''
        if (
          error.response?.status === 401 &&
          !url.endsWith('/Me') &&
          !url.endsWith('/Login')
        ) {
          axios.get('/api/db/Me', { withCredentials: true }).catch(() => setUser(null))
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

  // Päivittää osan käyttäjän tiedoista (esim. nimimerkki tilisivulla)
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}