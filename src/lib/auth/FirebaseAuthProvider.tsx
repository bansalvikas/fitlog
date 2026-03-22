/**
 * Reusable Firebase Auth Provider
 *
 * Drop this into any React + Firebase project for instant Google SSO.
 *
 * Usage:
 *   import { FirebaseAuthProvider, useFirebaseAuth } from './lib/auth'
 *
 *   // Wrap your app:
 *   <FirebaseAuthProvider auth={auth} firestore={db}>
 *     <App />
 *   </FirebaseAuthProvider>
 *
 *   // Use in components:
 *   const { user, signInWithGoogle, signOut, loading } = useFirebaseAuth()
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  type Firestore,
} from 'firebase/firestore'

// ── Types ─────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string
  email: string
  displayName: string
  photoURL?: string
}

interface FirebaseAuthContextValue {
  user: AuthUser | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

// ── Context ───────────────────────────────────────────────────────

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────

interface FirebaseAuthProviderProps {
  auth: Auth
  firestore?: Firestore          // Optional: if provided, syncs user profile to Firestore
  userCollection?: string         // Firestore collection name (default: "users")
  children: ReactNode
}

export function FirebaseAuthProvider({
  auth,
  firestore,
  userCollection = 'users',
  children,
}: FirebaseAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const appUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email ?? '',
          displayName: fbUser.displayName ?? 'User',
          photoURL: fbUser.photoURL ?? undefined,
        }

        // Sync to Firestore if configured
        if (firestore) {
          try {
            const userRef = doc(firestore, userCollection, fbUser.uid)
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
              await setDoc(
                userRef,
                {
                  displayName: appUser.displayName,
                  photoURL: appUser.photoURL ?? null,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              )
            }
          } catch (err) {
            console.error('[FirebaseAuth] Error syncing user to Firestore:', err)
          }
        }

        setFirebaseUser(fbUser)
        setUser(appUser)
        setError(null)
      } else {
        setFirebaseUser(null)
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, firestore, userCollection])

  // Google sign-in via popup
  const signInWithGoogle = useCallback(async () => {
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string }
      // Silently ignore user-cancelled popups
      if (firebaseErr.code === 'auth/popup-closed-by-user') return
      if (firebaseErr.code === 'auth/cancelled-popup-request') return
      console.error('[FirebaseAuth] Sign-in error:', firebaseErr)
      setError(firebaseErr.message ?? 'Sign-in failed')
    }
  }, [auth])

  // Sign out
  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setFirebaseUser(null)
  }, [auth])

  return (
    <FirebaseAuthContext.Provider
      value={{ user, firebaseUser, loading, error, signInWithGoogle, signOut }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────

export function useFirebaseAuth() {
  const ctx = useContext(FirebaseAuthContext)
  if (!ctx) {
    throw new Error('useFirebaseAuth must be used within <FirebaseAuthProvider>')
  }
  return ctx
}
