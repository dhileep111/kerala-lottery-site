#!/usr/bin/env node
/**
 * generate-full-sitemap.mjs
 * Run: node generate-full-sitemap.mjs (after `pnpm run build`, in the CI
 * workflows — same slot generate-sitemap.mjs used to occupy)
 *
 * Mirrors the exact route universe prerender.mjs generates — staticRoutes,
 * lotteryRoutes and archiveRoutes, each with its /ta, /ml, /hi and /kn
 * counterpart — and writes a single sitemap.xml covering all of them.
 * lastmod is the date a page's content really changed: the newest draw for
 * data-driven pages, the draw's own date for per-draw pages, and a fixed date
 * for static pages (update those by hand when the page's content changes).
 * Every date is capped at today's IST date.
 *
 * Replaces generate-sitemap.mjs in the deploy pipeline (static.yml,
 * manual_updater.yml, et_auto_updater.yml): that script's hand-maintained
 * page list predates /schedule, /jackpot, /claim-prize and every /ta
 * route, so it was silently clobbering the correct sitemap with a stale,
 * English-only one on every deploy.
 *
 * Writes to two places:
 *  - artifacts/kerala-lottery/public/sitemap.xml — the Vite public/ source
 *    folder, so there's always a committed, source-controlled copy.
 *  - artifacts/kerala-lottery/dist/public/sitemap.xml — the build output,
 *    only if it already exists (i.e. this ran after `pnpm run build`).
 *    This is the copy that actually ships to GitHub Pages.
 *
 * lotteryGuessingRoutes and redirectRoutes from prerender.mjs are
 * intentionally excluded: they have no /ta counterpart, and the redirect
 * stub page has no business being indexed at all.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir       = dirname(fileURLToPath(import.meta.url));
const dataDir     = resolve(__dir, 'artifacts/kerala-lottery/src/data');
const sourceDir   = resolve(__dir, 'artifacts/kerala-lottery/public');
const buildDir    = resolve(__dir, 'artifacts/kerala-lottery/dist/public');

const SITE  = 'https://keralaticketresults.in';
const TODAY_IST = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

const lotteries = JSON.parse(readFileSync(`${dataDir}/lotteries.json`, 'utf8'));
const results   = JSON.parse(readFileSync(`${dataDir}/results.json`,   'utf8'));

// Fixed dates: the last real content change of each static page.
const STATIC_LASTMOD     = '2026-09-16';
const SCHEDULE_LASTMOD   = '2026-10-30';
const TAX_CALC_LASTMOD   = '2026-10-10';
const BUMPER_LASTMOD     = '2026-10-30'; // BR-112 upcoming block went live

// Same "has a result" rule as prerender.mjs: newest drawDate with a 1st-prize number.
function newestDraw(slug) {
  return results
    .filter(r => (!slug || r.lotterySlug === slug) && r.prizes?.find(p => p.tier === '1st Prize')?.numbers?.length > 0)
    .map(r => r.drawDate)
    .sort()
    .pop();
}
const NEWEST_ANY = newestDraw();
const laterOf = (a, b) => ((a || '') > b ? a : b);
const BUMPER_DATE = laterOf(newestDraw('bumper'), BUMPER_LASTMOD);

// Fall back to the fixed date if a value is missing or malformed; never a future date.
function capLastmod(date, fallback = STATIC_LASTMOD) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? date : fallback;
  return d > TODAY_IST ? TODAY_IST : d;
}

// ── staticRoutes — same 19 unique paths as prerender.mjs's staticRoutes
// (that array lists /lottery-offices twice; deduped here since a sitemap
// must not repeat a URL) ────────────────────────────────────────────────
const staticPages = [
  { url: '/',                          priority: '1.00', changefreq: 'daily',   lastmod: NEWEST_ANY },
  { url: '/schedule',                  priority: '0.70', changefreq: 'monthly', lastmod: SCHEDULE_LASTMOD },
  { url: '/jackpot',                   priority: '0.85', changefreq: 'daily',   lastmod: NEWEST_ANY },
  { url: '/claim-prize',               priority: '0.70', changefreq: 'monthly', lastmod: STATIC_LASTMOD },
  { url: '/yesterday-result',          priority: '0.80', changefreq: 'daily',   lastmod: NEWEST_ANY },
  { url: '/bumper',                    priority: '0.90', changefreq: 'daily',   lastmod: BUMPER_DATE },
  { url: '/chart',                     priority: '0.90', changefreq: 'daily',   lastmod: NEWEST_ANY },
  { url: '/check-ticket',              priority: '0.80', changefreq: 'monthly', lastmod: STATIC_LASTMOD },
  { url: '/guessing-numbers',          priority: '0.80', changefreq: 'daily',   lastmod: NEWEST_ANY },
  { url: '/guessing-numbers/archive',  priority: '0.70', changefreq: 'daily',   lastmod: NEWEST_ANY },
  { url: '/claim-guide',               priority: '0.70', changefreq: 'monthly', lastmod: STATIC_LASTMOD },
  { url: '/faq',                       priority: '0.60', changefreq: 'monthly', lastmod: STATIC_LASTMOD },
  { url: '/lottery-offices',           priority: '0.50', changefreq: 'monthly', lastmod: STATIC_LASTMOD },
  { url: '/about',                     priority: '0.50', changefreq: 'monthly', lastmod: STATIC_LASTMOD },
  { url: '/contact',                   priority: '0.50', changefreq: 'monthly', lastmod: STATIC_LASTMOD },
  { url: '/disclaimer',                priority: '0.40', changefreq: 'yearly',  lastmod: STATIC_LASTMOD },
  { url: '/privacy-policy',            priority: '0.40', changefreq: 'yearly',  lastmod: STATIC_LASTMOD },
  { url: '/terms',                     priority: '0.40', changefreq: 'yearly',  lastmod: STATIC_LASTMOD },
  { url: '/download-forms',            priority: '0.50', changefreq: 'monthly', lastmod: STATIC_LASTMOD },
  { url: '/prize-tax-calculator',      priority: '0.70', changefreq: 'monthly', lastmod: TAX_CALC_LASTMOD },
];

// ── lotteryRoutes — /results/:slug, one per lottery (incl. bumper) ──────
const lotteryPages = lotteries.map(l => ({
  url:        `/results/${l.slug}`,
  priority:   '0.90',
  changefreq: l.slug === 'bumper' ? 'weekly' : 'daily',
  lastmod:    l.slug === 'bumper' ? BUMPER_DATE : newestDraw(l.slug),
}));

// ── archiveRoutes — /results/:slug/:drawCode, same skip rule as
// prerender.mjs (no page for a pending result with no prize data yet) ──
const archivePages = results
  .filter(r => {
    const hasData = r.prizes && r.prizes.some(p => p.numbers && p.numbers.length > 0);
    return !(r.status === 'pending' && !hasData);
  })
  .map(r => {
    const drawCodeLower = r.drawCode.toLowerCase().replace(/\s+/g, '-');
    return {
      url:        `/results/${r.lotterySlug}/${drawCodeLower}`,
      priority:   r.status === 'live' || r.status === 'verified' ? '0.85' : '0.60',
      changefreq: r.status === 'pending' ? 'hourly' : 'monthly',
      lastmod:    r.drawDate,
    };
  });

const enPages = [...staticPages, ...lotteryPages, ...archivePages];

// Locale counterpart of every page above, for each locale the site
// publishes under /<locale>/ — same path rule as makeLocaleRoute() in
// prerender.mjs: '/' -> '/<locale>', everything else -> '/<locale>' + path.
const ALT_LOCALES = ['ta', 'ml', 'hi', 'kn'];
const localePages = ALT_LOCALES.flatMap((locale) =>
  enPages.map((p) => ({
    ...p,
    url: p.url === '/' ? `/${locale}` : `/${locale}${p.url}`,
  }))
);

const allPages = [...enPages, ...localePages];

// ── Build XML ─────────────────────────────────────────────────────────
function urlEntry({ url, priority, changefreq, lastmod }) {
  // No forced trailing slash — matches the canonical no-slash convention
  // used everywhere else on the site (canonical tags, internal <Link>s,
  // prerender.mjs's sibling ".html" file layout). '/' already ends in a
  // slash on its own.
  const loc = `${SITE}${url}`;
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${capLastmod(lastmod)}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allPages.map(urlEntry),
  '</urlset>',
].join('\n');

writeFileSync(`${sourceDir}/sitemap.xml`, xml, 'utf8');
console.log(`✅ sitemap.xml written to artifacts/kerala-lottery/public/ — ${allPages.length} URLs`);

if (existsSync(buildDir)) {
  writeFileSync(`${buildDir}/sitemap.xml`, xml, 'utf8');
  console.log(`✅ sitemap.xml also written to artifacts/kerala-lottery/dist/public/ (build output)`);
} else {
  console.log(`ℹ️  dist/public/ doesn't exist yet — skipped (run after \`pnpm run build\` to update the deployed copy too)`);
}

console.log(`   English: ${enPages.length} (static ${staticPages.length}, lottery ${lotteryPages.length}, archive ${archivePages.length})`);
for (const locale of ALT_LOCALES) {
  console.log(`   /${locale}: ${enPages.length}`);
}
console.log(`   lastmod: real change dates, newest draw ${NEWEST_ANY}, capped at ${TODAY_IST}`);
