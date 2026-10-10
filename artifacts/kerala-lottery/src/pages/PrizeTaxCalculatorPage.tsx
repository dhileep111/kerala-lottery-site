import { useMemo, useState } from 'react';
import { JsonLd, BreadcrumbSchema } from '../components/JsonLd';
import { lotteries, results, site } from '../data';
import { useLang, t } from '../lib/i18n';
import { TAX_CONSTANTS, calculateNetPrize, formatRupees } from '../lib/taxCalc';

function parseRupees(amount: string): number {
  return Number(amount.replace(/[^\d]/g, '')) || 0;
}

function fillPlaceholders(text: string): string {
  return text
    .replace('{commissionPct}', String(TAX_CONSTANTS.commissionRate))
    .replace('{commissionThreshold}', formatRupees(TAX_CONSTANTS.commissionThreshold))
    .replace('{tdsPct}', String(TAX_CONSTANTS.tdsRate))
    .replace('{tdsThreshold}', formatRupees(TAX_CONSTANTS.tdsThreshold));
}

// Weekly lotteries all share the same static 1st-prize amount — one quick
// pick covers all 7. Bumper quick-picks are derived from the 3 most recent
// VERIFIED bumper draws' actual 1st-prize amounts (bumper 1st prizes vary
// edition to edition, so a static figure would go stale — see data.ts's
// `results`, not bumpers.json, which this task does not touch), plus fixed
// round-number tiers for amounts no past draw happens to match.
function useQuickPicks() {
  return useMemo(() => {
    const weeklyAmount = lotteries.find(l => !l.isBumper)?.firstPrizeAmount ?? '₹1,00,00,000';
    const recentBumpers = results
      .filter(r => r.lotterySlug === 'bumper' && r.status === 'verified')
      .sort((a, b) => (b.drawDate || '').localeCompare(a.drawDate || ''))
      .slice(0, 3)
      .map(r => {
        const firstPrize = r.prizes.find(p => p.tier === '1st Prize');
        return firstPrize ? { label: `${r.drawCode} — ${firstPrize.amount}`, value: parseRupees(firstPrize.amount) } : null;
      })
      .filter((x): x is { label: string; value: number } => x !== null);

    return [
      { label: `Weekly 1st Prize — ${weeklyAmount}`, value: parseRupees(weeklyAmount) },
      ...recentBumpers,
      { label: '₹1,00,000', value: 100000 },
      { label: '₹5,00,000', value: 500000 },
      { label: '₹25,00,000', value: 2500000 },
      { label: '₹1,00,00,000', value: 10000000 },
    ];
  }, []);
}

const WORKED_EXAMPLES = [10000000, 2500000, 500000, 100000];

export default function PrizeTaxCalculatorPage() {
  const lang = useLang();
  const quickPicks = useQuickPicks();
  const [input, setInput] = useState('');
  const [includeCess, setIncludeCess] = useState(TAX_CONSTANTS.cessAppliedByDefault);
  const [includeSurcharge, setIncludeSurcharge] = useState(TAX_CONSTANTS.surchargeAppliedByDefault);

  const grossPrize = Number(input) || 0;
  const breakdown = calculateNetPrize(grossPrize, { includeCess });
  const pageUrl = `${site.url}/prize-tax-calculator`;

  return (
    <main className="page">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Kerala Lottery Prize Tax Calculator',
        description: 'Calculate agent commission, TDS, and net take-home for any Kerala lottery prize amount.',
        url: pageUrl,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
      }} />
      <BreadcrumbSchema items={[{ name: 'Home', url: site.url }, { name: 'Prize Tax Calculator', url: pageUrl }]} />

      <div className="container" style={{ maxWidth: 720 }}>
        <div className="hero">
          <h1>{t(lang, 'ptcH1')}</h1>
          <p>{t(lang, 'ptcSubtitle')}</p>
        </div>

        <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: 16, padding: '20px 22px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>{t(lang, 'ptcInputLabel')}</label>
          <input
            type="number"
            min={0}
            style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #d1d5db', borderRadius: 10, padding: '12px 16px', fontSize: 18, fontFamily: 'monospace', outline: 'none' }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. 10000000"
            onFocus={e => (e.target.style.borderColor = '#059669')}
            onBlur={e => (e.target.style.borderColor = '#d1d5db')}
          />

          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', margin: '16px 0 8px' }}>{t(lang, 'ptcQuickSelectLabel')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {quickPicks.map(q => (
              <button
                key={q.label}
                onClick={() => setInput(String(q.value))}
                style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
              <input type="checkbox" checked={includeCess} onChange={e => setIncludeCess(e.target.checked)} />
              {t(lang, 'ptcCessToggleLabel')}
            </label>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{t(lang, 'ptcCessNote')}</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', marginTop: 6 }}>
              <input type="checkbox" checked={includeSurcharge} onChange={e => setIncludeSurcharge(e.target.checked)} />
              {t(lang, 'ptcSurchargeToggleLabel')}
            </label>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{t(lang, 'ptcSurchargeNote')}</p>
          </div>
        </div>

        {grossPrize > 0 && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
            <Row label={t(lang, 'ptcGrossPrize')} value={formatRupees(breakdown.gross)} />
            <Row label={fillPlaceholders(t(lang, 'ptcAgentCommission'))} value={`− ${formatRupees(breakdown.agentCommission)}`} />
            <Row label={fillPlaceholders(t(lang, 'ptcTdsDeducted'))} value={`− ${formatRupees(breakdown.tds)}`} />
            {includeCess && <Row label="Cess" value={`− ${formatRupees(breakdown.cess)}`} />}
            <Row label={t(lang, 'ptcNetAmount')} value={formatRupees(breakdown.net)} strong />
            <Row label={t(lang, 'ptcNetPercent')} value={`${breakdown.netPercent.toFixed(1)}%`} />
            {includeSurcharge && (
              <p style={{ fontSize: 12, color: '#b45309', marginTop: 10 }}>⚠️ {t(lang, 'ptcSurchargeNote')}</p>
            )}
          </div>
        )}

        <section className="content-card">
          <h2>{t(lang, 'ptcWorkedExamplesTitle')}</h2>
          <p>{t(lang, 'ptcWorkedExampleIntro')}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t(lang, 'ptcGrossPrize')}</th>
                  <th>{fillPlaceholders(t(lang, 'ptcAgentCommission'))}</th>
                  <th>{fillPlaceholders(t(lang, 'ptcTdsDeducted'))}</th>
                  <th>{t(lang, 'ptcNetAmount')}</th>
                  <th>{t(lang, 'ptcNetPercent')}</th>
                </tr>
              </thead>
              <tbody>
                {WORKED_EXAMPLES.map(amount => {
                  const b = calculateNetPrize(amount);
                  return (
                    <tr key={amount}>
                      <td>{formatRupees(b.gross)}</td>
                      <td>{formatRupees(b.agentCommission)}</td>
                      <td>{formatRupees(b.tds)}</td>
                      <td>{formatRupees(b.net)}</td>
                      <td>{b.netPercent.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-card">
          <h2>{t(lang, 'ptcHowItWorksTitle')}</h2>
          <p>{fillPlaceholders(t(lang, 'ptcHowItWorksBody'))}</p>
        </section>

        <section className="content-card">
          <h2>{t(lang, 'ptcWhereToClaimTitle')}</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t(lang, 'cgPrizeCategory')}</th><th>{t(lang, 'cgClaimLocation')}</th></tr></thead>
              <tbody>
                <tr><td>{`Up to ${formatRupees(TAX_CONSTANTS.claimLocationThreshold)}`}</td><td>{t(lang, 'officeAnyAgent')}</td></tr>
                <tr><td>{`${formatRupees(TAX_CONSTANTS.claimLocationThreshold + 1)} – ₹1,00,000`}</td><td>{t(lang, 'officeDistrictOffice')}</td></tr>
                <tr><td>{'Above ₹1,00,000'}</td><td>{t(lang, 'officeDirectorateShort')}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '20px 0', lineHeight: 1.7 }}>
          {t(lang, 'ptcDisclaimer')}
        </p>
      </div>
    </main>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb', fontSize: strong ? 16 : 13, fontWeight: strong ? 800 : 500, color: strong ? '#059669' : '#374151' }}>
      <span>{label}</span>
      <span style={{ fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}
