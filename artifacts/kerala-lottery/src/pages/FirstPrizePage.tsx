import { useParams, Link } from 'wouter';
import { getLottery, getLatestResult, getResultByDraw, getFirstPrizeNumber, site } from '../data';
import { JsonLd } from '../components/JsonLd';
import { ShareResultButton } from '../components/ShareResultButton';
import { useLang, t, getLotteryName, tTier } from '../lib/i18n';

function getTicketAndDistrict(number: any): { ticket: string; district: string | null } {
  if (!number) return { ticket: '—', district: null };
  if (typeof number === 'string') return { ticket: number, district: null };
  return { ticket: number.ticket ?? '—', district: number.district ?? null };
}

export default function FirstPrizePage() {
  const lang = useLang();
  const params = useParams<{ slug: string; drawCode?: string }>();
  const lottery = getLottery(params.slug);
  const result = params.drawCode
    ? getResultByDraw(params.slug, params.drawCode)
    : getLatestResult(params.slug);

  if (!lottery || !result) {
    return (
      <main className="page"><div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1 style={{ marginBottom: 12 }}>{t(lang, 'fpNotFound')}</h1>
        <Link href="/" style={{ color: 'var(--primary)' }}>{t(lang, 'fpBackHome')}</Link>
      </div></main>
    );
  }

  const firstPrizePrize = result.prizes.find(p => p.tier === '1st Prize');
  const consolation     = result.prizes.find(p => p.tier === 'Consolation Prize');
  const secondPrize     = result.prizes.find(p => p.tier === '2nd Prize');
  const thirdPrize      = result.prizes.find(p => p.tier === '3rd Prize');

  const firstNum    = firstPrizePrize?.numbers?.[0];
  const { ticket: firstTicket, district: firstDistrict } = getTicketAndDistrict(firstNum);
  const isPending = result.status === 'pending' || !firstNum;
  const pageUrl   = `${site.url}/results/${lottery.slug}/first-prize`;

  return (
    <main className="page">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: `${lottery.name} ${result.drawCode} 1st Prize Winner — ${firstTicket}`,
        description: `${lottery.name} ${result.drawCode} first prize winner is ${firstTicket}${firstDistrict ? ` from ${firstDistrict}` : ''}. Prize amount ${lottery.firstPrizeAmount}.`,
        datePublished: result.drawDate,
        dateModified: result.lastUpdated,
        publisher: { '@type': 'Organization', name: site.name, url: site.url },
        mainEntityOfPage: pageUrl,
      }} />

      <div className="container" style={{ maxWidth: 680 }}>
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/">{t(lang, 'home')}</Link>
          <span aria-hidden="true"> › </span>
          <Link href={`/results/${lottery.slug}`}>{getLotteryName(lottery.slug, lottery.name, lang)} {t(lang, 'resultLabel')}</Link>
          <span aria-hidden="true"> › </span>
          <span>{t(lang, 'fp1stPrizeCrumb')}</span>
        </nav>

        {/* Hero jackpot card */}
        <div className="fp-hero">
          <div className="fp-hero__top">
            <div className="fp-hero__label">🥇 {t(lang, 'fpFirstPrizeWinner')}</div>
            <div className="fp-hero__draw">{getLotteryName(lottery.slug, lottery.name, lang)} {result.drawCode} — {result.displayDate}</div>
          </div>

          {isPending ? (
            <div className="fp-hero__pending">
              <div className="fp-pending-dot" />
              <div>
                <div style={{ fontWeight: 800, fontSize: 20 }}>{t(lang, 'fpResultAwaiting')}</div>
                <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>{t(lang, 'fpDrawAt')} {lottery.drawTime} • {t(lang, 'fpCheckBack')}</div>
              </div>
            </div>
          ) : (
            <>
              <div className="fp-hero__ticket">{firstTicket}</div>
              <div className="fp-hero__amount">{lottery.firstPrizeAmount}</div>
              {firstDistrict && (
                <div className="fp-hero__district">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {t(lang, 'fpSoldIn')} <strong>{firstDistrict}</strong>, {t(lang, 'fpKerala')}
                  <a
                    href={`https://www.google.com/maps/search/Kerala+lottery+agent+${encodeURIComponent(firstDistrict)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="fp-map-link"
                  >
                    {t(lang, 'fpViewArea')}
                  </a>
                </div>
              )}
              <div className="fp-hero__status fp-hero__status--verified">
                {result.status === 'verified' ? `✅ ${t(lang, 'verifiedResult')}` : `🔴 ${t(lang, 'fpLiveVerify')}`}
              </div>
            </>
          )}
        </div>

        {/* Top 3 prizes */}
        {!isPending && (
          <section className="fp-top3">
            <h2 className="fp-top3__title">{t(lang, 'fpTop3Title')}</h2>
            <div className="fp-top3__grid">
              {[
                { prize: firstPrizePrize,  medal: '🥇', label: '1st Prize',  color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                { prize: secondPrize,       medal: '🥈', label: '2nd Prize', color: '#64748b', bg: '#f8fafc', border: '#cbd5e1' },
                { prize: thirdPrize,        medal: '🥉', label: '3rd Prize', color: '#b45309', bg: '#fff7ed', border: '#fed7aa' },
              ].map(({ prize, medal, label, color, bg, border }) => {
                if (!prize) return null;
                const num = prize.numbers[0];
                const { ticket, district } = getTicketAndDistrict(num);
                const isPendingTier = !num;
                return (
                  <div key={label} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, padding: '18px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{medal}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{tTier(lang, label)}</div>
                    {isPendingTier ? (
                      <div style={{ fontSize: 14, color: '#d97706', fontWeight: 700 }}>{t(lang, 'pending')}</div>
                    ) : (
                      <>
                        <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 18, fontWeight: 900, color, letterSpacing: '0.08em', marginBottom: 6 }}>{ticket}</div>
                        {district && (
                          <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {district}
                          </div>
                        )}
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#059669', marginTop: 6 }}>{prize.amount}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Consolation */}
        {consolation && consolation.numbers.length > 0 && (
          <section className="content-card" style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>🎁 {tTier(lang, 'Consolation Prize')} — {consolation.amount}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {consolation.numbers.map((n: any) => {
                const { ticket } = getTicketAndDistrict(n);
                return <span key={ticket} style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '5px 12px', fontWeight: 700, color: '#166534' }}>{ticket}</span>;
              })}
            </div>
          </section>
        )}

        {/* Share */}
        <div style={{ marginTop: 20 }}>
          <ShareResultButton lottery={lottery} result={result} />
        </div>

        {/* Claim CTA */}
        {!isPending && (
          <div className="fp-claim-cta">
            <div className="fp-claim-cta__icon">🏆</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{t(lang, 'fpDidYouWin')}</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                {t(lang, 'fpVerifyBody')}
              </div>
            </div>
            <Link href="/claim-guide" style={{ flexShrink: 0, background: '#16a34a', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t(lang, 'claimGuide')} →
            </Link>
          </div>
        )}

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '20px 0', lineHeight: 1.7 }}>
          {t(lang, 'fpDisclaimer')}
        </p>
      </div>
    </main>
  );
}
