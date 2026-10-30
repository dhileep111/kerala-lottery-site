import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  getLatestGuessing, lotteries, getTodayLottery, getTomorrowLottery, site,
  getSeriesFrequency, getSiteHotNumbers, getLatestVerifiedResult,
  extractTicketDigits, deriveGuessingNumbers, getActiveUpcomingBumper, isBumperCountdownWindow,
  getBumperDrawDateIST,
} from '../data';
import type { GuessingDay, SeriesStat } from '../data';
import { ShareGuessingButton } from '../components/ShareGuessingButton';
import NextDrawCountdown from '../components/NextDrawCountdown';
import { useLang, t, getLotteryName, type Lang } from '../lib/i18n';

// Same "which lottery draws next" rule HomePage.tsx's getUpcomingLottery()
// uses (not exported there, so duplicated here rather than importing from
// a page module) — before the 3 PM + 60min result window it's today's
// lottery, after it's tomorrow's. Bumper-aware: GuessingNumbersPage's own
// countdown switches to the bumper's own time/name when one is announced.
function getUpcomingDailyLottery(now = new Date()) {
  const minsFromUtcMidnightIST = now.getUTCHours() * 60 + now.getUTCMinutes() + 330;
  const istMinutes = minsFromUtcMidnightIST % 1440;
  const istDay = (now.getUTCDay() + Math.floor(minsFromUtcMidnightIST / 1440)) % 7;
  const drawWindowEndMins = 15 * 60 + 60;
  let offsetDays = istMinutes < drawWindowEndMins ? 0 : 1;
  // A bumper date has no regular draw, so point at the next day's lottery instead.
  if (getTodayLottery(new Date(now.getTime() + offsetDays * 86400000)).isBumper) offsetDays += 1;
  return lotteries.find(l => !l.isBumper && l.drawDayIndex === (istDay + offsetDays) % 7);
}

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

function NumberCard({ item, idPrefix = 'gc', lang }: { item: GuessingDay['numbers'][0]; idPrefix?: string; lang: Lang }) {
  const cfg = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.four;
  const id = `${idPrefix}-${item.label.replace(/\s+/g, '-')}`;
  return (
    <div className="guess-card-flip">
      <input type="checkbox" id={id} className="guess-card-flip__toggle" aria-hidden="true" tabIndex={-1} />
      <label
        htmlFor={id}
        className={`guess-card-flip__inner guess-card ${item.hot ? 'guess-card--hot' : ''}`}
        style={{ background: cfg.bg, borderColor: cfg.border }}
        aria-label={t(lang, 'gnTapToReveal')}
      >
        {item.hot && <span className="guess-card__hot">🔥 Hot</span>}
        <div className="guess-card__value">{item.value}</div>
        <div className="guess-card__label">{item.label}</div>
        <div className="guess-card__digits">{item.digits} digit{item.digits > 1 ? 's' : ''}</div>
      </label>
    </div>
  );
}

// Calculator-only input rule — deliberately stricter than, and separate
// from, extractTicketDigits() in data.ts (that one is a straight port of
// update_guessing.py's extract_ticket_digits() and must stay exactly as
// the daily generator behaves). Here: take the LAST contiguous run of
// digits in the input and require it to be EXACTLY 6 digits — so a longer
// run (e.g. a 10-digit paste) is rejected rather than silently truncated.
function extractCalculatorDigits(input: string): string | null {
  const runs = input.match(/\d+/g);
  if (!runs || runs.length === 0) return null;
  const last = runs[runs.length - 1];
  return last.length === 6 ? last : null;
}

function GuessingCalculator({ lang }: { lang: Lang }) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState<{ digits: string; result: ReturnType<typeof deriveGuessingNumbers> } | null>(null);
  const [error, setError] = useState(false);

  function handleGenerate() {
    const digits = extractCalculatorDigits(input);
    if (!digits) {
      setError(true);
      setSubmitted(null);
      return;
    }
    setError(false);
    setSubmitted({ digits, result: deriveGuessingNumbers(digits) });
  }

  const shareDay: GuessingDay | null = submitted
    ? {
        date: '', displayLabel: submitted.digits,
        boards: submitted.result.boards,
        numbers: submitted.result.numbers,
      }
    : null;

  return (
    <div className="guess-calc">
      <div className="guess-calc__row">
        <input
          type="text"
          inputMode="numeric"
          className="guess-calc__input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          placeholder={t(lang, 'gnMakeOwnInputLabel')}
          aria-label={t(lang, 'gnMakeOwnInputLabel')}
          maxLength={20}
          autoComplete="off"
          spellCheck={false}
        />
        <button className="guess-calc__button" onClick={handleGenerate}>{t(lang, 'gnMakeOwnButton')}</button>
      </div>
      {error && <p className="guess-calc__error">{t(lang, 'gnMakeOwnInvalid')}</p>}

      {submitted && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{t(lang, 'gnMakeOwnResultTitle')}</h3>
          <div className="board-row" style={{ marginBottom: 16 }}>
            <BoardCard letter="A" value={submitted.result.boards.A} />
            <BoardCard letter="B" value={submitted.result.boards.B} />
            <BoardCard letter="C" value={submitted.result.boards.C} />
          </div>
          <div className="guess-grid guess-grid--4">
            {submitted.result.numbers.filter(n => n.type !== 'board').map(n => (
              <NumberCard key={n.label} item={n} idPrefix="calc" lang={lang} />
            ))}
          </div>
          {shareDay && (
            <div style={{ marginTop: 16 }}>
              <ShareGuessingButton day={shareDay} pageUrl={`${site.url}/guessing-numbers`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type SortKey = 'series' | 'wins' | 'lastWonDate';

function SeriesFrequencyTable({ stats, lang }: { stats: SeriesStat[]; lang: Lang }) {
  const [sortKey, setSortKey] = useState<SortKey>('wins');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const copy = [...stats];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'series') cmp = a.series.localeCompare(b.series);
      else if (sortKey === 'wins') cmp = a.wins - b.wins;
      else cmp = a.lastWonDate.localeCompare(b.lastWonDate);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [stats, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'series' ? 'asc' : 'desc');
    }
  }

  function arrow(key: SortKey) {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  const th = (key: SortKey, label: string) => (
    <th
      onClick={() => toggleSort(key)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
      aria-sort={sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}{arrow(key)}
    </th>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr>
            {th('series', t(lang, 'gnSeriesCol'))}
            {th('wins', t(lang, 'gnWinsCol'))}
            {th('lastWonDate', t(lang, 'gnLastWonDateCol'))}
            <th>{t(lang, 'gnLastWonDrawCodeCol')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr key={s.series}>
              <td><span className="badge">{s.series}</span></td>
              <td>{s.wins}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{s.lastWonDisplayDate}</td>
              <td>{s.lastWonDrawCode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GuessingNumbersPage() {
  const lang = useLang();
  const latest = getLatestGuessing();
  const { boards, numbers, displayLabel } = latest;
  const byType = (type: string) => numbers.filter(n => n.type === type);
  const todayLottery    = getTodayLottery();
  const tomorrowLottery = getTomorrowLottery();
  const mainLotteries   = lotteries.filter(l => !l.isBumper);
  const seriesStats     = getSeriesFrequency();
  const hotNumbers      = getSiteHotNumbers(5);

  const bumperUpcoming = getActiveUpcomingBumper();
  const upcomingDaily  = getUpcomingDailyLottery();
  const countdownProps = bumperUpcoming && isBumperCountdownWindow(bumperUpcoming)
    ? { drawHourIST: 14, drawMinuteIST: 0, lotteryName: `${bumperUpcoming.name} (${bumperUpcoming.code})` }
    : { lotteryName: upcomingDaily?.name, skipDateIST: getBumperDrawDateIST() ?? undefined };

  const latestVerified = getLatestVerifiedResult();
  const explainerFirst = latestVerified?.prizes.find(p => p.tier === '1st Prize');
  const explainerTicket = explainerFirst?.numbers?.[0];
  const explainerTicketStr = explainerTicket && typeof explainerTicket === 'object' ? explainerTicket.ticket : String(explainerTicket ?? '');
  const explainerDigits = extractTicketDigits(explainerTicketStr) ?? '';
  const explainerDerived = explainerDigits ? deriveGuessingNumbers(explainerDigits) : null;
  const explainerBody = latestVerified && explainerDerived
    ? t(lang, 'gnHowMadeBody')
        .replace('{code}', latestVerified.drawCode)
        .replace('{ticket}', explainerTicketStr)
        .replace('{digits}', explainerDigits.split('').join('-'))
        .replace('{a}', explainerDerived.boards.A)
        .replace('{b}', explainerDerived.boards.B)
        .replace('{c}', explainerDerived.boards.C)
    : null;

  return (
    <main className="page">
      <div className="container">

        <div className="hero">
          <h1>{t(lang, 'gnH1')}</h1>
          <p>{t(lang, 'gnSubtitle')}</p>
        </div>

        <div className="guess-update-bar" style={{ marginBottom: 24 }}>
          <span className="guess-update-bar__dot" />
          <span>{t(lang, 'gnUpdated')} <strong>{displayLabel}</strong></span>
          <span className="guess-update-bar__sep" />
          <span>{t(lang, 'gnUpdatedNightly')}</span>
          <span className="guess-update-bar__sep" />
          <Link href="/guessing-numbers/archive">{t(lang, 'gnSeePast')}</Link>
        </div>

        {/* Countdown to the next 3 PM IST draw (bumper-aware) */}
        <section className="guess-section">
          <NextDrawCountdown {...countdownProps} />
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: 13 }}>{t(lang, 'gnCheckLatestResult')}</Link>
          </div>
        </section>

        {/* Per-lottery quick links */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>{t(lang, 'gnByLottery')}</h2>
            <p>{t(lang, 'gnByLotterySub')}</p>
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
                      {isToday && <span style={{ fontSize: 10, fontWeight: 700, background: '#16a34a', color: 'white', padding: '2px 7px', borderRadius: 10 }}>{t(lang, 'today').toUpperCase()}</span>}
                      {isTomorrow && <span style={{ fontSize: 10, fontWeight: 700, background: '#2563eb', color: 'white', padding: '2px 7px', borderRadius: 10 }}>{t(lang, 'tomorrow').toUpperCase()}</span>}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{getLotteryName(lottery.slug, lottery.name, lang)}</div>
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
            <h2>{t(lang, 'gnAbcTitle')}</h2>
            <p>{t(lang, 'gnAbcSub')}</p>
          </div>
          <div className="board-row">
            <BoardCard letter="A" value={boards.A} />
            <BoardCard letter="B" value={boards.B} />
            <BoardCard letter="C" value={boards.C} />
          </div>
        </section>

        <section className="guess-section">
          <div className="guess-section__header"><h2>{t(lang, 'gnTwoDigit')}</h2></div>
          <div className="guess-grid guess-grid--3">{byType('combo').map(n => <NumberCard key={n.label} item={n} lang={lang} />)}</div>
        </section>

        <section className="guess-section">
          <div className="guess-section__header"><h2>{t(lang, 'gnThreeDigit')}</h2></div>
          <div className="guess-grid guess-grid--3">{byType('triple').map(n => <NumberCard key={n.label} item={n} lang={lang} />)}</div>
        </section>

        <section className="guess-section">
          <div className="guess-section__header">
            <h2>{t(lang, 'gnFourDigit')}</h2>
            <p>{t(lang, 'gnFourDigitSub')}</p>
          </div>
          <div className="guess-grid guess-grid--4">{byType('four').map(n => <NumberCard key={n.label} item={n} lang={lang} />)}</div>
        </section>

        <ShareGuessingButton day={latest} pageUrl={`${site.url}/guessing-numbers`} />

        {/* Make your own guessing number */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>{t(lang, 'gnMakeOwnTitle')}</h2>
            <p>{t(lang, 'gnMakeOwnSub')}</p>
          </div>
          <GuessingCalculator lang={lang} />
        </section>

        {/* How these numbers are made */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>{t(lang, 'gnHowMadeTitle')}</h2>
          </div>
          {explainerBody && <p>{explainerBody}</p>}
          <p style={{ fontWeight: 700, color: '#b45309' }}>{t(lang, 'gnRandomNotice')}</p>
        </section>

        {/* Series Frequency — how often each 2-letter series has won 1st Prize */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>{t(lang, 'gnSeriesFreqTitle')}</h2>
            <p>{t(lang, 'gnSeriesFreqSub')}</p>
          </div>
          {seriesStats.length > 0 ? (
            <SeriesFrequencyTable stats={seriesStats} lang={lang} />
          ) : (
            <p style={{ opacity: 0.7 }}>{t(lang, 'gnSeriesEmpty')}</p>
          )}
        </section>

        {/* Hot Numbers — most frequent last-4-digit endings across all tiers, last 30 draws */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>{t(lang, 'gnHotTitle')}</h2>
            <p>{t(lang, 'gnHotSub')}</p>
          </div>
          {hotNumbers.length > 0 ? (
            <div className="guess-grid guess-grid--4">
              {hotNumbers.map((h) => (
                <div key={h.number} className="guess-card guess-card--hot" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
                  <span className="guess-card__hot">🔥 {t(lang, 'gnHot')}</span>
                  <div className="guess-card__value">{h.number}</div>
                  <div className="guess-card__label">{t(lang, 'gnAppeared')} {h.count}×</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ opacity: 0.7 }}>{t(lang, 'gnHotEmpty')}</p>
          )}
        </section>

        {/* Tamil hub section */}
        {lang === 'ta' && (
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
        )}

        <section className="content-card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
          <h2>⚠️ {t(lang, 'disclaimer')}</h2>
          <p>{t(lang, 'gnDisclaimerBody')}</p>
        </section>
      </div>
    </main>
  );
}
