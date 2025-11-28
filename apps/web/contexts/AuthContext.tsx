'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, getIdToken } from '@/lib/firebase/auth';
import { loginWithBackend } from '@/lib/api/services/auth';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin';
  subscription?: {
    plan: 'free' | 'core' | 'pro' | 'elite';
    status: 'active' | 'inactive' | 'cancelled';
  };
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  backendAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  backendAuthenticated: false,
  isAdmin: false,
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendAuthenticated, setBackendAuthenticated] = useState(false);

  // Authenticate with backend when Firebase user changes
  const authenticateWithBackend = async (firebaseUser: User) => {
    try {
      console.log('[Auth] Authenticating with backend for user:', firebaseUser.uid);
      console.log('[Auth] Getting Firebase ID token...');

      const token = await getIdToken();
      console.log('[Auth] Firebase token retrieved:', token ? `✅ (${token.length} chars)` : '❌ null');

      if (!token) {
        console.error('[Auth] No Firebase token available');
        setBackendAuthenticated(false);
        setUserData(null);
        return;
      }

      console.log('[Auth] Calling backend login...');
      const loginResponse = await loginWithBackend(token);
      console.log('[Auth] ✅ Backend authentication successful');

      // Buscar dados completos do usuário incluindo role
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let role: 'user' | 'admin' = 'user';

      // Se conseguiu acessar endpoint admin, é admin
      if (userResponse.ok) {
        console.log('[Auth] ✅ User has admin role');
        role = 'admin';
      } else {
        console.log('[Auth] ℹ️ User has regular user role');
      }

      // Construir userData
      const userData: UserData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
        role,
        subscription: {
          plan: 'free', // Default - poderia buscar do backend se necessário
          status: 'active',
        },
      };

      setUserData(userData);
      setBackendAuthenticated(true);

      console.log('[Auth] ✅ User data loaded:', { role, email: userData.email });

    } catch (error) {
      console.error('[Auth] ❌ Backend authentication failed:', error);
      setBackendAuthenticated(false);
      setUserData(null);
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
          setUserData(null);
        }

        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // If Firebase not configured, just set loading to false
      setLoading(false);
    }
  }, []);

  // Calcular isAdmin baseado no userData
  const isAdmin = userData?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      backendAuthenticated,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
