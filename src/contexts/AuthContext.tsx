import { createContext, useState, useEffect, type ReactNode } from 'react'
import type { AppUser } from '../types'

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
})

// Mock user for development — will be replaced with Firebase Auth + Google SSO
const MOCK_USER: AppUser = {
  uid: 'dev-user',
  email: 'dev@fitlog.app',
  displayName: 'Dev User',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate auth check delay
    const timer = setTimeout(() => {
      setUser(MOCK_USER)
      setLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const signOut = async () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
