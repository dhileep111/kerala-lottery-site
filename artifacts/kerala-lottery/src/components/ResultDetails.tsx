import type { Result } from '../types';

export function ResultDetails({ result }: { result: Result }) {
  const details = [
    ['Draw Code', result.drawCode],
    ['Draw Date', result.displayDate],
    ['Status', result.status],
    ['First Prize District', result.firstPrizeDistrict],
    ['Total Winners', result.totalWinners?.toLocaleString('en-IN')],
    ['Total Distribution', result.totalPrizeDistribution],
    ['Source', result.sourceName]
  ].filter(([, value]) => value);

  return (
    <section className="content-card">
      <h2>Draw Details</h2>
      <div className="detail-grid">
        {details.map(([label, value]) => (
          <div className="detail-item" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {result.summary && <p className="detail-summary">{result.summary}</p>}
      <div className="source-actions">
        <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer">Official Source</a>
        {result.pdfUrl && <a href={result.pdfUrl} target="_blank" rel="noopener noreferrer">Download PDF</a>}
        {result.imageUrl && <a href={result.imageUrl} target="_blank" rel="noopener noreferrer">View Result Image</a>}
      </div>
    </section>
  );
}
