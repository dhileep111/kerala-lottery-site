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
const bumpers   = JSON.parse(readFileSync(`${dataDir}/bumpers.json`,   'utf8'));
const holidays  = JSON.parse(readFileSync(`${dataDir}/holidays.json`,  'utf8')).dates || {};

// Same holidays.json et_scraper.py and data.ts read — checked at build time,
// so this reflects the holiday if the site is deployed on that day.
function todayHolidayName() {
  const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const dateStr = istNow.getFullYear() + '-' + String(istNow.getMonth() + 1).padStart(2, '0') + '-' + String(istNow.getDate()).padStart(2, '0');
  return holidays[dateStr] || null;
}

function holidayNoticeHtml() {
  const name = todayHolidayName();
  if (!name) return '';
  return '<p><strong>Today is ' + e(name) + '</strong> — Kerala Lottery Dept does not hold a draw today, so there is no new result to publish. Regular daily results resume tomorrow.</p>';
}

const SITE     = 'https://keralaticketresults.in';
const OG_IMAGE = `${SITE}/opengraph.jpg`;

// Tamil lottery names + weekdays (mirrors TamilResultSection.tsx)
const TAMIL_NAMES = {
  karunya:           'கருண்யா',
  'karunya-plus':    'கருண்யா பிளஸ்',
  'sthree-sakthi':   'ஸ்ரீ சக்தி',
  dhanalekshmi:      'தனலட்சுமி',
  bhagyathara:       'பாக்யதாரா',
  samrudhi:          'சம்ருத்தி',
  'suvarna-keralam': 'சுவர்ண கேரளம்',
  bumper:            'பம்பர்',
};
const TAMIL_DAYS = {
  Monday: 'திங்கள்கிழமை', Tuesday: 'செவ்வாய்கிழமை', Wednesday: 'புதன்கிழமை',
  Thursday: 'வியாழன்கிழமை', Friday: 'வெள்ளிக்கிழமை', Saturday: 'சனிக்கிழமை', Sunday: 'ஞாயிற்றுக்கிழமை',
};

// Every non-English locale the site publishes under /<locale>/, besides
// English itself. Shared by hreflang generation and the noindex-stub logic
// below — every locale route gets both, English keeps its existing rules.
const ALT_LOCALES = ['ta', 'ml', 'hi', 'kn'];

const MALAYALAM_NAMES = {
  karunya:           'കാരുണ്യ',
  'karunya-plus':    'കാരുണ്യ പ്ലസ്',
  'sthree-sakthi':   'സ്ത്രീ ശക്തി',
  bhagyathara:       'ഭാഗ്യതാര',
  dhanalekshmi:      'ധനലക്ഷ്മി',
  'suvarna-keralam': 'സ്വർണ്ണ കേരളം',
  samrudhi:          'സമൃദ്ധി',
  bumper:            'കേരള ബമ്പർ',
};
const HINDI_NAMES = {
  karunya:           'कारुण्य',
  'karunya-plus':    'कारुण्य प्लस',
  'sthree-sakthi':   'स्त्री शक्ति',
  bhagyathara:       'भाग्यतारा',
  dhanalekshmi:      'धनलक्ष्मी',
  'suvarna-keralam': 'स्वर्ण केरलम',
  samrudhi:          'समृद्धि',
  bumper:            'केरल बम्पर',
};
const KANNADA_NAMES = {
  karunya:           'ಕಾರುಣ್ಯ',
  'karunya-plus':    'ಕಾರುಣ್ಯ ಪ್ಲಸ್',
  'sthree-sakthi':   'ಸ್ತ್ರೀ ಶಕ್ತಿ',
  bhagyathara:       'ಭಾಗ್ಯತಾರ',
  dhanalekshmi:      'ಧನಲಕ್ಷ್ಮಿ',
  'suvarna-keralam': 'ಸ್ವರ್ಣ ಕೇರಳ',
  samrudhi:          'ಸಮೃದ್ಧಿ',
  bumper:            'ಕೇರಳ ಬಂಪರ್',
};

// Per-locale title/desc builders for the lottery index and archive routes.
// Given patterns only specified the title; desc is my own construction,
// following the same "drop the other-language name/labels" principle
// already applied to /ta.
const LOCALE_LOTTERY_PATTERN = {
  ml: (name, code, hour) => ({
    title: `${name} ലോട്ടറി ഇന്നത്തെ ഫലം ${code} — ${hour} മണി`,
    desc:  `${name} (${code}) ലോട്ടറി ഫലം ഇന്ന് ${hour} മണിക്ക് — ഏറ്റവും പുതിയ ഫലം ഇവിടെ.`,
  }),
  hi: (name, code, hour) => ({
    title: `${name} लॉटरी आज का परिणाम ${code} — ${hour} बजे`,
    desc:  `${name} (${code}) लॉटरी परिणाम आज ${hour} बजे — ताज़ा परिणाम यहाँ।`,
  }),
  kn: (name, code, hour) => ({
    title: `${name} ಲಾಟರಿ ಇಂದಿನ ಫಲಿತಾಂಶ ${code} — ${hour} ಗಂಟೆ`,
    desc:  `${name} (${code}) ಲಾಟರಿ ಫಲಿತಾಂಶ ಇಂದು ${hour} ಗಂಟೆಗೆ — ಇತ್ತೀಚಿನ ಫಲಿತಾಂಶ ಇಲ್ಲಿ.`,
  }),
};
const LOCALE_ARCHIVE_PATTERN = {
  ml: (name, drawCode, displayDate, firstP, district) => ({
    title: `${name} ${drawCode} ലോട്ടറി ഫലം ${displayDate}`,
    desc:  `${name} ${drawCode} ലോട്ടറി ഫലം ${displayDate} — ഒന്നാം സമ്മാനം ${firstP}${district ? `, ${district}` : ''}. പൂർണ്ണ സമ്മാന പട്ടിക.`,
  }),
  hi: (name, drawCode, displayDate, firstP, district) => ({
    title: `${name} ${drawCode} लॉटरी परिणाम ${displayDate}`,
    desc:  `${name} ${drawCode} लॉटरी परिणाम ${displayDate} — पहला पुरस्कार ${firstP}${district ? `, ${district}` : ''}। पूरी पुरस्कार सूची।`,
  }),
  kn: (name, drawCode, displayDate, firstP, district) => ({
    title: `${name} ${drawCode} ಲಾಟರಿ ಫಲಿತಾಂಶ ${displayDate}`,
    desc:  `${name} ${drawCode} ಲಾಟರಿ ಫಲಿತಾಂಶ ${displayDate} — ಮೊದಲ ಬಹುಮಾನ ${firstP}${district ? `, ${district}` : ''}. ಸಂಪೂರ್ಣ ಬಹುಮಾನ ಪಟ್ಟಿ.`,
  }),
};

// lotteries.json's drawTime is always "2:00 PM" or "3:00 PM" — just the
// hour digit, matching the literal "3 மணி"/"3 മണി" style given for these
// locales (unlike /ta, which kept "3:00").
function localeHour(drawTime) {
  return drawTime.split(':')[0];
}

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
  const tName      = TAMIL_NAMES[lottery.slug] ?? lottery.name;
  const tDay       = TAMIL_DAYS[lottery.drawDay] ?? lottery.drawDay;

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
  <section lang="ta">
    <h2>${e(tName)} லாட்டரி ரிசல்ட் — தமிழில்</h2>
    <p>${isPending ? `கேரளா ${e(tName)} லாட்டரி இன்றைய முடிவு இன்னும் வெளியிடப்படவில்லை — மதியம் 3 மணிக்குப் பிறகு பாருங்கள்.` : `இன்றைய ${e(tName)} லாட்டரி முதல் பரிசு எண்: ${e(firstPrize)}. முழு பரிசு அட்டவணையை மேலே பாருங்கள்.`}</p>
    <p>கேரளா ${e(tName)} லாட்டரி (${e(lottery.code)}) ஒவ்வொரு ${e(tDay)}யும் மதியம் 3:00 மணிக்கு நடத்தப்படுகிறது.</p>
    <p>Searching for ${e(tName)} lottery mudivugal, innathe ${e(result.drawCode)} lottari result, or the kulukkal (draw) outcome? You're on the right page — the result above is updated the moment it's announced.</p>
  </section>
  <p><em>This page is published by Kerala Ticket Results (keralaticketresults.in), an independent informational website 
     not affiliated with the Kerala Government.</em></p>
</main>`.trim();
}

// ── Static routes ─────────────────────────────────────────
function buildChartContent() {
  const sorted = [...results].sort(
    (a, b) => (b.drawDate || '').localeCompare(a.drawDate || '') || (b.lastUpdated || '').localeCompare(a.lastUpdated || '')
  );
  const rows = sorted.slice(0, 150).map(r => {
    const lottery = lotteries.find(l => l.slug === r.lotterySlug);
    const fp = getFirstPrize(r);
    const dist = getDistrict(r.prizes?.find(p => p.tier === '1st Prize')?.numbers?.[0]);
    const href = `/results/${r.lotterySlug}/${String(r.drawCode || '').toLowerCase()}`;
    return `<tr><td>${e(r.displayDate || r.drawDate)}</td><td>${e(lottery?.name || r.lotterySlug)} (${e(r.drawCode)})</td><td>${e(fp)}${dist ? ` (${e(dist)})` : ''}</td><td><a href="${ea(href)}">View result</a></td></tr>`;
  }).join('');
  return `<main>
    <h1>Kerala Lottery Chart — All Results</h1>
    <p>Every Kerala lottery result at a glance: the 1st prize for each daily draw — Karunya (KR), Sthree Sakthi (SS), Dhanalekshmi (DL), Bhagyathara (BT), Karunya Plus (KN), Suvarna Keralam (SK), Samrudhi (SM) and bumper draws — newest first. கேரளா லாட்டரி சார்ட் — தினசரி லாட்டரி முடிவுகள் ஒரே பக்கத்தில். Updated daily at 3:00 PM IST.</p>
    <table class="table"><thead><tr><th>Date</th><th>Lottery</th><th>1st Prize</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table>
  </main>`;
}

function buildBumperContent() {
  const up = bumpers?.upcoming;
  const past = [...results]
    .filter(r => r.lotterySlug === 'bumper')
    .sort((a, b) => (b.drawDate || '').localeCompare(a.drawDate || '') || (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
  // Same Event schema as BumperPage.tsx's <JsonLd>, embedded directly in the
  // prerendered content (not via the route.jsonLd/<head> mechanism) so it
  // ships as a script tag inside <div id="root"> itself.
  let eventJsonLd = '';
  if (up) {
    const eventData = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: up.name + ' (' + up.code + ')',
      startDate: up.drawDateISO,
      location: { '@type': 'Place', name: up.venue },
      description: up.name + ' (' + up.code + ') — first prize ' + up.firstPrize + ', ticket price ' + up.ticketPrice + '.',
    };
    eventJsonLd = '<script type="application/ld+json">' + JSON.stringify(eventData) + '</script>';
  }
  const upHtml = up ? `<h2>Next Bumper: ${e(up.name)} (${e(up.code)})</h2>
    <p><strong>${e(up.drawDateLabel)}</strong> at ${e(up.drawTime)}. First prize <strong>${e(up.firstPrize)}</strong>. Ticket price ${e(up.ticketPrice)}. Series ${e(up.series)}. Draw held at ${e(up.venue)}.</p>` : '';
  const rows = past.map(r => {
    const fp = getFirstPrize(r);
    const dist = getDistrict(r.prizes?.find(p => p.tier === '1st Prize')?.numbers?.[0]);
    const href = `/results/bumper/${String(r.drawCode || '').toLowerCase()}`;
    return `<tr><td>${e(r.displayDate || r.drawDate)}</td><td>Kerala Bumper (${e(r.drawCode)})</td><td>${e(fp)}${dist ? ` (${e(dist)})` : ''}</td><td><a href="${ea(href)}">View result</a></td></tr>`;
  }).join('');
  return `<main>
    ${eventJsonLd}
    <h1>Kerala Bumper Lottery — Next Draw Date &amp; Results</h1>
    <p>Kerala's seasonal bumper lotteries carry the year's biggest prizes (up to ₹12 crore): the Summer, Vishu, Monsoon, Thiruvonam (Onam), Pooja and Christmas–New Year bumpers. கேரளா பம்பர் லாட்டரி அடுத்த தேதி மற்றும் முடிவுகள்.</p>
    ${upHtml}
    <h2>Past Bumper Results</h2>
    <table class="table"><thead><tr><th>Date</th><th>Draw</th><th>1st Prize</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table>
  </main>`;
}

function buildYesterdayContent() {
  const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const y = new Date(istNow); y.setDate(y.getDate() - 1);
  const targetYmd = `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;
  const nonBumper = results.filter(r => r.lotterySlug !== 'bumper');
  const result = nonBumper.find(r => r.drawDate === targetYmd)
    ?? [...nonBumper].filter(r => r.drawDate < targetYmd).sort((a,b)=> (b.drawDate||'').localeCompare(a.drawDate||''))[0];
  // Same BreadcrumbList shape as DrawArchivePage.tsx's <JsonLd>, embedded
  // directly in the prerendered content (not via the route.jsonLd/<head>
  // mechanism) — same approach buildBumperContent() uses for its Event
  // schema. Static/non-locale-aware, same as that Event schema too; the
  // live React page (YesterdayResultPage.tsx) renders the language-aware
  // version via t() once hydrated.
  const breadcrumbJsonLd = '<script type="application/ld+json">' + JSON.stringify(breadcrumbSchema([
    { name: 'Home', url: `${SITE}/` },
    { name: "Yesterday's Result", url: `${SITE}/yesterday-result` },
  ])) + '</script>';
  if (!result) {
    return `<main>
    ${breadcrumbJsonLd}
    <h1>Kerala Lottery Result Yesterday</h1><p>Yesterday's result will be published here shortly after the 3 PM draw.</p></main>`;
  }
  const lottery = lotteries.find(l => l.slug === result.lotterySlug);
  const fp = getFirstPrize(result);
  const dist = getDistrict(result.prizes?.find(p => p.tier === '1st Prize')?.numbers?.[0]);
  const rows = (result.prizes || []).map(p => {
    const nums = (p.numbers || []).map(n => `${getTicket(n)}${getDistrict(n) ? ` (${getDistrict(n)})` : ''}`).join(', ');
    return `<tr><td>${e(p.tier)}${p.amount ? ` (${e(p.amount)})` : ''}</td><td>${e(nums)}</td></tr>`;
  }).join('');
  return `<main>
    ${breadcrumbJsonLd}
    <h1>Kerala Lottery Result Yesterday</h1>
    <p>The full result of yesterday's Kerala lottery draw — all prize tiers, updated automatically. நேற்றைய கேரளா லாட்டரி முடிவு — அனைத்து பரிசு விவரங்களும்.</p>
    <h2>${e(lottery?.name || result.lotterySlug)} — ${e(result.displayDate)} (${e(result.drawCode)})</h2>
    <p>First prize: <strong>${e(fp)}</strong>${dist ? ` (${e(dist)})` : ''}</p>
    <table class="table"><thead><tr><th>Prize</th><th>Winning Number(s)</th></tr></thead><tbody>${rows}</tbody></table>
  </main>`;
}

function buildScheduleFaqItems() {
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];
  const daily = lotteries.filter(l => !l.isBumper);
  const ordered = weekOrder.map(idx => daily.find(l => l.drawDayIndex === idx)).filter(Boolean);
  const up = bumpers?.upcoming;
  const items = [
    {
      question: 'Weekly Draw Schedule',
      answer: ordered.map(l => `${l.name} draws every ${l.drawDay} at ${l.drawTime}`).join('; ')
        + '. All draws are held daily at 3:00 PM IST (Gorky Bhavan, Thiruvananthapuram) except bumper special draws.',
    },
  ];
  if (up) {
    items.push({
      question: `${up.name} (${up.code})`,
      answer: `${up.drawDateLabel} at ${up.drawTime}. First prize ${up.firstPrize}.`,
    });
  }
  return items;
}

function buildScheduleContent() {
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];
  const daily = lotteries.filter(l => !l.isBumper);
  const rows = weekOrder.map(idx => daily.find(l => l.drawDayIndex === idx)).filter(Boolean).map(l => {
    const tDay = TAMIL_DAYS[l.drawDay] ?? l.drawDay;
    return `<tr><td>${e(l.drawDay)} (${e(tDay)})</td><td>${e(l.name)}</td><td>${e(l.code)}</td><td>${e(l.drawTime)}</td><td>${e(l.firstPrizeAmount)}</td></tr>`;
  }).join('');
  const up = bumpers?.upcoming;
  const upHtml = up ? `<h2>Special Draw: ${e(up.name)} (${e(up.code)})</h2><p><strong>${e(up.drawDateLabel)}</strong> at ${e(up.drawTime)}, first prize ${e(up.firstPrize)}.</p>` : '';
  return `<main>
    <h1>Kerala Lottery Weekly Schedule</h1>
    <p>Every Kerala lottery draw day and time in one table. கேரளா லாட்டரி வார அட்டவணை — ஒவ்வொரு நாளும் எந்த லாட்டரி, எத்தனை மணிக்கு.</p>
    <table class="table"><thead><tr><th>Day</th><th>Lottery</th><th>Code</th><th>Draw Time</th><th>1st Prize</th></tr></thead><tbody>${rows}</tbody></table>
    ${upHtml}
  </main>`;
}

function buildJackpotContent() {
  const daily = lotteries.filter(l => !l.isBumper);
  const dailyRows = daily.map(l => `<tr><td>${e(l.name)}</td><td>${e(l.code)}</td><td>${e(l.drawDay)}</td><td>${e(l.firstPrizeAmount)}</td></tr>`).join('');
  const winners = [...results]
    .filter(r => r.lotterySlug !== 'bumper' && (r.status === 'verified' || r.status === 'live'))
    .sort((a, b) => (b.drawDate || '').localeCompare(a.drawDate || '') || (b.lastUpdated || '').localeCompare(a.lastUpdated || ''))
    .slice(0, 8);
  const winnerRows = winners.map(r => {
    const lottery = lotteries.find(l => l.slug === r.lotterySlug);
    const fp = getFirstPrize(r);
    const dist = getDistrict(r.prizes?.find(p => p.tier === '1st Prize')?.numbers?.[0]);
    const href = `/results/${r.lotterySlug}/${String(r.drawCode || '').toLowerCase()}`;
    return `<tr><td>${e(r.displayDate || r.drawDate)}</td><td>${e(lottery?.name || r.lotterySlug)} (${e(r.drawCode)})</td><td>${e(fp)}${dist ? ` (${e(dist)})` : ''}</td><td><a href="${ea(href)}">View result</a></td></tr>`;
  }).join('');
  const up = bumpers?.upcoming;
  const upHtml = up ? `<h2>Biggest Jackpot: ${e(up.name)} (${e(up.code)}) — ${e(up.firstPrize)}</h2><p><strong>${e(up.drawDateLabel)}</strong> at ${e(up.drawTime)}.</p>` : '';
  return `<main>
    <h1>Kerala Lottery Jackpot</h1>
    <p>Today's ₹1 Crore daily jackpot and the next bumper draw's top prize, plus recent jackpot winners. கேரளா லாட்டரி ஜாக்பாட் — இன்றைய 1 கோடி முதல் பரிசு மற்றும் பம்பர் ஜாக்பாட்.</p>
    ${upHtml}
    <h2>Today's Daily Jackpot — ₹1 Crore First Prize</h2>
    <table class="table"><thead><tr><th>Lottery</th><th>Code</th><th>Draw Day</th><th>Jackpot</th></tr></thead><tbody>${dailyRows}</tbody></table>
    <h2>Recent Jackpot Winners</h2>
    <table class="table"><thead><tr><th>Date</th><th>Draw</th><th>1st Prize Winner</th><th>Result</th></tr></thead><tbody>${winnerRows}</tbody></table>
  </main>`;
}

// Mirrors ClaimPrizePage.tsx's TIERS/DOCS-derived FAQ exactly.
const CLAIM_PRIZE_FAQ = [
  {
    question: '1. Select your prize amount',
    answer: 'Up to ₹5,000: claim at any authorised Kerala lottery agent, 30 days from the draw date. No TDS deducted. '
      + '₹5,001 – ₹1,00,000: claim at your District Lottery Office, 30 days from the draw date. 30% TDS + surcharge deducted before payment. '
      + 'Above ₹1,00,000: claim at the Directorate of Kerala State Lotteries, Thiruvananthapuram, in person, 30 days from the draw date. 30% TDS + surcharge applies.',
  },
  {
    question: '2. Documents to bring',
    answer: 'Original winning ticket, signed on the back, Aadhaar card, PAN card (mandatory for prizes above ₹10,000), '
      + 'two recent passport-size photographs, Bank passbook or a cancelled cheque, for prize transfer.',
  },
  {
    question: '3. Verify before you travel',
    answer: "Always cross-check your ticket number, draw code, and date against the official result before visiting an office. "
      + "Verify at statelottery.kerala.gov.in or your draw's result page on this site.",
  },
];

function buildClaimPrizeContent() {
  return `<main>
    <h1>Claim Your Kerala Lottery Prize</h1>
    <p>Find the right claim location, deadline, and required documents for your Kerala lottery prize amount. உங்கள் பரிசுத் தொகையைத் தேர்ந்தெடுத்து, எங்கு செல்ல வேண்டும் என்பதைப் பாருங்கள்.</p>
    <table class="table"><thead><tr><th>Prize Amount</th><th>Claim Location</th><th>Deadline</th></tr></thead><tbody>
      <tr><td>Up to ₹5,000</td><td>Any authorised Kerala lottery agent</td><td>30 days from the draw date</td></tr>
      <tr><td>₹5,001 – ₹1,00,000</td><td>Your District Lottery Office</td><td>30 days from the draw date</td></tr>
      <tr><td>Above ₹1,00,000</td><td>Directorate of Kerala State Lotteries, Thiruvananthapuram</td><td>30 days from the draw date</td></tr>
    </tbody></table>
    <h2>Documents to bring</h2>
    <ul>
      <li>Original winning ticket, signed on the back</li>
      <li>Aadhaar card</li>
      <li>PAN card (mandatory for prizes above ₹10,000)</li>
      <li>Two recent passport-size photographs</li>
      <li>Bank passbook or a cancelled cheque, for prize transfer</li>
    </ul>
    <p>Always verify your winning numbers at <a href="https://statelottery.kerala.gov.in">statelottery.kerala.gov.in</a> before making any claim.</p>
  </main>`;
}

// Mirrors data.ts's getSeriesFrequency() / getSiteHotNumbers() so the static
// HTML Google indexes matches what the live React page renders.
function getSeriesFrequencyStatic() {
  const map = new Map();
  for (const r of results) {
    if (r.status !== 'verified') continue;
    const first = r.prizes?.find(p => p.tier === '1st Prize');
    const num = first?.numbers?.[0];
    if (!num) continue;
    const ticket = getTicket(num) || '';
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
      map.set(series, { series, wins: 1, lastWonDate: r.drawDate, lastWonDisplayDate: r.displayDate, lastWonDrawCode: r.drawCode });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.wins - a.wins || a.series.localeCompare(b.series));
}

function getSiteHotNumbersStatic(topN = 5) {
  const recent = [...results]
    .filter(r => r.status === 'verified' || r.status === 'live')
    .sort((a, b) => (b.drawDate || '').localeCompare(a.drawDate || '') || (b.lastUpdated || '').localeCompare(a.lastUpdated || ''))
    .slice(0, 30);
  const freq = {};
  for (const r of recent) {
    for (const prize of (r.prizes || [])) {
      for (const num of (prize.numbers || [])) {
        const digits = (getTicket(num) || '').replace(/\D/g, '');
        if (digits.length < 4) continue;
        const last4 = digits.slice(-4);
        freq[last4] = (freq[last4] || 0) + 1;
      }
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([number, count]) => ({ number, count }));
}

function buildGuessingContent() {
  const seriesStats = getSeriesFrequencyStatic();
  const hotNumbers = getSiteHotNumbersStatic(5);
  const seriesRows = seriesStats.map(s =>
    `<tr><td>${e(s.series)}</td><td>${s.wins}</td><td>${e(s.lastWonDisplayDate)}</td><td>${e(s.lastWonDrawCode)}</td></tr>`
  ).join('');
  const hotRows = hotNumbers.map(h => `<li>${e(h.number)} — appeared ${h.count} times</li>`).join('');
  return `<main>
    <h1>Kerala Lottery Guessing Numbers Today</h1>
    <p>Today's Kerala lottery guessing numbers including A, B, C board values and all 4-digit combinations. கேரளா லாட்டரி இன்றைய கணிப்பு எண்கள். For entertainment purposes only — not guaranteed winning numbers.</p>
    <h2>Series Frequency — 1st Prize Wins</h2>
    <p>How many times each 2-letter series has won 1st Prize across all verified draws.</p>
    <table class="table"><thead><tr><th>Series</th><th>Wins</th><th>Last Won Date</th><th>Last Won Draw Code</th></tr></thead><tbody>${seriesRows}</tbody></table>
    <h2>Hot Numbers — Last 30 Draws</h2>
    <p>The 5 most frequent last-4-digit endings across every prize tier, from the most recent 30 draws.</p>
    <ul>${hotRows}</ul>
  </main>`;
}

// ── Tamil (/ta) route generation ───────────────────────────
// Builds the Tamil counterpart of an English route: same content by
// default, with the path prefixed /ta (no forced trailing slash, matching
// every other route on the site), <html lang="ta">, a Tamil-primary
// title/desc when supplied, and — for content that already has an <h1> —
// swaps just the H1 to a Tamil-primary heading, leaving the rest of the
// page (already bilingual) untouched.
function tamilResultH1(tName, drawCode, displayDate) {
  return `${e(tName)} ${e(drawCode)} லாட்டரி முடிவு — ${e(displayDate)}`;
}

// lotteries.json stores drawTime as "3:00 PM" / "2:00 PM" — fine mixed into
// bilingual English strings, but "PM" has no business in a Tamil-only
// title/desc. Kerala's daily draws are always in the afternoon, so "மணி"
// alone (as the rest of the site's Tamil copy already does, e.g. "மதியம்
// 3:00 மணி") reads naturally without it.
function tamilTime(drawTime) {
  return drawTime.replace(/\s*(AM|PM)$/i, '');
}

// Generalized version of the /ta pattern above — builds the counterpart of
// an English route under any locale prefix (/ta, /ml, /hi, /kn): same
// content by default, path prefixed /<locale> (no forced trailing slash),
// <html lang="<locale>">, a locale-primary title/desc when supplied, and —
// for content that already has an <h1> — swaps just the H1, leaving the
// rest of the page untouched.
function makeLocaleRoute(route, locale, overrides = {}) {
  const localePath = route.path === '/' ? `/${locale}` : `/${locale}${route.path}`;
  let content = overrides.content ?? route.content;
  if (!overrides.content && overrides.h1 && content) {
    content = content.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${overrides.h1}</h1>`);
  }
  return {
    ...route,
    path: localePath,
    lang: locale,
    enPath: route.path,
    title: overrides.title ?? route.title,
    desc: overrides.desc ?? route.desc,
    canonical: `${SITE}${localePath}`,
    content,
  };
}

// Kept for the existing /ta call sites below — same function, 'ta' fixed.
function makeTamilRoute(route, overrides = {}) {
  return makeLocaleRoute(route, 'ta', overrides);
}

const staticRoutes = [
  { path: '/schedule', title: 'Kerala Lottery Schedule 2026 — Daily Draw Times',
    desc: 'Full Kerala lottery weekly schedule — which lottery draws on which day at 3 PM IST.',
    jsonLd: [faqSchema(buildScheduleFaqItems())],
    content: buildScheduleContent() },
  { path: '/jackpot', title: 'Kerala Lottery Jackpot Result Today — 1st Prize',
    desc: "Today's Kerala lottery jackpot (1st prize) numbers for all draws. Updated at 3 PM IST daily.",
    content: buildJackpotContent() },
  { path: '/claim-prize', title: 'How to Claim Kerala Lottery Prize — Guide',
    desc: 'Step by step guide to claiming your Kerala lottery prize. Claim within 30 days. Documents needed, office locations and process explained.',
    jsonLd: [faqSchema(CLAIM_PRIZE_FAQ)],
    content: buildClaimPrizeContent() },
  { path: '/yesterday-result', title: 'Kerala Lottery Result Yesterday — All Prizes',
    desc: "Yesterday's Kerala lottery result with complete prize list from 1st prize to consolation. Updated daily.",
    content: buildYesterdayContent() },
  { path: '/bumper', title: 'Kerala Bumper Lottery 2026 — Next Draw Date & Results',
    desc: 'Next Kerala bumper lottery draw date, prize structure and past results. Updated the moment results are announced.',
    content: buildBumperContent() },
  { path: '/chart', title: 'Kerala Lottery Chart 2026 — All Results',
    desc: 'Kerala lottery chart showing 1st prize for every draw — Karunya, Bhagyathara, Sthree Sakthi and all daily lotteries. Newest first.',
    content: buildChartContent() },
  { path: '/', title: 'Kerala Lottery Result Today — Live 3PM Results',
    desc: 'Kerala Lottery results today at 3 PM IST — Karunya, Bhagyathara, Sthree Sakthi, Dhanalekshmi, Karunya Plus, Suvarna Keralam, Samrudhi. Updated the moment results are announced.',
    jsonLd: [breadcrumbSchema([{ name: 'Home', url: `${SITE}/` }])],
    content: `<main><h1>கேரளா லாட்டரி ரிசல்ட் டுடே — கேரளா ரிசல்ட் இன்று — Kerala Lottery Result Today</h1>${holidayNoticeHtml()}<p>இன்று மதியம் 3:00 மணி கேரளா லாட்டரி ரிசல்ட் இங்கே புதுப்பிக்கப்படும். Kerala Lottery results published daily at 3:00 PM IST — Karunya (KR), Sthree Sakthi (SS), Dhanalekshmi (DL), Bhagyathara (BT), Karunya Plus (KN), Suvarna Keralam (SK) and Samrudhi (SM). கேரளா ரிசல்ட், Innathe lottari result, kulukkal mudivugal — all here the moment each draw is announced.</p></main>` },
  { path: '/check-ticket', title: 'Check Kerala Lottery Ticket Number — Instant Result Lookup',
    desc: 'Check if your Kerala lottery ticket number is a winner. Enter your full ticket or last 4 digits to search across all recent draws instantly.',
    content: `<main><h1>Kerala Lottery Ticket Checker</h1><p>Enter your ticket number to check if it matches any winning number across recent Kerala lottery draws. You can enter the full ticket (e.g. RR 281074), 6-digit number, or last 4 digits.</p></main>` },
  { path: '/guessing-numbers', title: 'Kerala Lottery Guessing Numbers Today',
    desc: 'Today Kerala lottery guessing numbers. A B C board numbers, series frequency and hot numbers for all lotteries. For entertainment only.',
    content: buildGuessingContent() },
  { path: '/guessing-numbers/archive', title: 'Kerala Lottery Guessing Numbers — Past Days',
    desc: 'Past days\' Kerala lottery guessing numbers — A B C boards and Hot Pick, day by day. For entertainment only.',
    content: `<main><h1>Kerala Lottery Guessing Numbers — Past Days</h1><p>Browse past days' A, B, C board guessing numbers and Hot Picks for Kerala lottery. கடந்த நாட்களின் கணிப்பு எண்கள். For entertainment purposes only.</p></main>` },
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

for (const r of staticRoutes) { r.enPath = r.path; r.lang = r.lang || 'en'; }

// Tamil overrides for staticRoutes, in the exact same order as staticRoutes
// above. Title and desc are Tamil-only (no English portion) so Google
// treats each /ta page as meaningfully distinct from its English
// counterpart rather than a near-duplicate. Brand names/domains/emails
// (Kerala Ticket Results, keralaticketresults.in) are kept as-is — they're
// identifiers, not translatable content.
const STATIC_TA_OVERRIDES = [
  { // /schedule
    title: 'கேரளா லாட்டரி வார அட்டவணை — நாள் மற்றும் நேரம்',
    desc: 'கேரளா லாட்டரி அட்டவணை, இன்று 3:00 மணி முடிவு. கருண்யா, பாக்யதாரா, சம்ருத்தி மற்றும் பலவற்றின் வார நாள் மற்றும் நேரம்.',
    h1: 'கேரளா லாட்டரி வார அட்டவணை',
  },
  { // /jackpot
    title: 'கேரளா லாட்டரி ஜாக்பாட் — இன்று ₹1 கோடி மற்றும் பம்பர் பரிசு',
    desc: 'கேரளா லாட்டரி ஜாக்பாட் இன்று — ₹1 கோடி தினசரி முதல் பரிசு மற்றும் அடுத்த பம்பர் லாட்டரியின் மிகப்பெரிய பரிசு, சமீபத்திய ஜாக்பாட் வெற்றியாளர்களுடன்.',
    h1: 'கேரளா லாட்டரி ஜாக்பாட்',
  },
  { // /claim-prize
    title: 'பரிசு பெறுவது எப்படி — கேரளா லாட்டரி',
    desc: 'பரிசு பெறுவது எப்படி — கேரளா லாட்டரி. உங்கள் பரிசுத் தொகைக்கு ஏற்ற இடம் மற்றும் கடைசி தேதியைக் கண்டறியவும்.',
    h1: 'உங்கள் கேரளா லாட்டரி பரிசைப் பெறுங்கள்',
  },
  { // /yesterday-result
    title: 'நேற்றைய லாட்டரி முடிவு — அனைத்து பரிசுகளும்',
    desc: 'நேற்றைய கேரளா லாட்டரி முடிவு, முழு பரிசு விவரங்கள், முதல் பரிசு முதல் கடைசி பரிசு வரை.',
    h1: 'நேற்றைய கேரளா லாட்டரி முடிவு',
  },
  { // /bumper
    title: 'கேரளா பம்பர் லாட்டரி — அடுத்த திருப்பு தேதி மற்றும் முடிவுகள்',
    desc: 'கேரளா அடுத்த பம்பர் லாட்டரி தேதி மற்றும் முடிவுகள், முதல் பரிசு மற்றும் டிக்கெட் விலை உட்பட, கடந்த பம்பர் முடிவுகளுடன்.',
    h1: 'கேரளா பம்பர் லாட்டரி — அடுத்த திருப்பு தேதி மற்றும் முடிவுகள்',
  },
  { // /chart
    title: 'கேரளா லாட்டரி சார்ட் 2026 — அனைத்து முடிவுகள்',
    desc: 'கேரளா லாட்டரி சார்ட், இன்று 3:00 மணி முடிவுகள் — ஒவ்வொரு தினசரி டிராவின் முதல் பரிசு, புதியது முதலில்.',
    h1: 'கேரளா லாட்டரி சார்ட் — அனைத்து முடிவுகள்',
  },
  { // / (home)
    title: 'கேரளா லாட்டரி ரிசல்ட் இன்று — 3:00 மணி முடிவு | இன்றைய கேரளா லாட்டரி',
    desc: 'கேரளா லாட்டரி ரிசல்ட் இன்று 3:00 மணி — கருண்யா, பாக்யதாரா, ஸ்ரீ சக்தி, தனலட்சுமி, கருண்யா பிளஸ், சுவர்ண கேரளம் மற்றும் பல லாட்டரிகளின் முடிவுகள் இங்கே.',
  },
  { // /check-ticket
    title: 'கேரளா லாட்டரி டிக்கெட் எண் சரிபார்ப்பு',
    desc: 'உங்கள் கேரளா லாட்டரி டிக்கெட் எண் வெற்றி பெற்றதா எனச் சரிபார்க்கவும். முழு டிக்கெட், 6 இலக்க எண் அல்லது கடைசி 4 இலக்கங்களை உள்ளிடலாம்.',
    content: `<main><h1>கேரளா லாட்டரி டிக்கெட் சரிபார்ப்பு</h1><p>உங்கள் டிக்கெட் எண்ணை உள்ளிட்டு, சமீபத்திய கேரளா லாட்டரி முடிவுகளில் வெற்றி பெற்றதா எனச் சரிபார்க்கவும். முழு டிக்கெட், 6 இலக்க எண் அல்லது கடைசி 4 இலக்கங்களை உள்ளிடலாம்.</p></main>`,
  },
  { // /guessing-numbers
    title: 'கேரளா லாட்டரி இன்றைய கணிப்பு எண்கள்',
    desc: 'கேரளா லாட்டரி இன்றைய கணிப்பு எண்கள். A B C போர்டு எண்கள், தொடர் அதிர்வெண் மற்றும் ஹாட் நம்பர்கள். வெறும் பொழுதுபோக்கிற்காக மட்டும்.',
    h1: 'கேரளா லாட்டரி இன்றைய கணிப்பு எண்கள்',
  },
  { // /guessing-numbers/archive
    title: 'கடந்த நாட்களின் கணிப்பு எண்கள்',
    desc: 'கடந்த நாட்களின் கணிப்பு எண்கள். A, B, C போர்டுகள் மற்றும் ஹாட் பிக், நாள் வாரியாக. வெறும் பொழுதுபோக்கிற்காக மட்டும்.',
    content: `<main><h1>கேரளா லாட்டரி கணிப்பு எண்கள் — கடந்த நாட்கள்</h1><p>கேரளா லாட்டரியின் கடந்த நாட்களின் A, B, C போர்டு கணிப்பு எண்கள் மற்றும் ஹாட் பிக்குகளை பார்வையிடுங்கள். வெறும் பொழுதுபோக்கிற்காக மட்டும்.</p></main>`,
  },
  { // /claim-guide
    title: 'கேரளா லாட்டரி பரிசு பெறும் வழிமுறை',
    desc: 'கேரளா லாட்டரி பரிசு பெறுவது எப்படி — தமிழ்நாடு வசிப்பவர்களுக்கும் வழிகாட்டி.',
    content: `<main><h1>கேரளா லாட்டரி பரிசு பெறும் வழிமுறை</h1><p>கேரளா லாட்டரி பரிசுகளைப் பெறுவதற்கான முழுமையான வழிகாட்டி. ₹5,000 வரையிலான பரிசுகளை அங்கீகரிக்கப்பட்ட லாட்டரி முகவரிடம் பெறலாம். ₹5,001 முதல் ₹1,00,000 வரையிலான பரிசுகளை மாவட்ட லாட்டரி அலுவலகத்தில் பெற வேண்டும். ₹1,00,000-க்கு மேற்பட்ட பரிசுகளை திருவனந்தபுரம் கேரளா மாநில லாட்டரி இயக்குநரகத்தில் பெற வேண்டும். அனைத்து பரிசுகளும் 30 நாட்களுக்குள் பெறப்பட வேண்டும்.</p></main>`,
  },
  { // /faq
    title: 'கேரளா லாட்டரி கேள்வி பதில்கள்',
    desc: 'கேரளா லாட்டரி முடிவுகள், டிக்கெட் சரிபார்ப்பு, பரிசு பெறுதல் மற்றும் வரி பற்றிய பொதுவான கேள்விகளுக்கான பதில்கள்.',
    content: `<main><h1>கேரளா லாட்டரி கேள்வி பதில்கள்</h1><p>கேரளா லாட்டரி முடிவுகள், டிக்கெட் சரிபார்ப்பு, பரிசு பெறுதல் மற்றும் வெற்றித் தொகைக்கான வரி குறித்த பொதுவான கேள்விகள்.</p></main>`,
  },
  { // /lottery-offices
    title: 'கேரளா லாட்டரி மாவட்ட அலுவலகங்கள் — முகவரி மற்றும் தொடர்பு எண்கள்',
    desc: 'அனைத்து 14 கேரளா மாவட்ட லாட்டரி அலுவலகங்களின் முகவரி, தொலைபேசி எண் மற்றும் வேலை நேரம்.',
    content: `<main><h1>கேரளா லாட்டரி மாவட்ட அலுவலகங்கள்</h1><p>அனைத்து 14 கேரளா மாவட்ட லாட்டரி அலுவலகங்களின் விவரப்பட்டியல். ₹1,00,000-க்கு மேற்பட்ட பரிசுகளுக்கு திருவனந்தபுரம் விகாஸ் பவனில் உள்ள கேரளா மாநில லாட்டரி இயக்குநரகத்தை 0471-2305193 என்ற எண்ணில் தொடர்பு கொள்ளவும்.</p></main>`,
  },
  { // /about
    title: 'Kerala Ticket Results பற்றி',
    desc: 'keralaticketresults.in பற்றி — கேரளா லாட்டரி முடிவுகளை வழங்கும் சுயாதீன தளம்.',
    content: `<main><h1>Kerala Ticket Results பற்றி</h1><p>Kerala Ticket Results (keralaticketresults.in) என்பது கேரளா லாட்டரி முடிவுகளை தினமும் வழங்கும் ஒரு சுயாதீன தகவல் வலைத்தளம்.</p></main>`,
  },
  { // /contact
    title: 'எங்களை தொடர்பு கொள்ளுங்கள்',
    desc: 'Kerala Ticket Results-ஐ தொடர்பு கொள்ளுங்கள்.',
    content: `<main><h1>எங்களை தொடர்பு கொள்ளுங்கள்</h1><p>Kerala Ticket Results-ஐ support@keralaticketresults.in என்ற மின்னஞ்சலில் தொடர்பு கொள்ளவும்.</p></main>`,
  },
  { // /disclaimer
    title: 'மறுப்பு அறிக்கை',
    desc: 'keralaticketresults.in-க்கான மறுப்பு அறிக்கை.',
    content: `<main><h1>மறுப்பு அறிக்கை</h1><p>Kerala Ticket Results கேரளா அரசு அல்லது கேரளா மாநில லாட்டரி இயக்குநரகத்துடன் தொடர்பு இல்லாத ஒரு தளம்.</p></main>`,
  },
  { // /privacy-policy
    title: 'தனியுரிமைக் கொள்கை',
    desc: 'keralaticketresults.in-க்கான தனியுரிமைக் கொள்கை.',
    content: `<main><h1>தனியுரிமைக் கொள்கை</h1></main>`,
  },
  { // /terms
    title: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
    desc: 'keralaticketresults.in-க்கான விதிமுறைகள்.',
    content: `<main><h1>விதிமுறைகள் மற்றும் நிபந்தனைகள்</h1></main>`,
  },
  { // /lottery-offices (duplicate simpler entry in staticRoutes)
    title: 'கேரளா லாட்டரி அலுவலகங்கள்',
    desc: 'மாவட்ட லாட்டரி அலுவலகங்கள்.',
    content: `<main><h1>கேரளா லாட்டரி அலுவலகங்கள்</h1></main>`,
  },
  { // /download-forms
    title: 'கேரளா லாட்டரி பரிசு கோரல் படிவங்கள்',
    desc: 'கேரளா லாட்டரி கோரல் படிவங்களைப் பதிவிறக்கவும்.',
    content: `<main><h1>கேரளா லாட்டரி படிவங்களைப் பதிவிறக்கு</h1></main>`,
  },
];

const staticRoutesTa = staticRoutes.map((r, i) => makeTamilRoute(r, STATIC_TA_OVERRIDES[i] || {}));

// Malayalam overrides for staticRoutes, same order and same "no other
// language mixed in" principle as STATIC_TA_OVERRIDES. Only the homepage
// text was given explicitly by the request; the rest are straightforward
// translations of the same short, formulaic phrases and are worth a native
// speaker's review before this ships.
const STATIC_ML_OVERRIDES = [
  { title: 'കേരള ലോട്ടറി ഷെഡ്യൂൾ 2026 — ദിവസവും സമയവും',
    desc: 'ഏത് ലോട്ടറി ഏത് ദിവസം, ഏത് സമയത്ത് നടക്കുന്നു എന്നറിയാൻ കേരള ലോട്ടറിയുടെ ആഴ്ചയിലെ പൂർണ്ണ ഷെഡ്യൂൾ.',
    h1: 'കേരള ലോട്ടറി ഷെഡ്യൂൾ' },
  { title: 'കേരള ലോട്ടറി ജാക്ക്‌പോട്ട് ഫലം ഇന്ന് — ഒന്നാം സമ്മാനം',
    desc: 'എല്ലാ ലോട്ടറികളുടെയും ഇന്നത്തെ ഒന്നാം സമ്മാന നമ്പറുകൾ, ഉച്ചയ്ക്ക് 3 മണിക്ക് പ്രസിദ്ധീകരിക്കുന്നു.',
    h1: 'കേരള ലോട്ടറി ജാക്ക്‌പോട്ട്' },
  { title: 'കേരള ലോട്ടറി സമ്മാനം നേടുന്ന വിധം — ഗൈഡ്',
    desc: 'കേരള ലോട്ടറി സമ്മാനം നേടാനുള്ള ഘട്ടം ഘട്ടമായുള്ള മാർഗ്ഗനിർദ്ദേശം. 30 ദിവസത്തിനകം ക്ലെയിം ചെയ്യണം.',
    h1: 'കേരള ലോട്ടറി സമ്മാനം നേടുന്ന വിധം' },
  { title: 'ഇന്നലെയുള്ള കേരള ലോട്ടറി ഫലം — എല്ലാ സമ്മാനങ്ങളും',
    desc: 'ഇന്നലെയുള്ള കേരള ലോട്ടറി ഫലം, ഒന്നാം സമ്മാനം മുതൽ അവസാന സമ്മാനം വരെ.',
    h1: 'ഇന്നലെയുള്ള കേരള ലോട്ടറി ഫലം' },
  { title: 'കേരള ബമ്പർ ലോട്ടറി 2026 — അടുത്ത നറുക്കെടുപ്പും ഫലങ്ങളും',
    desc: 'അടുത്ത കേരള ബമ്പർ ലോട്ടറി തീയതി, സമ്മാന ഘടന, മുൻകാല ഫലങ്ങൾ.',
    h1: 'കേരള ബമ്പർ ലോട്ടറി' },
  { title: 'കേരള ലോട്ടറി ചാർട്ട് 2026 — എല്ലാ ഫലങ്ങളും',
    desc: 'എല്ലാ ദിവസത്തെയും ലോട്ടറി ഒന്നാം സമ്മാനം ഒരു നോട്ടത്തിൽ, ഏറ്റവും പുതിയത് ആദ്യം.',
    h1: 'കേരള ലോട്ടറി ചാർട്ട്' },
  { title: 'കേരള ലോട്ടറി ഫലം ഇന്ന് — ഉച്ചയ്ക്ക് 3 മണി',
    desc: 'ഇന്ന് ഉച്ചയ്ക്ക് 3 മണിക്ക് കേരള ലോട്ടറി ഫലം — കാരുണ്യ, ഭാഗ്യതാര, സ്ത്രീ ശക്തി, ധനലക്ഷ്മി, കാരുണ്യ പ്ലസ്, സ്വർണ്ണ കേരളം, സമൃദ്ധി.' },
  { title: 'കേരള ലോട്ടറി ടിക്കറ്റ് നമ്പർ പരിശോധന',
    desc: 'നിങ്ങളുടെ ടിക്കറ്റ് നമ്പർ വിജയിച്ചോ എന്ന് പരിശോധിക്കുക.',
    content: `<main><h1>കേരള ലോട്ടറി ടിക്കറ്റ് പരിശോധന</h1><p>നിങ്ങളുടെ ടിക്കറ്റ് നമ്പർ നൽകി, സമീപകാല കേരള ലോട്ടറി ഫലങ്ങളിൽ വിജയിച്ചോ എന്ന് പരിശോധിക്കുക.</p></main>` },
  { title: 'കേരള ലോട്ടറി ഇന്നത്തെ ഗസ്സിംഗ് നമ്പറുകൾ',
    desc: 'A B C ബോർഡ് നമ്പറുകൾ, വിനോദത്തിന് മാത്രം.',
    h1: 'കേരള ലോട്ടറി ഇന്നത്തെ ഗസ്സിംഗ് നമ്പറുകൾ' },
  { title: 'കഴിഞ്ഞ ദിവസങ്ങളിലെ ഗസ്സിംഗ് നമ്പറുകൾ',
    desc: 'മുൻകാല ദിവസങ്ങളിലെ A B C ബോർഡ് നമ്പറുകൾ, വിനോദത്തിന് മാത്രം.',
    content: `<main><h1>കഴിഞ്ഞ ദിവസങ്ങളിലെ ഗസ്സിംഗ് നമ്പറുകൾ</h1><p>കേരള ലോട്ടറിയുടെ മുൻകാല ദിവസങ്ങളിലെ A, B, C ബോർഡ് നമ്പറുകൾ കാണുക. വിനോദത്തിന് മാത്രം.</p></main>` },
  { title: 'കേരള ലോട്ടറി സമ്മാനം നേടുന്ന വിധം',
    desc: 'രേഖകൾ, സമയപരിധി, നടപടിക്രമം എന്നിവയെക്കുറിച്ചുള്ള പൂർണ്ണ വിവരണം.',
    content: `<main><h1>കേരള ലോട്ടറി സമ്മാനം നേടുന്ന വിധം</h1><p>ആവശ്യമായ രേഖകൾ, 30 ദിവസത്തെ സമയപരിധി, നടപടിക്രമം എന്നിവയെക്കുറിച്ചുള്ള പൂർണ്ണ വിവരണം.</p></main>` },
  { title: 'കേരള ലോട്ടറി പതിവ് ചോദ്യങ്ങൾ',
    desc: 'ഫലം, ടിക്കറ്റ് പരിശോധന, സമ്മാനം നേടൽ എന്നിവയെക്കുറിച്ചുള്ള പൊതുവായ ചോദ്യങ്ങൾ.',
    content: `<main><h1>കേരള ലോട്ടറി പതിവ് ചോദ്യങ്ങൾ</h1><p>ഫലം, ടിക്കറ്റ് പരിശോധന, സമ്മാനം നേടൽ, നികുതി എന്നിവയെക്കുറിച്ചുള്ള പൊതുവായ ചോദ്യങ്ങൾ.</p></main>` },
  { title: 'കേരള ലോട്ടറി ജില്ലാ ഓഫീസുകൾ — വിലാസവും ഫോൺ നമ്പറും',
    desc: '14 ജില്ലാ ലോട്ടറി ഓഫീസുകളുടെ വിലാസം, ഫോൺ നമ്പർ, പ്രവർത്തന സമയം.',
    content: `<main><h1>കേരള ലോട്ടറി ജില്ലാ ഓഫീസുകൾ</h1><p>14 ജില്ലാ ലോട്ടറി ഓഫീസുകളുടെ വിവരപ്പട്ടിക. ₹1,00,000-ൽ കൂടുതലുള്ള സമ്മാനങ്ങൾക്ക് തിരുവനന്തപുരം വികാസ് ഭവനിലെ കേരള സംസ്ഥാന ലോട്ടറി ഡയറക്ടറേറ്റിനെ 0471-2305193 എന്ന നമ്പറിൽ ബന്ധപ്പെടുക.</p></main>` },
  { title: 'Kerala Ticket Results-നെക്കുറിച്ച്',
    desc: 'keralaticketresults.in — കേരള ലോട്ടറി ഫലങ്ങൾ നൽകുന്ന സ്വതന്ത്ര വെബ്സൈറ്റ്.',
    content: `<main><h1>Kerala Ticket Results-നെക്കുറിച്ച്</h1><p>Kerala Ticket Results (keralaticketresults.in) കേരള ലോട്ടറി ഫലങ്ങൾ ദിവസവും നൽകുന്ന ഒരു സ്വതന്ത്ര വിവര വെബ്സൈറ്റാണ്.</p></main>` },
  { title: 'ഞങ്ങളെ ബന്ധപ്പെടുക',
    desc: 'Kerala Ticket Results-നെ ബന്ധപ്പെടുക.',
    content: `<main><h1>ഞങ്ങളെ ബന്ധപ്പെടുക</h1><p>Kerala Ticket Results-നെ support@keralaticketresults.in എന്ന ഇമെയിലിൽ ബന്ധപ്പെടുക.</p></main>` },
  { title: 'നിരാകരണം',
    desc: 'keralaticketresults.in-ന്റെ നിരാകരണം.',
    content: `<main><h1>നിരാകരണം</h1><p>Kerala Ticket Results കേരള സർക്കാരുമായോ കേരള സംസ്ഥാന ലോട്ടറി ഡയറക്ടറേറ്റുമായോ ബന്ധമില്ലാത്ത ഒരു വെബ്സൈറ്റാണ്.</p></main>` },
  { title: 'സ്വകാര്യതാ നയം',
    desc: 'keralaticketresults.in-ന്റെ സ്വകാര്യതാ നയം.',
    content: `<main><h1>സ്വകാര്യതാ നയം</h1></main>` },
  { title: 'നിബന്ധനകളും വ്യവസ്ഥകളും',
    desc: 'keralaticketresults.in-ന്റെ നിബന്ധനകൾ.',
    content: `<main><h1>നിബന്ധനകളും വ്യവസ്ഥകളും</h1></main>` },
  { title: 'കേരള ലോട്ടറി ഓഫീസുകൾ',
    desc: 'ജില്ലാ ലോട്ടറി ഓഫീസുകൾ.',
    content: `<main><h1>കേരള ലോട്ടറി ഓഫീസുകൾ</h1></main>` },
  { title: 'കേരള ലോട്ടറി ഫോമുകൾ ഡൗൺലോഡ്',
    desc: 'സമ്മാന ക്ലെയിം ഫോമുകൾ ഡൗൺലോഡ് ചെയ്യുക.',
    content: `<main><h1>കേരള ലോട്ടറി ഫോമുകൾ ഡൗൺലോഡ്</h1></main>` },
];
const staticRoutesMl = staticRoutes.map((r, i) => makeLocaleRoute(r, 'ml', STATIC_ML_OVERRIDES[i] || {}));

// Hindi overrides — same order, same principle. As with Malayalam above,
// only the homepage text came from the request; the rest are my own
// straightforward translations worth a native speaker's review.
const STATIC_HI_OVERRIDES = [
  { title: 'केरल लॉटरी शेड्यूल 2026 — दैनिक ड्रॉ समय',
    desc: 'कौन सी लॉटरी किस दिन, किस समय आती है — पूरी साप्ताहिक अनुसूची।',
    h1: 'केरल लॉटरी शेड्यूल' },
  { title: 'केरल लॉटरी जैकपॉट परिणाम आज — पहला पुरस्कार',
    desc: 'सभी लॉटरी के आज के पहले पुरस्कार नंबर, दोपहर 3 बजे प्रकाशित।',
    h1: 'केरल लॉटरी जैकपॉट' },
  { title: 'केरल लॉटरी पुरस्कार कैसे प्राप्त करें — गाइड',
    desc: 'पुरस्कार पाने की पूरी प्रक्रिया, चरण दर चरण। 30 दिनों के भीतर दावा करें।',
    h1: 'केरल लॉटरी पुरस्कार कैसे प्राप्त करें' },
  { title: 'केरल लॉटरी परिणाम कल का — सभी पुरस्कार',
    desc: 'कल के केरल लॉटरी परिणाम, पहले पुरस्कार से अंतिम पुरस्कार तक।',
    h1: 'केरल लॉटरी परिणाम कल का' },
  { title: 'केरल बम्पर लॉटरी 2026 — अगली ड्रॉ तिथि और परिणाम',
    desc: 'अगली केरल बम्पर लॉटरी की तिथि, पुरस्कार संरचना और पिछले परिणाम।',
    h1: 'केरल बम्पर लॉटरी' },
  { title: 'केरल लॉटरी चार्ट 2026 — सभी परिणाम',
    desc: 'हर दिन की लॉटरी का पहला पुरस्कार एक नज़र में, नवीनतम पहले।',
    h1: 'केरल लॉटरी चार्ट' },
  { title: 'केरल लॉटरी परिणाम आज — दोपहर 3 बजे लाइव',
    desc: 'आज दोपहर 3 बजे केरल लॉटरी परिणाम — कारुण्य, भाग्यतारा, स्त्री शक्ति, धनलक्ष्मी, कारुण्य प्लस, स्वर्ण केरलम, समृद्धि।' },
  { title: 'केरल लॉटरी टिकट नंबर जांच',
    desc: 'अपना टिकट नंबर डालकर जांचें कि आप जीते हैं या नहीं।',
    content: `<main><h1>केरल लॉटरी टिकट जांच</h1><p>अपना टिकट नंबर डालकर हाल के केरल लॉटरी परिणामों में जीत की जांच करें।</p></main>` },
  { title: 'केरल लॉटरी आज की अनुमान संख्या',
    desc: 'A B C बोर्ड नंबर, केवल मनोरंजन के लिए।',
    h1: 'केरल लॉटरी आज की अनुमान संख्या' },
  { title: 'पिछले दिनों की अनुमान संख्या',
    desc: 'पिछले दिनों के A B C बोर्ड नंबर, केवल मनोरंजन के लिए।',
    content: `<main><h1>पिछले दिनों की अनुमान संख्या</h1><p>केरल लॉटरी के पिछले दिनों के A, B, C बोर्ड नंबर देखें। केवल मनोरंजन के लिए।</p></main>` },
  { title: 'केरल लॉटरी पुरस्कार कैसे प्राप्त करें',
    desc: 'आवश्यक दस्तावेज़, समय सीमा और पूरी प्रक्रिया की जानकारी।',
    content: `<main><h1>केरल लॉटरी पुरस्कार कैसे प्राप्त करें</h1><p>आवश्यक दस्तावेज़, 30 दिनों की समय सीमा और पूरी प्रक्रिया की जानकारी।</p></main>` },
  { title: 'केरल लॉटरी सामान्य प्रश्न',
    desc: 'परिणाम, टिकट जांच और पुरस्कार दावे से जुड़े सामान्य सवालों के जवाब।',
    content: `<main><h1>केरल लॉटरी सामान्य प्रश्न</h1><p>परिणाम, टिकट जांच, पुरस्कार दावे और कर से जुड़े सामान्य सवालों के जवाब।</p></main>` },
  { title: 'केरल लॉटरी जिला कार्यालय — पता और फ़ोन नंबर',
    desc: 'सभी 14 जिला लॉटरी कार्यालयों के पते, फ़ोन नंबर और कार्य समय।',
    content: `<main><h1>केरल लॉटरी जिला कार्यालय</h1><p>सभी 14 जिला लॉटरी कार्यालयों की सूची। ₹1,00,000 से अधिक के पुरस्कारों के लिए तिरुवनंतपुरम के विकास भवन में केरल राज्य लॉटरी निदेशालय से 0471-2305193 पर संपर्क करें।</p></main>` },
  { title: 'Kerala Ticket Results के बारे में',
    desc: 'keralaticketresults.in — केरल लॉटरी परिणाम देने वाली स्वतंत्र वेबसाइट।',
    content: `<main><h1>Kerala Ticket Results के बारे में</h1><p>Kerala Ticket Results (keralaticketresults.in) रोज़ाना केरल लॉटरी परिणाम देने वाली एक स्वतंत्र सूचना वेबसाइट है।</p></main>` },
  { title: 'संपर्क करें',
    desc: 'Kerala Ticket Results से संपर्क करें।',
    content: `<main><h1>संपर्क करें</h1><p>Kerala Ticket Results से support@keralaticketresults.in पर संपर्क करें।</p></main>` },
  { title: 'अस्वीकरण',
    desc: 'keralaticketresults.in का अस्वीकरण।',
    content: `<main><h1>अस्वीकरण</h1><p>Kerala Ticket Results केरल सरकार या केरल राज्य लॉटरी निदेशालय से संबद्ध नहीं है।</p></main>` },
  { title: 'गोपनीयता नीति',
    desc: 'keralaticketresults.in की गोपनीयता नीति।',
    content: `<main><h1>गोपनीयता नीति</h1></main>` },
  { title: 'नियम और शर्तें',
    desc: 'keralaticketresults.in के नियम।',
    content: `<main><h1>नियम और शर्तें</h1></main>` },
  { title: 'केरल लॉटरी कार्यालय',
    desc: 'जिला लॉटरी कार्यालय।',
    content: `<main><h1>केरल लॉटरी कार्यालय</h1></main>` },
  { title: 'केरल लॉटरी फॉर्म डाउनलोड करें',
    desc: 'पुरस्कार दावा फॉर्म डाउनलोड करें।',
    content: `<main><h1>केरल लॉटरी फॉर्म डाउनलोड करें</h1></main>` },
];
const staticRoutesHi = staticRoutes.map((r, i) => makeLocaleRoute(r, 'hi', STATIC_HI_OVERRIDES[i] || {}));

// Kannada overrides — same order, same principle. As with the other two
// languages, only the homepage text came from the request.
const STATIC_KN_OVERRIDES = [
  { title: 'ಕೇರಳ ಲಾಟರಿ ವೇಳಾಪಟ್ಟಿ 2026 — ದಿನ ಮತ್ತು ಸಮಯ',
    desc: 'ಯಾವ ಲಾಟರಿ ಯಾವ ದಿನ, ಎಷ್ಟು ಗಂಟೆಗೆ — ವಾರದ ಸಂಪೂರ್ಣ ವೇಳಾಪಟ್ಟಿ.',
    h1: 'ಕೇರಳ ಲಾಟರಿ ವೇಳಾಪಟ್ಟಿ' },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಜಾಕ್‌ಪಾಟ್ ಫಲಿತಾಂಶ ಇಂದು — ಮೊದಲ ಬಹುಮಾನ',
    desc: 'ಎಲ್ಲಾ ಲಾಟರಿಗಳ ಇಂದಿನ ಮೊದಲ ಬಹುಮಾನ ಸಂಖ್ಯೆಗಳು, ಮಧ್ಯಾಹ್ನ 3 ಗಂಟೆಗೆ ಪ್ರಕಟ.',
    h1: 'ಕೇರಳ ಲಾಟರಿ ಜಾಕ್‌ಪಾಟ್' },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಬಹುಮಾನ ಪಡೆಯುವ ವಿಧಾನ — ಗೈಡ್',
    desc: 'ಬಹುಮಾನ ಪಡೆಯುವ ಹಂತ ಹಂತದ ಮಾರ್ಗದರ್ಶಿ. 30 ದಿನಗಳಲ್ಲಿ ಪಡೆಯಬೇಕು.',
    h1: 'ಕೇರಳ ಲಾಟರಿ ಬಹುಮಾನ ಪಡೆಯುವ ವಿಧಾನ' },
  { title: 'ನಿನ್ನೆಯ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶ — ಎಲ್ಲಾ ಬಹುಮಾನಗಳು',
    desc: 'ನಿನ್ನೆಯ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶ, ಮೊದಲ ಬಹುಮಾನದಿಂದ ಕೊನೆಯ ಬಹುಮಾನದವರೆಗೆ.',
    h1: 'ನಿನ್ನೆಯ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶ' },
  { title: 'ಕೇರಳ ಬಂಪರ್ ಲಾಟರಿ 2026 — ಮುಂದಿನ ಡ್ರಾ ದಿನಾಂಕ ಮತ್ತು ಫಲಿತಾಂಶಗಳು',
    desc: 'ಮುಂದಿನ ಕೇರಳ ಬಂಪರ್ ಲಾಟರಿ ದಿನಾಂಕ, ಬಹುಮಾನ ರಚನೆ ಮತ್ತು ಹಿಂದಿನ ಫಲಿತಾಂಶಗಳು.',
    h1: 'ಕೇರಳ ಬಂಪರ್ ಲಾಟರಿ' },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಚಾರ್ಟ್ 2026 — ಎಲ್ಲಾ ಫಲಿತಾಂಶಗಳು',
    desc: 'ಪ್ರತಿ ದಿನದ ಲಾಟರಿಯ ಮೊದಲ ಬಹುಮಾನ ಒಂದೇ ನೋಟದಲ್ಲಿ, ಇತ್ತೀಚಿನದು ಮೊದಲು.',
    h1: 'ಕೇರಳ ಲಾಟರಿ ಚಾರ್ಟ್' },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶ ಇಂದು — ಮಧ್ಯಾಹ್ನ 3 ಗಂಟೆ',
    desc: 'ಇಂದು ಮಧ್ಯಾಹ್ನ 3 ಗಂಟೆಗೆ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶ — ಕಾರುಣ್ಯ, ಭಾಗ್ಯತಾರ, ಸ್ತ್ರೀ ಶಕ್ತಿ, ಧನಲಕ್ಷ್ಮಿ, ಕಾರುಣ್ಯ ಪ್ಲಸ್, ಸ್ವರ್ಣ ಕೇರಳ, ಸಮೃದ್ಧಿ.' },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಟಿಕೆಟ್ ಸಂಖ್ಯೆ ಪರಿಶೀಲನೆ',
    desc: 'ನಿಮ್ಮ ಟಿಕೆಟ್ ಸಂಖ್ಯೆ ಗೆದ್ದಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
    content: `<main><h1>ಕೇರಳ ಲಾಟರಿ ಟಿಕೆಟ್ ಪರಿಶೀಲನೆ</h1><p>ನಿಮ್ಮ ಟಿಕೆಟ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ, ಇತ್ತೀಚಿನ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶಗಳಲ್ಲಿ ಗೆದ್ದಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.</p></main>` },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಇಂದಿನ ಅಂದಾಜು ಸಂಖ್ಯೆಗಳು',
    desc: 'A B C ಬೋರ್ಡ್ ಸಂಖ್ಯೆಗಳು, ಮನರಂಜನೆಗಾಗಿ ಮಾತ್ರ.',
    h1: 'ಕೇರಳ ಲಾಟರಿ ಇಂದಿನ ಅಂದಾಜು ಸಂಖ್ಯೆಗಳು' },
  { title: 'ಹಿಂದಿನ ದಿನಗಳ ಅಂದಾಜು ಸಂಖ್ಯೆಗಳು',
    desc: 'ಹಿಂದಿನ ದಿನಗಳ A B C ಬೋರ್ಡ್ ಸಂಖ್ಯೆಗಳು, ಮನರಂಜನೆಗಾಗಿ ಮಾತ್ರ.',
    content: `<main><h1>ಹಿಂದಿನ ದಿನಗಳ ಅಂದಾಜು ಸಂಖ್ಯೆಗಳು</h1><p>ಕೇರಳ ಲಾಟರಿಯ ಹಿಂದಿನ ದಿನಗಳ A, B, C ಬೋರ್ಡ್ ಸಂಖ್ಯೆಗಳನ್ನು ನೋಡಿ. ಮನರಂಜನೆಗಾಗಿ ಮಾತ್ರ.</p></main>` },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಬಹುಮಾನ ಪಡೆಯುವ ವಿಧಾನ',
    desc: 'ಅಗತ್ಯ ದಾಖಲೆಗಳು, ಗಡುವು ಮತ್ತು ಪ್ರಕ್ರಿಯೆಯ ಸಂಪೂರ್ಣ ವಿವರ.',
    content: `<main><h1>ಕೇರಳ ಲಾಟರಿ ಬಹುಮಾನ ಪಡೆಯುವ ವಿಧಾನ</h1><p>ಅಗತ್ಯ ದಾಖಲೆಗಳು, 30 ದಿನಗಳ ಗಡುವು ಮತ್ತು ಪ್ರಕ್ರಿಯೆಯ ಸಂಪೂರ್ಣ ವಿವರ.</p></main>` },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಪ್ರಶ್ನೋತ್ತರಗಳು',
    desc: 'ಫಲಿತಾಂಶ, ಟಿಕೆಟ್ ಪರಿಶೀಲನೆ ಮತ್ತು ಬಹುಮಾನ ಪಡೆಯುವಿಕೆ ಬಗ್ಗೆ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು.',
    content: `<main><h1>ಕೇರಳ ಲಾಟರಿ ಪ್ರಶ್ನೋತ್ತರಗಳು</h1><p>ಫಲಿತಾಂಶ, ಟಿಕೆಟ್ ಪರಿಶೀಲನೆ, ಬಹುಮಾನ ಪಡೆಯುವಿಕೆ ಮತ್ತು ತೆರಿಗೆ ಬಗ್ಗೆ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು.</p></main>` },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಜಿಲ್ಲಾ ಕಚೇರಿಗಳು — ವಿಳಾಸ ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆ',
    desc: 'ಎಲ್ಲಾ 14 ಜಿಲ್ಲಾ ಲಾಟರಿ ಕಚೇರಿಗಳ ವಿಳಾಸ, ಫೋನ್ ಸಂಖ್ಯೆ ಮತ್ತು ಕೆಲಸದ ಸಮಯ.',
    content: `<main><h1>ಕೇರಳ ಲಾಟರಿ ಜಿಲ್ಲಾ ಕಚೇರಿಗಳು</h1><p>ಎಲ್ಲಾ 14 ಜಿಲ್ಲಾ ಲಾಟರಿ ಕಚೇರಿಗಳ ಪಟ್ಟಿ. ₹1,00,000 ಮೀರಿದ ಬಹುಮಾನಗಳಿಗೆ ತಿರುವನಂತಪುರಂನ ವಿಕಾಸ್ ಭವನದಲ್ಲಿರುವ ಕೇರಳ ರಾಜ್ಯ ಲಾಟರಿ ನಿರ್ದೇಶನಾಲಯವನ್ನು 0471-2305193 ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ.</p></main>` },
  { title: 'Kerala Ticket Results ಬಗ್ಗೆ',
    desc: 'keralaticketresults.in — ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶಗಳನ್ನು ನೀಡುವ ಸ್ವತಂತ್ರ ವೆಬ್‌ಸೈಟ್.',
    content: `<main><h1>Kerala Ticket Results ಬಗ್ಗೆ</h1><p>Kerala Ticket Results (keralaticketresults.in) ಪ್ರತಿದಿನ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶಗಳನ್ನು ನೀಡುವ ಸ್ವತಂತ್ರ ಮಾಹಿತಿ ವೆಬ್‌ಸೈಟ್ ಆಗಿದೆ.</p></main>` },
  { title: 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
    desc: 'Kerala Ticket Results ಅನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    content: `<main><h1>ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ</h1><p>Kerala Ticket Results ಅನ್ನು support@keralaticketresults.in ಇಮೇಲ್‌ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ.</p></main>` },
  { title: 'ಹೊಣೆಗಾರಿಕೆ ನಿರಾಕರಣೆ',
    desc: 'keralaticketresults.in ನ ಹೊಣೆಗಾರಿಕೆ ನಿರಾಕರಣೆ.',
    content: `<main><h1>ಹೊಣೆಗಾರಿಕೆ ನಿರಾಕರಣೆ</h1><p>Kerala Ticket Results ಕೇರಳ ಸರ್ಕಾರ ಅಥವಾ ಕೇರಳ ರಾಜ್ಯ ಲಾಟರಿ ನಿರ್ದೇಶನಾಲಯದೊಂದಿಗೆ ಸಂಬಂಧ ಹೊಂದಿಲ್ಲ.</p></main>` },
  { title: 'ಗೌಪ್ಯತೆ ನೀತಿ',
    desc: 'keralaticketresults.in ನ ಗೌಪ್ಯತೆ ನೀತಿ.',
    content: `<main><h1>ಗೌಪ್ಯತೆ ನೀತಿ</h1></main>` },
  { title: 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು',
    desc: 'keralaticketresults.in ನ ನಿಯಮಗಳು.',
    content: `<main><h1>ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು</h1></main>` },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಕಚೇರಿಗಳು',
    desc: 'ಜಿಲ್ಲಾ ಲಾಟರಿ ಕಚೇರಿಗಳು.',
    content: `<main><h1>ಕೇರಳ ಲಾಟರಿ ಕಚೇರಿಗಳು</h1></main>` },
  { title: 'ಕೇರಳ ಲಾಟರಿ ಫಾರ್ಮ್‌ಗಳ ಡೌನ್‌ಲೋಡ್',
    desc: 'ಬಹುಮಾನ ಕ್ಲೈಮ್ ಫಾರ್ಮ್‌ಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.',
    content: `<main><h1>ಕೇರಳ ಲಾಟರಿ ಫಾರ್ಮ್‌ಗಳ ಡೌನ್‌ಲೋಡ್</h1></main>` },
];
const staticRoutesKn = staticRoutes.map((r, i) => makeLocaleRoute(r, 'kn', STATIC_KN_OVERRIDES[i] || {}));

// English title/desc compact time (e.g. "3:00 PM" -> "3PM"), matching the
// requested "— 3PM Live" style while staying correct for bumper (2PM, not 3).
function compactAmPm(drawTime) {
  const hour = drawTime.split(':')[0];
  const ampm = (drawTime.match(/AM|PM/i) || [''])[0].toUpperCase();
  return `${hour}${ampm}`;
}

// ── Dynamic lottery index routes ──────────────────────────
// English routes are English-only (no Tamil) — Tamil lives exclusively on
// the /ta counterpart below, so Google sees two genuinely distinct pages
// instead of a bilingual near-duplicate of a Tamil-only one.
const lotteryRoutePairs = lotteries.map(l => {
  const result  = getResultForSlug(l.slug);
  const firstP  = getFirstPrize(result);
  const tName   = TAMIL_NAMES[l.slug] ?? l.name;
  const tDay    = TAMIL_DAYS[l.drawDay] ?? l.drawDay;
  const enPath  = `/results/${l.slug}`;
  const en = {
    path:    enPath,
    title:   `${l.name} Lottery Result Today ${l.code} — ${compactAmPm(l.drawTime)} Live`,
    desc:    `${l.name} (${l.code}) Kerala lottery result today — 1st Prize: ${firstP}. Draw every ${l.drawDay} at ${l.drawTime}. Updated the moment results are announced.`,
    canonical: `${SITE}${enPath}`,
    enPath,
    lang: 'en',
    jsonLd: [breadcrumbSchema([
      { name: 'Home', url: `${SITE}/` },
      { name: `${l.name} Result`, url: `${SITE}${enPath}` },
    ])],
    content:  buildResultContent(l, result),
  };
  // Tamil pattern uses the lottery's own drawTime (2:00 for bumper, 3:00
  // for daily draws) rather than a hardcoded "3:00 மணி" — bumper doesn't
  // draw at 3 PM, and a wrong time on the page is worse than a fixed string.
  const taTitle = `${tName} லாட்டரி இன்றைய முடிவு ${l.code} — ${tamilTime(l.drawTime)} மணி`;
  const taDesc  = `இன்று ${tamilTime(l.drawTime)} மணி ${tName} லாட்டரி முடிவு — ${l.code} டிராவ் கோட், ஒவ்வொரு ${tDay}யும் நடத்தப்படுகிறது. புதுப்பிக்கப்பட்ட முடிவுகள் இங்கே.`;
  const ta = makeTamilRoute(en, {
    title: taTitle,
    desc: taDesc,
    ...(result ? { h1: tamilResultH1(tName, result.drawCode, result.displayDate) } : {}),
  });
  const hour = localeHour(l.drawTime);
  const mlName = MALAYALAM_NAMES[l.slug] ?? l.name;
  const hiName = HINDI_NAMES[l.slug] ?? l.name;
  const knName = KANNADA_NAMES[l.slug] ?? l.name;
  const ml = makeLocaleRoute(en, 'ml', { ...LOCALE_LOTTERY_PATTERN.ml(mlName, l.code, hour), ...(result ? { h1: LOCALE_LOTTERY_PATTERN.ml(mlName, l.code, hour).title } : {}) });
  const hi = makeLocaleRoute(en, 'hi', { ...LOCALE_LOTTERY_PATTERN.hi(hiName, l.code, hour), ...(result ? { h1: LOCALE_LOTTERY_PATTERN.hi(hiName, l.code, hour).title } : {}) });
  const kn = makeLocaleRoute(en, 'kn', { ...LOCALE_LOTTERY_PATTERN.kn(knName, l.code, hour), ...(result ? { h1: LOCALE_LOTTERY_PATTERN.kn(knName, l.code, hour).title } : {}) });
  return { en, ta, ml, hi, kn };
});
const lotteryRoutes   = lotteryRoutePairs.map(p => p.en);
const lotteryRoutesTa = lotteryRoutePairs.map(p => p.ta);
const lotteryRoutesMl = lotteryRoutePairs.map(p => p.ml);
const lotteryRoutesHi = lotteryRoutePairs.map(p => p.hi);
const lotteryRoutesKn = lotteryRoutePairs.map(p => p.kn);

// ── Archive routes ────────────────────────────────────────
// English routes are English-only — Tamil lives exclusively on the /ta
// counterpart below.
const archiveRoutePairs = results.map(r => {
  const lottery = getLottery(r.lotterySlug);
  if (!lottery) return null;
  // Skip pending results with no prize data — don't create empty pages for Google
  const hasData = r.prizes && r.prizes.some(p => p.numbers && p.numbers.length > 0);
  if (r.status === 'pending' && !hasData) return null;
  const drawCodeLower = r.drawCode.toLowerCase().replace(/\s+/g,'-');
  const firstP  = getFirstPrize(r);
  const district= getDistrict(r.prizes?.find(p=>p.tier==='1st Prize')?.numbers?.[0]);
  const tName   = TAMIL_NAMES[lottery.slug] ?? lottery.name;
  const enPath  = `/results/${r.lotterySlug}/${drawCodeLower}`;
  const en = {
    path:     enPath,
    title:    `${lottery.name} ${r.drawCode} Result ${r.displayDate}`,
    desc:     `${lottery.name} ${r.drawCode} lottery result ${r.displayDate} — 1st Prize: ${firstP}${district ? `, ${district}` : ''}. Full prize table, all tiers.`,
    canonical:`${SITE}${enPath}`,
    lastmod:  r.lastUpdated,
    enPath,
    lang: 'en',
    content:  buildResultContent(lottery, r),
  };
  const taTitle = `${tName} ${r.drawCode} லாட்டரி முடிவு ${r.displayDate}`;
  const taDesc  = `${tName} ${r.drawCode} லாட்டரி முடிவு ${r.displayDate}, ${tamilTime(lottery.drawTime)} மணி — முதல் பரிசு ${firstP}${district ? `, ${district}` : ''}. புதுப்பிக்கப்பட்ட முடிவுகள்.`;
  const ta = makeTamilRoute(en, {
    title: taTitle,
    desc: taDesc,
    h1: tamilResultH1(tName, r.drawCode, r.displayDate),
  });
  const mlName = MALAYALAM_NAMES[lottery.slug] ?? lottery.name;
  const hiName = HINDI_NAMES[lottery.slug] ?? lottery.name;
  const knName = KANNADA_NAMES[lottery.slug] ?? lottery.name;
  const mlPat = LOCALE_ARCHIVE_PATTERN.ml(mlName, r.drawCode, r.displayDate, firstP, district);
  const hiPat = LOCALE_ARCHIVE_PATTERN.hi(hiName, r.drawCode, r.displayDate, firstP, district);
  const knPat = LOCALE_ARCHIVE_PATTERN.kn(knName, r.drawCode, r.displayDate, firstP, district);
  const ml = makeLocaleRoute(en, 'ml', { ...mlPat, h1: mlPat.title });
  const hi = makeLocaleRoute(en, 'hi', { ...hiPat, h1: hiPat.title });
  const kn = makeLocaleRoute(en, 'kn', { ...knPat, h1: knPat.title });
  return { en, ta, ml, hi, kn };
}).filter(Boolean);
const archiveRoutes   = archiveRoutePairs.map(p => p.en);
const archiveRoutesTa = archiveRoutePairs.map(p => p.ta);
const archiveRoutesMl = archiveRoutePairs.map(p => p.ml);
const archiveRoutesHi = archiveRoutePairs.map(p => p.hi);
const archiveRoutesKn = archiveRoutePairs.map(p => p.kn);


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
// Redirect pages for malformed URLs that Google has already indexed.
// isRedirectStub: true — these are already one-off, self-contained redirect
// pages (the whole point of route.content), so the write loop below skips
// generating an extra auto slash-stub for them (that would just point a
// "/br-109)/" variant back at "/br-109)" itself, which is meaningless here).
const redirectRoutes = [
  {
    path: '/results/bumper/br-109)',
    title: 'Vishu Bumper BR-109 Result — Redirecting',
    desc: 'Kerala Vishu Bumper BR-109 lottery result redirect.',
    canonical: `${SITE}/results/bumper/br-109`,
    isRedirectStub: true,
    content: `<main><h1>Vishu Bumper BR-109 Result</h1><p>Redirecting to correct page...</p><script>window.location.replace('/results/bumper/br-109');</script><a href="/results/bumper/br-109">View BR-109 Result</a></main>`,
  },
];

const allRoutes = [
  ...staticRoutes, ...staticRoutesTa, ...staticRoutesMl, ...staticRoutesHi, ...staticRoutesKn,
  ...redirectRoutes,
  ...lotteryGuessingRoutes,
  ...lotteryRoutes, ...lotteryRoutesTa, ...lotteryRoutesMl, ...lotteryRoutesHi, ...lotteryRoutesKn,
  ...archiveRoutes, ...archiveRoutesTa, ...archiveRoutesMl, ...archiveRoutesHi, ...archiveRoutesKn,
];

// ── Generate HTML ─────────────────────────────────────────
// ── Structured data (schema.org JSON-LD) ───────────────────
// Mirrors JsonLd.tsx's BreadcrumbSchema/FaqSchema shape exactly so the
// static HTML Google indexes matches what the live React page renders.
function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

function makeHtml(route) {
  const canonical = route.canonical || `${SITE}${route.path}`;
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

  // Set <html lang="..."> — 'ta' for /ta pages, 'en' otherwise. Rebuilds
  // the opening tag rather than a targeted replace, so it works regardless
  // of what lang value (if any) baseHtml already carries.
  html = html.replace(/<html([^>]*)>/i, (_full, attrs) => {
    const cleanedAttrs = attrs.replace(/\s*lang="[^"]*"/i, '');
    return `<html${cleanedAttrs} lang="${route.lang || 'en'}">`;
  });

  // Add canonical link — strip any pre-existing one first so builds can
  // never stack up duplicates (e.g. if baseHtml already carries one).
  html = html.replace(/\s*<link rel="canonical"[^>]*>\s*/gi, '\n');
  html = html.replace('</head>', `  <link rel="canonical" href="${canonical}" />\n</head>`);

  // hreflang alternates — only for routes that actually have locale
  // counterparts (enPath is set on staticRoutes/lotteryRoutes/archiveRoutes
  // and their ta/ml/hi/kn versions; redirect/guessing routes are left alone
  // since pointing hreflang at a page that doesn't exist would be wrong).
  if (route.enPath) {
    const enUrl = `${SITE}${route.enPath}`;
    const localeUrl = (loc) => route.enPath === '/' ? `${SITE}/${loc}` : `${SITE}/${loc}${route.enPath}`;
    const hreflangTags = [
      `  <link rel="alternate" hreflang="en" href="${enUrl}" />`,
      ...ALT_LOCALES.map((loc) => `  <link rel="alternate" hreflang="${loc}" href="${localeUrl(loc)}" />`),
      `  <link rel="alternate" hreflang="x-default" href="${enUrl}" />`,
    ].join('\n');
    html = html.replace('</head>', `${hreflangTags}\n</head>`);
  }

  // Inject structured data (schema.org JSON-LD) — one <script> per entry.
  if (route.jsonLd && route.jsonLd.length) {
    const scripts = route.jsonLd
      .map((d) => `  <script type="application/ld+json">${JSON.stringify(d)}</script>`)
      .join('\n');
    html = html.replace('</head>', `${scripts}\n</head>`);
  }

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

// ── Redirect-stub HTML for legacy trailing-slash URLs ─────
// Same lightweight pattern already used for the old br-109) URL: a real,
// crawlable page (not a 404) that immediately sends visitors/Google to the
// canonical no-slash URL.
//
// noindex defaults to true — that's correct for the ENGLISH routes this
// was designed for: Google already had those trailing-slash URLs indexed
// with real accumulated impressions, so we keep the URL alive but tell
// crawlers not to index the (duplicate) slash version. The /ta routes are
// brand new — nothing has ever been indexed at their slash URLs — so
// noindex there just gets Google Search Console flagging a page ("Excluded
// by noindex tag") that never needed excluding in the first place. Pass
// noindex: false for those; the canonical tag alone is enough to tell
// Google this is a duplicate of the no-slash page.
function redirectStubHtml(canonicalUrl, title, { lang = 'en', noindex = true } = {}) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
${noindex ? '<meta name="robots" content="noindex, follow" />\n' : ''}<title>${e(title)}</title>
<link rel="canonical" href="${canonicalUrl}" />
<meta http-equiv="refresh" content="0; url=${canonicalUrl}" />
<script>window.location.replace(${JSON.stringify(canonicalUrl)});</script>
</head>
<body><a href="${canonicalUrl}">Continue to ${e(title)}</a></body>
</html>`;
}

// ── Write files ───────────────────────────────────────────
// Every route is written as a sibling "<path>.html" file, NOT
// "<path>/index.html". GitHub Pages serves an extensionless request for
// "<path>.html" directly (200, no redirect), but a request for a directory
// like "<path>/" containing only index.html gets 301-redirected to add the
// trailing slash. Every canonical tag, the sitemap, and every internal
// <Link> in this app already use the no-slash form — so the old
// dir/index.html layout meant EVERY page had to survive one avoidable
// redirect hop to reach its own canonical URL, which is exactly what
// Search Console's Coverage report was flagging as "Redirect error".
//
// IMPORTANT: we do NOT simply stop writing the old "<path>/index.html".
// Google already has trailing-slash URLs indexed with real accumulated
// impressions — deleting that file outright would turn a working (if
// redirect-flagged) page into a hard 404 overnight, which is far worse
// for rankings than the redirect-error status we're fixing. Instead we
// keep "<path>/index.html" alive, but as a real crawlable redirect stub
// pointing at the new canonical — carrying signal forward instead of
// dropping it.
let written = 0, errors = 0;
for (const route of allRoutes) {
  if (route.path === '/') {
    try {
      writeFileSync(`${distDir}/index.html`, makeHtml(route), 'utf8');
      written++;
    } catch (err) {
      console.error(`❌ ${route.path}: ${err.message}`);
      errors++;
    }
    continue;
  }
  const canonical = route.canonical || `${SITE}${route.path}`;
  const filePath  = `${distDir}${route.path}.html`;
  const slashDir  = `${distDir}${route.path}`;
  try {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, makeHtml(route), 'utf8');
    if (!route.isRedirectStub) {
      // Legacy trailing-slash stub — keeps the old indexed URL alive as a
      // redirect instead of a 404. Locale routes (/ta, /ml, /hi, /kn) have
      // no legacy indexed slash-URL to preserve, so their stub skips noindex.
      mkdirSync(slashDir, { recursive: true });
      writeFileSync(
        `${slashDir}/index.html`,
        redirectStubHtml(canonical, route.title, { lang: route.lang, noindex: !ALT_LOCALES.includes(route.lang) }),
        'utf8'
      );
    }
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
console.log(`   Tamil (/ta): ${staticRoutesTa.length + lotteryRoutesTa.length + archiveRoutesTa.length}`);
console.log(`   Malayalam (/ml): ${staticRoutesMl.length + lotteryRoutesMl.length + archiveRoutesMl.length}`);
console.log(`   Hindi (/hi): ${staticRoutesHi.length + lotteryRoutesHi.length + archiveRoutesHi.length}`);
console.log(`   Kannada (/kn): ${staticRoutesKn.length + lotteryRoutesKn.length + archiveRoutesKn.length}`);
console.log(`\n   Google will now see real prize content on every page.`);
