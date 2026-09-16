import { useState } from 'react';
import { Link } from 'wouter';
import { JsonLd, BreadcrumbSchema } from '../components/JsonLd';
import { ResultCard } from '../components/ResultCard';
import { ResultTable } from '../components/ResultTable';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { RecentResults } from '../components/RecentResults';
import { ShareResultButton } from '../components/ShareResultButton';
import { getLatestResult, getLottery, getResultWithLottery, lotteries, site, getTodayHoliday } from '../data';
import NextDrawCountdown from '../components/NextDrawCountdown';
import { useLang, t, getLotteryName } from '../lib/i18n';

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

// Which lottery draws next, IST-aware. Before ~4 PM IST it's today's lottery
// (counting down to / publishing the 3 PM draw); after the result window it's tomorrow's.
function getUpcomingLottery() {
  const now = new Date();
  const minsFromUtcMidnightIST = now.getUTCHours() * 60 + now.getUTCMinutes() + 330; // IST = UTC+5:30
  const istMinutes = minsFromUtcMidnightIST % 1440;
  const istDay = (now.getUTCDay() + Math.floor(minsFromUtcMidnightIST / 1440)) % 7;
  const drawWindowEndMins = 15 * 60 + 60; // 3:00 PM + 60-min result window
  const targetDay = istMinutes < drawWindowEndMins ? istDay : (istDay + 1) % 7;
  return lotteries.find(l => !l.isBumper && l.drawDayIndex === targetDay);
}

function LotterySelector({ selected, onSelect }: { selected: string; onSelect: (slug: string) => void }) {
  const lang = useLang();
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
            <span className="lottery-pill__name">{getLotteryName(lottery.slug, lottery.name, lang)}</span>
            <span className="lottery-pill__day">{lottery.drawDay.slice(0, 3)}</span>
            {isToday && <span className="lottery-pill__today">{t(lang, 'today')}</span>}
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
  const lang = useLang();
  const defaultLatest = getResultWithLottery();
  const [selectedSlug, setSelectedSlug] = useState(defaultLatest?.lottery.slug ?? 'karunya');

  const selectedResult  = getLatestResult(selectedSlug);
  const selectedLottery = getLottery(selectedSlug);
  const color           = getLotteryColor(selectedSlug);
  const todayHoliday    = getTodayHoliday();

  return (
    <main className="page">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url, potentialAction: { '@type': 'SearchAction', target: `${site.url}/check-ticket?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }} />
      <BreadcrumbSchema items={[{ name: 'Home', url: site.url }]} />
      <div className="container">
        {todayHoliday && (
          <div className="notice" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
            🎉 {lang === 'ta'
              ? <><strong>இன்று {todayHoliday}</strong> — இன்று லாட்டரி டிராவ் இல்லை. நாளை வழக்கம் போல் தொடரும்.</>
              : <strong>{t(lang, 'homeHolidayNotice').replace('{name}', todayHoliday)}</strong>}
          </div>
        )}
        {lang === 'ta' ? (
          <div className="notice">கேரளா லாட்டரி ரிசல்ட் (கேரளா ரிசல்ட்) தினமும் மதியம் 3 மணிக்கு இங்கே புதுப்பிக்கப்படும். உங்கள் லாட்டரியைத் தேர்ந்தெடுத்து இன்றைய முடிவைப் பாருங்கள்.</div>
        ) : (
          <div className="notice">{t(lang, 'homeNotice')}</div>
        )}

        {/* Hero with lottery selector */}
        <section className="section">
          <div className="section__header">
            <div>
              <h1>{t(lang, 'homeH1')}</h1>
              <p className="section__subtitle">{t(lang, 'homeSubtitle')}</p>
            </div>
            <Link className="button" href="/check-ticket">{t(lang, 'checkTicket')}</Link>
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
                <strong>{getLotteryName(selectedLottery.slug, selectedLottery.name, lang)}</strong> {t(lang, 'homeDrawsEvery')} {selectedLottery.drawDay} {t(lang, 'homeAt')} {selectedLottery.drawTime}.<br />
                {t(lang, 'homeNoResultYet')}
              </div>
              <div style={{ textAlign: 'center', paddingBottom: 24 }}>
                <Link href={`/results/${selectedSlug}`} className="button">
                  {t(lang, 'homeViewPagePrefix')} {getLotteryName(selectedLottery.slug, selectedLottery.name, lang)} {t(lang, 'homeViewPageSuffix')}
                </Link>
              </div>
            </div>
          ) : null}

          {/* Live countdown to the next daily 3 PM IST draw */}
          <div style={{ marginTop: 24 }}>
            <NextDrawCountdown lotteryName={getUpcomingLottery()?.name} />
          </div>
        </section>

        <RecentResults />

        <section className="section">
          <div className="section__header"><h2>{t(lang, 'homeWeeklySchedule')}</h2><Link href="/about">{t(lang, 'homeViewGuidelines')}</Link></div>
          <ScheduleGrid />
        </section>

        <section className="section">
          <h2 style={{ marginBottom: 20 }}>{t(lang, 'homeQuickLinks')}</h2>
          <div className="grid">
            <Link className="quick-link-card" href="/check-ticket">
              <span className="quick-link-card__icon">🎟️</span>
              <strong>{t(lang, 'checkTicket')}</strong>
              <p>{t(lang, 'homeCheckTicketDesc')}</p>
            </Link>
            <Link className="quick-link-card" href="/claim-guide">
              <span className="quick-link-card__icon">📋</span>
              <strong>{t(lang, 'homeHowToClaim')}</strong>
              <p>{t(lang, 'homeHowToClaimDesc')}</p>
            </Link>
            <Link className="quick-link-card" href="/guessing-numbers">
              <span className="quick-link-card__icon">🔢</span>
              <strong>{t(lang, 'guessingNumbers')}</strong>
              <p>{t(lang, 'homeGuessingDesc')}</p>
            </Link>
            <Link className="quick-link-card" href="/faq">
              <span className="quick-link-card__icon">❓</span>
              <strong>{t(lang, 'faq')}</strong>
              <p>{t(lang, 'homeFaqDesc')}</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
