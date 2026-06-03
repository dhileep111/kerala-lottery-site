#!/usr/bin/env node
/**
 * prerender.mjs — v2 with real content injection
 * Injects actual prize data into <div id="root"> so Google sees real content,
 * not an empty shell. This is the fix for "Discovered - currently not indexed".
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir   = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dir, 'artifacts/kerala-lottery/dist/public');
const dataDir = resolve(__dir, 'artifacts/kerala-lottery/src/data');

const baseHtml  = readFileSync(`${distDir}/index.html`, 'utf8');
const lotteries = JSON.parse(readFileSync(`${dataDir}/lotteries.json`, 'utf8'));
const results   = JSON.parse(readFileSync(`${dataDir}/results.json`,   'utf8'));

const SITE     = 'https://keralaticketresults.in';
const OG_IMAGE = `${SITE}/opengraph.jpg`;

// ── Helpers ───────────────────────────────────────────────
const e  = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const ea = s => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;');

function getTicket(num) {
  if (!num) return null;
  if (typeof num === 'string') return num;
  return num.ticket || null;
}
function getDistrict(num) {
  if (!num || typeof num === 'string') return null;
  return num.district || null;
}
function getFirstPrize(result) {
  const p = result?.prizes?.find(p => p.tier === '1st Prize');
  return p?.numbers?.[0] ? getTicket(p.numbers[0]) : 'Pending';
}
function getResultForSlug(slug) {
  return results.find(r => r.lotterySlug === slug) || null;
}
function getLottery(slug) {
  return lotteries.find(l => l.slug === slug) || null;
}

// ── Build static content for result pages ─────────────────
function buildResultContent(lottery, result) {
  if (!result) return '';
  const firstPrize = getFirstPrize(result);
  const isPending  = result.status === 'pending';

  // Prize rows
  const prizeRows = result.prizes.map(prize => {
    const nums = prize.numbers;
    if (nums.length === 0) {
      return `<tr><td>${e(prize.tier)}</td><td><em>Pending</em></td><td>${e(prize.amount)}</td></tr>`;
    }
    if (['1st Prize','2nd Prize','3rd Prize','Consolation Prize'].includes(prize.tier)) {
      const cells = nums.map(n => {
        const t = getTicket(n);
        const d = getDistrict(n);
        return d ? `${e(t)} (${e(d)})` : e(t);
      }).join(', ');
      return `<tr><td>${e(prize.tier)}</td><td>${cells}</td><td>${e(prize.amount)}</td></tr>`;
    }
    // 4-digit prizes — just show count + first few
    const preview = nums.slice(0,10).map(n => e(getTicket(n))).join(', ');
    const more    = nums.length > 10 ? ` and ${nums.length - 10} more` : '';
    return `<tr><td>${e(prize.tier)}</td><td>${preview}${more}</td><td>${e(prize.amount)}</td></tr>`;
  }).join('');

  const firstDistrict = getDistrict(result.prizes.find(p=>p.tier==='1st Prize')?.numbers?.[0]);

  return `
<main>
  <h1>${e(lottery.name)} ${e(result.drawCode)} Lottery Result — ${e(result.displayDate)}</h1>
  <p>${e(lottery.name)} (${e(lottery.code)}) draws every ${e(lottery.drawDay)} at ${e(lottery.drawTime)}. 
     Draw date: ${e(result.displayDate)}. Status: ${e(result.status)}.</p>
  ${!isPending ? `
  <section>
    <h2>1st Prize Winner</h2>
    <p><strong>${e(firstPrize)}</strong>${firstDistrict ? ` — Sold in ${e(firstDistrict)}, Kerala` : ''}</p>
    <p>Prize Amount: ${e(lottery.firstPrizeAmount)}</p>
  </section>` : `<p>Result will be updated after the draw at ${e(lottery.drawTime)}.</p>`}
  <section>
    <h2>${e(lottery.name)} ${e(result.drawCode)} Full Prize Table</h2>
    <table>
      <thead><tr><th>Prize Tier</th><th>Winning Numbers</th><th>Amount</th></tr></thead>
      <tbody>${prizeRows}</tbody>
    </table>
  </section>
  <section>
    <h2>How to Claim</h2>
    <p>Winners must claim prizes within 30 days at the nearest District Lottery Office (up to ₹1,00,000) 
       or at the Directorate of Kerala State Lotteries, Thiruvananthapuram (above ₹1,00,000). 
       Carry original ticket, Aadhaar, PAN card, and bank details.</p>
    <p>Always verify your winning numbers at <a href="https://statelottery.kerala.gov.in">statelottery.kerala.gov.in</a> 
       before making any claim.</p>
  </section>
  <p><em>This page is published by Kerala Ticket Results (keralaticketresults.in), an independent informational website 
     not affiliated with the Kerala Government.</em></p>
</main>`.trim();
}

// ── Static routes ─────────────────────────────────────────
const staticRoutes = [
  { path: '/', title: 'Kerala Lottery Result Today — All Draws Updated at 3 PM IST',
    desc: 'Kerala Lottery result today for Karunya, Sthree Sakthi, Dhanalekshmi, Bhagyathara, Karunya Plus, Suvarna Keralam and Samrudhi. Updated daily at 3 PM IST.',
    content: `<main><h1>Kerala Lottery Result Today</h1><p>Kerala Lottery results are published daily at 3 PM IST. Check Karunya (KR), Sthree Sakthi (SS), Dhanalekshmi (DL), Bhagyathara (BT), Karunya Plus (KN), Suvarna Keralam (SK) and Samrudhi (SM) draw results here.</p></main>` },
  { path: '/check-ticket', title: 'Check Kerala Lottery Ticket Number — Instant Result Lookup',
    desc: 'Check if your Kerala lottery ticket number is a winner. Enter your full ticket or last 4 digits to search across all recent draws instantly.',
    content: `<main><h1>Kerala Lottery Ticket Checker</h1><p>Enter your ticket number to check if it matches any winning number across recent Kerala lottery draws. You can enter the full ticket (e.g. RR 281074), 6-digit number, or last 4 digits.</p></main>` },
  { path: '/guessing-numbers', title: 'Kerala Lottery Guessing Numbers Today | கேரளா லாட்டரி கணிப்பு',
    desc: 'Today Kerala lottery guessing numbers. A B C board numbers for all lotteries. கேரளா லாட்டரி இன்றைய கணிப்பு எண்கள். For entertainment only.',
    content: `<main><h1>Kerala Lottery Guessing Numbers Today</h1><p>Today's Kerala lottery guessing numbers including A, B, C board values and all 4-digit combinations. கேரளா லாட்டரி இன்றைய கணிப்பு எண்கள். For entertainment purposes only — not guaranteed winning numbers.</p></main>` },
  { path: '/claim-guide', title: 'How to Claim Kerala Lottery Prize — Documents, Deadline & Tamil Nadu Guide',
    desc: 'Step-by-step guide to claim your Kerala lottery prize including Tamil Nadu residents. Documents needed, 30-day deadline, TDS rules.',
    content: `<main><h1>How to Claim Kerala Lottery Prize</h1><p>Complete guide to claiming Kerala lottery prizes. Prizes up to ₹5,000 can be claimed at any authorised lottery agent. Prizes between ₹5,001 and ₹1,00,000 must be claimed at the District Lottery Office. Prizes above ₹1,00,000 must be claimed at the Directorate of Kerala State Lotteries, Thiruvananthapuram. All prizes must be claimed within 30 days.</p></main>` },
  { path: '/faq', title: 'Kerala Lottery FAQ — Results, Prize Claim & Ticket Verification',
    desc: 'Answers to common Kerala Lottery questions: when results are published, how to verify a ticket, how to claim a prize, and tax on winnings.',
    content: `<main><h1>Kerala Lottery FAQ</h1><p>Frequently asked questions about Kerala lottery results, ticket verification, prize claims, and tax on winnings.</p></main>` },
  { path: '/lottery-offices', title: 'Kerala Lottery District Offices — Addresses & Contact Numbers',
    desc: 'Complete list of all 14 Kerala District Lottery Offices with addresses, phone numbers and working hours. Find your nearest office for prize claims.',
    content: `<main><h1>Kerala Lottery District Offices</h1><p>Directory of all 14 Kerala District Lottery Offices. Contact the Directorate of Kerala State Lotteries at 0471-2305193 or visit Vikas Bhavan, Thiruvananthapuram for prizes above ₹1,00,000.</p></main>` },
  { path: '/about', title: 'About Kerala Ticket Results', desc: 'About keralaticketresults.in.',
    content: `<main><h1>About Kerala Ticket Results</h1><p>Kerala Ticket Results (keralaticketresults.in) is an independent informational website providing daily Kerala lottery result updates.</p></main>` },
  { path: '/contact', title: 'Contact | Kerala Ticket Results', desc: 'Contact Kerala Ticket Results.',
    content: `<main><h1>Contact Us</h1><p>Contact Kerala Ticket Results at support@keralaticketresults.in.</p></main>` },
  { path: '/disclaimer', title: 'Disclaimer | Kerala Ticket Results', desc: 'Disclaimer for keralaticketresults.in.',
    content: `<main><h1>Disclaimer</h1><p>Kerala Ticket Results is not affiliated with the Kerala Government or the Directorate of Kerala State Lotteries.</p></main>` },
  { path: '/privacy-policy', title: 'Privacy Policy | Kerala Ticket Results', desc: 'Privacy policy for keralaticketresults.in.',
    content: `<main><h1>Privacy Policy</h1></main>` },
  { path: '/terms', title: 'Terms and Conditions | Kerala Ticket Results', desc: 'Terms for keralaticketresults.in.',
    content: `<main><h1>Terms and Conditions</h1></main>` },
  { path: '/lottery-offices', title: 'Kerala Lottery Offices', desc: 'District lottery offices.',
    content: `<main><h1>Kerala Lottery Offices</h1></main>` },
  { path: '/download-forms', title: 'Kerala Lottery Prize Claim Forms', desc: 'Download claim forms.',
    content: `<main><h1>Download Kerala Lottery Forms</h1></main>` },
];

// ── Dynamic lottery index routes ──────────────────────────
const lotteryRoutes = lotteries.map(l => {
  const result  = getResultForSlug(l.slug);
  const firstP  = result ? getFirstPrize(result) : 'Pending';
  const district= result ? getDistrict(result?.prizes?.find(p=>p.tier==='1st Prize')?.numbers?.[0]) : null;
  return {
    path:    `/results/${l.slug}`,
    title:   `${l.name} Lottery Result Today | Kerala ${l.code} — ${firstP !== 'Pending' ? firstP : 'Draw at ' + l.drawTime}`,
    desc:    `${l.name} (${l.code}) Kerala lottery result today. ${firstP !== 'Pending' ? `1st Prize: ${firstP}${district ? ` sold in ${district}` : ''}.` : `Draw every ${l.drawDay} at ${l.drawTime}.`} Updated daily.`,
    canonical: `${SITE}/results/${l.slug}/`,
    content:  buildResultContent(l, result),
  };
});

// ── Archive routes ────────────────────────────────────────
const archiveRoutes = results.map(r => {
  const lottery = getLottery(r.lotterySlug);
  if (!lottery) return null;
  // Skip pending results with no prize data — don't create empty pages for Google
  const hasData = r.prizes && r.prizes.some(p => p.numbers && p.numbers.length > 0);
  if (r.status === 'pending' && !hasData) return null;
  const drawCodeLower = r.drawCode.toLowerCase().replace(/\s+/g,'-');
  const firstP  = getFirstPrize(r);
  const district= getDistrict(r.prizes?.find(p=>p.tier==='1st Prize')?.numbers?.[0]);
  return {
    path:     `/results/${r.lotterySlug}/${drawCodeLower}`,
    title:    `${lottery.name} ${r.drawCode} Result ${r.displayDate} | 1st Prize ${firstP}`,
    desc:     `${lottery.name} ${r.drawCode} lottery result for ${r.displayDate}. 1st Prize: ${firstP}${district ? ` sold in ${district}` : ''}. Full prize table with all winning numbers.`,
    canonical:`${SITE}/results/${r.lotterySlug}/${drawCodeLower}/`,
    lastmod:  r.lastUpdated,
    content:  buildResultContent(lottery, r),
  };
}).filter(Boolean);


// ── Per-lottery guessing number routes ────────────────────
const lotteryGuessingRoutes = [
  {
    path: '/guessing-numbers/bhagyathara',
    title: 'Bhagyathara Guessing Numbers Today | Bhagyathara ABC Board Lucky Numbers',
    desc: 'Bhagyathara (BHAGYATHARA) lottery guessing numbers today. A/B/C board values, 2-digit, 3-digit and 4-digit picks for Monday draw. பாக்யதாரா கணிப்பு எண்கள்.',
    content: `<main><h1>Bhagyathara Guessing Numbers Today</h1><p>Bhagyathara draws every Monday at 3:00 PM. ABC board guessing numbers and 4-digit picks for today and tomorrow. பாக்யதாரா லாட்டரி கணிப்பு எண்கள். For entertainment only.</p></main>`,
  },
  {
    path: '/guessing-numbers/sthree-sakthi',
    title: 'Sthree Sakthi Guessing Numbers Today | Sthree Sakthi ABC Board Lucky Numbers',
    desc: 'Sthree Sakthi (STHREESAKTHI) lottery guessing numbers today. A/B/C board values, 2-digit, 3-digit and 4-digit picks for Tuesday draw. ஸ்ரீ சக்தி கணிப்பு எண்கள்.',
    content: `<main><h1>Sthree Sakthi Guessing Numbers Today</h1><p>Sthree Sakthi draws every Tuesday at 3:00 PM. ABC board guessing numbers and 4-digit picks for today and tomorrow. ஸ்ரீ சக்தி லாட்டரி கணிப்பு எண்கள். For entertainment only.</p></main>`,
  },
  {
    path: '/guessing-numbers/dhanalekshmi',
    title: 'Dhanalekshmi Guessing Numbers Today | Dhanalekshmi ABC Board Lucky Numbers',
    desc: 'Dhanalekshmi (DHANALEKSHMI) lottery guessing numbers today. A/B/C board values, 2-digit, 3-digit and 4-digit picks for Wednesday draw. தனலட்சுமி கணிப்பு எண்கள்.',
    content: `<main><h1>Dhanalekshmi Guessing Numbers Today</h1><p>Dhanalekshmi draws every Wednesday at 3:00 PM. ABC board guessing numbers and 4-digit picks for today and tomorrow. தனலட்சுமி லாட்டரி கணிப்பு எண்கள். For entertainment only.</p></main>`,
  },
  {
    path: '/guessing-numbers/karunya-plus',
    title: 'Karunya Plus Guessing Numbers Today | Karunya Plus ABC Board Lucky Numbers',
    desc: 'Karunya Plus (KARUNYAPLUS) lottery guessing numbers today. A/B/C board values, 2-digit, 3-digit and 4-digit picks for Thursday draw. கருண்யா பிளஸ் கணிப்பு எண்கள்.',
    content: `<main><h1>Karunya Plus Guessing Numbers Today</h1><p>Karunya Plus draws every Thursday at 3:00 PM. ABC board guessing numbers and 4-digit picks for today and tomorrow. கருண்யா பிளஸ் லாட்டரி கணிப்பு எண்கள். For entertainment only.</p></main>`,
  },
  {
    path: '/guessing-numbers/suvarna-keralam',
    title: 'Suvarna Keralam Guessing Numbers Today | Suvarna Keralam ABC Board Lucky Numbers',
    desc: 'Suvarna Keralam (SUVARNAKERALAM) lottery guessing numbers today. A/B/C board values, 2-digit, 3-digit and 4-digit picks for Friday draw. சுவர்ண கேரளம் கணிப்பு எண்கள்.',
    content: `<main><h1>Suvarna Keralam Guessing Numbers Today</h1><p>Suvarna Keralam draws every Friday at 3:00 PM. ABC board guessing numbers and 4-digit picks for today and tomorrow. சுவர்ண கேரளம் லாட்டரி கணிப்பு எண்கள். For entertainment only.</p></main>`,
  },
  {
    path: '/guessing-numbers/karunya',
    title: 'Karunya Guessing Numbers Today | Karunya ABC Board Lucky Numbers',
    desc: 'Karunya (KARUNYA) lottery guessing numbers today. A/B/C board values, 2-digit, 3-digit and 4-digit picks for Saturday draw. கருண்யா கணிப்பு எண்கள்.',
    content: `<main><h1>Karunya Guessing Numbers Today</h1><p>Karunya draws every Saturday at 3:00 PM. ABC board guessing numbers and 4-digit picks for today and tomorrow. கருண்யா லாட்டரி கணிப்பு எண்கள். For entertainment only.</p></main>`,
  },
  {
    path: '/guessing-numbers/samrudhi',
    title: 'Samrudhi Guessing Numbers Today | Samrudhi ABC Board Lucky Numbers',
    desc: 'Samrudhi (SAMRUDHI) lottery guessing numbers today. A/B/C board values, 2-digit, 3-digit and 4-digit picks for Sunday draw. சம்ருத்தி கணிப்பு எண்கள்.',
    content: `<main><h1>Samrudhi Guessing Numbers Today</h1><p>Samrudhi draws every Sunday at 3:00 PM. ABC board guessing numbers and 4-digit picks for today and tomorrow. சம்ருத்தி லாட்டரி கணிப்பு எண்கள். For entertainment only.</p></main>`,
  },
];
// Redirect pages for malformed URLs that Google has already indexed
const redirectRoutes = [
  {
    path: '/results/bumper/br-109)',
    title: 'Vishu Bumper BR-109 Result — Redirecting',
    desc: 'Kerala Vishu Bumper BR-109 lottery result redirect.',
    content: `<main><h1>Vishu Bumper BR-109 Result</h1><p>Redirecting to correct page...</p><script>window.location.replace('/results/bumper/br-109/');</script><a href="/results/bumper/br-109/">View BR-109 Result</a></main>`,
  },
];

const allRoutes = [...staticRoutes, ...redirectRoutes, ...lotteryGuessingRoutes, ...lotteryRoutes, ...archiveRoutes];

// ── Generate HTML ─────────────────────────────────────────
function makeHtml(route) {
  const canonical = route.canonical 
    ? (route.canonical.endsWith('/') ? route.canonical : route.canonical + '/')
    : (route.path === '/' ? `${SITE}/` : `${SITE}${route.path}/`);
  let html = baseHtml;

  html = html.replace(/<title>.*?<\/title>/, `<title>${e(route.title)}</title>`);
  html = html.replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${ea(route.desc)}"`);
  html = html.replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${ea(route.title)}"`);
  html = html.replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${ea(route.desc)}"`);
  if (html.includes('property="og:url"'))
    html = html.replace(/<meta property="og:url" content=".*?"/, `<meta property="og:url" content="${canonical}"`);
  if (html.includes('property="og:image"'))
    html = html.replace(/<meta property="og:image" content=".*?"/, `<meta property="og:image" content="${OG_IMAGE}"`);
  if (html.includes('name="twitter:image"'))
    html = html.replace(/<meta name="twitter:image" content=".*?"/, `<meta name="twitter:image" content="${OG_IMAGE}"`);

  // Add canonical link
  html = html.replace('</head>', `  <link rel="canonical" href="${canonical}" />\n</head>`);

  // ── KEY FIX: Inject real content into <div id="root"> ──
  // This is what Google actually reads — not the JS bundle
  if (route.content) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${route.content}</div>`
    );
  }

  return html;
}

// ── Write files ───────────────────────────────────────────
let written = 0, errors = 0;
for (const route of allRoutes) {
  const dir = `${distDir}${route.path}`;
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/index.html`, makeHtml(route), 'utf8');
    written++;
  } catch (err) {
    console.error(`❌ ${route.path}: ${err.message}`);
    errors++;
  }
}

console.log(`\n✅ Prerender complete`);
console.log(`   Written : ${written} files`);
console.log(`   Errors  : ${errors}`);
console.log(`   Static  : ${staticRoutes.length}`);
console.log(`   Lottery : ${lotteryRoutes.length}`);
console.log(`   Archive : ${archiveRoutes.length}`);
console.log(`\n   Google will now see real prize content on every page.`);
