'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, getIdToken } from '@/lib/firebase/auth';

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
    // Populate userData from Firebase immediately so the dashboard is never blocked
    const baseUserData: UserData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      role: 'user',
      subscription: { plan: 'free', status: 'active' },
    };
    setUserData(baseUserData);
    setBackendAuthenticated(true);

    // Best-effort: sync with backend and detect admin role
    try {
      const token = await getIdToken();
      if (!token) return;

      // Detect admin role
      const adminCheck = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/health`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (adminCheck.ok) {
        setUserData((prev) => prev ? { ...prev, role: 'admin' } : prev);
      }
    } catch {
      // Backend unreachable — dashboard still works via Firebase Bearer token
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
          // User signed out - clear backend auth and reset theme
          console.log('[Auth] User signed out - clearing theme preferences');
          setBackendAuthenticated(false);
          setUserData(null);

          // Clear theme preference and reset to light mode for public pages
          localStorage.removeItem('mantine-color-scheme-cherut');

          // Force reset to light mode by dispatching a storage event
          // This ensures the theme provider resets immediately
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'mantine-color-scheme-cherut',
              newValue: null,
              oldValue: localStorage.getItem('mantine-color-scheme-cherut'),
            }));
          }
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
