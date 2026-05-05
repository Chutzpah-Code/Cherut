'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import { Notification } from '@/components/notifications/NotificationCenter';
import { NotificationService } from '@/lib/services/notificationService';
import { Task } from '@/lib/api/services/tasks';
import { Habit, HabitLog } from '@/lib/api/services/habits';
import { Objective } from '@/lib/api/services/objectives';
import { VisionBoardItem } from '@/lib/api/services/vision-board';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

// Reads all cached entries matching a query key prefix, deduplicating by id.
// Skips entries where the second key segment is a known non-list sub-type.
function readCachedList<T extends { id: string }>(
  queryClient: QueryClient,
  prefix: string,
  skipSegments: string[] = [],
): T[] {
  const entries = queryClient.getQueriesData<T[]>({ queryKey: [prefix] });
  const seen = new Set<string>();
  const result: T[] = [];

  for (const [queryKey, data] of entries) {
    const secondSegment = queryKey[1];
    if (typeof secondSegment === 'string' && skipSegments.includes(secondSegment)) continue;
    if (!Array.isArray(data)) continue;
    for (const item of data) {
      if (item?.id && !seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
      }
    }
  }

  return result;
}

export function useNotifications(): UseNotificationsReturn {
  const queryClient = useQueryClient();

  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cherut-dismissed-notifications') || '[]');
    } catch {
      return [];
    }
  });

  // Tracks read state separately so markAsRead doesn't require a re-fetch
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  // Incremented whenever the React Query cache changes, triggering notification recomputation
  const [cacheTick, setCacheTick] = useState(0);

  useEffect(() => {
    localStorage.setItem('cherut-dismissed-notifications', JSON.stringify(dismissed));
  }, [dismissed]);

  // Subscribe to React Query cache updates — only fire when a query successfully loads new data
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'success') {
        setCacheTick((t) => t + 1);
      }
    });
    return unsubscribe;
  }, [queryClient]);

  const notifications = useMemo(() => {
    const tasks = readCachedList<Task>(queryClient, 'tasks', ['kanban', 'archived', 'counts']);
    const habits = readCachedList<Habit>(queryClient, 'habits', ['all', 'archived', 'counts']);
    const objectives = readCachedList<Objective>(queryClient, 'objectives');
    const visionBoardItems = readCachedList<VisionBoardItem>(queryClient, 'vision-board-items');
    const habitLogs = readCachedList<HabitLog>(queryClient, 'habitLogs');

    // Nothing in cache yet — return empty rather than fetch
    if (!tasks.length && !habits.length && !objectives.length && !visionBoardItems.length) {
      return [];
    }

    const generated = NotificationService.generateNotifications({
      tasks,
      habits,
      objectives,
      visionBoardItems,
      habitLogs,
    });

    return generated
      .filter((n) => NotificationService.shouldShowNotification(n, dismissed))
      .map((n) => ({ ...n, read: readIds.has(n.id) }));
  // cacheTick drives reactivity; eslint doesn't see it as a dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, cacheTick, dismissed, readIds]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const deleteNotification = (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      const key = NotificationService.getDismissalKey(notification);
      setDismissed((prev) => [...prev, key]);
    }
  };

  const clearAllNotifications = () => {
    const keys = notifications.map((n) => NotificationService.getDismissalKey(n));
    setDismissed((prev) => [...prev, ...keys]);
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    // Manual notifications aren't derived from cache — store them separately via dismissed state trick
    // (edge case: external callers can push to a local overlay; not needed for current usage)
    void notificationData;
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
  };
}
