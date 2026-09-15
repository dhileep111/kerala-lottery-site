#!/usr/bin/env node
/**
 * generate-full-sitemap.mjs
 * Run: node generate-full-sitemap.mjs (after `pnpm run build`, in the CI
 * workflows — same slot generate-sitemap.mjs used to occupy)
 *
 * Mirrors the exact route universe prerender.mjs generates — staticRoutes,
 * lotteryRoutes and archiveRoutes, each with its /ta counterpart — and
 * writes a single sitemap.xml covering all of them, English and Tamil.
 * lastmod is today's date for every entry.
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
const TODAY = new Date().toISOString().slice(0, 10); // today's date, e.g. 2026-09-15

const lotteries = JSON.parse(readFileSync(`${dataDir}/lotteries.json`, 'utf8'));
const results   = JSON.parse(readFileSync(`${dataDir}/results.json`,   'utf8'));

// ── staticRoutes — same 19 unique paths as prerender.mjs's staticRoutes
// (that array lists /lottery-offices twice; deduped here since a sitemap
// must not repeat a URL) ────────────────────────────────────────────────
const staticPages = [
  { url: '/',                          priority: '1.00', changefreq: 'daily'   },
  { url: '/schedule',                  priority: '0.70', changefreq: 'monthly' },
  { url: '/jackpot',                   priority: '0.85', changefreq: 'daily'   },
  { url: '/claim-prize',               priority: '0.70', changefreq: 'monthly' },
  { url: '/yesterday-result',          priority: '0.80', changefreq: 'daily'   },
  { url: '/bumper',                    priority: '0.90', changefreq: 'daily'   },
  { url: '/chart',                     priority: '0.90', changefreq: 'daily'   },
  { url: '/check-ticket',              priority: '0.80', changefreq: 'monthly' },
  { url: '/guessing-numbers',          priority: '0.80', changefreq: 'daily'   },
  { url: '/guessing-numbers/archive',  priority: '0.70', changefreq: 'daily'   },
  { url: '/claim-guide',               priority: '0.70', changefreq: 'monthly' },
  { url: '/faq',                       priority: '0.60', changefreq: 'monthly' },
  { url: '/lottery-offices',           priority: '0.50', changefreq: 'monthly' },
  { url: '/about',                     priority: '0.50', changefreq: 'monthly' },
  { url: '/contact',                   priority: '0.50', changefreq: 'monthly' },
  { url: '/disclaimer',                priority: '0.40', changefreq: 'yearly'  },
  { url: '/privacy-policy',            priority: '0.40', changefreq: 'yearly'  },
  { url: '/terms',                     priority: '0.40', changefreq: 'yearly'  },
  { url: '/download-forms',            priority: '0.50', changefreq: 'monthly' },
];

// ── lotteryRoutes — /results/:slug, one per lottery (incl. bumper) ──────
const lotteryPages = lotteries.map(l => ({
  url:        `/results/${l.slug}`,
  priority:   '0.90',
  changefreq: l.slug === 'bumper' ? 'weekly' : 'daily',
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
    };
  });

const enPages = [...staticPages, ...lotteryPages, ...archivePages];

// Tamil counterpart of every page above — same path rules as
// makeTamilRoute() in prerender.mjs: '/' -> '/ta', everything else ->
// '/ta' + path.
const taPages = enPages.map(p => ({
  ...p,
  url: p.url === '/' ? '/ta' : `/ta${p.url}`,
}));

const allPages = [...enPages, ...taPages];

// ── Build XML ─────────────────────────────────────────────────────────
function urlEntry({ url, priority, changefreq }) {
  // No forced trailing slash — matches the canonical no-slash convention
  // used everywhere else on the site (canonical tags, internal <Link>s,
  // prerender.mjs's sibling ".html" file layout). '/' already ends in a
  // slash on its own.
  const loc = `${SITE}${url}`;
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
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
console.log(`   Tamil (/ta): ${taPages.length}`);
console.log(`   lastmod: ${TODAY}`);
