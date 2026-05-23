export type Lottery = {
  slug: string;
  name: string;
  code: string;
  drawDay: string;
  drawDayIndex: number;
  drawTime: string;
  firstPrizeAmount: string;
  isBumper?: boolean;
  claimDays?: number;
};

export type WinningNumber = string | {
  ticket: string;
  district?: string;
  agency?: string;
};

export type Prize = {
  tier: string;
  amount: string;
  numbers: WinningNumber[];
};

export type ResultStatus = 'pending' | 'live' | 'verified';

export type Result = {
  lotterySlug: string;
  drawCode: string;
  drawDate: string;
  displayDate: string;
  status: ResultStatus;
  sourceName: string;
  sourceUrl: string;
  lastUpdated: string;
  pdfUrl?: string;
  imageUrl?: string;
  firstPrizeDistrict?: string;
  totalWinners?: number;
  totalPrizeDistribution?: string;
  summary?: string;
  prizes: Prize[];
};
