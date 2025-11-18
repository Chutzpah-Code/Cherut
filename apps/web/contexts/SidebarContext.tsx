'use client';

import { createContext, useContext, ReactNode } from 'react';

interface SidebarContextType {
  mobileOpened: boolean;
  desktopOpened: boolean;
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
  return (
    <SidebarContext.Provider value={{ mobileOpened, desktopOpened }}>
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