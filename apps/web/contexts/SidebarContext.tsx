'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type SidebarMode = 'compact' | 'hidden';

interface SidebarContextType {
  mobileOpened: boolean;
  sidebarMode: SidebarMode;
  isCompact: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({
  children,
  mobileOpened,
}: {
  children: ReactNode;
  mobileOpened: boolean;
}) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('compact');

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
        setSidebarMode('compact');
      }
    };

    // Initial check
    updateScreenSize();

    // Add event listener
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const isCompact = sidebarMode === 'compact';

  return (
    <SidebarContext.Provider value={{
      mobileOpened,
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