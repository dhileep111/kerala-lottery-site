import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { getResultWithLottery, getFirstPrizeNumber, lotteries } from '../data';
import { useLang, t, withLang } from '../lib/i18n';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [location] = useLocation();
  const lang = useLang();
  const L = (path: string) => withLang(path, lang);

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
          <Link className="logo" href={L('/')} onClick={() => setMenuOpen(false)}>
            <span className="logo__mark">KT</span>
            <span>Kerala Ticket Results</span>
          </Link>

          {/* Desktop nav */}
          <div className="nav__links nav__links--desktop">
            <Link href={L('/')}>{t(lang, 'home')}</Link>

            {/* Results dropdown */}
            <div
              className="nav__dropdown"
              onMouseEnter={() => setResultsOpen(true)}
              onMouseLeave={() => setResultsOpen(false)}
            >
              <button
                className={`nav__dropdown-trigger ${location.includes('/results') ? 'nav__dropdown-trigger--active' : ''}`}
                onClick={() => setResultsOpen(!resultsOpen)}
                aria-expanded={resultsOpen}
              >
                {t(lang, 'results')}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4, transition: 'transform 0.15s', transform: resultsOpen ? 'rotate(180deg)' : 'none' }} aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {resultsOpen && (
                <div className="nav__dropdown-menu">
                  {mainLotteries.map((lottery) => (
                    <Link
                      key={lottery.slug}
                      href={L(`/results/${lottery.slug}`)}
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

            <Link href={L('/chart')}>{t(lang, 'chart')}</Link>
            <Link href={L('/bumper')}>{t(lang, 'bumper')}</Link>
            <Link href={L('/jackpot')}>{t(lang, 'jackpot')}</Link>
            <Link href={L('/schedule')}>{t(lang, 'schedule')}</Link>
            <Link href={L('/yesterday-result')}>{t(lang, 'yesterdayResult')}</Link>
            <Link href={L('/check-ticket')}>{t(lang, 'checkTicket')}</Link>
            <Link href={L('/claim-prize')}>{t(lang, 'claimPrize')}</Link>
            <Link href={L('/contact')} className="nav__cta">{t(lang, 'contact')}</Link>
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
              <p className="mobile-menu__label">{t(lang, 'results')}</p>
              {mainLotteries.map((lottery) => (
                <Link key={lottery.slug} href={L(`/results/${lottery.slug}`)} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>
                  <span className="mobile-menu__dot" />
                  {lottery.name}
                  <span className="mobile-menu__day">{lottery.drawDay}</span>
                </Link>
              ))}
            </div>
            <div className="mobile-menu__section">
              <p className="mobile-menu__label">{t(lang, 'tools')}</p>
              <Link href={L('/check-ticket')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>🎟️ {t(lang, 'checkTicket')}</Link>
              <Link href={L('/chart')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>📊 {t(lang, 'chart')}</Link>
              <Link href={L('/bumper')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>🎉 {t(lang, 'bumper')}</Link>
              <Link href={L('/jackpot')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>💰 {t(lang, 'jackpot')}</Link>
              <Link href={L('/schedule')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>📅 {t(lang, 'schedule')}</Link>
              <Link href={L('/yesterday-result')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>🗓️ {t(lang, 'yesterdayResult')}</Link>
              <Link href={L('/claim-prize')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>💵 {t(lang, 'claimPrize')}</Link>
              <Link href={L('/claim-guide')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>📋 {t(lang, 'claimGuide')}</Link>
              <Link href={L('/guessing-numbers')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>🔢 {t(lang, 'guessingNumbers')}</Link>
              <Link href={L('/download-forms')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>📄 {t(lang, 'downloadForms')}</Link>
            </div>
            <div className="mobile-menu__section">
              <p className="mobile-menu__label">{t(lang, 'info')}</p>
              <Link href={L('/faq')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>❓ {t(lang, 'faq')}</Link>
              <Link href={L('/about')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>ℹ️ {t(lang, 'about')}</Link>
              <Link href={L('/contact')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>✉️ {t(lang, 'contact')}</Link>
              <Link href={L('/lottery-offices')} className="mobile-menu__item" onClick={() => setMenuOpen(false)}>🏢 {t(lang, 'lotteryOffices')}</Link>
            </div>
          </div>
        )}
        {menuOpen && <div className="mobile-menu__overlay" onClick={() => setMenuOpen(false)} />}
      </header>

      {/* Mobile bottom quickbar */}
      <nav className="mobile-quickbar" aria-label="Mobile quick navigation">
        <Link href={L('/')} className={location === L('/') || location.includes('/results') ? 'active' : ''}>
          <span>🏠</span> {t(lang, 'home')}
        </Link>
        <Link href={L('/')} className={location === L('/') || location.includes('/results') ? 'active' : ''}>
          <span>🎯</span> {t(lang, 'results')}
        </Link>
        <Link href={L('/check-ticket')} className={location === L('/check-ticket') ? 'active' : ''}>
          <span>🎟️</span> {t(lang, 'checkTicket')}
        </Link>
        <Link href={L('/contact')} className={location === L('/contact') ? 'active' : ''}>
          <span>✉️</span> {t(lang, 'contact')}
        </Link>
      </nav>
    </>
  );
}
