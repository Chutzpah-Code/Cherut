import { FinanceBill } from '@/lib/api/services/bills';

export function monthlyEquivalent(bill: Pick<FinanceBill, 'frequency' | 'amount' | 'interval'>): number {
  switch (bill.frequency) {
    case 'weekly': return bill.amount * (52 / 12);
    case 'biweekly': return bill.amount * (26 / 12);
    case 'monthly': return bill.amount;
    case 'bimonthly': return bill.amount / 2;
    case 'quarterly': return bill.amount / 3;
    case 'semiannual': return bill.amount / 6;
    case 'annual': return bill.amount / 12;
    case 'custom': return bill.amount * (30 / Math.max(1, bill.interval ?? 30));
    default: return bill.amount;
  }
}

export function fmtCurrency(value: number, locale: string, currency?: string) {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency ?? 'USD' }).format(value);
  } catch {
    return `${currency ?? ''} ${value.toFixed(2)}`;
  }
}

export function fmtShortDate(iso: string, locale: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}
