import { Link } from 'wouter';
import { lotteries } from '../data';

export function ScheduleGrid() {
  return (
    <div className="grid">
      {lotteries.map((lottery) => (
        <Link key={lottery.slug} href={`/results/${lottery.slug}`} className="schedule-card">
          <div className="schedule-card__name">{lottery.name}</div>
          <span className="schedule-card__code">{lottery.code}</span>
          <p>{lottery.drawDay}</p>
          <p>{lottery.drawTime}</p>
        </Link>
      ))}
    </div>
  );
}
