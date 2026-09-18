'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { isLocale } from './locales';
import { getLocaleCookie, setLocaleCookie } from './client';

interface LocaleSyncProps {
  currentLocale: string;
}

// Priority chain step 2: once an authenticated user's saved profile
// language loads, sync it into the locale cookie (used by i18n/request.ts)
// if it differs — e.g. first login on a new browser with no cookie yet.
// Explicit in-session selection (Preferences) sets the cookie itself and
// takes priority over this.
export function LocaleSync({ currentLocale }: LocaleSyncProps) {
  const { user, backendAuthenticated } = useAuth();
  const { data: profile } = useProfile(!!user && backendAuthenticated);
  const router = useRouter();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!profile?.language || !isLocale(profile.language)) return;
    if (syncedFor.current === profile.language) return;

    const cookieLocale = getLocaleCookie();
    if (cookieLocale === profile.language) {
      syncedFor.current = profile.language;
      return;
    }

    syncedFor.current = profile.language;
    setLocaleCookie(profile.language);
    if (profile.language !== currentLocale) {
      router.refresh();
    }
  }, [profile?.language, currentLocale, router]);

  return null;
}
