import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kerala Lottery Forms and Downloads',
  description: 'Guide to Kerala Lottery claim forms and documents needed for prize claims.'
};

export default function DownloadFormsPage() {
  return (
    <main className="page"><div className="container">
      <div className="hero"><h1>Lottery Forms and Downloads</h1><p>Use this page as a guide for forms and documents. Add official download links after verification.</p></div>
      <section className="content-card"><h2>Common Documents</h2><ul><li>Original winning lottery ticket signed by the claimant.</li><li>Valid ID proof such as Aadhaar or other accepted identification.</li><li>PAN card where required for tax processing.</li><li>Passport-size photographs.</li><li>Bank account proof or cancelled cheque.</li><li>Completed official prize claim form.</li></ul></section>
      <section className="content-card"><h2>Official Form Links</h2><p>Add official Kerala Lottery form links here after verifying them from the official department website. Do not link to unverified third-party downloads.</p></section>
      <section className="content-card"><h2>Important</h2><p>Rules and forms can change. Always confirm the latest requirements with official Kerala Lottery offices before submitting claims.</p></section>
    </div></main>
  );
}
