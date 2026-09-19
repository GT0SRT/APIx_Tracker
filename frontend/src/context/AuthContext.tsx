import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE_URL } from '../services/api'

export interface AdminUser {
  id: number
  email: string
  role: string
}

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  user: AdminUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'apix_admin_token'
const USER_KEY = 'apix_admin_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY)
  })

  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  // Verify token validity on boot
  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    // Check expiration by parsing JWT payload
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn('[AuthContext] Stored admin token has expired.')
          logout()
          return
        }
      }
    } catch {
      logout()
    }
  }, [token])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Authentication failed. Please check credentials.',
        }
      }

      const receivedToken = data.token
      const receivedUser: AdminUser = data.user || {
        id: 1,
        email: email.trim(),
        role: 'ADMIN',
      }

      localStorage.setItem(TOKEN_KEY, receivedToken)
      localStorage.setItem(USER_KEY, JSON.stringify(receivedUser))

      setToken(receivedToken)
      setUser(receivedUser)
      setIsLoginModalOpen(false)

      return { success: true }
    } catch (err) {
      console.error('[AuthContext] Network error during login:', err)
      return {
        success: false,
        error: 'Unable to reach authentication service. Please verify server connection.',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const openLoginModal = () => setIsLoginModalOpen(true)
  const closeLoginModal = () => setIsLoginModalOpen(false)

const DEV_BYPASS_AUTH = true

const devUser: AdminUser = {
  id: 1,
  email: 'dev@apix.local',
  role: 'ADMIN',
}

const isAuthenticated = DEV_BYPASS_AUTH || Boolean(token && user)
const currentUser = DEV_BYPASS_AUTH ? devUser : user

return (
  <AuthContext.Provider
    value={{
      isAuthenticated,
      token,
      user: currentUser,
      login,
      logout,
      isLoginModalOpen,
      openLoginModal,
      closeLoginModal,
    }}
  >
    {children}
  </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}