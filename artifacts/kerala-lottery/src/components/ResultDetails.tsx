import type { Result } from '../types';
import { useLang, t } from '../lib/i18n';

export function ResultDetails({ result }: { result: Result }) {
  const lang = useLang();
  const details = [
    [t(lang, 'rdDrawCode'), result.drawCode],
    [t(lang, 'rdDrawDate'), result.displayDate],
    [t(lang, 'rdStatus'), result.status],
    [t(lang, 'rdFirstPrizeDistrict'), result.firstPrizeDistrict],
    [t(lang, 'rdTotalWinners'), result.totalWinners?.toLocaleString('en-IN')],
    [t(lang, 'rdTotalDistribution'), result.totalPrizeDistribution],
    [t(lang, 'rdSource'), result.sourceName]
  ].filter(([, value]) => value);

  return (
    <section className="content-card">
      <h2>{t(lang, 'rdDrawDetails')}</h2>
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
        <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer">{t(lang, 'rdOfficialSource')}</a>
        {result.pdfUrl && <a href={result.pdfUrl} target="_blank" rel="noopener noreferrer">{t(lang, 'rdDownloadPdf')}</a>}
        {result.imageUrl && <a href={result.imageUrl} target="_blank" rel="noopener noreferrer">{t(lang, 'rdViewImage')}</a>}
      </div>
    </section>
  );
}
