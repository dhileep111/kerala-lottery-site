import Link from 'next/link';
import { getResultWithLottery, getFirstPrizeNumber, lotteries } from '@/app/data';

export function Header() {
  const latest = getResultWithLottery();
  const message = latest
    ? `${latest.result.status === 'pending' ? 'AWAITING' : 'LIVE'}: ${latest.lottery.name} ${latest.result.drawCode} | 1st Prize ${getFirstPrizeNumber(latest.result)} | Updated ${latest.result.displayDate}`
    : 'Kerala Lottery results update daily at 3 PM IST.';

  return (
    <>
      <div className="ticker">
        <div className="container ticker__inner">
          <div className="ticker__label">Breaking</div>
          <div className="ticker__track"><span>{message}</span> <span aria-hidden="true"> | </span> <span>{message}</span></div>
        </div>
      </div>
      <header className="header">
        <nav className="container nav" aria-label="Main navigation">
          <Link className="logo" href="/">Kerala Ticket Results</Link>
          <div className="nav__links">
            <Link href="/">Home</Link>
            {lotteries.slice(0, 5).map((lottery) => <Link key={lottery.slug} href={`/results/${lottery.slug}`}>{lottery.name}</Link>)}
            <Link href="/check-ticket">Check Ticket</Link>
            <Link href="/claim-guide">Claim Guide</Link>
            <Link href="/guessing-numbers">Guessing</Link>
            <Link href="/about">About</Link>
          </div>
        </nav>
      </header>
    </>
  );
}
