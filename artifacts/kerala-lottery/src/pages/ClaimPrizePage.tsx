import { useState } from 'react';
import { Link } from 'wouter';
import { JsonLd, FaqSchema } from '../components/JsonLd';
import { site } from '../data';
import { useLang, t } from '../lib/i18n';

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
  const lang = useLang();
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
        <FaqSchema
          items={[
            {
              question: '1. Select your prize amount',
              answer: TIERS.map((t) => `${t.label}: claim at ${t.location}, ${t.deadline}. ${t.notes}`).join(' '),
            },
            {
              question: '2. Documents to bring',
              answer: DOCS.join(', ') + '.',
            },
            {
              question: '3. Verify before you travel',
              answer:
                "Always cross-check your ticket number, draw code, and date against the official result before visiting an office. Verify at statelottery.kerala.gov.in or your draw's result page on this site.",
            },
          ]}
        />

        <div className="hero">
          <h1>{t(lang, 'claimPrizeH1')}</h1>
          <p>{t(lang, 'claimPrizeSubtitle')}</p>
        </div>

        <div className="content-card">
          <h2 style={{ marginTop: 0 }}>{t(lang, 'claimPrizeStep1')}</h2>
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
            <strong>{t(lang, 'claimPrizeClaimAt')}</strong> {tier.location}
            <br />
            <strong>{t(lang, 'claimPrizeDeadlineLabel')}</strong> {tier.deadline}
            <br />
            <strong>{t(lang, 'claimPrizeNoteLabel')}</strong> {tier.notes}
          </div>
        </div>

        <div className="content-card">
          <h2 style={{ marginTop: 0 }}>{t(lang, 'claimPrizeStep2')}</h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {DOCS.map((d) => (
              <li key={d} style={{ marginBottom: 6 }}>{d}</li>
            ))}
          </ul>
        </div>

        <div className="content-card">
          <h2 style={{ marginTop: 0 }}>{t(lang, 'claimPrizeStep3')}</h2>
          <p>
            {t(lang, 'claimPrizeVerifyText')}{' '}
            <a href="https://statelottery.kerala.gov.in" target="_blank" rel="noopener noreferrer">
              statelottery.kerala.gov.in
            </a>{' '}
            {t(lang, 'claimPrizeOr')}
          </p>
          <p style={{ margin: 0 }}>
            {t(lang, 'claimPrizeGuideCta')}{' '}
            <Link href="/claim-guide">{t(lang, 'claimPrizeGuideLink')}</Link>
          </p>
        </div>

        {lang === 'ta' && (
          <section className="content-card tamil-section" lang="ta">
            <h2>🇮🇳 பரிசு பெறுவது எப்படி</h2>
            <p>
              ₹5,000 வரையிலான பரிசுகளை எந்த அங்கீகரிக்கப்பட்ட முகவரிடமும் பெறலாம். ₹5,001 முதல் ₹1,00,000 வரை
              மாவட்ட லாட்டரி அலுவலகத்திலும், ₹1,00,000-க்கு மேல் திருவனந்தபுரத்தில் உள்ள கேரள மாநில லாட்டரி
              இயக்குநரகத்திலும் பெற வேண்டும். அனைத்து பரிசுகளும் 30 நாட்களுக்குள் கோர வேண்டும்.
            </p>
          </section>
        )}

        <section className="content-card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
          <h2>⚠️ {t(lang, 'disclaimer')}</h2>
          <p>{t(lang, 'claimPrizeDisclaimerBody')}</p>
        </section>
      </div>
    </main>
  );
}
