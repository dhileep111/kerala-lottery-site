import { createContext, useContext } from 'react';
import { useLocation } from 'wouter';

// Kept in sync with prerender.mjs's ALT_LOCALES and generate-full-sitemap.mjs.
export type Lang = 'en' | 'ta' | 'ml' | 'hi' | 'kn';
export const ALT_LOCALES: Lang[] = ['ta', 'ml', 'hi', 'kn'];
export const ALL_LANGS: Lang[] = ['en', ...ALT_LOCALES];

// Language-specific lottery names, keyed by lottery slug — mirrors the
// TAMIL_NAMES/MALAYALAM_NAMES/HINDI_NAMES/KANNADA_NAMES maps in
// prerender.mjs (that's a plain Node script and can't import this file, so
// the mapping is duplicated there deliberately; keep the two in sync).
const LOTTERY_NAMES: Record<Lang, Record<string, string>> = {
  en: {},
  ta: {
    karunya: 'கருண்யா', 'karunya-plus': 'கருண்யா பிளஸ்', 'sthree-sakthi': 'ஸ்ரீ சக்தி',
    dhanalekshmi: 'தனலட்சுமி', bhagyathara: 'பாக்யதாரா', samrudhi: 'சம்ருத்தி',
    'suvarna-keralam': 'சுவர்ண கேரளம்', bumper: 'பம்பர்',
  },
  ml: {
    karunya: 'കാരുണ്യ', 'karunya-plus': 'കാരുണ്യ പ്ലസ്', 'sthree-sakthi': 'സ്ത്രീ ശക്തി',
    dhanalekshmi: 'ധനലക്ഷ്മി', bhagyathara: 'ഭാഗ്യതാര', samrudhi: 'സമൃദ്ധി',
    'suvarna-keralam': 'സ്വർണ്ണ കേരളം', bumper: 'കേരള ബമ്പർ',
  },
  hi: {
    karunya: 'कारुण्य', 'karunya-plus': 'कारुण्य प्लस', 'sthree-sakthi': 'स्त्री शक्ति',
    dhanalekshmi: 'धनलक्ष्मी', bhagyathara: 'भाग्यतारा', samrudhi: 'समृद्धि',
    'suvarna-keralam': 'स्वर्ण केरलम', bumper: 'केरल बम्पर',
  },
  kn: {
    karunya: 'ಕಾರುಣ್ಯ', 'karunya-plus': 'ಕಾರುಣ್ಯ ಪ್ಲಸ್', 'sthree-sakthi': 'ಸ್ತ್ರೀ ಶಕ್ತಿ',
    dhanalekshmi: 'ಧನಲಕ್ಷ್ಮಿ', bhagyathara: 'ಭಾಗ್ಯತಾರ', samrudhi: 'ಸಮೃದ್ಧಿ',
    'suvarna-keralam': 'ಸ್ವರ್ಣ ಕೇರಳ', bumper: 'ಕೇರಳ ಬಂಪರ್',
  },
};

// Returns the display name for a lottery in the active language — the
// English name (from lotteries.json) for 'en', the localized name for
// everything else, falling back to the English name if a slug is missing
// from the map (new lotteries added to lotteries.json before this map is
// updated). This is a display label only — slugs, codes and data fields
// are never touched.
export function getLotteryName(slug: string, englishName: string, lang: Lang): string {
  if (lang === 'en') return englishName;
  return LOTTERY_NAMES[lang]?.[slug] ?? englishName;
}

// UI-only strings — navigation, prize tier names, table headers, status
// labels, common section headings. Lottery DATA (numbers, draw codes,
// dates, ticket text) is never translated — it stays identical across
// every language, only the labels around it change.
export type UIKey =
  | 'home' | 'results' | 'chart' | 'bumper' | 'jackpot' | 'schedule'
  | 'yesterdayResult' | 'checkTicket' | 'claimPrize' | 'contact'
  | 'claimGuide' | 'guessingNumbers' | 'downloadForms' | 'faq' | 'about'
  | 'lotteryOffices' | 'tools' | 'info' | 'moreLotteries' | 'resources'
  | 'bumperResults' | 'ticketChecker' | 'privacyPolicy' | 'aboutDisclaimer'
  | 'fullPrizeTable' | 'prizeTier' | 'winningNumbers' | 'amount'
  | 'pending' | 'completeResult' | 'tiersUpdated' | 'bumperDraw'
  | 'firstPrize' | 'todaysDraw' | 'verificationStatus' | 'notPublishedYet'
  | 'verifiedResult' | 'liveUpdate'
  // ── Common (shared across many pages) ──────────────────────────────
  | 'disclaimer' | 'date' | 'draw' | 'code' | 'lottery' | 'viewArrow'
  | 'today' | 'tomorrow' | 'days' | 'hours' | 'minutes' | 'seconds'
  | 'quickLinks' | 'notFound' | 'officeAnyAgent' | 'officeDistrictOffice'
  | 'officeDirectorateShort' | 'ticketPrice'
  // ── HomePage ─────────────────────────────────────────────────────
  | 'homeH1' | 'homeSubtitle' | 'homeNotice' | 'homeHolidayNotice'
  | 'homeDrawsEvery' | 'homeAt' | 'homeNoResultYet' | 'homeViewPagePrefix'
  | 'homeViewPageSuffix' | 'homeWeeklySchedule' | 'homeViewGuidelines'
  | 'homeQuickLinks' | 'homeCheckTicketDesc' | 'homeHowToClaim'
  | 'homeHowToClaimDesc' | 'homeGuessingDesc' | 'homeFaqDesc'
  // ── SchedulePage ─────────────────────────────────────────────────
  | 'scheduleH1' | 'scheduleSubtitle' | 'scheduleWeeklyTable' | 'scheduleDay'
  | 'scheduleDrawTime' | 'scheduleFooterNote' | 'scheduleSpecialDraw'
  | 'scheduleBumperLink'
  // ── JackpotPage ──────────────────────────────────────────────────
  | 'jackpotH1' | 'jackpotSubtitle' | 'jackpotBiggest' | 'jackpotUnderway'
  | 'jackpotBumperLink' | 'jackpotDailyTitle' | 'jackpotDailySubtitle'
  | 'jackpotDrawDay' | 'jackpotRecentWinners' | 'jackpotWinnersEmpty'
  | 'jackpotFirstPrizeWinner' | 'jackpotDisclaimerBody'
  // ── ClaimPrizePage ───────────────────────────────────────────────
  | 'claimPrizeH1' | 'claimPrizeSubtitle' | 'claimPrizeStep1'
  | 'claimPrizeClaimAt' | 'claimPrizeDeadlineLabel' | 'claimPrizeNoteLabel'
  | 'claimPrizeStep2' | 'claimPrizeStep3' | 'claimPrizeVerifyText'
  | 'claimPrizeOr' | 'claimPrizeGuideCta' | 'claimPrizeGuideLink'
  | 'claimPrizeDisclaimerBody'
  // ── ChartPage ────────────────────────────────────────────────────
  | 'chartH1' | 'chartSubtitle' | 'chartAll' | 'chartEmpty'
  | 'chartShowingPrefix' | 'chartDrawSingular' | 'chartDrawPlural'
  | 'chartShowingSuffix'
  // ── BumperPage ───────────────────────────────────────────────────
  | 'bumperH1' | 'bumperSubtitle' | 'bumperNextBumper' | 'bumperUnderway'
  | 'bumperSeries' | 'bumperVenue' | 'bumperPastResults' | 'bumperPastEmpty'
  | 'bumperAboutTitle' | 'bumperAboutBody'
  // ── YesterdayResultPage ──────────────────────────────────────────
  | 'yestH1' | 'yestSubtitle' | 'yestNotAvailable' | 'yestBackToToday'
  | 'yestNotPublishedYet' | 'yestDrawHeldAt' | 'yestFirstPrizeColon'
  | 'yestViewFull' | 'yestOtherDraws' | 'yestPrize' | 'yestWinningNumbers'
  // ── CheckTicketPage ──────────────────────────────────────────────
  | 'ctH1' | 'ctSubtitle' | 'ctHowTo' | 'ctFullBest' | 'ct6DigitLabel'
  | 'ctLast4Label' | 'ctFullDesc' | 'ct6DigitDesc' | 'ctLast4Desc'
  | 'ctInputLabel' | 'ctClear' | 'ctNoMatch' | 'ctNotInData' | 'ctCongrats'
  | 'ctIsWinner' | 'ctVerifyOfficially' | 'ctBeforeClaiming'
  | 'ctPartialMatch' | 'ctPartialMatches' | 'ctEnterFull' | 'ctToConfirm'
  | 'ctSearched' | 'ctDrawsAcross' | 'ctLotteries' | 'ctImportant'
  | 'ctImportantBody' | 'ctExactMatch' | 'ctPartialVerify'
  // ── GuessingNumbersPage ──────────────────────────────────────────
  | 'gnH1' | 'gnSubtitle' | 'gnUpdated' | 'gnUpdatedNightly' | 'gnSeePast'
  | 'gnByLottery' | 'gnByLotterySub' | 'gnAbcTitle' | 'gnAbcSub' | 'gnBoard'
  | 'gnTwoDigit' | 'gnThreeDigit' | 'gnFourDigit' | 'gnFourDigitSub'
  | 'gnSeriesFreqTitle' | 'gnSeriesFreqSub' | 'gnSeriesEmpty' | 'gnHotTitle'
  | 'gnHotSub' | 'gnHotEmpty' | 'gnAppeared' | 'gnDisclaimerBody' | 'gnHot'
  | 'gnSeriesCol' | 'gnWinsCol' | 'gnLastWonDateCol' | 'gnLastWonDrawCodeCol'
  // ── DrawArchivePage / LotteryResultPage (shared) ────────────────
  | 'resultNotFound' | 'lotteryNotFound' | 'resultLabel' | 'moreResultsPrefix'
  | 'moreResultsSuffix' | 'importantDisclaimer' | 'archiveDisclaimerBody'
  | 'lrDisclaimerBody' | 'lrHolidayNotice' | 'lrH1Suffix'
  | 'viewFirstPrizeWinner' | 'daResultArchiveDesc'
  // ── ResultDetails (shared component) ────────────────────────────
  | 'rdDrawDetails' | 'rdDrawCode' | 'rdDrawDate' | 'rdStatus'
  | 'rdFirstPrizeDistrict' | 'rdTotalWinners' | 'rdTotalDistribution'
  | 'rdSource' | 'rdOfficialSource' | 'rdDownloadPdf' | 'rdViewImage'
  // ── FirstPrizePage ───────────────────────────────────────────────
  | 'fpNotFound' | 'fpBackHome' | 'fpFirstPrizeWinner' | 'fpResultAwaiting'
  | 'fpDrawAt' | 'fpCheckBack' | 'fpSoldIn' | 'fpKerala' | 'fpViewArea'
  | 'fpLiveVerify' | 'fpTop3Title' | 'fp1stPrizeCrumb' | 'fpDidYouWin'
  | 'fpVerifyBody' | 'fpDisclaimer'
  // ── ClaimGuidePage ───────────────────────────────────────────────
  | 'cgH1' | 'cgSubtitle' | 'cgDeadlinesTitle' | 'cgPrizeCategory'
  | 'cgClaimLocation' | 'cgTimeLimit' | 'cgProcessTitle' | 'cgTamilNaduTitle'
  | 'cgTaxTitle'
  // ── FaqPage ──────────────────────────────────────────────────────
  | 'faqH1' | 'faqSubtitle'
  // ── LotteryOfficesPage ───────────────────────────────────────────
  | 'loH1' | 'loSubtitle' | 'loWhichOffice' | 'loAllPrizesNote'
  | 'loHeadquarters' | 'loFax' | 'loDistrictOfficesTitle' | 'loTapExpand'
  | 'loViewMaps' | 'loBeforeVisitTitle'
  // ── AboutPage ────────────────────────────────────────────────────
  | 'aboutH1' | 'aboutSubtitle' | 'aboutWhoWeAre' | 'aboutMission'
  | 'aboutHowWeWork' | 'aboutTrustPrinciples' | 'aboutLegalDisclaimer'
  | 'aboutLotteriesCovered' | 'aboutResultUpdates' | 'aboutDrawTimeIST'
  | 'aboutResultsPublished' | 'aboutLotteriesWeCover'
  // ── ContactPage ──────────────────────────────────────────────────
  | 'contactH1' | 'contactSubtitle' | 'contactSendMessage'
  | 'contactReplyTime' | 'contactSentTitle' | 'contactSendAnother'
  | 'contactYourName' | 'contactEmail' | 'contactSubject'
  | 'contactLotteryName' | 'contactDrawCode' | 'contactMessage'
  | 'contactHowCanWeHelp' | 'contactErrorMsg' | 'contactSending'
  | 'contactSendBtn' | 'contactEmailLabel' | 'contactResponseNote'
  | 'contactSupportHours' | 'contactHoursNote' | 'contactImportantNotice'
  | 'contactForCorrections' | 'subjectGeneral' | 'subjectCorrection'
  | 'subjectFeedback' | 'subjectPrivacy' | 'subjectOther'
  // ── DisclaimerPage ───────────────────────────────────────────────
  | 'discH1' | 'discSubtitle' | 'discInfoOnly' | 'discVerifySources'
  | 'discNoGuarantee' | 'discFinancialRisk'
  // ── PrivacyPolicyPage / TermsPage ────────────────────────────────
  | 'ppH1' | 'termsH1'
  // ── DownloadFormsPage ────────────────────────────────────────────
  | 'dfH1' | 'dfSubtitle' | 'dfCommonDocs' | 'dfOfficialLinks' | 'dfImportant'
  // ── not-found.tsx ────────────────────────────────────────────────
  | 'nf404' | 'nfHint';

export const translations: Record<Lang, Record<UIKey, string>> = {
  en: {
    home: 'Home', results: 'Results', chart: 'Chart', bumper: 'Bumper',
    jackpot: 'Jackpot', schedule: 'Schedule', yesterdayResult: "Yesterday's Result",
    checkTicket: 'Check Ticket', claimPrize: 'Claim Prize', contact: 'Contact',
    claimGuide: 'Claim Guide', guessingNumbers: 'Guessing Numbers',
    downloadForms: 'Download Forms', faq: 'FAQ', about: 'About',
    lotteryOffices: 'Lottery Offices', tools: 'Tools', info: 'Info',
    moreLotteries: 'More Lotteries', resources: 'Resources',
    bumperResults: 'Bumper Results', ticketChecker: 'Ticket Checker',
    privacyPolicy: 'Privacy Policy', aboutDisclaimer: 'About & Disclaimer',
    fullPrizeTable: 'Full Prize Table', prizeTier: 'Prize Tier',
    winningNumbers: 'Winning Numbers', amount: 'Amount', pending: 'Pending',
    completeResult: 'Complete Result', tiersUpdated: 'tiers updated',
    bumperDraw: 'Bumper Draw', firstPrize: 'First Prize', todaysDraw: "Today's draw",
    verificationStatus: 'Verification status', notPublishedYet: 'Not published yet',
    verifiedResult: 'Verified result', liveUpdate: 'Live update',

    disclaimer: 'Disclaimer', date: 'Date', draw: 'Draw', code: 'Code', lottery: 'Lottery',
    viewArrow: 'View →', today: 'Today', tomorrow: 'Tomorrow', days: 'Days', hours: 'Hours',
    minutes: 'Min', seconds: 'Sec', quickLinks: 'Quick Links', notFound: 'Not found',
    officeAnyAgent: 'Any authorised lottery agent', officeDistrictOffice: 'Your District Lottery Office',
    officeDirectorateShort: 'Directorate, Thiruvananthapuram', ticketPrice: 'Ticket price',

    homeH1: 'Kerala Lottery Result Today', homeSubtitle: 'Select your lottery — results update daily at 3 PM IST.',
    homeNotice: "Kerala Lottery results are updated here daily at 3 PM. Select your lottery to see today's result.",
    homeHolidayNotice: '{name} — Kerala Lottery Dept does not hold a draw today, so there is no new result to publish. Regular daily results resume tomorrow as usual.',
    homeDrawsEvery: 'draws every', homeAt: 'at', homeNoResultYet: 'No result published yet. Check back after 3 PM.',
    homeViewPagePrefix: 'View', homeViewPageSuffix: 'Page →', homeWeeklySchedule: 'Weekly Lottery Schedule',
    homeViewGuidelines: 'View Guidelines', homeQuickLinks: 'Quick Links',
    homeCheckTicketDesc: "Enter your ticket number to check if you've won any prize",
    homeHowToClaim: 'How to Claim', homeHowToClaimDesc: 'Step-by-step guide to claiming your prize',
    homeGuessingDesc: "Today's guessing numbers — for entertainment only",
    homeFaqDesc: 'Common questions about results, prizes, and claims',

    scheduleH1: 'Kerala Lottery Weekly Schedule',
    scheduleSubtitle: "Every Kerala lottery draw day and time in one table — plan around today's and tomorrow's draws.",
    scheduleWeeklyTable: 'Weekly Draw Schedule', scheduleDay: 'Day', scheduleDrawTime: 'Draw Time',
    scheduleFooterNote: 'All draws are held daily at 3:00 PM IST (Gorky Bhavan, Thiruvananthapuram) except bumper special draws.',
    scheduleSpecialDraw: 'Special Draw', scheduleBumperLink: 'View bumper countdown & details →',

    jackpotH1: 'Kerala Lottery Jackpot',
    jackpotSubtitle: "The biggest prizes in Kerala Lottery — today's ₹1 Crore daily jackpot and the next bumper draw's top prize, plus recent jackpot winners.",
    jackpotBiggest: 'Biggest Jackpot', jackpotUnderway: 'draw is underway — the jackpot result is published here on draw day.',
    jackpotBumperLink: 'Full bumper details & past results →', jackpotDailyTitle: "Today's Daily Jackpot — ₹1 Crore First Prize",
    jackpotDailySubtitle: 'Every daily Kerala lottery carries the same ₹1 Crore first prize, drawn at 3:00 PM IST.',
    jackpotDrawDay: 'Draw Day', jackpotRecentWinners: 'Recent Jackpot Winners',
    jackpotWinnersEmpty: 'Recent winners will appear here.', jackpotFirstPrizeWinner: '1st Prize Winner',
    jackpotDisclaimerBody: 'Lottery is a game of chance. Jackpot amounts shown are the announced prize structure and can change per official notification. Always verify with the official Kerala State Lotteries department. Play responsibly.',

    claimPrizeH1: 'Claim Your Kerala Lottery Prize',
    claimPrizeSubtitle: 'Select your prize amount to see exactly where to go, your deadline, and what to bring.',
    claimPrizeStep1: '1. Select your prize amount', claimPrizeClaimAt: 'Claim at:',
    claimPrizeDeadlineLabel: 'Deadline:', claimPrizeNoteLabel: 'Note:',
    claimPrizeStep2: '2. Documents to bring', claimPrizeStep3: '3. Verify before you travel',
    claimPrizeVerifyText: 'Always cross-check your ticket number, draw code, and date against the official result before visiting an office. Verify at',
    claimPrizeOr: "or your draw's result page on this site.",
    claimPrizeGuideCta: 'Need the full step-by-step process, Tamil Nadu-specific guidance, and TDS details?',
    claimPrizeGuideLink: 'Read the complete Claim Guide →',
    claimPrizeDisclaimerBody: 'This page is informational and based on publicly available Kerala State Lotteries rules. Rules can change without notice — always confirm the current process directly with the official Kerala State Lotteries department before making any claim.',

    chartH1: 'Kerala Lottery Chart',
    chartSubtitle: 'Every Kerala lottery result at a glance — the 1st prize for each daily draw, newest first.',
    chartAll: 'All', chartEmpty: 'No results for this month yet.',
    chartShowingPrefix: 'Showing', chartDrawSingular: 'draw', chartDrawPlural: 'draws',
    chartShowingSuffix: '. Tap any row to see the full prize table, consolation prizes and lower tiers.',

    bumperH1: 'Kerala Bumper Lottery — Next Draw & Results',
    bumperSubtitle: "Kerala's seasonal bumper lotteries carry the biggest prizes of the year — up to ₹12 crore. See the next bumper draw date, prize and a live countdown, plus past bumper results.",
    bumperNextBumper: 'Next Bumper', bumperUnderway: 'draw is underway — results are published here on draw day. Check back soon!',
    bumperSeries: 'Series', bumperVenue: 'Draw venue', bumperPastResults: 'Past Bumper Results',
    bumperPastEmpty: 'Past bumper results will appear here.', bumperAboutTitle: 'About Kerala Bumper Lotteries',
    bumperAboutBody: 'Kerala holds six seasonal bumper lotteries each year — Summer, Vishu, Monsoon, Thiruvonam (Onam), Pooja and Christmas–New Year — each with far larger prizes than the daily draws. Tickets sell out weeks ahead, and draws are held at Gorky Bhavan, Thiruvananthapuram. We publish each bumper result here as soon as the official draw is announced.',

    yestH1: 'Kerala Lottery Result Yesterday',
    yestSubtitle: "The full result of yesterday's Kerala lottery draw — all prize tiers, updated automatically.",
    yestNotAvailable: "Yesterday's result isn't available yet. Check back shortly, or view today's result.",
    yestBackToToday: "← Today's result",
    yestNotPublishedYet: "Yesterday's draw result hasn't been published yet — showing the most recent available result below",
    yestDrawHeldAt: 'Draw held at', yestFirstPrizeColon: 'IST. First prize:',
    yestViewFull: 'View full result page →', yestOtherDraws: 'Other Recent Draws',
    yestPrize: 'Prize', yestWinningNumbers: 'Winning Number(s)',

    ctH1: 'Kerala Lottery Ticket Checker',
    ctSubtitle: "Enter your ticket number to check if it won a prize across all recent draws.",
    ctHowTo: 'How to enter your ticket number', ctFullBest: 'Full ticket (best)',
    ct6DigitLabel: '6-digit number', ctLast4Label: 'Last 4 digits',
    ctFullDesc: 'Series + 6-digit number — exact match', ct6DigitDesc: 'Matches number across all series',
    ctLast4Desc: 'Quick check — may show multiple matches',
    ctInputLabel: 'Enter your Kerala lottery ticket number', ctClear: 'Clear',
    ctNoMatch: 'No match found for', ctNotInData: 'Not in our current data. Verify at',
    ctCongrats: 'Congratulations!', ctIsWinner: 'is a winner!',
    ctVerifyOfficially: 'Verify officially at', ctBeforeClaiming: 'before claiming. Claim within 30 days.',
    ctPartialMatch: 'partial match', ctPartialMatches: 'partial matches',
    ctEnterFull: 'Enter full ticket with series letters (e.g.', ctToConfirm: ') to confirm exactly.',
    ctSearched: 'Searched', ctDrawsAcross: 'draws across', ctLotteries: 'lotteries',
    ctImportant: 'Important:',
    ctImportantBody: 'Always verify at statelottery.kerala.gov.in before claiming. Prizes must be claimed within 30 days of draw date.',
    ctExactMatch: 'Exact match', ctPartialVerify: 'Partial — verify series',

    gnH1: 'Kerala Lottery Guessing Numbers Today',
    gnSubtitle: 'ABC board numbers and 4-digit combinations for all Kerala lottery draws. Updated daily before 3 PM IST.',
    gnUpdated: 'Updated:', gnUpdatedNightly: 'Updated nightly', gnSeePast: 'See past days →',
    gnByLottery: 'Guessing Numbers by Lottery',
    gnByLotterySub: 'Click any lottery for dedicated guessing numbers, hot/cold numbers, and Tamil guide',
    gnAbcTitle: "Today's ABC Board Numbers", gnAbcSub: 'Base A, B, C values — all combinations derive from these three digits',
    gnBoard: 'Board', gnTwoDigit: 'Two Digit Combinations', gnThreeDigit: 'Three Digit Numbers',
    gnFourDigit: 'Four Digit Picks', gnFourDigitSub: 'Check against last 4 digits of your ticket number',
    gnSeriesFreqTitle: 'Series Frequency — 1st Prize Wins',
    gnSeriesFreqSub: 'How many times each 2-letter series has won 1st Prize across all verified draws. Click a column to sort.',
    gnSeriesEmpty: 'Series data will appear here once verified results are available.',
    gnHotTitle: '🔥 Hot Numbers — Last 30 Draws',
    gnHotSub: 'The 5 most frequent last-4-digit endings across every prize tier, from the most recent 30 draws.',
    gnHotEmpty: 'Hot number data will appear here once draws are available.', gnAppeared: 'Appeared',
    gnDisclaimerBody: 'Guessing numbers are for entertainment only. No number can be predicted or guaranteed. Play responsibly.',
    gnHot: 'Hot', gnSeriesCol: 'Series', gnWinsCol: 'Wins', gnLastWonDateCol: 'Last Won Date',
    gnLastWonDrawCodeCol: 'Last Won Draw Code',

    resultNotFound: 'Result not found.', lotteryNotFound: 'Lottery not found.', resultLabel: 'Result',
    moreResultsPrefix: 'More', moreResultsSuffix: 'Results', importantDisclaimer: 'Important Disclaimer',
    archiveDisclaimerBody: 'This archive page is for informational purposes only. Always verify winning numbers with official Kerala Lottery publications before making prize claims or financial decisions.',
    lrDisclaimerBody: 'The Kerala Lottery results published on this page are for informational purposes only. This website is not affiliated with the Kerala Government. Always verify results with the official Kerala Government Gazette before making any prize claim.',
    lrHolidayNotice: "{name} — Kerala Lottery Dept does not hold a draw today. The result below is the most recent published draw, not today's. Regular results resume tomorrow.",
    lrH1Suffix: 'Kerala Lottery Result Today', viewFirstPrizeWinner: '🥇 View 1st Prize Winner Page →',
    daResultArchiveDesc: '{date} draw archive with status, source links, prize table, and responsible verification guidance.',

    rdDrawDetails: 'Draw Details', rdDrawCode: 'Draw Code', rdDrawDate: 'Draw Date', rdStatus: 'Status',
    rdFirstPrizeDistrict: 'First Prize District', rdTotalWinners: 'Total Winners',
    rdTotalDistribution: 'Total Distribution', rdSource: 'Source', rdOfficialSource: 'Official Source',
    rdDownloadPdf: 'Download PDF', rdViewImage: 'View Result Image',

    fpNotFound: 'Result not found', fpBackHome: '← Back to home', fpFirstPrizeWinner: 'First Prize Winner',
    fpResultAwaiting: 'Result Awaiting', fpDrawAt: 'Draw at', fpCheckBack: 'Check back after 3 PM',
    fpSoldIn: 'Sold in', fpKerala: 'Kerala', fpViewArea: 'View area →',
    fpLiveVerify: 'Live — verify before claiming', fpTop3Title: 'Top 3 Prize Winners',
    fp1stPrizeCrumb: '1st Prize', fpDidYouWin: 'Did you win?',
    fpVerifyBody: 'Verify your ticket at statelottery.kerala.gov.in before claiming. Claim within 30 days at the Directorate of Kerala Lotteries, Thiruvananthapuram.',
    fpDisclaimer: 'This page is for informational purposes only. Always verify with official Kerala Government Gazette before claiming any prize.',

    cgH1: 'How to Claim Kerala Lottery Prize',
    cgSubtitle: 'Step-by-step guide from ticket verification to prize payment — including Tamil Nadu residents.',
    cgDeadlinesTitle: 'Prize Claim Deadlines & Locations', cgPrizeCategory: 'Prize Category',
    cgClaimLocation: 'Claim Location', cgTimeLimit: 'Time Limit', cgProcessTitle: 'Claim Process',
    cgTamilNaduTitle: 'Claiming from Tamil Nadu / Other States', cgTaxTitle: 'Tax on Winnings (TDS)',

    faqH1: 'Kerala Lottery FAQ',
    faqSubtitle: 'Common questions about results, checking tickets, claiming prizes, and responsible use.',

    loH1: 'Kerala Lottery Offices',
    loSubtitle: 'Directory of the Directorate of Kerala State Lotteries and all 14 district lottery offices — with contact numbers, addresses, and working hours.',
    loWhichOffice: '📋 Which office do I visit?',
    loAllPrizesNote: 'All prizes must be claimed within 30 days of draw date. Bring original ticket, Aadhaar, PAN, and bank passbook.',
    loHeadquarters: 'Headquarters', loFax: 'Fax:', loDistrictOfficesTitle: 'District Lottery Offices',
    loTapExpand: 'Tap to expand', loViewMaps: 'View on Google Maps', loBeforeVisitTitle: '⚠️ Before You Visit',

    aboutH1: 'About Kerala Ticket Results',
    aboutSubtitle: 'Your trusted, independent source for Kerala Lottery result updates — built for accuracy and speed.',
    aboutWhoWeAre: 'Who We Are', aboutMission: 'Our Mission', aboutHowWeWork: 'How We Work',
    aboutTrustPrinciples: 'Our Trust Principles', aboutLegalDisclaimer: 'Legal Disclaimer',
    aboutLotteriesCovered: 'Lotteries Covered', aboutResultUpdates: 'Result Updates',
    aboutDrawTimeIST: 'Draw Time IST', aboutResultsPublished: 'Results Published',
    aboutLotteriesWeCover: 'Lotteries We Cover',

    contactH1: 'Contact Us', contactSubtitle: 'Result corrections, feedback, or general questions — we read every message.',
    contactSendMessage: 'Send a Message', contactReplyTime: 'We aim to reply within 2 business days.',
    contactSentTitle: 'Message Sent!', contactSendAnother: 'Send Another', contactYourName: 'Your Name *',
    contactEmail: 'Email Address *', contactSubject: 'Subject *', contactLotteryName: 'Lottery Name',
    contactDrawCode: 'Draw Code', contactMessage: 'Message *', contactHowCanWeHelp: 'How can we help you?',
    contactErrorMsg: 'Something went wrong. Please try again or email us directly.',
    contactSending: 'Sending…', contactSendBtn: 'Send Message →', contactEmailLabel: 'Email',
    contactResponseNote: 'Response within 2 business days', contactSupportHours: 'Support Hours',
    contactHoursNote: '9:00 AM – 6:00 PM IST', contactImportantNotice: 'Important Notice',
    contactForCorrections: 'For Result Corrections', subjectGeneral: 'General Enquiry',
    subjectCorrection: 'Result Correction', subjectFeedback: 'Website Feedback',
    subjectPrivacy: 'Privacy / Data Request', subjectOther: 'Other',

    discH1: 'Disclaimer', discSubtitle: 'Read this before using lottery result information from this website.',
    discInfoOnly: 'Informational Website Only', discVerifySources: 'Verify Official Sources',
    discNoGuarantee: 'No Winning Guarantee', discFinancialRisk: 'Financial Risk',

    ppH1: 'Privacy Policy', termsH1: 'Terms and Conditions',

    dfH1: 'Lottery Forms and Downloads',
    dfSubtitle: 'Use this page as a guide for forms and documents. Add official download links after verification.',
    dfCommonDocs: 'Common Documents', dfOfficialLinks: 'Official Form Links', dfImportant: 'Important',

    nf404: '404 Page Not Found', nfHint: 'Did you forget to add the page to the router?',
  },
  ta: {
    home: 'முகப்பு', results: 'முடிவுகள்', chart: 'சார்ட்', bumper: 'பம்பர்',
    jackpot: 'ஜாக்பாட்', schedule: 'அட்டவணை', yesterdayResult: 'நேற்றைய முடிவு',
    checkTicket: 'டிக்கெட் சரிபார்ப்பு', claimPrize: 'பரிசு பெறுதல்', contact: 'தொடர்பு',
    claimGuide: 'பரிசு வழிகாட்டி', guessingNumbers: 'கணிப்பு எண்கள்',
    downloadForms: 'படிவங்கள்', faq: 'கேள்வி பதில்', about: 'எங்களைப் பற்றி',
    lotteryOffices: 'லாட்டரி அலுவலகங்கள்', tools: 'கருவிகள்', info: 'தகவல்',
    moreLotteries: 'மற்ற லாட்டரிகள்', resources: 'மேலும்',
    bumperResults: 'பம்பர் முடிவுகள்', ticketChecker: 'டிக்கெட் சரிபார்ப்பு',
    privacyPolicy: 'தனியுரிமைக் கொள்கை', aboutDisclaimer: 'பற்றி & மறுப்பு',
    fullPrizeTable: 'முழு பரிசு அட்டவணை', prizeTier: 'பரிசு நிலை',
    winningNumbers: 'வெற்றி எண்கள்', amount: 'தொகை', pending: 'நிலுவையில்',
    completeResult: 'முழு முடிவு', tiersUpdated: 'நிலைகள் புதுப்பிக்கப்பட்டன',
    bumperDraw: 'பம்பர் டிராவ்', firstPrize: 'முதல் பரிசு', todaysDraw: 'இன்றைய டிராவ்',
    verificationStatus: 'சரிபார்ப்பு நிலை', notPublishedYet: 'இன்னும் வெளியிடப்படவில்லை',
    verifiedResult: 'சரிபார்க்கப்பட்ட முடிவு', liveUpdate: 'நேரடி புதுப்பிப்பு',

    disclaimer: 'மறுப்பு அறிக்கை', date: 'தேதி', draw: 'டிராவ்', code: 'கோட்', lottery: 'லாட்டரி',
    viewArrow: 'பார்க்க →', today: 'இன்று', tomorrow: 'நாளை', days: 'நாட்கள்', hours: 'மணி',
    minutes: 'நிமிடம்', seconds: 'வினாடி', quickLinks: 'விரைவு இணைப்புகள்', notFound: 'கிடைக்கவில்லை',
    officeAnyAgent: 'எந்த அங்கீகரிக்கப்பட்ட முகவர்', officeDistrictOffice: 'உங்கள் மாவட்ட லாட்டரி அலுவலகம்',
    officeDirectorateShort: 'இயக்குநரகம், திருவனந்தபுரம்', ticketPrice: 'டிக்கெட் விலை',

    homeH1: 'கேரளா லாட்டரி இன்றைய முடிவு', homeSubtitle: 'உங்கள் லாட்டரியைத் தேர்ந்தெடுக்கவும் — முடிவுகள் தினமும் மதியம் 3 மணிக்குப் புதுப்பிக்கப்படும்.',
    homeNotice: 'கேரளா லாட்டரி முடிவுகள் தினமும் மதியம் 3 மணிக்கு இங்கே புதுப்பிக்கப்படும். உங்கள் லாட்டரியைத் தேர்ந்தெடுத்து இன்றைய முடிவைப் பாருங்கள்.',
    homeHolidayNotice: '{name} — இன்று கேரளா லாட்டரி டிராவ் இல்லை, எனவே புதிய முடிவு இல்லை. நாளை வழக்கம் போல் தொடரும்.',
    homeDrawsEvery: 'ஒவ்வொரு', homeAt: 'மணிக்கு நடத்தப்படுகிறது', homeNoResultYet: 'இன்னும் முடிவு வெளியிடப்படவில்லை. மதியம் 3 மணிக்குப் பிறகு பாருங்கள்.',
    homeViewPagePrefix: '', homeViewPageSuffix: 'பக்கத்தைப் பார்க்க →', homeWeeklySchedule: 'வார லாட்டரி அட்டவணை',
    homeViewGuidelines: 'வழிகாட்டுதல்களைப் பார்க்க', homeQuickLinks: 'விரைவு இணைப்புகள்',
    homeCheckTicketDesc: 'உங்கள் டிக்கெட் எண் வெற்றி பெற்றதா எனச் சரிபார்க்கவும்',
    homeHowToClaim: 'பரிசு பெறும் வழிமுறை', homeHowToClaimDesc: 'பரிசு பெறுவதற்கான படிநிலை வழிகாட்டி',
    homeGuessingDesc: 'இன்றைய கணிப்பு எண்கள் — வெறும் பொழுதுபோக்கிற்காக மட்டும்',
    homeFaqDesc: 'முடிவுகள், பரிசுகள் மற்றும் கோரிக்கைகள் பற்றிய பொதுவான கேள்விகள்',

    scheduleH1: 'கேரளா லாட்டரி வார அட்டவணை',
    scheduleSubtitle: 'ஒவ்வொரு கேரளா லாட்டரி டிராவ் நாளும் நேரமும் ஒரே அட்டவணையில்.',
    scheduleWeeklyTable: 'வார டிராவ் அட்டவணை', scheduleDay: 'நாள்', scheduleDrawTime: 'டிராவ் நேரம்',
    scheduleFooterNote: 'பம்பர் சிறப்பு டிராவ்கள் தவிர, அனைத்து டிராவ்களும் தினமும் மதியம் 3:00 மணிக்கு நடத்தப்படுகின்றன.',
    scheduleSpecialDraw: 'சிறப்பு டிராவ்', scheduleBumperLink: 'பம்பர் கவுண்ட்டவுன் & விவரங்களைப் பார்க்க →',

    jackpotH1: 'கேரளா லாட்டரி ஜாக்பாட்',
    jackpotSubtitle: 'கேரளா லாட்டரியின் மிகப்பெரிய பரிசுகள் — இன்றைய ₹1 கோடி தினசரி ஜாக்பாட் மற்றும் அடுத்த பம்பர் ஜாக்பாட், சமீபத்திய வெற்றியாளர்களுடன்.',
    jackpotBiggest: 'மிகப்பெரிய ஜாக்பாட்', jackpotUnderway: 'டிராவ் நடைபெறுகிறது — ஜாக்பாட் முடிவு டிராவ் நாளில் இங்கே வெளியிடப்படும்.',
    jackpotBumperLink: 'முழு பம்பர் விவரங்கள் & கடந்த முடிவுகள் →', jackpotDailyTitle: 'இன்றைய தினசரி ஜாக்பாட் — ₹1 கோடி முதல் பரிசு',
    jackpotDailySubtitle: 'ஒவ்வொரு தினசரி கேரளா லாட்டரியும் ₹1 கோடி முதல் பரிசைக் கொண்டுள்ளது, மதியம் 3:00 மணிக்கு நடத்தப்படுகிறது.',
    jackpotDrawDay: 'டிராவ் நாள்', jackpotRecentWinners: 'சமீபத்திய ஜாக்பாட் வெற்றியாளர்கள்',
    jackpotWinnersEmpty: 'சமீபத்திய வெற்றியாளர்கள் இங்கே தோன்றும்.', jackpotFirstPrizeWinner: 'முதல் பரிசு வெற்றியாளர்',
    jackpotDisclaimerBody: 'லாட்டரி ஒரு வாய்ப்பு விளையாட்டு. ஜாக்பாட் தொகைகள் அறிவிக்கப்பட்ட பரிசு அமைப்பு, அதிகாரப்பூர்வ அறிவிப்பின்படி மாறலாம். எப்போதும் கேரளா மாநில லாட்டரி துறையுடன் சரிபார்க்கவும்.',

    claimPrizeH1: 'உங்கள் கேரளா லாட்டரி பரிசைப் பெறுங்கள்',
    claimPrizeSubtitle: 'உங்கள் பரிசுத் தொகையைத் தேர்ந்தெடுத்து, எங்கு செல்ல வேண்டும், கடைசி தேதி, என்ன கொண்டு வர வேண்டும் என்பதைப் பாருங்கள்.',
    claimPrizeStep1: '1. உங்கள் பரிசுத் தொகையைத் தேர்ந்தெடுக்கவும்', claimPrizeClaimAt: 'பெறும் இடம்:',
    claimPrizeDeadlineLabel: 'கடைசி தேதி:', claimPrizeNoteLabel: 'குறிப்பு:',
    claimPrizeStep2: '2. கொண்டு வர வேண்டிய ஆவணங்கள்', claimPrizeStep3: '3. பயணிக்கும் முன் சரிபார்க்கவும்',
    claimPrizeVerifyText: 'அலுவலகத்திற்குச் செல்வதற்கு முன் உங்கள் டிக்கெட் எண், டிராவ் கோட், தேதியை அதிகாரப்பூர்வ முடிவுடன் சரிபார்க்கவும். இதில் சரிபார்க்கவும்',
    claimPrizeOr: 'அல்லது இந்த தளத்தில் உங்கள் டிராவின் முடிவுப் பக்கத்தில்.',
    claimPrizeGuideCta: 'முழு படிநிலை செயல்முறை, தமிழ்நாடு வழிகாட்டி, TDS விவரங்கள் தேவையா?',
    claimPrizeGuideLink: 'முழு பரிசு வழிகாட்டியைப் படிக்க →',
    claimPrizeDisclaimerBody: 'இந்தப் பக்கம் தகவல் நோக்கத்திற்காக மட்டும். விதிகள் அறிவிப்பு இல்லாமல் மாறலாம் — எப்போதும் அதிகாரப்பூர்வ கேரளா மாநில லாட்டரி துறையுடன் நேரடியாக செயல்முறையை உறுதிப்படுத்தவும்.',

    chartH1: 'கேரளா லாட்டரி சார்ட்',
    chartSubtitle: 'ஒவ்வொரு கேரளா லாட்டரி முடிவும் ஒரே பார்வையில் — ஒவ்வொரு தினசரி டிராவின் முதல் பரிசு, புதியது முதலில்.',
    chartAll: 'அனைத்தும்', chartEmpty: 'இந்த மாதத்திற்கு இன்னும் முடிவுகள் இல்லை.',
    chartShowingPrefix: 'காட்டப்படுகிறது', chartDrawSingular: 'டிராவ்', chartDrawPlural: 'டிராவ்கள்',
    chartShowingSuffix: '. முழு பரிசு அட்டவணை, ஆறுதல் பரிசுகள் மற்றும் கீழ்நிலைகளைப் பார்க்க எந்த வரியையும் தட்டவும்.',

    bumperH1: 'கேரளா பம்பர் லாட்டரி — அடுத்த டிராவ் & முடிவுகள்',
    bumperSubtitle: 'கேரளாவின் பருவகால பம்பர் லாட்டரிகள் ஆண்டின் மிகப்பெரிய பரிசுகளைக் கொண்டுள்ளன — ₹12 கோடி வரை. அடுத்த பம்பர் டிராவ் தேதி, பரிசு, நேரடி கவுண்ட்டவுன் மற்றும் கடந்த பம்பர் முடிவுகளைப் பார்க்கவும்.',
    bumperNextBumper: 'அடுத்த பம்பர்', bumperUnderway: 'டிராவ் நடைபெறுகிறது — முடிவுகள் டிராவ் நாளில் இங்கே வெளியிடப்படும். விரைவில் பாருங்கள்!',
    bumperSeries: 'தொடர்', bumperVenue: 'டிராவ் இடம்', bumperPastResults: 'கடந்த பம்பர் முடிவுகள்',
    bumperPastEmpty: 'கடந்த பம்பர் முடிவுகள் இங்கே தோன்றும்.', bumperAboutTitle: 'கேரளா பம்பர் லாட்டரிகள் பற்றி',
    bumperAboutBody: 'கேரளா ஆண்டுக்கு ஆறு பருவகால பம்பர் லாட்டரிகளை நடத்துகிறது — சம்மர், விஷு, மான்சூன், திருவோணம் (ஓணம்), பூஜா மற்றும் கிறிஸ்துமஸ்-புத்தாண்டு — ஒவ்வொன்றும் தினசரி டிராவை விட மிகப் பெரிய பரிசுகளுடன். டிக்கெட்டுகள் வாரங்களுக்கு முன்பே விற்றுத் தீரும், டிராவ்கள் திருவனந்தபுரம் கோர்க்கி பவனில் நடத்தப்படுகின்றன.',

    yestH1: 'நேற்றைய கேரளா லாட்டரி முடிவு',
    yestSubtitle: 'நேற்றைய கேரளா லாட்டரி டிராவின் முழு முடிவு — அனைத்து பரிசு நிலைகளும், தானாகப் புதுப்பிக்கப்படும்.',
    yestNotAvailable: 'நேற்றைய முடிவு இன்னும் கிடைக்கவில்லை. சிறிது நேரத்தில் பாருங்கள் அல்லது இன்றைய முடிவைப் பாருங்கள்.',
    yestBackToToday: '← இன்றைய முடிவு',
    yestNotPublishedYet: 'நேற்றைய டிராவ் முடிவு இன்னும் வெளியிடப்படவில்லை — கீழே கிடைக்கும் சமீபத்திய முடிவைக் காட்டுகிறோம்',
    yestDrawHeldAt: 'டிராவ் நடைபெற்ற நேரம்', yestFirstPrizeColon: 'IST. முதல் பரிசு:',
    yestViewFull: 'முழு முடிவுப் பக்கத்தைப் பார்க்க →', yestOtherDraws: 'பிற சமீபத்திய டிராவ்கள்',
    yestPrize: 'பரிசு', yestWinningNumbers: 'வெற்றி எண்(கள்)',

    ctH1: 'கேரளா லாட்டரி டிக்கெட் சரிபார்ப்பு',
    ctSubtitle: 'உங்கள் டிக்கெட் எண் சமீபத்திய அனைத்து டிராவ்களிலும் பரிசு வென்றதா எனச் சரிபார்க்கவும்.',
    ctHowTo: 'உங்கள் டிக்கெட் எண்ணை எப்படி உள்ளிடுவது', ctFullBest: 'முழு டிக்கெட் (சிறந்தது)',
    ct6DigitLabel: '6 இலக்க எண்', ctLast4Label: 'கடைசி 4 இலக்கங்கள்',
    ctFullDesc: 'தொடர் + 6 இலக்க எண் — சரியான பொருத்தம்', ct6DigitDesc: 'அனைத்து தொடர்களிலும் எண்ணைப் பொருத்தும்',
    ctLast4Desc: 'விரைவு சரிபார்ப்பு — பல பொருத்தங்களைக் காட்டலாம்',
    ctInputLabel: 'உங்கள் கேரளா லாட்டரி டிக்கெட் எண்ணை உள்ளிடவும்', ctClear: 'அழி',
    ctNoMatch: 'பொருத்தம் கிடைக்கவில்லை', ctNotInData: 'எங்கள் தற்போதைய தரவில் இல்லை. இதில் சரிபார்க்கவும்',
    ctCongrats: 'வாழ்த்துக்கள்!', ctIsWinner: 'வெற்றி பெற்றுள்ளது!',
    ctVerifyOfficially: 'அதிகாரப்பூர்வமாக சரிபார்க்கவும்', ctBeforeClaiming: 'பெறுவதற்கு முன். 30 நாட்களுக்குள் பெறவும்.',
    ctPartialMatch: 'பகுதி பொருத்தம்', ctPartialMatches: 'பகுதி பொருத்தங்கள்',
    ctEnterFull: 'தொடர் எழுத்துகளுடன் முழு டிக்கெட்டை உள்ளிடவும் (எ.கா.', ctToConfirm: ') சரியாக உறுதிப்படுத்த.',
    ctSearched: 'தேடப்பட்டது', ctDrawsAcross: 'டிராவ்கள், இதில்', ctLotteries: 'லாட்டரிகள்',
    ctImportant: 'முக்கியம்:',
    ctImportantBody: 'பெறுவதற்கு முன் எப்போதும் statelottery.kerala.gov.in இல் சரிபார்க்கவும். டிராவ் தேதியிலிருந்து 30 நாட்களுக்குள் பரிசுகளைப் பெற வேண்டும்.',
    ctExactMatch: 'சரியான பொருத்தம்', ctPartialVerify: 'பகுதி — தொடரை சரிபார்க்கவும்',

    gnH1: 'கேரளா லாட்டரி இன்றைய கணிப்பு எண்கள்',
    gnSubtitle: 'அனைத்து கேரளா லாட்டரி டிராவ்களுக்கும் ABC போர்டு எண்கள் மற்றும் 4 இலக்க கலவைகள். மதியம் 3 மணிக்கு முன் தினமும் புதுப்பிக்கப்படும்.',
    gnUpdated: 'புதுப்பிக்கப்பட்டது:', gnUpdatedNightly: 'இரவு தினமும் புதுப்பிக்கப்படும்', gnSeePast: 'கடந்த நாட்களைப் பார்க்க →',
    gnByLottery: 'லாட்டரி வாரியாக கணிப்பு எண்கள்',
    gnByLotterySub: 'ஒவ்வொரு லாட்டரிக்கும் தனி கணிப்பு எண்கள், ஹாட்/கோல்ட் எண்கள் மற்றும் தமிழ் வழிகாட்டிக்கு கிளிக் செய்யவும்',
    gnAbcTitle: 'இன்றைய ABC போர்டு எண்கள்', gnAbcSub: 'அடிப்படை A, B, C மதிப்புகள் — அனைத்து கலவைகளும் இந்த மூன்று இலக்கங்களில் இருந்து பெறப்படுகின்றன',
    gnBoard: 'போர்டு', gnTwoDigit: 'இரண்டு இலக்க கலவைகள்', gnThreeDigit: 'மூன்று இலக்க எண்கள்',
    gnFourDigit: 'நான்கு இலக்க தேர்வுகள்', gnFourDigitSub: 'உங்கள் டிக்கெட்டின் கடைசி 4 இலக்கங்களுடன் சரிபார்க்கவும்',
    gnSeriesFreqTitle: 'தொடர் அதிர்வெண் — முதல் பரிசு வெற்றிகள்',
    gnSeriesFreqSub: 'சரிபார்க்கப்பட்ட அனைத்து டிராவ்களிலும் ஒவ்வொரு 2-எழுத்து தொடரும் முதல் பரிசு வென்ற எண்ணிக்கை. வரிசைப்படுத்த ஒரு நெடுவரிசையைக் கிளிக் செய்யவும்.',
    gnSeriesEmpty: 'சரிபார்க்கப்பட்ட முடிவுகள் கிடைத்தவுடன் தொடர் தரவு இங்கே தோன்றும்.',
    gnHotTitle: '🔥 ஹாட் எண்கள் — கடந்த 30 டிராவ்கள்',
    gnHotSub: 'சமீபத்திய 30 டிராவ்களில் இருந்து, ஒவ்வொரு பரிசு நிலையிலும் அதிகம் காணப்படும் 5 கடைசி-4-இலக்க முடிவுகள்.',
    gnHotEmpty: 'டிராவ்கள் கிடைத்தவுடன் ஹாட் எண் தரவு இங்கே தோன்றும்.', gnAppeared: 'தோன்றியது',
    gnDisclaimerBody: 'கணிப்பு எண்கள் வெறும் பொழுதுபோக்கிற்காக மட்டும். எந்த எண்ணையும் கணிக்கவோ உறுதிப்படுத்தவோ முடியாது.',
    gnHot: 'ஹாட்', gnSeriesCol: 'தொடர்', gnWinsCol: 'வெற்றிகள்', gnLastWonDateCol: 'கடைசி வென்ற தேதி',
    gnLastWonDrawCodeCol: 'கடைசி வென்ற டிராவ் கோட்',

    resultNotFound: 'முடிவு கிடைக்கவில்லை.', lotteryNotFound: 'லாட்டரி கிடைக்கவில்லை.', resultLabel: 'முடிவு',
    moreResultsPrefix: 'மேலும்', moreResultsSuffix: 'முடிவுகள்', importantDisclaimer: 'முக்கிய மறுப்பு அறிக்கை',
    archiveDisclaimerBody: 'இந்த ஆவணப் பக்கம் தகவல் நோக்கத்திற்காக மட்டும். பரிசு கோருவதற்கு முன் எப்போதும் அதிகாரப்பூர்வ கேரளா லாட்டரி வெளியீடுகளுடன் வெற்றி எண்களை சரிபார்க்கவும்.',
    lrDisclaimerBody: 'இந்தப் பக்கத்தில் வெளியிடப்பட்ட கேரளா லாட்டரி முடிவுகள் தகவல் நோக்கத்திற்காக மட்டும். இந்த இணையதளம் கேரளா அரசுடன் தொடர்பில்லாதது. பரிசு கோருவதற்கு முன் அதிகாரப்பூர்வ கேரளா அரசு அரசிதழுடன் முடிவுகளை சரிபார்க்கவும்.',
    lrHolidayNotice: '{name} — இன்று கேரளா லாட்டரி டிராவ் இல்லை. கீழே உள்ள முடிவு சமீபத்தில் வெளியிடப்பட்ட டிராவ், இன்றையது அல்ல. வழக்கமான முடிவுகள் நாளை தொடரும்.',
    lrH1Suffix: 'கேரளா லாட்டரி இன்றைய முடிவு', viewFirstPrizeWinner: '🥇 முதல் பரிசு வெற்றியாளர் பக்கத்தைப் பார்க்க →',
    daResultArchiveDesc: '{date} டிராவ் ஆவணம் — நிலை, மூல இணைப்புகள், பரிசு அட்டவணை மற்றும் சரிபார்ப்பு வழிகாட்டியுடன்.',

    rdDrawDetails: 'டிராவ் விவரங்கள்', rdDrawCode: 'டிராவ் கோட்', rdDrawDate: 'டிராவ் தேதி', rdStatus: 'நிலை',
    rdFirstPrizeDistrict: 'முதல் பரிசு மாவட்டம்', rdTotalWinners: 'மொத்த வெற்றியாளர்கள்',
    rdTotalDistribution: 'மொத்த பரிசு தொகை', rdSource: 'மூலம்', rdOfficialSource: 'அதிகாரப்பூர்வ மூலம்',
    rdDownloadPdf: 'PDF பதிவிறக்கு', rdViewImage: 'முடிவு படத்தைப் பார்க்க',

    fpNotFound: 'முடிவு கிடைக்கவில்லை', fpBackHome: '← முகப்புக்குத் திரும்பு', fpFirstPrizeWinner: 'முதல் பரிசு வெற்றியாளர்',
    fpResultAwaiting: 'முடிவுக்காக காத்திருக்கிறோம்', fpDrawAt: 'டிராவ் நேரம்', fpCheckBack: 'மதியம் 3 மணிக்குப் பிறகு பாருங்கள்',
    fpSoldIn: 'விற்கப்பட்ட இடம்', fpKerala: 'கேரளா', fpViewArea: 'பகுதியைப் பார்க்க →',
    fpLiveVerify: 'நேரடி — பெறுவதற்கு முன் சரிபார்க்கவும்', fpTop3Title: 'முதல் 3 பரிசு வெற்றியாளர்கள்',
    fp1stPrizeCrumb: 'முதல் பரிசு', fpDidYouWin: 'நீங்கள் வென்றீர்களா?',
    fpVerifyBody: 'பெறுவதற்கு முன் statelottery.kerala.gov.in இல் உங்கள் டிக்கெட்டை சரிபார்க்கவும். திருவனந்தபுரம் கேரளா லாட்டரி இயக்குநரகத்தில் 30 நாட்களுக்குள் பெறவும்.',
    fpDisclaimer: 'இந்தப் பக்கம் தகவல் நோக்கத்திற்காக மட்டும். பரிசு பெறுவதற்கு முன் அதிகாரப்பூர்வ கேரளா அரசு அரசிதழுடன் சரிபார்க்கவும்.',

    cgH1: 'கேரளா லாட்டரி பரிசு பெறும் வழிமுறை',
    cgSubtitle: 'டிக்கெட் சரிபார்ப்பு முதல் பரிசு பணம் வரை படிநிலை வழிகாட்டி — தமிழ்நாடு வசிப்பவர்களுக்கும்.',
    cgDeadlinesTitle: 'பரிசு கோரல் கடைசி தேதிகள் & இடங்கள்', cgPrizeCategory: 'பரிசு வகை',
    cgClaimLocation: 'பெறும் இடம்', cgTimeLimit: 'கால வரம்பு', cgProcessTitle: 'பரிசு பெறும் செயல்முறை',
    cgTamilNaduTitle: 'தமிழ்நாடு / பிற மாநிலங்களில் இருந்து பெறுதல்', cgTaxTitle: 'வெற்றித் தொகைக்கான வரி (TDS)',

    faqH1: 'கேரளா லாட்டரி கேள்வி பதில்கள்',
    faqSubtitle: 'முடிவுகள், டிக்கெட் சரிபார்ப்பு, பரிசு பெறுதல் மற்றும் பொறுப்பான பயன்பாடு பற்றிய பொதுவான கேள்விகள்.',

    loH1: 'கேரளா லாட்டரி அலுவலகங்கள்',
    loSubtitle: 'கேரளா மாநில லாட்டரி இயக்குநரகம் மற்றும் அனைத்து 14 மாவட்ட லாட்டரி அலுவலகங்களின் விவரப்பட்டியல்.',
    loWhichOffice: '📋 எந்த அலுவலகத்திற்குச் செல்ல வேண்டும்?',
    loAllPrizesNote: 'அனைத்து பரிசுகளும் டிராவ் தேதியிலிருந்து 30 நாட்களுக்குள் பெறப்பட வேண்டும். மூல டிக்கெட், ஆதார், PAN, வங்கி புத்தகத்தைக் கொண்டு வாருங்கள்.',
    loHeadquarters: 'தலைமையகம்', loFax: 'ஃபேக்ஸ்:', loDistrictOfficesTitle: 'மாவட்ட லாட்டரி அலுவலகங்கள்',
    loTapExpand: 'விரிவாக்க தட்டவும்', loViewMaps: 'கூகிள் மேப்பில் பார்க்க', loBeforeVisitTitle: '⚠️ செல்வதற்கு முன்',

    aboutH1: 'Kerala Ticket Results பற்றி',
    aboutSubtitle: 'கேரளா லாட்டரி முடிவுகளுக்கான நம்பகமான, சுயாதீன ஆதாரம் — துல்லியம் மற்றும் வேகத்திற்காக கட்டப்பட்டது.',
    aboutWhoWeAre: 'நாங்கள் யார்', aboutMission: 'எங்கள் நோக்கம்', aboutHowWeWork: 'நாங்கள் எப்படி வேலை செய்கிறோம்',
    aboutTrustPrinciples: 'எங்கள் நம்பிக்கை கொள்கைகள்', aboutLegalDisclaimer: 'சட்ட மறுப்பு அறிக்கை',
    aboutLotteriesCovered: 'உள்ளடக்கிய லாட்டரிகள்', aboutResultUpdates: 'முடிவு புதுப்பிப்புகள்',
    aboutDrawTimeIST: 'டிராவ் நேரம் IST', aboutResultsPublished: 'முடிவுகள் வெளியிடப்பட்டன',
    aboutLotteriesWeCover: 'நாங்கள் உள்ளடக்கும் லாட்டரிகள்',

    contactH1: 'எங்களை தொடர்பு கொள்ளுங்கள்', contactSubtitle: 'முடிவு திருத்தங்கள், கருத்துகள் அல்லது பொதுவான கேள்விகள் — நாங்கள் ஒவ்வொரு செய்தியையும் படிக்கிறோம்.',
    contactSendMessage: 'செய்தி அனுப்பவும்', contactReplyTime: '2 வேலை நாட்களுக்குள் பதிலளிக்க முயற்சிக்கிறோம்.',
    contactSentTitle: 'செய்தி அனுப்பப்பட்டது!', contactSendAnother: 'மற்றொன்று அனுப்பவும்', contactYourName: 'உங்கள் பெயர் *',
    contactEmail: 'மின்னஞ்சல் முகவரி *', contactSubject: 'பொருள் *', contactLotteryName: 'லாட்டரி பெயர்',
    contactDrawCode: 'டிராவ் கோட்', contactMessage: 'செய்தி *', contactHowCanWeHelp: 'நாங்கள் எப்படி உதவ முடியும்?',
    contactErrorMsg: 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும் அல்லது நேரடியாக எங்களுக்கு மின்னஞ்சல் அனுப்பவும்.',
    contactSending: 'அனுப்புகிறது…', contactSendBtn: 'செய்தி அனுப்பவும் →', contactEmailLabel: 'மின்னஞ்சல்',
    contactResponseNote: '2 வேலை நாட்களுக்குள் பதில்', contactSupportHours: 'ஆதரவு நேரம்',
    contactHoursNote: 'காலை 9:00 – மாலை 6:00 IST', contactImportantNotice: 'முக்கிய அறிவிப்பு',
    contactForCorrections: 'முடிவு திருத்தங்களுக்கு', subjectGeneral: 'பொது கேள்வி',
    subjectCorrection: 'முடிவு திருத்தம்', subjectFeedback: 'இணையதள கருத்து',
    subjectPrivacy: 'தனியுரிமை / தரவு கோரிக்கை', subjectOther: 'மற்றவை',

    discH1: 'மறுப்பு அறிக்கை', discSubtitle: 'இந்த இணையதளத்தில் இருந்து லாட்டரி முடிவு தகவலைப் பயன்படுத்தும் முன் இதைப் படிக்கவும்.',
    discInfoOnly: 'தகவல் இணையதளம் மட்டும்', discVerifySources: 'அதிகாரப்பூர்வ மூலங்களை சரிபார்க்கவும்',
    discNoGuarantee: 'வெற்றி உத்தரவாதம் இல்லை', discFinancialRisk: 'நிதி ஆபத்து',

    ppH1: 'தனியுரிமைக் கொள்கை', termsH1: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',

    dfH1: 'லாட்டரி படிவங்கள் மற்றும் பதிவிறக்கங்கள்',
    dfSubtitle: 'படிவங்கள் மற்றும் ஆவணங்களுக்கான வழிகாட்டியாக இந்தப் பக்கத்தைப் பயன்படுத்தவும்.',
    dfCommonDocs: 'பொதுவான ஆவணங்கள்', dfOfficialLinks: 'அதிகாரப்பூர்வ படிவ இணைப்புகள்', dfImportant: 'முக்கியம்',

    nf404: '404 பக்கம் கிடைக்கவில்லை', nfHint: 'பக்கத்தை ரூட்டரில் சேர்க்க மறந்துவிட்டீர்களா?',
  },
  ml: {
    home: 'ഹോം', results: 'ഫലങ്ങൾ', chart: 'ചാർട്ട്', bumper: 'ബമ്പർ',
    jackpot: 'ജാക്ക്‌പോട്ട്', schedule: 'ഷെഡ്യൂൾ', yesterdayResult: 'ഇന്നലെയുള്ള ഫലം',
    checkTicket: 'ടിക്കറ്റ് പരിശോധന', claimPrize: 'സമ്മാനം നേടുക', contact: 'ബന്ധപ്പെടുക',
    claimGuide: 'സമ്മാന ഗൈഡ്', guessingNumbers: 'ഗസ്സിംഗ് നമ്പറുകൾ',
    downloadForms: 'ഫോമുകൾ', faq: 'പതിവ് ചോദ്യങ്ങൾ', about: 'ഞങ്ങളെക്കുറിച്ച്',
    lotteryOffices: 'ലോട്ടറി ഓഫീസുകൾ', tools: 'ടൂളുകൾ', info: 'വിവരം',
    moreLotteries: 'കൂടുതൽ ലോട്ടറികൾ', resources: 'റിസോഴ്സുകൾ',
    bumperResults: 'ബമ്പർ ഫലങ്ങൾ', ticketChecker: 'ടിക്കറ്റ് പരിശോധന',
    privacyPolicy: 'സ്വകാര്യതാ നയം', aboutDisclaimer: 'വിവരം & നിരാകരണം',
    fullPrizeTable: 'പൂർണ്ണ സമ്മാന പട്ടിക', prizeTier: 'സമ്മാന നിലവാരം',
    winningNumbers: 'വിജയ നമ്പറുകൾ', amount: 'തുക', pending: 'കാത്തിരിക്കുന്നു',
    completeResult: 'പൂർണ്ണ ഫലം', tiersUpdated: 'നിലവാരങ്ങൾ പുതുക്കി',
    bumperDraw: 'ബമ്പർ ഡ്രോ', firstPrize: 'ഒന്നാം സമ്മാനം', todaysDraw: 'ഇന്നത്തെ ഡ്രോ',
    verificationStatus: 'സ്ഥിരീകരണ നില', notPublishedYet: 'ഇതുവരെ പ്രസിദ്ധീകരിച്ചിട്ടില്ല',
    verifiedResult: 'സ്ഥിരീകരിച്ച ഫലം', liveUpdate: 'തത്സമയ അപ്ഡേറ്റ്',

    disclaimer: 'നിരാകരണം', date: 'തീയതി', draw: 'ഡ്രോ', code: 'കോഡ്', lottery: 'ലോട്ടറി',
    viewArrow: 'കാണുക →', today: 'ഇന്ന്', tomorrow: 'നാളെ', days: 'ദിവസം', hours: 'മണിക്കൂർ',
    minutes: 'മിനിറ്റ്', seconds: 'സെക്കൻഡ്', quickLinks: 'വേഗ ലിങ്കുകൾ', notFound: 'കണ്ടെത്തിയില്ല',
    officeAnyAgent: 'ഏതെങ്കിലും അംഗീകൃത ഏജന്റ്', officeDistrictOffice: 'നിങ്ങളുടെ ജില്ലാ ലോട്ടറി ഓഫീസ്',
    officeDirectorateShort: 'ഡയറക്ടറേറ്റ്, തിരുവനന്തപുരം', ticketPrice: 'ടിക്കറ്റ് വില',

    homeH1: 'കേരള ലോട്ടറി ഫലം ഇന്ന്', homeSubtitle: 'നിങ്ങളുടെ ലോട്ടറി തിരഞ്ഞെടുക്കുക — ഫലങ്ങൾ ദിവസവും ഉച്ചയ്ക്ക് 3 മണിക്ക് പുതുക്കുന്നു.',
    homeNotice: 'കേരള ലോട്ടറി ഫലങ്ങൾ ദിവസവും ഉച്ചയ്ക്ക് 3 മണിക്ക് ഇവിടെ പുതുക്കുന്നു. നിങ്ങളുടെ ലോട്ടറി തിരഞ്ഞെടുത്ത് ഇന്നത്തെ ഫലം കാണുക.',
    homeHolidayNotice: '{name} — ഇന്ന് കേരള ലോട്ടറി ഡ്രോ ഇല്ല, അതിനാൽ പുതിയ ഫലവുമില്ല. നാളെ പതിവുപോലെ തുടരും.',
    homeDrawsEvery: 'ഓരോ', homeAt: 'മണിക്ക് നടക്കുന്നു', homeNoResultYet: 'ഇതുവരെ ഫലം പ്രസിദ്ധീകരിച്ചിട്ടില്ല. ഉച്ചയ്ക്ക് 3 മണിക്ക് ശേഷം നോക്കുക.',
    homeViewPagePrefix: '', homeViewPageSuffix: 'പേജ് കാണുക →', homeWeeklySchedule: 'ആഴ്ചയിലെ ലോട്ടറി ഷെഡ്യൂൾ',
    homeViewGuidelines: 'മാർഗ്ഗനിർദ്ദേശങ്ങൾ കാണുക', homeQuickLinks: 'വേഗ ലിങ്കുകൾ',
    homeCheckTicketDesc: 'നിങ്ങളുടെ ടിക്കറ്റ് നമ്പർ വിജയിച്ചോ എന്ന് പരിശോധിക്കുക',
    homeHowToClaim: 'സമ്മാനം നേടുന്ന വിധം', homeHowToClaimDesc: 'സമ്മാനം നേടാനുള്ള ഘട്ടം ഘട്ടമായുള്ള ഗൈഡ്',
    homeGuessingDesc: 'ഇന്നത്തെ ഗസ്സിംഗ് നമ്പറുകൾ — വിനോദത്തിന് മാത്രം',
    homeFaqDesc: 'ഫലങ്ങൾ, സമ്മാനങ്ങൾ, ക്ലെയിമുകൾ എന്നിവയെക്കുറിച്ചുള്ള പൊതു ചോദ്യങ്ങൾ',

    scheduleH1: 'കേരള ലോട്ടറി ആഴ്ച ഷെഡ്യൂൾ',
    scheduleSubtitle: 'ഓരോ കേരള ലോട്ടറി ഡ്രോ ദിവസവും സമയവും ഒരു പട്ടികയിൽ.',
    scheduleWeeklyTable: 'ആഴ്ച ഡ്രോ ഷെഡ്യൂൾ', scheduleDay: 'ദിവസം', scheduleDrawTime: 'ഡ്രോ സമയം',
    scheduleFooterNote: 'ബമ്പർ പ്രത്യേക ഡ്രോകൾ ഒഴികെ, എല്ലാ ഡ്രോകളും ദിവസവും ഉച്ചയ്ക്ക് 3:00 മണിക്ക് നടക്കുന്നു.',
    scheduleSpecialDraw: 'പ്രത്യേക ഡ്രോ', scheduleBumperLink: 'ബമ്പർ കൗണ്ട്ഡൗൺ & വിവരങ്ങൾ കാണുക →',

    jackpotH1: 'കേരള ലോട്ടറി ജാക്ക്‌പോട്ട്',
    jackpotSubtitle: 'കേരള ലോട്ടറിയിലെ ഏറ്റവും വലിയ സമ്മാനങ്ങൾ — ഇന്നത്തെ ₹1 കോടി ദിവസേനയുള്ള ജാക്ക്‌പോട്ടും അടുത്ത ബമ്പർ ജാക്ക്‌പോട്ടും, സമീപകാല വിജയികളോടെ.',
    jackpotBiggest: 'ഏറ്റവും വലിയ ജാക്ക്‌പോട്ട്', jackpotUnderway: 'ഡ്രോ നടക്കുന്നു — ജാക്ക്‌പോട്ട് ഫലം ഡ്രോ ദിവസം ഇവിടെ പ്രസിദ്ധീകരിക്കും.',
    jackpotBumperLink: 'പൂർണ്ണ ബമ്പർ വിവരങ്ങൾ & മുൻകാല ഫലങ്ങൾ →', jackpotDailyTitle: 'ഇന്നത്തെ ദിവസ ജാക്ക്‌പോട്ട് — ₹1 കോടി ഒന്നാം സമ്മാനം',
    jackpotDailySubtitle: 'ഓരോ ദിവസ കേരള ലോട്ടറിക്കും ₹1 കോടി ഒന്നാം സമ്മാനം ഉണ്ട്, ഉച്ചയ്ക്ക് 3:00 മണിക്ക് നടക്കുന്നു.',
    jackpotDrawDay: 'ഡ്രോ ദിവസം', jackpotRecentWinners: 'സമീപകാല ജാക്ക്‌പോട്ട് വിജയികൾ',
    jackpotWinnersEmpty: 'സമീപകാല വിജയികൾ ഇവിടെ കാണിക്കും.', jackpotFirstPrizeWinner: 'ഒന്നാം സമ്മാന വിജയി',
    jackpotDisclaimerBody: 'ലോട്ടറി ഒരു ഭാഗ്യക്കളിയാണ്. കാണിച്ചിരിക്കുന്ന ജാക്ക്‌പോട്ട് തുകകൾ പ്രഖ്യാപിച്ച സമ്മാന ഘടനയാണ്, അത് ഔദ്യോഗിക അറിയിപ്പനുസരിച്ച് മാറാം. എപ്പോഴും കേരള സംസ്ഥാന ലോട്ടറി വകുപ്പുമായി സ്ഥിരീകരിക്കുക.',

    claimPrizeH1: 'നിങ്ങളുടെ കേരള ലോട്ടറി സമ്മാനം നേടുക',
    claimPrizeSubtitle: 'നിങ്ങളുടെ സമ്മാന തുക തിരഞ്ഞെടുത്ത്, എവിടെ പോകണം, കടൈസി തീയതി, എന്ത് കൊണ്ടുവരണം എന്ന് കാണുക.',
    claimPrizeStep1: '1. നിങ്ങളുടെ സമ്മാന തുക തിരഞ്ഞെടുക്കുക', claimPrizeClaimAt: 'നേടേണ്ട സ്ഥലം:',
    claimPrizeDeadlineLabel: 'അവസാന തീയതി:', claimPrizeNoteLabel: 'കുറിപ്പ്:',
    claimPrizeStep2: '2. കൊണ്ടുവരേണ്ട രേഖകൾ', claimPrizeStep3: '3. യാത്രയ്ക്ക് മുമ്പ് സ്ഥിരീകരിക്കുക',
    claimPrizeVerifyText: 'ഓഫീസിൽ പോകുന്നതിന് മുമ്പ് നിങ്ങളുടെ ടിക്കറ്റ് നമ്പർ, ഡ്രോ കോഡ്, തീയതി ഔദ്യോഗിക ഫലവുമായി സ്ഥിരീകരിക്കുക. ഇവിടെ സ്ഥിരീകരിക്കുക',
    claimPrizeOr: 'അല്ലെങ്കിൽ ഈ സൈറ്റിലെ നിങ്ങളുടെ ഡ്രോയുടെ ഫല പേജിൽ.',
    claimPrizeGuideCta: 'പൂർണ്ണ ഘട്ടം ഘട്ടമായുള്ള പ്രക്രിയ, തമിഴ്നാട് ഗൈഡൻസ്, TDS വിവരങ്ങൾ വേണോ?',
    claimPrizeGuideLink: 'പൂർണ്ണ ക്ലെയിം ഗൈഡ് വായിക്കുക →',
    claimPrizeDisclaimerBody: 'ഈ പേജ് വിവരദായകം മാത്രമാണ്. നിയമങ്ങൾ അറിയിപ്പില്ലാതെ മാറാം — എപ്പോഴും ഔദ്യോഗിക കേരള സംസ്ഥാന ലോട്ടറി വകുപ്പുമായി നേരിട്ട് നടപ്പിലുള്ള പ്രക്രിയ സ്ഥിരീകരിക്കുക.',

    chartH1: 'കേരള ലോട്ടറി ചാർട്ട്',
    chartSubtitle: 'ഓരോ കേരള ലോട്ടറി ഫലവും ഒരു നോട്ടത്തിൽ — ഓരോ ദിവസ ഡ്രോയുടെയും ഒന്നാം സമ്മാനം, ഏറ്റവും പുതിയത് ആദ്യം.',
    chartAll: 'എല്ലാം', chartEmpty: 'ഈ മാസത്തേക്ക് ഇതുവരെ ഫലങ്ങളില്ല.',
    chartShowingPrefix: 'കാണിക്കുന്നു', chartDrawSingular: 'ഡ്രോ', chartDrawPlural: 'ഡ്രോകൾ',
    chartShowingSuffix: '. പൂർണ്ണ സമ്മാന പട്ടിക, സാന്ത്വന സമ്മാനങ്ങൾ, താഴ്ന്ന നിലവാരങ്ങൾ കാണാൻ ഏത് വരിയിലും ടാപ്പ് ചെയ്യുക.',

    bumperH1: 'കേരള ബമ്പർ ലോട്ടറി — അടുത്ത ഡ്രോ & ഫലങ്ങൾ',
    bumperSubtitle: 'കേരളയുടെ സീസണൽ ബമ്പർ ലോട്ടറികൾ വർഷത്തിലെ ഏറ്റവും വലിയ സമ്മാനങ്ങൾ വഹിക്കുന്നു — ₹12 കോടി വരെ. അടുത്ത ബമ്പർ ഡ്രോ തീയതി, സമ്മാനം, തത്സമയ കൗണ്ട്ഡൗൺ, മുൻകാല ബമ്പർ ഫലങ്ങൾ കാണുക.',
    bumperNextBumper: 'അടുത്ത ബമ്പർ', bumperUnderway: 'ഡ്രോ നടക്കുന്നു — ഫലങ്ങൾ ഡ്രോ ദിവസം ഇവിടെ പ്രസിദ്ധീകരിക്കും. ഉടൻ തിരികെ വരൂ!',
    bumperSeries: 'സീരീസ്', bumperVenue: 'ഡ്രോ സ്ഥലം', bumperPastResults: 'മുൻകാല ബമ്പർ ഫലങ്ങൾ',
    bumperPastEmpty: 'മുൻകാല ബമ്പർ ഫലങ്ങൾ ഇവിടെ കാണിക്കും.', bumperAboutTitle: 'കേരള ബമ്പർ ലോട്ടറികളെക്കുറിച്ച്',
    bumperAboutBody: 'കേരള ഓരോ വർഷവും ആറ് സീസണൽ ബമ്പർ ലോട്ടറികൾ നടത്തുന്നു — സമ്മർ, വിഷു, മൺസൂൺ, തിരുവോണം, പൂജ, ക്രിസ്മസ്-പുതുവർഷം — ഓരോന്നിനും ദിവസ ഡ്രോയേക്കാൾ വളരെ വലിയ സമ്മാനങ്ങൾ. ടിക്കറ്റുകൾ ആഴ്ചകൾക്ക് മുമ്പ് വിറ്റുതീരും, ഡ്രോകൾ തിരുവനന്തപുരം ഗോർക്കി ഭവനിൽ നടക്കുന്നു.',

    yestH1: 'ഇന്നലെയുള്ള കേരള ലോട്ടറി ഫലം',
    yestSubtitle: 'ഇന്നലെയുള്ള കേരള ലോട്ടറി ഡ്രോയുടെ പൂർണ്ണ ഫലം — എല്ലാ സമ്മാന നിലവാരങ്ങളും, സ്വയമേവ പുതുക്കുന്നു.',
    yestNotAvailable: 'ഇന്നലെയുള്ള ഫലം ഇതുവരെ ലഭ്യമല്ല. കുറച്ച് കഴിഞ്ഞ് നോക്കുക, അല്ലെങ്കിൽ ഇന്നത്തെ ഫലം കാണുക.',
    yestBackToToday: '← ഇന്നത്തെ ഫലം',
    yestNotPublishedYet: 'ഇന്നലെയുള്ള ഡ്രോ ഫലം ഇതുവരെ പ്രസിദ്ധീകരിച്ചിട്ടില്ല — ലഭ്യമായ ഏറ്റവും പുതിയ ഫലം താഴെ കാണിക്കുന്നു',
    yestDrawHeldAt: 'ഡ്രോ നടന്ന സമയം', yestFirstPrizeColon: 'IST. ഒന്നാം സമ്മാനം:',
    yestViewFull: 'പൂർണ്ണ ഫല പേജ് കാണുക →', yestOtherDraws: 'മറ്റ് സമീപകാല ഡ്രോകൾ',
    yestPrize: 'സമ്മാനം', yestWinningNumbers: 'വിജയ നമ്പർ(കൾ)',

    ctH1: 'കേരള ലോട്ടറി ടിക്കറ്റ് പരിശോധന',
    ctSubtitle: 'നിങ്ങളുടെ ടിക്കറ്റ് നമ്പർ സമീപകാല എല്ലാ ഡ്രോകളിലും സമ്മാനം നേടിയോ എന്ന് പരിശോധിക്കുക.',
    ctHowTo: 'നിങ്ങളുടെ ടിക്കറ്റ് നമ്പർ എങ്ങനെ നൽകാം', ctFullBest: 'പൂർണ്ണ ടിക്കറ്റ് (മികച്ചത്)',
    ct6DigitLabel: '6 അക്ക നമ്പർ', ctLast4Label: 'അവസാന 4 അക്കങ്ങൾ',
    ctFullDesc: 'സീരീസ് + 6 അക്ക നമ്പർ — കൃത്യമായ പൊരുത്തം', ct6DigitDesc: 'എല്ലാ സീരീസുകളിലും നമ്പർ പൊരുത്തപ്പെടുത്തുന്നു',
    ctLast4Desc: 'വേഗ പരിശോധന — ഒന്നിലധികം പൊരുത്തങ്ങൾ കാണിക്കാം',
    ctInputLabel: 'നിങ്ങളുടെ കേരള ലോട്ടറി ടിക്കറ്റ് നമ്പർ നൽകുക', ctClear: 'മായ്ക്കുക',
    ctNoMatch: 'പൊരുത്തം കണ്ടെത്തിയില്ല', ctNotInData: 'ഞങ്ങളുടെ നിലവിലെ ഡാറ്റയിൽ ഇല്ല. ഇവിടെ സ്ഥിരീകരിക്കുക',
    ctCongrats: 'അഭിനന്ദനങ്ങൾ!', ctIsWinner: 'ഒരു വിജയിയാണ്!',
    ctVerifyOfficially: 'ഔദ്യോഗികമായി സ്ഥിരീകരിക്കുക', ctBeforeClaiming: 'നേടുന്നതിന് മുമ്പ്. 30 ദിവസത്തിനകം നേടുക.',
    ctPartialMatch: 'ഭാഗിക പൊരുത്തം', ctPartialMatches: 'ഭാഗിക പൊരുത്തങ്ങൾ',
    ctEnterFull: 'സീരീസ് അക്ഷരങ്ങളോടെ പൂർണ്ണ ടിക്കറ്റ് നൽകുക (ഉദാ.', ctToConfirm: ') കൃത്യമായി സ്ഥിരീകരിക്കാൻ.',
    ctSearched: 'തിരഞ്ഞത്', ctDrawsAcross: 'ഡ്രോകൾ, ഇതിൽ', ctLotteries: 'ലോട്ടറികൾ',
    ctImportant: 'പ്രധാനം:',
    ctImportantBody: 'നേടുന്നതിന് മുമ്പ് എപ്പോഴും statelottery.kerala.gov.in ൽ സ്ഥിരീകരിക്കുക. ഡ്രോ തീയതി മുതൽ 30 ദിവസത്തിനകം സമ്മാനങ്ങൾ നേടണം.',
    ctExactMatch: 'കൃത്യമായ പൊരുത്തം', ctPartialVerify: 'ഭാഗികം — സീരീസ് സ്ഥിരീകരിക്കുക',

    gnH1: 'കേരള ലോട്ടറി ഇന്നത്തെ ഗസ്സിംഗ് നമ്പറുകൾ',
    gnSubtitle: 'എല്ലാ കേരള ലോട്ടറി ഡ്രോകൾക്കും ABC ബോർഡ് നമ്പറുകളും 4 അക്ക കോമ്പിനേഷനുകളും. ഉച്ചയ്ക്ക് 3 മണിക്ക് മുമ്പ് ദിവസവും പുതുക്കുന്നു.',
    gnUpdated: 'പുതുക്കിയത്:', gnUpdatedNightly: 'രാത്രി ദിവസവും പുതുക്കുന്നു', gnSeePast: 'കഴിഞ്ഞ ദിവസങ്ങൾ കാണുക →',
    gnByLottery: 'ലോട്ടറി പ്രകാരം ഗസ്സിംഗ് നമ്പറുകൾ',
    gnByLotterySub: 'ഓരോ ലോട്ടറിക്കും പ്രത്യേക ഗസ്സിംഗ് നമ്പറുകൾ, ഹോട്ട്/കോൾഡ് നമ്പറുകൾ, തമിഴ് ഗൈഡിന് ക്ലിക്ക് ചെയ്യുക',
    gnAbcTitle: 'ഇന്നത്തെ ABC ബോർഡ് നമ്പറുകൾ', gnAbcSub: 'അടിസ്ഥാന A, B, C മൂല്യങ്ങൾ — എല്ലാ കോമ്പിനേഷനുകളും ഈ മൂന്ന് അക്കങ്ങളിൽ നിന്നാണ്',
    gnBoard: 'ബോർഡ്', gnTwoDigit: 'രണ്ട് അക്ക കോമ്പിനേഷനുകൾ', gnThreeDigit: 'മൂന്ന് അക്ക നമ്പറുകൾ',
    gnFourDigit: 'നാല് അക്ക പിക്കുകൾ', gnFourDigitSub: 'നിങ്ങളുടെ ടിക്കറ്റിന്റെ അവസാന 4 അക്കങ്ങളുമായി പരിശോധിക്കുക',
    gnSeriesFreqTitle: 'സീരീസ് ആവൃത്തി — ഒന്നാം സമ്മാന വിജയങ്ങൾ',
    gnSeriesFreqSub: 'സ്ഥിരീകരിച്ച എല്ലാ ഡ്രോകളിലും ഓരോ 2-അക്ഷര സീരീസും ഒന്നാം സമ്മാനം നേടിയ എണ്ണം. വരിസ ചെയ്യാൻ ഒരു കോളം ക്ലിക്ക് ചെയ്യുക.',
    gnSeriesEmpty: 'സ്ഥിരീകരിച്ച ഫലങ്ങൾ ലഭ്യമായാൽ സീരീസ് ഡാറ്റ ഇവിടെ കാണിക്കും.',
    gnHotTitle: '🔥 ഹോട്ട് നമ്പറുകൾ — കഴിഞ്ഞ 30 ഡ്രോകൾ',
    gnHotSub: 'ഏറ്റവും പുതിയ 30 ഡ്രോകളിൽ നിന്ന്, ഓരോ സമ്മാന നിലവാരത്തിലും ഏറ്റവും കൂടുതൽ കാണുന്ന 5 അവസാന-4-അക്ക അവസാനങ്ങൾ.',
    gnHotEmpty: 'ഡ്രോകൾ ലഭ്യമായാൽ ഹോട്ട് നമ്പർ ഡാറ്റ ഇവിടെ കാണിക്കും.', gnAppeared: 'പ്രത്യക്ഷപ്പെട്ടു',
    gnDisclaimerBody: 'ഗസ്സിംഗ് നമ്പറുകൾ വിനോദത്തിന് മാത്രമാണ്. ഒരു നമ്പറും പ്രവചിക്കാനോ ഉറപ്പ് നൽകാനോ കഴിയില്ല.',
    gnHot: 'ഹോട്ട്', gnSeriesCol: 'സീരീസ്', gnWinsCol: 'വിജയങ്ങൾ', gnLastWonDateCol: 'അവസാനം നേടിയ തീയതി',
    gnLastWonDrawCodeCol: 'അവസാനം നേടിയ ഡ്രോ കോഡ്',

    resultNotFound: 'ഫലം കണ്ടെത്തിയില്ല.', lotteryNotFound: 'ലോട്ടറി കണ്ടെത്തിയില്ല.', resultLabel: 'ഫലം',
    moreResultsPrefix: 'കൂടുതൽ', moreResultsSuffix: 'ഫലങ്ങൾ', importantDisclaimer: 'പ്രധാന നിരാകരണം',
    archiveDisclaimerBody: 'ഈ ആർക്കൈവ് പേജ് വിവരദായകം മാത്രമാണ്. സമ്മാന ക്ലെയിമുകൾക്ക് മുമ്പ് എപ്പോഴും ഔദ്യോഗിക കേരള ലോട്ടറി പ്രസിദ്ധീകരണങ്ങളുമായി വിജയ നമ്പറുകൾ സ്ഥിരീകരിക്കുക.',
    lrDisclaimerBody: 'ഈ പേജിൽ പ്രസിദ്ധീകരിച്ച കേരള ലോട്ടറി ഫലങ്ങൾ വിവരദായകം മാത്രമാണ്. ഈ വെബ്സൈറ്റ് കേരള സർക്കാരുമായി ബന്ധപ്പെട്ടതല്ല. സമ്മാനം ക്ലെയിം ചെയ്യുന്നതിന് മുമ്പ് ഔദ്യോഗിക ഗസറ്റുമായി ഫലങ്ങൾ സ്ഥിരീകരിക്കുക.',
    lrHolidayNotice: '{name} — ഇന്ന് കേരള ലോട്ടറി ഡ്രോ ഇല്ല. താഴെയുള്ള ഫലം ഏറ്റവും പുതിയ പ്രസിദ്ധീകരിച്ച ഡ്രോയാണ്, ഇന്നത്തേതല്ല. സാധാരണ ഫലങ്ങൾ നാളെ തുടരും.',
    lrH1Suffix: 'കേരള ലോട്ടറി ഫലം ഇന്ന്', viewFirstPrizeWinner: '🥇 ഒന്നാം സമ്മാന വിജയി പേജ് കാണുക →',
    daResultArchiveDesc: '{date} ഡ്രോ ആർക്കൈവ് — നിലയും, ഉറവിട ലിങ്കുകളും, സമ്മാന പട്ടികയും, സ്ഥിരീകരണ മാർഗ്ഗനിർദ്ദേശവും.',

    rdDrawDetails: 'ഡ്രോ വിവരങ്ങൾ', rdDrawCode: 'ഡ്രോ കോഡ്', rdDrawDate: 'ഡ്രോ തീയതി', rdStatus: 'നില',
    rdFirstPrizeDistrict: 'ഒന്നാം സമ്മാന ജില്ല', rdTotalWinners: 'മൊത്തം വിജയികൾ',
    rdTotalDistribution: 'മൊത്തം സമ്മാന വിതരണം', rdSource: 'ഉറവിടം', rdOfficialSource: 'ഔദ്യോഗിക ഉറവിടം',
    rdDownloadPdf: 'PDF ഡൗൺലോഡ്', rdViewImage: 'ഫല ചിത്രം കാണുക',

    fpNotFound: 'ഫലം കണ്ടെത്തിയില്ല', fpBackHome: '← ഹോമിലേക്ക് മടങ്ങുക', fpFirstPrizeWinner: 'ഒന്നാം സമ്മാന വിജയി',
    fpResultAwaiting: 'ഫലം കാത്തിരിക്കുന്നു', fpDrawAt: 'ഡ്രോ സമയം', fpCheckBack: 'ഉച്ചയ്ക്ക് 3 മണിക്ക് ശേഷം നോക്കുക',
    fpSoldIn: 'വിറ്റ സ്ഥലം', fpKerala: 'കേരള', fpViewArea: 'പ്രദേശം കാണുക →',
    fpLiveVerify: 'തത്സമയം — നേടുന്നതിന് മുമ്പ് സ്ഥിരീകരിക്കുക', fpTop3Title: 'ആദ്യ 3 സമ്മാന വിജയികൾ',
    fp1stPrizeCrumb: 'ഒന്നാം സമ്മാനം', fpDidYouWin: 'നിങ്ങൾ വിജയിച്ചോ?',
    fpVerifyBody: 'നേടുന്നതിന് മുമ്പ് statelottery.kerala.gov.in ൽ നിങ്ങളുടെ ടിക്കറ്റ് സ്ഥിരീകരിക്കുക. തിരുവനന്തപുരം കേരള ലോട്ടറി ഡയറക്ടറേറ്റിൽ 30 ദിവസത്തിനകം നേടുക.',
    fpDisclaimer: 'ഈ പേജ് വിവരദായകം മാത്രമാണ്. സമ്മാനം ക്ലെയിം ചെയ്യുന്നതിന് മുമ്പ് ഔദ്യോഗിക ഗസറ്റുമായി സ്ഥിരീകരിക്കുക.',

    cgH1: 'കേരള ലോട്ടറി സമ്മാനം നേടുന്ന വിധം',
    cgSubtitle: 'ടിക്കറ്റ് സ്ഥിരീകരണം മുതൽ സമ്മാന പണം വരെ ഘട്ടം ഘട്ടമായുള്ള ഗൈഡ് — തമിഴ്നാട് വസിക്കുന്നവർക്കും.',
    cgDeadlinesTitle: 'സമ്മാന ക്ലെയിം അവസാന തീയതികളും സ്ഥലങ്ങളും', cgPrizeCategory: 'സമ്മാന വിഭാഗം',
    cgClaimLocation: 'ക്ലെയിം സ്ഥലം', cgTimeLimit: 'സമയ പരിധി', cgProcessTitle: 'ക്ലെയിം പ്രക്രിയ',
    cgTamilNaduTitle: 'തമിഴ്നാട് / മറ്റ് സംസ്ഥാനങ്ങളിൽ നിന്ന് ക്ലെയിം ചെയ്യൽ', cgTaxTitle: 'വിജയത്തിനുള്ള നികുതി (TDS)',

    faqH1: 'കേരള ലോട്ടറി പതിവ് ചോദ്യങ്ങൾ',
    faqSubtitle: 'ഫലങ്ങൾ, ടിക്കറ്റ് പരിശോധന, സമ്മാനം നേടൽ, ഉത്തരവാദിത്ത ഉപയോഗം എന്നിവയെക്കുറിച്ചുള്ള പൊതു ചോദ്യങ്ങൾ.',

    loH1: 'കേരള ലോട്ടറി ഓഫീസുകൾ',
    loSubtitle: 'കേരള സംസ്ഥാന ലോട്ടറി ഡയറക്ടറേറ്റും എല്ലാ 14 ജില്ലാ ലോട്ടറി ഓഫീസുകളുടെയും വിവരപ്പട്ടിക.',
    loWhichOffice: '📋 ഏത് ഓഫീസ് സന്ദർശിക്കണം?',
    loAllPrizesNote: 'എല്ലാ സമ്മാനങ്ങളും ഡ്രോ തീയതി മുതൽ 30 ദിവസത്തിനകം ക്ലെയിം ചെയ്യണം. യഥാർത്ഥ ടിക്കറ്റ്, ആധാർ, PAN, ബാങ്ക് പാസ്ബുക്ക് കൊണ്ടുവരുക.',
    loHeadquarters: 'ആസ്ഥാനം', loFax: 'ഫാക്സ്:', loDistrictOfficesTitle: 'ജില്ലാ ലോട്ടറി ഓഫീസുകൾ',
    loTapExpand: 'വിപുലീകരിക്കാൻ ടാപ്പ് ചെയ്യുക', loViewMaps: 'ഗൂഗിൾ മാപ്പിൽ കാണുക', loBeforeVisitTitle: '⚠️ സന്ദർശിക്കുന്നതിന് മുമ്പ്',

    aboutH1: 'Kerala Ticket Results-നെക്കുറിച്ച്',
    aboutSubtitle: 'കേരള ലോട്ടറി ഫല അപ്ഡേറ്റുകൾക്കുള്ള വിശ്വസ്ത, സ്വതന്ത്ര ഉറവിടം — കൃത്യതയ്ക്കും വേഗതയ്ക്കുമായി നിർമ്മിച്ചത്.',
    aboutWhoWeAre: 'ഞങ്ങൾ ആരാണ്', aboutMission: 'ഞങ്ങളുടെ ലക്ഷ്യം', aboutHowWeWork: 'ഞങ്ങൾ എങ്ങനെ പ്രവർത്തിക്കുന്നു',
    aboutTrustPrinciples: 'ഞങ്ങളുടെ വിശ്വാസ തത്വങ്ങൾ', aboutLegalDisclaimer: 'നിയമപരമായ നിരാകരണം',
    aboutLotteriesCovered: 'ഉൾപ്പെടുന്ന ലോട്ടറികൾ', aboutResultUpdates: 'ഫല അപ്ഡേറ്റുകൾ',
    aboutDrawTimeIST: 'ഡ്രോ സമയം IST', aboutResultsPublished: 'ഫലങ്ങൾ പ്രസിദ്ധീകരിച്ചു',
    aboutLotteriesWeCover: 'ഞങ്ങൾ ഉൾപ്പെടുത്തുന്ന ലോട്ടറികൾ',

    contactH1: 'ഞങ്ങളെ ബന്ധപ്പെടുക', contactSubtitle: 'ഫല തിരുത്തലുകൾ, അഭിപ്രായങ്ങൾ അല്ലെങ്കിൽ പൊതു ചോദ്യങ്ങൾ — ഞങ്ങൾ ഓരോ സന്ദേശവും വായിക്കുന്നു.',
    contactSendMessage: 'സന്ദേശം അയക്കുക', contactReplyTime: '2 പ്രവൃത്തി ദിവസത്തിനകം മറുപടി നൽകാൻ ശ്രമിക്കുന്നു.',
    contactSentTitle: 'സന്ദേശം അയച്ചു!', contactSendAnother: 'മറ്റൊന്ന് അയക്കുക', contactYourName: 'നിങ്ങളുടെ പേര് *',
    contactEmail: 'ഇമെയിൽ വിലാസം *', contactSubject: 'വിഷയം *', contactLotteryName: 'ലോട്ടറി പേര്',
    contactDrawCode: 'ഡ്രോ കോഡ്', contactMessage: 'സന്ദേശം *', contactHowCanWeHelp: 'ഞങ്ങൾക്ക് എങ്ങനെ സഹായിക്കാം?',
    contactErrorMsg: 'എന്തോ കുഴപ്പം സംഭവിച്ചു. വീണ്ടും ശ്രമിക്കുക അല്ലെങ്കിൽ നേരിട്ട് ഇമെയിൽ ചെയ്യുക.',
    contactSending: 'അയക്കുന്നു…', contactSendBtn: 'സന്ദേശം അയക്കുക →', contactEmailLabel: 'ഇമെയിൽ',
    contactResponseNote: '2 പ്രവൃത്തി ദിവസത്തിനകം മറുപടി', contactSupportHours: 'സഹായ സമയം',
    contactHoursNote: 'രാവിലെ 9:00 – വൈകുന്നേരം 6:00 IST', contactImportantNotice: 'പ്രധാന അറിയിപ്പ്',
    contactForCorrections: 'ഫല തിരുത്തലുകൾക്ക്', subjectGeneral: 'പൊതു അന്വേഷണം',
    subjectCorrection: 'ഫല തിരുത്തൽ', subjectFeedback: 'വെബ്സൈറ്റ് അഭിപ്രായം',
    subjectPrivacy: 'സ്വകാര്യത / ഡാറ്റ അഭ്യർത്ഥന', subjectOther: 'മറ്റുള്ളവ',

    discH1: 'നിരാകരണം', discSubtitle: 'ഈ വെബ്സൈറ്റിൽ നിന്നുള്ള ലോട്ടറി ഫല വിവരങ്ങൾ ഉപയോഗിക്കുന്നതിന് മുമ്പ് ഇത് വായിക്കുക.',
    discInfoOnly: 'വിവരദായക വെബ്സൈറ്റ് മാത്രം', discVerifySources: 'ഔദ്യോഗിക ഉറവിടങ്ങൾ സ്ഥിരീകരിക്കുക',
    discNoGuarantee: 'വിജയ ഉറപ്പില്ല', discFinancialRisk: 'സാമ്പത്തിക അപകടസാധ്യത',

    ppH1: 'സ്വകാര്യതാ നയം', termsH1: 'നിബന്ധനകളും വ്യവസ്ഥകളും',

    dfH1: 'ലോട്ടറി ഫോമുകളും ഡൗൺലോഡുകളും',
    dfSubtitle: 'ഫോമുകൾക്കും രേഖകൾക്കുമുള്ള ഗൈഡായി ഈ പേജ് ഉപയോഗിക്കുക.',
    dfCommonDocs: 'സാധാരണ രേഖകൾ', dfOfficialLinks: 'ഔദ്യോഗിക ഫോം ലിങ്കുകൾ', dfImportant: 'പ്രധാനം',

    nf404: '404 പേജ് കണ്ടെത്തിയില്ല', nfHint: 'പേജ് റൂട്ടറിൽ ചേർക്കാൻ മറന്നോ?',
  },
  hi: {
    home: 'होम', results: 'परिणाम', chart: 'चार्ट', bumper: 'बम्पर',
    jackpot: 'जैकपॉट', schedule: 'शेड्यूल', yesterdayResult: 'कल का परिणाम',
    checkTicket: 'टिकट जांच', claimPrize: 'पुरस्कार पाएं', contact: 'संपर्क करें',
    claimGuide: 'पुरस्कार गाइड', guessingNumbers: 'अनुमान संख्या',
    downloadForms: 'फॉर्म', faq: 'सामान्य प्रश्न', about: 'हमारे बारे में',
    lotteryOffices: 'लॉटरी कार्यालय', tools: 'टूल्स', info: 'जानकारी',
    moreLotteries: 'अन्य लॉटरी', resources: 'संसाधन',
    bumperResults: 'बम्पर परिणाम', ticketChecker: 'टिकट जांच',
    privacyPolicy: 'गोपनीयता नीति', aboutDisclaimer: 'जानकारी और अस्वीकरण',
    fullPrizeTable: 'पूरी पुरस्कार सूची', prizeTier: 'पुरस्कार स्तर',
    winningNumbers: 'विजेता नंबर', amount: 'राशि', pending: 'प्रतीक्षित',
    completeResult: 'पूरा परिणाम', tiersUpdated: 'स्तर अपडेट किए गए',
    bumperDraw: 'बम्पर ड्रॉ', firstPrize: 'पहला पुरस्कार', todaysDraw: 'आज का ड्रॉ',
    verificationStatus: 'सत्यापन स्थिति', notPublishedYet: 'अभी प्रकाशित नहीं हुआ',
    verifiedResult: 'सत्यापित परिणाम', liveUpdate: 'लाइव अपडेट',

    disclaimer: 'अस्वीकरण', date: 'तारीख', draw: 'ड्रॉ', code: 'कोड', lottery: 'लॉटरी',
    viewArrow: 'देखें →', today: 'आज', tomorrow: 'कल', days: 'दिन', hours: 'घंटे',
    minutes: 'मिनट', seconds: 'सेकंड', quickLinks: 'त्वरित लिंक', notFound: 'नहीं मिला',
    officeAnyAgent: 'कोई भी अधिकृत एजेंट', officeDistrictOffice: 'आपका जिला लॉटरी कार्यालय',
    officeDirectorateShort: 'निदेशालय, तिरुवनंतपुरम', ticketPrice: 'टिकट मूल्य',

    homeH1: 'केरल लॉटरी परिणाम आज', homeSubtitle: 'अपनी लॉटरी चुनें — परिणाम रोज़ाना दोपहर 3 बजे अपडेट होते हैं।',
    homeNotice: 'केरल लॉटरी परिणाम यहां रोज़ाना दोपहर 3 बजे अपडेट होते हैं। अपनी लॉटरी चुनें और आज का परिणाम देखें।',
    homeHolidayNotice: '{name} — आज केरल लॉटरी ड्रॉ नहीं है, इसलिए कोई नया परिणाम नहीं है। कल हमेशा की तरह जारी रहेगा।',
    homeDrawsEvery: 'हर', homeAt: 'बजे होता है', homeNoResultYet: 'अभी परिणाम प्रकाशित नहीं हुआ है। दोपहर 3 बजे के बाद देखें।',
    homeViewPagePrefix: '', homeViewPageSuffix: 'पेज देखें →', homeWeeklySchedule: 'साप्ताहिक लॉटरी शेड्यूल',
    homeViewGuidelines: 'गाइडलाइन देखें', homeQuickLinks: 'त्वरित लिंक',
    homeCheckTicketDesc: 'अपना टिकट नंबर डालकर जांचें कि आपने कोई पुरस्कार जीता है या नहीं',
    homeHowToClaim: 'पुरस्कार कैसे प्राप्त करें', homeHowToClaimDesc: 'पुरस्कार पाने की चरण-दर-चरण गाइड',
    homeGuessingDesc: 'आज की अनुमान संख्या — केवल मनोरंजन के लिए',
    homeFaqDesc: 'परिणाम, पुरस्कार और दावों से जुड़े सामान्य प्रश्न',

    scheduleH1: 'केरल लॉटरी साप्ताहिक शेड्यूल',
    scheduleSubtitle: 'हर केरल लॉटरी ड्रॉ का दिन और समय एक ही टेबल में।',
    scheduleWeeklyTable: 'साप्ताहिक ड्रॉ शेड्यूल', scheduleDay: 'दिन', scheduleDrawTime: 'ड्रॉ समय',
    scheduleFooterNote: 'बम्पर विशेष ड्रॉ को छोड़कर, सभी ड्रॉ रोज़ाना दोपहर 3:00 बजे होते हैं।',
    scheduleSpecialDraw: 'विशेष ड्रॉ', scheduleBumperLink: 'बम्पर काउंटडाउन और विवरण देखें →',

    jackpotH1: 'केरल लॉटरी जैकपॉट',
    jackpotSubtitle: 'केरल लॉटरी के सबसे बड़े पुरस्कार — आज का ₹1 करोड़ दैनिक जैकपॉट और अगले बम्पर ड्रॉ का शीर्ष पुरस्कार, हाल के विजेताओं के साथ।',
    jackpotBiggest: 'सबसे बड़ा जैकपॉट', jackpotUnderway: 'ड्रॉ चल रहा है — जैकपॉट परिणाम ड्रॉ के दिन यहां प्रकाशित होगा।',
    jackpotBumperLink: 'पूरे बम्पर विवरण और पिछले परिणाम →', jackpotDailyTitle: "आज का दैनिक जैकपॉट — ₹1 करोड़ पहला पुरस्कार",
    jackpotDailySubtitle: 'हर दैनिक केरल लॉटरी में ₹1 करोड़ का पहला पुरस्कार होता है, दोपहर 3:00 बजे ड्रॉ होता है।',
    jackpotDrawDay: 'ड्रॉ दिन', jackpotRecentWinners: 'हाल के जैकपॉट विजेता',
    jackpotWinnersEmpty: 'हाल के विजेता यहां दिखाई देंगे।', jackpotFirstPrizeWinner: 'पहला पुरस्कार विजेता',
    jackpotDisclaimerBody: 'लॉटरी एक भाग्य का खेल है। दिखाई गई जैकपॉट राशि घोषित पुरस्कार संरचना है और आधिकारिक सूचना के अनुसार बदल सकती है। हमेशा आधिकारिक केरल राज्य लॉटरी विभाग से सत्यापित करें।',

    claimPrizeH1: 'अपना केरल लॉटरी पुरस्कार प्राप्त करें',
    claimPrizeSubtitle: 'अपनी पुरस्कार राशि चुनें और देखें कि कहां जाना है, समय सीमा क्या है, और क्या लाना है।',
    claimPrizeStep1: '1. अपनी पुरस्कार राशि चुनें', claimPrizeClaimAt: 'यहां दावा करें:',
    claimPrizeDeadlineLabel: 'समय सीमा:', claimPrizeNoteLabel: 'टिप्पणी:',
    claimPrizeStep2: '2. लाने वाले दस्तावेज़', claimPrizeStep3: '3. जाने से पहले सत्यापित करें',
    claimPrizeVerifyText: 'कार्यालय जाने से पहले अपना टिकट नंबर, ड्रॉ कोड और तारीख आधिकारिक परिणाम से सत्यापित करें। यहां सत्यापित करें',
    claimPrizeOr: 'या इस साइट पर अपने ड्रॉ के परिणाम पेज पर।',
    claimPrizeGuideCta: 'पूरी चरण-दर-चरण प्रक्रिया, तमिलनाडु-विशिष्ट मार्गदर्शन और TDS विवरण चाहिए?',
    claimPrizeGuideLink: 'पूरी क्लेम गाइड पढ़ें →',
    claimPrizeDisclaimerBody: 'यह पेज सूचनात्मक है और सार्वजनिक रूप से उपलब्ध केरल राज्य लॉटरी नियमों पर आधारित है। नियम बिना सूचना बदल सकते हैं — दावा करने से पहले हमेशा आधिकारिक विभाग से प्रक्रिया की पुष्टि करें।',

    chartH1: 'केरल लॉटरी चार्ट',
    chartSubtitle: 'हर केरल लॉटरी परिणाम एक नज़र में — हर दैनिक ड्रॉ का पहला पुरस्कार, नवीनतम पहले।',
    chartAll: 'सभी', chartEmpty: 'इस महीने के लिए अभी कोई परिणाम नहीं है।',
    chartShowingPrefix: 'दिखा रहे हैं', chartDrawSingular: 'ड्रॉ', chartDrawPlural: 'ड्रॉ',
    chartShowingSuffix: '. पूरी पुरस्कार सूची, सांत्वना पुरस्कार और निचले स्तर देखने के लिए किसी भी पंक्ति पर टैप करें।',

    bumperH1: 'केरल बम्पर लॉटरी — अगला ड्रॉ और परिणाम',
    bumperSubtitle: 'केरल की मौसमी बम्पर लॉटरी में साल के सबसे बड़े पुरस्कार होते हैं — ₹12 करोड़ तक। अगली बम्पर ड्रॉ तारीख, पुरस्कार और लाइव काउंटडाउन, साथ ही पिछले बम्पर परिणाम देखें।',
    bumperNextBumper: 'अगला बम्पर', bumperUnderway: 'ड्रॉ चल रहा है — परिणाम ड्रॉ के दिन यहां प्रकाशित होंगे। जल्द वापस देखें!',
    bumperSeries: 'सीरीज़', bumperVenue: 'ड्रॉ स्थान', bumperPastResults: 'पिछले बम्पर परिणाम',
    bumperPastEmpty: 'पिछले बम्पर परिणाम यहां दिखाई देंगे।', bumperAboutTitle: 'केरल बम्पर लॉटरी के बारे में',
    bumperAboutBody: 'केरल हर साल छह मौसमी बम्पर लॉटरी आयोजित करता है — समर, विशु, मॉनसून, थिरुवोणम (ओणम), पूजा और क्रिसमस-नववर्ष — हर एक में दैनिक ड्रॉ से कहीं बड़े पुरस्कार होते हैं। टिकट हफ्तों पहले बिक जाते हैं, और ड्रॉ तिरुवनंतपुरम के गोर्की भवन में होते हैं।',

    yestH1: 'केरल लॉटरी परिणाम कल का',
    yestSubtitle: 'कल के केरल लॉटरी ड्रॉ का पूरा परिणाम — सभी पुरस्कार स्तर, स्वचालित रूप से अपडेट।',
    yestNotAvailable: 'कल का परिणाम अभी उपलब्ध नहीं है। कुछ समय बाद देखें, या आज का परिणाम देखें।',
    yestBackToToday: '← आज का परिणाम',
    yestNotPublishedYet: 'कल के ड्रॉ का परिणाम अभी प्रकाशित नहीं हुआ है — नीचे उपलब्ध सबसे हाल का परिणाम दिखाया जा रहा है',
    yestDrawHeldAt: 'ड्रॉ का समय', yestFirstPrizeColon: 'IST. पहला पुरस्कार:',
    yestViewFull: 'पूरा परिणाम पेज देखें →', yestOtherDraws: 'अन्य हाल के ड्रॉ',
    yestPrize: 'पुरस्कार', yestWinningNumbers: 'विजेता नंबर',

    ctH1: 'केरल लॉटरी टिकट जांच',
    ctSubtitle: 'अपना टिकट नंबर डालकर जांचें कि उसने हाल के सभी ड्रॉ में पुरस्कार जीता है या नहीं।',
    ctHowTo: 'अपना टिकट नंबर कैसे डालें', ctFullBest: 'पूरा टिकट (सबसे अच्छा)',
    ct6DigitLabel: '6-अंकीय नंबर', ctLast4Label: 'आखिरी 4 अंक',
    ctFullDesc: 'सीरीज़ + 6-अंकीय नंबर — सटीक मिलान', ct6DigitDesc: 'सभी सीरीज़ में नंबर मिलाता है',
    ctLast4Desc: 'त्वरित जांच — कई मिलान दिखा सकता है',
    ctInputLabel: 'अपना केरल लॉटरी टिकट नंबर डालें', ctClear: 'साफ़ करें',
    ctNoMatch: 'कोई मिलान नहीं मिला', ctNotInData: 'हमारे वर्तमान डेटा में नहीं है। यहां सत्यापित करें',
    ctCongrats: 'बधाई हो!', ctIsWinner: 'विजेता है!',
    ctVerifyOfficially: 'आधिकारिक रूप से सत्यापित करें', ctBeforeClaiming: 'दावा करने से पहले। 30 दिनों के भीतर दावा करें।',
    ctPartialMatch: 'आंशिक मिलान', ctPartialMatches: 'आंशिक मिलान',
    ctEnterFull: 'सीरीज़ अक्षरों के साथ पूरा टिकट डालें (उदा.', ctToConfirm: ') सटीक पुष्टि के लिए।',
    ctSearched: 'खोजा गया', ctDrawsAcross: 'ड्रॉ, इनमें', ctLotteries: 'लॉटरी',
    ctImportant: 'महत्वपूर्ण:',
    ctImportantBody: 'दावा करने से पहले हमेशा statelottery.kerala.gov.in पर सत्यापित करें। ड्रॉ तारीख से 30 दिनों के भीतर पुरस्कार का दावा करना होगा।',
    ctExactMatch: 'सटीक मिलान', ctPartialVerify: 'आंशिक — सीरीज़ सत्यापित करें',

    gnH1: 'केरल लॉटरी आज की अनुमान संख्या',
    gnSubtitle: 'सभी केरल लॉटरी ड्रॉ के लिए ABC बोर्ड नंबर और 4-अंकीय संयोजन। दोपहर 3 बजे से पहले रोज़ाना अपडेट।',
    gnUpdated: 'अपडेट किया गया:', gnUpdatedNightly: 'रात में रोज़ाना अपडेट होता है', gnSeePast: 'पिछले दिन देखें →',
    gnByLottery: 'लॉटरी के अनुसार अनुमान संख्या',
    gnByLotterySub: 'हर लॉटरी के लिए विशेष अनुमान संख्या, हॉट/कोल्ड नंबर के लिए क्लिक करें',
    gnAbcTitle: 'आज के ABC बोर्ड नंबर', gnAbcSub: 'मूल A, B, C मान — सभी संयोजन इन तीन अंकों से बनते हैं',
    gnBoard: 'बोर्ड', gnTwoDigit: 'दो अंकीय संयोजन', gnThreeDigit: 'तीन अंकीय नंबर',
    gnFourDigit: 'चार अंकीय पिक्स', gnFourDigitSub: 'अपने टिकट के आखिरी 4 अंकों से मिलाएं',
    gnSeriesFreqTitle: 'सीरीज़ आवृत्ति — पहला पुरस्कार जीत',
    gnSeriesFreqSub: 'सभी सत्यापित ड्रॉ में हर 2-अक्षर सीरीज़ ने कितनी बार पहला पुरस्कार जीता। क्रम बदलने के लिए कॉलम पर क्लिक करें।',
    gnSeriesEmpty: 'सत्यापित परिणाम उपलब्ध होने पर सीरीज़ डेटा यहां दिखाई देगा।',
    gnHotTitle: '🔥 हॉट नंबर — पिछले 30 ड्रॉ',
    gnHotSub: 'सबसे हाल के 30 ड्रॉ से, हर पुरस्कार स्तर में सबसे ज़्यादा दिखने वाले 5 आखिरी-4-अंक अंत।',
    gnHotEmpty: 'ड्रॉ उपलब्ध होने पर हॉट नंबर डेटा यहां दिखाई देगा।', gnAppeared: 'दिखा',
    gnDisclaimerBody: 'अनुमान संख्या केवल मनोरंजन के लिए हैं। किसी भी नंबर की भविष्यवाणी या गारंटी नहीं दी जा सकती।',
    gnHot: 'हॉट', gnSeriesCol: 'सीरीज़', gnWinsCol: 'जीत', gnLastWonDateCol: 'आखिरी जीत की तारीख',
    gnLastWonDrawCodeCol: 'आखिरी जीत का ड्रॉ कोड',

    resultNotFound: 'परिणाम नहीं मिला।', lotteryNotFound: 'लॉटरी नहीं मिली।', resultLabel: 'परिणाम',
    moreResultsPrefix: 'अधिक', moreResultsSuffix: 'परिणाम', importantDisclaimer: 'महत्वपूर्ण अस्वीकरण',
    archiveDisclaimerBody: 'यह अभिलेख पेज केवल सूचनात्मक है। पुरस्कार दावा करने से पहले हमेशा आधिकारिक केरल लॉटरी प्रकाशनों से विजेता नंबर सत्यापित करें।',
    lrDisclaimerBody: 'इस पेज पर प्रकाशित केरल लॉटरी परिणाम केवल सूचनात्मक हैं। यह वेबसाइट केरल सरकार से संबद्ध नहीं है। पुरस्कार दावा करने से पहले आधिकारिक केरल सरकार गजट से परिणाम सत्यापित करें।',
    lrHolidayNotice: '{name} — आज केरल लॉटरी ड्रॉ नहीं है। नीचे दिया गया परिणाम सबसे हाल में प्रकाशित ड्रॉ है, आज का नहीं। नियमित परिणाम कल जारी रहेंगे।',
    lrH1Suffix: 'केरल लॉटरी परिणाम आज', viewFirstPrizeWinner: '🥇 पहला पुरस्कार विजेता पेज देखें →',
    daResultArchiveDesc: '{date} ड्रॉ अभिलेख — स्थिति, स्रोत लिंक, पुरस्कार सूची और सत्यापन मार्गदर्शन के साथ।',

    rdDrawDetails: 'ड्रॉ विवरण', rdDrawCode: 'ड्रॉ कोड', rdDrawDate: 'ड्रॉ तारीख', rdStatus: 'स्थिति',
    rdFirstPrizeDistrict: 'पहला पुरस्कार जिला', rdTotalWinners: 'कुल विजेता',
    rdTotalDistribution: 'कुल पुरस्कार वितरण', rdSource: 'स्रोत', rdOfficialSource: 'आधिकारिक स्रोत',
    rdDownloadPdf: 'PDF डाउनलोड करें', rdViewImage: 'परिणाम चित्र देखें',

    fpNotFound: 'परिणाम नहीं मिला', fpBackHome: '← होम पर वापस जाएं', fpFirstPrizeWinner: 'पहला पुरस्कार विजेता',
    fpResultAwaiting: 'परिणाम की प्रतीक्षा', fpDrawAt: 'ड्रॉ समय', fpCheckBack: 'दोपहर 3 बजे के बाद देखें',
    fpSoldIn: 'बिका स्थान', fpKerala: 'केरल', fpViewArea: 'क्षेत्र देखें →',
    fpLiveVerify: 'लाइव — दावा करने से पहले सत्यापित करें', fpTop3Title: 'शीर्ष 3 पुरस्कार विजेता',
    fp1stPrizeCrumb: 'पहला पुरस्कार', fpDidYouWin: 'क्या आप जीते?',
    fpVerifyBody: 'दावा करने से पहले statelottery.kerala.gov.in पर अपना टिकट सत्यापित करें। तिरुवनंतपुरम केरल लॉटरी निदेशालय में 30 दिनों के भीतर दावा करें।',
    fpDisclaimer: 'यह पेज केवल सूचनात्मक है। कोई भी पुरस्कार दावा करने से पहले आधिकारिक केरल सरकार गजट से सत्यापित करें।',

    cgH1: 'केरल लॉटरी पुरस्कार कैसे प्राप्त करें',
    cgSubtitle: 'टिकट सत्यापन से पुरस्कार भुगतान तक चरण-दर-चरण गाइड — तमिलनाडु निवासियों के लिए भी।',
    cgDeadlinesTitle: 'पुरस्कार दावा समय सीमा और स्थान', cgPrizeCategory: 'पुरस्कार श्रेणी',
    cgClaimLocation: 'दावा स्थान', cgTimeLimit: 'समय सीमा', cgProcessTitle: 'दावा प्रक्रिया',
    cgTamilNaduTitle: 'तमिलनाडु / अन्य राज्यों से दावा करना', cgTaxTitle: 'जीत पर कर (TDS)',

    faqH1: 'केरल लॉटरी सामान्य प्रश्न',
    faqSubtitle: 'परिणाम, टिकट जांच, पुरस्कार दावे और जिम्मेदार उपयोग से जुड़े सामान्य प्रश्न।',

    loH1: 'केरल लॉटरी कार्यालय',
    loSubtitle: 'केरल राज्य लॉटरी निदेशालय और सभी 14 जिला लॉटरी कार्यालयों की सूची।',
    loWhichOffice: '📋 कौन सा कार्यालय जाएं?',
    loAllPrizesNote: 'सभी पुरस्कारों का दावा ड्रॉ तारीख से 30 दिनों के भीतर करना होगा। मूल टिकट, आधार, PAN और बैंक पासबुक लाएं।',
    loHeadquarters: 'मुख्यालय', loFax: 'फैक्स:', loDistrictOfficesTitle: 'जिला लॉटरी कार्यालय',
    loTapExpand: 'विस्तार के लिए टैप करें', loViewMaps: 'गूगल मैप्स पर देखें', loBeforeVisitTitle: '⚠️ जाने से पहले',

    aboutH1: 'Kerala Ticket Results के बारे में',
    aboutSubtitle: 'केरल लॉटरी परिणाम अपडेट का भरोसेमंद, स्वतंत्र स्रोत — सटीकता और गति के लिए बनाया गया।',
    aboutWhoWeAre: 'हम कौन हैं', aboutMission: 'हमारा उद्देश्य', aboutHowWeWork: 'हम कैसे काम करते हैं',
    aboutTrustPrinciples: 'हमारे भरोसे के सिद्धांत', aboutLegalDisclaimer: 'कानूनी अस्वीकरण',
    aboutLotteriesCovered: 'शामिल लॉटरी', aboutResultUpdates: 'परिणाम अपडेट',
    aboutDrawTimeIST: 'ड्रॉ समय IST', aboutResultsPublished: 'परिणाम प्रकाशित',
    aboutLotteriesWeCover: 'हमारी शामिल लॉटरी',

    contactH1: 'संपर्क करें', contactSubtitle: 'परिणाम सुधार, प्रतिक्रिया या सामान्य प्रश्न — हम हर संदेश पढ़ते हैं।',
    contactSendMessage: 'संदेश भेजें', contactReplyTime: 'हम 2 कार्य दिवसों में जवाब देने का प्रयास करते हैं।',
    contactSentTitle: 'संदेश भेजा गया!', contactSendAnother: 'दूसरा भेजें', contactYourName: 'आपका नाम *',
    contactEmail: 'ईमेल पता *', contactSubject: 'विषय *', contactLotteryName: 'लॉटरी नाम',
    contactDrawCode: 'ड्रॉ कोड', contactMessage: 'संदेश *', contactHowCanWeHelp: 'हम कैसे मदद कर सकते हैं?',
    contactErrorMsg: 'कुछ गलत हो गया। कृपया फिर से प्रयास करें या सीधे ईमेल करें।',
    contactSending: 'भेज रहे हैं…', contactSendBtn: 'संदेश भेजें →', contactEmailLabel: 'ईमेल',
    contactResponseNote: '2 कार्य दिवसों में जवाब', contactSupportHours: 'सहायता समय',
    contactHoursNote: 'सुबह 9:00 – शाम 6:00 IST', contactImportantNotice: 'महत्वपूर्ण सूचना',
    contactForCorrections: 'परिणाम सुधार के लिए', subjectGeneral: 'सामान्य पूछताछ',
    subjectCorrection: 'परिणाम सुधार', subjectFeedback: 'वेबसाइट प्रतिक्रिया',
    subjectPrivacy: 'गोपनीयता / डेटा अनुरोध', subjectOther: 'अन्य',

    discH1: 'अस्वीकरण', discSubtitle: 'इस वेबसाइट से लॉटरी परिणाम जानकारी का उपयोग करने से पहले इसे पढ़ें।',
    discInfoOnly: 'केवल सूचनात्मक वेबसाइट', discVerifySources: 'आधिकारिक स्रोतों को सत्यापित करें',
    discNoGuarantee: 'जीत की कोई गारंटी नहीं', discFinancialRisk: 'वित्तीय जोखिम',

    ppH1: 'गोपनीयता नीति', termsH1: 'नियम और शर्तें',

    dfH1: 'लॉटरी फॉर्म और डाउनलोड',
    dfSubtitle: 'फॉर्म और दस्तावेज़ों के लिए इस पेज को गाइड के रूप में उपयोग करें।',
    dfCommonDocs: 'सामान्य दस्तावेज़', dfOfficialLinks: 'आधिकारिक फॉर्म लिंक', dfImportant: 'महत्वपूर्ण',

    nf404: '404 पेज नहीं मिला', nfHint: 'क्या आप पेज को राउटर में जोड़ना भूल गए?',
  },
  kn: {
    home: 'ಮುಖಪುಟ', results: 'ಫಲಿತಾಂಶಗಳು', chart: 'ಚಾರ್ಟ್', bumper: 'ಬಂಪರ್',
    jackpot: 'ಜಾಕ್‌ಪಾಟ್', schedule: 'ವೇಳಾಪಟ್ಟಿ', yesterdayResult: 'ನಿನ್ನೆಯ ಫಲಿತಾಂಶ',
    checkTicket: 'ಟಿಕೆಟ್ ಪರಿಶೀಲನೆ', claimPrize: 'ಬಹುಮಾನ ಪಡೆಯಿರಿ', contact: 'ಸಂಪರ್ಕಿಸಿ',
    claimGuide: 'ಬಹುಮಾನ ಗೈಡ್', guessingNumbers: 'ಅಂದಾಜು ಸಂಖ್ಯೆಗಳು',
    downloadForms: 'ಫಾರ್ಮ್‌ಗಳು', faq: 'ಪ್ರಶ್ನೋತ್ತರಗಳು', about: 'ನಮ್ಮ ಬಗ್ಗೆ',
    lotteryOffices: 'ಲಾಟರಿ ಕಚೇರಿಗಳು', tools: 'ಟೂಲ್‌ಗಳು', info: 'ಮಾಹಿತಿ',
    moreLotteries: 'ಇತರ ಲಾಟರಿಗಳು', resources: 'ಸಂಪನ್ಮೂಲಗಳು',
    bumperResults: 'ಬಂಪರ್ ಫಲಿತಾಂಶಗಳು', ticketChecker: 'ಟಿಕೆಟ್ ಪರಿಶೀಲನೆ',
    privacyPolicy: 'ಗೌಪ್ಯತೆ ನೀತಿ', aboutDisclaimer: 'ಮಾಹಿತಿ ಮತ್ತು ನಿರಾಕರಣೆ',
    fullPrizeTable: 'ಸಂಪೂರ್ಣ ಬಹುಮಾನ ಪಟ್ಟಿ', prizeTier: 'ಬಹುಮಾನ ಹಂತ',
    winningNumbers: 'ವಿಜೇತ ಸಂಖ್ಯೆಗಳು', amount: 'ಮೊತ್ತ', pending: 'ಬಾಕಿ',
    completeResult: 'ಸಂಪೂರ್ಣ ಫಲಿತಾಂಶ', tiersUpdated: 'ಹಂತಗಳು ನವೀಕರಿಸಲಾಗಿದೆ',
    bumperDraw: 'ಬಂಪರ್ ಡ್ರಾ', firstPrize: 'ಮೊದಲ ಬಹುಮಾನ', todaysDraw: 'ಇಂದಿನ ಡ್ರಾ',
    verificationStatus: 'ಪರಿಶೀಲನೆ ಸ್ಥಿತಿ', notPublishedYet: 'ಇನ್ನೂ ಪ್ರಕಟಿಸಿಲ್ಲ',
    verifiedResult: 'ಪರಿಶೀಲಿತ ಫಲಿತಾಂಶ', liveUpdate: 'ನೇರ ಅಪ್‌ಡೇಟ್',

    disclaimer: 'ಹೊಣೆಗಾರಿಕೆ ನಿರಾಕರಣೆ', date: 'ದಿನಾಂಕ', draw: 'ಡ್ರಾ', code: 'ಕೋಡ್', lottery: 'ಲಾಟರಿ',
    viewArrow: 'ನೋಡಿ →', today: 'ಇಂದು', tomorrow: 'ನಾಳೆ', days: 'ದಿನಗಳು', hours: 'ಗಂಟೆಗಳು',
    minutes: 'ನಿಮಿಷ', seconds: 'ಸೆಕೆಂಡ್', quickLinks: 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು', notFound: 'ಕಂಡುಬಂದಿಲ್ಲ',
    officeAnyAgent: 'ಯಾವುದೇ ಅಧಿಕೃತ ಏಜೆಂಟ್', officeDistrictOffice: 'ನಿಮ್ಮ ಜಿಲ್ಲಾ ಲಾಟರಿ ಕಚೇರಿ',
    officeDirectorateShort: 'ನಿರ್ದೇಶನಾಲಯ, ತಿರುವನಂತಪುರಂ', ticketPrice: 'ಟಿಕೆಟ್ ಬೆಲೆ',

    homeH1: 'ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶ ಇಂದು', homeSubtitle: 'ನಿಮ್ಮ ಲಾಟರಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ — ಫಲಿತಾಂಶಗಳು ಪ್ರತಿದಿನ ಮಧ್ಯಾಹ್ನ 3 ಗಂಟೆಗೆ ನವೀಕರಿಸಲಾಗುತ್ತದೆ.',
    homeNotice: 'ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶಗಳು ಇಲ್ಲಿ ಪ್ರತಿದಿನ ಮಧ್ಯಾಹ್ನ 3 ಗಂಟೆಗೆ ನವೀಕರಿಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಲಾಟರಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಇಂದಿನ ಫಲಿತಾಂಶ ನೋಡಿ.',
    homeHolidayNotice: '{name} — ಇಂದು ಕೇರಳ ಲಾಟರಿ ಡ್ರಾ ಇಲ್ಲ, ಆದ್ದರಿಂದ ಹೊಸ ಫಲಿತಾಂಶ ಇಲ್ಲ. ನಾಳೆ ಎಂದಿನಂತೆ ಮುಂದುವರಿಯುತ್ತದೆ.',
    homeDrawsEvery: 'ಪ್ರತಿ', homeAt: 'ಗಂಟೆಗೆ ನಡೆಯುತ್ತದೆ', homeNoResultYet: 'ಇನ್ನೂ ಫಲಿತಾಂಶ ಪ್ರಕಟಿಸಿಲ್ಲ. ಮಧ್ಯಾಹ್ನ 3 ಗಂಟೆಯ ನಂತರ ನೋಡಿ.',
    homeViewPagePrefix: '', homeViewPageSuffix: 'ಪುಟ ನೋಡಿ →', homeWeeklySchedule: 'ವಾರದ ಲಾಟರಿ ವೇಳಾಪಟ್ಟಿ',
    homeViewGuidelines: 'ಮಾರ್ಗದರ್ಶಿ ನೋಡಿ', homeQuickLinks: 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
    homeCheckTicketDesc: 'ನೀವು ಯಾವುದೇ ಬಹುಮಾನ ಗೆದ್ದಿದ್ದೀರಾ ಎಂದು ಪರಿಶೀಲಿಸಲು ನಿಮ್ಮ ಟಿಕೆಟ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
    homeHowToClaim: 'ಬಹುಮಾನ ಪಡೆಯುವ ವಿಧಾನ', homeHowToClaimDesc: 'ಬಹುಮಾನ ಪಡೆಯುವ ಹಂತ ಹಂತದ ಗೈಡ್',
    homeGuessingDesc: 'ಇಂದಿನ ಅಂದಾಜು ಸಂಖ್ಯೆಗಳು — ಮನರಂಜನೆಗಾಗಿ ಮಾತ್ರ',
    homeFaqDesc: 'ಫಲಿತಾಂಶಗಳು, ಬಹುಮಾನಗಳು ಮತ್ತು ಕ್ಲೈಮ್‌ಗಳ ಬಗ್ಗೆ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು',

    scheduleH1: 'ಕೇರಳ ಲಾಟರಿ ವಾರದ ವೇಳಾಪಟ್ಟಿ',
    scheduleSubtitle: 'ಪ್ರತಿ ಕೇರಳ ಲಾಟರಿ ಡ್ರಾ ದಿನ ಮತ್ತು ಸಮಯ ಒಂದೇ ಪಟ್ಟಿಯಲ್ಲಿ.',
    scheduleWeeklyTable: 'ವಾರದ ಡ್ರಾ ವೇಳಾಪಟ್ಟಿ', scheduleDay: 'ದಿನ', scheduleDrawTime: 'ಡ್ರಾ ಸಮಯ',
    scheduleFooterNote: 'ಬಂಪರ್ ವಿಶೇಷ ಡ್ರಾಗಳನ್ನು ಹೊರತುಪಡಿಸಿ, ಎಲ್ಲಾ ಡ್ರಾಗಳು ಪ್ರತಿದಿನ ಮಧ್ಯಾಹ್ನ 3:00 ಗಂಟೆಗೆ ನಡೆಯುತ್ತವೆ.',
    scheduleSpecialDraw: 'ವಿಶೇಷ ಡ್ರಾ', scheduleBumperLink: 'ಬಂಪರ್ ಕೌಂಟ್‌ಡೌನ್ ಮತ್ತು ವಿವರಗಳನ್ನು ನೋಡಿ →',

    jackpotH1: 'ಕೇರಳ ಲಾಟರಿ ಜಾಕ್‌ಪಾಟ್',
    jackpotSubtitle: 'ಕೇರಳ ಲಾಟರಿಯ ಅತಿ ದೊಡ್ಡ ಬಹುಮಾನಗಳು — ಇಂದಿನ ₹1 ಕೋಟಿ ದೈನಿಕ ಜಾಕ್‌ಪಾಟ್ ಮತ್ತು ಮುಂದಿನ ಬಂಪರ್ ಡ್ರಾದ ಅತ್ಯುನ್ನತ ಬಹುಮಾನ, ಇತ್ತೀಚಿನ ವಿಜೇತರೊಂದಿಗೆ.',
    jackpotBiggest: 'ಅತಿ ದೊಡ್ಡ ಜಾಕ್‌ಪಾಟ್', jackpotUnderway: 'ಡ್ರಾ ನಡೆಯುತ್ತಿದೆ — ಜಾಕ್‌ಪಾಟ್ ಫಲಿತಾಂಶ ಡ್ರಾ ದಿನ ಇಲ್ಲಿ ಪ್ರಕಟವಾಗುತ್ತದೆ.',
    jackpotBumperLink: 'ಸಂಪೂರ್ಣ ಬಂಪರ್ ವಿವರಗಳು ಮತ್ತು ಹಿಂದಿನ ಫಲಿತಾಂಶಗಳು →', jackpotDailyTitle: 'ಇಂದಿನ ದೈನಿಕ ಜಾಕ್‌ಪಾಟ್ — ₹1 ಕೋಟಿ ಮೊದಲ ಬಹುಮಾನ',
    jackpotDailySubtitle: 'ಪ್ರತಿ ದೈನಿಕ ಕೇರಳ ಲಾಟರಿಯು ₹1 ಕೋಟಿ ಮೊದಲ ಬಹುಮಾನ ಹೊಂದಿದೆ, ಮಧ್ಯಾಹ್ನ 3:00 ಗಂಟೆಗೆ ಡ್ರಾ ಆಗುತ್ತದೆ.',
    jackpotDrawDay: 'ಡ್ರಾ ದಿನ', jackpotRecentWinners: 'ಇತ್ತೀಚಿನ ಜಾಕ್‌ಪಾಟ್ ವಿಜೇತರು',
    jackpotWinnersEmpty: 'ಇತ್ತೀಚಿನ ವಿಜೇತರು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತಾರೆ.', jackpotFirstPrizeWinner: 'ಮೊದಲ ಬಹುಮಾನ ವಿಜೇತ',
    jackpotDisclaimerBody: 'ಲಾಟರಿ ಒಂದು ಅವಕಾಶದ ಆಟ. ತೋರಿಸಿರುವ ಜಾಕ್‌ಪಾಟ್ ಮೊತ್ತಗಳು ಘೋಷಿಸಲಾದ ಬಹುಮಾನ ರಚನೆಯಾಗಿದ್ದು, ಅಧಿಕೃತ ಅಧಿಸೂಚನೆಯಂತೆ ಬದಲಾಗಬಹುದು. ಯಾವಾಗಲೂ ಅಧಿಕೃತ ಕೇರಳ ರಾಜ್ಯ ಲಾಟರಿ ಇಲಾಖೆಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.',

    claimPrizeH1: 'ನಿಮ್ಮ ಕೇರಳ ಲಾಟರಿ ಬಹುಮಾನವನ್ನು ಪಡೆಯಿರಿ',
    claimPrizeSubtitle: 'ನಿಮ್ಮ ಬಹುಮಾನ ಮೊತ್ತವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು, ಗಡುವು ಏನು, ಏನು ತರಬೇಕು ಎಂದು ನೋಡಿ.',
    claimPrizeStep1: '1. ನಿಮ್ಮ ಬಹುಮಾನ ಮೊತ್ತವನ್ನು ಆಯ್ಕೆಮಾಡಿ', claimPrizeClaimAt: 'ಇಲ್ಲಿ ಪಡೆಯಿರಿ:',
    claimPrizeDeadlineLabel: 'ಗಡುವು:', claimPrizeNoteLabel: 'ಸೂಚನೆ:',
    claimPrizeStep2: '2. ತರಬೇಕಾದ ದಾಖಲೆಗಳು', claimPrizeStep3: '3. ಪ್ರಯಾಣಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ',
    claimPrizeVerifyText: 'ಕಚೇರಿಗೆ ಹೋಗುವ ಮೊದಲು ನಿಮ್ಮ ಟಿಕೆಟ್ ಸಂಖ್ಯೆ, ಡ್ರಾ ಕೋಡ್ ಮತ್ತು ದಿನಾಂಕವನ್ನು ಅಧಿಕೃತ ಫಲಿತಾಂಶದೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ. ಇಲ್ಲಿ ಪರಿಶೀಲಿಸಿ',
    claimPrizeOr: 'ಅಥವಾ ಈ ಸೈಟ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಡ್ರಾದ ಫಲಿತಾಂಶ ಪುಟದಲ್ಲಿ.',
    claimPrizeGuideCta: 'ಸಂಪೂರ್ಣ ಹಂತ-ಹಂತದ ಪ್ರಕ್ರಿಯೆ, ತಮಿಳುನಾಡು-ನಿರ್ದಿಷ್ಟ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು TDS ವಿವರಗಳು ಬೇಕೇ?',
    claimPrizeGuideLink: 'ಸಂಪೂರ್ಣ ಕ್ಲೈಮ್ ಗೈಡ್ ಓದಿ →',
    claimPrizeDisclaimerBody: 'ಈ ಪುಟ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ ಮತ್ತು ಸಾರ್ವಜನಿಕವಾಗಿ ಲಭ್ಯವಿರುವ ಕೇರಳ ರಾಜ್ಯ ಲಾಟರಿ ನಿಯಮಗಳನ್ನು ಆಧರಿಸಿದೆ. ನಿಯಮಗಳು ಸೂಚನೆಯಿಲ್ಲದೆ ಬದಲಾಗಬಹುದು — ಯಾವುದೇ ಕ್ಲೈಮ್ ಮಾಡುವ ಮೊದಲು ಯಾವಾಗಲೂ ಅಧಿಕೃತ ಇಲಾಖೆಯೊಂದಿಗೆ ನೇರವಾಗಿ ಪ್ರಕ್ರಿಯೆಯನ್ನು ದೃಢೀಕರಿಸಿ.',

    chartH1: 'ಕೇರಳ ಲಾಟರಿ ಚಾರ್ಟ್',
    chartSubtitle: 'ಪ್ರತಿ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶ ಒಂದೇ ನೋಟದಲ್ಲಿ — ಪ್ರತಿ ದೈನಿಕ ಡ್ರಾದ ಮೊದಲ ಬಹುಮಾನ, ಇತ್ತೀಚಿನದು ಮೊದಲು.',
    chartAll: 'ಎಲ್ಲಾ', chartEmpty: 'ಈ ಮಾಸಕ್ಕೆ ಇನ್ನೂ ಫಲಿತಾಂಶಗಳಿಲ್ಲ.',
    chartShowingPrefix: 'ತೋರಿಸಲಾಗುತ್ತಿದೆ', chartDrawSingular: 'ಡ್ರಾ', chartDrawPlural: 'ಡ್ರಾಗಳು',
    chartShowingSuffix: '. ಸಂಪೂರ್ಣ ಬಹುಮಾನ ಪಟ್ಟಿ, ಸಮಾಧಾನ ಬಹುಮಾನಗಳು ಮತ್ತು ಕೆಳ ಹಂತಗಳನ್ನು ನೋಡಲು ಯಾವುದೇ ಸಾಲನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.',

    bumperH1: 'ಕೇರಳ ಬಂಪರ್ ಲಾಟರಿ — ಮುಂದಿನ ಡ್ರಾ ಮತ್ತು ಫಲಿತಾಂಶಗಳು',
    bumperSubtitle: 'ಕೇರಳದ ಋತುಮಾನ ಬಂಪರ್ ಲಾಟರಿಗಳು ವರ್ಷದ ಅತಿ ದೊಡ್ಡ ಬಹುಮಾನಗಳನ್ನು ಹೊಂದಿವೆ — ₹12 ಕೋಟಿ ವರೆಗೆ. ಮುಂದಿನ ಬಂಪರ್ ಡ್ರಾ ದಿನಾಂಕ, ಬಹುಮಾನ ಮತ್ತು ನೇರ ಕೌಂಟ್‌ಡೌನ್, ಹಿಂದಿನ ಬಂಪರ್ ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಿ.',
    bumperNextBumper: 'ಮುಂದಿನ ಬಂಪರ್', bumperUnderway: 'ಡ್ರಾ ನಡೆಯುತ್ತಿದೆ — ಫಲಿತಾಂಶಗಳು ಡ್ರಾ ದಿನ ಇಲ್ಲಿ ಪ್ರಕಟವಾಗುತ್ತವೆ. ಶೀಘ್ರದಲ್ಲೇ ಮತ್ತೆ ನೋಡಿ!',
    bumperSeries: 'ಸರಣಿ', bumperVenue: 'ಡ್ರಾ ಸ್ಥಳ', bumperPastResults: 'ಹಿಂದಿನ ಬಂಪರ್ ಫಲಿತಾಂಶಗಳು',
    bumperPastEmpty: 'ಹಿಂದಿನ ಬಂಪರ್ ಫಲಿತಾಂಶಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.', bumperAboutTitle: 'ಕೇರಳ ಬಂಪರ್ ಲಾಟರಿಗಳ ಬಗ್ಗೆ',
    bumperAboutBody: 'ಕೇರಳ ಪ್ರತಿ ವರ್ಷ ಆರು ಋತುಮಾನ ಬಂಪರ್ ಲಾಟರಿಗಳನ್ನು ನಡೆಸುತ್ತದೆ — ಸಮ್ಮರ್, ವಿಷು, ಮಾನ್ಸೂನ್, ತಿರುವೋಣಂ (ಓಣಂ), ಪೂಜಾ ಮತ್ತು ಕ್ರಿಸ್‌ಮಸ್-ಹೊಸ ವರ್ಷ — ಪ್ರತಿಯೊಂದೂ ದೈನಿಕ ಡ್ರಾಕ್ಕಿಂತ ಹೆಚ್ಚು ದೊಡ್ಡ ಬಹುಮಾನಗಳೊಂದಿಗೆ. ಟಿಕೆಟ್‌ಗಳು ವಾರಗಳ ಮುಂಚೆಯೇ ಮಾರಾಟವಾಗುತ್ತವೆ, ಡ್ರಾಗಳು ತಿರುವನಂತಪುರಂನ ಗೋರ್ಕಿ ಭವನದಲ್ಲಿ ನಡೆಯುತ್ತವೆ.',

    yestH1: 'ನಿನ್ನೆಯ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶ',
    yestSubtitle: 'ನಿನ್ನೆಯ ಕೇರಳ ಲಾಟರಿ ಡ್ರಾದ ಸಂಪೂರ್ಣ ಫಲಿತಾಂಶ — ಎಲ್ಲಾ ಬಹುಮಾನ ಹಂತಗಳು, ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಿಸಲಾಗುತ್ತದೆ.',
    yestNotAvailable: 'ನಿನ್ನೆಯ ಫಲಿತಾಂಶ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ನೋಡಿ, ಅಥವಾ ಇಂದಿನ ಫಲಿತಾಂಶ ನೋಡಿ.',
    yestBackToToday: '← ಇಂದಿನ ಫಲಿತಾಂಶ',
    yestNotPublishedYet: 'ನಿನ್ನೆಯ ಡ್ರಾ ಫಲಿತಾಂಶ ಇನ್ನೂ ಪ್ರಕಟಿಸಿಲ್ಲ — ಕೆಳಗೆ ಲಭ್ಯವಿರುವ ಇತ್ತೀಚಿನ ಫಲಿತಾಂಶವನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ',
    yestDrawHeldAt: 'ಡ್ರಾ ನಡೆದ ಸಮಯ', yestFirstPrizeColon: 'IST. ಮೊದಲ ಬಹುಮಾನ:',
    yestViewFull: 'ಸಂಪೂರ್ಣ ಫಲಿತಾಂಶ ಪುಟ ನೋಡಿ →', yestOtherDraws: 'ಇತರ ಇತ್ತೀಚಿನ ಡ್ರಾಗಳು',
    yestPrize: 'ಬಹುಮಾನ', yestWinningNumbers: 'ವಿಜೇತ ಸಂಖ್ಯೆ(ಗಳು)',

    ctH1: 'ಕೇರಳ ಲಾಟರಿ ಟಿಕೆಟ್ ಪರಿಶೀಲನೆ',
    ctSubtitle: 'ಇತ್ತೀಚಿನ ಎಲ್ಲಾ ಡ್ರಾಗಳಲ್ಲಿ ನಿಮ್ಮ ಟಿಕೆಟ್ ಸಂಖ್ಯೆ ಬಹುಮಾನ ಗೆದ್ದಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
    ctHowTo: 'ನಿಮ್ಮ ಟಿಕೆಟ್ ಸಂಖ್ಯೆಯನ್ನು ಹೇಗೆ ನಮೂದಿಸುವುದು', ctFullBest: 'ಪೂರ್ಣ ಟಿಕೆಟ್ (ಉತ್ತಮ)',
    ct6DigitLabel: '6-ಅಂಕಿಯ ಸಂಖ್ಯೆ', ctLast4Label: 'ಕೊನೆಯ 4 ಅಂಕೆಗಳು',
    ctFullDesc: 'ಸರಣಿ + 6-ಅಂಕಿಯ ಸಂಖ್ಯೆ — ನಿಖರ ಹೊಂದಾಣಿಕೆ', ct6DigitDesc: 'ಎಲ್ಲಾ ಸರಣಿಗಳಲ್ಲಿ ಸಂಖ್ಯೆ ಹೊಂದಿಸುತ್ತದೆ',
    ctLast4Desc: 'ತ್ವರಿತ ಪರಿಶೀಲನೆ — ಹಲವು ಹೊಂದಾಣಿಕೆಗಳನ್ನು ತೋರಿಸಬಹುದು',
    ctInputLabel: 'ನಿಮ್ಮ ಕೇರಳ ಲಾಟರಿ ಟಿಕೆಟ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ', ctClear: 'ಅಳಿಸಿ',
    ctNoMatch: 'ಯಾವುದೇ ಹೊಂದಾಣಿಕೆ ಕಂಡುಬಂದಿಲ್ಲ', ctNotInData: 'ನಮ್ಮ ಪ್ರಸ್ತುತ ಡೇಟಾದಲ್ಲಿ ಇಲ್ಲ. ಇಲ್ಲಿ ಪರಿಶೀಲಿಸಿ',
    ctCongrats: 'ಅಭಿನಂದನೆಗಳು!', ctIsWinner: 'ವಿಜೇತವಾಗಿದೆ!',
    ctVerifyOfficially: 'ಅಧಿಕೃತವಾಗಿ ಪರಿಶೀಲಿಸಿ', ctBeforeClaiming: 'ಪಡೆಯುವ ಮೊದಲು. 30 ದಿನಗಳಲ್ಲಿ ಪಡೆಯಿರಿ.',
    ctPartialMatch: 'ಭಾಗಶಃ ಹೊಂದಾಣಿಕೆ', ctPartialMatches: 'ಭಾಗಶಃ ಹೊಂದಾಣಿಕೆಗಳು',
    ctEnterFull: 'ಸರಣಿ ಅಕ್ಷರಗಳೊಂದಿಗೆ ಪೂರ್ಣ ಟಿಕೆಟ್ ನಮೂದಿಸಿ (ಉದಾ.', ctToConfirm: ') ನಿಖರವಾಗಿ ದೃಢೀಕರಿಸಲು.',
    ctSearched: 'ಹುಡುಕಲಾಗಿದೆ', ctDrawsAcross: 'ಡ್ರಾಗಳು, ಇವುಗಳಲ್ಲಿ', ctLotteries: 'ಲಾಟರಿಗಳು',
    ctImportant: 'ಪ್ರಮುಖ:',
    ctImportantBody: 'ಪಡೆಯುವ ಮೊದಲು ಯಾವಾಗಲೂ statelottery.kerala.gov.in ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ. ಡ್ರಾ ದಿನಾಂಕದಿಂದ 30 ದಿನಗಳಲ್ಲಿ ಬಹುಮಾನಗಳನ್ನು ಪಡೆಯಬೇಕು.',
    ctExactMatch: 'ನಿಖರ ಹೊಂದಾಣಿಕೆ', ctPartialVerify: 'ಭಾಗಶಃ — ಸರಣಿಯನ್ನು ಪರಿಶೀಲಿಸಿ',

    gnH1: 'ಕೇರಳ ಲಾಟರಿ ಇಂದಿನ ಅಂದಾಜು ಸಂಖ್ಯೆಗಳು',
    gnSubtitle: 'ಎಲ್ಲಾ ಕೇರಳ ಲಾಟರಿ ಡ್ರಾಗಳಿಗೆ ABC ಬೋರ್ಡ್ ಸಂಖ್ಯೆಗಳು ಮತ್ತು 4-ಅಂಕಿಯ ಸಂಯೋಜನೆಗಳು. ಮಧ್ಯಾಹ್ನ 3 ಗಂಟೆಗೆ ಮೊದಲು ಪ್ರತಿದಿನ ನವೀಕರಿಸಲಾಗುತ್ತದೆ.',
    gnUpdated: 'ನವೀಕರಿಸಲಾಗಿದೆ:', gnUpdatedNightly: 'ರಾತ್ರಿ ಪ್ರತಿದಿನ ನವೀಕರಿಸಲಾಗುತ್ತದೆ', gnSeePast: 'ಹಿಂದಿನ ದಿನಗಳನ್ನು ನೋಡಿ →',
    gnByLottery: 'ಲಾಟರಿ ಪ್ರಕಾರ ಅಂದಾಜು ಸಂಖ್ಯೆಗಳು',
    gnByLotterySub: 'ಪ್ರತಿ ಲಾಟರಿಗೆ ವಿಶೇಷ ಅಂದಾಜು ಸಂಖ್ಯೆಗಳು, ಹಾಟ್/ಕೋಲ್ಡ್ ಸಂಖ್ಯೆಗಳಿಗೆ ಕ್ಲಿಕ್ ಮಾಡಿ',
    gnAbcTitle: 'ಇಂದಿನ ABC ಬೋರ್ಡ್ ಸಂಖ್ಯೆಗಳು', gnAbcSub: 'ಮೂಲ A, B, C ಮೌಲ್ಯಗಳು — ಎಲ್ಲಾ ಸಂಯೋಜನೆಗಳು ಈ ಮೂರು ಅಂಕೆಗಳಿಂದ ಬರುತ್ತವೆ',
    gnBoard: 'ಬೋರ್ಡ್', gnTwoDigit: 'ಎರಡು ಅಂಕಿಯ ಸಂಯೋಜನೆಗಳು', gnThreeDigit: 'ಮೂರು ಅಂಕಿಯ ಸಂಖ್ಯೆಗಳು',
    gnFourDigit: 'ನಾಲ್ಕು ಅಂಕಿಯ ಆಯ್ಕೆಗಳು', gnFourDigitSub: 'ನಿಮ್ಮ ಟಿಕೆಟ್‌ನ ಕೊನೆಯ 4 ಅಂಕೆಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ',
    gnSeriesFreqTitle: 'ಸರಣಿ ಆವರ್ತನ — ಮೊದಲ ಬಹುಮಾನ ಗೆಲುವುಗಳು',
    gnSeriesFreqSub: 'ಎಲ್ಲಾ ಪರಿಶೀಲಿತ ಡ್ರಾಗಳಲ್ಲಿ ಪ್ರತಿ 2-ಅಕ್ಷರ ಸರಣಿ ಎಷ್ಟು ಬಾರಿ ಮೊದಲ ಬಹುಮಾನ ಗೆದ್ದಿದೆ. ವಿಂಗಡಿಸಲು ಕಾಲಮ್ ಕ್ಲಿಕ್ ಮಾಡಿ.',
    gnSeriesEmpty: 'ಪರಿಶೀಲಿತ ಫಲಿತಾಂಶಗಳು ಲಭ್ಯವಾದಾಗ ಸರಣಿ ಡೇಟಾ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    gnHotTitle: '🔥 ಹಾಟ್ ಸಂಖ್ಯೆಗಳು — ಹಿಂದಿನ 30 ಡ್ರಾಗಳು',
    gnHotSub: 'ಇತ್ತೀಚಿನ 30 ಡ್ರಾಗಳಿಂದ, ಪ್ರತಿ ಬಹುಮಾನ ಹಂತದಲ್ಲಿ ಹೆಚ್ಚು ಕಂಡುಬರುವ 5 ಕೊನೆಯ-4-ಅಂಕಿಯ ಅಂತ್ಯಗಳು.',
    gnHotEmpty: 'ಡ್ರಾಗಳು ಲಭ್ಯವಾದಾಗ ಹಾಟ್ ಸಂಖ್ಯೆ ಡೇಟಾ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.', gnAppeared: 'ಕಾಣಿಸಿಕೊಂಡಿದೆ',
    gnDisclaimerBody: 'ಅಂದಾಜು ಸಂಖ್ಯೆಗಳು ಮನರಂಜನೆಗಾಗಿ ಮಾತ್ರ. ಯಾವುದೇ ಸಂಖ್ಯೆಯನ್ನು ಊಹಿಸಲು ಅಥವಾ ಖಾತ್ರಿಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
    gnHot: 'ಹಾಟ್', gnSeriesCol: 'ಸರಣಿ', gnWinsCol: 'ಗೆಲುವುಗಳು', gnLastWonDateCol: 'ಕೊನೆಯ ಗೆದ್ದ ದಿನಾಂಕ',
    gnLastWonDrawCodeCol: 'ಕೊನೆಯ ಗೆದ್ದ ಡ್ರಾ ಕೋಡ್',

    resultNotFound: 'ಫಲಿತಾಂಶ ಕಂಡುಬಂದಿಲ್ಲ.', lotteryNotFound: 'ಲಾಟರಿ ಕಂಡುಬಂದಿಲ್ಲ.', resultLabel: 'ಫಲಿತಾಂಶ',
    moreResultsPrefix: 'ಹೆಚ್ಚು', moreResultsSuffix: 'ಫಲಿತಾಂಶಗಳು', importantDisclaimer: 'ಪ್ರಮುಖ ಹೊಣೆಗಾರಿಕೆ ನಿರಾಕರಣೆ',
    archiveDisclaimerBody: 'ಈ ಆರ್ಕೈವ್ ಪುಟ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ಬಹುಮಾನ ಕ್ಲೈಮ್ ಮಾಡುವ ಮೊದಲು ಯಾವಾಗಲೂ ಅಧಿಕೃತ ಕೇರಳ ಲಾಟರಿ ಪ್ರಕಟಣೆಗಳೊಂದಿಗೆ ವಿಜೇತ ಸಂಖ್ಯೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
    lrDisclaimerBody: 'ಈ ಪುಟದಲ್ಲಿ ಪ್ರಕಟಿಸಲಾದ ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶಗಳು ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ಈ ವೆಬ್‌ಸೈಟ್ ಕೇರಳ ಸರ್ಕಾರದೊಂದಿಗೆ ಸಂಬಂಧ ಹೊಂದಿಲ್ಲ. ಬಹುಮಾನ ಕ್ಲೈಮ್ ಮಾಡುವ ಮೊದಲು ಅಧಿಕೃತ ಗಜೆಟ್‌ನೊಂದಿಗೆ ಫಲಿತಾಂಶಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
    lrHolidayNotice: '{name} — ಇಂದು ಕೇರಳ ಲಾಟರಿ ಡ್ರಾ ಇಲ್ಲ. ಕೆಳಗಿನ ಫಲಿತಾಂಶವು ಇತ್ತೀಚೆಗೆ ಪ್ರಕಟವಾದ ಡ್ರಾ, ಇಂದಿನದಲ್ಲ. ಸಾಮಾನ್ಯ ಫಲಿತಾಂಶಗಳು ನಾಳೆ ಮುಂದುವರಿಯುತ್ತವೆ.',
    lrH1Suffix: 'ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶ ಇಂದು', viewFirstPrizeWinner: '🥇 ಮೊದಲ ಬಹುಮಾನ ವಿಜೇತ ಪುಟ ನೋಡಿ →',
    daResultArchiveDesc: '{date} ಡ್ರಾ ಆರ್ಕೈವ್ — ಸ್ಥಿತಿ, ಮೂಲ ಲಿಂಕ್‌ಗಳು, ಬಹುಮಾನ ಪಟ್ಟಿ ಮತ್ತು ಪರಿಶೀಲನಾ ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ.',

    rdDrawDetails: 'ಡ್ರಾ ವಿವರಗಳು', rdDrawCode: 'ಡ್ರಾ ಕೋಡ್', rdDrawDate: 'ಡ್ರಾ ದಿನಾಂಕ', rdStatus: 'ಸ್ಥಿತಿ',
    rdFirstPrizeDistrict: 'ಮೊದಲ ಬಹುಮಾನ ಜಿಲ್ಲೆ', rdTotalWinners: 'ಒಟ್ಟು ವಿಜೇತರು',
    rdTotalDistribution: 'ಒಟ್ಟು ಬಹುಮಾನ ವಿತರಣೆ', rdSource: 'ಮೂಲ', rdOfficialSource: 'ಅಧಿಕೃತ ಮೂಲ',
    rdDownloadPdf: 'PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ', rdViewImage: 'ಫಲಿತಾಂಶ ಚಿತ್ರ ನೋಡಿ',

    fpNotFound: 'ಫಲಿತಾಂಶ ಕಂಡುಬಂದಿಲ್ಲ', fpBackHome: '← ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ', fpFirstPrizeWinner: 'ಮೊದಲ ಬಹುಮಾನ ವಿಜೇತ',
    fpResultAwaiting: 'ಫಲಿತಾಂಶಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ', fpDrawAt: 'ಡ್ರಾ ಸಮಯ', fpCheckBack: 'ಮಧ್ಯಾಹ್ನ 3 ಗಂಟೆಯ ನಂತರ ನೋಡಿ',
    fpSoldIn: 'ಮಾರಾಟವಾದ ಸ್ಥಳ', fpKerala: 'ಕೇರಳ', fpViewArea: 'ಪ್ರದೇಶ ನೋಡಿ →',
    fpLiveVerify: 'ನೇರ — ಕ್ಲೈಮ್ ಮಾಡುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ', fpTop3Title: 'ಮೊದಲ 3 ಬಹುಮಾನ ವಿಜೇತರು',
    fp1stPrizeCrumb: 'ಮೊದಲ ಬಹುಮಾನ', fpDidYouWin: 'ನೀವು ಗೆದ್ದಿದ್ದೀರಾ?',
    fpVerifyBody: 'ಕ್ಲೈಮ್ ಮಾಡುವ ಮೊದಲು statelottery.kerala.gov.in ನಲ್ಲಿ ನಿಮ್ಮ ಟಿಕೆಟ್ ಪರಿಶೀಲಿಸಿ. ತಿರುವನಂತಪುರಂ ಕೇರಳ ಲಾಟರಿ ನಿರ್ದೇಶನಾಲಯದಲ್ಲಿ 30 ದಿನಗಳಲ್ಲಿ ಕ್ಲೈಮ್ ಮಾಡಿ.',
    fpDisclaimer: 'ಈ ಪುಟ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ಯಾವುದೇ ಬಹುಮಾನ ಕ್ಲೈಮ್ ಮಾಡುವ ಮೊದಲು ಅಧಿಕೃತ ಗಜೆಟ್‌ನೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.',

    cgH1: 'ಕೇರಳ ಲಾಟರಿ ಬಹುಮಾನ ಪಡೆಯುವ ವಿಧಾನ',
    cgSubtitle: 'ಟಿಕೆಟ್ ಪರಿಶೀಲನೆಯಿಂದ ಬಹುಮಾನ ಪಾವತಿಯವರೆಗೆ ಹಂತ-ಹಂತದ ಗೈಡ್ — ತಮಿಳುನಾಡು ನಿವಾಸಿಗಳಿಗೂ ಸೇರಿ.',
    cgDeadlinesTitle: 'ಬಹುಮಾನ ಕ್ಲೈಮ್ ಗಡುವು ಮತ್ತು ಸ್ಥಳಗಳು', cgPrizeCategory: 'ಬಹುಮಾನ ವರ್ಗ',
    cgClaimLocation: 'ಕ್ಲೈಮ್ ಸ್ಥಳ', cgTimeLimit: 'ಸಮಯ ಮಿತಿ', cgProcessTitle: 'ಕ್ಲೈಮ್ ಪ್ರಕ್ರಿಯೆ',
    cgTamilNaduTitle: 'ತಮಿಳುನಾಡು / ಇತರ ರಾಜ್ಯಗಳಿಂದ ಕ್ಲೈಮ್ ಮಾಡುವುದು', cgTaxTitle: 'ಗೆಲುವಿನ ಮೇಲಿನ ತೆರಿಗೆ (TDS)',

    faqH1: 'ಕೇರಳ ಲಾಟರಿ ಪ್ರಶ್ನೋತ್ತರಗಳು',
    faqSubtitle: 'ಫಲಿತಾಂಶಗಳು, ಟಿಕೆಟ್ ಪರಿಶೀಲನೆ, ಬಹುಮಾನ ಕ್ಲೈಮ್ ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತ ಬಳಕೆಯ ಬಗ್ಗೆ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು.',

    loH1: 'ಕೇರಳ ಲಾಟರಿ ಕಚೇರಿಗಳು',
    loSubtitle: 'ಕೇರಳ ರಾಜ್ಯ ಲಾಟರಿ ನಿರ್ದೇಶನಾಲಯ ಮತ್ತು ಎಲ್ಲಾ 14 ಜಿಲ್ಲಾ ಲಾಟರಿ ಕಚೇರಿಗಳ ಪಟ್ಟಿ.',
    loWhichOffice: '📋 ಯಾವ ಕಚೇರಿಗೆ ಭೇಟಿ ನೀಡಬೇಕು?',
    loAllPrizesNote: 'ಎಲ್ಲಾ ಬಹುಮಾನಗಳನ್ನು ಡ್ರಾ ದಿನಾಂಕದಿಂದ 30 ದಿನಗಳಲ್ಲಿ ಕ್ಲೈಮ್ ಮಾಡಬೇಕು. ಮೂಲ ಟಿಕೆಟ್, ಆಧಾರ್, PAN ಮತ್ತು ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ ತರಿ.',
    loHeadquarters: 'ಕೇಂದ್ರ ಕಚೇರಿ', loFax: 'ಫ್ಯಾಕ್ಸ್:', loDistrictOfficesTitle: 'ಜಿಲ್ಲಾ ಲಾಟರಿ ಕಚೇರಿಗಳು',
    loTapExpand: 'ವಿಸ್ತರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ', loViewMaps: 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ನೋಡಿ', loBeforeVisitTitle: '⚠️ ಭೇಟಿ ನೀಡುವ ಮೊದಲು',

    aboutH1: 'Kerala Ticket Results ಬಗ್ಗೆ',
    aboutSubtitle: 'ಕೇರಳ ಲಾಟರಿ ಫಲಿತಾಂಶ ಅಪ್‌ಡೇಟ್‌ಗಳಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ, ಸ್ವತಂತ್ರ ಮೂಲ — ನಿಖರತೆ ಮತ್ತು ವೇಗಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.',
    aboutWhoWeAre: 'ನಾವು ಯಾರು', aboutMission: 'ನಮ್ಮ ಗುರಿ', aboutHowWeWork: 'ನಾವು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ',
    aboutTrustPrinciples: 'ನಮ್ಮ ವಿಶ್ವಾಸ ತತ್ವಗಳು', aboutLegalDisclaimer: 'ಕಾನೂನು ಹೊಣೆಗಾರಿಕೆ ನಿರಾಕರಣೆ',
    aboutLotteriesCovered: 'ಒಳಗೊಂಡ ಲಾಟರಿಗಳು', aboutResultUpdates: 'ಫಲಿತಾಂಶ ಅಪ್‌ಡೇಟ್‌ಗಳು',
    aboutDrawTimeIST: 'ಡ್ರಾ ಸಮಯ IST', aboutResultsPublished: 'ಫಲಿತಾಂಶಗಳು ಪ್ರಕಟಿಸಲಾಗಿದೆ',
    aboutLotteriesWeCover: 'ನಾವು ಒಳಗೊಂಡಿರುವ ಲಾಟರಿಗಳು',

    contactH1: 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ', contactSubtitle: 'ಫಲಿತಾಂಶ ತಿದ್ದುಪಡಿಗಳು, ಪ್ರತಿಕ್ರಿಯೆ ಅಥವಾ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು — ನಾವು ಪ್ರತಿ ಸಂದೇಶವನ್ನು ಓದುತ್ತೇವೆ.',
    contactSendMessage: 'ಸಂದೇಶ ಕಳುಹಿಸಿ', contactReplyTime: 'ನಾವು 2 ಕಾರ್ಯದಿನಗಳಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯಿಸಲು ಪ್ರಯತ್ನಿಸುತ್ತೇವೆ.',
    contactSentTitle: 'ಸಂದೇಶ ಕಳುಹಿಸಲಾಗಿದೆ!', contactSendAnother: 'ಇನ್ನೊಂದು ಕಳುಹಿಸಿ', contactYourName: 'ನಿಮ್ಮ ಹೆಸರು *',
    contactEmail: 'ಇಮೇಲ್ ವಿಳಾಸ *', contactSubject: 'ವಿಷಯ *', contactLotteryName: 'ಲಾಟರಿ ಹೆಸರು',
    contactDrawCode: 'ಡ್ರಾ ಕೋಡ್', contactMessage: 'ಸಂದೇಶ *', contactHowCanWeHelp: 'ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    contactErrorMsg: 'ಏನೋ ತಪ್ಪಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನೇರವಾಗಿ ಇಮೇಲ್ ಮಾಡಿ.',
    contactSending: 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…', contactSendBtn: 'ಸಂದೇಶ ಕಳುಹಿಸಿ →', contactEmailLabel: 'ಇಮೇಲ್',
    contactResponseNote: '2 ಕಾರ್ಯದಿನಗಳಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯೆ', contactSupportHours: 'ಸಹಾಯ ಸಮಯ',
    contactHoursNote: 'ಬೆಳಿಗ್ಗೆ 9:00 – ಸಂಜೆ 6:00 IST', contactImportantNotice: 'ಪ್ರಮುಖ ಸೂಚನೆ',
    contactForCorrections: 'ಫಲಿತಾಂಶ ತಿದ್ದುಪಡಿಗಳಿಗಾಗಿ', subjectGeneral: 'ಸಾಮಾನ್ಯ ವಿಚಾರಣೆ',
    subjectCorrection: 'ಫಲಿತಾಂಶ ತಿದ್ದುಪಡಿ', subjectFeedback: 'ವೆಬ್‌ಸೈಟ್ ಪ್ರತಿಕ್ರಿಯೆ',
    subjectPrivacy: 'ಗೌಪ್ಯತೆ / ಡೇಟಾ ವಿನಂತಿ', subjectOther: 'ಇತರೆ',

    discH1: 'ಹೊಣೆಗಾರಿಕೆ ನಿರಾಕರಣೆ', discSubtitle: 'ಈ ವೆಬ್‌ಸೈಟ್‌ನಿಂದ ಲಾಟರಿ ಫಲಿತಾಂಶ ಮಾಹಿತಿಯನ್ನು ಬಳಸುವ ಮೊದಲು ಇದನ್ನು ಓದಿ.',
    discInfoOnly: 'ಮಾಹಿತಿ ವೆಬ್‌ಸೈಟ್ ಮಾತ್ರ', discVerifySources: 'ಅಧಿಕೃತ ಮೂಲಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    discNoGuarantee: 'ಗೆಲುವಿನ ಖಾತ್ರಿ ಇಲ್ಲ', discFinancialRisk: 'ಆರ್ಥಿಕ ಅಪಾಯ',

    ppH1: 'ಗೌಪ್ಯತೆ ನೀತಿ', termsH1: 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು',

    dfH1: 'ಲಾಟರಿ ಫಾರ್ಮ್‌ಗಳು ಮತ್ತು ಡೌನ್‌ಲೋಡ್‌ಗಳು',
    dfSubtitle: 'ಫಾರ್ಮ್‌ಗಳು ಮತ್ತು ದಾಖಲೆಗಳಿಗೆ ಮಾರ್ಗದರ್ಶಿಯಾಗಿ ಈ ಪುಟವನ್ನು ಬಳಸಿ.',
    dfCommonDocs: 'ಸಾಮಾನ್ಯ ದಾಖಲೆಗಳು', dfOfficialLinks: 'ಅಧಿಕೃತ ಫಾರ್ಮ್ ಲಿಂಕ್‌ಗಳು', dfImportant: 'ಪ್ರಮುಖ',

    nf404: '404 ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ', nfHint: 'ಪುಟವನ್ನು ರೂಟರ್‌ಗೆ ಸೇರಿಸಲು ಮರೆತಿರಾ?',
  },
};

export function t(lang: Lang, key: UIKey): string {
  return translations[lang]?.[key] ?? translations.en[key];
}

// Prize tier names (e.g. "1st Prize", "Consolation Prize") come from
// results.json — that data stays in English. This maps the data string to
// a translated display label; unrecognized tiers fall back to the raw
// English string rather than showing nothing.
export const prizeTierLabels: Record<Lang, Record<string, string>> = {
  en: {
    '1st Prize': '1st Prize', '2nd Prize': '2nd Prize', '3rd Prize': '3rd Prize',
    '4th Prize': '4th Prize', '5th Prize': '5th Prize', '6th Prize': '6th Prize',
    '7th Prize': '7th Prize', '8th Prize': '8th Prize', '9th Prize': '9th Prize',
    '10th Prize': '10th Prize', 'Consolation Prize': 'Consolation Prize',
  },
  ta: {
    '1st Prize': 'முதல் பரிசு', '2nd Prize': 'இரண்டாம் பரிசு', '3rd Prize': 'மூன்றாம் பரிசு',
    '4th Prize': 'நான்காம் பரிசு', '5th Prize': 'ஐந்தாம் பரிசு', '6th Prize': 'ஆறாம் பரிசு',
    '7th Prize': 'ஏழாம் பரிசு', '8th Prize': 'எட்டாம் பரிசு', '9th Prize': 'ஒன்பதாம் பரிசு',
    '10th Prize': 'பத்தாம் பரிசு', 'Consolation Prize': 'ஆறுதல் பரிசு',
  },
  ml: {
    '1st Prize': 'ഒന്നാം സമ്മാനം', '2nd Prize': 'രണ്ടാം സമ്മാനം', '3rd Prize': 'മൂന്നാം സമ്മാനം',
    '4th Prize': 'നാലാം സമ്മാനം', '5th Prize': 'അഞ്ചാം സമ്മാനം', '6th Prize': 'ആറാം സമ്മാനം',
    '7th Prize': 'ഏഴാം സമ്മാനം', '8th Prize': 'എട്ടാം സമ്മാനം', '9th Prize': 'ഒൻപതാം സമ്മാനം',
    '10th Prize': 'പത്താം സമ്മാനം', 'Consolation Prize': 'സാന്ത്വന സമ്മാനം',
  },
  hi: {
    '1st Prize': 'पहला पुरस्कार', '2nd Prize': 'दूसरा पुरस्कार', '3rd Prize': 'तीसरा पुरस्कार',
    '4th Prize': 'चौथा पुरस्कार', '5th Prize': 'पांचवां पुरस्कार', '6th Prize': 'छठा पुरस्कार',
    '7th Prize': 'सातवां पुरस्कार', '8th Prize': 'आठवां पुरस्कार', '9th Prize': 'नौवां पुरस्कार',
    '10th Prize': 'दसवां पुरस्कार', 'Consolation Prize': 'सांत्वना पुरस्कार',
  },
  kn: {
    '1st Prize': 'ಮೊದಲ ಬಹುಮಾನ', '2nd Prize': 'ಎರಡನೇ ಬಹುಮಾನ', '3rd Prize': 'ಮೂರನೇ ಬಹುಮಾನ',
    '4th Prize': 'ನಾಲ್ಕನೇ ಬಹುಮಾನ', '5th Prize': 'ಐದನೇ ಬಹುಮಾನ', '6th Prize': 'ಆರನೇ ಬಹುಮಾನ',
    '7th Prize': 'ಏಳನೇ ಬಹುಮಾನ', '8th Prize': 'ಎಂಟನೇ ಬಹುಮಾನ', '9th Prize': 'ಒಂಬತ್ತನೇ ಬಹುಮಾನ',
    '10th Prize': 'ಹತ್ತನೇ ಬಹುಮಾನ', 'Consolation Prize': 'ಸಮಾಧಾನ ಬಹುಮಾನ',
  },
};

export function tTier(lang: Lang, tier: string): string {
  return prizeTierLabels[lang]?.[tier] ?? tier;
}

// Not strictly required (useLang() below derives the language directly
// from the URL on every call, so any component can call it standalone,
// same as they already call wouter's useLocation()/useParams()) — kept in
// case a subtree ever needs to force a language regardless of URL.
export const LangContext = createContext<Lang | null>(null);

// Reads the URL's first path segment to determine the active language —
// any component (page or otherwise) can call this directly, no provider
// required. Mirrors prerender.mjs's ALT_LOCALES / makeLocaleRoute path
// convention.
export function useLang(): Lang {
  const forced = useContext(LangContext);
  const [location] = useLocation();
  if (forced) return forced;
  const seg = location.split('/')[1];
  return (ALT_LOCALES as string[]).includes(seg) ? (seg as Lang) : 'en';
}

// Prefixes an app-relative path (e.g. "/chart", "/") with the active
// language, so a link generated on a /ta page stays on /ta instead of
// dropping back to English. Mirrors makeLocaleRoute()'s path rule in
// prerender.mjs.
export function withLang(path: string, lang: Lang): string {
  if (lang === 'en') return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}
