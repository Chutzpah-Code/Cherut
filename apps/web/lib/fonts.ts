import { Geist, Geist_Mono } from 'next/font/google';

// Scoped to the public marketing site + auth pages only (via className on
// their wrapping element) — the dashboard/admin keep their own Mantine/Inter
// stack untouched, since no font is loaded globally in app/layout.tsx.
export const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});
