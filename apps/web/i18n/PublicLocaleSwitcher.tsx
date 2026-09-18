'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Menu, UnstyledButton, Text } from '@mantine/core';
import { Globe } from 'lucide-react';
import { locales, localeLabels, type Locale } from './locales';
import { setLocaleCookie } from './client';

interface PublicLocaleSwitcherProps {
  color?: string;
}

// Standalone switcher for anonymous public-page visitors — deliberately
// simpler than LocaleSync (no useAuth/useProfile, nothing to sync from a
// saved profile). Just sets the cookie i18n/request.ts already reads and
// refreshes the current route so the server re-renders with new messages.
export function PublicLocaleSwitcher({ color = 'inherit' }: PublicLocaleSwitcherProps) {
  const t = useTranslations('localeSwitcher');
  const currentLocale = useLocale();
  const router = useRouter();

  const handleSelect = (locale: Locale) => {
    if (locale === currentLocale) return;
    setLocaleCookie(locale);
    router.refresh();
  };

  return (
    <Menu shadow="md" width={180} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          aria-label={t('ariaLabel')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: 14, fontWeight: 600 }}
        >
          <Globe size={16} />
          <Text component="span" style={{ fontSize: 14, fontWeight: 600, color: 'inherit' }}>
            {currentLocale}
          </Text>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {locales.map((locale) => (
          <Menu.Item
            key={locale}
            onClick={() => handleSelect(locale)}
            fw={locale === currentLocale ? 700 : 400}
          >
            {localeLabels[locale]}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
