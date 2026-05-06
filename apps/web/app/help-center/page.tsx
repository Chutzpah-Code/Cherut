'use client';

import { useState } from 'react';
import { PageShell, SHELL_TOKENS } from '@/components/shell/Shell';

const { BLUE, BLUE_SOFT, INK, PAPER, PAPER_2, MUTED, RULE } = SHELL_TOKENS;

const categories = [
  {
    icon: '◐',
    title: 'Getting started',
    articles: [
      { title: 'What is Cherut?', body: 'Cherut is a personal operating system that connects your habits, tasks, OKRs, journal and vision board in one place. Start by setting up your Life Areas and creating your first Objective.' },
      { title: 'Setting up your account', body: 'After signing up, you will be guided through a short onboarding flow. Pick the modules you want active — you can turn others on later from Settings.' },
      { title: 'Choosing your first module', body: 'Not sure where to start? Most people begin with Habits or Tasks. Once you have a rhythm, add OKRs to give your daily actions a direction.' },
    ],
  },
  {
    icon: '◇',
    title: 'Habits',
    articles: [
      { title: 'Creating a habit', body: 'Go to Habits → New Habit. Set a name, frequency (daily, weekdays, or custom days), and optionally link it to a Life Area or OKR.' },
      { title: 'How streaks work', body: 'A streak increments each day you complete a habit. Missing a day breaks the streak, but your completion history is always preserved.' },
      { title: 'Archiving vs deleting', body: 'Archive a habit to pause it without losing history. Delete only when you want to remove all records permanently.' },
    ],
  },
  {
    icon: '◯',
    title: 'Tasks & Boards',
    articles: [
      { title: 'Creating a board', body: 'Go to Tasks and click "New Board". Give it a name and optionally assign it to a Life Area. Boards have columns you can rename and reorder.' },
      { title: 'Moving tasks between columns', body: 'Drag a task card to any column, or open the task and change its status from the dropdown.' },
      { title: 'Linking tasks to OKRs', body: 'Inside any task, use the "Linked OKR" field to connect it to a Key Result. Progress is reflected in your OKR view.' },
    ],
  },
  {
    icon: '✦',
    title: 'OKRs',
    articles: [
      { title: 'What are OKRs?', body: 'OKRs (Objectives and Key Results) are a goal-setting framework. An Objective is an ambitious qualitative goal; Key Results are measurable outcomes that indicate you have reached it.' },
      { title: 'Setting your first OKR', body: 'Go to OKRs → New Objective. Write a clear, inspiring objective for the quarter. Then add 1–5 Key Results with numeric targets.' },
      { title: 'Weekly check-ins', body: 'Every week, open each Key Result and update the current value. Add a confidence score and a short note. Cherut tracks the trend over time.' },
    ],
  },
  {
    icon: '◈',
    title: 'Account & billing',
    articles: [
      { title: 'Changing your plan', body: 'Go to Settings → Billing to upgrade, downgrade or cancel your plan. Changes take effect at the end of your current billing period.' },
      { title: 'Exporting your data', body: 'Go to Settings → Data → Export. Your habits, tasks, OKRs, journal and all other data are exported as a single JSON file.' },
      { title: 'Deleting your account', body: 'Go to Settings → Account → Delete account. This permanently removes all your data. It cannot be undone. Export first if you want a copy.' },
    ],
  },
];

export default function HelpCenterPage() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setOpenMap(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <PageShell
      kicker="Help Center"
      title="How can we help?"
      lead="Guides, answers and everything you need to get the most out of Cherut."
    >
      <style>{`
        .hc-wrap { max-width: 860px; margin: 0 auto; padding: 48px 20px 80px; display: flex; flex-direction: column; gap: 32px; }
        .hc-category { background: ${PAPER}; border: 1px solid ${RULE}; border-radius: 16px; overflow: hidden; }
        .hc-cat-head { display: flex; align-items: center; gap: 14px; padding: 22px 24px; border-bottom: 1px solid ${RULE}; }
        .hc-cat-icon { width: 38px; height: 38px; border-radius: 10px; background: ${BLUE_SOFT}; color: ${BLUE}; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .hc-cat-title { font-size: 17px; font-weight: 700; color: ${INK}; margin: 0; letter-spacing: -0.01em; }
        .hc-articles { display: flex; flex-direction: column; }
        .hc-article { border-bottom: 1px solid ${RULE}; }
        .hc-article:last-child { border-bottom: none; }
        .hc-art-btn {
          width: 100%; text-align: left; padding: 16px 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          background: none; border: none; cursor: pointer; font-family: inherit;
          font-size: 15px; font-weight: 600; color: ${INK}; transition: background .1s;
        }
        .hc-art-btn:hover { background: ${PAPER_2}; }
        .hc-art-chevron { font-size: 18px; color: ${BLUE}; transition: transform .2s; flex-shrink: 0; display: inline-block; }
        .hc-art-body { padding: 0 24px 18px; font-size: 15px; color: ${MUTED}; line-height: 1.65; }
        .hc-cta { background: ${PAPER}; border: 1px solid ${RULE}; border-radius: 14px; padding: 28px 24px; text-align: center; }

        @media (min-width: 640px) {
          .hc-wrap { padding: 64px 32px 100px; }
        }
        @media (min-width: 1024px) {
          .hc-wrap { padding: 80px 32px 120px; }
        }
      `}</style>

      <div style={{ background: PAPER_2 }}>
        <div className="hc-wrap">
          {categories.map((cat) => (
            <div key={cat.title} className="hc-category">
              <div className="hc-cat-head">
                <div className="hc-cat-icon">{cat.icon}</div>
                <h2 className="hc-cat-title">{cat.title}</h2>
              </div>
              <div className="hc-articles">
                {cat.articles.map((art) => {
                  const key = `${cat.title}::${art.title}`;
                  const open = !!openMap[key];
                  return (
                    <div key={art.title} className="hc-article">
                      <button className="hc-art-btn" onClick={() => toggle(key)}>
                        <span>{art.title}</span>
                        <span className="hc-art-chevron" style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                      </button>
                      {open && <div className="hc-art-body">{art.body}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="hc-cta">
            <p style={{ fontSize: 16, color: MUTED, margin: '0 0 16px', lineHeight: 1.55 }}>
              Did not find what you were looking for?
            </p>
            <a href="/contact" style={{ display: 'inline-block', background: INK, color: PAPER, fontSize: 14, fontWeight: 600, padding: '12px 22px', borderRadius: 999 }}>
              Contact us →
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
