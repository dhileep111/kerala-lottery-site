import { getLottery, getNumberMeta, getTicketText } from '../data';
import type { Result } from '../types';

const TIER_CONFIG: Record<string, { emoji: string; highlight: boolean; chipStyle: string }> = {
  '1st Prize':         { emoji: '🥇', highlight: true,  chipStyle: 'chip chip--gold' },
  'Consolation Prize': { emoji: '🎁', highlight: false, chipStyle: 'chip chip--consolation' },
  '2nd Prize':         { emoji: '🥈', highlight: false, chipStyle: 'chip chip--silver' },
  '3rd Prize':         { emoji: '🥉', highlight: false, chipStyle: 'chip chip--bronze' },
  '4th Prize':         { emoji: '4️⃣', highlight: false, chipStyle: 'chip' },
  '5th Prize':         { emoji: '5️⃣', highlight: false, chipStyle: 'chip' },
  '6th Prize':         { emoji: '6️⃣', highlight: false, chipStyle: 'chip' },
  '7th Prize':         { emoji: '7️⃣', highlight: false, chipStyle: 'chip' },
  '8th Prize':         { emoji: '8️⃣', highlight: false, chipStyle: 'chip' },
  '9th Prize':         { emoji: '9️⃣', highlight: false, chipStyle: 'chip' },
  '10th Prize':        { emoji: '🔟', highlight: false, chipStyle: 'chip' },
};

// For bumper: 1st–4th prizes are full-ticket winners (not 4-digit)
// For regular: only 1st–3rd are full tickets; 4th+ are 4-digit numbers
const FULL_TICKET_TIERS_BUMPER  = new Set(['1st Prize', '2nd Prize', '3rd Prize', '4th Prize', 'Consolation Prize']);
const FULL_TICKET_TIERS_REGULAR = new Set(['1st Prize', '2nd Prize', '3rd Prize', 'Consolation Prize']);

export function ResultTable({ result, query = '' }: { result: Result; query?: string }) {
  const normalizedQuery = query.trim().toLowerCase();
  const lottery = getLottery(result.lotterySlug);
  const isBumper = lottery?.isBumper ?? false;
  const claimDays = lottery?.claimDays ?? 30;
  const fullTicketTiers = isBumper ? FULL_TICKET_TIERS_BUMPER : FULL_TICKET_TIERS_REGULAR;

  const filledCount = result.prizes.filter(p => p.numbers.length > 0).length;
  const totalCount  = result.prizes.length;
  const isFullResult = filledCount >= totalCount - 1;

  return (
    <div className="result-table-card card">
      <div className="rt-header">
        <div className="rt-title">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Full Prize Table
        </div>
        <div className="rt-status" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isBumper && (
            <span style={{ fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#78350f', padding: '2px 8px', borderRadius: 20 }}>
              🎪 Bumper Draw
            </span>
          )}
          {isFullResult
            ? <span className="rt-badge rt-badge--complete">✅ Complete Result</span>
            : <span className="rt-badge rt-badge--partial">{filledCount}/{totalCount} tiers updated</span>
          }
        </div>
      </div>

      <div className="table-wrap table-wrap--desktop">
        <table>
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Prize Tier</th>
              <th>Winning Numbers</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {result.prizes.map((prize) => {
              const cfg = TIER_CONFIG[prize.tier] ?? { emoji: '•', highlight: false, chipStyle: 'chip' };
              const isPending = prize.numbers.length === 0;
              const isFullTicketTier = fullTicketTiers.has(prize.tier);

              return (
                <tr key={prize.tier} className={cfg.highlight ? 'tr--highlight' : ''}>
                  <td data-label="Prize Tier" className="td-tier">
                    <span className="tier-emoji">{cfg.emoji}</span>
                    <span className="tier-name">{prize.tier}</span>
                  </td>
                  <td data-label="Winning Numbers" className="td-numbers">
                    {isPending ? (
                      <span className="chip chip--pending">
                        <span className="pending-dot" />
                        Pending
                      </span>
                    ) : (
                      <div className={`chips ${isFullTicketTier ? 'chips--full-ticket' : ''}`}>
                        {prize.numbers.map((number, idx) => {
                          const ticket   = getTicketText(number);
                          const meta     = getNumberMeta(number);
                          const district = typeof number === 'object' && number !== null && 'district' in number
                            ? (number as any).district : null;
                          const match = normalizedQuery && ticket.toLowerCase().includes(normalizedQuery);

                          return (
                            <span
                              key={`${ticket}-${idx}`}
                              className={`${cfg.chipStyle} ${match ? 'chip--match' : ''}`}
                              style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
                            >
                              {ticket}
                              {meta && <span className="chip-meta"> ({meta})</span>}
                              {district && (
                                <span style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                  {district}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td data-label="Amount" className="td-amount">
                    {prize.amount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isFullResult && (
        <div className="rt-footer">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {isBumper
            ? 'Bumper result published after 4:30 PM official PDF. All prize tiers will be updated.'
            : 'Full result published after 4:30 PM official PDF. Refresh this page for updates.'
          }
        </div>
      )}

      {isBumper && (
        <div style={{ padding: '10px 18px', background: '#fffbeb', borderTop: '1px solid #fde68a', fontSize: 12, color: '#78350f', fontWeight: 600, borderRadius: '0 0 14px 14px' }}>
          🎪 Bumper Draw — Prize claim deadline is <strong>{claimDays} days</strong> from draw date. Prizes above ₹1,00,000 must be claimed at the Directorate of Kerala Lotteries, Thiruvananthapuram.
        </div>
      )}

      <style>{`
        .rt-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px 12px; border-bottom: 1px solid var(--border); gap: 10px; flex-wrap: wrap; }
        .rt-title { display: flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 700; color: var(--fg); }
        .rt-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
        .rt-badge--complete { background: #dcfce7; color: #166534; }
        .rt-badge--partial  { background: #fef9c3; color: #854d0e; }
        .tr--highlight { background: linear-gradient(90deg, #fffbeb 0%, transparent 100%); }
        .tr--highlight td { border-bottom-color: #fde68a; }
        .td-tier { display: flex !important; align-items: center; gap: 8px; font-weight: 600; }
        .tier-emoji { font-size: 16px; flex-shrink: 0; }
        .tier-name  { font-size: 13px; }
        .td-numbers { max-width: 560px; }
        .td-amount  { text-align: right; font-weight: 800; color: var(--primary); white-space: nowrap; }
        .chips--full-ticket { flex-direction: column; align-items: flex-start; gap: 6px; }
        .chip--gold { background: linear-gradient(135deg, #fef3c7, #fde68a); border-color: #f59e0b; color: #78350f; font-size: 15px; padding: 6px 14px; font-weight: 900; letter-spacing: .06em; }
        .chip--silver { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border-color: #94a3b8; color: #1e293b; font-weight: 800; }
        .chip--bronze { background: linear-gradient(135deg, #fff7ed, #fed7aa); border-color: #f97316; color: #7c2d12; font-weight: 700; }
        .chip--consolation { background: #f0fdf4; border-color: #86efac; color: #166534; }
        .chip--pending { display: inline-flex; align-items: center; gap: 6px; background: #fff7ed; color: #9a3412; border-color: #fed7aa; }
        .pending-dot { width: 7px; height: 7px; border-radius: 50%; background: #f97316; animation: blink 1.2s ease-in-out infinite; flex-shrink: 0; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .chip-meta { font-weight: 400; font-size: 11px; opacity: .7; font-family: inherit; }
        .rt-footer { display: flex; align-items: center; gap: 6px; padding: 10px 18px; font-size: 12px; color: var(--muted-fg, #6b7280); background: var(--muted, #f9fafb); border-top: 1px solid var(--border); }
        @media (max-width: 640px) {
          .result-table-card { border: 0; background: transparent; box-shadow: none; }
          .table-wrap { overflow: visible; }
          table, thead, tbody, tr, th, td { display: block; width: 100%; }
          thead { display: none; }
          tbody { display: grid; gap: 12px; }
          tr { background: white; border: 1px solid var(--border); border-radius: 14px; padding: 12px 14px; box-shadow: var(--shadow); }
          .tr--highlight { border-color: #f59e0b; background: #fffbeb; }
          td { border-bottom: 1px solid #edf2f7; padding: 8px 0; text-align: left !important; }
          td:last-child { border-bottom: none; }
          td::before { content: attr(data-label); display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 5px; }
          .td-tier { flex-direction: row; }
          .chips { justify-content: flex-start; }
          .chip--gold { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
