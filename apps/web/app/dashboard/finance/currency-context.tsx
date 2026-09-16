'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

  const setDisplayCurrency = (currency: string) => {
    setDisplayCurrencyState(currency);
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {
      // ignore write failures (private browsing, storage disabled)
    }
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
