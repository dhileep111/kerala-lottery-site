import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { ResultCard } from '@/components/ResultCard';
import { ResultDetails } from '@/components/ResultDetails';
import { ResultTable } from '@/components/ResultTable';
import { absolute, drawPath, getLottery, getResultByDraw, getResultsForLottery, results, site } from '@/app/data';

export function generateStaticParams() {
  return results.map((result) => ({ slug: result.lotterySlug, drawCode: result.drawCode.toLowerCase() }));
}

export function generateMetadata({ params }: { params: { slug: string; drawCode: string } }) {
  const lottery = getLottery(params.slug);
  const result = getResultByDraw(params.slug, params.drawCode);
  if (!lottery || !result) return {};
  return {
    title: `${lottery.name} ${result.drawCode} Result — ${result.displayDate}`,
    description: `${lottery.name} ${result.drawCode} Kerala Lottery result for ${result.displayDate}. Check prize table, source status, and claim guidance.`,
    alternates: { canonical: absolute(drawPath(result)) }
  };
}

export default function DrawArchivePage({ params }: { params: { slug: string; drawCode: string } }) {
  const lottery = getLottery(params.slug);
  const result = getResultByDraw(params.slug, params.drawCode);
  if (!lottery || !result) notFound();
  const related = getResultsForLottery(lottery.slug).filter((item) => item.drawCode !== result.drawCode).slice(0, 5);

  return (
    <main className="page">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${lottery.name} ${result.drawCode} Kerala Lottery Result`,
        datePublished: result.drawDate,
        dateModified: result.lastUpdated,
        publisher: { '@type': 'Organization', name: site.name },
        mainEntityOfPage: absolute(drawPath(result))
      }} />
      <div className="container">
        <div className="hero">
          <h1>{lottery.name} {result.drawCode} Result</h1>
          <p>{result.displayDate} draw archive with status, source links, prize table, and responsible verification guidance.</p>
        </div>
        <section className="section">
          <ResultCard lottery={lottery} result={result} />
          <div style={{ height: 24 }} />
          <ResultDetails result={result} />
          <ResultTable result={result} />
        </section>
        {!!related.length && (
          <section className="content-card">
            <h2>More {lottery.name} Results</h2>
            <div className="archive-links">
              {related.map((item) => <Link href={drawPath(item)} key={item.drawCode}>{item.drawCode} — {item.displayDate}</Link>)}
            </div>
          </section>
        )}
        <section className="content-card">
          <h2>Important Disclaimer</h2>
          <p>This archive page is for informational purposes only. Always verify winning numbers with official Kerala Lottery publications before making prize claims or financial decisions.</p>
        </section>
      </div>
    </main>
  );
}
