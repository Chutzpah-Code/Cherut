import { geistSans, geistMono } from '@/lib/fonts';
import { LearningStyles } from './components/LearningStyles';

// Scopes the Geist/Geist Mono fonts (already used by the public site) and the
// custom `lrn-` stylesheet to just this route subtree — rest of /dashboard
// keeps Mantine + Inter untouched.
export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`lrn ${geistSans.variable} ${geistMono.variable}`}>
      <LearningStyles />
      {children}
    </div>
  );
}
