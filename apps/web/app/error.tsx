'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Root error boundary — catches any otherwise-uncaught render-time exception
// anywhere in the app (no segment previously had one, so a single bad render
// — e.g. an unguarded array access on legacy data — took down the whole
// page with no fallback). Must stay a plain Client Component: error.tsx
// can't be async, so it can't call next-intl's server-side getMessages()
// like not-found.tsx does — kept deliberately simple and English-only.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Something went wrong</h1>
      <p style={{ color: '#6B7280', margin: 0, maxWidth: 420 }}>
        This page hit an unexpected error. You can try again, or head back home.
      </p>
      {/* TEMPORARY: surfaces the raw error for live debugging of the
          admin/courses crash — revert to just the message above once
          that's root-caused, this shouldn't ship long-term. */}
      <details style={{ textAlign: 'left', maxWidth: 640, width: '100%' }} open>
        <summary style={{ cursor: 'pointer', color: '#6B7280', fontSize: 13 }}>Details</summary>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#F3F4F6',
            padding: 12,
            borderRadius: 8,
            fontSize: 12,
            marginTop: 8,
          }}
        >
          {error.name}: {error.message}
          {error.digest ? `\ndigest: ${error.digest}` : ''}
          {error.stack ? `\n\n${error.stack}` : ''}
        </pre>
      </details>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #E2E8F0',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#14141C',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
