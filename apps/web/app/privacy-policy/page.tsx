'use client';

import { PageShell, SHELL_TOKENS } from '@/components/shell/Shell';

const { BLUE, BLUE_SOFT, INK, PAPER, PAPER_2, MUTED, RULE } = SHELL_TOKENS;

const sections = [
  {
    icon: '◐',
    title: 'What we collect',
    items: [
      'Your email address and name when you sign up.',
      'Usage data: which features you use and when, to improve the product.',
      'Content you create: habits, tasks, journal entries, OKRs. Stored encrypted.',
      'Device and browser type for debugging and performance.',
    ],
  },
  {
    icon: '◇',
    title: "What we don't do",
    items: [
      'We do not sell your data — ever. Not to advertisers, not to data brokers.',
      'We do not show you ads. There are no ad networks in Cherut.',
      'We do not use your journal, habits or goals to train AI models.',
      'We do not share your personal data with third parties without your consent.',
    ],
  },
  {
    icon: '◯',
    title: 'How we store it',
    items: [
      'Data is stored on Firebase (Google Cloud) with encryption at rest and in transit.',
      'Backups run daily and are retained for 30 days.',
      'We use industry-standard TLS for all data in transit.',
      'Access to production data is restricted to core team members.',
    ],
  },
  {
    icon: '◈',
    title: 'Your rights',
    items: [
      'Export: you can download all your data as JSON at any time from Settings.',
      'Delete: you can permanently delete your account and all associated data.',
      'Correction: you can update or correct any personal information you have provided.',
      'Portability: your exported data is in open formats, not locked in.',
    ],
  },
  {
    icon: '✦',
    title: 'Contact',
    items: [
      'Questions about this policy? Email us at privacy@cherut.app',
      'We aim to respond to all privacy inquiries within 5 business days.',
      'For urgent data deletion requests, include "URGENT" in your subject line.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PageShell
      kicker="Privacy"
      title="Your privacy is not a footnote."
      lead="Plain language. No surprises. Last updated May 2026."
    >
      <style>{`
        .pp-wrap { max-width: 800px; margin: 0 auto; padding: 48px 20px 80px; display: flex; flex-direction: column; gap: 16px; }
        .pp-card { background: ${PAPER}; border: 1px solid ${RULE}; border-radius: 14px; padding: 24px 24px; }
        .pp-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .pp-icon { width: 36px; height: 36px; border-radius: 8px; background: ${BLUE_SOFT}; color: ${BLUE}; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .pp-card-title { font-size: 17px; font-weight: 700; color: ${INK}; margin: 0; letter-spacing: -0.01em; }
        .pp-list { display: flex; flex-direction: column; gap: 10px; padding: 0; margin: 0; list-style: none; }
        .pp-item { display: flex; gap: 10px; font-size: 15px; color: rgba(15,15,30,0.8); line-height: 1.55; }
        .pp-bullet { color: ${BLUE}; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .pp-notice { background: ${BLUE_SOFT}; border: 1px solid rgba(80,100,200,0.15); border-radius: 12px; padding: 18px 20px; font-size: 14px; color: rgba(15,15,30,0.75); line-height: 1.55; text-align: center; }

        @media (min-width: 640px) {
          .pp-wrap { padding: 64px 32px 100px; }
          .pp-card { padding: 28px 32px; }
        }
        @media (min-width: 1024px) {
          .pp-wrap { padding: 80px 32px 120px; }
        }
      `}</style>

      <div style={{ background: PAPER_2 }}>
        <div className="pp-wrap">
          <div className="pp-notice">
            This is a plain-language summary of our privacy practices. It is designed to be readable, not exhaustive. For the full legal text, contact us at privacy@cherut.app
          </div>

          {sections.map((s) => (
            <div key={s.title} className="pp-card">
              <div className="pp-card-head">
                <div className="pp-icon">{s.icon}</div>
                <h2 className="pp-card-title">{s.title}</h2>
              </div>
              <ul className="pp-list">
                {s.items.map((item) => (
                  <li key={item} className="pp-item">
                    <span className="pp-bullet">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
