import { useState } from 'react';
import { Link } from 'wouter';
import { JsonLd } from '../components/JsonLd';
import { ResultCard } from '../components/ResultCard';
import { ResultTable } from '../components/ResultTable';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { RecentResults } from '../components/RecentResults';
import { ShareResultButton } from '../components/ShareResultButton';
import { getLatestResult, getLottery, getResultWithLottery, lotteries, site } from '../data';

// Per-lottery accent colors
const LOTTERY_COLORS: Record<string, { primary: string; light: string; border: string; text: string }> = {
  'karunya':         { primary: '#2563eb', light: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  'karunya-plus':    { primary: '#7c3aed', light: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6' },
  'sthree-sakthi':   { primary: '#db2777', light: '#fdf2f8', border: '#fbcfe8', text: '#9d174d' },
  'dhanalekshmi':    { primary: '#d97706', light: '#fffbeb', border: '#fde68a', text: '#92400e' },
  'suvarna-keralam': { primary: '#059669', light: '#ecfdf5', border: '#a7f3d0', text: '#065f46' },
  'bhagyathara':     { primary: '#0891b2', light: '#ecfeff', border: '#a5f3fc', text: '#164e63' },
  'samrudhi':        { primary: '#65a30d', light: '#f7fee7', border: '#bbf7d0', text: '#3f6212' },
  'bumper':          { primary: '#dc2626', light: '#fef2f2', border: '#fecaca', text: '#991b1b' },
};

function getLotteryColor(slug: string) {
  return LOTTERY_COLORS[slug] ?? { primary: '#16a34a', light: '#f0fdf4', border: '#bbf7d0', text: '#166534' };
}

// Day of week helper
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function getTodayDayIndex() { return new Date().getDay(); }

function LotterySelector({ selected, onSelect }: { selected: string; onSelect: (slug: string) => void }) {
  const todayIdx = getTodayDayIndex();
  const mainLotteries = lotteries.filter(l => l.slug !== 'bumper');

  return (
    <div className="lottery-selector">
      {mainLotteries.map(lottery => {
        const color    = getLotteryColor(lottery.slug);
        const isToday  = lottery.drawDayIndex === todayIdx;
        const isActive = lottery.slug === selected;
        const latest   = getLatestResult(lottery.slug);
        const status   = latest?.status ?? 'pending';

        return (
          <button
            key={lottery.slug}
            className={`lottery-pill ${isActive ? 'lottery-pill--active' : ''}`}
            style={isActive ? {
              background: color.primary,
              borderColor: color.primary,
              color: 'white',
              boxShadow: `0 4px 14px ${color.primary}44`,
            } : {
              background: color.light,
              borderColor: color.border,
              color: color.text,
            }}
            onClick={() => onSelect(lottery.slug)}
          >
            <span className="lottery-pill__code">{lottery.code}</span>
            <span className="lottery-pill__name">{lottery.name}</span>
            <span className="lottery-pill__day">{lottery.drawDay.slice(0, 3)}</span>
            {isToday && <span className="lottery-pill__today">Today</span>}
            <span
              className={`lottery-pill__dot lottery-pill__dot--${status}`}
              title={status}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const defaultLatest = getResultWithLottery();
  const [selectedSlug, setSelectedSlug] = useState(defaultLatest?.lottery.slug ?? 'karunya');

  const selectedResult  = getLatestResult(selectedSlug);
  const selectedLottery = getLottery(selectedSlug);
  const color           = getLotteryColor(selectedSlug);

  return (
    <main className="page">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url, potentialAction: { '@type': 'SearchAction', target: `${site.url}/check-ticket?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }} />
      <div className="container">
        <div className="notice">கேரளா லாட்டரி முடிவுகள் தினமும் மதியம் 3 மணிக்கு புதுப்பிக்கப்படும். இந்த தளம் அதிகாரப்பூர்வ அரசு தளம் அல்ல. தகவல் நோக்கங்களுக்காக மட்டுமே.</div>

        {/* Hero with lottery selector */}
        <section className="section">
          <div className="section__header">
            <div>
              <h1>Kerala Lottery Result Today</h1>
              <p className="section__subtitle">Select your lottery — results update daily at 3 PM IST.</p>
            </div>
            <Link className="button" href="/check-ticket">Check Ticket</Link>
          </div>

          {/* Lottery selector pills */}
          <LotterySelector selected={selectedSlug} onSelect={setSelectedSlug} />

          {/* Selected lottery result */}
          {selectedLottery && selectedResult ? (
            <div className="selected-result-panel">
              <ResultCard lottery={selectedLottery} result={selectedResult} />
              <div style={{ height: 16 }} />
              <ResultTable result={selectedResult} />
              <ShareResultButton lottery={selectedLottery} result={selectedResult} />
            </div>
          ) : selectedLottery ? (
            <div className="selected-result-panel">
              <div style={{ padding: '32px 24px', textAlign: 'center', color: '#6b7280' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                <strong>{selectedLottery.name}</strong> draws every {selectedLottery.drawDay} at {selectedLottery.drawTime}.<br />
                No result published yet. Check back after 3 PM.
              </div>
              <div style={{ textAlign: 'center', paddingBottom: 24 }}>
                <Link href={`/results/${selectedSlug}`} className="button">View {selectedLottery.name} Page →</Link>
              </div>
            </div>
          ) : null}
        </section>

        <RecentResults />

        <section className="section">
          <div className="section__header"><h2>Weekly Lottery Schedule</h2><Link href="/about">View Guidelines</Link></div>
          <ScheduleGrid />
        </section>

        <section className="section">
          <h2 style={{ marginBottom: 20 }}>Quick Links</h2>
          <div className="grid">
            <Link className="quick-link-card" href="/check-ticket">
              <span className="quick-link-card__icon">🎟️</span>
              <strong>Check Ticket</strong>
              <p>Enter your ticket number to check if you've won any prize</p>
            </Link>
            <Link className="quick-link-card" href="/claim-guide">
              <span className="quick-link-card__icon">📋</span>
              <strong>How to Claim</strong>
              <p>Step-by-step guide including Tamil Nadu residents</p>
            </Link>
            <Link className="quick-link-card" href="/guessing-numbers">
              <span className="quick-link-card__icon">🔢</span>
              <strong>Guessing Numbers</strong>
              <p>Today's guessing numbers — for entertainment only</p>
            </Link>
            <Link className="quick-link-card" href="/faq">
              <span className="quick-link-card__icon">❓</span>
              <strong>FAQ</strong>
              <p>Common questions about results, prizes, and claims</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
