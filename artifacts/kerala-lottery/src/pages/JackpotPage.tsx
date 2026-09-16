import { Link } from 'wouter';
import { BreadcrumbSchema } from '../components/JsonLd';
import { results, lotteries, drawPath, getFirstPrizeNumber, getTodayLottery, site } from '../data';
import bumpers from '../data/bumpers.json';
import { useCountdown } from '../lib/useCountdown';
import { useLang, t, getLotteryName } from '../lib/i18n';

type Row = (typeof results)[number];

function firstPrizeDistrict(result: Row): string | null {
  const fp = result.prizes.find((p) => p.tier.toLowerCase().includes('1st'))?.numbers?.[0];
  return fp && typeof fp === 'object' ? ((fp as { district?: string }).district ?? null) : null;
}

export default function JackpotPage() {
  const lang = useLang();
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
        <h1>{t(lang, 'jackpotH1')}</h1>
        <p>{t(lang, 'jackpotSubtitle')}</p>
      </section>

      {up && (
        <div className="content-card" style={{ borderLeft: '4px solid #7c2d12' }}>
          <span className="badge" style={{ background: '#7c2d12', color: '#fff' }}>{t(lang, 'jackpotBiggest')}</span>
          <h2 style={{ margin: '10px 0 4px' }}>{up.name} ({up.code}) — {up.firstPrize}</h2>
          <p style={{ margin: '0 0 14px' }}>
            <strong>{up.drawDateLabel}</strong> · {up.drawTime} · {t(lang, 'ticketPrice')} {up.ticketPrice}
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
              {up.name} ({up.code}) {t(lang, 'jackpotUnderway')}
            </p>
          )}
          <Link href="/bumper">{t(lang, 'jackpotBumperLink')}</Link>
        </div>
      )}

      <div className="content-card">
        <h2 style={{ marginTop: 0 }}>{t(lang, 'jackpotDailyTitle')}</h2>
        <p style={{ marginTop: 0, opacity: 0.75 }}>{t(lang, 'jackpotDailySubtitle')}</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>{t(lang, 'lottery')}</th>
                <th>{t(lang, 'code')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t(lang, 'jackpotDrawDay')}</th>
                <th>{t(lang, 'jackpot')}</th>
                <th aria-label="View result" />
              </tr>
            </thead>
            <tbody>
              {daily.map((lottery) => {
                const isToday = todayLottery.slug === lottery.slug;
                return (
                  <tr key={lottery.slug}>
                    <td>
                      {getLotteryName(lottery.slug, lottery.name, lang)}
                      {isToday && <span className="badge" style={{ marginLeft: 8, background: '#16a34a', color: '#fff' }}>{t(lang, 'today')}</span>}
                    </td>
                    <td><span className="badge">{lottery.code}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{lottery.drawDay}</td>
                    <td><strong>{lottery.firstPrizeAmount}</strong></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link href={`/results/${lottery.slug}`}>{t(lang, 'viewArrow')}</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-card">
        <h2 style={{ marginTop: 0 }}>{t(lang, 'jackpotRecentWinners')}</h2>
        {recentWinners.length === 0 ? (
          <p style={{ opacity: 0.7 }}>{t(lang, 'jackpotWinnersEmpty')}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>{t(lang, 'date')}</th>
                  <th>{t(lang, 'draw')}</th>
                  <th>{t(lang, 'jackpotFirstPrizeWinner')}</th>
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
                      <td>{lottery ? getLotteryName(lottery.slug, lottery.name, lang) : r.lotterySlug} <span className="badge">{r.drawCode}</span></td>
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

      {lang === 'ta' && (
        <section className="content-card tamil-section" lang="ta">
          <h2>🇮🇳 கேரளா லாட்டரி ஜாக்பாட்</h2>
          <p>
            இன்றைய <strong>{todayLottery.name}</strong> லாட்டரியின் முதல் பரிசு ₹1 கோடி. பம்பர் லாட்டரிகளில்
            ஜாக்பாட் தொகை ₹10 கோடி வரை செல்லும்.
          </p>
        </section>
      )}

      <section className="content-card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
        <h2>⚠️ {t(lang, 'disclaimer')}</h2>
        <p>{t(lang, 'jackpotDisclaimerBody')}</p>
      </section>
    </main>
  );
}
