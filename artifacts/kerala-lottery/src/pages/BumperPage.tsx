import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { results, drawPath, getFirstPrizeNumber } from '../data';
import bumpers from '../data/bumpers.json';

type Row = (typeof results)[number];

function useCountdown(targetISO: string) {
  const target = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Number.isFinite(target) ? Math.max(0, target - now) : 0;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    done: !Number.isFinite(target) || diff <= 0,
  };
}

function firstPrizeDistrict(result: Row): string | null {
  const fp = result.prizes.find((p) => p.tier.toLowerCase().includes('1st'))?.numbers?.[0];
  return fp && typeof fp === 'object' ? ((fp as { district?: string }).district ?? null) : null;
}

export default function BumperPage() {
  const up = (bumpers as { upcoming?: Record<string, string> }).upcoming;
  const cd = useCountdown(up?.drawDateISO ?? '');

  const pastBumpers = useMemo(
    () =>
      results
        .filter((r) => r.lotterySlug === 'bumper')
        .sort((a, b) => b.drawDate.localeCompare(a.drawDate) || b.lastUpdated.localeCompare(a.lastUpdated)),
    [],
  );

  const box: React.CSSProperties = {
    minWidth: 62,
    padding: '10px 6px',
    borderRadius: 12,
    background: '#0c3b2e',
    color: '#fff',
    textAlign: 'center',
  };
  const num: React.CSSProperties = { fontSize: 28, fontWeight: 800, lineHeight: 1 };
  const lbl: React.CSSProperties = { fontSize: 11, opacity: 0.8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 };

  return (
    <main className="container">
      <section className="hero" style={{ paddingBottom: 8 }}>
        <h1>Kerala Bumper Lottery — Next Draw &amp; Results</h1>
        <p>
          Kerala's seasonal bumper lotteries carry the biggest prizes of the year — up to ₹12 crore. See the
          next bumper draw date, prize and a live countdown, plus past bumper results.{' '}
          கேரளா பம்பர் லாட்டரி அடுத்த தேதி, பரிசு மற்றும் முடிவுகள்.
        </p>
      </section>

      {up && (
        <div className="content-card" style={{ borderLeft: '4px solid #0c7a43' }}>
          <span className="badge" style={{ background: '#0c7a43', color: '#fff' }}>Next Bumper</span>
          <h2 style={{ margin: '10px 0 4px' }}>
            {up.name} ({up.code})
          </h2>
          <p style={{ margin: '0 0 14px' }}>
            <strong>{up.drawDateLabel}</strong> · {up.drawTime} · First prize <strong>{up.firstPrize}</strong>
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
              The {up.name} ({up.code}) draw is underway — results are published here on draw day. Check back soon!
            </p>
          )}

          <table className="table" style={{ width: '100%' }}>
            <tbody>
              <tr><td>Ticket price</td><td>{up.ticketPrice}</td></tr>
              <tr><td>Series</td><td>{up.series}</td></tr>
              <tr><td>Draw venue</td><td>{up.venue}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="content-card">
        <h2 style={{ marginTop: 0 }}>Past Bumper Results</h2>
        {pastBumpers.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Past bumper results will appear here.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                  <th>Draw</th>
                  <th>1st Prize</th>
                  <th aria-label="View result" />
                </tr>
              </thead>
              <tbody>
                {pastBumpers.map((r) => {
                  const district = firstPrizeDistrict(r);
                  return (
                    <tr key={r.drawCode}>
                      <td style={{ whiteSpace: 'nowrap' }}>{r.displayDate}</td>
                      <td>
                        Kerala Bumper <span className="badge">{r.drawCode}</span>
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
        )}
      </div>

      <div className="content-card">
        <h2 style={{ marginTop: 0 }}>About Kerala Bumper Lotteries</h2>
        <p>
          Kerala holds six seasonal bumper lotteries each year — Summer, Vishu, Monsoon, Thiruvonam (Onam),
          Pooja and Christmas–New Year — each with far larger prizes than the daily draws. Tickets sell out
          weeks ahead, and draws are held at Gorky Bhavan, Thiruvananthapuram. We publish each bumper result
          here as soon as the official draw is announced.
        </p>
      </div>
    </main>
  );
}
