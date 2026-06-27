'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/shell/Shell';
import { enterpriseWaitlistApi } from '@/lib/api/services/enterprise-waitlist';

const BG      = '#07070D';
const SURF    = '#0F0F1B';
const SURF2   = '#161628';
const TEXT    = '#EDEEF6';
const MUTED   = 'rgba(237,238,246,0.46)';
const ACCENT  = 'oklch(0.68 0.24 260)';
const ACCENT_DIM = 'rgba(80,110,255,0.12)';
const RULE    = 'rgba(255,255,255,0.08)';

const employeesOptions = ['1-10', '11-50', '51-200', '201-500', '500+'];
const revenueOptions   = [{ v: 'under-1m', l: 'Under $1M' }, { v: '1m-5m', l: '$1M – $5M' }, { v: '5m-10m', l: '$5M – $10M' }, { v: '10m-50m', l: '$10M – $50M' }, { v: '50m+', l: 'Over $50M' }];

export default function EnterpriseWaitlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm] = useState({ contactName: '', phoneNumber: '', companyName: '', numberOfEmployees: '', companyRevenue: '', intendedUse: '', desiredFeatures: '' });

  const set = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.contactName || !form.phoneNumber || !form.companyName) { setError('Please fill in all required fields.'); return; }
    setLoading(true);
    try {
      await enterpriseWaitlistApi.create(form);
      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell kicker="Enterprise" title="Enterprise Waitlist" lead="Tell us about your team and we'll be in touch.">
      <style>{`
        .ew-wrap  { max-width: 680px; margin: 0 auto; padding: 48px 20px 80px; }
        .ew-form  { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 16px; padding: 32px; display: flex; flex-direction: column; gap: 20px; }
        .ew-field { display: flex; flex-direction: column; gap: 6px; }
        .ew-label { font-size: 13px; font-weight: 600; color: rgba(237,238,246,0.55); }
        .ew-input { width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit; background: ${SURF}; border: 1px solid ${RULE}; border-radius: 8px; color: ${TEXT}; outline: none; transition: border-color .15s; box-sizing: border-box; }
        .ew-input:focus { border-color: ${ACCENT}; }
        .ew-input::placeholder { color: rgba(237,238,246,0.22); }
        .ew-select { appearance: none; cursor: pointer; }
        .ew-select option { background: ${SURF2}; }
        .ew-textarea { min-height: 100px; resize: vertical; }
        .ew-submit { padding: 14px 24px; background: ${TEXT}; color: ${BG}; font-size: 15px; font-weight: 700; font-family: inherit; border: none; border-radius: 999px; cursor: pointer; transition: opacity .15s; width: 100%; }
        .ew-submit:hover:not(:disabled) { opacity: .87; }
        .ew-submit:disabled { opacity: .5; cursor: not-allowed; }
        .ew-success { text-align: center; padding: 48px 24px; }
        .ew-row { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 640px)  { .ew-wrap { padding: 64px 32px 100px; } .ew-row { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .ew-wrap { padding: 80px 32px 120px; } }
      `}</style>

      <div style={{ background: BG }}>
        <div className="ew-wrap">
          {success ? (
            <div className="ew-form ew-success">
              <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
              <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', fontSize: 36, fontWeight: 800, color: TEXT, margin: '0 0 12px', lineHeight: 0.96 }}>We're on it.</h2>
              <p style={{ fontSize: 16, color: MUTED, margin: 0 }}>We'll reach out soon. Redirecting…</p>
            </div>
          ) : (
            <form className="ew-form" onSubmit={handleSubmit}>
              <div className="ew-row">
                <div className="ew-field">
                  <label className="ew-label" htmlFor="ew-name">Contact name *</label>
                  <input id="ew-name" className="ew-input" type="text" placeholder="John Smith" value={form.contactName} onChange={e => set('contactName', e.target.value)} required />
                </div>
                <div className="ew-field">
                  <label className="ew-label" htmlFor="ew-phone">Phone number *</label>
                  <input id="ew-phone" className="ew-input" type="tel" placeholder="+1 (555) 123-4567" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} required />
                </div>
              </div>
              <div className="ew-field">
                <label className="ew-label" htmlFor="ew-company">Company name *</label>
                <input id="ew-company" className="ew-input" type="text" placeholder="My Company Inc." value={form.companyName} onChange={e => set('companyName', e.target.value)} required />
              </div>
              <div className="ew-row">
                <div className="ew-field">
                  <label className="ew-label" htmlFor="ew-employees">Number of employees</label>
                  <select id="ew-employees" className="ew-input ew-select" value={form.numberOfEmployees} onChange={e => set('numberOfEmployees', e.target.value)}>
                    <option value="">Select…</option>
                    {employeesOptions.map(o => <option key={o} value={o}>{o} employees</option>)}
                  </select>
                </div>
                <div className="ew-field">
                  <label className="ew-label" htmlFor="ew-revenue">Annual revenue</label>
                  <select id="ew-revenue" className="ew-input ew-select" value={form.companyRevenue} onChange={e => set('companyRevenue', e.target.value)}>
                    <option value="">Select…</option>
                    {revenueOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              </div>
              <div className="ew-field">
                <label className="ew-label" htmlFor="ew-use">Intended use</label>
                <textarea id="ew-use" className="ew-input ew-textarea" placeholder="How do you plan to use Cherut in your company?" value={form.intendedUse} onChange={e => set('intendedUse', e.target.value)} />
              </div>
              <div className="ew-field">
                <label className="ew-label" htmlFor="ew-features">Features you'd want</label>
                <textarea id="ew-features" className="ew-input ew-textarea" placeholder="Describe features that would be important for your team…" value={form.desiredFeatures} onChange={e => set('desiredFeatures', e.target.value)} />
              </div>
              {error && <p style={{ fontSize: 14, color: '#f87171', margin: 0 }}>{error}</p>}
              <button type="submit" className="ew-submit" disabled={loading}>{loading ? 'Sending…' : 'Submit request →'}</button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
