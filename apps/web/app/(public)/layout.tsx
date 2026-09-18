import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

// Scoped to the public marketing route group only (mirrors the same pattern
// used by app/dashboard/layout.tsx) — reading the locale requires
// cookies()/headers() per request, which opts this group out of static
// generation. /admin and any future truly static routes are unaffected.
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
