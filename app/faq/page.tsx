import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kerala Lottery FAQ',
  description: 'Frequently asked questions about Kerala Lottery results, ticket checking, claims, and verification.'
};

const faqs = [
  ['When are Kerala Lottery results published?', 'Most regular Kerala Lottery draws are published around 3 PM IST. Exact publication time can vary, so always verify with official sources.'],
  ['Is this an official Kerala Lottery website?', 'No. Kerala Ticket Results is an independent informational website and is not affiliated with the Kerala Government.'],
  ['Can I claim a prize using this website?', 'No. Prize claims must be made through official lottery agents, district lottery offices, or the Directorate of Kerala Lotteries as applicable.'],
  ['Are guessing numbers guaranteed?', 'No. Guessing numbers are for entertainment only. Lottery is chance-based and no number can be guaranteed.'],
  ['How should I verify a result?', 'Cross-check the draw code, date, ticket number, and prize tier with the official Kerala Lottery publication or Gazette.']
];

export default function FaqPage() {
  return (
    <main className="page"><div className="container">
      <div className="hero"><h1>Kerala Lottery FAQ</h1><p>Common questions about results, checking tickets, and responsible use.</p></div>
      {faqs.map(([question, answer]) => <section className="content-card" key={question}><h2>{question}</h2><p>{answer}</p></section>)}
    </div></main>
  );
}
