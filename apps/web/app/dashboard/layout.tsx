'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import { AppShell, Burger, Group, Loader, Center, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import WelcomeModal from '@/components/ui/WelcomeModal';
import { useWelcomeModal } from '@/hooks/useWelcomeModal';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, backendAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
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
    <SidebarProvider mobileOpened={mobileOpened}>
      <ResponsiveDashboard
        mobileOpened={mobileOpened}
        toggleMobile={toggleMobile}
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
  toggleMobile,
  openWelcome,
  closeMobile,
  isWelcomeOpen,
  closeWelcome,
}: {
  children: React.ReactNode;
  mobileOpened: boolean;
  toggleMobile: () => void;
  openWelcome: () => void;
  closeMobile: () => void;
  isWelcomeOpen: boolean;
  closeWelcome: () => void;
}) {
  const getSidebarCollapsed = () => ({ mobile: !mobileOpened, desktop: false });
  const colors = useThemeColors();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 80,
        breakpoint: 'sm',
        collapsed: getSidebarCollapsed(),
      }}
      padding={{ base: 'sm', sm: 'md' }}
    >
      <AppShell.Header>
        <Header
          mobileOpened={mobileOpened}
          toggleMobile={toggleMobile}
          onOpenWelcome={openWelcome}
        />
      </AppShell.Header>

      {/* Mantine's AppShell forces --app-shell-navbar-width to 100% below the
          `breakpoint` whenever navbar.collapsed.mobile is false (i.e. exactly
          when we open it) — its built-in assumption is a full-screen mobile
          drawer. Our navbar is a fixed 80px icon rail (Sidebar.tsx's
          .premium-sidebar.compact), so left un-pinned, the *wrapper* stretches
          to the full viewport width with an opaque background while only the
          left 80px has visible content — painting the rest of the screen (and
          our backdrop below it, and the real page content under that) solid
          white. Pin the width back to 80px so it always renders as an 80px
          overlay instead of a full-bleed opaque curtain. */}
      <AppShell.Navbar style={{ '--app-shell-navbar-width': '80px' } as React.CSSProperties}>
        <Sidebar onClose={closeMobile} />
      </AppShell.Navbar>

      {/* Mobile-only backdrop behind the sidebar drawer — Mantine's AppShell
          has no built-in overlay, so the main content otherwise shows through
          solid and unobscured while the drawer is open. Sits just under the
          navbar's z-index (100) so the drawer itself stays fully opaque.
          touchAction: 'none' blocks touch-drag scroll on the area it covers,
          not just clicks — pointer-events alone doesn't stop iOS momentum
          scroll gestures. */}
      <Box
        hiddenFrom="sm"
        onClick={closeMobile}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          background: 'rgba(15, 23, 42, 0.28)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: mobileOpened ? 1 : 0,
          visibility: mobileOpened ? 'visible' : 'hidden',
          pointerEvents: mobileOpened ? 'auto' : 'none',
          touchAction: 'none',
          transition: 'opacity 200ms ease, visibility 200ms ease',
        }}
      />

      <AppShell.Main style={{ background: colors.background, overflow: mobileOpened ? 'hidden' : undefined }}>
        {children}
      </AppShell.Main>

      <WelcomeModal
        opened={isWelcomeOpen}
        onClose={closeWelcome}
      />
    </AppShell>
  );
}
