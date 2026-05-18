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
export const guessingNumbers = guessingJson as Array<{ number: string; label: string }>;

export function getLottery(slug: string) {
  return lotteries.find((lottery) => lottery.slug === slug);
}

export function getTicketText(number: WinningNumber) {
  return typeof number === 'string' ? number : number.ticket;
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
