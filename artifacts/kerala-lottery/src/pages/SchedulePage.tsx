import { Link } from 'wouter';
import { lotteries, getTodayLottery, getTomorrowLottery } from '../data';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { FaqSchema } from '../components/JsonLd';
import bumpers from '../data/bumpers.json';

const TAMIL_DAYS: Record<string, string> = {
  Monday: 'திங்கள்', Tuesday: 'செவ்வாய்', Wednesday: 'புதன்',
  Thursday: 'வியாழன்', Friday: 'வெள்ளி', Saturday: 'சனி', Sunday: 'ஞாயிறு',
};

// Monday-first display order, matching drawDayIndex (Sun=0 .. Sat=6)
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function SchedulePage() {
  const todayLottery = getTodayLottery();
  const tomorrowLottery = getTomorrowLottery();
  const daily = lotteries.filter((l) => !l.isBumper);
  const ordered = WEEK_ORDER.map((idx) => daily.find((l) => l.drawDayIndex === idx)).filter(
    (l): l is (typeof daily)[number] => Boolean(l),
  );
  const up = (bumpers as { upcoming?: Record<string, string> }).upcoming;

  const faqItems = [
    {
      question: 'Weekly Draw Schedule',
      answer:
        ordered.map((l) => `${l.name} draws every ${l.drawDay} at ${l.drawTime}`).join('; ') +
        '. All draws are held daily at 3:00 PM IST (Gorky Bhavan, Thiruvananthapuram) except bumper special draws.',
    },
    ...(up
      ? [
          {
            question: `${up.name} (${up.code})`,
            answer: `${up.drawDateLabel} at ${up.drawTime}. First prize ${up.firstPrize}.`,
          },
        ]
      : []),
  ];

  return (
    <main className="container">
      <FaqSchema items={faqItems} />
      <section className="hero" style={{ paddingBottom: 8 }}>
        <h1>Kerala Lottery Weekly Schedule</h1>
        <p>
          Every Kerala lottery draw day and time in one table — plan around today&apos;s and tomorrow&apos;s
          draws. கேரளா லாட்டரி வார அட்டவணை — ஒவ்வொரு நாளும் எந்த லாட்டரி, எத்தனை மணிக்கு என்பதைப் பாருங்கள்.
        </p>
      </section>

      <div className="content-card">
        <h2 style={{ marginTop: 0 }}>Weekly Draw Schedule</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Day</th>
                <th>Lottery</th>
                <th>Code</th>
                <th style={{ whiteSpace: 'nowrap' }}>Draw Time</th>
                <th>1st Prize</th>
                <th aria-label="View result" />
              </tr>
            </thead>
            <tbody>
              {ordered.map((lottery) => {
                const isToday = todayLottery.slug === lottery.slug;
                const isTomorrow = tomorrowLottery.slug === lottery.slug;
                return (
                  <tr key={lottery.slug}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {lottery.drawDay}
                      <div style={{ fontSize: 12, opacity: 0.65 }}>{TAMIL_DAYS[lottery.drawDay] ?? ''}</div>
                    </td>
                    <td>
                      {lottery.name}
                      {isToday && <span className="badge" style={{ marginLeft: 8, background: '#16a34a', color: '#fff' }}>Today</span>}
                      {isTomorrow && <span className="badge" style={{ marginLeft: 8, background: '#2563eb', color: '#fff' }}>Tomorrow</span>}
                    </td>
                    <td><span className="badge">{lottery.code}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{lottery.drawTime}</td>
                    <td>{lottery.firstPrizeAmount}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link href={`/results/${lottery.slug}`}>View →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
          All draws are held daily at 3:00 PM IST (Gorky Bhavan, Thiruvananthapuram) except bumper special draws.
        </p>
      </div>

      {up && (
        <div className="content-card" style={{ borderLeft: '4px solid #0c7a43' }}>
          <span className="badge" style={{ background: '#0c7a43', color: '#fff' }}>Special Draw</span>
          <h2 style={{ margin: '10px 0 4px' }}>{up.name} ({up.code})</h2>
          <p style={{ margin: '0 0 10px' }}>
            <strong>{up.drawDateLabel}</strong> · {up.drawTime} · First prize <strong>{up.firstPrize}</strong>
          </p>
          <Link href="/bumper">View bumper countdown &amp; details →</Link>
        </div>
      )}

      <div className="content-card">
        <h2 style={{ marginTop: 0 }}>Quick Links</h2>
        <ScheduleGrid />
      </div>

      <section className="content-card tamil-section" lang="ta">
        <h2>🇮🇳 கேரளா லாட்டரி வார அட்டவணை</h2>
        <p>
          ஒவ்வொரு நாளும் மதியம் 3:00 மணிக்கு கேரளா லாட்டரி நடத்தப்படுகிறது. இன்று:{' '}
          <strong>{todayLottery.name}</strong>, நாளை: <strong>{tomorrowLottery.name}</strong>.
        </p>
      </section>
    </main>
  );
}
