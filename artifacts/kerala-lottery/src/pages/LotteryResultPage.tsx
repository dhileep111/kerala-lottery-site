import { useParams, Link } from 'wouter';
import { JsonLd } from '../components/JsonLd';
import { ResultCard } from '../components/ResultCard';
import { ResultTable } from '../components/ResultTable';
import { ResultDetails } from '../components/ResultDetails';
import { TamilResultSection } from '../components/TamilResultSection';
import { ShareResultButton } from '../components/ShareResultButton';
import { DownloadPdfButton } from '../components/DownloadPdfButton';
import { getLatestResult, getLottery, site } from '../data';

export default function LotteryResultPage() {
  const params = useParams<{ slug: string }>();
  const lottery = getLottery(params.slug);

  if (!lottery) {
    return <main className="page"><div className="container"><p>Lottery not found.</p></div></main>;
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
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
          { '@type': 'ListItem', position: 2, name: `${lottery.name} Result`, item: pageUrl },
        ],
      }} />
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <span>{lottery.name} Result</span>
        </nav>
        <div className="hero">
          <h1>{lottery.name} Kerala Lottery Result Today</h1>
          <p>{lottery.name} winning numbers and full prize table, updated daily at {lottery.drawTime} IST. {lottery.name} draws every {lottery.drawDay}.</p>
        </div>
        <section className="section">
          <ResultCard lottery={lottery} result={result} />
          <div style={{ height: 24 }} />
          <ResultDetails result={result} />
          <ResultTable result={result} />
          <DownloadPdfButton lottery={lottery} result={result} />
          {result.status !== 'pending' && (
            <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--border)', background: '#fafafa', display: 'flex', justifyContent: 'center' }}>
              <Link href={`/results/${lottery.slug}/first-prize`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', padding: '10px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
                🥇 View 1st Prize Winner Page →
              </Link>
            </div>
          )}
          <ShareResultButton lottery={lottery} result={result} />
        </section>
        <section className="content-card">
          <h2>Important Disclaimer</h2>
          <p>The Kerala Lottery results published on this page are for informational purposes only. This website is not affiliated with the Kerala Government. Always verify results with the official Kerala Government Gazette before making any prize claim.</p>
        </section>
        <TamilResultSection lottery={lottery} result={result} />
      </div>
    </main>
  );
}
