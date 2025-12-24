'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Bell, Moon, Sun, Sparkles, HelpCircle } from 'lucide-react';
import { Group, Burger, Text, ActionIcon, Avatar, Box, useMantineColorScheme, useComputedColorScheme, Badge, Stack, Indicator } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

interface HeaderProps {
  mobileOpened: boolean;
  desktopOpened: boolean;
  toggleMobile: () => void;
  toggleDesktop: () => void;
  onOpenWelcome?: () => void;
}

export default function Header({ mobileOpened, desktopOpened, toggleMobile, toggleDesktop, onOpenWelcome }: HeaderProps) {
  const { user } = useAuth();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('Welcome back');
  const router = useRouter();

  // Profile integration for theme sync
  const { data: profile } = useProfile();
  const updateMutation = useUpdateProfile();

  // Notifications
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  useEffect(() => {
    setMounted(true);
    
    // Define greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const toggleColorScheme = async () => {
    const newScheme = computedColorScheme === 'dark' ? 'light' : 'dark';

    // 1. Update Mantine theme immediately
    setColorScheme(newScheme);
    localStorage.setItem('mantine-color-scheme-cherut', newScheme);

    // 2. Sync with backend profile if available
    if (profile && updateMutation) {
      try {
        await updateMutation.mutateAsync({
          ...profile,
          preferences: {
            ...profile.preferences,
            theme: newScheme,
          },
        });
      } catch (error) {
        console.error('Error syncing theme to profile:', error);
      }
    }
  };

  const getFirstName = () => {
    if (!user?.email) return 'there';
    const name = user.email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const navigateToProfile = () => {
    router.push('/dashboard/profile');
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="md">
        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="lg" size="sm" />
        <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="lg" size="sm" />
      </Group>

      <Group gap="xs">
        {mounted && (
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="xl"
            onClick={toggleColorScheme}
            title={`Switch to ${computedColorScheme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              transition: 'all 0.3s ease',
            }}
          >
            {computedColorScheme === 'dark' ? (
              <Sun size={20} style={{ color: 'var(--mantine-color-yellow-5)' }} />
            ) : (
              <Moon size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
            )}
          </ActionIcon>
        )}

        {mounted && onOpenWelcome && (
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="xl"
            onClick={onOpenWelcome}
            title="Help and instructions"
            style={{
              transition: 'all 0.3s ease',
            }}
          >
            <HelpCircle size={20} style={{ color: 'var(--mantine-color-gray-6)' }} />
          </ActionIcon>
        )}

        <NotificationCenter
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onClearAll={clearAllNotifications}
          onNotificationClick={(notification) => {
            // Handle notification click - could navigate to specific page
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
          }}
        >
          <Indicator inline color="red" size={8} offset={5} disabled={unreadCount === 0}>
            <ActionIcon
              variant="subtle"
              size="lg"
              radius="xl"
              title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              style={{
                transition: 'all 0.2s ease',
              }}
            >
              <Bell size={20} />
            </ActionIcon>
          </Indicator>
        </NotificationCenter>

        <Group gap="xs" ml="xs">
          <Avatar
            color="blue"
            radius="xl"
            size="md"
            onClick={navigateToProfile}
            styles={{
              root: {
                border: '2px solid var(--mantine-color-blue-6)',
                cursor: 'pointer',
              }
            }}
          >
            {user?.email?.[0].toUpperCase() || 'U'}
          </Avatar>
          
          <Box visibleFrom="sm">
            <Stack gap={0}>
              <Text size="sm" fw={600} lineClamp={1}>
                {getFirstName()}
              </Text>
              <Badge size="xs" variant="light" color="green">
                Active
              </Badge>
            </Stack>
          </Box>
        </Group>
      </Group>
    </Group>
  );
}