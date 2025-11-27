import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest } from '../utils/apiClient'

type TokenBundle = {
  accessToken: string
  refreshToken?: string
}

type AdminUser = {
  id: number
  username: string
  role: string
  email?: string
}

type AdminAuthContextValue = {
  user: AdminUser | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  error?: string
}

const STORAGE_KEY = 'adminAuth'

const readStoredAuth = (): TokenBundle | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as TokenBundle
  } catch {
    return null
  }
}

const persistTokens = (tokens: TokenBundle | null) => {
  if (typeof window === 'undefined') return
  if (tokens) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  else window.localStorage.removeItem(STORAGE_KEY)
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const storedTokens = readStoredAuth()
  const [tokenBundle, setTokenBundle] = useState<TokenBundle | null>(storedTokens)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const fetchProfile = useCallback(
    async (bundle: TokenBundle | null) => {
      if (!bundle?.accessToken) {
        setUser(null)
        return
      }
      try {
        const profile = await apiRequest<AdminUser>('/auth/me', { token: bundle.accessToken })
        setUser(profile)
      } catch (err) {
        console.error('Failed to fetch admin profile', err)
        setUser(null)
        setTokenBundle(null)
        persistTokens(null)
      }
    },
    [setUser],
  )

  useEffect(() => {
    void fetchProfile(tokenBundle)
  }, [tokenBundle, fetchProfile])

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    setError(undefined)
    try {
      console.log('[admin-login] attempt', { username })
      const response = await apiRequest<{
        access_token: string
        refresh_token?: string
        user: AdminUser
      }>('/auth/login', {
        method: 'POST',
        body: { username, password },
      })
      console.log('[admin-login] success', { user: response.user })
      const bundle: TokenBundle = { accessToken: response.access_token, refreshToken: response.refresh_token }
      setTokenBundle(bundle)
      persistTokens(bundle)
      setUser(response.user)
    } catch (err) {
      console.error('[admin-login] failed', err)
      setError((err as { message?: string }).message ?? 'Login gagal')
      setUser(null)
      setTokenBundle(null)
      persistTokens(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    if (tokenBundle?.refreshToken) {
      try {
        await apiRequest('/auth/logout', { method: 'POST', token: tokenBundle.accessToken, body: { refresh_token: tokenBundle.refreshToken } })
      } catch (err) {
        console.warn('Logout request failed, clearing local tokens anyway', err)
      }
    }
    setUser(null)
    setTokenBundle(null)
    persistTokens(null)
  }, [tokenBundle])

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      token: tokenBundle?.accessToken ?? null,
      login,
      logout,
      loading,
      error,
    }),
    [user, tokenBundle?.accessToken, login, logout, loading, error],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
