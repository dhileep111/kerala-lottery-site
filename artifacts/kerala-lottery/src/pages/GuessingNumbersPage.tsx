import { guessingData } from '../data';

const TYPE_CONFIG = {
  board:  { label: 'Board Numbers',      desc: 'Single digit A, B, C board values',       bg: '#f0fdf4', border: '#bbf7d0', badge: '#16a34a', badgeText: 'white' },
  combo:  { label: 'Two Digit Combos',   desc: 'AB, BC, CA board combinations',            bg: '#eff6ff', border: '#bfdbfe', badge: '#2563eb', badgeText: 'white' },
  triple: { label: 'Three Digit Combos', desc: 'Three-digit board arrangements',           bg: '#fdf4ff', border: '#e9d5ff', badge: '#7c3aed', badgeText: 'white' },
  four:   { label: 'Four Digit Picks',   desc: 'Last 4 digits — check against your ticket', bg: '#fffbeb', border: '#fde68a', badge: '#d97706', badgeText: 'white' },
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

function NumberCard({ item }: { item: typeof guessingData.numbers[0] }) {
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
  const { boards, numbers, updatedLabel } = guessingData;

  const byType = (type: string) => numbers.filter(n => n.type === type);

  return (
    <main className="page">
      <div className="container">

        {/* Hero */}
        <div className="hero">
          <h1>Kerala Lottery Guessing Numbers</h1>
          <p>Today's guessing numbers for all Kerala lottery draws. For entertainment only — not guaranteed winning numbers.</p>
        </div>

        {/* Update badge */}
        <div className="guess-update-bar">
          <span className="guess-update-bar__dot" />
          <span>Updated: <strong>{updatedLabel}</strong></span>
          <span className="guess-update-bar__sep" />
          <span>Updated daily before 3 PM IST</span>
        </div>

        {/* A B C Boards — hero row */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>Today's Board Numbers</h2>
            <p>Base A, B, C values — all other combinations are derived from these</p>
          </div>
          <div className="board-row">
            <BoardCard letter="A" value={boards.A} />
            <BoardCard letter="B" value={boards.B} />
            <BoardCard letter="C" value={boards.C} />
          </div>
        </section>

        {/* Two digit combos */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>Two Digit Combinations</h2>
            <p>AB, BC, CA pairings derived from today's boards</p>
          </div>
          <div className="guess-grid guess-grid--3">
            {byType('combo').map(n => <NumberCard key={n.label} item={n} />)}
          </div>
        </section>

        {/* Three digit */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>Three Digit Numbers</h2>
            <p>ABC, BCA, CAB arrangements</p>
          </div>
          <div className="guess-grid guess-grid--3">
            {byType('triple').map(n => <NumberCard key={n.label} item={n} />)}
          </div>
        </section>

        {/* Four digit picks */}
        <section className="guess-section">
          <div className="guess-section__header">
            <h2>Four Digit Picks</h2>
            <p>Check these against the last 4 digits of your ticket number</p>
          </div>
          <div className="guess-grid guess-grid--4">
            {byType('four').map(n => <NumberCard key={n.label} item={n} />)}
          </div>
        </section>

        {/* How to update — admin guide */}
        <section className="content-card guess-update-guide">
          <h2>📅 How to Update Guessing Numbers</h2>
          <p>Guessing numbers are updated by editing <code>src/data/guessing-numbers.json</code> in the repository. Change the three values under <code>"boards"</code> — all combinations auto-derive from A, B, C. Update <code>"updatedDate"</code> and <code>"updatedLabel"</code> to today's date, then push to GitHub. The site rebuilds automatically.</p>
          <div className="guess-update-guide__code">
{`{
  "updatedDate": "2026-05-20",
  "updatedLabel": "May 20, 2026",
  "boards": { "A": "5", "B": "3", "C": "8" },
  ...
}`}
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>Tip: You can also add this as a manual input in the GitHub Actions workflow so you can update A, B, C boards from your phone without opening a code editor.</p>
        </section>

        {/* Disclaimer */}
        <section className="content-card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
          <h2>⚠️ Disclaimer</h2>
          <p>Guessing numbers are provided for entertainment purposes only. Lottery is a game of chance and no number can be predicted or guaranteed. This website does not encourage lottery participation. Please play responsibly and within your financial means.</p>
        </section>

      </div>
    </main>
  );
}
