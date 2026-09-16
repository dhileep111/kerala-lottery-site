import { Link } from 'wouter';
import { results, lotteries, getLottery, drawPath, getFirstPrizeNumber, getTicketText } from '../data';
import { useLang, t, getLotteryName } from '../lib/i18n';

function istNow() {
  // Render relative to IST regardless of visitor's timezone
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function district(num: unknown): string | null {
  return num && typeof num === 'object' ? ((num as { district?: string }).district ?? null) : null;
}

export default function YesterdayResultPage() {
  const lang = useLang();
  const today = istNow();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const targetYmd = ymd(yesterday);

  const result =
    results.find((r) => r.drawDate === targetYmd && r.lotterySlug !== 'bumper') ??
    [...results]
      .filter((r) => r.lotterySlug !== 'bumper' && r.drawDate < targetYmd)
      .sort((a, b) => b.drawDate.localeCompare(a.drawDate))[0];

  const lottery = result ? getLottery(result.lotterySlug) : undefined;
  const isExactYesterday = result?.drawDate === targetYmd;

  const tiers = result?.prizes ?? [];

  return (
    <main className="container">
      <section className="hero" style={{ paddingBottom: 8 }}>
        <h1>{t(lang, 'yestH1')}</h1>
        <p>{t(lang, 'yestSubtitle')}</p>
      </section>

      {!result ? (
        <div className="content-card">
          <p>{t(lang, 'yestNotAvailable')}</p>
          <Link href="/">{t(lang, 'yestBackToToday')}</Link>
        </div>
      ) : (
        <>
          <div className="content-card">
            {!isExactYesterday && (
              <p className="notice">
                {t(lang, 'yestNotPublishedYet')} ({result.displayDate}).
              </p>
            )}
            <span className="badge">{result.drawCode}</span>
            <h2 style={{ margin: '10px 0 4px' }}>
              {lottery ? getLotteryName(lottery.slug, lottery.name, lang) : result.lotterySlug} — {result.displayDate}
            </h2>
            <p style={{ margin: '0 0 14px', opacity: 0.8 }}>
              {t(lang, 'yestDrawHeldAt')} {lottery?.drawTime ?? '3:00 PM'} {t(lang, 'yestFirstPrizeColon')}{' '}
              <strong>{getFirstPrizeNumber(result)}</strong>
              {(() => {
                const d = district(result.prizes.find((p) => p.tier.toLowerCase().includes('1st'))?.numbers?.[0]);
                return d ? ` (${d})` : '';
              })()}
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>{t(lang, 'yestPrize')}</th>
                    <th>{t(lang, 'yestWinningNumbers')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((p) => (
                    <tr key={p.tier}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {p.tier}
                        {p.amount ? <span style={{ opacity: 0.7 }}> ({p.amount})</span> : null}
                      </td>
                      <td>
                        {p.numbers?.map((n, i) => {
                          const d = district(n);
                          return (
                            <span key={i} style={{ marginRight: 10, display: 'inline-block' }}>
                              {getTicketText(n)}
                              {d ? <span style={{ opacity: 0.6 }}> ({d})</span> : null}
                            </span>
                          );
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: 16 }}>
              <Link href={drawPath(result)}>{t(lang, 'yestViewFull')}</Link>
            </p>
          </div>

          <div className="content-card">
            <h2 style={{ marginTop: 0 }}>{t(lang, 'yestOtherDraws')}</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {lotteries
                .filter((l) => l.slug !== 'bumper')
                .map((l) => (
                  <li key={l.slug} style={{ marginBottom: 6 }}>
                    <Link href={`/results/${l.slug}`}>{getLotteryName(l.slug, l.name, lang)} {t(lang, 'results')}</Link>
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}
    </main>
  );
}
