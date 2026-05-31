import { Link } from 'wouter';
import { lotteries } from '../data';

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.697l-2.95-.924c-.64-.203-.653-.64.136-.953l11.57-4.461c.537-.194 1.006.131.326.889z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <h3>Kerala Ticket Results</h3>
            <p>Daily Kerala Lottery result updates. Fast, verified, and archive-ready. Not an official government website.</p>
            {/* Social links */}
            <div className="footer__social">
              <a href="https://t.me/keralaticketresults" target="_blank" rel="noopener noreferrer" className="footer__social-link footer__social-link--telegram">
                <TelegramIcon />
                <span>Join Telegram</span>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61590479131975" target="_blank" rel="noopener noreferrer" className="footer__social-link footer__social-link--facebook">
                <FacebookIcon />
                <span>Facebook Page</span>
              </a>
              <a href="https://whatsapp.com/channel/keralaticketresults" target="_blank" rel="noopener noreferrer" className="footer__social-link footer__social-link--whatsapp">
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
          <div>
            <h3>Results</h3>
            {lotteries.filter(l => !l.isBumper).slice(0, 4).map((lottery) => (
              <Link key={lottery.slug} href={`/results/${lottery.slug}`}>{lottery.name} Results</Link>
            ))}
          </div>
          <div>
            <h3>More Lotteries</h3>
            {lotteries.filter(l => !l.isBumper).slice(4).map((lottery) => (
              <Link key={lottery.slug} href={`/results/${lottery.slug}`}>{lottery.name} Results</Link>
            ))}
            <Link href="/results/bumper">Bumper Results</Link>
          </div>
          <div>
            <h3>Resources</h3>
            <Link href="/check-ticket">Ticket Checker</Link>
            <Link href="/guessing-numbers">Guessing Numbers</Link>
            <Link href="/claim-guide">How to Claim Prize</Link>
            <Link href="/lottery-offices">Lottery Offices</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/about">About &amp; Disclaimer</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/contact">Contact Us</Link>
          </div>
        </div>
        <div className="footer__bottom">
          © 2026 Kerala Ticket Results. Informational use only. Not affiliated with Kerala Government.
          Verify with official Kerala Lottery publications before claims.
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            <a href="https://t.me/keralaticketresults" target="_blank" rel="noopener noreferrer" style={{ color: '#2aabee', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>📢 t.me/keralaticketresults</a>
            <a href="https://www.facebook.com/profile.php?id=61590479131975" target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>📘 Kerala Ticket Results</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
