import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { BreadcrumbSchema } from '../components/JsonLd';
import { results, getLottery, drawPath, getFirstPrizeNumber, site } from '../data';
import { useLang, t, getLotteryName } from '../lib/i18n';

type Row = (typeof results)[number];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthKey(d: string) {
  return (d || '').slice(0, 7); // YYYY-MM
}
function monthLabel(key: string) {
  const [y, m] = key.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1] ?? m} ${y}`;
}
function firstPrizeDistrict(result: Row): string | null {
  const fp = result.prizes.find((p) => p.tier.toLowerCase().includes('1st'))?.numbers?.[0];
  return fp && typeof fp === 'object' ? ((fp as { district?: string }).district ?? null) : null;
}

export default function ChartPage() {
  const lang = useLang();
  const sorted = useMemo(
    () =>
      [...results].sort(
        (a, b) => b.drawDate.localeCompare(a.drawDate) || b.lastUpdated.localeCompare(a.lastUpdated),
      ),
    [],
  );
  const months = useMemo(() => Array.from(new Set(sorted.map((r) => monthKey(r.drawDate)))), [sorted]);
  const [activeMonth, setActiveMonth] = useState<string>('all');

  const rows = activeMonth === 'all' ? sorted : sorted.filter((r) => monthKey(r.drawDate) === activeMonth);

  const pillBase: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: 999,
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#fff',
    color: '#0c3b2e',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  };
  const pillActive: React.CSSProperties = {
    ...pillBase,
    background: '#0c7a43',
    color: '#fff',
    borderColor: '#0c7a43',
  };

  return (
    <main className="container">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: site.url },
          { name: 'Chart', url: `${site.url}/chart` },
        ]}
      />
      <section className="hero" style={{ paddingBottom: 8 }}>
        <h1>{t(lang, 'chartH1')}</h1>
        <p>{t(lang, 'chartSubtitle')}</p>
      </section>

      <div className="content-card">
        {/* Month filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          <button style={activeMonth === 'all' ? pillActive : pillBase} onClick={() => setActiveMonth('all')}>
            {t(lang, 'chartAll')}
          </button>
          {months.map((m) => (
            <button key={m} style={activeMonth === m ? pillActive : pillBase} onClick={() => setActiveMonth(m)}>
              {monthLabel(m)}
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>{t(lang, 'date')}</th>
                <th>{t(lang, 'lottery')}</th>
                <th>{t(lang, 'firstPrize')}</th>
                <th aria-label="View result" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const lottery = getLottery(r.lotterySlug);
                const district = firstPrizeDistrict(r);
                return (
                  <tr key={`${r.lotterySlug}-${r.drawCode}`}>
                    <td style={{ whiteSpace: 'nowrap' }}>{r.displayDate}</td>
                    <td>
                      {lottery ? getLotteryName(lottery.slug, lottery.name, lang) : r.lotterySlug}{' '}
                      <span className="badge">{r.drawCode}</span>
                    </td>
                    <td>
                      <strong>{getFirstPrizeNumber(r)}</strong>
                      {district ? <span style={{ opacity: 0.7 }}> ({district})</span> : null}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link href={drawPath(r)}>{t(lang, 'viewArrow')}</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && <p style={{ opacity: 0.7 }}>{t(lang, 'chartEmpty')}</p>}

        <p style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
          {t(lang, 'chartShowingPrefix')} {rows.length} {rows.length === 1 ? t(lang, 'chartDrawSingular') : t(lang, 'chartDrawPlural')}{t(lang, 'chartShowingSuffix')}
        </p>
      </div>
    </main>
  );
}
