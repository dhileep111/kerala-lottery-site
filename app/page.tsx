import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { ResultCard } from '@/components/ResultCard';
import { ResultTable } from '@/components/ResultTable';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { absolute, getResultWithLottery, lotteries, site } from './data';

export default function HomePage() {
  const latest = getResultWithLottery();

  return (
    <main className="page">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url }} />
      <div className="container">
        <div className="notice">கேரளா லாட்டரி முடிவுகள் தினமும் மதியம் 3 மணிக்கு புதுப்பிக்கப்படும். இந்த தளம் அதிகாரப்பூர்வ அரசு தளம் அல்ல. தகவல் நோக்கங்களுக்காக மட்டுமே.</div>
        <section className="section">
          <div className="section__header">
            <div>
              <h1>Kerala Lottery Result Today</h1>
              <p className="section__subtitle">Fast Kerala Lottery updates with clear pending, live, and verified status for every draw.</p>
            </div>
            <Link className="button" href="/check-ticket">Check Ticket</Link>
          </div>
          {latest ? <><ResultCard lottery={latest.lottery} result={latest.result} /><div style={{ height: 24 }} /><ResultTable result={latest.result} /></> : <p>No result data available.</p>}
        </section>
        <section className="section">
          <div className="section__header"><h2>Weekly Lottery Schedule</h2><Link href="/about">View Guidelines</Link></div>
          <ScheduleGrid />
        </section>
        <section className="section">
          <h2 style={{ marginBottom: 20 }}>Quick Links</h2>
          <div className="grid">
            {lotteries.map((lottery) => <Link key={lottery.slug} className="quick-link" href={`/results/${lottery.slug}`}>{lottery.name} Result <span>→</span></Link>)}
            <Link className="quick-link" href="/guessing-numbers">Guessing Numbers <span>→</span></Link>
            <Link className="quick-link" href="/claim-guide">Lottery Claim Guide <span>→</span></Link>
            <Link className="quick-link" href="/about">About / Disclaimer <span>→</span></Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export const metadata = {
  alternates: { canonical: absolute('/') }
};
