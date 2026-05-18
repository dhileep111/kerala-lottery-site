import { site } from '../data';

export default function PrivacyPolicyPage() {
  return (
    <main className="page">
      <div className="container">
        <div className="hero">
          <h1>Privacy Policy</h1>
          <p>Last updated: May 11, 2026. This policy explains how Kerala Ticket Results collects, uses, and protects information when you visit <strong>keralaticketresults.in</strong>.</p>
        </div>

        <section className="content-card">
          <h2>Who We Are</h2>
          <p>{site.name} (<strong>keralaticketresults.in</strong>) is an independent informational website that publishes Kerala Lottery result updates, draw schedules, prize claim guidance, and responsible lottery information. We are not affiliated with the Kerala State Lottery Department or the Government of Kerala.</p>
        </section>

        <section className="content-card">
          <h2>Information We Collect</h2>
          <p>We do not require you to create an account or submit any personal information to view lottery results.</p>
          <p style={{ marginTop: 10 }}>If you contact us via our contact form or by email, we receive the information you voluntarily provide — such as your name, email address, and message content — solely to respond to your enquiry.</p>
          <p style={{ marginTop: 10 }}>Like most websites, our servers and analytics services automatically collect basic technical data including IP address, browser type, device type, pages visited, referral source, and visit timestamps. This information is used only to understand site usage and improve performance.</p>
        </section>

        <section className="content-card">
          <h2>Cookies and Analytics</h2>
          <p>This website uses <strong>Google Analytics (via Google Tag Manager)</strong> to measure traffic and user behaviour in an aggregated, anonymised form. Google Analytics may set cookies on your device to recognise returning visitors and track session data.</p>
          <p style={{ marginTop: 10 }}>We do not use cookies to store personal information or track you across other websites for advertising purposes.</p>
          <p style={{ marginTop: 10 }}>You can opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>, or by disabling cookies in your browser settings.</p>
        </section>

        <section className="content-card">
          <h2>Advertising</h2>
          <p>This website may display advertisements served by <strong>Google AdSense</strong> or similar advertising networks. Google and its partners may use cookies or device identifiers to serve ads based on your prior visits to this website and other websites on the internet.</p>
          <p style={{ marginTop: 10 }}>You can learn more about how Google uses data from advertising partners at <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>. You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</p>
        </section>

        <section className="content-card">
          <h2>How We Use Information</h2>
          <ul>
            <li>To operate, maintain, and improve <strong>keralaticketresults.in</strong>.</li>
            <li>To respond to messages, result corrections, or feedback submitted via our contact form.</li>
            <li>To understand how visitors use the site and improve content and performance.</li>
            <li>To protect the website from spam, abuse, and security threats.</li>
            <li>To serve advertisements where advertising is enabled.</li>
          </ul>
          <p style={{ marginTop: 10 }}>We do not sell, trade, or rent your personal information to third parties.</p>
        </section>

        <section className="content-card">
          <h2>Third-Party Services</h2>
          <p>We use the following third-party services that may process limited data as part of their normal operation:</p>
          <ul>
            <li><strong>Google Tag Manager &amp; Google Analytics</strong> — website traffic measurement</li>
            <li><strong>Google AdSense</strong> — advertising</li>
            <li><strong>Formspree</strong> — contact form message delivery</li>
            <li><strong>GitHub Pages</strong> — website hosting</li>
            <li><strong>Google Fonts</strong> — typography (Inter font family)</li>
          </ul>
          <p style={{ marginTop: 10 }}>Each service operates under its own privacy policy. We only use services that meet reasonable data privacy standards.</p>
        </section>

        <section className="content-card">
          <h2>Lottery Result Disclaimer</h2>
          <p>Lottery result information published on this website is for informational purposes only. Always verify winning numbers with official Kerala State Lottery publications or the Kerala Government Gazette before making any prize claims or financial decisions. We are not responsible for errors, delays, or omissions in result data.</p>
        </section>

        <section className="content-card">
          <h2>Your Choices</h2>
          <ul>
            <li>You can disable cookies in your browser settings at any time.</li>
            <li>You can opt out of Google Analytics and Google personalised ads using the links above.</li>
            <li>You are never required to submit personal information to use this website.</li>
            <li>If you previously contacted us and wish to request deletion of your message, email us at <strong>support@keralaticketresults.in</strong>.</li>
          </ul>
        </section>

        <section className="content-card">
          <h2>Children's Privacy</h2>
          <p>This website is not directed at children under 13 years of age and we do not knowingly collect personal information from children. If you believe a child has submitted information to us, please contact us and we will delete it promptly.</p>
        </section>

        <section className="content-card">
          <h2>Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page will reflect any changes. Continued use of the website after changes constitutes your acceptance of the updated policy.</p>
        </section>

        <section className="content-card">
          <h2>Contact</h2>
          <p>For privacy questions, data requests, or to report a concern, contact us at:</p>
          <p style={{ marginTop: 8 }}>
            <strong>Email:</strong> <a href="mailto:support@keralaticketresults.in">support@keralaticketresults.in</a><br />
            <strong>Website:</strong> <a href="https://keralaticketresults.in/contact">keralaticketresults.in/contact</a>
          </p>
        </section>
      </div>
    </main>
  );
}
