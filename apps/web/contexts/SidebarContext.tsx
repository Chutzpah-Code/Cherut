'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type SidebarMode = 'expanded' | 'compact' | 'hidden';

interface SidebarContextType {
  mobileOpened: boolean;
  desktopOpened: boolean;
  sidebarMode: SidebarMode;
  isCompact: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({
  children,
  mobileOpened,
  desktopOpened
}: {
  children: ReactNode;
  mobileOpened: boolean;
  desktopOpened: boolean;
}) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('expanded');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
        setSidebarMode('hidden');
      } else if (width < 1200) {
        setScreenSize('tablet');
        setSidebarMode('compact');
      } else {
        setScreenSize('desktop');
        setSidebarMode(desktopOpened ? 'expanded' : 'compact');
      }
    };

    // Initial check
    updateScreenSize();

    // Add event listener
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [desktopOpened]);

  const isCompact = sidebarMode === 'compact';

  return (
    <SidebarContext.Provider value={{
      mobileOpened,
      desktopOpened,
      sidebarMode,
      isCompact,
      screenSize
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}