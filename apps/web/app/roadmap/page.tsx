'use client';

import { PageShell, SHELL_TOKENS } from '@/components/shell/Shell';

const { BLUE, BLUE_SOFT, INK, PAPER, PAPER_2, MUTED, RULE } = SHELL_TOKENS;

const shipped = [
  { name: 'Habits', desc: 'Daily tracking with streaks, intent and reflection.' },
  { name: 'Tasks & Boards', desc: 'Kanban boards, list view and task management.' },
  { name: 'OKRs', desc: 'Objectives and key results with weekly check-ins.' },
  { name: 'Journal', desc: 'Morning intentions, evening reflections, free-form notes.' },
  { name: 'Vision Board', desc: 'A visual canvas for the future you are building.' },
  { name: 'Values', desc: 'Define your compass and check decisions against it.' },
  { name: 'Life Areas', desc: 'Segment your life and balance what matters.' },
];

const inProgress = [
  { name: 'Calendar sync', desc: 'Two-way sync with Google Calendar.' },
  { name: 'Mobile apps', desc: 'Native iOS and Android apps, currently in beta.' },
  { name: 'Finances module', desc: 'Budgets, goals and net worth on the same page.' },
];

const planned = [
  { name: 'AI weekly review', desc: 'Automated insights from your habits and OKRs.' },
  { name: 'Open API', desc: 'Build your own integrations with Cherut data.' },
  { name: 'Teams', desc: 'Shared goals and accountability for small teams.' },
  { name: 'Integrations hub', desc: 'Notion, Apple Health, Outlook, Slack and more.' },
  { name: 'Native widgets', desc: 'Home screen widgets for iOS and Android.' },
];

function StatusBadge({ status }: { status: 'shipped' | 'in-progress' | 'planned' }) {
  const map = {
    shipped:     { label: '✓ Shipped',     bg: '#E8F5EE', color: '#1A7A45' },
    'in-progress': { label: '● In Progress', bg: BLUE_SOFT, color: BLUE },
    planned:     { label: '○ Planned',     bg: '#F5F5F2', color: 'rgba(15,15,30,0.55)' },
  };
  const s = map[status];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function ItemCard({ name, desc, status }: { name: string; desc: string; status: 'shipped' | 'in-progress' | 'planned' }) {
  return (
    <div style={{ background: PAPER, border: `1px solid ${RULE}`, borderRadius: 12, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>{name}</span>
        <StatusBadge status={status} />
      </div>
      <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55, margin: 0 }}>{desc}</p>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <PageShell
      kicker="Roadmap"
      title="What we're building"
      lead="Honest about where we are and where we're going."
    >
      <style>{`
        .rm-wrap { max-width: 1180px; margin: 0 auto; padding: 48px 20px 80px; }
        .rm-cols { display: grid; grid-template-columns: 1fr; gap: 32px; }
        .rm-col-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .rm-col-title { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
        .rm-items { display: flex; flex-direction: column; gap: 10px; }

        @media (min-width: 768px) {
          .rm-wrap { padding: 64px 32px 100px; }
          .rm-cols { grid-template-columns: repeat(3, 1fr); gap: 24px; }
        }
      `}</style>

      <div style={{ background: PAPER_2, minHeight: '60vh' }}>
        <div className="rm-wrap">
          <div className="rm-cols">
            <div>
              <div className="rm-col-head">
                <span style={{ fontSize: 18, color: '#1A7A45' }}>✓</span>
                <span className="rm-col-title" style={{ color: '#1A7A45' }}>Shipped</span>
                <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>{shipped.length} items</span>
              </div>
              <div className="rm-items">
                {shipped.map(i => <ItemCard key={i.name} {...i} status="shipped" />)}
              </div>
            </div>
            <div>
              <div className="rm-col-head">
                <span style={{ fontSize: 18, color: BLUE }}>●</span>
                <span className="rm-col-title" style={{ color: BLUE }}>In Progress</span>
                <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>{inProgress.length} items</span>
              </div>
              <div className="rm-items">
                {inProgress.map(i => <ItemCard key={i.name} {...i} status="in-progress" />)}
              </div>
            </div>
            <div>
              <div className="rm-col-head">
                <span style={{ fontSize: 18, color: MUTED }}>○</span>
                <span className="rm-col-title" style={{ color: MUTED }}>Planned</span>
                <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>{planned.length} items</span>
              </div>
              <div className="rm-items">
                {planned.map(i => <ItemCard key={i.name} {...i} status="planned" />)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 64, padding: '28px 24px', background: PAPER, border: `1px solid ${RULE}`, borderRadius: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: MUTED, margin: '0 0 16px' }}>
              The roadmap is shaped by what the community asks for.
            </p>
            <a href="/contact" style={{ display: 'inline-block', fontSize: 14, fontWeight: 600, color: BLUE, padding: '10px 20px', border: `1px solid ${BLUE_SOFT}`, borderRadius: 999, background: BLUE_SOFT }}>
              Suggest a feature →
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
