import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kerala Lottery Offices',
  description: 'Kerala Lottery office information and guidance for prize claim verification.'
};

export default function LotteryOfficesPage() {
  return (
    <main className="page"><div className="container">
      <div className="hero"><h1>Kerala Lottery Offices</h1><p>Office guidance for lottery prize claims and result verification. Add district office details after verification.</p></div>
      <section className="content-card"><h2>Directorate of Kerala State Lotteries</h2><p><strong>Address:</strong> Vikas Bhavan, Thiruvananthapuram, Kerala – 695033</p><p><strong>Phone:</strong> 0471-2305193</p><p><strong>Official Website:</strong> statelottery.kerala.gov.in</p></section>
      <section className="content-card"><h2>District Lottery Offices</h2><p>Add verified district office addresses, phone numbers, and working hours here. Keep this page updated from official sources only.</p></section>
      <section className="content-card"><h2>Before Visiting</h2><ul><li>Carry the original ticket and required documents.</li><li>Verify office working hours.</li><li>Do not hand over tickets to unauthorized persons.</li><li>Use official contacts for claim-related questions.</li></ul></section>
    </div></main>
  );
}
