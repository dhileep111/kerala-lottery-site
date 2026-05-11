import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Kerala Ticket Results for corrections, feedback, result update issues, and privacy questions.'
};

export default function ContactPage() {
  return (
    <main className="page">
      <div className="container">
        <div className="hero">
          <h1>Contact Us</h1>
          <p>Use this page for corrections, feedback, result update issues, privacy questions, and general website support.</p>
        </div>

        <section className="content-card">
          <h2>Email</h2>
          <p><strong>your-email@example.com</strong></p>
          <p>Replace this placeholder with your real email address before publishing or applying for Google AdSense.</p>
        </section>

        <section className="content-card">
          <h2>Result Corrections</h2>
          <p>If you believe a lottery result, draw code, date, prize amount, or winning number is incorrect, please include the following details in your message:</p>
          <ul>
            <li>Lottery name, such as Karunya or Sthree Sakthi.</li>
            <li>Draw code and draw date.</li>
            <li>The incorrect information shown on our website.</li>
            <li>The correct information and official source link, if available.</li>
          </ul>
        </section>

        <section className="content-card">
          <h2>Important Notice</h2>
          <p>Kerala Ticket Results is an independent informational website. We are not affiliated with the Kerala Government or the Directorate of Kerala State Lotteries.</p>
          <p>For official lottery claims, payments, ticket validation, or legal questions, contact the official Kerala Lottery Department or your nearest lottery office.</p>
        </section>

        <section className="content-card">
          <h2>Response Time</h2>
          <p>We try to review genuine correction and feedback messages within 2 business days. Messages about urgent prize claims should be directed to official lottery authorities.</p>
        </section>
      </div>
    </main>
  );
}
