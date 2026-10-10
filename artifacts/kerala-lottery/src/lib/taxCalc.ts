import rates from '../data/prize-tax-constants.json';

// claimLocationThreshold, commissionThreshold, commissionRate, tdsThreshold
// and tdsRate live in src/data/prize-tax-constants.json — the ONE shared
// source for both this file (the live calculator) and prerender.mjs (the
// SEO-crawlable static page), which reads the same file via fs since it's a
// plain Node script and can't import TS. Source comments for each value are
// in that JSON's "sources" field, not duplicated here. Keep both readers in
// sync by never hard-coding these five numbers anywhere else.
//
// commissionRate and tdsRate are stored as plain percentages (10 = 10%),
// not decimals — divide by 100 before using as a multiplier.
//
// claimLocationThreshold and commissionThreshold are both ₹5,000 today, but
// are two deliberately separate values: claimLocationThreshold governs
// WHERE a winner goes to claim (sourced from existing site content);
// commissionThreshold governs WHEN agent commission applies (unverified,
// provisional). Do not merge them — they are not guaranteed to stay
// numerically identical.
export const TAX_CONSTANTS = {
  claimLocationThreshold: rates.claimLocationThreshold,
  commissionThreshold: rates.commissionThreshold,
  commissionRate: rates.commissionRate,
  tdsThreshold: rates.tdsThreshold,
  tdsRate: rates.tdsRate,

  // Cess and surcharge are NOT applied by default — both are assessed by
  // the winner at income-tax filing time based on their total annual
  // income, which this calculator has no way to know. Exposed as toggles
  // only; no rate is hard-coded for surcharge since it is income-slab
  // dependent and asserting one would be misleading.
  cessRate: 0.04, // UNVERIFIED — commonly published Health & Education Cess rate, not repo-sourced. Decimal (not a percentage) — used directly as a multiplier.
  cessAppliedByDefault: false,
  surchargeAppliedByDefault: false,

  deductionOrder: ['agentCommission', 'tds', 'cess', 'surcharge'] as const,
} as const;

export interface TaxBreakdown {
  gross: number;
  agentCommission: number;
  postCommission: number;
  tds: number;
  postTds: number;
  cess: number;
  net: number;
  netPercent: number;
}

export function calculateNetPrize(
  grossPrize: number,
  options: { includeCess?: boolean } = {}
): TaxBreakdown {
  const { includeCess = TAX_CONSTANTS.cessAppliedByDefault } = options;
  const gross = Math.max(0, grossPrize);

  const agentCommission = gross > TAX_CONSTANTS.commissionThreshold
    ? gross * (TAX_CONSTANTS.commissionRate / 100)
    : 0;
  const postCommission = gross - agentCommission;

  const tds = gross > TAX_CONSTANTS.tdsThreshold
    ? postCommission * (TAX_CONSTANTS.tdsRate / 100)
    : 0;
  const postTds = postCommission - tds;

  const cess = includeCess ? tds * TAX_CONSTANTS.cessRate : 0;
  const net = postTds - cess;

  return {
    gross,
    agentCommission,
    postCommission,
    tds,
    postTds,
    cess,
    net,
    netPercent: gross > 0 ? (net / gross) * 100 : 0,
  };
}

export function formatRupees(amount: number): string {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}
