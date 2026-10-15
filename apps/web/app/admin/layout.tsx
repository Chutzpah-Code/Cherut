import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { AdminShell } from './AdminShell';

// /admin/courses and /admin/courses/[courseId] call useTranslations(), which
// throws if called outside a NextIntlClientProvider — this tree never had
// one (only app/dashboard/layout.tsx did), so those two pages crashed on
// every render while the other admin pages (no translations) stayed fine.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AdminShell>{children}</AdminShell>
    </NextIntlClientProvider>
  );
}
