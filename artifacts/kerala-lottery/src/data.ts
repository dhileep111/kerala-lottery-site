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
