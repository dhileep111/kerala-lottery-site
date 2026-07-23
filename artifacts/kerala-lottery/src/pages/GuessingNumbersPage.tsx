import { Link } from 'wouter';
import { getLatestGuessing, lotteries, getTodayLottery, getTomorrowLottery, site } from '../data';
import type { GuessingDay } from '../data';
import { ShareGuessingButton } from '../components/ShareGuessingButton';

const TYPE_CONFIG = {
  board:  { bg: '#f0fdf4', border: '#bbf7d0' },
  combo:  { bg: '#eff6ff', border: '#bfdbfe' },
  triple: { bg: '#fdf4ff', border: '#e9d5ff' },
  four:   { bg: '#fffbeb', border: '#fde68a' },
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

function NumberCard({ item }: { item: GuessingDay['numbers'][0] }) {
  const cfg = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.four;
  return (
    <div className={`guess-card ${item.hot ? 'guess-card--hot' : ''}`} style={{ background: cfg.bg, borderColor: cfg.border }}>
      {item.hot && <span className="guess-card__hot">🔥 Hot</span>}
      <div className="guess-card__value">{item.value}</div>
      <div className="guess-card__label">{item.label}</div>
      <div className="guess-card__digits">{item.digits} digit{item.digits > 1 ? 's' : ''}</div>
    </div>
  );
}

export default function GuessingNumbersPage() {
  const latest = getLatestGuessing();
  const { boards, numbers, displayLabel } = latest;
  const byType = (type: string) => numbers.filter(n => n.type === type);
  const todayLottery    = getTodayLottery();
  const tomorrowLottery = getTomorrowLottery();
  const mainLotteries   = lotteries.filter(l => !l.isBumper);

  return (
    <main className="page">
      <div className="container">

        <div className="hero">
          <h1>Kerala Lottery Guessing Numbers Today</h1>
          <p>ABC board numbers and 4-digit combinations for all Kerala lottery draws. Updated daily before 3 PM IST. கேரளா லாட்டரி கணிப்பு எண்கள்.</p>
        </div>

        <div className="guess-update-bar" style={{ marginBottom: 24 }}>
          <span className="guess-update-bar__dot" />
          <span>Updated: <strong>{displayLabel}</strong></span>
          <span className="guess-update-bar__sep" />
          <span>Updated nightly</span>
          <span className="guess-update-bar__sep" />
          <Link href="/guessing-numbers/archive">See past days →</Link>
        </div>

        {/* Per-lottery quick links */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>Guessing Numbers by Lottery</h2>
            <p>Click any lottery for dedicated guessing numbers, hot/cold numbers, and Tamil guide</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 8 }}>
            {mainLotteries.map(lottery => {
              const isToday    = todayLottery.slug    === lottery.slug;
              const isTomorrow = tomorrowLottery.slug === lottery.slug;
              return (
                <Link
                  key={lottery.slug}
                  href={`/guessing-numbers/${lottery.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: isToday ? '#f0fdf4' : isTomorrow ? '#eff6ff' : 'white',
                    border: `2px solid ${isToday ? '#16a34a' : isTomorrow ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 6px 16px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform='none'; (e.currentTarget as HTMLDivElement).style.boxShadow='none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontFamily: 'ui-monospace,monospace', fontWeight: 900, background: '#f1f5f9', color: '#374151', padding: '2px 7px', borderRadius: 5 }}>{lottery.code}</span>
                      {isToday && <span style={{ fontSize: 10, fontWeight: 700, background: '#16a34a', color: 'white', padding: '2px 7px', borderRadius: 10 }}>TODAY</span>}
                      {isTomorrow && <span style={{ fontSize: 10, fontWeight: 700, background: '#2563eb', color: 'white', padding: '2px 7px', borderRadius: 10 }}>TOMORROW</span>}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{lottery.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{lottery.drawDay} • {lottery.drawTime}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ABC boards */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>Today's ABC Board Numbers</h2>
            <p>Base A, B, C values — all combinations derive from these three digits</p>
          </div>
          <div className="board-row">
            <BoardCard letter="A" value={boards.A} />
            <BoardCard letter="B" value={boards.B} />
            <BoardCard letter="C" value={boards.C} />
          </div>
        </section>

        <section className="guess-section">
          <div className="guess-section__header"><h2>Two Digit Combinations</h2></div>
          <div className="guess-grid guess-grid--3">{byType('combo').map(n => <NumberCard key={n.label} item={n} />)}</div>
        </section>

        <section className="guess-section">
          <div className="guess-section__header"><h2>Three Digit Numbers</h2></div>
          <div className="guess-grid guess-grid--3">{byType('triple').map(n => <NumberCard key={n.label} item={n} />)}</div>
        </section>

        <section className="guess-section">
          <div className="guess-section__header">
            <h2>Four Digit Picks</h2>
            <p>Check against last 4 digits of your ticket number</p>
          </div>
          <div className="guess-grid guess-grid--4">{byType('four').map(n => <NumberCard key={n.label} item={n} />)}</div>
        </section>

        <ShareGuessingButton day={latest} pageUrl={`${site.url}/guessing-numbers`} />

        {/* Tamil hub section */}
        <section className="content-card tamil-section" lang="ta" style={{ marginBottom: 20 }}>
          <h2>🇮🇳 கேரளா லாட்டரி கணிப்பு எண்கள்</h2>
          <p>இன்றைய A பலகை: <strong>{boards.A}</strong> | B பலகை: <strong>{boards.B}</strong> | C பலகை: <strong>{boards.C}</strong></p>
          <p style={{ marginTop: 8 }}>AB கலவை: {boards.A+boards.B} | BC கலவை: {boards.B+boards.C} | CA கலவை: {boards.C+boards.A}</p>
          <p style={{ marginTop: 8, fontSize: 13 }}>ஒவ்வொரு லாட்டரிக்கும் தனி எண்களுக்கு கீழே உள்ள லிங்கை கிளிக் செய்யவும்:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {mainLotteries.map(l => (
              <Link key={l.slug} href={`/guessing-numbers/${l.slug}`}
                style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: "'Noto Sans Tamil', sans-serif" }}>
                {l.name} கணிப்பு
              </Link>
            ))}
          </div>
        </section>

        <section className="content-card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
          <h2>⚠️ Disclaimer</h2>
          <p>Guessing numbers are for entertainment only. No number can be predicted or guaranteed. Play responsibly.</p>
        </section>
      </div>
    </main>
  );
}
