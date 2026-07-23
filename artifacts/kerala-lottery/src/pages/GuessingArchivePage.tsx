import { Link } from 'wouter';
import { getGuessingHistory } from '../data';

export default function GuessingArchivePage() {
  const history = getGuessingHistory(60);

  return (
    <main className="container">
      <section className="hero" style={{ paddingBottom: 8 }}>
        <h1>Kerala Lottery Guessing Numbers — Past Days</h1>
        <p>
          Every day's A/B/C board and Hot Pick, newest first — see how the guessing numbers have changed
          day to day. கடந்த நாட்களின் கணிப்பு எண்கள்.
        </p>
      </section>

      <div className="content-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>Hot Pick</th>
                <th>Lucky Combo</th>
              </tr>
            </thead>
            <tbody>
              {history.map((day) => {
                const hotPick = day.numbers.find((n) => n.label === 'Hot Pick')?.value;
                const luckyCombo = day.numbers.find((n) => n.label === 'Lucky Combo')?.value;
                return (
                  <tr key={day.date}>
                    <td style={{ whiteSpace: 'nowrap' }}>{day.displayLabel}</td>
                    <td><strong>{day.boards.A}</strong></td>
                    <td><strong>{day.boards.B}</strong></td>
                    <td><strong>{day.boards.C}</strong></td>
                    <td style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 700 }}>{hotPick ?? '—'}</td>
                    <td style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 700 }}>{luckyCombo ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {history.length === 0 && <p style={{ opacity: 0.7 }}>No past guessing numbers yet — check back tomorrow.</p>}

        <p style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
          Showing {history.length} {history.length === 1 ? 'day' : 'days'}. <Link href="/guessing-numbers">← Back to today's guessing numbers</Link>
        </p>
      </div>

      <section className="content-card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb', marginTop: 20 }}>
        <h2>⚠️ Disclaimer</h2>
        <p>Guessing numbers are for entertainment only. Lottery is a game of chance — no number can be predicted or guaranteed. Please play responsibly.</p>
      </section>
    </main>
  );
}
