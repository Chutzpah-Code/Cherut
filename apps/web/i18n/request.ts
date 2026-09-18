import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { locales, defaultLocale, isLocale, type Locale } from './locales';

const LOCALE_COOKIE = 'locale';

function pickFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  // "pt-BR,pt;q=0.9,en;q=0.8" -> ["pt-BR", "pt", "en"], best first
  const tags = header.split(',').map((part) => part.split(';')[0].trim());
  for (const tag of tags) {
    if (isLocale(tag)) return tag;
    // Fall back to matching the base language (e.g. "pt" -> "pt-BR")
    const base = tag.split('-')[0];
    const match = locales.find((l) => l.split('-')[0] === base);
    if (match) return match;
  }
  return null;
}

// No URL-based locale routing (no /en/, /pt-BR/ prefixes) — this app is
// fully authenticated, so locale comes from the cookie set on explicit
// selection (Preferences) or synced from profile.language on login, with
// Accept-Language as a last-resort guess for first-time visitors.
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale: Locale = defaultLocale;
  if (isLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const headerList = await headers();
    locale = pickFromAcceptLanguage(headerList.get('accept-language')) ?? defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
