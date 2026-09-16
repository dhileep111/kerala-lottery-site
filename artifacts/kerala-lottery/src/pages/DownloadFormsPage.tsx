import { useLang, t } from '../lib/i18n';

export default function DownloadFormsPage() {
  const lang = useLang();
  return (
    <main className="page"><div className="container">
      <div className="hero"><h1>{t(lang, 'dfH1')}</h1><p>{t(lang, 'dfSubtitle')}</p></div>
      <section className="content-card"><h2>{t(lang, 'dfCommonDocs')}</h2><ul><li>Original winning lottery ticket signed by the claimant.</li><li>Valid ID proof such as Aadhaar or other accepted identification.</li><li>PAN card where required for tax processing.</li><li>Passport-size photographs.</li><li>Bank account proof or cancelled cheque.</li><li>Completed official prize claim form.</li></ul></section>
      <section className="content-card"><h2>{t(lang, 'dfOfficialLinks')}</h2><p>Add official Kerala Lottery form links here after verifying them from the official department website. Do not link to unverified third-party downloads.</p></section>
      <section className="content-card"><h2>{t(lang, 'dfImportant')}</h2><p>Rules and forms can change. Always confirm the latest requirements with official Kerala Lottery offices before submitting claims.</p></section>
    </div></main>
  );
}
