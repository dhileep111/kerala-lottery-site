#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * Run this after build: node generate-sitemap.mjs
 * Reads lotteries.json + results.json → writes sitemap.xml into dist/public/
 * Also updates robots.txt with sitemap reference.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir   = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dir, 'artifacts/kerala-lottery/src/data');
const outDir  = resolve(__dir, 'artifacts/kerala-lottery/dist/public');

const SITE = 'https://keralaticketresults.in';
const now  = new Date().toISOString();

// Load data
const lotteries = JSON.parse(readFileSync(`${dataDir}/lotteries.json`, 'utf8'));
const results   = JSON.parse(readFileSync(`${dataDir}/results.json`,   'utf8'));

// ── Static pages ──────────────────────────────────────────
const staticPages = [
  { url: '/',                  priority: '1.00', changefreq: 'daily'   },
  { url: '/check-ticket',      priority: '0.80', changefreq: 'monthly' },
  { url: '/guessing-numbers',  priority: '0.80', changefreq: 'daily'   },
  { url: '/guessing-numbers/bhagyathara', priority: '0.80', changefreq: 'daily', lastmod: now },
  { url: '/guessing-numbers/sthree-sakthi', priority: '0.80', changefreq: 'daily', lastmod: now },
  { url: '/guessing-numbers/dhanalekshmi', priority: '0.80', changefreq: 'daily', lastmod: now },
  { url: '/guessing-numbers/karunya-plus', priority: '0.80', changefreq: 'daily', lastmod: now },
  { url: '/guessing-numbers/suvarna-keralam', priority: '0.80', changefreq: 'daily', lastmod: now },
  { url: '/guessing-numbers/karunya', priority: '0.80', changefreq: 'daily', lastmod: now },
  { url: '/guessing-numbers/samrudhi', priority: '0.80', changefreq: 'daily', lastmod: now },
  { url: '/claim-guide',       priority: '0.70', changefreq: 'monthly' },
  { url: '/faq',               priority: '0.60', changefreq: 'monthly' },
  { url: '/about',             priority: '0.50', changefreq: 'monthly' },
  { url: '/contact',           priority: '0.50', changefreq: 'monthly' },
  { url: '/disclaimer',        priority: '0.40', changefreq: 'yearly'  },
  { url: '/privacy-policy',    priority: '0.40', changefreq: 'yearly'  },
  { url: '/terms',             priority: '0.40', changefreq: 'yearly'  },
  { url: '/lottery-offices',   priority: '0.50', changefreq: 'monthly' },
  { url: '/privacy-policy',    priority: '0.30', changefreq: 'yearly'  },
  { url: '/terms',             priority: '0.30', changefreq: 'yearly'  },
  { url: '/disclaimer',        priority: '0.30', changefreq: 'yearly'  },
  { url: '/download-forms',    priority: '0.50', changefreq: 'monthly' },
];

// ── ALL lottery index pages including bumper ──────────────
const lotteryPages = lotteries.map(l => ({
  url:        `/results/${l.slug}`,
  priority:   '0.90',
  changefreq: l.slug === 'bumper' ? 'weekly' : 'daily',
  lastmod:    now,
}));

// ── Individual result archive pages ──────────────────────
const archivePages = results.map(r => {
  const drawCodeLower = r.drawCode.toLowerCase().replace(/\s+/g, '-');
  return {
    url:        `/results/${r.lotterySlug}/${drawCodeLower}`,
    priority:   r.status === 'live' || r.status === 'verified' ? '0.85' : '0.60',
    changefreq: r.status === 'pending' ? 'hourly' : 'monthly',
    lastmod:    r.lastUpdated || now,
  };
});

// ── Build XML ─────────────────────────────────────────────
function urlEntry({ url, priority, changefreq, lastmod }) {
  const loc     = url === '/' ? `${SITE}/` : `${SITE}${url}/`;
  const modDate = lastmod ? new Date(lastmod).toISOString() : now;
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${modDate}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

const allPages = [...staticPages, ...lotteryPages, ...archivePages];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allPages.map(urlEntry),
  '</urlset>',
].join('\n');

writeFileSync(`${outDir}/sitemap.xml`, xml, 'utf8');
console.log(`✅ sitemap.xml written — ${allPages.length} URLs`);
console.log(`   Static: ${staticPages.length} | Lottery pages: ${lotteryPages.length} (incl. bumper) | Archives: ${archivePages.length}`);

// Update robots.txt with sitemap reference
const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${SITE}/sitemap.xml`,
].join('\n');

writeFileSync(`${outDir}/robots.txt`, robots, 'utf8');
console.log('✅ robots.txt updated with sitemap reference');
