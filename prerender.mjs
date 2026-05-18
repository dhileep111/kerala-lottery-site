#!/usr/bin/env node
/**
 * prerender.mjs
 * =============
 * Generates static HTML files for every route AFTER Vite builds.
 * Each route gets its own index.html so GitHub Pages serves it directly —
 * no 404.html redirect needed, no ?p= or ?/ in the URL, Google indexes clean URLs.
 *
 * How it works:
 *   1. Reads the built index.html from dist/public/
 *   2. Reads lotteries.json + results.json for dynamic routes
 *   3. Creates dist/public/results/karunya/index.html etc.
 *   4. Each file has unique title, meta description, og tags, og:url, og:image, canonical
 *
 * Place this file in repo ROOT (same level as package.json).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir   = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dir, 'artifacts/kerala-lottery/dist/public');
const dataDir = resolve(__dir, 'artifacts/kerala-lottery/src/data');

// ── Load build output ─────────────────────────────────────
const baseHtml = readFileSync(`${distDir}/index.html`, 'utf8');

// ── Load data ─────────────────────────────────────────────
const lotteries = JSON.parse(readFileSync(`${dataDir}/lotteries.json`, 'utf8'));
const results   = JSON.parse(readFileSync(`${dataDir}/results.json`,   'utf8'));

const SITE = 'https://keralaticketresults.in';
const OG_IMAGE = `${SITE}/opengraph.jpg`;

// ── Static routes ─────────────────────────────────────────
const staticRoutes = [
  { path: '/check-ticket',
    title: 'Check Kerala Lottery Ticket Number — Instant Result Lookup',
    desc: 'Check if your Kerala lottery ticket number is a winner. Enter your full ticket or last 4 digits to search across all recent draws instantly.' },
  { path: '/guessing-numbers',
    title: 'Kerala Lottery Guessing Numbers Today Tamil | கேரளா லாட்டரி கணிப்பு',
    desc: 'Today Kerala lottery guessing numbers in Tamil. A B C board numbers for Karunya, Sthree Sakthi and all lotteries. கேரளா லாட்டரி இன்றைய கணிப்பு எண்கள்.' },
  { path: '/claim-guide',
    title: 'How to Claim Kerala Lottery Prize — Documents, Deadline & Tamil Nadu Guide',
    desc: 'Step-by-step guide to claim your Kerala lottery prize including Tamil Nadu residents. Documents needed, 30-day deadline, TDS rules, and district office list.' },
  { path: '/faq',
    title: 'Kerala Lottery FAQ — Results, Prize Claim & Ticket Verification',
    desc: 'Answers to common Kerala Lottery questions: when results are published, how to verify a ticket, how to claim a prize, and tax on winnings.' },
  { path: '/about',
    title: 'About Kerala Ticket Results — Fast, Verified Lottery Updates',
    desc: 'About keralaticketresults.in — independent Kerala lottery result updates for Tamil Nadu border residents and all of India.' },
  { path: '/contact',
    title: 'Contact | Kerala Ticket Results',
    desc: 'Contact keralaticketresults.in for queries about Kerala lottery results.' },
  { path: '/disclaimer',
    title: 'Disclaimer | Kerala Ticket Results',
    desc: 'Disclaimer for keralaticketresults.in — unofficial lottery results information site. Not affiliated with Kerala Government.' },
  { path: '/privacy-policy',
    title: 'Privacy Policy | Kerala Ticket Results',
    desc: 'Privacy policy for keralaticketresults.in.' },
  { path: '/terms',
    title: 'Terms of Use | Kerala Ticket Results',
    desc: 'Terms of use for keralaticketresults.in.' },
  { path: '/lottery-offices',
    title: 'Kerala Lottery District Offices — Prize Claim Locations',
    desc: 'List of Kerala lottery district offices and collection centres for prize claims. Find the nearest office for your prize amount.' },
  { path: '/download-forms',
    title: 'Download Kerala Lottery Prize Claim Forms',
    desc: 'Download Kerala lottery prize claim forms and other official documents needed for prize collection.' },
];

// ── Dynamic lottery index routes (ALL lotteries including bumper) ─────────────
const lotteryRoutes = lotteries.map(l => ({
  path:  `/results/${l.slug}`,
  title: `${l.name} Lottery Result Today | Kerala Lottery ${l.code}`,
  desc:  `${l.name} (${l.code}) lottery result today — latest winning numbers, prize amounts, and draw schedule. ${l.drawDay === 'Special Draws' ? 'Special bumper draw.' : `Draws every ${l.drawDay} at ${l.drawTime}.`} Updated daily.`,
}));

// ── Dynamic archive routes (/results/slug/draw-code) ─────
const archiveRoutes = results.map(r => {
  const lottery = lotteries.find(l => l.slug === r.lotterySlug) || {};
  const drawCodeLower = r.drawCode.toLowerCase().replace(/\s+/g, '-');
  return {
    path:     `/results/${r.lotterySlug}/${drawCodeLower}`,
    title:    `${lottery.name || r.lotterySlug} ${r.drawCode} Result ${r.displayDate} | Kerala Lottery`,
    desc:     `${lottery.name || r.lotterySlug} ${r.drawCode} lottery result for ${r.displayDate}. Complete prize table with winning numbers, draw status, and official source link.`,
    canonical: `${SITE}/results/${r.lotterySlug}/${drawCodeLower}`,
    lastmod:  r.lastUpdated,
  };
});

const allRoutes = [...staticRoutes, ...lotteryRoutes, ...archiveRoutes];

// ── Generate HTML for each route ─────────────────────────
function makeHtml(route) {
  const canonical = route.canonical || `${SITE}${route.path}`;
  let html = baseHtml;

  // Update <title>
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`);

  // Update meta description
  html = html.replace(
    /<meta name="description" content=".*?"/,
    `<meta name="description" content="${escapeAttr(route.desc)}"`
  );

  // Update og:title
  html = html.replace(
    /<meta property="og:title" content=".*?"/,
    `<meta property="og:title" content="${escapeAttr(route.title)}"`
  );

  // Update og:description
  html = html.replace(
    /<meta property="og:description" content=".*?"/,
    `<meta property="og:description" content="${escapeAttr(route.desc)}"`
  );

  // Update og:url (inject after og:type if present, else add near og:title)
  if (html.includes('property="og:url"')) {
    html = html.replace(
      /<meta property="og:url" content=".*?"/,
      `<meta property="og:url" content="${canonical}"`
    );
  }

  // Update og:image (ensure it's always set)
  if (html.includes('property="og:image"')) {
    html = html.replace(
      /<meta property="og:image" content=".*?"/,
      `<meta property="og:image" content="${OG_IMAGE}"`
    );
  }

  // Update twitter:image
  if (html.includes('name="twitter:image"')) {
    html = html.replace(
      /<meta name="twitter:image" content=".*?"/,
      `<meta name="twitter:image" content="${OG_IMAGE}"`
    );
  }

  // Remove the SPA redirect script — not needed for pre-rendered pages
  html = html.replace(
    /<!-- GitHub Pages SPA Routing Fix[\s\S]*?<\/script>/m,
    `<!-- Pre-rendered route: ${route.path} -->`
  );

  // Remove ?p= canonical script and replace with a clean static canonical
  html = html.replace(
    /<!-- Canonical tag[\s\S]*?<\/script>/m,
    `<link rel="canonical" href="${canonical}" />`
  );

  return html;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ── Write files ───────────────────────────────────────────
let written = 0;
let skipped = 0;

for (const route of allRoutes) {
  const dir = `${distDir}${route.path}`;
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/index.html`, makeHtml(route), 'utf8');
    written++;
  } catch (err) {
    console.error(`❌ Failed: ${route.path} — ${err.message}`);
    skipped++;
  }
}

console.log(`\n✅ Pre-rendering complete!`);
console.log(`   Written: ${written} route files`);
console.log(`   Skipped: ${skipped} errors`);
console.log(`   Static:  ${staticRoutes.length}`);
console.log(`   Lottery: ${lotteryRoutes.length} (all lotteries incl. bumper)`);
console.log(`   Archive: ${archiveRoutes.length}`);
console.log(`\n   GitHub Pages will now serve clean URLs directly.`);
