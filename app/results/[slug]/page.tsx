import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { ResultCard } from '@/components/ResultCard';
import { ResultTable } from '@/components/ResultTable';
import { ResultDetails } from '@/components/ResultDetails';
import { absolute, getLatestResult, getLottery, lotteries, site } from '@/app/data';

export function generateStaticParams() {
  return lotteries.map((lottery) => ({ slug: lottery.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const lottery = getLottery(params.slug);
  if (!lottery) return {};
  return {
    title: `${lottery.name} ${lottery.code} Kerala Lottery Result Today`,
    description: `Check ${lottery.name} Kerala Lottery result with ${lottery.drawDay} ${lottery.drawTime} schedule, status, source note, and prize table.`,
    alternates: { canonical: absolute(`/results/${lottery.slug}/`) }
  };
}

export default function LotteryResultPage({ params }: { params: { slug: string } }) {
  const lottery = getLottery(params.slug);
  if (!lottery) notFound();
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

  return (
    <main className="page">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${lottery.name} ${result.drawCode} Kerala Lottery Result`,
        datePublished: result.drawDate,
        dateModified: result.lastUpdated,
        publisher: { '@type': 'Organization', name: site.name },
        mainEntityOfPage: absolute(`/results/${lottery.slug}/`)
      }} />
      <div className="container">
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
      </div>
    </main>
  );
}
