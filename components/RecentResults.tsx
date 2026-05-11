import Link from 'next/link';
import { drawPath, getFirstPrizeNumber, getRecentResults } from '@/app/data';
import { Badge } from './Badge';

export function RecentResults() {
  const recentResults = getRecentResults(8);

  if (!recentResults.length) return null;

  return (
    <section className="section" aria-label="Recent Kerala Lottery Results">
      <div className="section__header">
        <div>
          <h2>Recent Results</h2>
          <p className="section__subtitle">Archive-ready draw records with status, source, and prize summary.</p>
        </div>
      </div>
      <div className="recent-grid">
        {recentResults.map(({ result, lottery }) => (
          <Link className="recent-card" href={drawPath(result)} key={`${result.lotterySlug}-${result.drawCode}`}>
            <div className="recent-card__top">
              <span>{lottery.name}</span>
              <Badge status={result.status} />
            </div>
            <strong>{result.drawCode}</strong>
            <p>{result.displayDate}</p>
            <div className="recent-card__number">{getFirstPrizeNumber(result)}</div>
            {result.firstPrizeDistrict && <p>District: {result.firstPrizeDistrict}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
