import type { Result } from '@/app/types';

export function ResultTable({ result, query = '' }: { result: Result; query?: string }) {
  const normalizedQuery = query.trim().toLowerCase();

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Prize Tier</th><th>Winning Numbers</th><th>Prize Amount</th></tr>
          </thead>
          <tbody>
            {result.prizes.map((prize) => (
              <tr key={prize.tier}>
                <td>{prize.tier}</td>
                <td>
                  <div className="chips">
                    {prize.numbers.length ? prize.numbers.map((number) => {
                      const match = normalizedQuery && number.toLowerCase().includes(normalizedQuery);
                      return <span key={number} className={`chip ${match ? 'chip--match' : ''}`}>{number}</span>;
                    }) : <span className="chip">Pending</span>}
                  </div>
                </td>
                <td>{prize.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
