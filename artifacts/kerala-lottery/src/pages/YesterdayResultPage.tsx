import { Link } from 'wouter';
import { results, lotteries, getLottery, drawPath, getFirstPrizeNumber, getTicketText } from '../data';

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
        <h1>Yesterday&apos;s Kerala Lottery Result</h1>
        <p>
          The full result of yesterday&apos;s Kerala lottery draw — all prize tiers, updated automatically.{' '}
          நேற்றைய கேரளா லாட்டரி முடிவு — அனைத்து பரிசு விவரங்களும்.
        </p>
      </section>

      {!result ? (
        <div className="content-card">
          <p>Yesterday&apos;s result isn&apos;t available yet. Check back shortly, or view today&apos;s result.</p>
          <Link href="/">← Today&apos;s result</Link>
        </div>
      ) : (
        <>
          <div className="content-card">
            {!isExactYesterday && (
              <p className="notice">
                Yesterday&apos;s draw result hasn&apos;t been published yet — showing the most recent available
                result below ({result.displayDate}).
              </p>
            )}
            <span className="badge">{result.drawCode}</span>
            <h2 style={{ margin: '10px 0 4px' }}>
              {lottery?.name ?? result.lotterySlug} — {result.displayDate}
            </h2>
            <p style={{ margin: '0 0 14px', opacity: 0.8 }}>
              Draw held at {lottery?.drawTime ?? '3:00 PM'} IST. First prize:{' '}
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
                    <th>Prize</th>
                    <th>Winning Number(s)</th>
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
              <Link href={drawPath(result)}>View full result page →</Link>
            </p>
          </div>

          <div className="content-card">
            <h2 style={{ marginTop: 0 }}>Other Recent Draws</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {lotteries
                .filter((l) => l.slug !== 'bumper')
                .map((l) => (
                  <li key={l.slug} style={{ marginBottom: 6 }}>
                    <Link href={`/results/${l.slug}`}>{l.name} results</Link>
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}
    </main>
  );
}
