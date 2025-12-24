'use client';

import { useState, useEffect, useMemo } from 'react';
import { Notification } from '@/components/notifications/NotificationCenter';
import { NotificationService } from '@/lib/services/notificationService';
import { tasksApi } from '@/lib/api/services/tasks';
import { habitsApi } from '@/lib/api/services/habits';
import { objectivesApi } from '@/lib/api/services/objectives';
import { visionBoardApi } from '@/lib/api/services/vision-board';
import { profileApi } from '@/lib/api/services/profile';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  // Load dismissed notifications from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('cherut-dismissed-notifications');
    if (dismissed) {
      try {
        setDismissedNotifications(JSON.parse(dismissed));
      } catch {
        setDismissedNotifications([]);
      }
    }
  }, []);

  // Save dismissed notifications to localStorage
  useEffect(() => {
    localStorage.setItem('cherut-dismissed-notifications', JSON.stringify(dismissedNotifications));
  }, [dismissedNotifications]);

  // Fetch and generate notifications from real activity data
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // First check if notifications are enabled in user profile
      const profile = await profileApi.get();
      const notificationsEnabled = profile.preferences?.notifications === true;

      if (!notificationsEnabled) {
        setNotifications([]);
        return;
      }

      // Fetch activity data from APIs
      const [tasks, habits, objectives, visionBoardItems] = await Promise.all([
        tasksApi.getAll(),
        habitsApi.getAll(),
        objectivesApi.getAll(),
        visionBoardApi.getAll(),
      ]);

      // Get today's habit logs
      const today = new Date().toISOString().split('T')[0];
      const habitLogs = await Promise.all(
        habits.map(habit => habitsApi.getHabitLogs(habit.id, today, today))
      ).then(results => results.flat());

      const activityData = {
        tasks,
        habits,
        objectives,
        visionBoardItems,
        habitLogs,
      };

      // Generate notifications based on activity data
      const generatedNotifications = NotificationService.generateNotifications(activityData);

      // Filter out dismissed notifications
      const filteredNotifications = generatedNotifications.filter(notification =>
        NotificationService.shouldShowNotification(notification, dismissedNotifications)
      );

      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to empty notifications on error
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    // Add to dismissed notifications to prevent re-showing
    const dismissalKey = NotificationService.getDismissalKey(
      notifications.find(n => n.id === id) || { id, createdAt: new Date().toISOString() } as Notification
    );
    setDismissedNotifications(prev => [...prev, dismissalKey]);

    // Remove from current notifications
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    // Add all current notifications to dismissed list
    const dismissalKeys = notifications.map(notification =>
      NotificationService.getDismissalKey(notification)
    );
    setDismissedNotifications(prev => [...prev, ...dismissalKeys]);

    // Clear current notifications
    setNotifications([]);
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  // Sort notifications by creation date (newest first)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

  return {
    notifications: sortedNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
  };
}

