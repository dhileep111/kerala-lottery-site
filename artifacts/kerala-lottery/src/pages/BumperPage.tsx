import { useMemo } from 'react';
import { Link } from 'wouter';
import { JsonLd } from '../components/JsonLd';
import { results, drawPath, getFirstPrizeNumber } from '../data';
import bumpers from '../data/bumpers.json';
import { useCountdown } from '../lib/useCountdown';
import { useLang, t, getLotteryName } from '../lib/i18n';

type Row = (typeof results)[number];

function firstPrizeDistrict(result: Row): string | null {
  const fp = result.prizes.find((p) => p.tier.toLowerCase().includes('1st'))?.numbers?.[0];
  return fp && typeof fp === 'object' ? ((fp as { district?: string }).district ?? null) : null;
}

export default function BumperPage() {
  const lang = useLang();
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
      {up && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: `${up.name} (${up.code})`,
          startDate: up.drawDateISO,
          location: { '@type': 'Place', name: up.venue },
          description: `${up.name} (${up.code}) — first prize ${up.firstPrize}, ticket price ${up.ticketPrice}.`,
        }} />
      )}
      <section className="hero" style={{ paddingBottom: 8 }}>
        <h1>{t(lang, 'bumperH1')}</h1>
        <p>{t(lang, 'bumperSubtitle')}</p>
      </section>

      {up && (
        <div className="content-card" style={{ borderLeft: '4px solid #0c7a43' }}>
          <span className="badge" style={{ background: '#0c7a43', color: '#fff' }}>{t(lang, 'bumperNextBumper')}</span>
          <h2 style={{ margin: '10px 0 4px' }}>
            {up.name} ({up.code})
          </h2>
          <p style={{ margin: '0 0 14px' }}>
            <strong>{up.drawDateLabel}</strong> · {up.drawTime} · {t(lang, 'firstPrize')} <strong>{up.firstPrize}</strong>
          </p>

          {!cd.done ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={box}><div style={num}>{cd.days}</div><div style={lbl}>{t(lang, 'days')}</div></div>
              <div style={box}><div style={num}>{cd.hours}</div><div style={lbl}>{t(lang, 'hours')}</div></div>
              <div style={box}><div style={num}>{cd.mins}</div><div style={lbl}>{t(lang, 'minutes')}</div></div>
              <div style={box}><div style={num}>{cd.secs}</div><div style={lbl}>{t(lang, 'seconds')}</div></div>
            </div>
          ) : (
            <p className="notice" style={{ marginBottom: 14 }}>
              {up.name} ({up.code}) {t(lang, 'bumperUnderway')}
            </p>
          )}

          <table className="table" style={{ width: '100%' }}>
            <tbody>
              <tr><td>{t(lang, 'ticketPrice')}</td><td>{up.ticketPrice}</td></tr>
              <tr><td>{t(lang, 'bumperSeries')}</td><td>{up.series}</td></tr>
              <tr><td>{t(lang, 'bumperVenue')}</td><td>{up.venue}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="content-card">
        <h2 style={{ marginTop: 0 }}>{t(lang, 'bumperPastResults')}</h2>
        {pastBumpers.length === 0 ? (
          <p style={{ opacity: 0.7 }}>{t(lang, 'bumperPastEmpty')}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>{t(lang, 'date')}</th>
                  <th>{t(lang, 'draw')}</th>
                  <th>{t(lang, 'firstPrize')}</th>
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
                        {getLotteryName('bumper', 'Kerala Bumper', lang)} <span className="badge">{r.drawCode}</span>
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
        )}
      </div>

      <div className="content-card">
        <h2 style={{ marginTop: 0 }}>{t(lang, 'bumperAboutTitle')}</h2>
        <p>{t(lang, 'bumperAboutBody')}</p>
      </div>
    </main>
  );
}
