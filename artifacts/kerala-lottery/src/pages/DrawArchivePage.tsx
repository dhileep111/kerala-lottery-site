import { Link, useParams } from 'wouter';
import { JsonLd } from '../components/JsonLd';
import { ResultCard } from '../components/ResultCard';
import { ResultDetails } from '../components/ResultDetails';
import { ResultTable } from '../components/ResultTable';
import { drawPath, getLottery, getResultByDraw, getResultsForLottery, site } from '../data';
import { ShareResultButton } from '../components/ShareResultButton';

export default function DrawArchivePage() {
  const params = useParams<{ slug: string; drawCode: string }>();

  // Guard: trailing slash on lottery page causes drawCode="" — redirect to correct page
  if (!params.drawCode || params.drawCode === '' || params.drawCode === '/') {
    if (typeof window !== 'undefined') {
      window.location.replace(`/results/${params.slug}`);
    }
    return null;
  }

  const lottery = getLottery(params.slug);
  const result = getResultByDraw(params.slug, params.drawCode);

  if (!lottery || !result) {
    return <main className="page"><div className="container"><p>Result not found.</p></div></main>;
  }

  const related = getResultsForLottery(lottery.slug).filter((item) => item.drawCode !== result.drawCode).slice(0, 5);
  const pageUrl = `${site.url}${drawPath(result)}`;

  return (
    <main className="page">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: `${lottery.name} ${result.drawCode} Kerala Lottery Result`,
        description: `${lottery.name} ${result.drawCode} lottery result for ${result.displayDate}. Complete prize table with winning numbers and official source.`,
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
          { '@type': 'ListItem', position: 2, name: `${lottery.name} Result`, item: `${site.url}/results/${lottery.slug}` },
          { '@type': 'ListItem', position: 3, name: result.drawCode, item: pageUrl },
        ],
      }} />
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <a href={`/results/${lottery.slug}`}>{lottery.name} Result</a>
          <span aria-hidden="true"> › </span>
          <span>{result.drawCode}</span>
        </nav>
        <div className="hero">
          <h1>{lottery.name} {result.drawCode} Result</h1>
          <p>{result.displayDate} draw archive with status, source links, prize table, and responsible verification guidance.</p>
        </div>
        <section className="section">
          <ResultCard lottery={lottery} result={result} />
          <div style={{ height: 24 }} />
          <ResultDetails result={result} />
          <ResultTable result={result} />
          <ShareResultButton lottery={lottery} result={result} />
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
