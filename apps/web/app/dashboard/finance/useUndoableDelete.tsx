'use client';

import { useRef, useState, useCallback } from 'react';
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
