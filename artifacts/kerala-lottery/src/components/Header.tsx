import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { getResultWithLottery, getFirstPrizeNumber, lotteries } from '../data';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [location] = useLocation();

  const latest = getResultWithLottery();
  const message = latest
    ? `${latest.result.status === 'pending' ? 'Awaiting official result' : 'Result live'} • ${latest.lottery.name} ${latest.result.drawCode} • First prize ${getFirstPrizeNumber(latest.result)} • Updated ${latest.result.displayDate}`
    : 'Kerala Lottery results update daily at 3 PM IST.';

  const mainLotteries = lotteries.filter(l => l.slug !== 'bumper');

  return (
    <>
      {/* Ticker */}
      <div className="ticker" aria-label="Latest lottery update">
        <div className="container ticker__inner">
          <div className="ticker__label">Latest</div>
          <div className="ticker__viewport">
            <div className="ticker__track">
              <span>{message}</span>
              <span aria-hidden="true">{message}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <nav className="container nav" aria-label="Main navigation">
          <Link className="logo" href="/" onClick={() => setMenuOpen(false)}>
            <span className="logo__mark">KT</span>
            <span>Kerala Ticket Results</span>
          </Link>

          {/* Desktop nav */}
          <div className="nav__links nav__links--desktop">
            <Link href="/">Home</Link>

            {/* Results dropdown */}
            <div
              className="nav__dropdown"
              onMouseEnter={() => setResultsOpen(true)}
              onMouseLeave={() => setResultsOpen(false)}
            >
              <button
                className={`nav__dropdown-trigger ${location.startsWith('/results') ? 'nav__dropdown-trigger--active' : ''}`}
                onClick={() => setResultsOpen(!resultsOpen)}
                aria-expanded={resultsOpen}
              >
                Results
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4, transition: 'transform 0.15s', transform: resultsOpen ? 'rotate(180deg)' : 'none' }} aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {resultsOpen && (
                <div className="nav__dropdown-menu">
                  {mainLotteries.map((lottery) => (
                    <Link
                      key={lottery.slug}
                      href={`/results/${lottery.slug}`}
                      className="nav__dropdown-item"
                      onClick={() => setResultsOpen(false)}
                    >
                      <span className="nav__dropdown-code">{lottery.code}</span>
                      {lottery.name}
                      <span className="nav__dropdown-day">{lottery.drawDay}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/chart">Chart</Link>
            <Link href="/bumper">Bumper</Link>
            <Link href="/check-ticket">Check Ticket</Link>
            <Link href="/claim-guide">Claim Guide</Link>
            <Link href="/contact" className="nav__cta">Contact</Link>
          </div>

          {/* Hamburger */}
          <button
            className="nav__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`hamburger__bar ${menuOpen ? 'hamburger__bar--open' : ''}`} />
            <span className={`hamburger__bar ${menuOpen ? 'hamburger__bar--open' : ''}`} />
            <span className={`hamburger__bar ${menuOpen ? 'hamburger__bar--open' : ''}`} />
          </button>
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="mobile-menu" role="dialog" aria-label="Mobile navigation">
            <div className="mobile-menu__section">
              <p className="mobile-menu__label">Results</p>
              {mainLotteries.map((lottery) => (
                <Link key={lottery.slug} href={`/results/${lottery.slug}`} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>
                  <span className="mobile-menu__dot" />
                  {lottery.name}
                  <span className="mobile-menu__day">{lottery.drawDay}</span>
                </Link>
              ))}
            </div>
            <div className="mobile-menu__section">
              <p className="mobile-menu__label">Tools</p>
              <Link href="/check-ticket" className="mobile-menu__item" onClick={() => setMenuOpen(false)}>🎟️ Check Ticket</Link>
              <Link href="/chart" className="mobile-menu__item" onClick={() => setMenuOpen(false)}>📊 Chart</Link>
              <Link href="/bumper" className="mobile-menu__item" onClick={() => setMenuOpen(false)}>🎉 Bumper</Link>
              <Link href="/claim-guide" className="mobile-menu__item" onClick={() => setMenuOpen(false)}>📋 Claim Guide</Link>
              <Link href="/guessing-numbers" className="mobile-menu__item" onClick={() => setMenuOpen(false)}>🔢 Guessing Numbers</Link>
              <Link href="/download-forms" className="mobile-menu__item" onClick={() => setMenuOpen(false)}>📄 Download Forms</Link>
            </div>
            <div className="mobile-menu__section">
              <p className="mobile-menu__label">Info</p>
              <Link href="/faq" className="mobile-menu__item" onClick={() => setMenuOpen(false)}>❓ FAQ</Link>
              <Link href="/about" className="mobile-menu__item" onClick={() => setMenuOpen(false)}>ℹ️ About</Link>
              <Link href="/contact" className="mobile-menu__item" onClick={() => setMenuOpen(false)}>✉️ Contact</Link>
              <Link href="/lottery-offices" className="mobile-menu__item" onClick={() => setMenuOpen(false)}>🏢 Lottery Offices</Link>
            </div>
          </div>
        )}
        {menuOpen && <div className="mobile-menu__overlay" onClick={() => setMenuOpen(false)} />}
      </header>

      {/* Mobile bottom quickbar */}
      <nav className="mobile-quickbar" aria-label="Mobile quick navigation">
        <Link href="/" className={location === '/' || location.startsWith('/results') ? 'active' : ''}>
          <span>🏠</span> Home
        </Link>
        <Link href="/" className={location === '/' || location.startsWith('/results') ? 'active' : ''}>
          <span>🎯</span> Results
        </Link>
        <Link href="/check-ticket" className={location === '/check-ticket' ? 'active' : ''}>
          <span>🎟️</span> Check
        </Link>
        <Link href="/contact" className={location === '/contact' ? 'active' : ''}>
          <span>✉️</span> Contact
        </Link>
      </nav>
    </>
  );
}
