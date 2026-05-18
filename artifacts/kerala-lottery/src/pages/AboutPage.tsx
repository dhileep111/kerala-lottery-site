export default function AboutPage() {
  return (
    <main className="page">
      <div className="container">
        <div className="hero">
          <h1>About Kerala Ticket Results</h1>
          <p>Your trusted, independent source for Kerala Lottery result updates — built for accuracy and speed.</p>
        </div>

        <div className="about-grid">
          <div className="about-main">
            <section className="content-card">
              <h2>Who We Are</h2>
              <p>Kerala Ticket Results is an independent informational portal dedicated to helping Kerala lottery participants check daily results quickly and accurately. We are not affiliated with the Kerala State Lottery Department or the Government of Kerala.</p>
              <p style={{ marginTop: 10 }}>Our team monitors official lottery publications daily and updates results as soon as they are officially published, typically after 4:30 PM IST.</p>
            </section>

            <section className="content-card">
              <h2>Our Mission</h2>
              <p>Millions of people in Kerala participate in the state lottery every week. We built this platform to make result checking faster, clearer, and more trustworthy — without fake numbers, misleading guesses, or clickbait.</p>
            </section>

            <section className="content-card">
              <h2>How We Work</h2>
              <ul>
                <li>Results are sourced directly from official Kerala Government publications.</li>
                <li>Every result is labeled with a clear status — <strong>Pending</strong>, <strong>Live</strong>, or <strong>Verified</strong> — so you always know the confidence level.</li>
                <li>We never show template or placeholder numbers as official winning numbers.</li>
                <li>Source links are provided with every draw for independent verification.</li>
              </ul>
            </section>

            <section className="content-card">
              <h2>Our Trust Principles</h2>
              <div className="about-principles">
                <div className="about-principle">
                  <span className="about-principle__icon">✅</span>
                  <div>
                    <strong>Accuracy First</strong>
                    <p>We only publish results confirmed by official sources. Pending results are clearly marked.</p>
                  </div>
                </div>
                <div className="about-principle">
                  <span className="about-principle__icon">🔍</span>
                  <div>
                    <strong>Transparent Sources</strong>
                    <p>Every result includes the source name and a link to the official Kerala Lottery publication.</p>
                  </div>
                </div>
                <div className="about-principle">
                  <span className="about-principle__icon">📱</span>
                  <div>
                    <strong>Mobile Friendly</strong>
                    <p>Designed for mobile users who check results on the go, with fast load times and clean layout.</p>
                  </div>
                </div>
                <div className="about-principle">
                  <span className="about-principle__icon">🚫</span>
                  <div>
                    <strong>No Misleading Content</strong>
                    <p>No fake "guessed" numbers presented as results. No clickbait headlines or false urgency.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="content-card">
              <h2>Legal Disclaimer</h2>
              <p>This website is an independent informational portal and is not affiliated with the Kerala State Lottery Department, the Directorate of Kerala State Lotteries, or the Government of Kerala.</p>
              <p style={{ marginTop: 10 }}>Always verify your winning numbers with the official Kerala Government Gazette before making any prize claims or financial decisions. Prize claims must be made through official lottery offices.</p>
            </section>
          </div>

          {/* Sidebar stats */}
          <div className="about-sidebar">
            <div className="about-stat-card">
              <span className="about-stat-card__number">7</span>
              <span className="about-stat-card__label">Lotteries Covered</span>
            </div>
            <div className="about-stat-card">
              <span className="about-stat-card__number">Daily</span>
              <span className="about-stat-card__label">Result Updates</span>
            </div>
            <div className="about-stat-card">
              <span className="about-stat-card__number">3 PM</span>
              <span className="about-stat-card__label">Draw Time IST</span>
            </div>
            <div className="about-stat-card">
              <span className="about-stat-card__number">4:30 PM</span>
              <span className="about-stat-card__label">Results Published</span>
            </div>
            <div className="content-card" style={{ marginTop: 0 }}>
              <h3 style={{ marginBottom: 10 }}>Lotteries We Cover</h3>
              {[
                { name: 'Bhagyathara', day: 'Monday', code: 'BT' },
                { name: 'Sthree Sakthi', day: 'Tuesday', code: 'SS' },
                { name: 'Dhanalekshmi', day: 'Wednesday', code: 'DL' },
                { name: 'Karunya Plus', day: 'Thursday', code: 'KN' },
                { name: 'Suvarna Keralam', day: 'Friday', code: 'SK' },
                { name: 'Karunya', day: 'Saturday', code: 'KR' },
                { name: 'Samrudhi', day: 'Sunday', code: 'SM' },
              ].map(l => (
                <div key={l.code} className="about-lottery-row">
                  <span className="schedule-card__code">{l.code}</span>
                  <span><strong>{l.name}</strong> — {l.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
