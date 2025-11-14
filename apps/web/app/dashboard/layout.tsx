'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppShell, Burger, Group, Loader, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import WelcomeModal from '@/components/ui/WelcomeModal';
import { useWelcomeModal } from '@/hooks/useWelcomeModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, backendAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { isOpen: isWelcomeOpen, openModal: openWelcome, closeModal: closeWelcome } = useWelcomeModal();

  console.log('[Dashboard] Auth state:', { user: !!user, loading, backendAuthenticated });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  const shouldShowDashboard = !loading && user && backendAuthenticated;

  if (!shouldShowDashboard) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
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
  );
}
