'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Group, Text, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';

// Deferred-delete pattern: the item disappears from the list immediately
// (via isPending(id)), but the actual delete mutation only fires after a
// grace period — clicking "Undo" in the toast cancels it, so nothing is ever
// sent to the server if the user changes their mind. This is inherently safe
// (no cache rollback needed, unlike a true optimistic mutation) and matches
// FINANCE-SPEC.md §2.9's "a toast with Undo for destructive actions" for the
// module's frequent, row-level deletes (transactions, bill rules/occurrences,
// assets, categories). Account deletion keeps its existing blocking confirm
// dialog — a heavier, rarer action better served by confirm-before than
// undo-after.
//
// A plain setTimeout is killed by a page reload/navigation, which would
// silently cancel a delete the user already committed to (they saw the
// "item deleted" toast and did nothing — that's confirmation, not a change
// of mind). Pending ids are mirrored to sessionStorage so a same-tab reload
// (F5) replays and completes any delete that didn't get to fire yet, instead
// of resurrecting the item.
export function useUndoableDelete<T extends string = string>(
  deleteFn: (id: T) => void,
  opts: { label?: string; delayMs?: number; resource: string },
) {
  const t = useTranslations('finance.common');
  const [pendingIds, setPendingIds] = useState<Set<T>>(new Set());
  const timers = useRef(new Map<T, ReturnType<typeof setTimeout>>());
  const delay = opts?.delayMs ?? 5000;
  const label = opts?.label ?? t('item');
  const storageKey = `finance-pending-delete:${opts.resource}`;

  const readStored = (): T[] => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  };
  const writeStored = (ids: T[]) => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(ids));
    } catch {
      // sessionStorage unavailable (private mode, etc.) — grace-period delete still works
    }
  };

  useEffect(() => {
    for (const id of readStored()) deleteFn(id);
    writeStored([]);
    // Flush once on mount only — deleteFn identity may change across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const undo = useCallback((id: T) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    writeStored(readStored().filter((x) => x !== id));
    notifications.hide(`undo-delete-${id}`);
  }, []);

  const remove = useCallback((id: T) => {
    setPendingIds((prev) => new Set(prev).add(id));
    writeStored([...readStored(), id]);

    const timer = setTimeout(() => {
      timers.current.delete(id);
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      writeStored(readStored().filter((x) => x !== id));
      deleteFn(id);
    }, delay);
    timers.current.set(id, timer);

    notifications.show({
      id: `undo-delete-${id}`,
      autoClose: delay,
      withCloseButton: false,
      color: 'gray',
      message: (
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Text size="sm">{t('itemDeleted', { label })}</Text>
          <Button size="xs" variant="white" onClick={() => undo(id)}>{t('undo')}</Button>
        </Group>
      ),
    });
  }, [deleteFn, delay, label, undo]);

  const isPending = useCallback((id: T) => pendingIds.has(id), [pendingIds]);

  return { remove, undo, isPending };
}
