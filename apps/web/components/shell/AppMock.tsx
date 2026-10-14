'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import CherutLogo from '@/components/ui/CherutLogo';

// Ports docs/rebranding/app-mocks.js to React. Renders fabricated, generic
// placeholder screens of the app (never real user data) for marketing use
// (landing hero/tabs, login/register showcase).

const W = 1240;
const H = 660;

const ICONS = [
  <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 14.5h2" /></>,
  <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /></>,
  <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12l3 3 5-6" /></>,
  <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M9 9h6" /></>,
  <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /></>,
];

export function MockStyles() {
  return (
    <style>{`
      .mock { position: relative; width: 100%; aspect-ratio: ${W}/${H}; overflow: hidden; background: #F3F5F9; }
      .mk-c { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform-origin: 0 0; font-family: var(--font-geist-sans), system-ui, sans-serif; color: #14141C; font-size: 13px; line-height: 1.4; display: grid; grid-template-columns: 60px 1fr; text-align: left; }
      .mk-sb { background: #F7F8FC; border-right: 1px solid #E6E8F0; display: flex; flex-direction: column; align-items: center; gap: 14px; padding-top: 18px; }
      .mk-sb i { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #9AA0B4; font-style: normal; }
      .mk-sb i svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
      .mk-sb i.on { background: #E8EDFF; color: #3B5BF6; }
      .mk-sb .lg { margin-bottom: 10px; color: #3B5BF6; }
      .mk-m { padding: 16px 16px 0; overflow: hidden; }
      .mk-p { background: #fff; border: 1px solid #E6E8F0; border-radius: 14px; height: 100%; padding: 24px 28px; overflow: hidden; }
      .mk-h1 { font-size: 22px; font-weight: 600; letter-spacing: -.02em; }
      .mk-sub { color: #6B7085; font-size: 12.5px; margin-top: 4px; }
      .mk-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .mk-lbl { font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #5B6075; }
      .mk-link { color: #3B5BF6; font-weight: 600; font-size: 12px; }
      .mk-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-top: 20px; }
      .mk-stat { border: 1px solid #E6E8F0; border-radius: 10px; padding: 12px 14px; background: #FAFBFD; box-shadow: 0 1px 2px rgba(20,20,40,.04); }
      .mk-stat b { display: block; font-size: 20px; font-weight: 600; margin: 4px 0 2px; letter-spacing: -.02em; }
      .mk-stat small { color: #6B7085; font-size: 11px; }
      .mk-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; margin: 20px -28px 0; border-top: 1px solid #E6E8F0; }
      .mk-cell { padding: 20px 28px; border-right: 1px solid #E6E8F0; }
      .mk-cell:last-child { border-right: 0; }
      .mk-t { font-weight: 600; font-size: 14px; }
      .mk-bars { display: flex; align-items: flex-end; gap: 4px; height: 110px; margin-top: 16px; border-bottom: 1px solid #E6E8F0; padding-bottom: 2px; }
      .mk-bars span { flex: 1; background: #E1E8FF; border-radius: 3px 3px 0 0; display: block; }
      .mk-bars span.hi { background: linear-gradient(#6F8BFF,#3B5BF6); }
      .mk-hab { display: grid; grid-template-columns: 120px 1fr 34px; align-items: center; gap: 10px; padding: 6px 0; font-size: 12.5px; font-weight: 500; }
      .mk-dots { display: flex; gap: 3px; }
      .mk-dots i { flex: 1; height: 9px; border-radius: 2px; background: #EEF0F5; }
      .mk-dots i.y { background: #6F8BFF; }
      .mk-hab em { font-style: normal; text-align: right; color: #6B7085; font-size: 11.5px; }
      .mk-btn { display: inline-flex; align-items: center; gap: 6px; background: #3B5BF6; color: #fff; font-weight: 600; font-size: 12.5px; padding: 8px 14px; border-radius: 8px; }
      .mk-pill { display: inline-block; font-size: 9.5px; font-weight: 700; letter-spacing: .04em; padding: 2px 8px; border-radius: 999px; background: #3B5BF6; color: #fff; text-transform: uppercase; }
      .mk-pill.red { background: #E5484D; }
      .mk-pill.gray { background: #EEF0F5; color: #5B6075; }
      .mk-okrs { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 20px; }
      .mk-card { border: 1px solid #E6E8F0; border-radius: 12px; padding: 18px; box-shadow: 0 1px 2px rgba(20,20,40,.04); }
      .mk-prog { height: 5px; border-radius: 3px; background: #EEF0F5; margin: 8px 0 14px; overflow: hidden; }
      .mk-prog i { display: block; height: 100%; background: #3B5BF6; border-radius: 3px; }
      .mk-kr { border: 1px solid #E6E8F0; background: #FAFBFD; border-radius: 8px; padding: 10px 12px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; }
      .mk-kr b { font-size: 12px; font-weight: 600; display: block; }
      .mk-kr small { color: #6B7085; font-size: 11px; }
      .mk-ck { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid #B6BACB; flex: none; display: inline-block; }
      .mk-ck.y { background: #22A06B; border-color: #22A06B; }
      .mk-ck.b { border-color: #3B5BF6; box-shadow: inset 0 0 0 3px #fff; background: #3B5BF6; }
      .mk-tabs { display: flex; gap: 22px; margin-top: 14px; border-bottom: 1px solid #E6E8F0; font-weight: 500; color: #6B7085; }
      .mk-tabs span { padding: 8px 0; display: inline-block; }
      .mk-tabs .on { color: #3B5BF6; border-bottom: 2px solid #3B5BF6; }
      .mk-kan { display: grid; grid-template-columns: repeat(5,1fr); gap: 12px; margin-top: 16px; }
      .mk-col { background: #F5F6FA; border: 1px solid #E6E8F0; border-radius: 12px; padding: 12px; min-height: 420px; }
      .mk-col h5 { margin: 0 0 10px; font-size: 12.5px; display: flex; justify-content: space-between; font-weight: 600; }
      .mk-col h5 span { background: #E6E8F0; border-radius: 999px; padding: 0 7px; font-size: 11px; }
      .mk-task { background: #fff; border: 1px solid #E6E8F0; border-radius: 8px; padding: 10px; display: flex; gap: 9px; margin-bottom: 8px; font-size: 12.5px; box-shadow: 0 1px 2px rgba(20,20,40,.04); }
      .mk-task .mk-ck { margin-top: 2px; }
      .mk-dream { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-top: 20px; }
      .mk-dream .mk-card { padding: 0; overflow: hidden; box-shadow: 0 1px 2px rgba(20,20,40,.04); }
      .mk-img { height: 210px; position: relative; display: flex; align-items: flex-end; padding: 10px; color: rgba(255,255,255,.85); font-family: var(--font-geist-mono), monospace; font-size: 10px; letter-spacing: .06em; text-transform: uppercase; }
      .mk-img .mk-pill { position: absolute; top: 10px; right: 10px; }
      .mk-dream h6 { margin: 0; padding: 14px 16px 2px; font-size: 14px; font-weight: 600; }
      .mk-dream p { margin: 0; padding: 0 16px 16px; color: #6B7085; font-size: 12px; }
      .mk-heat { margin-top: 18px; display: flex; flex-direction: column; gap: 8px; }
      .mk-heat .mk-hab { grid-template-columns: 150px 1fr 60px; }
      .mk-heat .mk-dots i { height: 14px; border-radius: 3px; }
      .mk-fin { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 6px; }
      .mk-big { font-size: 34px; font-weight: 600; letter-spacing: -.03em; margin: 6px 0; }
      .mk-acc { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #EEF0F5; }
      .mk-cat { display: grid; grid-template-columns: 110px 1fr 70px; gap: 12px; align-items: center; padding: 6px 0; }
      .mk-tx { display: grid; grid-template-columns: 70px 1fr 110px 80px; gap: 12px; padding: 9px 0; border-bottom: 1px solid #EEF0F5; font-size: 12.5px; }
      .mk-tx .neg { color: #14141C; text-align: right; font-weight: 600; }
      .mk-tx .pos { color: #22A06B; text-align: right; font-weight: 600; }
      .mk-jr { display: grid; grid-template-columns: 240px 1fr; gap: 24px; margin-top: 18px; }
      .mk-day { padding: 10px 12px; border-radius: 8px; margin-bottom: 4px; }
      .mk-day.on { background: #E8EDFF; }
      .mk-day b { display: block; font-size: 12.5px; }
      .mk-day small { color: #6B7085; font-size: 11px; }
      .mk-entry { border: 1px solid #E6E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 12px; }
      .mk-entry p { margin: 8px 0 0; color: #3A3D4E; font-size: 13px; line-height: 1.6; }
      .mk-mood { display: flex; gap: 6px; margin-top: 10px; }
      .mk-mood span { font-size: 11px; padding: 3px 9px; border-radius: 999px; background: #F3F4F8; color: #5B6075; }
      .mk-learn-hero { height: 250px; background: radial-gradient(70% 90% at 80% 10%, #3E63F5 0, #1B2E8F 55%, #0A0D1E 100%); position: relative; display: flex; align-items: flex-end; padding: 20px; color: #fff; }
      .mk-learn-play { position: absolute; left: 50%; top: 44%; width: 56px; height: 56px; margin: -28px 0 0 -28px; border-radius: 50%; background: rgba(255,255,255,.95); display: flex; align-items: center; justify-content: center; }
      .mk-learn-time { position: absolute; right: 20px; bottom: 20px; font-size: 12px; opacity: .75; }
      .mk-learn-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 20px; margin-top: 20px; }
    `}</style>
  );
}

function Dots({ n, pattern }: { n: number; pattern: (i: number) => boolean }) {
  return <div className="mk-dots">{Array.from({ length: n }, (_, i) => <i key={i} className={pattern(i) ? 'y' : ''} />)}</div>;
}

function Bars({ values, hi }: { values: number[]; hi: number[] }) {
  return <div className="mk-bars">{values.map((h, i) => <span key={i} className={hi.includes(i) ? 'hi' : ''} style={{ height: `${h}%` }} />)}</div>;
}

function Hab({ name, seed, n = 14 }: { name: string; seed: number; n?: number }) {
  const on = (i: number) => ((i * seed + 3) % 7) < 4;
  const count = Array.from({ length: n }).filter((_, i) => on(i)).length;
  return (
    <div className="mk-hab">
      <span>{name}</span>
      <Dots n={n} pattern={on} />
      <em>{Math.round((count / n) * 100)}%</em>
    </div>
  );
}

function Kr({ t, s, done }: { t: string; s: string; done?: boolean }) {
  return (
    <div className="mk-kr">
      <div><b>{t}</b><small>{s}</small></div>
      <span className={`mk-ck${done ? ' y' : ''}`} />
    </div>
  );
}

function Task({ t, b }: { t: string; b?: boolean }) {
  return <div className="mk-task"><span className={`mk-ck${b ? ' b' : ''}`} /><span>{t}</span></div>;
}

function Col({ t, items }: { t: string; items: string[] }) {
  return (
    <div className="mk-col">
      <h5>{t}<span>{items.length}</span></h5>
      {items.map((x) => <Task key={x} t={x} />)}
    </div>
  );
}

function MockSidebar({ on }: { on: number }) {
  return (
    <div className="mk-sb">
      <CherutLogo className="lg" viewBox="200 279 338 132" width={40} height={16} fillColor="currentColor" />
      {ICONS.map((path, i) => (
        <i key={i} className={i === on ? 'on' : ''}>
          <svg viewBox="0 0 24 24">{path}</svg>
        </i>
      ))}
    </div>
  );
}

function Shell({ on, children }: { on: number; children: React.ReactNode }) {
  return (
    <div className="mk-c">
      <MockSidebar on={on} />
      <div className="mk-m"><div className="mk-p">{children}</div></div>
    </div>
  );
}

function DashboardMock() {
  const t = useTranslations('appMock.dashboard');
  const habitNames = t.raw('habitNames') as string[];
  const habitSeeds = [3, 5, 2, 4, 6, 1];
  return (
    <Shell on={0}>
      <div className="mk-h1">{t('greeting')}</div>
      <div className="mk-sub">{t('subGreeting')}</div>
      <div className="mk-stats">
        <div className="mk-stat"><span className="mk-lbl">{t('stats.overdue.label')}</span><b style={{ color: '#E5484D' }}>2</b><small>{t('stats.overdue.sub')}</small></div>
        <div className="mk-stat"><span className="mk-lbl">{t('stats.dueToday.label')}</span><b>3</b><small>{t('stats.dueToday.sub')}</small></div>
        <div className="mk-stat"><span className="mk-lbl">{t('stats.habits.label')}</span><b>4/6</b><small>{t('stats.habits.sub')}</small></div>
        <div className="mk-stat"><span className="mk-lbl">{t('stats.netWorth.label')}</span><b>$48.2k</b><small>{t('stats.netWorth.sub')}</small></div>
      </div>
      <div className="mk-grid3">
        <div className="mk-cell">
          <div className="mk-row"><span className="mk-t">{t('balance.title')}</span><span className="mk-link">{t('balance.link')}</span></div>
          <div className="mk-big" style={{ fontSize: 28, marginTop: 10 }}>$3,240.00</div>
          <div className="mk-sub">{t('balance.sub')}</div>
          <Bars values={[40, 44, 42, 50, 48, 55, 52, 58, 60, 57, 62, 66, 64, 70, 72, 69, 74, 78, 76, 82]} hi={[19]} />
        </div>
        <div className="mk-cell">
          <div className="mk-row"><span className="mk-t">{t('taskProductivity.title')}</span><span className="mk-link">{t('taskProductivity.link')}</span></div>
          <div className="mk-sub">{t('taskProductivity.sub')}</div>
          <Bars values={[35, 48, 40, 62, 55, 70, 66, 84]} hi={[7]} />
          <div className="mk-row mk-sub"><span>{t('taskProductivity.weeksAgo')}</span><span>{t('taskProductivity.thisWeek')}</span></div>
        </div>
        <div className="mk-cell">
          <div className="mk-row"><span className="mk-t">{t('habitConsistency.title')}</span><span className="mk-link">{t('habitConsistency.link')}</span></div>
          <div className="mk-sub" style={{ marginBottom: 8 }}>{t('habitConsistency.sub')}</div>
          {habitNames.map((name, i) => <Hab key={name} name={name} seed={habitSeeds[i]} />)}
        </div>
      </div>
    </Shell>
  );
}

function OkrsMock() {
  const t = useTranslations('appMock.okrs');
  const objectives = t.raw('objectives') as { title: string; progress: number; krLabel: string; krs: { t: string; s: string; done?: boolean }[] }[];
  return (
    <Shell on={5}>
      <div className="mk-row">
        <div><div className="mk-h1">{t('title')}</div><div className="mk-sub">{t('subtitle')}</div></div>
        <span className="mk-btn">{t('newObjective')}</span>
      </div>
      <div className="mk-okrs">
        {objectives.map((o) => (
          <div className="mk-card" key={o.title}>
            <div className="mk-row"><span className="mk-t">{o.title}</span><span className="mk-pill">{t('active')}</span></div>
            <div className="mk-row" style={{ marginTop: 12 }}><span>{t('progress')}</span><b>{o.progress}%</b></div>
            <div className="mk-prog"><i style={{ width: `${o.progress}%` }} /></div>
            <span className="mk-lbl">{o.krLabel}</span>
            {o.krs.map((kr) => <Kr key={kr.t} t={kr.t} s={kr.s} done={kr.done} />)}
          </div>
        ))}
      </div>
    </Shell>
  );
}

function TasksMock() {
  const t = useTranslations('appMock.tasks');
  const columns = t.raw('columns') as { title: string; items: string[] }[];
  return (
    <Shell on={6}>
      <div className="mk-h1">{t('boardName')}</div>
      <div className="mk-tabs"><span className="on">{t('tabs.board')}</span><span>{t('tabs.calendar')}</span><span>{t('tabs.time')}</span></div>
      <div className="mk-kan">
        {columns.map((col) => <Col key={col.title} t={col.title} items={col.items} />)}
      </div>
    </Shell>
  );
}

const DREAM_STYLES = [
  { bg: 'linear-gradient(180deg,#BFD7F2,#F4D9C6)' },
  { bg: 'linear-gradient(180deg,#FFC9A3,#FFE7CF)' },
  { bg: 'linear-gradient(180deg,#D8EBD0,#F3F0DD)' },
  { bg: 'linear-gradient(180deg,#2B2466,#7462D8)', red: true },
];

function DreamsMock() {
  const t = useTranslations('appMock.dreams');
  const dreams = t.raw('items') as { t: string; s: string; pill: string }[];
  return (
    <Shell on={2}>
      <div className="mk-h1" style={{ fontSize: 26 }}>{t('title')}</div>
      <div className="mk-sub">{t('subtitle')}</div>
      <div className="mk-row" style={{ marginTop: 16, justifyContent: 'flex-start', gap: 10 }}>
        <span className="mk-btn">{t('addGoal')}</span>
        <span className="mk-pill gray" style={{ padding: '6px 12px', fontSize: 11 }}>{t('active')}</span>
        <span className="mk-pill gray" style={{ padding: '6px 12px', fontSize: 11, background: 'transparent' }}>{t('archived')}</span>
      </div>
      <div className="mk-dream">
        {dreams.map((d, i) => (
          <div className="mk-card" key={d.t}>
            <div className="mk-img" style={{ background: DREAM_STYLES[i].bg }}><span className={`mk-pill${DREAM_STYLES[i].red ? ' red' : ''}`}>{d.pill}</span></div>
            <h6>{d.t}</h6>
            <p>{d.s}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function HabitsMock() {
  const t = useTranslations('appMock.habits');
  const names = t.raw('names') as string[];
  return (
    <Shell on={3}>
      <div className="mk-row">
        <div><div className="mk-h1">{t('title')}</div><div className="mk-sub">{t('subtitle')}</div></div>
        <span className="mk-btn">{t('newHabit')}</span>
      </div>
      <div className="mk-heat">
        {names.map((n, i) => <Hab key={n} name={n} seed={i + 2} n={30} />)}
      </div>
      <div className="mk-stats" style={{ marginTop: 26 }}>
        <div className="mk-stat"><span className="mk-lbl">{t('stats.bestStreak.label')}</span><b>{t('stats.bestStreak.value')}</b><small>{names[1]}</small></div>
        <div className="mk-stat"><span className="mk-lbl">{t('stats.today.label')}</span><b>4/7</b><small>{t('stats.today.sub')}</small></div>
        <div className="mk-stat"><span className="mk-lbl">{t('stats.thisWeek.label')}</span><b>78%</b><small>{t('stats.thisWeek.sub')}</small></div>
        <div className="mk-stat"><span className="mk-lbl">{t('stats.needsAttention.label')}</span><b>{names[4]}</b><small>{t('stats.needsAttention.sub')}</small></div>
      </div>
    </Shell>
  );
}

function FinancesMock() {
  const t = useTranslations('appMock.finances');
  const categories = t.raw('categories') as [string, number, string][];
  const accounts = t.raw('accounts') as [string, string, string][];
  const tx = t.raw('transactions') as [string, string, string, string][];
  return (
    <Shell on={1}>
      <div className="mk-fin">
        <div>
          <span className="mk-lbl">{t('totalBalance')}</span>
          <div className="mk-big">$12,480.00</div>
          <span className="mk-pill" style={{ background: '#E3F5EC', color: '#1A7F55' }}>{t('monthDelta')}</span>
          <div className="mk-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginTop: 18 }}>
            <div className="mk-stat"><span className="mk-lbl">{t('income')}</span><b>$5,200</b></div>
            <div className="mk-stat"><span className="mk-lbl">{t('expenses')}</span><b>$4,560</b></div>
            <div className="mk-stat"><span className="mk-lbl">{t('saved')}</span><b>12%</b></div>
          </div>
          <div className="mk-t" style={{ marginTop: 22 }}>{t('spendingByCategory')}</div>
          {categories.map(([n, w, v]) => (
            <div className="mk-cat" key={n}><span>{n}</span><div className="mk-prog" style={{ margin: 0 }}><i style={{ width: `${w}%` }} /></div><b style={{ textAlign: 'right' }}>{v}</b></div>
          ))}
        </div>
        <div>
          <div className="mk-row"><span className="mk-lbl">{t('accountsAndCards')}</span><span className="mk-link">{t('addAccount')}</span></div>
          {accounts.map(([a, b, c]) => (
            <div className="mk-acc" key={a}><div><b>{a}</b><div className="mk-sub" style={{ margin: 0 }}>{b}</div></div><b>{c}</b></div>
          ))}
          <div className="mk-t" style={{ margin: '22px 0 4px' }}>{t('transactionsTitle')}</div>
          {tx.map(([d, n, c, v]) => (
            <div className="mk-tx" key={d + n}><span className="mk-sub" style={{ margin: 0 }}>{d}</span><span>{n}</span><span className="mk-sub" style={{ margin: 0 }}>{c}</span><span className={v[0] === '+' ? 'pos' : 'neg'}>{v}</span></div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

const LEARNING_PROGRESS = [100, 100, 40, 0];

function LearningMock() {
  const t = useTranslations('appMock.learning');
  const modules = t.raw('modules') as [string, string][];
  return (
    <Shell on={10}>
      <div className="mk-row">
        <div><div className="mk-h1">{t('courseName')}</div><div className="mk-sub">{t('subtitle')}</div></div>
        <span className="mk-btn">{t('continueLesson')}</span>
      </div>
      <div className="mk-learn-grid">
        <div className="mk-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="mk-learn-hero">
            <div className="mk-learn-play"><span style={{ width: 0, height: 0, borderLeft: '16px solid #1B2E8F', borderTop: '10px solid transparent', borderBottom: '10px solid transparent', marginLeft: 4 }} /></div>
            <div>
              <div className="mk-lbl" style={{ color: 'rgba(255,255,255,.7)' }}>{t('moduleLessonLabel')}</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{t('lessonTitle')}</div>
            </div>
            <span className="mk-learn-time">08:12 / 11:40</span>
          </div>
          <div style={{ padding: '14px 18px' }}>
            <div className="mk-prog" style={{ margin: '0 0 10px' }}><i style={{ width: '70%' }} /></div>
            <div className="mk-row mk-sub" style={{ margin: 0 }}><span>{t('exercise')}</span><span className="mk-link">{t('openExercise')}</span></div>
          </div>
        </div>
        <div>
          <div className="mk-row"><span className="mk-t">{t('modulesTitle')}</span><span className="mk-sub" style={{ margin: 0 }}>{t('percentComplete')}</span></div>
          {modules.map(([title, sub], i) => (
            <div className="mk-kr" style={{ marginTop: 10, padding: '12px 14px' }} key={title}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 11, color: '#6B7085' }}>{String(i + 1).padStart(2, '0')}</span>
                <div><b>{title}</b><small>{sub}</small></div>
              </div>
              {LEARNING_PROGRESS[i] === 100 ? <span className="mk-ck y" /> : <span style={{ fontSize: 11.5, fontWeight: 600, color: LEARNING_PROGRESS[i] ? '#3B5BF6' : '#9AA0B4' }}>{LEARNING_PROGRESS[i]}%</span>}
            </div>
          ))}
          <div className="mk-stats" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 14 }}>
            <div className="mk-stat"><span className="mk-lbl">{t('templates.label')}</span><b>6</b><small>{t('templates.sub')}</small></div>
            <div className="mk-stat"><span className="mk-lbl">{t('streak.label')}</span><b>{t('streak.value')}</b><small>{t('streak.sub')}</small></div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function JournalMock() {
  const t = useTranslations('appMock.journal');
  const days = t.raw('days') as [string, string][];
  const entries = t.raw('entries') as { label: string; body: string; tags: [string, string] }[];
  return (
    <Shell on={8}>
      <div className="mk-row">
        <div><div className="mk-h1">{t('title')}</div><div className="mk-sub">{t('subtitle')}</div></div>
        <span className="mk-btn">{t('newEntry')}</span>
      </div>
      <div className="mk-jr">
        <div>{days.map(([a, b], i) => <div className={`mk-day${i === 0 ? ' on' : ''}`} key={a}><b>{a}</b><small>{b}</small></div>)}</div>
        <div>
          {entries.map((entry) => (
            <div className="mk-entry" key={entry.label}>
              <span className="mk-lbl" style={{ color: '#3B5BF6' }}>{entry.label}</span>
              <p>{entry.body}</p>
              <div className="mk-mood"><span>{entry.tags[0]}</span><span>{entry.tags[1]}</span></div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

export type AppMockKind = 'dashboard' | 'okrs' | 'tasks' | 'dreams' | 'habits' | 'finances' | 'learning' | 'journal';

const MOCKS: Record<AppMockKind, () => React.ReactElement> = {
  dashboard: DashboardMock,
  okrs: OkrsMock,
  tasks: TasksMock,
  dreams: DreamsMock,
  habits: HabitsMock,
  finances: FinancesMock,
  learning: LearningMock,
  journal: JournalMock,
};

// Scales the fixed W×H mock canvas to fit its container, matching the
// prototype's ResizeObserver-driven `fit()` function.
function useMockScale<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [style, setStyle] = useState<{ transform: string; height: number }>({ transform: 'scale(1)', height: H });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      const s = Math.max(w / W, w < 700 ? 0.5 : 0);
      setStyle({ transform: `scale(${s})`, height: Math.min(H * s, w < 700 ? 420 : 1e4) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, style };
}

export function AppMock({ kind }: { kind: AppMockKind }) {
  const { ref, style } = useMockScale<HTMLDivElement>();
  const Comp = MOCKS[kind];
  return (
    <div ref={ref} className="mock" style={{ aspectRatio: 'auto', height: style.height }}>
      <div style={{ transformOrigin: '0 0', transform: style.transform }}>
        <Comp />
      </div>
    </div>
  );
}

// Browser-chrome frame wrapper — matches the prototype's `.frame`/`.frame-bar`.
export function AppMockFrame({ label, children, dark }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <>
      <style>{`
        .amf { background: #fff; border: 1px solid rgba(11,11,16,.09); border-radius: 14px; overflow: hidden; box-shadow: 0 1px 2px rgba(11,11,16,.04), 0 30px 80px -30px rgba(11,11,16,.25); }
        .amf.dark { border-radius: 14px 14px 0 0; border: 1px solid rgba(255,255,255,.22); border-bottom: 0; box-shadow: 0 0 0 6px rgba(255,255,255,.06), 0 50px 120px -20px rgba(0,0,0,.7); }
        .amf-bar { height: 36px; display: flex; align-items: center; gap: 6px; padding: 0 14px; border-bottom: 1px solid rgba(11,11,16,.09); background: #F6F6F4; }
        .amf-bar i { width: 9px; height: 9px; border-radius: 50%; background: rgba(11,11,16,.14); display: block; }
        .amf-bar span { margin-left: 14px; font-family: var(--font-geist-mono), monospace; font-size: 11px; color: #6B6B76; }
      `}</style>
      <div className={`amf${dark ? ' dark' : ''}`}>
        <div className="amf-bar"><i /><i /><i /><span>{label}</span></div>
        {children}
      </div>
    </>
  );
}
