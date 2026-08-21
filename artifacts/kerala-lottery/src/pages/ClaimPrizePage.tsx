import { useState } from 'react';
import { Link } from 'wouter';
import { JsonLd } from '../components/JsonLd';
import { site } from '../data';

const TIERS = [
  {
    id: 'small',
    label: 'Up to ₹5,000',
    location: 'Any authorised Kerala lottery agent',
    deadline: '30 days from the draw date',
    notes: 'No TDS deducted. Bring the signed original ticket and a valid ID.',
  },
  {
    id: 'medium',
    label: '₹5,001 – ₹1,00,000',
    location: 'Your District Lottery Office',
    deadline: '30 days from the draw date',
    notes: '30% TDS + surcharge deducted before payment. Aadhaar, PAN and bank details required.',
  },
  {
    id: 'large',
    label: 'Above ₹1,00,000',
    location: 'Directorate of Kerala State Lotteries, Thiruvananthapuram',
    deadline: '30 days from the draw date',
    notes: 'Must be claimed in person at the Directorate — district offices cannot process these. 30% TDS + surcharge applies.',
  },
];

const DOCS = [
  'Original winning ticket, signed on the back',
  'Aadhaar card',
  'PAN card (mandatory for prizes above ₹10,000)',
  'Two recent passport-size photographs',
  'Bank passbook or a cancelled cheque, for prize transfer',
];

export default function ClaimPrizePage() {
  const [selected, setSelected] = useState(TIERS[0].id);
  const tier = TIERS.find((t) => t.id === selected) ?? TIERS[0];

  return (
    <main className="page">
      <div className="container">
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to Claim Your Kerala Lottery Prize',
          description: 'Find the right claim location, deadline, and required documents for your Kerala lottery prize amount.',
          url: `${site.url}/claim-prize`,
          totalTime: 'P30D',
          step: DOCS.map((d, i) => ({ '@type': 'HowToStep', position: i + 1, name: d })),
        }} />

        <div className="hero">
          <h1>Claim Your Kerala Lottery Prize</h1>
          <p>
            Select your prize amount to see exactly where to go, your deadline, and what to bring.{' '}
            உங்கள் பரிசுத் தொகையைத் தேர்ந்தெடுத்து, எங்கு செல்ல வேண்டும் என்பதைப் பாருங்கள்.
          </p>
        </div>

        <div className="content-card">
          <h2 style={{ marginTop: 0 }}>1. Select your prize amount</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: `1px solid ${selected === t.id ? '#0c7a43' : 'rgba(0,0,0,0.15)'}`,
                  background: selected === t.id ? '#0c7a43' : '#fff',
                  color: selected === t.id ? '#fff' : '#0c3b2e',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="notice">
            <strong>Claim at:</strong> {tier.location}
            <br />
            <strong>Deadline:</strong> {tier.deadline}
            <br />
            <strong>Note:</strong> {tier.notes}
          </div>
        </div>

        <div className="content-card">
          <h2 style={{ marginTop: 0 }}>2. Documents to bring</h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {DOCS.map((d) => (
              <li key={d} style={{ marginBottom: 6 }}>{d}</li>
            ))}
          </ul>
        </div>

        <div className="content-card">
          <h2 style={{ marginTop: 0 }}>3. Verify before you travel</h2>
          <p>
            Always cross-check your ticket number, draw code, and date against the official result before
            visiting an office. Verify at{' '}
            <a href="https://statelottery.kerala.gov.in" target="_blank" rel="noopener noreferrer">
              statelottery.kerala.gov.in
            </a>{' '}
            or your draw&apos;s result page on this site.
          </p>
          <p style={{ margin: 0 }}>
            Need the full step-by-step process, Tamil Nadu-specific guidance, and TDS details?{' '}
            <Link href="/claim-guide">Read the complete Claim Guide →</Link>
          </p>
        </div>

        <section className="content-card tamil-section" lang="ta">
          <h2>🇮🇳 பரிசு பெறுவது எப்படி</h2>
          <p>
            ₹5,000 வரையிலான பரிசுகளை எந்த அங்கீகரிக்கப்பட்ட முகவரிடமும் பெறலாம். ₹5,001 முதல் ₹1,00,000 வரை
            மாவட்ட லாட்டரி அலுவலகத்திலும், ₹1,00,000-க்கு மேல் திருவனந்தபுரத்தில் உள்ள கேரள மாநில லாட்டரி
            இயக்குநரகத்திலும் பெற வேண்டும். அனைத்து பரிசுகளும் 30 நாட்களுக்குள் கோர வேண்டும்.
          </p>
        </section>

        <section className="content-card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
          <h2>⚠️ Disclaimer</h2>
          <p>
            This page is informational and based on publicly available Kerala State Lotteries rules. Rules can
            change without notice — always confirm the current process directly with the official Kerala State
            Lotteries department before making any claim.
          </p>
        </section>
      </div>
    </main>
  );
}
