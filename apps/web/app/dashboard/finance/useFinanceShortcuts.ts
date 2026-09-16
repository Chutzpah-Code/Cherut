'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAddPanel } from './add-panel-context';

// `A` opens the Add panel (transaction, create mode); `/` focuses the
// Transactions search field on the Money page. `Esc` is already handled by
// Mantine's Drawer itself. Row arrow-key navigation is intentionally out of
// scope — this module has no single "focused row" model to hook into yet.
export function useFinanceShortcuts() {
  const pathname = usePathname();
  const { openCreate } = useAddPanel();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping = !!target && (
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      );
      if (isTyping) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        openCreate('transaction');
        return;
      }

      if (e.key === '/' && pathname === '/dashboard/finance') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-finance-search]')?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname, openCreate]);
}
