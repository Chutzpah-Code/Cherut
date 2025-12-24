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

export class NotificationService {

  static generateNotifications(activityData: ActivityData): Notification[] {
    const notifications: Notification[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate task notifications
    notifications.push(...this.generateTaskNotifications(activityData.tasks, today));

    // Generate habit notifications
    notifications.push(...this.generateHabitNotifications(activityData.habits, activityData.habitLogs || [], today));

    // Generate objective notifications
    notifications.push(...this.generateObjectiveNotifications(activityData.objectives, today));

    // Generate vision board notifications
    notifications.push(...this.generateVisionBoardNotifications(activityData.visionBoardItems, today));

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

  private static generateTaskNotifications(tasks: Task[], today: Date): Notification[] {
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
          title: 'Task Overdue',
          message: `"${task.title}" was due ${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? 's' : ''} ago`,
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
          title: 'Task Due Today',
          message: `"${task.title}" is due today`,
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
          title: 'Task Due Tomorrow',
          message: `"${task.title}" is due tomorrow`,
          type: 'task',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/tasks`,
        });
      }
    });

    return notifications;
  }

  private static generateHabitNotifications(habits: Habit[], habitLogs: HabitLog[], today: Date): Notification[] {
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
            title: 'Daily Habit Reminder',
            message: `Time for your daily habit: "${habit.title}"`,
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
            title: 'Weekly Habit Reminder',
            message: `Don't forget your weekly habit: "${habit.title}"`,
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
          title: 'Streak Milestone!',
          message: `Amazing! You've maintained "${habit.title}" for ${habit.streak} days straight!`,
          type: 'achievement',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/habits`,
        });
      }
    });

    return notifications;
  }

  private static generateObjectiveNotifications(objectives: Objective[], today: Date): Notification[] {
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
          title: 'Objective Overdue',
          message: `"${objective.title}" deadline passed ${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? 's' : ''} ago`,
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
          title: 'Objective Deadline Approaching',
          message: `"${objective.title}" is due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`,
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
          title: 'Objective Needs Attention',
          message: `"${objective.title}" is behind schedule. Only ${objective.progress}% complete with ${Math.round((1 - timeProgress) * 100)}% time remaining`,
          type: 'system',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/dashboard/objectives`,
        });
      }
    });

    return notifications;
  }

  private static generateVisionBoardNotifications(visionBoardItems: VisionBoardItem[], today: Date): Notification[] {
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
          title: 'Vision Board Goal Overdue',
          message: `Your vision board goal "${item.title}" deadline passed ${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? 's' : ''} ago`,
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
          title: 'Vision Board Goal Due Today',
          message: `Your vision board goal "${item.title}" is due today. Time to make it happen!`,
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
          title: 'Vision Board Goal Due Tomorrow',
          message: `Your vision board goal "${item.title}" is due tomorrow. Get ready to achieve it!`,
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
          title: 'Vision Board Goal Deadline Approaching',
          message: `Your vision board goal "${item.title}" is due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}. Stay focused on your dreams!`,
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