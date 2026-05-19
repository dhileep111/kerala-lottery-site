import { useState, useCallback } from 'react';
import { results, lotteries, site } from '../data';
import type { Result } from '../types';

const FULL_TICKET_RE = /^([A-Z]{2})\s*(\d{6})$/i;
const PARTIAL_4_RE   = /^\d{4}$/;
const PARTIAL_6_RE   = /^\d{6}$/;

interface MatchResult {
  tier: string; amount: string; number: string;
  isExact: boolean; isPartial: boolean;
  drawCode: string; drawDate: string; lottery: string; slug: string;
}

function normalise(s: string) { return s.toUpperCase().replace(/\s+/g, ' ').trim(); }

function searchAllResults(raw: string): MatchResult[] {
  const query = normalise(raw);
  if (query.length < 4) return [];
  const fullMatch = query.match(FULL_TICKET_RE);
  const is4digit  = PARTIAL_4_RE.test(query);
  const is6digit  = PARTIAL_6_RE.test(query);
  const found: MatchResult[] = [];

  for (const result of results) {
    const lottery = lotteries.find(l => l.slug === result.lotterySlug);
    const lotteryName = lottery?.name ?? result.lotterySlug;
    for (const prize of result.prizes) {
      for (const num of prize.numbers) {
        const ticket = typeof num === 'string' ? num : num.ticket;
        const ticketNorm = normalise(ticket);
        if (fullMatch) {
          const [, series, digits] = fullMatch;
          const [tSeries, tDigits] = ticketNorm.split(' ');
          if (tSeries === series.toUpperCase() && tDigits === digits)
            found.push({ tier: prize.tier, amount: prize.amount, number: ticketNorm, isExact: true, isPartial: false, drawCode: result.drawCode, drawDate: result.displayDate, lottery: lotteryName, slug: result.lotterySlug });
          continue;
        }
        if (is4digit) {
          const digits = ticketNorm.replace(/[A-Z\s]/g, '');
          if (digits.slice(-4) === query)
            found.push({ tier: prize.tier, amount: prize.amount, number: ticketNorm, isExact: false, isPartial: true, drawCode: result.drawCode, drawDate: result.displayDate, lottery: lotteryName, slug: result.lotterySlug });
          continue;
        }
        if (is6digit) {
          const digits = ticketNorm.replace(/[A-Z\s]/g, '');
          if (digits === query)
            found.push({ tier: prize.tier, amount: prize.amount, number: ticketNorm, isExact: false, isPartial: true, drawCode: result.drawCode, drawDate: result.displayDate, lottery: lotteryName, slug: result.lotterySlug });
          continue;
        }
        if (ticketNorm.includes(query))
          found.push({ tier: prize.tier, amount: prize.amount, number: ticketNorm, isExact: false, isPartial: true, drawCode: result.drawCode, drawDate: result.displayDate, lottery: lotteryName, slug: result.lotterySlug });
      }
    }
  }
  const seen = new Set<string>();
  return found
    .filter(m => { const k = m.number + m.drawCode; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => (b.isExact ? 1 : 0) - (a.isExact ? 1 : 0) || b.drawDate.localeCompare(a.drawDate));
}

const TIER_STYLE: Record<string, { bg: string; border: string; icon: string; textColor: string }> = {
  '1st Prize':         { bg: '#fffbeb', border: '#f59e0b', icon: '🥇', textColor: '#78350f' },
  'Consolation Prize': { bg: '#f0fdf4', border: '#86efac', icon: '🎁', textColor: '#166534' },
  '2nd Prize':         { bg: '#f8fafc', border: '#94a3b8', icon: '🥈', textColor: '#1e293b' },
  '3rd Prize':         { bg: '#fff7ed', border: '#fdba74', icon: '🥉', textColor: '#7c2d12' },
  '4th Prize':         { bg: '#eff6ff', border: '#93c5fd', icon: '4️⃣', textColor: '#1e3a8a' },
  '5th Prize':         { bg: '#f5f3ff', border: '#c4b5fd', icon: '5️⃣', textColor: '#3730a3' },
  '6th Prize':         { bg: '#fdf4ff', border: '#e879f9', icon: '6️⃣', textColor: '#701a75' },
  '7th Prize':         { bg: '#fff1f2', border: '#fda4af', icon: '7️⃣', textColor: '#881337' },
  '8th Prize':         { bg: '#f0fdfa', border: '#5eead4', icon: '8️⃣', textColor: '#134e4a' },
  '9th Prize':         { bg: '#fafaf9', border: '#a8a29e', icon: '9️⃣', textColor: '#44403c' },
};
function getTierStyle(tier: string) {
  return TIER_STYLE[tier] ?? { bg: '#f9fafb', border: '#d1d5db', icon: '🎫', textColor: '#374151' };
}

// ── AI Explanation component ──────────────────────────────────────
function AIExplanation({ matches, query }: { matches: MatchResult[]; query: string }) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const getExplanation = useCallback(async () => {
    setLoading(true);
    setExplanation('');
    setDone(false);

    const hasWin  = matches.some(m => m.isExact);
    const is1st   = matches.some(m => m.isExact && m.tier === '1st Prize');
    const bestMatch = matches.find(m => m.isExact) ?? matches[0];
    const lotteryName = bestMatch?.lottery ?? '';
    const drawCode    = bestMatch?.drawCode ?? '';
    const drawDate    = bestMatch?.drawDate ?? '';
    const tier        = bestMatch?.tier ?? '';
    const amount      = bestMatch?.amount ?? '';
    const partialCount = matches.filter(m => m.isPartial).length;

    const prompt = hasWin
      ? `You are a helpful Kerala lottery assistant. A user checked their ticket and won! 
Ticket: ${query}
Lottery: ${lotteryName} ${drawCode} (${drawDate})
Prize: ${tier} — ${amount}
${is1st ? 'This is the JACKPOT — 1st Prize winner!' : ''}

In 3–4 short sentences:
1. Congratulate them warmly
2. Tell them exactly what prize they won and the amount
3. Give clear next steps to claim the prize (mention: sign the ticket now, verify at statelottery.kerala.gov.in, claim within 30 days, bring Aadhaar + PAN)
${lotteryName && lotteryName.toLowerCase().includes('karunya') ? '4. Mention this is a Karunya draw and prizes above ₹1 lakh must be claimed at Thiruvananthapuram' : ''}

Keep it warm, clear, and practical. End with a congratulations.`
      : matches.length > 0
      ? `You are a helpful Kerala lottery assistant. A user searched with partial ticket digits.
Query entered: ${query}
Found ${partialCount} partial matches across Kerala lottery draws.
Matches: ${matches.slice(0, 3).map(m => `${m.number} (${m.tier} in ${m.lottery} ${m.drawCode})`).join(', ')}

In 2–3 sentences:
1. Explain they need to check the full ticket number with series letters (2 letters + 6 digits like "RR 281074")
2. Tell them which draws had numbers ending in their digits
3. Advise to verify officially at statelottery.kerala.gov.in

Keep it helpful and practical.`
      : `You are a helpful Kerala lottery assistant. A user checked ticket "${query}" and no match was found in our database.

In 2–3 sentences:
1. Gently confirm no match was found in our current data
2. Explain we might not have all draws published yet and their draw may not be in our database
3. Tell them to verify directly at statelottery.kerala.gov.in or check the Kerala Government Gazette

Keep it empathetic and helpful.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text ?? '';
      setExplanation(text);
    } catch {
      setExplanation('Unable to load AI explanation. Please check the result details above and verify at statelottery.kerala.gov.in.');
    } finally {
      setLoading(false);
      setDone(true);
    }
  }, [matches, query]);

  const hasWin = matches.some(m => m.isExact);

  return (
    <div className="ai-explanation-card">
      <div className="ai-explanation-card__header">
        <div className="ai-explanation-card__icon">✨</div>
        <div>
          <div className="ai-explanation-card__title">AI Assistant</div>
          <div className="ai-explanation-card__sub">
            {hasWin ? 'What to do next — claim guide' : 'What this means for you'}
          </div>
        </div>
        {!done && !loading && (
          <button className="ai-explanation-card__trigger" onClick={getExplanation}>
            Ask AI
          </button>
        )}
      </div>

      {loading && (
        <div className="ai-explanation-card__loading">
          <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
          <span style={{ marginLeft: 10, fontSize: 13, color: '#6b7280' }}>Analysing your result…</span>
        </div>
      )}

      {done && explanation && (
        <div className="ai-explanation-card__text">{explanation}</div>
      )}

      {done && (
        <button
          className="ai-explanation-card__retry"
          onClick={() => { setDone(false); setExplanation(''); }}
        >
          Ask again
        </button>
      )}
    </div>
  );
}

// ── Match card ────────────────────────────────────────────
function MatchCard({ match }: { match: MatchResult }) {
  const style = getTierStyle(match.tier);
  const is1st = match.tier === '1st Prize';
  return (
    <div style={{
      border: `2px solid ${style.border}`, background: style.bg,
      borderRadius: 16, padding: '20px 22px', marginBottom: 14,
      position: 'relative',
      boxShadow: is1st ? '0 4px 24px rgba(245,158,11,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {is1st && (
        <div style={{ position: 'absolute', top: -1, right: 16, background: '#f59e0b', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 12px', borderRadius: '0 0 10px 10px', letterSpacing: '0.05em' }}>JACKPOT</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{style.icon}
            <span style={{ fontSize: 17, fontWeight: 700, color: style.textColor, marginLeft: 8 }}>{match.tier}</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: style.textColor, letterSpacing: '0.08em' }}>{match.number}</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{match.lottery} • {match.drawCode} • {match.drawDate}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 2 }}>Prize Amount</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{match.amount}</div>
          {!match.isExact && (
            <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>
              ⚠️ Partial match — verify series
            </div>
          )}
          {match.isExact && (
            <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>
              ✅ Exact match
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckTicketPage() {
  const [input,   setInput]   = useState('');
  const [query,   setQuery]   = useState('');
  const [checked, setChecked] = useState(false);

  const matches  = query ? searchAllResults(query) : [];
  const hasExact = matches.some(m => m.isExact);

  const handleCheck = useCallback(() => {
    setQuery(normalise(input));
    setChecked(true);
  }, [input]);

  const handleClear = () => { setInput(''); setQuery(''); setChecked(false); };

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="hero">
          <h1>Kerala Lottery Ticket Checker</h1>
          <p style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>
            கேரளா லாட்டரி சீட்டு எண் சரிபார்க்கவும் — Check if your ticket number won a prize
          </p>
        </div>

        {/* How to enter guide */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>📋 How to enter your ticket number</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { label: 'Full ticket (best)',  example: 'RR 281074', desc: 'Series + 6-digit number — exact match' },
              { label: '6-digit number',      example: '281074',    desc: 'Matches number across all series' },
              { label: 'Last 4 digits',       example: '1074',      desc: 'Quick check — may show multiple matches' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <code style={{ background: '#1e293b', color: '#a6e3a1', padding: '3px 10px', borderRadius: 6, fontSize: 14, fontFamily: 'monospace', letterSpacing: '0.06em', flexShrink: 0 }}>{r.example}</code>
                <span style={{ fontSize: 13, color: '#6b7280' }}><strong style={{ color: '#374151' }}>{r.label}</strong> — {r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: 16, padding: '20px 22px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            Enter your Kerala lottery ticket number
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              style={{ flex: 1, minWidth: 200, border: '2px solid #d1d5db', borderRadius: 10, padding: '12px 16px', fontSize: 18, fontFamily: 'monospace', letterSpacing: '0.08em', outline: 'none', textTransform: 'uppercase', transition: 'border-color 0.2s' }}
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && input.trim().length >= 4 && handleCheck()}
              placeholder="e.g. RR 281074"
              maxLength={10}
              autoComplete="off"
              spellCheck={false}
              onFocus={e => (e.target.style.borderColor = '#059669')}
              onBlur={e  => (e.target.style.borderColor = '#d1d5db')}
            />
            <button
              onClick={handleCheck}
              disabled={input.trim().length < 4}
              style={{ background: input.trim().length >= 4 ? '#059669' : '#d1d5db', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: input.trim().length >= 4 ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
            >
              Check Ticket
            </button>
            {checked && (
              <button onClick={handleClear} style={{ background: 'transparent', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: 10, padding: '12px 16px', fontSize: 14, cursor: 'pointer' }}>
                Clear
              </button>
            )}
          </div>
          {input.length > 0 && input.length < 4 && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Enter at least 4 characters to search</div>
          )}
        </div>

        {/* Results */}
        {checked && query && (
          <div>
            {/* Result banner */}
            <div style={{ borderRadius: 14, padding: '18px 22px', marginBottom: 20, background: matches.length === 0 ? '#fef2f2' : hasExact ? '#f0fdf4' : '#fffbeb', border: `2px solid ${matches.length === 0 ? '#fca5a5' : hasExact ? '#86efac' : '#fde68a'}` }}>
              {matches.length === 0 ? (
                <>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>😔</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#dc2626' }}>No match found for <code style={{ fontFamily: 'monospace' }}>{query}</code></div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Not in our current data. Verify at <strong>statelottery.kerala.gov.in</strong>.</div>
                </>
              ) : hasExact ? (
                <>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#059669' }}>Congratulations! <code style={{ fontFamily: 'monospace' }}>{query}</code> is a winner!</div>
                  <div style={{ fontSize: 13, color: '#065f46', marginTop: 6 }}>Verify officially at <strong>statelottery.kerala.gov.in</strong> before claiming. Claim within 30 days.</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🔍</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#92400e' }}>{matches.length} partial match{matches.length > 1 ? 'es' : ''} for <code style={{ fontFamily: 'monospace' }}>{query}</code></div>
                  <div style={{ fontSize: 13, color: '#78350f', marginTop: 6 }}>Enter full ticket with series letters (e.g. <strong>RR 281074</strong>) to confirm exactly.</div>
                </>
              )}
            </div>

            {/* AI Explanation — shown for any result */}
            <AIExplanation matches={matches} query={query} />

            {/* Match cards */}
            {matches.map((m, i) => <MatchCard key={i} match={m} />)}

            {matches.length > 0 && (
              <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '12px 0', borderTop: '1px solid #f3f4f6', marginTop: 8 }}>
                Searched {results.length} draws across {lotteries.length} lotteries
              </div>
            )}
          </div>
        )}

        {/* Tamil guide */}
        <div style={{ background: '#fce4ec', border: '1px solid #f48fb1', borderRadius: 12, padding: '14px 18px', marginTop: 20, fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: 14, lineHeight: 1.9, color: '#880e4f' }}>
          <strong>சீட்டு சரிபார்க்கும் முறை (Tamil Guide):</strong><br />
          உங்கள் சீட்டு எண்ணை இந்த வடிவத்தில் உள்ளிடுங்கள்: <strong>RR 281074</strong><br />
          கடைசி 4 இலக்கங்களை மட்டும் தட்டினால் போதும்: <strong>1074</strong><br />
          பரிசு கண்டுபிடிக்கப்பட்டால், அதிகாரப்பூர்வமாக <strong>statelottery.kerala.gov.in</strong> இல் சரிபார்க்கவும்.
        </div>

        <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginTop: 20, fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          <strong>⚠️ Important:</strong> Always verify your winning ticket at <strong>statelottery.kerala.gov.in</strong> before claiming. Prizes must be claimed within 30 days of draw date.
        </div>
      </div>
    </main>
  );
}
