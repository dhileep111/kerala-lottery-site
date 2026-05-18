import { useMemo, useState } from 'react';
import { getTicketText } from '../data';
import { ResultTable } from './ResultTable';
import type { Result } from '../types';

export function TicketSearch({ lottery, drawCode, result }: { lottery: string; drawCode: string; result: Result }) {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return result.prizes.flatMap((prize) => prize.numbers.map((number) => ({ prize, number: getTicketText(number) }))).filter((item) => item.number.toLowerCase().includes(q));
  }, [query, result]);

  return (
    <section className="section">
      <div className="content-card">
        <h2>{lottery} {drawCode}</h2>
        <form className="form" onSubmit={(event) => event.preventDefault()}>
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Enter ticket number or series" aria-label="Ticket number" />
          <button className="button" type="submit">Check</button>
        </form>
        {query && <p style={{ marginTop: 12 }}>{matches.length ? `${matches.length} possible match(es) found. Verify officially before claiming.` : 'No match found in the currently published data.'}</p>}
      </div>
      <ResultTable result={result} query={query} />
    </section>
  );
}
