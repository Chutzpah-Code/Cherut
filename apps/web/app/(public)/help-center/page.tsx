'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageShell } from '@/components/shell/Shell';

const BG      = '#07070D';
const SURF    = '#0F0F1B';
const SURF2   = '#161628';
const TEXT    = '#EDEEF6';
const MUTED   = 'rgba(237,238,246,0.46)';
const ACCENT  = 'oklch(0.68 0.24 260)';
const ACCENT_DIM = 'rgba(80,110,255,0.12)';
const RULE    = 'rgba(255,255,255,0.08)';

const categoryIcons = ['◐', '◇', '◯', '✦', '◈'];

export default function HelpCenterPage() {
  const t = useTranslations('helpCenterPage');
  const categories = t.raw('categories') as { title: string; articles: { title: string; body: string }[] }[];

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpenMap(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <PageShell kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .hc-wrap { max-width: 860px; margin: 0 auto; padding: 48px 20px 80px; display: flex; flex-direction: column; gap: 32px; }
        .hc-category { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 16px; overflow: hidden; }
        .hc-cat-head { display: flex; align-items: center; gap: 14px; padding: 22px 24px; border-bottom: 1px solid ${RULE}; }
        .hc-cat-icon { width: 38px; height: 38px; border-radius: 10px; background: ${ACCENT_DIM}; color: ${ACCENT}; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .hc-cat-title { font-size: 17px; font-weight: 700; color: ${TEXT}; margin: 0; letter-spacing: -0.01em; }
        .hc-article { border-bottom: 1px solid ${RULE}; }
        .hc-article:last-child { border-bottom: none; }
        .hc-art-btn { width: 100%; text-align: left; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 16px; font-weight: 600; color: ${TEXT}; transition: background .1s; }
        .hc-art-btn:hover { background: rgba(255,255,255,0.04); }
        .hc-art-chevron { font-size: 18px; color: ${ACCENT}; transition: transform .2s; flex-shrink: 0; display: inline-block; }
        .hc-art-body { padding: 0 24px 18px; font-size: 16.5px; color: ${MUTED}; line-height: 1.65; }
        .hc-cta { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 14px; padding: 28px 24px; text-align: center; }
        @media (min-width: 640px)  { .hc-wrap { padding: 64px 32px 100px; } }
        @media (min-width: 1024px) { .hc-wrap { padding: 80px 32px 120px; } }
      `}</style>

      <div style={{ background: BG }}>
        <div className="hc-wrap">
          {categories.map((cat, ci) => (
            <div key={cat.title} className="hc-category">
              <div className="hc-cat-head">
                <div className="hc-cat-icon">{categoryIcons[ci % categoryIcons.length]}</div>
                <h2 className="hc-cat-title">{cat.title}</h2>
              </div>
              <div>
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
            <p style={{ fontSize: 17, color: MUTED, margin: '0 0 16px', lineHeight: 1.55 }}>{t('notFound')}</p>
            <a href="/contact" style={{ display: 'inline-block', background: TEXT, color: BG, fontSize: 14, fontWeight: 700, padding: '12px 22px', borderRadius: 999 }}>
              {t('contactCta')} →
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
