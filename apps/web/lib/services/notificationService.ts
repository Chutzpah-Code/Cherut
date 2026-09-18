'use client';

import { Task } from '@/lib/api/services/tasks';
import { Habit, HabitLog } from '@/lib/api/services/habits';
import { Objective } from '@/lib/api/services/objectives';
import { VisionBoardItem } from '@/lib/api/services/vision-board';
import { Notification } from '@/components/notifications/NotificationCenter';

export interface ActivityData {
  tasks: Task[];
  habits: Habit[];
  objectives: Objective[];
  visionBoardItems: VisionBoardItem[];
  habitLogs?: HabitLog[];
}

type Translate = (key: string, values?: Record<string, string | number>) => string;

export class NotificationService {

  static generateNotifications(activityData: ActivityData, t: Translate): Notification[] {
    const notifications: Notification[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate task notifications
    notifications.push(...this.generateTaskNotifications(activityData.tasks, today, t));

    // Generate habit notifications
    notifications.push(...this.generateHabitNotifications(activityData.habits, activityData.habitLogs || [], today, t));

    // Generate objective notifications
    notifications.push(...this.generateObjectiveNotifications(activityData.objectives, today, t));

    // Generate vision board notifications
    notifications.push(...this.generateVisionBoardNotifications(activityData.visionBoardItems, today, t));

    // Sort by priority and creation time (newest first)
    return notifications.sort((a, b) => {
      const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const aPriority = this.getNotificationPriority(a);
      const bPriority = this.getNotificationPriority(b);

      if (aPriority !== bPriority) {
        return (priorityOrder[bPriority] || 0) - (priorityOrder[aPriority] || 0);
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  private static generateTaskNotifications(tasks: Task[], today: Date, t: Translate): Notification[] {
    const notifications: Notification[] = [];

    tasks.forEach(task => {
      if (!task.isActive || task.archived || task.status === 'done') return;

      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      if (!dueDate) return;

      dueDate.setHours(0, 0, 0, 0);
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Overdue tasks
      if (daysDiff < 0) {
        notifications.push({
          id: `task-overdue-${task.id}`,
          title: t('taskOverdueTitle'),
          message: t('taskOverdueMsg', { title: task.title, count: Math.abs(daysDiff) }),
          type: 'task',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/tasks`,
        });
      }
      // Due today
      else if (daysDiff === 0) {
        notifications.push({
          id: `task-due-today-${task.id}`,
          title: t('taskDueTodayTitle'),
          message: t('taskDueTodayMsg', { title: task.title }),
          type: 'task',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/tasks`,
        });
      }
      // Due tomorrow (reminder)
      else if (daysDiff === 1) {
        notifications.push({
          id: `task-due-tomorrow-${task.id}`,
          title: t('taskDueTomorrowTitle'),
          message: t('taskDueTomorrowMsg', { title: task.title }),
          type: 'task',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/tasks`,
        });
      }
    });

    return notifications;
  }

  private static generateHabitNotifications(habits: Habit[], habitLogs: HabitLog[], today: Date, t: Translate): Notification[] {
    const notifications: Notification[] = [];
    const todayStr = today.toISOString().split('T')[0];

    habits.forEach(habit => {
      if (!habit.isActive) return;

      // Check if habit was completed today
      const todayLog = habitLogs.find(log =>
        log.habitId === habit.id &&
        log.date === todayStr &&
        log.completed
      );

      // Daily habits not completed today
      if (habit.frequency === 'daily' && !todayLog) {
        // Check if it's time for reminder (if reminderTime is set)
        let shouldNotify = true;
        if (habit.reminderTime) {
          const [hours, minutes] = habit.reminderTime.split(':');
          const reminderTime = new Date(today);
          reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          const now = new Date();

          // Only notify if current time is after reminder time
          shouldNotify = now >= reminderTime;
        }

        if (shouldNotify) {
          notifications.push({
            id: `habit-daily-${habit.id}`,
            title: t('habitDailyTitle'),
            message: t('habitDailyMsg', { title: habit.title }),
            type: 'habit',
            read: false,
            createdAt: new Date().toISOString(),
            actionUrl: `/dashboard/habits`,
          });
        }
      }

      // Weekly habits
      if (habit.frequency === 'weekly' && habit.weekDays && habit.weekDays.length > 0) {
        const currentDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

        if (habit.weekDays.includes(currentDayOfWeek) && !todayLog) {
          notifications.push({
            id: `habit-weekly-${habit.id}`,
            title: t('habitWeeklyTitle'),
            message: t('habitWeeklyMsg', { title: habit.title }),
            type: 'habit',
            read: false,
            createdAt: new Date().toISOString(),
            actionUrl: `/dashboard/habits`,
          });
        }
      }

      // Streak milestones (celebrate streaks of 7, 14, 30, 60, 90, 365 days)
      const milestones = [7, 14, 30, 60, 90, 365];
      if (milestones.includes(habit.streak) && todayLog) {
        notifications.push({
          id: `habit-streak-${habit.id}`,
          title: t('habitStreakTitle'),
          message: t('habitStreakMsg', { title: habit.title, count: habit.streak }),
          type: 'achievement',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/habits`,
        });
      }
    });

    return notifications;
  }

  private static generateObjectiveNotifications(objectives: Objective[], today: Date, t: Translate): Notification[] {
    const notifications: Notification[] = [];

    objectives.forEach(objective => {
      if (!objective.isActive || objective.isArchived || objective.status === 'completed') return;

      const endDate = new Date(objective.endDate);
      endDate.setHours(0, 0, 0, 0);
      const timeDiff = endDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Overdue objectives
      if (daysDiff < 0) {
        notifications.push({
          id: `objective-overdue-${objective.id}`,
          title: t('objectiveOverdueTitle'),
          message: t('objectiveOverdueMsg', { title: objective.title, count: Math.abs(daysDiff) }),
          type: 'objective',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/objectives`,
        });
      }
      // Approaching deadline (7 days or less)
      else if (daysDiff <= 7 && daysDiff > 0) {
        notifications.push({
          id: `objective-deadline-${objective.id}`,
          title: t('objectiveDeadlineTitle'),
          message: t('objectiveDeadlineMsg', { title: objective.title, count: daysDiff }),
          type: 'objective',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/objectives`,
        });
      }

      // Low progress alert (less than 25% with more than 50% time passed)
      const startDate = new Date(objective.startDate);
      startDate.setHours(0, 0, 0, 0);
      const totalDuration = endDate.getTime() - startDate.getTime();
      const timeElapsed = today.getTime() - startDate.getTime();
      const timeProgress = timeElapsed / totalDuration;

      if (timeProgress > 0.5 && objective.progress < 25) {
        notifications.push({
          id: `objective-low-progress-${objective.id}`,
          title: t('objectiveLowProgressTitle'),
          message: t('objectiveLowProgressMsg', { title: objective.title, progress: objective.progress, remaining: Math.round((1 - timeProgress) * 100) }),
          type: 'system',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/objectives`,
        });
      }
    });

    return notifications;
  }

  private static generateVisionBoardNotifications(visionBoardItems: VisionBoardItem[], today: Date, t: Translate): Notification[] {
    const notifications: Notification[] = [];

    visionBoardItems.forEach(item => {
      if (!item.dueDate) return; // Skip items without due dates

      const dueDate = new Date(item.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Overdue vision board items
      if (daysDiff < 0) {
        notifications.push({
          id: `vision-board-overdue-${item.id}`,
          title: t('visionOverdueTitle'),
          message: t('visionOverdueMsg', { title: item.title, count: Math.abs(daysDiff) }),
          type: 'system',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/vision-board`,
        });
      }
      // Due today
      else if (daysDiff === 0) {
        notifications.push({
          id: `vision-board-due-today-${item.id}`,
          title: t('visionDueTodayTitle'),
          message: t('visionDueTodayMsg', { title: item.title }),
          type: 'achievement',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/vision-board`,
        });
      }
      // Due tomorrow
      else if (daysDiff === 1) {
        notifications.push({
          id: `vision-board-due-tomorrow-${item.id}`,
          title: t('visionDueTomorrowTitle'),
          message: t('visionDueTomorrowMsg', { title: item.title }),
          type: 'achievement',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/vision-board`,
        });
      }
      // Approaching deadline (7 days or less)
      else if (daysDiff <= 7 && daysDiff > 1) {
        notifications.push({
          id: `vision-board-deadline-${item.id}`,
          title: t('visionDeadlineTitle'),
          message: t('visionDeadlineMsg', { title: item.title, count: daysDiff }),
          type: 'achievement',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/vision-board`,
        });
      }
    });

    return notifications;
  }

  private static getNotificationPriority(notification: Notification): 'urgent' | 'high' | 'medium' | 'low' {
    if (notification.id.includes('overdue')) return 'urgent';
    if (notification.id.includes('due-today') || notification.id.includes('daily')) return 'high';
    if (notification.id.includes('due-tomorrow') || notification.id.includes('deadline')) return 'medium';
    return 'low';
  }

  // Utility method to check if a notification should be shown (not dismissed)
  static shouldShowNotification(notification: Notification, dismissedNotifications: string[]): boolean {
    return !dismissedNotifications.includes(notification.id);
  }

  // Generate unique dismissal key for notifications that should be dismissed until next occurrence
  static getDismissalKey(notification: Notification): string {
    const today = new Date().toISOString().split('T')[0];
    return `${notification.id}-${today}`;
  }
}