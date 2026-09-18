import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { LocaleSync } from '@/i18n/LocaleSync';
import { DashboardShell } from './DashboardShell';

// Scoped to /dashboard/* only (not the root layout) so this is the only
// part of the app that opts out of static generation — reading the locale
// requires cookies()/headers() per request, which Next.js can't prerender.
// Public marketing pages stay statically generated.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleSync currentLocale={locale} />
      <DashboardShell>{children}</DashboardShell>
    </NextIntlClientProvider>
  );
}
