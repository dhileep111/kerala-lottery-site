import { Link } from 'wouter';
import { BreadcrumbSchema } from '../components/JsonLd';
import { results, lotteries, drawPath, getFirstPrizeNumber, getTodayLottery, site } from '../data';
import bumpers from '../data/bumpers.json';
import { useCountdown } from '../lib/useCountdown';

type Row = (typeof results)[number];

function firstPrizeDistrict(result: Row): string | null {
  const fp = result.prizes.find((p) => p.tier.toLowerCase().includes('1st'))?.numbers?.[0];
  return fp && typeof fp === 'object' ? ((fp as { district?: string }).district ?? null) : null;
}

export default function JackpotPage() {
  const up = (bumpers as { upcoming?: Record<string, string> }).upcoming;
  const cd = useCountdown(up?.drawDateISO ?? '');
  const todayLottery = getTodayLottery();
  const daily = lotteries.filter((l) => !l.isBumper);

  const recentWinners = [...results]
    .filter((r) => r.lotterySlug !== 'bumper' && (r.status === 'verified' || r.status === 'live'))
    .sort((a, b) => b.drawDate.localeCompare(a.drawDate) || b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 8);

  const box: React.CSSProperties = {
    minWidth: 62, padding: '10px 6px', borderRadius: 12,
    background: '#7c2d12', color: '#fff', textAlign: 'center',
  };
  const num: React.CSSProperties = { fontSize: 28, fontWeight: 800, lineHeight: 1 };
  const lbl: React.CSSProperties = { fontSize: 11, opacity: 0.8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 };

  return (
    <main className="container">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: site.url },
          { name: 'Jackpot', url: `${site.url}/jackpot` },
        ]}
      />
      <section className="hero" style={{ paddingBottom: 8 }}>
        <h1>Kerala Lottery Jackpot</h1>
        <p>
          The biggest prizes in Kerala Lottery — today&apos;s ₹1 Crore daily jackpot and the next bumper draw&apos;s
          top prize, plus recent jackpot winners. கேரளா லாட்டரி ஜாக்பாட் — இன்றைய 1 கோடி முதல் பரிசு மற்றும் பம்பர் ஜாக்பாட்.
        </p>
      </section>

      {up && (
        <div className="content-card" style={{ borderLeft: '4px solid #7c2d12' }}>
          <span className="badge" style={{ background: '#7c2d12', color: '#fff' }}>Biggest Jackpot</span>
          <h2 style={{ margin: '10px 0 4px' }}>{up.name} ({up.code}) — {up.firstPrize}</h2>
          <p style={{ margin: '0 0 14px' }}>
            <strong>{up.drawDateLabel}</strong> · {up.drawTime} · Ticket price {up.ticketPrice}
          </p>
          {!cd.done ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={box}><div style={num}>{cd.days}</div><div style={lbl}>Days</div></div>
              <div style={box}><div style={num}>{cd.hours}</div><div style={lbl}>Hours</div></div>
              <div style={box}><div style={num}>{cd.mins}</div><div style={lbl}>Min</div></div>
              <div style={box}><div style={num}>{cd.secs}</div><div style={lbl}>Sec</div></div>
            </div>
          ) : (
            <p className="notice" style={{ marginBottom: 14 }}>
              The {up.name} ({up.code}) draw is underway — the jackpot result is published here on draw day.
            </p>
          )}
          <Link href="/bumper">Full bumper details &amp; past results →</Link>
        </div>
      )}

      <div className="content-card">
        <h2 style={{ marginTop: 0 }}>Today&apos;s Daily Jackpot — ₹1 Crore First Prize</h2>
        <p style={{ marginTop: 0, opacity: 0.75 }}>
          Every daily Kerala lottery carries the same ₹1 Crore first prize, drawn at 3:00 PM IST.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Lottery</th>
                <th>Code</th>
                <th style={{ whiteSpace: 'nowrap' }}>Draw Day</th>
                <th>Jackpot</th>
                <th aria-label="View result" />
              </tr>
            </thead>
            <tbody>
              {daily.map((lottery) => {
                const isToday = todayLottery.slug === lottery.slug;
                return (
                  <tr key={lottery.slug}>
                    <td>
                      {lottery.name}
                      {isToday && <span className="badge" style={{ marginLeft: 8, background: '#16a34a', color: '#fff' }}>Today</span>}
                    </td>
                    <td><span className="badge">{lottery.code}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{lottery.drawDay}</td>
                    <td><strong>{lottery.firstPrizeAmount}</strong></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link href={`/results/${lottery.slug}`}>View →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-card">
        <h2 style={{ marginTop: 0 }}>Recent Jackpot Winners</h2>
        {recentWinners.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Recent winners will appear here.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                  <th>Draw</th>
                  <th>1st Prize Winner</th>
                  <th aria-label="View result" />
                </tr>
              </thead>
              <tbody>
                {recentWinners.map((r) => {
                  const lottery = lotteries.find((l) => l.slug === r.lotterySlug);
                  const district = firstPrizeDistrict(r);
                  return (
                    <tr key={`${r.lotterySlug}-${r.drawCode}`}>
                      <td style={{ whiteSpace: 'nowrap' }}>{r.displayDate}</td>
                      <td>{lottery?.name ?? r.lotterySlug} <span className="badge">{r.drawCode}</span></td>
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
        )}
      </div>

      <section className="content-card tamil-section" lang="ta">
        <h2>🇮🇳 கேரளா லாட்டரி ஜாக்பாட்</h2>
        <p>
          இன்றைய <strong>{todayLottery.name}</strong> லாட்டரியின் முதல் பரிசு ₹1 கோடி. பம்பர் லாட்டரிகளில்
          ஜாக்பாட் தொகை ₹10 கோடி வரை செல்லும்.
        </p>
      </section>

      <section className="content-card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
        <h2>⚠️ Disclaimer</h2>
        <p>
          Lottery is a game of chance. Jackpot amounts shown are the announced prize structure and can change
          per official notification. Always verify with the official Kerala State Lotteries department. Play
          responsibly.
        </p>
      </section>
    </main>
  );
}
