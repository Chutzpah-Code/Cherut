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

function MantineThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Carrega a preferência salva
    const saved = localStorage.getItem('mantine-color-scheme-cherut');
    if (saved === 'light' || saved === 'dark') {
      setColorScheme(saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      // Salva a preferência sempre que mudar
      localStorage.setItem('mantine-color-scheme-cherut', colorScheme);
    }
  }, [colorScheme, mounted]);

  // Durante SSR e primeira renderização, sempre usa light
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
      defaultColorScheme={colorScheme}
    >
      {children}
    </MantineProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
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