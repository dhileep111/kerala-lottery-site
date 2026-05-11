export type Lottery = {
  slug: string;
  name: string;
  code: string;
  drawDay: string;
  drawDayIndex: number;
  drawTime: string;
  firstPrizeAmount: string;
};

export type Prize = {
  tier: string;
  amount: string;
  numbers: string[];
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
  prizes: Prize[];
};
