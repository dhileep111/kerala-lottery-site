import lotteriesJson from './data/lotteries.json';
import resultsJson from './data/results.json';
import guessingJson from './data/guessing-numbers.json';
import type { Lottery, Result, WinningNumber } from './types';
import { cleanSlug } from './lib/slugs';

export const site = {
  name: 'Kerala Ticket Results',
  url: 'https://keralaticketresults.in',
  description: 'Kerala Lottery result updates with verified sources, daily schedule, archive-ready data, and responsible lottery guidance.'
};

export const lotteries = lotteriesJson as Lottery[];
export const results = resultsJson as Result[];
export type GuessingDay = {
  date: string;
  displayLabel: string;
  boards: { A: string; B: string; C: string };
  numbers: Array<{ digits: number; label: string; value: string; type: string; hot?: boolean }>;
};

export const guessingData = guessingJson as { history: GuessingDay[] };

export function getLatestGuessing(): GuessingDay {
  return guessingData.history[0];
}

export function getGuessingHistory(limit = 30): GuessingDay[] {
  return guessingData.history.slice(0, limit);
}

export function getLottery(slug: string) {
  return lotteries.find((lottery) => lottery.slug === slug);
}

export function getTicketText(number: WinningNumber) {
  if (typeof number === 'string') {
    if (number.startsWith('{')) {
      // Try full JSON parse first: {"ticket":"RE 885786","district":"Pattambi"}
      try {
        const parsed = JSON.parse(number);
        if (parsed.ticket) return String(parsed.ticket);
      } catch { /* malformed */ }
      // Truncated string like '{ticket:RE' — extract any XX NNNNNN pattern
      const m = number.match(/([A-Z]{2})\s*(\d{6})/);
      if (m) return `${m[1]} ${m[2]}`;
      // Absolute fallback: hide broken data, show placeholder
      return 'Result updating…';
    }
    return number;
  }
  return number.ticket;
}

export function getNumberMeta(number: WinningNumber) {
  if (typeof number === 'string') return '';
  return [number.district, number.agency].filter(Boolean).join(' • ');
}

export function getLatestResult(slug?: string) {
  const filtered = slug ? results.filter((result) => result.lotterySlug === slug) : results;
  return [...filtered].sort((a, b) => b.drawDate.localeCompare(a.drawDate) || b.lastUpdated.localeCompare(a.lastUpdated))[0];
}

export function getResultsForLottery(slug: string) {
  return results
    .filter((result) => result.lotterySlug === slug)
    .sort((a, b) => b.drawDate.localeCompare(a.drawDate) || b.lastUpdated.localeCompare(a.lastUpdated));
}

export function getResultByDraw(slug: string, drawCode: string) {
  const normalized = cleanSlug(drawCode);
  return results.find((result) => result.lotterySlug === slug && cleanSlug(result.drawCode) === normalized);
}

export function getResultWithLottery(slug?: string) {
  const result = getLatestResult(slug);
  if (!result) return null;
  const lottery = getLottery(result.lotterySlug);
  if (!lottery) return null;
  return { result, lottery };
}

export function getRecentResults(limit = 6) {
  return results
    .map((result) => {
      const lottery = getLottery(result.lotterySlug);
      return lottery ? { result, lottery } : null;
    })
    .filter((item): item is { result: Result; lottery: Lottery } => Boolean(item))
    .sort((a, b) => b.result.drawDate.localeCompare(a.result.drawDate) || b.result.lastUpdated.localeCompare(a.result.lastUpdated))
    .slice(0, limit);
}

export function getTodayLottery(date = new Date()) {
  const day = date.getDay();
  return lotteries.find((lottery) => lottery.drawDayIndex === day) ?? lotteries[0];
}

export function getStatusLabel(status: Result['status']) {
  if (status === 'verified') return 'Verified';
  if (status === 'live') return 'Live';
  return 'Pending';
}

export function getFirstPrizeNumber(result: Result) {
  return getTicketText(result.prizes.find((prize) => prize.tier.toLowerCase().includes('1st'))?.numbers[0] ?? 'PENDING');
}

export function drawPath(result: Result) {
  return `/results/${cleanSlug(result.lotterySlug)}/${cleanSlug(result.drawCode)}`;
}

export function absolute(path = '') {
  return `${site.url}${path}`;
}

export function getTomorrowLottery(date = new Date()) {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = tomorrow.getDay();
  return lotteries.find((l) => l.drawDayIndex === day && !l.isBumper) ?? lotteries[0];
}

export function getHotColdNumbers(slug: string, topN = 10): { hot: string[]; cold: string[] } {
  const slugResults = results
    .filter(r => r.lotterySlug === slug && r.status !== 'pending')
    .slice(0, 30);
  const freq: Record<string, number> = {};
  for (const result of slugResults) {
    for (const prize of result.prizes) {
      if (['4th Prize','5th Prize','6th Prize','7th Prize','8th Prize','9th Prize'].includes(prize.tier)) {
        for (const num of prize.numbers) {
          const n = typeof num === 'string' ? num : (num as any).ticket;
          if (n && /^\d{4}$/.test(n)) freq[n] = (freq[n] || 0) + 1;
        }
      }
    }
  }
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return {
    hot:  sorted.slice(0, topN).map(([n]) => n),
    cold: sorted.slice(-topN).map(([n]) => n),
  };
}

export type SeriesStat = { series: string; wins: number; lastWonDate: string; lastWonDisplayDate: string; lastWonDrawCode: string };

// How many times each 2-letter series has won 1st Prize, across every VERIFIED
// draw of every lottery. Series letters aren't unique per lottery (e.g. "KA" can
// occur under different lotteries), but the series prefix is what players
// actually track, so this intentionally aggregates across all lotteries as a
// single site-wide table, same as the page it's shown on.
export function getSeriesFrequency(): SeriesStat[] {
  const map = new Map<string, SeriesStat>();
  for (const r of results) {
    if (r.status !== 'verified') continue;
    const first = r.prizes.find((p) => p.tier === '1st Prize');
    const num = first?.numbers?.[0];
    if (!num) continue;
    const ticket = getTicketText(num);
    const m = ticket.match(/^([A-Z]{2})\b/);
    if (!m) continue;
    const series = m[1];
    const existing = map.get(series);
    if (existing) {
      existing.wins += 1;
      if (r.drawDate > existing.lastWonDate) {
        existing.lastWonDate = r.drawDate;
        existing.lastWonDisplayDate = r.displayDate;
        existing.lastWonDrawCode = r.drawCode;
      }
    } else {
      map.set(series, {
        series,
        wins: 1,
        lastWonDate: r.drawDate,
        lastWonDisplayDate: r.displayDate,
        lastWonDrawCode: r.drawCode,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.wins - a.wins || a.series.localeCompare(b.series));
}

export type HotNumber = { number: string; count: number };

// The 5 most frequent last-4-digit endings across EVERY prize tier (1st through
// the lowest tier, plus consolation), scanning the most recent 30 draws across
// all lotteries combined — this page is the site-wide guessing hub, not a
// single lottery, so the window is the 30 most recent draws overall.
export function getSiteHotNumbers(topN = 5): HotNumber[] {
  const recent = [...results]
    .filter((r) => r.status === 'verified' || r.status === 'live')
    .sort((a, b) => b.drawDate.localeCompare(a.drawDate) || b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 30);
  const freq: Record<string, number> = {};
  for (const r of recent) {
    for (const prize of r.prizes) {
      for (const num of prize.numbers) {
        const digits = getTicketText(num).replace(/\D/g, '');
        if (digits.length < 4) continue;
        const last4 = digits.slice(-4);
        freq[last4] = (freq[last4] || 0) + 1;
      }
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([number, count]) => ({ number, count }));
}
