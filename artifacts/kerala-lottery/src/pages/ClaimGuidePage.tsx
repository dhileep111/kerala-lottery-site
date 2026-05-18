import { JsonLd } from '../components/JsonLd';
import { site } from '../data';

const claimSteps = [
  { name: 'Verify your ticket with the official Gazette', text: 'Cross-check your ticket number, draw code, and date against the Kerala Government Gazette notification or the official Kerala State Lotteries website before proceeding.' },
  { name: 'Sign the back of the winning ticket immediately', text: 'Sign your name on the back of the winning ticket immediately after verification. An unsigned ticket may be considered invalid during the claim process.' },
  { name: 'Collect required documents', text: 'Gather: original winning ticket, Aadhaar card, PAN card, two recent passport-size photographs, and bank account details (passbook or cancelled cheque) for prize transfer.' },
  { name: 'Visit the correct lottery office', text: 'For prizes up to ₹5,000 visit any authorised lottery agent. For ₹5,001 – ₹1,00,000 visit your District Lottery Office. For prizes above ₹1,00,000 visit the Directorate of Kerala Lotteries, Thiruvananthapuram.' },
  { name: 'Complete official verification and TDS process', text: 'Prize payments above ₹10,000 are subject to 30% TDS plus surcharge under Indian income tax law. The deduction is made before the prize amount is released to you.' },
];

export default function ClaimGuidePage() {
  return (
    <main className="page"><div className="container">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': 'How to Claim a Kerala Lottery Prize',
        'description': 'Step-by-step guide to claim your Kerala lottery prize. Covers prize tiers, required documents, deadlines, and the TDS process.',
        'url': `${site.url}/claim-guide`,
        'totalTime': 'P7D',
        'step': claimSteps.map((s, i) => ({
          '@type': 'HowToStep',
          'position': i + 1,
          'name': s.name,
          'text': s.text,
        })),
      }} />
      <div className="hero"><h1>How to Claim Kerala Lottery Prize</h1><p>Step-by-step guide from ticket verification to prize payment — including Tamil Nadu residents.</p></div>

      <section className="content-card">
        <h2>Prize Claim Deadlines &amp; Locations</h2>
        <div className="table-wrap"><table><thead><tr><th>Prize Category</th><th>Claim Location</th><th>Time Limit</th></tr></thead><tbody>
          <tr><td>Up to ₹5,000</td><td>Any authorised lottery agent</td><td>30 days</td></tr>
          <tr><td>₹5,001 – ₹1,00,000</td><td>District Lottery Office</td><td>30 days</td></tr>
          <tr><td>Above ₹1,00,000</td><td>Directorate of Kerala Lotteries, Thiruvananthapuram</td><td>30 days</td></tr>
        </tbody></table></div>
      </section>

      <section className="content-card">
        <h2>Claim Process</h2>
        <ol>
          {claimSteps.map((s) => <li key={s.name}><strong>{s.name}.</strong> {s.text}</li>)}
        </ol>
      </section>

      <section className="content-card">
        <h2>Claiming from Tamil Nadu / Other States</h2>
        <p>Residents of Tamil Nadu, Karnataka, and other neighbouring states can claim Kerala Lottery prizes. You are not required to travel to Kerala for prizes up to ₹1,00,000 — those can be claimed at designated district offices. For larger prizes, you must visit the Directorate of Kerala Lotteries in Thiruvananthapuram in person.</p>
        <p>Bring valid state government-issued ID (Aadhaar, Voter ID, or Passport), PAN card, and proof of address. The prize money will be transferred to your Indian bank account via NEFT after TDS deduction.</p>
        <p><strong>Tamil Nadu border districts note:</strong> The nearest Kerala District Lottery Office for Coimbatore, Tiruppur, and Erode residents is typically the Palakkad District Lottery Office.</p>
      </section>

      <section className="content-card">
        <h2>Tax on Winnings (TDS)</h2>
        <p>Lottery prizes above ₹10,000 are subject to 30% TDS (Tax Deducted at Source) plus applicable surcharge and education cess under Section 194B of the Income Tax Act. The net amount after deduction is paid to the winner. Retain your TDS certificate (Form 16A) for income tax filing.</p>
      </section>

      <section className="content-card">
        <h2>Disclaimer</h2>
        <p>This guide is informational and based on publicly available Kerala State Lotteries rules. Rules and procedures can change without notice. Always confirm the current process directly with the official Kerala State Lotteries department before making any prize claim.</p>
      </section>
    </div></main>
  );
}
