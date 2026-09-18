import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

// Scoped to /auth/* only (mirrors app/(public)/layout.tsx) — visitors here
// are unauthenticated, so there's no profile to sync locale from, same as
// the public marketing pages.
export default async function AuthLayout({
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
