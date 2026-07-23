import { Link, useParams } from 'wouter';
import { JsonLd } from '../components/JsonLd';
import {
  getLottery, getLatestGuessing, getHotColdNumbers,
  getTodayLottery, getTomorrowLottery, getLatestResult,
  getFirstPrizeNumber, site
} from '../data';
import { ShareGuessingButton } from '../components/ShareGuessingButton';

// Tamil lottery names
const TAMIL: Record<string, string> = {
  'karunya':         'கருண்யா',
  'karunya-plus':    'கருண்யா பிளஸ்',
  'sthree-sakthi':   'ஸ்ரீ சக்தி',
  'dhanalekshmi':    'தனலட்சுமி',
  'bhagyathara':     'பாக்யதாரா',
  'suvarna-keralam': 'சுவர்ண கேரளம்',
  'samrudhi':        'சம்ருத்தி',
};
const TAMIL_DAYS: Record<string, string> = {
  Monday:'திங்கள்', Tuesday:'செவ்வாய்', Wednesday:'புதன்',
  Thursday:'வியாழன்', Friday:'வெள்ளி', Saturday:'சனி', Sunday:'ஞாயிறு',
};

function BoardCard({ letter, value }: { letter: string; value: string }) {
  return (
    <div className="board-card">
      <div className="board-card__letter">{letter}</div>
      <div className="board-card__label">Board</div>
      <div className="board-card__value">{value}</div>
    </div>
  );
}

function NumChip({ value, hot }: { value: string; hot?: boolean }) {
  return (
    <span style={{
      display: 'inline-block', fontFamily: 'ui-monospace,monospace',
      fontWeight: 800, fontSize: 15, padding: '6px 12px',
      borderRadius: 9, letterSpacing: '0.06em',
      background: hot ? '#fef3c7' : '#f1f5f9',
      border: `1px solid ${hot ? '#f59e0b' : '#e2e8f0'}`,
      color: hot ? '#78350f' : '#1e293b',
    }}>
      {hot && '🔥 '}{value}
    </span>
  );
}

function TomorrowBanner({ slug }: { slug: string }) {
  const tomorrow = getTomorrowLottery();
  const todayLottery = getTodayLottery();
  // Only show tomorrow banner on pages that are NOT today's lottery
  if (todayLottery.slug === slug) return null;
  if (tomorrow.slug !== slug) return null;

  return (
    <div style={{ background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '2px solid #93c5fd', borderRadius: 16, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <div style={{ fontSize: 28 }}>📅</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#1e40af' }}>Tomorrow's Draw</div>
        <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>
          {tomorrow.name} draws <strong>tomorrow at {tomorrow.drawTime}</strong>. These A/B/C board numbers apply to tomorrow's draw.
        </div>
      </div>
      <Link href={`/results/${tomorrow.slug}`} style={{ marginLeft: 'auto', background: '#2563eb', color: 'white', padding: '8px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none', flexShrink: 0 }}>
        View Latest Result →
      </Link>
    </div>
  );
}

export default function LotteryGuessingPage() {
  const params = useParams<{ slug: string }>();
  const lottery = getLottery(params.slug);

  if (!lottery) {
    return <main className="page"><div className="container"><p>Lottery not found. <Link href="/guessing-numbers">Back to guessing numbers</Link></p></div></main>;
  }

  const latest = getLatestGuessing();
  const { boards, displayLabel: updatedLabel } = latest;
  const { hot, cold } = getHotColdNumbers(lottery.slug);
  const A = boards.A, B = boards.B, C = boards.C;
  const todayLottery = getTodayLottery();
  const tomorrowLottery = getTomorrowLottery();
  const isToday = todayLottery.slug === lottery.slug;
  const isTomorrow = tomorrowLottery.slug === lottery.slug;
  const latestResult = getLatestResult(lottery.slug);
  const tamilName = TAMIL[lottery.slug] ?? lottery.name;
  const tamilDay = TAMIL_DAYS[lottery.drawDay] ?? lottery.drawDay;
  const pageUrl = `${site.url}/guessing-numbers/${lottery.slug}`;

  const combos = [
    { label: 'AB', value: A+B }, { label: 'BC', value: B+C }, { label: 'CA', value: C+A },
  ];
  const triples = [
    { label: 'ABC', value: A+B+C }, { label: 'BCA', value: B+C+A }, { label: 'CAB', value: C+A+B },
  ];
  const fourPicks = [
    { label: 'Hot Pick',     value: A+A+B+C,  hot: true  },
    { label: 'Lucky Combo',  value: A+B+C+A,  hot: true  },
    { label: 'Mirror Pick',  value: B+B+C+A,  hot: false },
    { label: 'Pattern Pick', value: C+C+A+B,  hot: false },
    { label: 'Reverse Pick', value: C+B+A+C,  hot: false },
    { label: 'Zero Start',   value: '0'+A+B+C,hot: false },
    { label: 'Double AB',    value: A+B+A+B,  hot: false },
    { label: 'Double BC',    value: B+C+B+C,  hot: false },
  ];

  return (
    <main className="page">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${lottery.name} Guessing Numbers Today — ${isToday ? 'Today' : isTomorrow ? "Tomorrow's" : lottery.drawDay} Draw`,
        description: `${lottery.name} (${lottery.code}) lottery guessing numbers. A/B/C board values, 2-digit, 3-digit and 4-digit combinations. ${tamilName} கணிப்பு எண்கள்.`,
        dateModified: latest.date,
        publisher: { '@type': 'Organization', name: site.name, url: site.url },
        mainEntityOfPage: pageUrl,
        keywords: `${lottery.name} guessing numbers, ${lottery.code} lucky numbers, ${tamilName} கணிப்பு, kerala lottery guessing today`,
      }} />

      <div className="container">
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> › </span>
          <Link href="/guessing-numbers">Guessing Numbers</Link>
          <span aria-hidden="true"> › </span>
          <span>{lottery.name}</span>
        </nav>

        {/* Hero */}
        <div className="hero">
          <h1>
            {lottery.name} Guessing Numbers
            {isToday && <span style={{ marginLeft: 10, fontSize: 14, background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 20, fontWeight: 700, verticalAlign: 'middle' }}>Today</span>}
            {isTomorrow && <span style={{ marginLeft: 10, fontSize: 14, background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: 20, fontWeight: 700, verticalAlign: 'middle' }}>Tomorrow</span>}
          </h1>
          <p>
            {lottery.name} ({lottery.code}) draws every <strong>{lottery.drawDay}</strong> at {lottery.drawTime}.
            {latestResult && ` Latest draw: ${latestResult.drawCode} — 1st prize ${getFirstPrizeNumber(latestResult)}.`}
          </p>
        </div>

        {/* Tomorrow banner */}
        <TomorrowBanner slug={lottery.slug} />

        {/* Update badge */}
        <div className="guess-update-bar" style={{ marginBottom: 28 }}>
          <span className="guess-update-bar__dot" />
          <span>Updated: <strong>{updatedLabel}</strong></span>
          <span className="guess-update-bar__sep" />
          <span>Updated nightly before tomorrow's draw</span>
        </div>

        {/* ABC Boards */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>{lottery.name} ABC Board Numbers</h2>
            <p>Today's A, B, C base values for {lottery.name} — all combinations derive from these three digits</p>
          </div>
          <div className="board-row">
            <BoardCard letter="A" value={A} />
            <BoardCard letter="B" value={B} />
            <BoardCard letter="C" value={C} />
          </div>
        </section>

        {/* 2-digit combos */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>Two Digit Combinations</h2>
            <p>AB, BC, CA pairings for {lottery.name}</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {combos.map(c => (
              <div key={c.label} style={{ textAlign: 'center', background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: 14, padding: '16px 24px', minWidth: 90 }}>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'ui-monospace,monospace', color: '#1d4ed8', letterSpacing: '0.06em' }}>{c.value}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginTop: 4 }}>{c.label} Combo</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3-digit */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>Three Digit Combinations</h2>
            <p>ABC, BCA, CAB arrangements</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {triples.map(t => (
              <div key={t.label} style={{ textAlign: 'center', background: '#fdf4ff', border: '2px solid #e9d5ff', borderRadius: 14, padding: '16px 24px', minWidth: 100 }}>
                <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'ui-monospace,monospace', color: '#6d28d9', letterSpacing: '0.06em' }}>{t.value}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginTop: 4 }}>{t.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 4-digit picks */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>Four Digit Picks for {lottery.name}</h2>
            <p>Check these against the last 4 digits of your {lottery.code} ticket</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {fourPicks.map(p => <NumChip key={p.label} value={p.value} hot={p.hot} />)}
          </div>
        </section>

        <ShareGuessingButton day={latest} lotteryName={lottery.name} pageUrl={pageUrl} />

        {/* Hot & Cold numbers from real historical data */}
        {hot.length > 0 && (
          <section className="guess-section">
            <div className="guess-section__header">
              <h2>🔥 Hot Numbers — {lottery.name} History</h2>
              <p>4-digit endings that appeared most frequently in the last 30 {lottery.name} draws</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {hot.map(n => <NumChip key={n} value={n} hot />)}
            </div>
            <div className="guess-section__header" style={{ marginTop: 20 }}>
              <h2>❄️ Cold Numbers — {lottery.name} History</h2>
              <p>4-digit endings that rarely appeared — some players prefer these as "overdue"</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cold.map(n => <NumChip key={n} value={n} />)}
            </div>
          </section>
        )}

        {/* Tamil section */}
        <section className="content-card tamil-section" lang="ta">
          <h2>🇮🇳 {tamilName} கணிப்பு எண்கள் — Tamil Guide</h2>
          <p>
            <strong>{tamilName} ({lottery.code})</strong> லாட்டரி ஒவ்வொரு {tamilDay}யும் மதியம் 3:00 மணிக்கு நடத்தப்படுகிறது.
          </p>
          <p style={{ marginTop: 10, fontFamily: 'inherit', lineHeight: 2 }}>
            <strong>இன்றைய A பலகை:</strong> {A} &nbsp;|&nbsp;
            <strong>B பலகை:</strong> {B} &nbsp;|&nbsp;
            <strong>C பலகை:</strong> {C}<br />
            <strong>AB கலவை:</strong> {A+B} &nbsp;|&nbsp;
            <strong>BC கலவை:</strong> {B+C} &nbsp;|&nbsp;
            <strong>CA கலவை:</strong> {C+A}<br />
            <strong>ABC மூன்று இலக்கம்:</strong> {A+B+C} &nbsp;|&nbsp;
            <strong>நான்கு இலக்க எண்:</strong> {A+A+B+C}, {A+B+C+A}
          </p>
          <p style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>
            ⚠️ இந்த எண்கள் வெற்றி உத்தரவாதம் அல்ல. பொழுதுபோக்கு நோக்கங்களுக்காக மட்டுமே.
          </p>
        </section>

        {/* Links to other lottery guessing pages */}
        <section className="content-card" style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Other Lottery Guessing Numbers</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['bhagyathara','sthree-sakthi','dhanalekshmi','karunya-plus','suvarna-keralam','karunya','samrudhi']
              .filter(s => s !== lottery.slug)
              .map(s => {
                const l = getLottery(s);
                return l ? (
                  <Link key={s} href={`/guessing-numbers/${s}`} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: '#374151', textDecoration: 'none' }}>
                    {l.name} ({l.drawDay.slice(0,3)})
                  </Link>
                ) : null;
              })}
          </div>
        </section>

        <section className="content-card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb', marginTop: 20 }}>
          <h2>⚠️ Disclaimer</h2>
          <p>Guessing numbers are for entertainment only. Lottery is a game of chance — no number can be predicted or guaranteed. Please play responsibly.</p>
        </section>
      </div>
    </main>
  );
}
