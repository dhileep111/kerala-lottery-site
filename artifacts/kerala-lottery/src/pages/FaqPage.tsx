import { JsonLd } from '../components/JsonLd';
import { site } from '../data';

const faqs = [
  ['When are Kerala Lottery results published?', 'Most regular Kerala Lottery draws are published around 3 PM IST. Exact publication time can vary, so always verify with official sources.'],
  ['Is this an official Kerala Lottery website?', 'No. Kerala Ticket Results is an independent informational website and is not affiliated with the Kerala Government.'],
  ['Can I claim a prize using this website?', 'No. Prize claims must be made through official lottery agents, district lottery offices, or the Directorate of Kerala Lotteries as applicable.'],
  ['Are guessing numbers guaranteed?', 'No. Guessing numbers are for entertainment only. Lottery is chance-based and no number can be guaranteed.'],
  ['How should I verify a result?', 'Cross-check the draw code, date, ticket number, and prize tier with the official Kerala Lottery publication or Gazette.'],
  ['How long do I have to claim a Kerala Lottery prize?', 'Winning tickets must be claimed within 30 days of the draw date. Prizes above ₹1,00,000 must be claimed at the Directorate of Kerala Lotteries in Thiruvananthapuram.'],
  ['Can people from Tamil Nadu claim Kerala Lottery prizes?', 'Yes. Residents of Tamil Nadu and other states can claim Kerala Lottery prizes. You must present valid ID proof, PAN card, and bank details at the appropriate Kerala Lottery office.'],
  ['What documents are needed to claim a prize?', 'You need: the original winning ticket (signed on the back), Aadhaar card, PAN card, two passport-size photographs, and bank account details for prize transfer.'],
  ['What is the tax on Kerala Lottery winnings?', 'Lottery winnings above ₹10,000 are subject to 30% TDS (Tax Deducted at Source) plus applicable surcharge and cess under Indian income tax law.'],
];

export default function FaqPage() {
  return (
    <main className="page"><div className="container">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'name': 'Kerala Lottery FAQ',
        'url': `${site.url}/faq`,
        'mainEntity': faqs.map(([question, answer]) => ({
          '@type': 'Question',
          'name': question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': answer,
          },
        })),
      }} />
      <div className="hero"><h1>Kerala Lottery FAQ</h1><p>Common questions about results, checking tickets, claiming prizes, and responsible use.</p></div>
      {faqs.map(([question, answer]) => <section className="content-card" key={question}><h2>{question}</h2><p>{answer}</p></section>)}
    </div></main>
  );
}
