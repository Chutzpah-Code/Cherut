'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  TrendingUp,
  Calendar,
  User,
  LogOut,
  Sparkles,
  BarChart3,
  BookOpen,
  Heart,
  Bot,
} from 'lucide-react';
import { Stack, NavLink, ScrollArea, Box, Divider, Button, Group, Badge, Text } from '@mantine/core';
import { logoutUser } from '@/lib/firebase/auth';
import CherutLogo from '@/components/ui/CherutLogo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vision Board', href: '/dashboard/vision-board', icon: Sparkles },
  { name: 'Life Areas', href: '/dashboard/life-areas', icon: TrendingUp },
  { name: 'Values', href: '/dashboard/values', icon: Heart },
  { name: 'Objectives', href: '/dashboard/objectives', icon: Target },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Habits', href: '/dashboard/habits', icon: Calendar },
  { name: 'Journal', href: '/dashboard/journal', icon: BookOpen },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

const comingSoonItems = [
  {
    name: 'Reports',
    href: '#',
    icon: BarChart3,
    description: 'Analytics dashboards showing your evolution and progress insights'
  },
  {
    name: 'CherutOS',
    href: '#',
    icon: Bot,
    description: 'AI-powered personal assistant for conscious decision making'
  },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    navigation.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <Stack h="100%" gap={0}>
      <ScrollArea style={{ flex: 1 }} px="md" py="sm">
        <Stack gap="md">
          <Box style={{ width: '100%' }}>
            <CherutLogo size={180} />
          </Box>

          <Divider />

          <Stack gap="xs">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  component={Link}
                  href={item.href}
                  label={item.name}
                  leftSection={<Icon size={20} />}
                  active={isActive}
                  onClick={handleLinkClick}
                  color="blue"
                />
              );
            })}

            <Divider my="md" />

            <Text size="sm" fw={600} c="dimmed" mb="xs" px="sm" style={{ fontSize: '13px' }}>
              COMING SOON
            </Text>

            {comingSoonItems.map((item) => {
              const Icon = item.icon;

              return (
                <Box key={item.name}>
                  <NavLink
                    label={
                      <Group justify="space-between" w="100%">
                        <Text size="md" style={{ fontSize: '15px', fontWeight: 500 }}>{item.name}</Text>
                        <Badge size="sm" color="yellow" variant="light" style={{ fontSize: '11px' }}>
                          Soon
                        </Badge>
                      </Group>
                    }
                    leftSection={<Icon size={20} />}
                    disabled
                    style={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                    description={
                      <Text size="sm" c="dimmed" mt={4} lineClamp={2} style={{ fontSize: '13px' }}>
                        {item.description}
                      </Text>
                    }
                  />
                </Box>
              );
            })}
          </Stack>

          <Divider my="md" />

          <Box>
            <Button
              leftSection={<LogOut size={20} />}
              onClick={handleLogout}
              variant="subtle"
              color="red"
              fullWidth
            >
              Logout
            </Button>
          </Box>
        </Stack>
      </ScrollArea>
    </Stack>
  );
}