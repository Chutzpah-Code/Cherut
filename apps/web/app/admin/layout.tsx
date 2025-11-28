'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logoutUser } from '@/lib/firebase/auth';

// Utility function for secure API URL handling
const getSecureApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
  }
  return apiUrl;
};
import { AppShell, Navbar, Header, Group, Title, Button, Loader, Center, Alert, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconShieldCheck,
  IconMenu2
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CherutLogo from '@/components/ui/CherutLogo';

/**
 * Layout específico para páginas administrativas
 *
 * PROTEÇÕES:
 * 1. Verifica se usuário está autenticado
 * 2. Verifica se usuário tem role 'admin'
 * 3. Redireciona se não for admin
 *
 * FEATURES:
 * - Navegação admin específica
 * - Header com identificação de admin
 * - Logout direto
 * - Indicadores visuais de admin
 */

interface AdminUser {
  uid: string;
  email: string;
  role: string;
  displayName?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, backendAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [opened, { toggle }] = useDisclosure();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Verificar se usuário é admin
  useEffect(() => {
    async function verifyAdminAccess() {
      if (loading) return; // Ainda carregando auth

      if (!user || !backendAuthenticated) {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ Admin layout - No authenticated user');
        }
        router.push('/?redirect=' + encodeURIComponent('/admin') + '&error=admin-access-required');
        return;
      }

      try {
        // Buscar dados do usuário para verificar role
        const token = await user.getIdToken();

        // Fazer request para verificar se é admin
        const API_URL = getSecureApiUrl();

        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Admin verification - Checking permissions...');
        }

        const response = await fetch(`${API_URL}/admin/health`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ Admin access denied - User is not admin');
            }
            router.push('/?redirect=' + encodeURIComponent('/admin') + '&error=admin-access-required');
            return;
          }
          throw new Error('Failed to verify admin access');
        }

        // Se chegou aqui, usuário é admin
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Admin access verified');
        }
        setAdminUser({
          uid: user.uid,
          email: user.email || '',
          role: 'admin',
          displayName: user.displayName || undefined,
        });

      } catch (error) {
        console.error('❌ Admin verification error:', error);
        router.push('/?redirect=' + encodeURIComponent('/admin') + '&error=admin-access-required');
        return;
      } finally {
        setIsVerifying(false);
      }
    }

    verifyAdminAccess();
  }, [user, loading, backendAuthenticated, router]);

  const handleLogout = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Admin logout - Starting logout process...');
      }
      await logoutUser();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Admin logout - Successfully logged out');
      }
      // Redirect to landing page after logout
      window.location.href = '/';
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Admin logout error:', error);
      }
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  // Menu de navegação admin
  const adminNavigation = [
    {
      label: 'Dashboard',
      icon: IconDashboard,
      href: '/admin',
      active: pathname === '/admin',
    },
    {
      label: 'Users',
      icon: IconUsers,
      href: '/admin/users',
      active: pathname === '/admin/users',
    },
    {
      label: 'Analytics',
      icon: IconChartBar,
      href: '/admin/analytics',
      active: pathname === '/admin/analytics',
    },
    {
      label: 'Settings',
      icon: IconSettings,
      href: '/admin/settings',
      active: pathname === '/admin/settings',
    },
  ];

  // Loading state
  if (loading || isVerifying) {
    return (
      <Center h="100vh">
        <div style={{ textAlign: 'center' }}>
          <Loader size="lg" />
          <p style={{ marginTop: '1rem' }}>Verifying administrative access...</p>
        </div>
      </Center>
    );
  }

  // Não é admin ou erro de autenticação
  if (!adminUser) {
    return (
      <Center h="100vh">
        <Alert color="red" title="Access Denied">
          You do not have administrative permissions.
        </Alert>
      </Center>
    );
  }

  return (
    <AppShell
      navbar={{
        width: 280,
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      header={{ height: 100 }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md"
              size="sm"
            />
            <CherutLogo size={120} />
          </Group>

          <Group>
            <Button
              variant="light"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              Exit Admin
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Sidebar */}
      <AppShell.Navbar p="md">
        <div>
          <Title order={4} mb="md" c="dimmed" ta="center">
            Control Panel
          </Title>

          {adminNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                textDecoration: 'none',
                marginBottom: '0.5rem',
              }}
            >
              <Button
                variant={item.active ? 'filled' : 'subtle'}
                fullWidth
                justify="flex-start"
                leftSection={<item.icon size={18} />}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Info do usuário admin */}
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <Alert color="blue" title="Administrator Mode">
            <small>
              UID: {adminUser.uid.substring(0, 8)}...<br />
              Email: {adminUser.email}
            </small>
          </Alert>
        </div>
      </AppShell.Navbar>

      {/* Conteúdo principal */}
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}