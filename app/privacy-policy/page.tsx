import type { Metadata } from 'next';
import { site } from '../data';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Kerala Ticket Results, including cookies, analytics, advertising, and contact information.'
};

export default function PrivacyPolicyPage() {
  return (
    <main className="page">
      <div className="container">
        <div className="hero">
          <h1>Privacy Policy</h1>
          <p>Last updated: May 11, 2026. You can edit this page later with your final contact email, analytics tools, and AdSense publisher details.</p>
        </div>

        <section className="content-card">
          <h2>Who We Are</h2>
          <p>{site.name} is an independent informational website that publishes Kerala Lottery result updates, schedules, claim guidance, and responsible lottery information. We are not an official government website and are not affiliated with the Kerala State Lottery Department.</p>
        </section>

        <section className="content-card">
          <h2>Information We Collect</h2>
          <p>We do not ask users to create accounts or submit sensitive personal information to view lottery results. If you contact us by email or through a future contact form, we may receive your name, email address, message content, and any details you choose to share.</p>
          <p>Like most websites, our hosting provider, analytics tools, or security systems may automatically collect basic technical information such as IP address, browser type, device type, pages visited, referral source, and date/time of visit.</p>
        </section>

        <section className="content-card">
          <h2>Cookies and Advertising</h2>
          <p>This website may use cookies or similar technologies to improve site performance, measure traffic, prevent abuse, and display advertisements.</p>
          <p>If we use Google AdSense or other Google advertising services, Google and its partners may use cookies or other identifiers to serve ads, measure ad performance, and personalize ads where permitted by law.</p>
          <p>You can learn more about how Google uses data from sites that use its services at policies.google.com/technologies/partner-sites.</p>
        </section>

        <section className="content-card">
          <h2>How We Use Information</h2>
          <ul>
            <li>To operate, maintain, and improve the website.</li>
            <li>To respond to corrections, feedback, or contact requests.</li>
            <li>To understand website traffic and improve user experience.</li>
            <li>To protect the website from spam, abuse, and security threats.</li>
            <li>To show ads if advertising is enabled on the website.</li>
          </ul>
        </section>

        <section className="content-card">
          <h2>Third-Party Services</h2>
          <p>We may use third-party services such as hosting providers, analytics tools, search tools, and advertising networks. These services may process data according to their own privacy policies.</p>
          <p>Before enabling any new third-party service, update this page with the service name and its privacy information.</p>
        </section>

        <section className="content-card">
          <h2>Lottery Result Disclaimer</h2>
          <p>Lottery result information is provided for informational purposes only. Users should always verify winning numbers with official Kerala Lottery publications before making financial decisions or prize claims.</p>
        </section>

        <section className="content-card">
          <h2>Your Choices</h2>
          <ul>
            <li>You can disable cookies in your browser settings.</li>
            <li>You can choose not to contact us or submit optional information.</li>
            <li>You can request correction or deletion of contact messages you previously sent to us, where applicable.</li>
          </ul>
        </section>

        <section className="content-card">
          <h2>Contact</h2>
          <p>For privacy questions, corrections, or data requests, contact us at: <strong>your-email@example.com</strong>.</p>
          <p>Replace this placeholder email with your real website contact email before applying for AdSense.</p>
        </section>
      </div>
    </main>
  );
}
