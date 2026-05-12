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
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

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

  useEffect(() => {
    if (!loading && !user) {
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

  const shouldShowDashboard = !loading && !!user;

  if (!shouldShowDashboard) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <SidebarProvider mobileOpened={mobileOpened} desktopOpened={desktopOpened}>
      <ResponsiveDashboard
        mobileOpened={mobileOpened}
        desktopOpened={desktopOpened}
        toggleMobile={toggleMobile}
        toggleDesktop={toggleDesktop}
        openWelcome={openWelcome}
        closeMobile={closeMobile}
        isWelcomeOpen={isWelcomeOpen}
        closeWelcome={closeWelcome}
      >
        {children}
      </ResponsiveDashboard>
    </SidebarProvider>
  );
}

function ResponsiveDashboard({
  children,
  mobileOpened,
  desktopOpened,
  toggleMobile,
  toggleDesktop,
  openWelcome,
  closeMobile,
  isWelcomeOpen,
  closeWelcome,
}: {
  children: React.ReactNode;
  mobileOpened: boolean;
  desktopOpened: boolean;
  toggleMobile: () => void;
  toggleDesktop: () => void;
  openWelcome: () => void;
  closeMobile: () => void;
  isWelcomeOpen: boolean;
  closeWelcome: () => void;
}) {
  const { sidebarMode, isCompact, screenSize } = useSidebar();

  const getSidebarWidth = () => {
    if (screenSize === 'mobile') return 260;
    if (isCompact) return 80;
    return 260;
  };

  const getSidebarCollapsed = () => {
    if (screenSize === 'mobile') {
      return { mobile: !mobileOpened, desktop: false };
    }
    if (screenSize === 'tablet') {
      return { mobile: false, desktop: false }; // Always show in compact mode
    }
    return { mobile: !mobileOpened, desktop: !desktopOpened };
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: getSidebarWidth(),
        breakpoint: 'sm',
        collapsed: getSidebarCollapsed(),
      }}
      padding={{ base: 'sm', sm: 'md' }}
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
