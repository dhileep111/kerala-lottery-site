import { useLang, t } from '../lib/i18n';

export default function DisclaimerPage() {
  const lang = useLang();
  return (
    <main className="page"><div className="container">
      <div className="hero"><h1>{t(lang, 'discH1')}</h1><p>{t(lang, 'discSubtitle')}</p></div>
      <section className="content-card"><h2>{t(lang, 'discInfoOnly')}</h2><p>Kerala Ticket Results is an independent informational website. We are not an official government website and are not affiliated with the Kerala State Lottery Department.</p></section>
      <section className="content-card"><h2>{t(lang, 'discVerifySources')}</h2><p>Always verify winning numbers, draw codes, dates, and prize amounts with official Kerala Lottery publications or the Kerala Government Gazette before making a prize claim.</p></section>
      <section className="content-card"><h2>{t(lang, 'discNoGuarantee')}</h2><p>Any guessing numbers, tips, or analysis published on this website are for entertainment and education only. They do not guarantee winning outcomes.</p></section>
      <section className="content-card"><h2>{t(lang, 'discFinancialRisk')}</h2><p>Lottery participation involves financial risk. Please play responsibly and do not spend more than you can afford to lose.</p></section>
    </div></main>
  );
}
