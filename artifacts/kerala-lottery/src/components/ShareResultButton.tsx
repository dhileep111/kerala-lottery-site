import { useState } from 'react';
import type { Lottery, Result } from '../types';
import { getFirstPrizeNumber, site } from '../data';

interface Props {
  lottery: Lottery;
  result: Result;
}

export function ShareResultButton({ lottery, result }: Props) {
  const [copied, setCopied] = useState(false);
  const firstPrize = getFirstPrizeNumber(result);
  const isPending  = firstPrize === 'PENDING';
  const resultUrl  = `${site.url}/results/${lottery.slug}`;

  // Single bilingual message — works for all WhatsApp groups
  const message = isPending
    ? [
        `🎰 ${lottery.name} ${result.drawCode} — Result Awaited`,
        `📅 ${result.displayDate} | ${lottery.drawTime}`,
        ``,
        `⏳ முடிவு இன்னும் வெளியிடப்படவில்லை | Result not yet published`,
        `🔔 Check after 3 PM: ${resultUrl}`,
      ].join('\n')
    : [
        `🎰 ${lottery.name} ${result.drawCode} Result — ${result.displayDate}`,
        ``,
        `🥇 1st Prize: ${firstPrize}`,
        `💰 ${lottery.firstPrizeAmount}`,
        `${result.status === 'verified' ? '✅ Verified' : '🔴 Live update'}`,
        ``,
        `முதல் பரிசு: ${firstPrize} | முழு பட்டியல் கீழே 👇`,
        ``,
        `📋 Full result: ${resultUrl}`,
        ``,
        `⚠️ Verify at statelottery.kerala.gov.in before claiming`,
        `பரிசு கோருவதற்கு முன் அதிகாரப்பூர்வமாக சரிபார்க்கவும்`,
      ].join('\n');

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
    } catch {
      const el = document.createElement('input');
      el.value = resultUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-result-block">
      <div className="share-result-block__label">Share this result</div>
      <div className="share-result-block__buttons">
        <button
          className="share-btn share-btn--whatsapp"
          onClick={handleWhatsApp}
          aria-label="Share on WhatsApp"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Share on WhatsApp
        </button>

        <button
          className={`share-btn share-btn--copy ${copied ? 'share-btn--copied' : ''}`}
          onClick={handleCopyLink}
          aria-label="Copy link"
        >
          {copied ? (
            <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
          ) : (
            <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Copy Link</>
          )}
        </button>
      </div>
    </div>
  );
}
