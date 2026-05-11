import Link from 'next/link';
import { lotteries } from '@/app/data';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <h3>Kerala Ticket Results</h3>
            <p>Daily Kerala Lottery result updates with clearer data handling, archive-ready records, and responsible disclaimers.</p>
            <p>Not an official government website.</p>
          </div>
          <div>
            <h3>Results</h3>
            {lotteries.slice(0, 4).map((lottery) => <Link key={lottery.slug} href={`/results/${lottery.slug}`}>{lottery.name} Results</Link>)}
          </div>
          <div>
            <h3>More Lotteries</h3>
            {lotteries.slice(4).map((lottery) => <Link key={lottery.slug} href={`/results/${lottery.slug}`}>{lottery.name} Results</Link>)}
          </div>
          <div>
            <h3>Resources</h3>
            <Link href="/check-ticket">Ticket Checker</Link>
            <Link href="/guessing-numbers">Guessing Numbers</Link>
            <Link href="/claim-guide">How to Claim Prize</Link>
            <Link href="/about">About & Disclaimer</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/contact">Contact Us</Link>
          </div>
        </div>
        <div className="footer__bottom">© 2026 Kerala Ticket Results. Informational use only. Verify with official Kerala Lottery publications before claims.</div>
      </div>
    </footer>
  );
}
