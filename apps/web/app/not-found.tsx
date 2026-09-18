import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { NotFoundContent } from '@/components/ui/NotFoundContent';

// Root not-found.tsx renders inside the root layout, which has no next-intl
// provider (to keep the rest of the app statically generated) — so it wires
// its own, mirroring app/(public)/layout.tsx and app/auth/layout.tsx.
export default async function NotFound() {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundContent />
    </NextIntlClientProvider>
  );
}
