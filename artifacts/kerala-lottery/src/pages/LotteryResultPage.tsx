import { useParams, Link } from 'wouter';
import { JsonLd, BreadcrumbSchema } from '../components/JsonLd';
import { ResultCard } from '../components/ResultCard';
import { ResultTable } from '../components/ResultTable';
import { ResultDetails } from '../components/ResultDetails';
import { TamilResultSection } from '../components/TamilResultSection';
import { ShareResultButton } from '../components/ShareResultButton';
import { DownloadPdfButton } from '../components/DownloadPdfButton';
import { getLatestResult, getLottery, site, getTodayHoliday } from '../data';
import { useLang, t, getLotteryName } from '../lib/i18n';

export default function LotteryResultPage() {
  const lang = useLang();
  const params = useParams<{ slug: string }>();
  const lottery = getLottery(params.slug);

  if (!lottery) {
    return <main className="page"><div className="container"><p>{t(lang, 'lotteryNotFound')}</p></div></main>;
  }

  const result = getLatestResult(lottery.slug) ?? {
    lotterySlug: lottery.slug,
    drawCode: `${lottery.code}-XXX`,
    drawDate: new Date().toISOString().slice(0, 10),
    displayDate: 'Awaiting update',
    status: 'pending' as const,
    sourceName: 'Awaiting official publication',
    sourceUrl: 'https://statelottery.kerala.gov.in/',
    lastUpdated: new Date().toISOString(),
    prizes: [
      { tier: '1st Prize',         amount: lottery.firstPrizeAmount, numbers: [] },
      { tier: 'Consolation Prize', amount: '₹5,000',     numbers: [] },
      { tier: '2nd Prize',         amount: '₹30,00,000', numbers: [] },
      { tier: '3rd Prize',         amount: '₹5,00,000',  numbers: [] },
      { tier: '4th Prize',         amount: '₹5,000',     numbers: [] },
      { tier: '5th Prize',         amount: '₹2,000',     numbers: [] },
      { tier: '6th Prize',         amount: '₹1,000',     numbers: [] },
      { tier: '7th Prize',         amount: '₹500',       numbers: [] },
      { tier: '8th Prize',         amount: '₹200',       numbers: [] },
      { tier: '9th Prize',         amount: '₹100',       numbers: [] },
    ]
  };

  const pageUrl = `${site.url}/results/${lottery.slug}`;
  const todayHoliday = getTodayHoliday();

  return (
    <main className="page">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: `${lottery.name} ${result.drawCode} Kerala Lottery Result`,
        description: `${lottery.name} lottery result today — latest winning numbers, prize amounts, and draw schedule. Updated daily at 3 PM IST.`,
        datePublished: result.drawDate,
        dateModified: result.lastUpdated,
        publisher: {
          '@type': 'Organization',
          name: site.name,
          url: site.url,
        },
        mainEntityOfPage: pageUrl,
        about: {
          '@type': 'Event',
          name: `${lottery.name} Lottery Draw ${result.drawCode}`,
          startDate: result.drawDate,
          location: { '@type': 'Place', name: 'Kerala, India' },
        },
      }} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: site.url },
          { name: `${lottery.name} Result`, url: pageUrl },
        ]}
      />
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">{t(lang, 'home')}</a>
          <span aria-hidden="true"> › </span>
          <span>{getLotteryName(lottery.slug, lottery.name, lang)} {t(lang, 'resultLabel')}</span>
        </nav>
        <div className="hero">
          <h1>{getLotteryName(lottery.slug, lottery.name, lang)} {t(lang, 'lrH1Suffix')}</h1>
          <p>{getLotteryName(lottery.slug, lottery.name, lang)} winning numbers and full prize table, updated daily at {lottery.drawTime} IST. {t(lang, 'homeDrawsEvery')} {lottery.drawDay}.</p>
        </div>
        {todayHoliday && (
          <div className="notice" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb', marginBottom: 16 }}>
            🎉 {lang === 'ta'
              ? <><strong>இன்று {todayHoliday}</strong> — இன்று லாட்டரி டிராவ் இல்லை. கீழே உள்ள முடிவு சமீபத்தில் வெளியிடப்பட்டது, இன்றையது அல்ல.</>
              : <strong>{t(lang, 'lrHolidayNotice').replace('{name}', todayHoliday)}</strong>}
          </div>
        )}
        <section className="section">
          <ResultCard lottery={lottery} result={result} />
          <div style={{ height: 24 }} />
          <ResultDetails result={result} />
          <ResultTable result={result} />
          <DownloadPdfButton lottery={lottery} result={result} />
          {result.status !== 'pending' && (
            <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--border)', background: '#fafafa', display: 'flex', justifyContent: 'center' }}>
              <Link href={`/results/${lottery.slug}/first-prize`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', padding: '10px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
                {t(lang, 'viewFirstPrizeWinner')}
              </Link>
            </div>
          )}
          <ShareResultButton lottery={lottery} result={result} />
        </section>
        <section className="content-card">
          <h2>{t(lang, 'importantDisclaimer')}</h2>
          <p>{t(lang, 'lrDisclaimerBody')}</p>
        </section>
        {lang === 'ta' && <TamilResultSection lottery={lottery} result={result} />}
      </div>
    </main>
  );
}
