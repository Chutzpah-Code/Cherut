'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, getIdToken } from '@/lib/firebase/auth';
import { loginWithBackend } from '@/lib/api/services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  backendAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  backendAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendAuthenticated, setBackendAuthenticated] = useState(false);

  // Authenticate with backend when Firebase user changes
  const authenticateWithBackend = async (firebaseUser: User) => {
    try {
      console.log('[Auth] Authenticating with backend for user:', firebaseUser.uid);
      const token = await getIdToken();

      if (!token) {
        console.error('[Auth] No Firebase token available');
        setBackendAuthenticated(false);
        return;
      }

      await loginWithBackend(token);
      console.log('[Auth] Backend authentication successful');
      setBackendAuthenticated(true);
    } catch (error) {
      console.error('[Auth] Backend authentication failed:', error);
      setBackendAuthenticated(false);
    }
  };

  useEffect(() => {
    // Only subscribe if Firebase is configured
    if (typeof subscribeToAuthChanges === 'function') {
      const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
        console.log('[Auth] Firebase user changed:', firebaseUser?.uid);
        setUser(firebaseUser);

        if (firebaseUser) {
          // User signed in - authenticate with backend
          await authenticateWithBackend(firebaseUser);
        } else {
          // User signed out - clear backend auth
          setBackendAuthenticated(false);
        }

        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // If Firebase not configured, just set loading to false
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, backendAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
