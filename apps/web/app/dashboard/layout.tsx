'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import { AppShell, Burger, Group, Loader, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import WelcomeModal from '@/components/ui/WelcomeModal';
import { useWelcomeModal } from '@/hooks/useWelcomeModal';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, backendAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { isOpen: isWelcomeOpen, openModal: openWelcome, closeModal: closeWelcome } = useWelcomeModal();

  // Usar hook de redirecionamento automático
  useAdminRedirect();

  console.log('[Dashboard] Auth state:', {
    user: !!user,
    loading,
    backendAuthenticated,
    isAdmin
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      console.log('[Dashboard] No user, redirecting to home');
      router.push('/');
    }
  }, [loading, user, router]);

  // Block body scroll when mobile sidebar is open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (mobileOpened) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }

      // Cleanup on unmount
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [mobileOpened]);

  const shouldShowDashboard = !loading && user && backendAuthenticated;

  if (!shouldShowDashboard) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <SidebarProvider mobileOpened={mobileOpened} desktopOpened={desktopOpened}>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 260,
          breakpoint: 'lg',
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Header
            mobileOpened={mobileOpened}
            desktopOpened={desktopOpened}
            toggleMobile={toggleMobile}
            toggleDesktop={toggleDesktop}
            onOpenWelcome={openWelcome}
          />
        </AppShell.Header>

        <AppShell.Navbar>
          <Sidebar onClose={closeMobile} />
        </AppShell.Navbar>

        <AppShell.Main>
          {children}
        </AppShell.Main>

        <WelcomeModal
          opened={isWelcomeOpen}
          onClose={closeWelcome}
        />

      </AppShell>
    </SidebarProvider>
  );
}
