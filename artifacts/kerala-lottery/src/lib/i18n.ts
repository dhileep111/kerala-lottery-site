import { createContext, useContext } from 'react';
import { useLocation } from 'wouter';

// Kept in sync with prerender.mjs's ALT_LOCALES and generate-full-sitemap.mjs.
export type Lang = 'en' | 'ta' | 'ml' | 'hi' | 'kn';
export const ALT_LOCALES: Lang[] = ['ta', 'ml', 'hi', 'kn'];
export const ALL_LANGS: Lang[] = ['en', ...ALT_LOCALES];

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
  | 'verifiedResult' | 'liveUpdate';

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
