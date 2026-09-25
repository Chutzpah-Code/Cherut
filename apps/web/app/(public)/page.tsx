import type { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';

const TITLE = 'Cherut — Structured obsession for the life you are building';
const DESCRIPTION =
  'Turn ambition into one direction, daily execution, and a system that survives the hard days. Choose the system your direction requires.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    siteName: 'Cherut',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Home() {
  return <LandingPageClient />;
}
