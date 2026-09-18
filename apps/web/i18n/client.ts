'use client';

import type { Locale } from './locales';

const LOCALE_COOKIE = 'locale';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function getLocaleCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function setLocaleCookie(locale: Locale) {
  if (typeof document === 'undefined') return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
}
