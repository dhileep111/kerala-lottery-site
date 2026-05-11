import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Claim Kerala Lottery Prize 2026',
  description: 'Step-by-step Kerala Lottery prize claim guide with claim locations, documents, and responsible verification guidance.'
};

export default function ClaimGuidePage() {
  return (
    <main className="page"><div className="container">
      <div className="hero"><h1>How to Claim Kerala Lottery Prize</h1><p>Step-by-step guide from ticket verification to prize payment.</p></div>
      <section className="content-card"><h2>Prize Claim Deadlines & Locations</h2><div className="table-wrap"><table><thead><tr><th>Prize Category</th><th>Claim Location</th><th>Time Limit</th></tr></thead><tbody><tr><td>Up to ₹5,000</td><td>Any authorised lottery agent</td><td>30 days</td></tr><tr><td>₹5,001 – ₹1,00,000</td><td>District Lottery Office</td><td>30 days</td></tr><tr><td>Above ₹1,00,000</td><td>Directorate of Kerala Lotteries, Thiruvananthapuram</td><td>30 days</td></tr></tbody></table></div></section>
      <section className="content-card"><h2>Claim Process</h2><ol><li>Verify your ticket with the official Kerala Government Gazette.</li><li>Sign the back of the winning ticket immediately.</li><li>Collect Aadhaar, PAN, photographs, bank proof, and claim form.</li><li>Visit the correct office based on the prize amount.</li><li>Complete official verification and tax deduction steps.</li></ol></section>
      <section className="content-card"><h2>Disclaimer</h2><p>This guide is informational. Rules can change, so always confirm the latest process with the official Kerala State Lotteries department.</p></section>
    </div></main>
  );
}
