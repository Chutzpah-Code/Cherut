import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LandingPageClient from './LandingPageClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.meta');
  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Cherut',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function Home() {
  return <LandingPageClient />;
}
