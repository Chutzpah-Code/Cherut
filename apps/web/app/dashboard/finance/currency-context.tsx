'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

const STORAGE_KEY = 'finance_display_currency';
const DEFAULT_CURRENCY = 'USD';

interface FinanceCurrencyContextValue {
  displayCurrency: string;
  setDisplayCurrency: (currency: string) => void;
}

const FinanceCurrencyContext = createContext<FinanceCurrencyContextValue | null>(null);

export function FinanceCurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CURRENCY;
    } catch {
      return DEFAULT_CURRENCY;
    }
  });

  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const appliedProfileCurrency = useRef(false);

  // Profile is the cross-device source of truth: adopt it once, on first load,
  // without clobbering a currency the user is actively switching to mid-session.
  useEffect(() => {
    if (appliedProfileCurrency.current) return;
    const preferred = profile?.preferences?.currency;
    if (!preferred) return;
    appliedProfileCurrency.current = true;
    if (preferred !== displayCurrency) {
      setDisplayCurrencyState(preferred);
      try {
        localStorage.setItem(STORAGE_KEY, preferred);
      } catch {
        // ignore write failures (private browsing, storage disabled)
      }
    }
  }, [profile, displayCurrency]);

  const setDisplayCurrency = (currency: string) => {
    setDisplayCurrencyState(currency);
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {
      // ignore write failures (private browsing, storage disabled)
    }
    updateProfile.mutate({ preferences: { ...profile?.preferences, currency } });
  };

  return (
    <FinanceCurrencyContext.Provider value={{ displayCurrency, setDisplayCurrency }}>
      {children}
    </FinanceCurrencyContext.Provider>
  );
}

export function useFinanceCurrency() {
  const ctx = useContext(FinanceCurrencyContext);
  if (!ctx) throw new Error('useFinanceCurrency must be used within FinanceCurrencyProvider');
  return ctx;
}
