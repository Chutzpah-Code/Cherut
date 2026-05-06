'use client';

import { useState } from 'react';
import { PageShell, SHELL_TOKENS } from '@/components/shell/Shell';

const { BLUE, BLUE_SOFT, INK, PAPER, PAPER_2, MUTED, RULE } = SHELL_TOKENS;

const whyJoin = [
  { icon: '◐', title: 'Small team, real ownership', body: 'You will own features end-to-end. No silos, no waiting for sign-off chains. Your decisions ship.' },
  { icon: '◇', title: 'Work that reaches real people', body: 'Cherut is used daily by people building their lives. What you build has direct, visible impact.' },
  { icon: '◯', title: 'Async-first, no nonsense', body: 'We write well, document decisions and trust each other. No daily standups. Deep work by default.' },
];

const values = [
  'Ownership over permission-asking',
  'Craft over speed for its own sake',
  'Honesty over comfortable ambiguity',
  'Long-term thinking over short-term wins',
];

const skillAreas = ['Engineering', 'Design', 'Product', 'Marketing', 'Content', 'Operations', 'Other'];

export default function CareersPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [skill, setSkill] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageShell
      kicker="Careers"
      title="Come build the future of intentional living"
      lead="No open roles right now — but we always want to hear from exceptional people."
    >
      <style>{`
        .ca-wrap { max-width: 1180px; margin: 0 auto; padding: 48px 20px 80px; }
        .ca-section { margin-bottom: 64px; }
        .ca-section-title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: ${INK}; margin: 0 0 24px; }
        .ca-why-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .ca-card { background: ${PAPER}; border: 1px solid ${RULE}; border-radius: 14px; padding: 24px; display: flex; gap: 16px; }
        .ca-icon { width: 40px; height: 40px; border-radius: 10px; background: ${BLUE_SOFT}; color: ${BLUE}; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .ca-values-list { display: flex; flex-direction: column; gap: 12px; }
        .ca-value { display: flex; align-items: flex-start; gap: 12px; font-size: 16px; color: rgba(15,15,30,0.85); }
        .ca-form { background: ${PAPER}; border: 1px solid ${RULE}; border-radius: 16px; padding: 32px; display: flex; flex-direction: column; gap: 20px; }
        .ca-field { display: flex; flex-direction: column; gap: 6px; }
        .ca-label { font-size: 13px; font-weight: 600; color: rgba(15,15,30,0.75); }
        .ca-input {
          width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit;
          background: ${PAPER_2}; border: 1px solid ${RULE}; border-radius: 8px;
          color: ${INK}; outline: none; transition: border-color .15s;
        }
        .ca-input:focus { border-color: ${BLUE}; background: #fff; }
        .ca-textarea { min-height: 120px; resize: vertical; }
        .ca-select { appearance: none; cursor: pointer; }
        .ca-submit {
          padding: 14px 24px; background: ${INK}; color: ${PAPER};
          font-size: 15px; font-weight: 600; font-family: inherit;
          border: none; border-radius: 999px; cursor: pointer;
          transition: opacity .15s;
        }
        .ca-submit:hover { opacity: .85; }
        .ca-success { text-align: center; padding: 40px 24px; }

        @media (min-width: 640px) {
          .ca-wrap { padding: 64px 32px 100px; }
          .ca-why-grid { grid-template-columns: repeat(3, 1fr); }
          .ca-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        }
        @media (min-width: 1024px) {
          .ca-wrap { padding: 80px 32px 120px; }
        }
      `}</style>

      <div style={{ background: PAPER_2 }}>
        <div className="ca-wrap">

          {/* Why join */}
          <div className="ca-section">
            <h2 className="ca-section-title">Why join Cherut</h2>
            <div className="ca-why-grid">
              {whyJoin.map((w) => (
                <div key={w.title} className="ca-card">
                  <div className="ca-icon">{w.icon}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 6 }}>{w.title}</div>
                    <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55, margin: 0 }}>{w.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What we value */}
          <div className="ca-section">
            <h2 className="ca-section-title">What we value</h2>
            <div className="ca-values-list">
              {values.map((v) => (
                <div key={v} className="ca-value">
                  <span style={{ color: BLUE, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Talent pool form */}
          <div className="ca-section">
            <h2 className="ca-section-title">Join the talent pool</h2>
            <p style={{ fontSize: 15, color: MUTED, margin: '0 0 24px', lineHeight: 1.55 }}>
              When we do hire, we reach into this pool first. Introduce yourself — no CV required, just tell us who you are.
            </p>
            {submitted ? (
              <div className="ca-form ca-success">
                <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: INK, marginBottom: 8 }}>Got it — thank you!</div>
                <p style={{ fontSize: 15, color: MUTED, margin: 0, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                  We'll reach out when something that fits opens up.
                </p>
              </div>
            ) : (
              <form className="ca-form" onSubmit={handleSubmit}>
                <div className="ca-form-row">
                  <div className="ca-field">
                    <label className="ca-label" htmlFor="ca-name">Name</label>
                    <input id="ca-name" className="ca-input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="ca-field">
                    <label className="ca-label" htmlFor="ca-email">Email</label>
                    <input id="ca-email" className="ca-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="ca-field">
                  <label className="ca-label" htmlFor="ca-skill">Skill area</label>
                  <select id="ca-skill" className="ca-input ca-select" value={skill} onChange={e => setSkill(e.target.value)} required>
                    <option value="">Select area…</option>
                    {skillAreas.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="ca-field">
                  <label className="ca-label" htmlFor="ca-message">Tell us about yourself</label>
                  <textarea id="ca-message" className="ca-input ca-textarea" placeholder="What you've built, what excites you, what you're looking for…" value={message} onChange={e => setMessage(e.target.value)} required />
                </div>
                <div>
                  <button type="submit" className="ca-submit">Send introduction →</button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </PageShell>
  );
}
