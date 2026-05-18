import { useParams } from 'wouter';
import { JsonLd } from '../components/JsonLd';
import { ResultCard } from '../components/ResultCard';
import { ResultTable } from '../components/ResultTable';
import { ResultDetails } from '../components/ResultDetails';
import { TamilResultSection } from '../components/TamilResultSection';
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
      { tier: '1st Prize', amount: lottery.firstPrizeAmount, numbers: [] },
      { tier: '2nd Prize', amount: '₹5,00,000', numbers: [] },
      { tier: '3rd Prize', amount: '₹1,00,000', numbers: [] },
      { tier: 'Consolation Prize', amount: '₹5,000', numbers: [] }
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
          <p>{lottery.name} draws every {lottery.drawDay} at {lottery.drawTime}. Result status: {result.status}. Always verify winning numbers with official Kerala Lottery publications before prize claims.</p>
        </div>
        <section className="section">
          <ResultCard lottery={lottery} result={result} />
          <div style={{ height: 24 }} />
          <ResultDetails result={result} />
          <ResultTable result={result} />
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
