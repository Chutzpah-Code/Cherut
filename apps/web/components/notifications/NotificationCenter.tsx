'use client';

import { useState, useRef } from 'react';
import {
  Popover,
  Stack,
  Group,
  Text,
  ActionIcon,
  ScrollArea,
  Card,
  Badge,
  Divider,
  Button,
  Center,
  Box,
} from '@mantine/core';
import {
  Bell,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  Trophy,
  AlertTriangle,
  Settings,
  Trash2,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'habit' | 'objective' | 'journal' | 'system' | 'achievement';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationCenterProps {
  children: React.ReactNode;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'task':
      return <CheckCircle2 size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />;
    case 'habit':
      return <Clock size={16} style={{ color: 'var(--mantine-color-green-6)' }} />;
    case 'objective':
      return <Target size={16} style={{ color: 'var(--mantine-color-purple-6)' }} />;
    case 'journal':
      return <BookOpen size={16} style={{ color: 'var(--mantine-color-orange-6)' }} />;
    case 'achievement':
      return <Trophy size={16} style={{ color: 'var(--mantine-color-yellow-6)' }} />;
    case 'system':
      return <AlertTriangle size={16} style={{ color: 'var(--mantine-color-red-6)' }} />;
    default:
      return <Bell size={16} />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'task': return 'blue';
    case 'habit': return 'green';
    case 'objective': return 'purple';
    case 'journal': return 'orange';
    case 'achievement': return 'yellow';
    case 'system': return 'red';
    default: return 'gray';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
};

export function NotificationCenter({
  children,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onNotificationClick,
}: NotificationCenterProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const targetRef = useRef<HTMLDivElement>(null);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    close();
  };

  return (
    <Popover
      width={380}
      position="bottom-end"
      withArrow
      shadow="lg"
      radius="md"
      opened={opened}
      onClose={close}
    >
      <Popover.Target>
        <div ref={targetRef} onClick={opened ? close : open}>
          {children}
        </div>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Stack gap={0}>
          {/* Header */}
          <Group justify="space-between" p="md" pb="sm">
            <Group gap="xs">
              <Bell size={18} />
              <Text fw={600} size="sm">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Badge size="xs" color="red" variant="filled">
                  {unreadCount}
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              {unreadCount > 0 && (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={onMarkAllAsRead}
                  title="Mark all as read"
                >
                  <CheckCircle2 size={14} />
                </ActionIcon>
              )}
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={onClearAll}
                title="Clear all notifications"
                color="red"
              >
                <Trash2 size={14} />
              </ActionIcon>
            </Group>
          </Group>

          <Divider />

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="xs">
                <Bell size={32} style={{ opacity: 0.5 }} />
                <Text size="sm" c="dimmed" ta="center">
                  No notifications yet
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  You'll see your updates here
                </Text>
              </Stack>
            </Center>
          ) : (
            <ScrollArea.Autosize mah={400} p={0}>
              <Stack gap={0}>
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    padding="md"
                    radius={0}
                    style={{
                      borderBottom: '1px solid var(--mantine-color-gray-3)',
                      cursor: 'pointer',
                      backgroundColor: notification.read
                        ? 'transparent'
                        : 'var(--mantine-color-blue-0)',
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Group align="flex-start" gap="sm" wrap="nowrap">
                      <Box mt="xs">
                        {getNotificationIcon(notification.type)}
                      </Box>

                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Text size="sm" fw={notification.read ? 400 : 600} lineClamp={1}>
                            {notification.title}
                          </Text>
                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notification.id);
                            }}
                          >
                            <Trash2 size={12} />
                          </ActionIcon>
                        </Group>

                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {notification.message}
                        </Text>

                        <Group justify="space-between" align="center">
                          <Badge
                            size="xs"
                            variant="light"
                            color={getNotificationColor(notification.type)}
                          >
                            {notification.type}
                          </Badge>
                          <Text size="xs" c="dimmed">
                            {formatTimeAgo(notification.createdAt)}
                          </Text>
                        </Group>
                      </Stack>

                      {!notification.read && (
                        <Box
                          w={8}
                          h={8}
                          style={{
                            borderRadius: '50%',
                            backgroundColor: 'var(--mantine-color-blue-6)',
                            marginTop: 6,
                          }}
                        />
                      )}
                    </Group>
                  </Card>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <>
              <Divider />
              <Group justify="center" p="sm">
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<Settings size={14} />}
                  onClick={() => {
                    close();
                    // Navigate to notification settings
                    window.location.href = '/dashboard/profile';
                  }}
                >
                  Notification Settings
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}