import { Badge } from './Badge';
import { getFirstPrizeNumber } from '../data';
import type { Lottery, Result } from '../types';

export function ResultCard({ lottery, result }: { lottery: Lottery; result: Result }) {
  const firstPrizeNumber = getFirstPrizeNumber(result);
  const isPending = result.status === 'pending' || firstPrizeNumber === 'PENDING';

  return (
    <article className={`card result-card result-card--${result.status}`}>
      <div className="result-card__head">
        <div>
          <div className="eyebrow">Today&apos;s draw</div>
          <div className="result-card__name">{lottery.name} {result.drawCode}</div>
          <div className="meta"><span>{result.displayDate}</span><span>{lottery.drawTime}</span><span>{result.sourceName}</span></div>
        </div>
        <Badge status={result.status} />
      </div>
      <div className="result-card__body">
        <div className="prize-main">
          <div className="prize-main__label">First Prize</div>
          <div className="prize-main__amount">{lottery.firstPrizeAmount}</div>
          {isPending ? (
            <div className="pending-panel">
              <span className="pending-panel__dot" aria-hidden="true" />
              <div>
                <strong>Awaiting official result</strong>
                <p>Winning number will appear here after verification.</p>
              </div>
            </div>
          ) : (
            <div className="prize-number">{firstPrizeNumber}</div>
          )}
        </div>
        <div className="info-box">
          <span className="info-box__label">Verification status</span>
          <strong>{isPending ? 'Not published yet' : result.status === 'verified' ? 'Verified result' : 'Live update'}</strong>
          <p>{result.status === 'verified'
            ? 'This result is marked verified. Still cross-check with the official Kerala Lottery publication before making a prize claim.'
            : 'We keep pending, live, and verified states separate so template data is never shown as an official winning number.'}</p>
        </div>
      </div>
    </article>
  );
}
