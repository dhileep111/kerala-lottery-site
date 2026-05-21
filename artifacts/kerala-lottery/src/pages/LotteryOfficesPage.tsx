import { useState } from 'react';

const DIRECTORATE = {
  name: 'Directorate of Kerala State Lotteries',
  address: 'Vikas Bhavan P.O., Thiruvananthapuram, Kerala – 695 033',
  phone: ['0471-2305193', '0471-2305230'],
  fax: '0471-2301740',
  email: 'cru.dir.lotteries@kerala.gov.in',
  website: 'https://statelottery.kerala.gov.in',
  hours: 'Mon – Sat: 10:00 AM – 5:00 PM (except public holidays)',
  note: 'Prizes above ₹1,00,000 must be claimed here in person. Bring original ticket, Aadhaar, PAN, and bank details.',
};

const DISTRICTS = [
  {
    name: 'Thiruvananthapuram',
    address: 'District Lottery Office, TC 15/1796, Vanchiyoor, Thiruvananthapuram – 695 035',
    phone: '0471-2473600',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
    note: 'Also handles Directorate-level claims for Thiruvananthapuram district.',
  },
  {
    name: 'Kollam',
    address: 'District Lottery Office, Civil Station, Kollam – 691 013',
    phone: '0474-2742350',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Pathanamthitta',
    address: 'District Lottery Office, Civil Station, Pathanamthitta – 689 645',
    phone: '0468-2222392',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Alappuzha',
    address: 'District Lottery Office, Civil Station, Alappuzha – 688 001',
    phone: '0477-2251145',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Kottayam',
    address: 'District Lottery Office, Civil Station, Kottayam – 686 001',
    phone: '0481-2562273',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Idukki',
    address: 'District Lottery Office, Civil Station, Painavu, Idukki – 685 603',
    phone: '04862-232450',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Ernakulam',
    address: 'District Lottery Office, Civil Station, Kakkanad, Ernakulam – 682 030',
    phone: '0484-2426150',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Thrissur',
    address: 'District Lottery Office, Civil Station, Ayyanthole, Thrissur – 680 003',
    phone: '0487-2361370',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Palakkad',
    address: 'District Lottery Office, Civil Station, Palakkad – 678 001',
    phone: '0491-2505406',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
    note: 'Nearest office for Coimbatore, Tiruppur, and Erode residents from Tamil Nadu.',
  },
  {
    name: 'Malappuram',
    address: 'District Lottery Office, Civil Station, Malappuram – 676 505',
    phone: '0483-2734445',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Kozhikode',
    address: 'District Lottery Office, Civil Station, Kozhikode – 673 020',
    phone: '0495-2371554',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Wayanad',
    address: 'District Lottery Office, Civil Station, Kalpetta, Wayanad – 673 121',
    phone: '04936-202250',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Kannur',
    address: 'District Lottery Office, Civil Station, Kannur – 670 002',
    phone: '0497-2700175',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
  {
    name: 'Kasaragod',
    address: 'District Lottery Office, Civil Station, Kasaragod – 671 121',
    phone: '04994-255385',
    hours: 'Mon – Fri: 10:00 AM – 5:00 PM',
  },
];

function PhoneLink({ number }: { number: string }) {
  const clean = number.replace(/\s/g, '').replace(/-/g, '');
  return (
    <a href={`tel:${clean}`} className="office-phone-link">
      📞 {number}
    </a>
  );
}

function DirectorateCard() {
  return (
    <div className="office-card office-card--directorate">
      <div className="office-card__badge">Headquarters</div>
      <div className="office-card__header">
        <div className="office-card__icon">🏛️</div>
        <div>
          <h2 className="office-card__name">{DIRECTORATE.name}</h2>
          <div className="office-card__hours">{DIRECTORATE.hours}</div>
        </div>
      </div>
      <div className="office-card__body">
        <div className="office-detail">
          <span className="office-detail__icon">📍</span>
          <span>{DIRECTORATE.address}</span>
        </div>
        <div className="office-detail">
          <span className="office-detail__icon">📞</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {DIRECTORATE.phone.map(p => <PhoneLink key={p} number={p} />)}
          </div>
        </div>
        <div className="office-detail">
          <span className="office-detail__icon">📠</span>
          <span>Fax: {DIRECTORATE.fax}</span>
        </div>
        <div className="office-detail">
          <span className="office-detail__icon">✉️</span>
          <a href={`mailto:${DIRECTORATE.email}`} className="office-phone-link">{DIRECTORATE.email}</a>
        </div>
        <div className="office-detail">
          <span className="office-detail__icon">🌐</span>
          <a href={DIRECTORATE.website} target="_blank" rel="noopener noreferrer" className="office-phone-link">
            {DIRECTORATE.website.replace('https://', '')}
          </a>
        </div>
      </div>
      {DIRECTORATE.note && (
        <div className="office-card__note">{DIRECTORATE.note}</div>
      )}
    </div>
  );
}

function DistrictCard({ district, isActive, onClick }: {
  district: typeof DISTRICTS[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className={`office-card office-card--district ${isActive ? 'office-card--open' : ''}`}>
      <button className="office-card__tab" onClick={onClick} aria-expanded={isActive}>
        <div className="office-card__tab-left">
          <span className="office-card__tab-icon">🏢</span>
          <div>
            <div className="office-card__tab-name">{district.name}</div>
            <div className="office-card__tab-phone">{district.phone}</div>
          </div>
        </div>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          style={{ transition: 'transform 0.2s', transform: isActive ? 'rotate(180deg)' : 'none', flexShrink: 0, color: '#64748b' }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isActive && (
        <div className="office-card__details">
          <div className="office-detail">
            <span className="office-detail__icon">📍</span>
            <span>{district.address}</span>
          </div>
          <div className="office-detail">
            <span className="office-detail__icon">📞</span>
            <PhoneLink number={district.phone} />
          </div>
          <div className="office-detail">
            <span className="office-detail__icon">🕐</span>
            <span>{district.hours}</span>
          </div>
          {district.note && (
            <div className="office-card__note">{district.note}</div>
          )}
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(district.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="office-map-link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            View on Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

export default function LotteryOfficesPage() {
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);

  const toggle = (name: string) =>
    setActiveDistrict(prev => prev === name ? null : name);

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="hero">
          <h1>Kerala Lottery Offices</h1>
          <p>Directory of the Directorate of Kerala State Lotteries and all 14 district lottery offices — with contact numbers, addresses, and working hours.</p>
        </div>

        {/* Prize claim guide */}
        <div className="office-claim-guide">
          <div className="office-claim-guide__title">📋 Which office do I visit?</div>
          <div className="office-claim-guide__grid">
            <div className="office-claim-guide__item">
              <div className="office-claim-guide__range">Up to ₹5,000</div>
              <div className="office-claim-guide__where">Any authorised lottery agent</div>
            </div>
            <div className="office-claim-guide__item">
              <div className="office-claim-guide__range">₹5,001 – ₹1,00,000</div>
              <div className="office-claim-guide__where">Your District Lottery Office</div>
            </div>
            <div className="office-claim-guide__item office-claim-guide__item--hq">
              <div className="office-claim-guide__range">Above ₹1,00,000</div>
              <div className="office-claim-guide__where">Directorate, Thiruvananthapuram</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>
            All prizes must be claimed within <strong>30 days</strong> of draw date. Bring original ticket, Aadhaar, PAN, and bank passbook.
          </div>
        </div>

        {/* Directorate */}
        <DirectorateCard />

        {/* District offices */}
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '32px 0 14px' }}>
          District Lottery Offices
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginLeft: 10 }}>Tap to expand</span>
        </h2>

        <div className="office-list">
          {DISTRICTS.map(d => (
            <DistrictCard
              key={d.name}
              district={d}
              isActive={activeDistrict === d.name}
              onClick={() => toggle(d.name)}
            />
          ))}
        </div>

        <section className="content-card" style={{ marginTop: 32, borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
          <h2>⚠️ Before You Visit</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: 14 }}>
            <li>Carry the <strong>original winning ticket</strong> — do not sign it until you reach the office</li>
            <li>Bring <strong>Aadhaar card, PAN card</strong>, two passport-size photos, and bank passbook</li>
            <li>Office hours may vary — call ahead before visiting</li>
            <li>Do <strong>not</strong> hand over your ticket to any unauthorised person or agent</li>
            <li>Prizes above ₹10,000 are subject to <strong>30% TDS</strong> before payment</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
