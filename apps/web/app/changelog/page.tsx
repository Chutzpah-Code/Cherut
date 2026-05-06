'use client';

import { PageShell, SHELL_TOKENS } from '@/components/shell/Shell';

const { BLUE, BLUE_SOFT, INK, PAPER, PAPER_2, MUTED, RULE } = SHELL_TOKENS;

const entries = [
  {
    version: 'v1.0',
    date: 'May 2026',
    title: 'General Availability',
    tag: 'Major',
    items: [
      'Cherut is now publicly available — free tier, Pro and Lifetime plans live.',
      'All core modules production-ready: Habits, Tasks, OKRs, Journal, Vision Board, Values, Life Areas.',
      'Mobile web fully optimised; iOS and Android beta open to all paid plans.',
    ],
  },
  {
    version: 'v0.9',
    date: 'April 2026',
    title: 'Finances module beta',
    tag: 'Feature',
    items: [
      'Budget tracking with categories and monthly targets.',
      'Net worth snapshot with manual asset and liability entries.',
      'Financial goals connected to your OKRs.',
    ],
  },
  {
    version: 'v0.8',
    date: 'March 2026',
    title: 'Vision Board & Values',
    tag: 'Feature',
    items: [
      'Visual canvas to pin images, quotes and goals.',
      'Values module: define your compass and surface misalignment in daily reviews.',
      'Tasks and habits can now be linked to a specific value or dream.',
    ],
  },
  {
    version: 'v0.7',
    date: 'February 2026',
    title: 'Google Calendar sync',
    tag: 'Integration',
    items: [
      'Two-way sync with Google Calendar — tasks appear as events.',
      'Calendar view inside Cherut shows your schedule alongside habit slots.',
      'Conflict detection for scheduled tasks and time blocks.',
    ],
  },
  {
    version: 'v0.6',
    date: 'January 2026',
    title: 'Journal',
    tag: 'Feature',
    items: [
      'Structured daily journal with morning intention and evening reflection prompts.',
      'Free-form notes with full-text search across all entries.',
      'Gratitude log with weekly digest.',
    ],
  },
  {
    version: 'v0.5',
    date: 'December 2025',
    title: 'OKR framework',
    tag: 'Feature',
    items: [
      'Set quarterly Objectives with up to 5 Key Results each.',
      'Weekly check-in flow with confidence score and notes.',
      'Progress visualisation with a compact timeline view.',
    ],
  },
  {
    version: 'v0.4',
    date: 'November 2025',
    title: 'Life Areas & Dashboard',
    tag: 'Improvement',
    items: [
      'Life Areas let you segment habits, tasks and goals into meaningful domains.',
      'New Dashboard with stats, recent activity and quick-add shortcuts.',
      'Consistent design language across all pages.',
    ],
  },
  {
    version: 'v0.3',
    date: 'October 2025',
    title: 'Kanban boards',
    tag: 'Feature',
    items: [
      'Tasks now support multiple boards with customisable columns.',
      'Drag-and-drop between columns and boards.',
      'Board-level filters by assignee, label and due date.',
    ],
  },
  {
    version: 'v0.2',
    date: 'September 2025',
    title: 'Habits v2',
    tag: 'Improvement',
    items: [
      'Habit streaks with intention-setting and daily reflection.',
      'Flexible frequencies: daily, weekdays, custom days.',
      'Archive and restore habits without losing history.',
    ],
  },
  {
    version: 'v0.1',
    date: 'August 2025',
    title: 'First private beta',
    tag: 'Launch',
    items: [
      'Core habit tracking and basic task list — the first working prototype.',
      'User accounts with email/password auth.',
      'Feedback loop with the first 50 beta testers.',
    ],
  },
];

const tagColors: Record<string, { bg: string; color: string }> = {
  Major:       { bg: '#0F0F1E', color: '#FAFAF7' },
  Feature:     { bg: BLUE_SOFT, color: BLUE },
  Integration: { bg: '#EEF4FF', color: '#2E5CE0' },
  Improvement: { bg: '#F5F5F2', color: 'rgba(15,15,30,0.6)' },
  Launch:      { bg: '#E8F5EE', color: '#1A7A45' },
};

export default function ChangelogPage() {
  return (
    <PageShell
      kicker="Changelog"
      title="What's new in Cherut"
      lead="All the improvements, week by week."
    >
      <style>{`
        .cl-wrap { max-width: 760px; margin: 0 auto; padding: 48px 20px 80px; }
        .cl-list { display: flex; flex-direction: column; }
        .cl-entry { display: grid; grid-template-columns: 1fr; gap: 0; }
        .cl-left { display: none; }
        .cl-right { padding: 0 0 48px; position: relative; }
        .cl-right::before {
          content: ''; position: absolute;
          left: -1px; top: 6px; bottom: 0;
          width: 2px; background: ${RULE};
        }
        .cl-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: ${BLUE}; border: 2px solid ${PAPER_2};
          position: absolute; left: -5px; top: 6px;
          box-shadow: 0 0 0 3px ${BLUE_SOFT};
        }
        .cl-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; padding-left: 20px; }
        .cl-version { font-size: 12px; font-weight: 700; color: rgba(15,15,30,0.5); letter-spacing: .04em; }
        .cl-date { font-size: 12px; color: ${MUTED}; }
        .cl-tag { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; }
        .cl-title { font-size: 20px; font-weight: 700; color: ${INK}; letter-spacing: -0.015em; margin-bottom: 12px; padding-left: 20px; }
        .cl-items { padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
        .cl-item { display: flex; gap: 10px; font-size: 14px; color: rgba(15,15,30,0.8); line-height: 1.55; }
        .cl-bullet { color: ${BLUE}; flex-shrink: 0; margin-top: 2px; }

        @media (min-width: 640px) {
          .cl-wrap { padding: 64px 32px 100px; }
          .cl-entry { grid-template-columns: 80px 1fr; gap: 0 20px; }
          .cl-left { display: block; padding-top: 4px; text-align: right; }
          .cl-left-version { font-size: 12px; font-weight: 700; color: rgba(15,15,30,0.45); letter-spacing: .04em; display: block; }
          .cl-left-date { font-size: 12px; color: ${MUTED}; display: block; margin-top: 2px; }
          .cl-right { padding-left: 24px; }
          .cl-meta { padding-left: 0; }
          .cl-meta .cl-version { display: none; }
          .cl-meta .cl-date { display: none; }
          .cl-title { padding-left: 0; }
          .cl-items { padding-left: 0; }
          .cl-right::before { left: 0; }
          .cl-dot { left: -4px; }
        }
        @media (min-width: 1024px) {
          .cl-wrap { padding: 80px 32px 120px; }
        }
      `}</style>

      <div style={{ background: PAPER_2 }}>
        <div className="cl-wrap">
          <div className="cl-list">
            {entries.map((entry) => {
              const tagStyle = tagColors[entry.tag] ?? tagColors.Improvement;
              return (
                <div key={entry.version} className="cl-entry">
                  <div className="cl-left">
                    <span className="cl-left-version">{entry.version}</span>
                    <span className="cl-left-date">{entry.date}</span>
                  </div>
                  <div className="cl-right">
                    <div className="cl-dot" />
                    <div className="cl-meta">
                      <span className="cl-version">{entry.version}</span>
                      <span className="cl-date">{entry.date}</span>
                      <span className="cl-tag" style={{ background: tagStyle.bg, color: tagStyle.color }}>{entry.tag}</span>
                    </div>
                    <div className="cl-title">{entry.title}</div>
                    <div className="cl-items">
                      {entry.items.map((item) => (
                        <div key={item} className="cl-item">
                          <span className="cl-bullet">✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
