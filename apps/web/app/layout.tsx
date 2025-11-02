import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Cherut - Master Your Life System',
  description: 'Premium personal excellence platform for systematic self-mastery',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Script src="/debug-logger.js" strategy="beforeInteractive" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
