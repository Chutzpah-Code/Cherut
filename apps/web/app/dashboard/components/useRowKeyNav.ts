'use client';

import { useRef } from 'react';

// Arrow-key navigation between a panel's focusable rows, per
// DASHBOARD-SPEC.md §3.6 ("arrow keys move between rows"). Attach
// `containerRef` to the list wrapper and `data-row-nav` to each row's
// focusable element (the one that should receive focus when navigated to).
export function useRowKeyNav<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const container = containerRef.current;
    if (!container) return;

    const rows = Array.from(container.querySelectorAll<HTMLElement>('[data-row-nav]'));
    if (rows.length === 0) return;

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = active ? rows.indexOf(active) : -1;

    let nextIndex: number;
    if (currentIndex === -1) {
      nextIndex = 0;
    } else if (e.key === 'ArrowDown') {
      nextIndex = Math.min(currentIndex + 1, rows.length - 1);
    } else {
      nextIndex = Math.max(currentIndex - 1, 0);
    }

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      rows[nextIndex]?.focus();
    }
  };

  return { containerRef, onKeyDown };
}
