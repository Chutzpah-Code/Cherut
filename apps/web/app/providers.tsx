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

// Semantic color tokens for professional dark mode
const surface: MantineColorsTuple = [
  '#FFFFFF',
  '#FAFBFF',
  '#F4F6FA',
  '#F8FAFC',
  '#F1F5F9',
  '#E2E8F0',
  '#CBD5E1',
  '#94A3B8',
  '#64748B',
  '#475569',
];

const textColors: MantineColorsTuple = [
  '#F8FAFC',
  '#F1F5F9',
  '#E2E8F0',
  '#CBD5E1',
  '#94A3B8',
  '#64748B',
  '#475569',
  '#334155',
  '#1E293B',
  '#0F172A',
];

const brand: MantineColorsTuple = [
  '#EBF4FF',
  '#C3DAFE',
  '#A3BFFA',
  '#7C93F0',
  '#5A67E6',
  '#4338CA',
  '#3730A3',
  '#312E81',
  '#1E1B4B',
  '#0F0F23',
];

// Professional theme with comprehensive dark mode support
const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: { light: 6, dark: 7 },
  colors: {
    blue,
    green,
    brand,
    surface,
    text: textColors,
  },
  defaultRadius: 'md',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  white: '#ffffff',
  black: '#000000',
  other: {
    // Semantic colors that adapt to light/dark mode
    semanticColors: {
      primary: {
        light: '#4686FE',
        dark: '#5A67E6'
      },
      background: {
        light: '#FFFFFF',
        dark: '#0F172A'
      },
      surface: {
        light: '#FAFBFF',
        dark: '#1E293B'
      },
      surfaceElevated: {
        light: '#FFFFFF',
        dark: '#334155'
      },
      border: {
        light: '#E2E8F0',
        dark: '#475569'
      },
      borderSubtle: {
        light: '#CCCCCC',
        dark: '#64748B'
      },
      text: {
        primary: {
          light: '#0F172A',
          dark: '#F8FAFC'
        },
        secondary: {
          light: '#64748B',
          dark: '#CBD5E1'
        },
        tertiary: {
          light: '#94A3B8',
          dark: '#94A3B8'
        },
        muted: {
          light: '#666666',
          dark: '#94A3B8'
        }
      },
      hover: {
        light: 'rgba(70, 134, 254, 0.04)',
        dark: 'rgba(148, 163, 184, 0.08)'
      },
      active: {
        light: 'rgba(70, 134, 254, 0.08)',
        dark: 'rgba(148, 163, 184, 0.12)'
      }
    }
  },
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
  // Force light mode for now - dark mode coming soon
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Always force light mode for now
    setColorScheme('light');
    localStorage.setItem('mantine-color-scheme-cherut', 'light');
  }, []);

  // Always use light mode
  const effectiveColorScheme = 'light';

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
        staleTime: 10 * 60 * 1000, // 10 minutes - dados ficam "fresh" muito mais tempo
        gcTime: 30 * 60 * 1000, // 30 minutes - cache bem agressivo
        refetchOnWindowFocus: false, // Não refaz query ao focar janela
        refetchOnMount: false, // Usa cache sempre que possível
        refetchOnReconnect: false, // Não refetch automaticamente na reconexão
        refetchInterval: false, // Nunca refetch automaticamente
        refetchIntervalInBackground: false, // Nunca refetch no background
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