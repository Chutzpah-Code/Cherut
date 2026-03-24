'use client';

import { useMantineTheme, useComputedColorScheme } from '@mantine/core';

export function useThemeColors() {
  const theme = useMantineTheme();
  // Force light mode for now
  const computedColorScheme = 'light';
  const isDark = false;

  const semanticColors = theme.other?.semanticColors || {};

  // Helper function to get color based on current theme (always light)
  const getColor = (colorKey: keyof typeof semanticColors) => {
    const color = semanticColors[colorKey];
    if (!color) return '#0F172A'; // fallback to light text
    return typeof color === 'object' ? color.light : color;
  };

  // Helper function for text colors (always light mode)
  const getText = (variant: 'primary' | 'secondary' | 'tertiary' | 'muted' = 'primary') => {
    const textColors = semanticColors.text;
    if (!textColors || typeof textColors !== 'object') {
      return '#0F172A';
    }
    const color = textColors[variant];
    return typeof color === 'object' ? color.light : '#0F172A';
  };

  return {
    // Current theme info
    isDark,
    colorScheme: computedColorScheme,

    // Colors
    primary: getColor('primary'),
    background: getColor('background'),
    surface: getColor('surface'),
    surfaceElevated: getColor('surfaceElevated'),
    border: getColor('border'),
    borderSubtle: getColor('borderSubtle'),
    hover: getColor('hover'),
    active: getColor('active'),

    // Text colors
    text: {
      primary: getText('primary'),
      secondary: getText('secondary'),
      tertiary: getText('tertiary'),
      muted: getText('muted'),
    },

    // Helper function
    getColor,
    getText,

    // CSS custom properties for inline styles (light mode only)
    css: {
      background: 'var(--mantine-color-white)',
      surface: 'var(--mantine-color-gray-0)',
      text: 'var(--mantine-color-dark-9)',
    }
  };
}

// Type definitions for better TypeScript support
export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  hover: string;
  active: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
}