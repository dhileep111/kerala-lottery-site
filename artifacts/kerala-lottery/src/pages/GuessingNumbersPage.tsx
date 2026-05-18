import { guessingNumbers } from '../data';

export default function GuessingNumbersPage() {
  return (
    <main className="page"><div className="container">
      <div className="hero"><h1>Kerala Lottery Guessing Numbers Tamil</h1><p>Popular number ideas for entertainment only. These are not guaranteed winning numbers.</p></div>
      <section className="content-card"><h2>இன்றைய யூக எண்கள்</h2><p style={{ fontFamily: 'Noto Sans Tamil, Inter, sans-serif' }}>கீழே உள்ள எண்கள் பொழுதுபோக்கு நோக்கத்திற்காக மட்டுமே. வெற்றி உறுதி செய்யப்படவில்லை.</p><div className="grid" style={{ marginTop: 16 }}>{guessingNumbers.map((item) => <div className="schedule-card" key={item.number}><div className="guess-number">{item.number}</div><p>{item.label}</p></div>)}</div></section>
      <section className="content-card"><h2>Disclaimer</h2><p>Guessing numbers are provided for entertainment purposes only. Lottery is a game of chance. Please play responsibly.</p></section>
    </div></main>
  );
}
