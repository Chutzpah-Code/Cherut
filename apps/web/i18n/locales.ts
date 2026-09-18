// Single source of truth for supported locales. Every place that needs to
// know "which languages exist" (next-intl config, the Preferences language
// select, the detection chain) reads from here — adding a language means
// adding one entry here plus one messages/<locale>.json file, nothing else.
export const locales = ['en', 'pt-BR'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
