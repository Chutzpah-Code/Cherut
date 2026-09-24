'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';

const DEFAULT_CURRENCY = 'USD';

interface FinanceCurrencyContextValue {
  displayCurrency: string;
}

const FinanceCurrencyContext = createContext<FinanceCurrencyContextValue | null>(null);

// The system has exactly one currency, set on the Profile page — this is a
// read-only mirror of it for Finance components, not an independent setting.
export function FinanceCurrencyProvider({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile();
  const displayCurrency = profile?.preferences?.currency ?? DEFAULT_CURRENCY;

  return (
    <FinanceCurrencyContext.Provider value={{ displayCurrency }}>
      {children}
    </FinanceCurrencyContext.Provider>
  );
}

export function useFinanceCurrency() {
  const ctx = useContext(FinanceCurrencyContext);
  if (!ctx) throw new Error('useFinanceCurrency must be used within FinanceCurrencyProvider');
  return ctx;
}
