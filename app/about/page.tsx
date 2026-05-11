import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About, Trust & Disclaimer',
  description: 'About Kerala Ticket Results, our independent status, responsible lottery disclaimer, and source transparency.'
};

export default function AboutPage() {
  return (
    <main className="page"><div className="container">
      <div className="hero"><h1>About Kerala Ticket Results</h1><p>An independent informational portal for Kerala Lottery result updates.</p></div>
      <section className="content-card"><h2>What Changed</h2><p>The site is moving away from hardcoded template HTML and toward a framework-based, data-driven architecture where lottery data lives in JSON/database-ready records and pages are generated from shared components.</p></section>
      <section className="content-card"><h2>Full Legal Disclaimer</h2><p>This website is an independent informational portal and is not affiliated with the Kerala State Lottery Department or the Government of Kerala.</p><p>Always verify your winning numbers with the official Kerala Government Gazette before making any prize claims or financial decisions.</p></section>
      <section className="content-card"><h2>Trust Principles</h2><ul><li>Separate pending, live, and verified statuses.</li><li>Do not present template numbers as official data.</li><li>Keep source names and source URLs with every draw.</li><li>Prioritize responsible participation and accuracy over hype.</li></ul></section>
    </div></main>
  );
}
