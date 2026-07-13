'use client';

import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useState, useLayoutEffect, useRef } from 'react';
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

function AuthAwareMantineProvider({ children }: AuthAwareMantineProviderProps) {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      {children}
    </MantineProvider>
  );
}

function MantineThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthAwareMantineProvider>
      {children}
    </AuthAwareMantineProvider>
  );
}

const CACHE_VERSION = 'v1';
const PERSIST_KEY = `cherut-query-cache-${CACHE_VERSION}`;

// Sits inside AuthProvider + PersistQueryClientProvider.
// useLayoutEffect runs before the browser paints, so the cache is cleared
// in the same render cycle that the new user's state propagates — no stale-data flash.
function CacheSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const prevUid = useRef<string | null | undefined>(undefined);

  useLayoutEffect(() => {
    const uid = user?.uid ?? null;
    if (prevUid.current !== undefined && uid !== prevUid.current) {
      queryClient.clear();
      localStorage.removeItem(PERSIST_KEY);
    }
    prevUid.current = uid;
  }, [user?.uid, queryClient]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchInterval: false,
        refetchIntervalInBackground: false,
        retry: 1,
        retryDelay: 500,
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
        retryDelay: 300,
        networkMode: 'online',
      },
    },
  }));

  const [persister] = useState(() =>
    typeof window !== 'undefined'
      ? createSyncStoragePersister({
          storage: window.localStorage,
          key: `cherut-query-cache-${CACHE_VERSION}`,
        })
      : undefined
  );

  if (!persister) {
    return (
      <MantineThemeProvider>
        <ModalsProvider>
          <Notifications position="top-right" />
          <AuthProvider>
            <CacheSync />
            {children}
          </AuthProvider>
        </ModalsProvider>
      </MantineThemeProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 24 * 60 * 60 * 1000 }}
    >
      <MantineThemeProvider>
        <ModalsProvider>
          <Notifications position="top-right" />
          <AuthProvider>
            <CacheSync />
            {children}
          </AuthProvider>
        </ModalsProvider>
      </MantineThemeProvider>
    </PersistQueryClientProvider>
  );
}