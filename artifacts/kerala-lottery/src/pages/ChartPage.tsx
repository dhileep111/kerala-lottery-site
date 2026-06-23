import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { results, getLottery, drawPath, getFirstPrizeNumber } from '../data';

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
      <section className="hero" style={{ paddingBottom: 8 }}>
        <h1>Kerala Lottery Chart</h1>
        <p>
          Every Kerala lottery result at a glance — the 1st prize for each daily draw, newest first.{' '}
          கேரளா லாட்டரி சார்ட் — தினசரி லாட்டரி முடிவுகள் ஒரே பக்கத்தில். Updated daily at 3:00 PM IST.
        </p>
      </section>

      <div className="content-card">
        {/* Month filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          <button style={activeMonth === 'all' ? pillActive : pillBase} onClick={() => setActiveMonth('all')}>
            All
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
                <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                <th>Lottery</th>
                <th>1st Prize</th>
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
                      {lottery?.name ?? r.lotterySlug}{' '}
                      <span className="badge">{r.drawCode}</span>
                    </td>
                    <td>
                      <strong>{getFirstPrizeNumber(r)}</strong>
                      {district ? <span style={{ opacity: 0.7 }}> ({district})</span> : null}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link href={drawPath(r)}>View →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && <p style={{ opacity: 0.7 }}>No results for this month yet.</p>}

        <p style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
          Showing {rows.length} {rows.length === 1 ? 'draw' : 'draws'}. Tap any row to see the full prize table,
          consolation prizes and lower tiers.
        </p>
      </div>
    </main>
  );
}
