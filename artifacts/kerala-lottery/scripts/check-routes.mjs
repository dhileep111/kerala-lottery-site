/**
 * Build-time route integrity validator.
 * Fails with exit code 1 if any malformed slug or drawCode is detected.
 *
 * Checks:
 *  - No leading/trailing whitespace
 *  - No %20 or raw spaces in URL segments
 *  - No double slashes
 *  - No uppercase in slugs or drawCodes used in paths
 *  - drawCode casing is consistent (must be cleanable to same value)
 *  - All lotterySlug values in results exist in lotteries.json
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dir, '../src/data');

function cleanSlug(raw) {
  return raw.trim().toLowerCase().replace(/%20/g, '-').replace(/\s+/g, '-').replace(/\/+/g, '/');
}

function check(label, raw) {
  const cleaned = cleanSlug(raw);
  const issues = [];
  if (raw !== raw.trim())             issues.push('leading/trailing whitespace');
  if (/%20/.test(raw))                issues.push('contains %20');
  if (/\s/.test(raw))                 issues.push('contains raw whitespace');
  if (/\/\//.test(raw))               issues.push('double slash');
  if (raw.toLowerCase() !== raw)      issues.push('uppercase characters');
  if (cleaned !== raw)                issues.push(`should be "${cleaned}"`);
  return issues.map(i => `  ✗ ${label}: ${i}`);
}

const lotteries = JSON.parse(readFileSync(`${dataDir}/lotteries.json`, 'utf8'));
const results   = JSON.parse(readFileSync(`${dataDir}/results.json`,   'utf8'));

const lotterySlugSet = new Set(lotteries.map(l => l.slug));
const errors = [];

// Validate lottery slugs
for (const lottery of lotteries) {
  errors.push(...check(`lotteries[${lottery.name}].slug="${lottery.slug}"`, lottery.slug));
}

// Validate result slugs and drawCodes
for (const result of results) {
  errors.push(...check(`results[${result.drawCode}].lotterySlug`, result.lotterySlug));

  // drawCode used in URL path → must be trim+lowercase clean
  const dcPath = result.drawCode.trim().toLowerCase();
  if (dcPath !== result.drawCode.trim().toLowerCase().replace(/\s+/g, '-')) {
    errors.push(`  ✗ results[${result.drawCode}].drawCode has internal whitespace`);
  }
  if (result.drawCode !== result.drawCode.trim()) {
    errors.push(`  ✗ results[${result.drawCode}].drawCode has leading/trailing whitespace (raw: "${result.drawCode}")`);
  }
  if (/%20/.test(result.drawCode)) {
    errors.push(`  ✗ results[${result.drawCode}].drawCode contains %20`);
  }
  if (/\/\//.test(result.drawCode)) {
    errors.push(`  ✗ results[${result.drawCode}].drawCode has double slash`);
  }

  // Cross-reference: lotterySlug must exist in lotteries.json
  if (!lotterySlugSet.has(result.lotterySlug)) {
    errors.push(`  ✗ results[${result.drawCode}].lotterySlug="${result.lotterySlug}" not found in lotteries.json`);
  }

  // Synthesize the full path and validate it
  const fullPath = `/results/${result.lotterySlug}/${result.drawCode.trim().toLowerCase()}`;
  if (/\s/.test(fullPath) || /%20/.test(fullPath) || /\/\//.test(fullPath)) {
    errors.push(`  ✗ Constructed path is malformed: "${fullPath}"`);
  }
}

if (errors.length === 0) {
  console.log(`✅ Route integrity check passed — ${lotteries.length} lotteries, ${results.length} results, all slugs clean.`);
  process.exit(0);
} else {
  console.error(`\n❌ Route integrity check FAILED — ${errors.length} issue(s) found:\n`);
  errors.forEach(e => console.error(e));
  console.error('\nFix the data files and re-run: pnpm --filter @workspace/kerala-lottery run validate:routes\n');
  process.exit(1);
}
