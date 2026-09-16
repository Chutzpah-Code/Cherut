'use client';

import { useRef, useState, useCallback } from 'react';
import { Group, Text, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';

// Same deferred-delete pattern used by the Finance module
// (apps/web/app/dashboard/finance/useUndoableDelete.tsx): the row disappears
// from the list immediately (via isPending(id)), but the actual delete
// mutation only fires after a grace period — clicking "Undo" in the toast
// cancels it, so nothing is ever sent to the server if the user changes
// their mind. No cache-rollback logic needed, unlike a true optimistic
// mutation. Duplicated here rather than imported across the finance/
// boundary, matching this codebase's existing precedent of small
// self-contained per-module utilities (e.g. localToday()).
export function useUndoableDelete<T extends string = string>(
  deleteFn: (id: T) => void,
  opts?: { label?: string; delayMs?: number },
) {
  const [pendingIds, setPendingIds] = useState<Set<T>>(new Set());
  const timers = useRef(new Map<T, ReturnType<typeof setTimeout>>());
  const delay = opts?.delayMs ?? 5000;
  const label = opts?.label ?? 'Item';

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
    notifications.hide(`undo-delete-${id}`);
  }, []);

  const remove = useCallback((id: T) => {
    setPendingIds((prev) => new Set(prev).add(id));

    const timer = setTimeout(() => {
      timers.current.delete(id);
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
          <Text size="sm">{label} deleted</Text>
          <Button size="xs" variant="white" onClick={() => undo(id)}>Undo</Button>
        </Group>
      ),
    });
  }, [deleteFn, delay, label, undo]);

  const isPending = useCallback((id: T) => pendingIds.has(id), [pendingIds]);

  return { remove, undo, isPending };
}
