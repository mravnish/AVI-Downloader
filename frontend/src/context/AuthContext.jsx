import { createContext, useContext, useState, useEffect, useRef } from 'react'

const AuthCtx = createContext({
  user: null, token: null, loading: false,
  sendOtp: () => {}, verifyOtp: () => {}, resendOtp: () => {},
  login: () => {}, logout: () => {},
  updateProfile: () => {}, countDownload: () => {},
})

// const API = '/api/auth'
const API = (import.meta.env.VITE_API_URL || '/api') + '/auth'

async function apiFetch(url, options = {}) {
  const res  = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  return { ok: res.ok, status: res.status, ...data }
}

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
  } catch { return null }
}

function isTokenExpired(token) {
  const d = decodeJwt(token)
  if (!d?.exp) return false
  return Date.now() / 1000 > d.exp
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('avi-jwt')
    if (t && isTokenExpired(t)) { localStorage.removeItem('avi-jwt'); return null }
    return t || null
  })

  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('avi-user'); return s ? JSON.parse(s) : null }
    catch { return null }
  })

  const [loading, setLoading] = useState(false)
  const verifiedRef = useRef(false)

  useEffect(() => {
    if (!token || verifiedRef.current) return
    verifiedRef.current = true
    apiFetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.success && res.user) {
          setUser(res.user)
          localStorage.setItem('avi-user', JSON.stringify(res.user))
        } else if (res.status === 401) {
          clearSession()
        }
      })
      .catch(() => {})
  }, [])

  const clearSession = () => {
    setUser(null); setToken(null)
    localStorage.removeItem('avi-jwt')
    localStorage.removeItem('avi-user')
  }

  const saveSession = (tok, usr) => {
    setToken(tok); setUser(usr)
    localStorage.setItem('avi-jwt', tok)
    localStorage.setItem('avi-user', JSON.stringify(usr))
  }

  const sendOtp = async ({ name, email, password }) => {
    setLoading(true)
    try {
      return await apiFetch(`${API}/send-otp`, { method:'POST', body: JSON.stringify({ name, email, password }) })
    } catch { return { success: false, error: 'Network error. Is the backend running?' } }
    finally { setLoading(false) }
  }

  const verifyOtp = async ({ email, otp }) => {
    setLoading(true)
    try {
      const res = await apiFetch(`${API}/verify-otp`, { method:'POST', body: JSON.stringify({ email, otp }) })
      if (res.success) saveSession(res.token, res.user)
      return res
    } catch { return { success: false, error: 'Network error. Is the backend running?' } }
    finally { setLoading(false) }
  }

  const resendOtp = async ({ email }) => {
    setLoading(true)
    try {
      return await apiFetch(`${API}/resend-otp`, { method:'POST', body: JSON.stringify({ email }) })
    } catch { return { success: false, error: 'Network error.' } }
    finally { setLoading(false) }
  }

  const login = async ({ email, password }) => {
    setLoading(true)
    try {
      const res = await apiFetch(`${API}/login`, { method:'POST', body: JSON.stringify({ email, password }) })
      if (res.success) saveSession(res.token, res.user)
      return res
    } catch { return { success: false, error: 'Network error. Make sure the backend is running.' } }
    finally { setLoading(false) }
  }

  const logout = () => clearSession()

  const updateProfile = async (updates) => {
    if (!token) return { success: false }
    try {
      const res = await apiFetch(`${API}/profile`, {
        method:'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(updates)
      })
      if (res.success) { setUser(res.user); localStorage.setItem('avi-user', JSON.stringify(res.user)) }
      return res
    } catch { return { success: false, error: 'Network error.' } }
  }

  const countDownload = async () => {
    if (!token) return
    apiFetch(`${API}/count-download`, { method:'POST', headers: { Authorization: `Bearer ${token}` } }).catch(()=>{})
  }

  return (
    <AuthCtx.Provider value={{ user, token, loading, sendOtp, verifyOtp, resendOtp, login, logout, updateProfile, countDownload }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
