'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  TrendingUp,
  Calendar,
  User,
  LogOut,
  Zap,
} from 'lucide-react';
import { Stack, NavLink, ScrollArea, Box, Title, Divider, Button, Group } from '@mantine/core';
import { logoutUser } from '@/lib/firebase/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Life Areas', href: '/dashboard/life-areas', icon: TrendingUp },
  { name: 'Objectives', href: '/dashboard/objectives', icon: Target },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Habits', href: '/dashboard/habits', icon: Calendar },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <Stack h="100%" gap={0}>
      <Box p="md">
        <Group gap="xs">
          <Box
            style={{
              background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-violet-6) 100%)',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={24} color="white" fill="white" />
          </Box>
          <Title order={2}>Cherut</Title>
        </Group>
      </Box>

      <Divider />

      <ScrollArea style={{ flex: 1 }} p="md">
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
        </Stack>
      </ScrollArea>

      <Divider />

      <Box p="md">
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
  );
}