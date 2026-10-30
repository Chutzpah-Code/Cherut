// Classifies a YYYY-MM-DD date as 'today' | 'yesterday' | 'daysAgo' relative
// to local today, for the card's "última prática" label (i18n picks the
// right string/count from this).
export function classifyLastPracticed(dateStr: string | null): { kind: 'today' | 'yesterday' | 'daysAgo'; days: number } | null {
  if (!dateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return { kind: 'today', days: 0 };
  if (diffDays === 1) return { kind: 'yesterday', days: 1 };
  return { kind: 'daysAgo', days: diffDays };
}
