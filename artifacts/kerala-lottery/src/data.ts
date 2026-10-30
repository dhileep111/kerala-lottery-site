import lotteriesJson from './data/lotteries.json';
import resultsJson from './data/results.json';
import guessingJson from './data/guessing-numbers.json';
import holidaysJson from './data/holidays.json';
import bumpersJson from './data/bumpers.json';
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

// The most recently verified result with a 1st-prize ticket — same
// selection rule update_guessing.py's derive_boards() uses server-side
// (sorted by drawDate then lastUpdated, descending, first verified result
// with a usable 1st-prize number). Exposed here so the client-side
// calculator and "how these numbers are made" explainer use the exact same
// source draw the daily generator itself would have used right now.
export function getLatestVerifiedResult(): Result | null {
  const candidates = [...results]
    .filter(r => r.status === 'verified')
    .sort((a, b) => (b.drawDate || '').localeCompare(a.drawDate || '') || (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
  for (const r of candidates) {
    const first = r.prizes.find(p => p.tier === '1st Prize');
    if (first && first.numbers && first.numbers.length > 0) return r;
  }
  return null;
}

// Extracts the 6 ticket digits from free-text input — accepts a bare
// 6-digit number ("289707") or a full ticket with a series prefix
// ("SM 289707", "SM289707", etc). Takes the LAST 6 digits found, same as
// update_guessing.py's extract_ticket_digits(). Returns null if there
// aren't at least 6 digits.
export function extractTicketDigits(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  return digits.length >= 6 ? digits.slice(-6) : null;
}

export interface DerivedGuessingNumbers {
  boards: { A: string; B: string; C: string };
  numbers: GuessingDay['numbers'];
}

// Ports update_guessing.py's derive_boards() arithmetic (A/B/C from pairs
// of the 6 ticket digits) and build_numbers() (the fixed combo/template
// rules) EXACTLY — same formula, same labels, same two "hot" picks. Keep
// this in sync with that script; it's the single source both the daily
// generator (Python, server-side) and this calculator (TS, client-side)
// are meant to agree with.
const GUESSING_NUMBER_TEMPLATE: Array<{ digits: number; label: string; type: string }> = [
  { digits: 1, label: 'A Board', type: 'board' },
  { digits: 1, label: 'B Board', type: 'board' },
  { digits: 1, label: 'C Board', type: 'board' },
  { digits: 2, label: 'AB Combo', type: 'combo' },
  { digits: 2, label: 'BC Combo', type: 'combo' },
  { digits: 2, label: 'CA Combo', type: 'combo' },
  { digits: 3, label: 'ABC Three Digit', type: 'triple' },
  { digits: 3, label: 'BCA Three Digit', type: 'triple' },
  { digits: 3, label: 'CAB Three Digit', type: 'triple' },
  { digits: 4, label: 'Hot Pick', type: 'four' },
  { digits: 4, label: 'Mirror Pick', type: 'four' },
  { digits: 4, label: 'Pattern Pick', type: 'four' },
  { digits: 4, label: 'Lucky Combo', type: 'four' },
  { digits: 4, label: 'Reverse Pick', type: 'four' },
  { digits: 4, label: 'Sequential', type: 'four' },
  { digits: 4, label: 'Zero Start', type: 'four' },
  { digits: 4, label: 'Double AB', type: 'four' },
  { digits: 4, label: 'Double BC', type: 'four' },
];
const GUESSING_HOT_LABELS = new Set(['Hot Pick', 'Lucky Combo']);

export function deriveGuessingNumbers(ticketDigits: string): DerivedGuessingNumbers {
  const d = ticketDigits.split('').map(Number);
  const A = String((d[0] + d[3]) % 10);
  const B = String((d[1] + d[4]) % 10);
  const C = String((d[2] + d[5]) % 10);

  const comboMap: Record<string, string> = {
    'A Board': A, 'B Board': B, 'C Board': C,
    'AB Combo': A + B, 'BC Combo': B + C, 'CA Combo': C + A,
    'ABC Three Digit': A + B + C, 'BCA Three Digit': B + C + A, 'CAB Three Digit': C + A + B,
    'Hot Pick': A + A + B + C, 'Mirror Pick': B + B + C + A, 'Pattern Pick': C + C + A + B,
    'Lucky Combo': A + B + C + A, 'Reverse Pick': C + B + A + C, 'Sequential': C + B + C + A,
    'Zero Start': '0' + A + B + C, 'Double AB': A + B + A + B, 'Double BC': B + C + B + C,
  };

  const numbers: GuessingDay['numbers'] = GUESSING_NUMBER_TEMPLATE.map(({ digits, label, type }) => ({
    digits, label, type, value: comboMap[label],
    ...(GUESSING_HOT_LABELS.has(label) ? { hot: true } : {}),
  }));

  return { boards: { A, B, C }, numbers };
}

export const holidays = (holidaysJson as { dates: Record<string, string> }).dates;

// Same holidays.json et_scraper.py reads — single source of truth, so the
// site can tell a visitor "no result today, it's a holiday" instead of the
// misleading "check back after 3 PM" when no draw happened at all today.
export function getTodayHoliday(): string | null {
  const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const dateStr = `${istNow.getFullYear()}-${String(istNow.getMonth() + 1).padStart(2, '0')}-${String(istNow.getDate()).padStart(2, '0')}`;
  return holidays[dateStr] ?? null;
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

// Same bumpers.json et_scraper.py and prerender.mjs read — the Kerala
// Lottery Dept suspends that weekday's regular draw whenever a bumper is
// announced for the same date, so on a bumper day the weekday lookup below
// would wrongly point at a regular lottery that isn't actually drawing.
function isBumperDay(date: Date): boolean {
  const upcoming = (bumpersJson as { upcoming?: { drawDateISO?: string } }).upcoming;
  if (!upcoming?.drawDateISO) return false;
  const istNow = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const todayStr = `${istNow.getFullYear()}-${String(istNow.getMonth() + 1).padStart(2, '0')}-${String(istNow.getDate()).padStart(2, '0')}`;
  return upcoming.drawDateISO.slice(0, 10) === todayStr;
}

// Public wording for results.json's internal sourceName labels (display only; the data is unchanged).
const SOURCE_LABELS: Record<string, string> = {
  'ET auto scraper': 'Automated update',
  'Manual admin update': 'Manual update',
};
export function displaySource(name: string): string {
  return SOURCE_LABELS[name] ?? name;
}

// The bumper's IST draw date ("YYYY-MM-DD") — the same date isBumperDay() treats as having no regular draw.
export function getBumperDrawDateIST(): string | null {
  return (bumpersJson as { upcoming?: { drawDateISO?: string } }).upcoming?.drawDateISO?.slice(0, 10) ?? null;
}

export interface UpcomingBumper {
  announced: boolean;
  name?: string; code?: string; drawDateISO?: string; drawDateLabel?: string;
  drawTime?: string; firstPrize?: string; ticketPrice?: string; series?: string; venue?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Mirrors prerender.mjs getActiveUpcomingBumper(): the announced bumper stops being
// "upcoming" once its result has a 1st prize, or 24h after the draw, without anyone
// having to reset announced:false.
export function getActiveUpcomingBumper(now = Date.now()): UpcomingBumper | null {
  const up = (bumpersJson as { upcoming?: UpcomingBumper }).upcoming;
  if (!up?.announced) return null;
  const hasResult = results.some((r) =>
    r.lotterySlug === 'bumper' && r.drawCode === up.code &&
    (r.prizes.find((p) => p.tier === '1st Prize')?.numbers.length ?? 0) > 0,
  );
  if (hasResult) return null;
  const drawMs = Date.parse(up.drawDateISO ?? '');
  if (Number.isFinite(drawMs) && now > drawMs + DAY_MS) return null;
  return up;
}

// True only while the bumper draw is 0–24h away, so the daily countdown isn't replaced weeks early.
export function isBumperCountdownWindow(up: UpcomingBumper | null, now = Date.now()): boolean {
  const drawMs = Date.parse(up?.drawDateISO ?? '');
  if (!Number.isFinite(drawMs)) return false;
  const untilDraw = drawMs - now;
  return untilDraw >= 0 && untilDraw <= DAY_MS;
}

export function getTodayLottery(date = new Date()) {
  if (isBumperDay(date)) {
    const bumper = lotteries.find((l) => l.isBumper);
    if (bumper) return bumper;
  }
  const day = date.getDay();
  return lotteries.find((lottery) => lottery.drawDayIndex === day) ?? lotteries[0];
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
