import { useState } from 'react';
import type { Lottery, Result } from '../types';
import { getTicketText } from '../data';

interface Props {
  lottery: Lottery;
  result: Result;
}

// Mirrors the full-ticket tier logic from ResultTable
const FULL_TICKET_TIERS_BUMPER  = new Set(['1st Prize', '2nd Prize', '3rd Prize', '4th Prize', 'Consolation Prize']);
const FULL_TICKET_TIERS_REGULAR = new Set(['1st Prize', '2nd Prize', '3rd Prize', 'Consolation Prize']);

function buildPrintHtml(lottery: Lottery, result: Result): string {
  const isBumper = lottery.isBumper ?? false;
  const fullTiers = isBumper ? FULL_TICKET_TIERS_BUMPER : FULL_TICKET_TIERS_REGULAR;

  const rows = result.prizes.map((prize) => {
    if (!prize.numbers.length) {
      return `<tr><td class="tier">${prize.tier}</td><td class="nums"><em style="color:#888">Pending</em></td><td class="amt">${prize.amount ?? ''}</td></tr>`;
    }
    const isFullTier = fullTiers.has(prize.tier);
    if (isFullTier) {
      const cells = prize.numbers.map((n) => {
        const ticket = getTicketText(n);
        const dist = typeof n === 'object' && n !== null && 'district' in n
          ? (n as { district?: string }).district : null;
        return `<span class="ticket">${ticket}${dist ? ` <span class="dist">(${dist})</span>` : ''}</span>`;
      }).join('');
      return `<tr><td class="tier">${prize.tier}</td><td class="nums">${cells}</td><td class="amt">${prize.amount ?? ''}</td></tr>`;
    }
    // 4-digit numbers — flow them as a wrapped list
    const nums = prize.numbers.map((n) => `<span class="num4">${getTicketText(n)}</span>`).join('');
    return `<tr><td class="tier">${prize.tier}</td><td class="nums nums4">${nums}</td><td class="amt">${prize.amount ?? ''}</td></tr>`;
  }).join('');

  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${lottery.name} ${result.drawCode} Result — ${result.displayDate}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111; background: #fff; padding: 22mm 18mm; }
  .header { text-align: center; border-bottom: 2px solid #0c3b2e; padding-bottom: 10px; margin-bottom: 12px; }
  .gov-line { font-size: 9pt; color: #555; margin-bottom: 4px; }
  .site { font-size: 8pt; color: #888; }
  h1 { font-size: 15pt; font-weight: 800; color: #0c3b2e; margin: 6px 0 3px; }
  .meta { font-size: 10pt; color: #333; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { background: #0c3b2e; color: #fff; padding: 6px 10px; font-size: 10pt; text-align: left; }
  td { padding: 5px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; font-size: 10pt; }
  tr:nth-child(even) td { background: #f9fafb; }
  tr:first-child td { font-weight: 700; font-size: 11pt; background: #fffbeb; border-bottom: 2px solid #fde68a; }
  .tier { white-space: nowrap; font-weight: 600; width: 23%; }
  .amt  { white-space: nowrap; text-align: right; font-weight: 700; color: #0c3b2e; width: 18%; }
  .ticket { display: block; font-weight: 700; letter-spacing: .04em; }
  .dist { font-weight: 400; font-size: 9pt; color: #555; }
  .nums4 { display: flex; flex-wrap: wrap; gap: 4px 10px; }
  .num4 { font-family: monospace; font-size: 10pt; }
  .footer { margin-top: 16px; font-size: 8pt; color: #777; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  .disclaimer { margin-top: 8px; font-size: 8pt; color: #999; font-style: italic; }
  @media print {
    body { padding: 10mm 12mm; }
    @page { margin: 10mm; }
  }
</style>
</head>
<body>
<div class="header">
  <div class="gov-line">KERALA STATE LOTTERIES — RESULT</div>
  <h1>${lottery.name} Lottery ${result.drawCode}</h1>
  <div class="meta">Draw held on: <strong>${result.displayDate}</strong> at <strong>${lottery.drawTime} IST</strong></div>
  <div class="site">keralaticketresults.in — Independent results aggregator</div>
</div>

<table>
  <thead>
    <tr><th>Prize Tier</th><th>Winning Number(s)</th><th style="text-align:right">Amount</th></tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<div class="footer">
  Generated: ${now} IST &nbsp;|&nbsp; Draw code: ${result.drawCode} &nbsp;|&nbsp; Status: ${result.status}
  ${result.sourceUrl ? `&nbsp;|&nbsp; Source: <a href="${result.sourceUrl}">${result.sourceName || result.sourceUrl}</a>` : ''}
</div>
<div class="disclaimer">
  This document is for informational purposes only. Always verify results with the official Kerala Government Gazette
  (statelottery.kerala.gov.in) before making any prize claim. Prize claim deadline: ${lottery.claimDays ?? 30} days from draw date.
</div>

<script>window.onload = function(){ window.print(); };<\/script>
</body>
</html>`;
}

export function DownloadPdfButton({ lottery, result }: Props) {
  const [loading, setLoading] = useState(false);

  if (result.status === 'pending') return null;

  function handleClick() {
    setLoading(true);
    try {
      const html = buildPrintHtml(lottery, result);
      const win = window.open('', '_blank');
      if (!win) {
        // Fallback: if popup blocked, try direct blob download hint
        alert('Allow pop-ups for this site to download the PDF, then try again.');
        setLoading(false);
        return;
      }
      win.document.write(html);
      win.document.close();
      // print is triggered inside the new window's onload
    } catch {
      // silently degrade
    }
    setTimeout(() => setLoading(false), 1200);
  }

  return (
    <div style={{ padding: '14px 20px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: loading ? '#9ca3af' : '#0c3b2e',
          color: '#fff', padding: '10px 24px', borderRadius: 12,
          fontWeight: 700, fontSize: 14, border: 'none', cursor: loading ? 'default' : 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {loading ? '⏳ Preparing…' : '⬇️ Download PDF'}
      </button>
    </div>
  );
}
