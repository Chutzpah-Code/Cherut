'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Bell, Moon, Sun, Sparkles, HelpCircle } from 'lucide-react';
import { Group, Burger, Text, ActionIcon, Avatar, Box, useMantineColorScheme, useComputedColorScheme, Badge, Stack, Indicator } from '@mantine/core';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    setMounted(true);
    
    // Define saudação baseada no horário
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const toggleColorScheme = () => {
    const newScheme = computedColorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newScheme);
    localStorage.setItem('mantine-color-scheme-cherut', newScheme);
  };

  const getFirstName = () => {
    if (!user?.email) return 'there';
    const name = user.email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
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
            title="Ajuda e instruções"
            style={{
              transition: 'all 0.3s ease',
            }}
          >
            <HelpCircle size={20} style={{ color: 'var(--mantine-color-gray-6)' }} />
          </ActionIcon>
        )}

        <Indicator inline color="red" size={8} offset={5} disabled>
          <ActionIcon 
            variant="subtle" 
            size="lg" 
            radius="xl"
            title="Notifications"
          >
            <Bell size={20} />
          </ActionIcon>
        </Indicator>

        <Group gap="xs" ml="xs">
          <Avatar 
            color="blue" 
            radius="xl"
            size="md"
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