import type { MetadataRoute } from 'next';
import { drawPath, lotteries, results, site } from './data';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    '',
    '/check-ticket/',
    '/claim-guide/',
    '/guessing-numbers/',
    '/about/',
    '/privacy-policy/',
    '/contact/',
    '/terms/',
    '/disclaimer/',
    '/faq/',
    '/download-forms/',
    '/lottery-offices/',
    ...lotteries.map((lottery) => `/results/${lottery.slug}/`),
    ...results.map((result) => `${drawPath(result)}/`)
  ].map((path) => ({ url: `${site.url}${path}`, lastModified: now, changeFrequency: 'daily' as const, priority: path === '' ? 1 : 0.8 }));
}
