import lotteriesJson from '@/data/lotteries.json';
import resultsJson from '@/data/results.json';
import guessingJson from '@/data/guessing-numbers.json';
import type { Lottery, Result } from './types';

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

export function getLatestResult(slug?: string) {
  const filtered = slug ? results.filter((result) => result.lotterySlug === slug) : results;
  return [...filtered].sort((a, b) => b.drawDate.localeCompare(a.drawDate) || b.lastUpdated.localeCompare(a.lastUpdated))[0];
}

export function getResultWithLottery(slug?: string) {
  const result = getLatestResult(slug);
  if (!result) return null;
  const lottery = getLottery(result.lotterySlug);
  if (!lottery) return null;
  return { result, lottery };
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
  return result.prizes.find((prize) => prize.tier.toLowerCase().includes('1st'))?.numbers[0] ?? 'PENDING';
}

export function absolute(path = '') {
  return `${site.url}${path}`;
}
