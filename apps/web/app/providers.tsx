'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { MantineProvider, createTheme, MantineColorsTuple } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

// Custom colors
const blue: MantineColorsTuple = [
  '#e7f5ff',
  '#d0ebff',
  '#a5d8ff',
  '#74c0fc',
  '#4dabf7',
  '#339af0',
  '#228be6',
  '#1c7ed6',
  '#1971c2',
  '#1864ab',
];

const green: MantineColorsTuple = [
  '#ebfbee',
  '#d3f9d8',
  '#b2f2bb',
  '#8ce99a',
  '#69db7c',
  '#51cf66',
  '#40c057',
  '#37b24d',
  '#2f9e44',
  '#2b8a3e',
];

// Trello-inspired theme with light/dark mode support
const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: { light: 6, dark: 7 },
  colors: {
    blue,
    green,
  },
  defaultRadius: 'md',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  white: '#ffffff',
  black: '#000000',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
        withBorder: true,
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
        centered: true,
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    AppShell: {
      defaultProps: {
        padding: 'md',
      },
    },
  },
});

interface AuthAwareMantineProviderProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

function AuthAwareMantineProvider({ children, isAuthenticated = false }: AuthAwareMantineProviderProps) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only load saved theme if user is authenticated
    if (isAuthenticated) {
      const saved = localStorage.getItem('mantine-color-scheme-cherut');
      if (saved === 'light' || saved === 'dark') {
        setColorScheme(saved);
      }
    } else {
      // For public pages, always use light mode
      setColorScheme('light');
    }

    // Listen for storage changes (like when auth context clears the theme)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mantine-color-scheme-cherut') {
        if (e.newValue === null) {
          // Theme was cleared - reset to light
          setColorScheme('light');
        } else if ((e.newValue === 'light' || e.newValue === 'dark') && isAuthenticated) {
          // Only apply saved theme if user is authenticated
          setColorScheme(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      // Only save preference if user is authenticated
      localStorage.setItem('mantine-color-scheme-cherut', colorScheme);
    }
  }, [colorScheme, mounted, isAuthenticated]);

  // Force light mode for unauthenticated users
  const effectiveColorScheme = isAuthenticated ? colorScheme : 'light';

  // During SSR and first render, always use light
  if (!mounted) {
    return (
      <MantineProvider theme={theme} defaultColorScheme="light">
        {children}
      </MantineProvider>
    );
  }

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme={effectiveColorScheme}
    >
      {children}
    </MantineProvider>
  );
}

function MantineThemeProvider({ children }: { children: React.ReactNode }) {
  // We need to get auth state, but AuthProvider is below this in the tree
  // So we'll use a simpler approach: just check localStorage for Firebase auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simple check for any Firebase auth data
    const checkAuthState = () => {
      const hasFirebaseAuth = Object.keys(localStorage).some(key =>
        key.startsWith('firebase:authUser:')
      );
      setIsAuthenticated(hasFirebaseAuth);
    };

    checkAuthState();

    // Listen for auth state changes via storage events
    const handleStorageChange = () => {
      checkAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthAwareMantineProvider isAuthenticated={isAuthenticated}>
      {children}
    </AuthAwareMantineProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 3 * 60 * 1000, // 3 minutes - dados ficam "fresh" por mais tempo
        gcTime: 15 * 60 * 1000, // 15 minutes - cache mais agressivo
        refetchOnWindowFocus: false, // Não refaz query ao focar janela
        refetchOnMount: false, // Usa cache sempre que possível
        refetchOnReconnect: true, // Só refetch se desconectou da rede
        retry: 1, // 1 tentativa apenas
        retryDelay: 500, // Retry rápido
        networkMode: 'online', // Para melhor performance online
      },
      mutations: {
        retry: 1,
        retryDelay: 300,
        networkMode: 'online',
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <MantineThemeProvider>
        <ModalsProvider>
          <Notifications position="top-right" />
          <AuthProvider>
            {children}
          </AuthProvider>
        </ModalsProvider>
      </MantineThemeProvider>
    </QueryClientProvider>
  );
}