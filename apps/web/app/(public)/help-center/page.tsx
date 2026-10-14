'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageShell, SHELL_TOKENS } from '@/components/shell/Shell';
import { Section, Reveal, FaqItem } from '@/components/shell/primitives';

const { mute, rule, acc } = SHELL_TOKENS;

export default function HelpCenterPage() {
  const t = useTranslations('helpCenterPage');
  const categories = t.raw('categories') as { title: string; articles: { title: string; body: string }[] }[];
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return categories;
    return categories
      .map((cat) => ({ ...cat, articles: cat.articles.filter((a) => `${a.title} ${a.body}`.toLowerCase().includes(q)) }))
      .filter((cat) => cat.articles.length > 0);
  }, [categories, query]);

  return (
    <PageShell
      crumb={t('hero.kicker')}
      title={t('hero.title')}
      lead={t('hero.lead')}
    >
      <style>{`
        .search { display: flex; align-items: center; gap: 12px; max-width: 560px; height: 56px; padding: 0 18px; border: 1px solid ${rule}; border-radius: 14px; background: #fff; box-shadow: 0 20px 50px -30px rgba(27,46,143,.35); margin-top: 32px; }
        .search input { all: unset; flex: 1; font-size: 16px; }
        .search svg { width: 18px; height: 18px; color: ${mute}; }
        .hc { display: grid; grid-template-columns: 220px minmax(0,1fr); gap: 64px; }
        .hc nav { position: sticky; top: 112px; align-self: start; display: flex; flex-direction: column; gap: 4px; }
        .hc nav a { padding: 8px 12px; border-radius: 8px; font-size: 14px; color: ${SHELL_TOKENS.ink2}; }
        .hc nav a:hover { background: ${SHELL_TOKENS.off}; color: ${SHELL_TOKENS.ink}; }
        .hc-g { padding-bottom: 48px; scroll-margin-top: 96px; }
        .hc-g h2 { font-size: 24px; letter-spacing: -.025em; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
        .hc-g h2 span { font-family: var(--font-geist-mono), monospace; font-size: 12px; color: ${acc}; font-weight: 400; }
        @media (max-width: 960px) { .hc { grid-template-columns: minmax(0,1fr); } .hc nav { display: none; } }
      `}</style>

      <Section padTop0 style={{ paddingBottom: 0 }}>
        <label className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input placeholder={t('searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </Section>

      <Section>
        <div className="hc">
          <nav>
            {categories.map((cat, i) => <a key={cat.title} href={`#g${i}`}>{cat.title}</a>)}
          </nav>
          <div>
            {filtered.map((cat) => {
              const i = categories.findIndex((c) => c.title === cat.title);
              return (
                <Reveal key={cat.title} as="div" className="hc-g" id={`g${i}`}>
                  <h2><span>{String(i + 1).padStart(2, '0')}</span>{cat.title}</h2>
                  {cat.articles.map((art, ai) => <FaqItem key={art.title} q={art.title} a={art.body} open={ai === 0} />)}
                </Reveal>
              );
            })}
            {filtered.length === 0 && <p style={{ color: mute }}>{t('noResults')}</p>}

            <Reveal>
              <div className="band" style={{ marginTop: 32 }}>
                <div><h2 className="h2">{t('notFound')}</h2></div>
                <a href="/contact" className="btn btn-light">{t('contactCta')} →</a>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
