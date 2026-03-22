import { createContext, useState, useEffect, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '../lib/firebase'
import type { AppUser } from '../types'

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  authError: string | null
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  authError: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Check for redirect result first
    getRedirectResult(auth)
      .catch((error) => {
        console.error('Redirect result error:', error)
        setAuthError(`Auth error: ${error.code} — ${error.message}`)
      })

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? 'User',
          photoURL: firebaseUser.photoURL ?? undefined,
        }

        // Create/update user document in Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid)
          const userSnap = await getDoc(userRef)
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: appUser.email,
              displayName: appUser.displayName,
              photoURL: appUser.photoURL ?? null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          } else {
            await setDoc(userRef, {
              displayName: appUser.displayName,
              photoURL: appUser.photoURL ?? null,
              updatedAt: new Date().toISOString(),
            }, { merge: true })
          }
        } catch (err) {
          console.error('Error saving user to Firestore:', err)
        }

        setUser(appUser)
        setAuthError(null)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setAuthError(null)
    try {
      await signInWithRedirect(auth, googleProvider)
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      console.error('Google sign-in error:', err)
      setAuthError(`${err.code}: ${err.message}`)
      throw error
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, authError }}>
      {children}
    </AuthContext.Provider>
  )
}
