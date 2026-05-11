import { Badge } from './Badge';
import { getFirstPrizeNumber } from '@/app/data';
import type { Lottery, Result } from '@/app/types';

export function ResultCard({ lottery, result }: { lottery: Lottery; result: Result }) {
  return (
    <article className="card result-card">
      <div className="result-card__head">
        <div>
          <div className="result-card__name">{lottery.name} {result.drawCode}</div>
          <div className="meta"><span>{result.displayDate}</span><span>{lottery.drawTime}</span><span>Source: {result.sourceName}</span></div>
        </div>
        <Badge status={result.status} />
      </div>
      <div className="result-card__body">
        <div className="prize-main">
          <div className="prize-main__label">First Prize</div>
          <div className="prize-main__amount">{lottery.firstPrizeAmount}</div>
          <div className="prize-number">{getFirstPrizeNumber(result)}</div>
        </div>
        <div className="info-box">
          <strong>Trust note</strong>
          {result.status === 'verified'
            ? 'This result is marked verified. Still cross-check with the official Kerala Lottery publication before making a prize claim.'
            : 'This result is not verified yet. We show pending/live status separately to avoid mixing template data with official data.'}
        </div>
      </div>
    </article>
  );
}
