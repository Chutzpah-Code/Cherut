'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SHELL_TOKENS } from './tokens';

const { ink, ink2, mute, paper, off, rule, ruleD, acc, accSoft, ease, max } = SHELL_TOKENS;

// Base CSS shared by every page built on this design system — rendered once
// per page (PageShell renders it; LandingPageClient, which doesn't use
// PageShell, renders it itself too).
export function SiteStyles() {
  return (
    <style>{`
      .mono { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 12px; letter-spacing: .04em; text-transform: uppercase; }
      .reveal { opacity: 0; transform: translateY(14px); transition: opacity .7s ${ease}, transform .7s ${ease}; }
      .reveal.in { opacity: 1; transform: none; }
      @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
      .wrap { max-width: ${max}px; margin: 0 auto; padding: 0 32px; }
      .sec { padding: 96px 0; }
      .h2 { font-size: clamp(30px,3.6vw,44px); line-height: 1.06; letter-spacing: -.035em; font-weight: 600; text-wrap: balance; margin: 0; color: ${ink}; }
      .lede { font-size: 18px; color: ${mute}; line-height: 1.55; max-width: 560px; margin: 0; }

      .btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 46px; padding: 0 22px; border-radius: 10px; font-weight: 500; font-size: 15px; font-family: inherit; border: 0; cursor: pointer; transition: transform .16s ${ease}, background .2s, color .2s, border-color .2s; white-space: nowrap; }
      .btn:active { transform: scale(.97); }
      .btn-sm { height: 38px; padding: 0 16px; font-size: 14px; border-radius: 8px; }
      .btn-dark { background: ${ink}; color: #fff; }
      .btn-dark:hover { background: ${acc}; color: #fff; }
      .btn-line { border: 1px solid ${rule}; background: #fff; color: ${ink}; }
      .btn-line:hover { border-color: ${ink}; color: ${ink}; }
      .btn-light { background: #fff; color: ${ink}; }
      .btn-light:hover { background: ${acc}; color: #fff; }
      .btn-ghost-d { border: 1px solid ${ruleD}; color: #fff; background: transparent; }
      .btn-ghost-d:hover { border-color: #fff; }

      .split { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.5fr); gap: 72px; align-items: start; }
      .split > .sticky { position: sticky; top: 112px; display: flex; flex-direction: column; gap: 16px; }
      @media (max-width: 960px) { .split { grid-template-columns: minmax(0,1fr); gap: 40px; } .split > .sticky { position: static; } }

      .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
      .card { border: 1px solid ${rule}; border-radius: 18px; padding: 28px; display: flex; flex-direction: column; gap: 10px; background: #fff; transition: border-color .25s; }
      .card:hover { border-color: rgba(11,11,16,.2); }
      .card .k { font-family: var(--font-geist-mono), monospace; font-size: 12px; color: ${acc}; }
      .card h3 { font-size: 20px; letter-spacing: -.02em; font-weight: 600; line-height: 1.2; margin: 0; }
      .card p { color: ${mute}; font-size: 15px; margin: 0; }

      .checks { display: flex; flex-direction: column; border-top: 1px solid ${rule}; padding: 0; margin: 0; }
      .checks li { list-style: none; display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid ${rule}; font-size: 16px; }
      .checks li::before { content: ""; flex: none; width: 18px; height: 18px; margin-top: 2px; border-radius: 5px; background: ${acc} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 8.5l2.5 2.5L12 5.5' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/14px no-repeat; }
      .checks.neg li::before { background: ${ink} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M5 5l6 6M11 5l-6 6' fill='none' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") center/12px no-repeat; }

      .band { background: ${ink}; color: #fff; border-radius: 24px; padding: 64px; display: flex; justify-content: space-between; align-items: center; gap: 32px; flex-wrap: wrap; position: relative; overflow: hidden; }
      .band::after { content: ""; position: absolute; right: -80px; top: -80px; width: 320px; height: 320px; border-radius: 50%; background: radial-gradient(circle, rgba(59,91,246,.55), transparent 70%); pointer-events: none; }
      .band h2 { max-width: 620px; color: #fff; }
      .band p { color: rgba(255,255,255,.62); margin-top: 12px; max-width: 520px; }
      .band .btn { position: relative; z-index: 1; }

      .form { border: 1px solid ${rule}; border-radius: 18px; padding: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; background: #fff; box-shadow: 0 30px 70px -40px rgba(27,46,143,.35); }
      .form h2 { grid-column: 1/-1; margin-bottom: 6px; }
      .form .lede { grid-column: 1/-1; margin-top: -6px; font-size: 16px; }
      .f { display: flex; flex-direction: column; gap: 8px; }
      .f.full { grid-column: 1/-1; }
      .f label { font-size: 13px; font-weight: 500; color: ${ink2}; }
      .f input, .f select, .f textarea { font: inherit; font-size: 15px; color: ${ink}; background: ${off}; border: 1px solid transparent; border-radius: 10px; padding: 12px 14px; outline: none; transition: border-color .2s, background .2s, box-shadow .2s; width: 100%; }
      .f textarea { min-height: 150px; resize: vertical; }
      .f input:focus, .f select:focus, .f textarea:focus { background: #fff; border-color: ${acc}; box-shadow: 0 0 0 4px ${accSoft}; }
      .form .btn { grid-column: 1/-1; justify-self: start; }
      .sent { grid-column: 1/-1; padding: 14px 16px; border-radius: 10px; background: ${accSoft}; color: ${acc}; font-weight: 500; }

      .tag { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-geist-mono), monospace; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; padding: 4px 10px; border-radius: 999px; background: ${off}; color: ${ink2}; }
      .tag.acc { background: ${accSoft}; color: ${acc}; }
      .tag.ink { background: ${ink}; color: #fff; }

      .plan { background: #fff; border: 1px solid ${rule}; border-radius: 18px; padding: 32px; display: flex; flex-direction: column; gap: 20px; position: relative; }
      .plan.hl { background: ${ink}; color: #fff; border-color: ${ink}; }
      .plan .ptag { position: absolute; top: 24px; right: 24px; }
      .plan h3 { font-size: 18px; font-weight: 600; margin: 0; }
      .price { display: flex; align-items: baseline; gap: 6px; }
      .price b { font-size: 48px; font-weight: 600; letter-spacing: -.04em; line-height: 1; }
      .price span { font-size: 15px; opacity: .6; }
      .plan .per { font-size: 13px; opacity: .6; margin: -12px 0 0; }
      .plan .for { font-size: 15px; opacity: .78; min-height: 46px; margin: 0; }
      .plan ul { list-style: none; padding: 20px 0 0; margin: 0; border-top: 1px solid ${rule}; display: flex; flex-direction: column; gap: 10px; font-size: 14px; }
      .plan.hl ul { border-color: ${ruleD}; }
      .plan li { display: flex; gap: 10px; }
      .plan li::before { content: "✓"; color: ${acc}; font-weight: 600; }
      .plan.hl li::before { color: ${SHELL_TOKENS.accLight}; }
      .plan .btn { margin-top: auto; justify-content: center; }

      details.faq-item { border-bottom: 1px solid ${rule}; }
      details.faq-item:first-of-type { border-top: 1px solid ${rule}; }
      details.faq-item summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; gap: 24px; padding: 22px 0; font-size: 17px; font-weight: 500; letter-spacing: -.01em; }
      details.faq-item summary::-webkit-details-marker { display: none; }
      details.faq-item summary::after { content: "+"; font-family: var(--font-geist-mono), monospace; font-size: 18px; color: ${mute}; transition: transform .25s ${ease}; }
      details.faq-item[open] summary::after { transform: rotate(45deg); color: ${acc}; }
      details.faq-item p { padding: 0 48px 24px 0; color: ${mute}; font-size: 15.5px; line-height: 1.6; margin: 0; }

      @media (max-width: 960px) { .sec { padding: 72px 0; } .form { grid-template-columns: 1fr; padding: 24px; } .band { padding: 40px 28px; } }
      @media (max-width: 640px) { .wrap { padding: 0 20px; } }
    `}</style>
  );
}

export function Wrap({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="wrap" style={style}>{children}</div>;
}

export function Section({ children, id, padTop0, style }: { children: React.ReactNode; id?: string; padTop0?: boolean; style?: React.CSSProperties }) {
  return (
    <section id={id} className="sec" style={{ ...(padTop0 ? { paddingTop: 0 } : {}), ...style }}>
      <Wrap>{children}</Wrap>
    </section>
  );
}

// IntersectionObserver-based scroll reveal, matching the prototype's
// `.reveal`/`.reveal.in` CSS + its one-shot `io.unobserve` JS behaviour.
// `prefers-reduced-motion` is handled in CSS (components/shell/Shell.tsx).
export function Reveal({ children, style, as: As = 'div', className, id }: { children: React.ReactNode; style?: React.CSSProperties; as?: 'div' | 'span'; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setInView(true); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Comp = As as any;
  return (
    <Comp ref={ref} id={id} className={`reveal${inView ? ' in' : ''}${className ? ` ${className}` : ''}`} style={style}>
      {children}
    </Comp>
  );
}

type BtnVariant = 'dark' | 'line' | 'light' | 'ghost-d';

export function Btn({
  href, onClick, variant = 'dark', small, type = 'button', children, style, ariaLabel,
}: {
  href?: string;
  onClick?: () => void;
  variant?: BtnVariant;
  small?: boolean;
  type?: 'button' | 'submit';
  children: React.ReactNode;
  style?: React.CSSProperties;
  ariaLabel?: string;
}) {
  const cls = `btn btn-${variant}${small ? ' btn-sm' : ''}`;
  if (href) {
    return <Link href={href} className={cls} style={style} aria-label={ariaLabel}>{children}</Link>;
  }
  return (
    <button type={type} onClick={onClick} className={cls} style={style} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export function Tag({ children, variant }: { children: React.ReactNode; variant?: 'acc' | 'ink' }) {
  return <span className={`tag${variant ? ` ${variant}` : ''}`}>{children}</span>;
}

export function Cards({ children, cols }: { children: React.ReactNode; cols?: number }) {
  return <div className="cards" style={cols ? { gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` } : undefined}>{children}</div>;
}

export function Card({ k, title, children }: { k?: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      {k && <span className="k">{k}</span>}
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export function ChecksList({ items, neg }: { items: string[]; neg?: boolean }) {
  return (
    <ul className={`checks${neg ? ' neg' : ''}`}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function Band({ title, body, ctaLabel, ctaHref }: { title: string; body?: string; ctaLabel: string; ctaHref: string }) {
  return (
    <div className="band">
      <div>
        <h2 className="h2">{title}</h2>
        {body && <p>{body}</p>}
      </div>
      <Btn href={ctaHref} variant="light">{ctaLabel} →</Btn>
    </div>
  );
}

export function FormField({ label, id, type = 'text', required, full, children }: {
  label: string; id: string; type?: string; required?: boolean; full?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className={`f${full ? ' full' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children ?? <input id={id} type={type} required={required} />}
    </div>
  );
}

export function FaqItem({ q, a, open }: { q: string; a: string; open?: boolean }) {
  return (
    <details className="faq-item" open={open}>
      <summary>{q}</summary>
      <p>{a}</p>
    </details>
  );
}
