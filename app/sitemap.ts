import type { MetadataRoute } from 'next';
import { lotteries, site } from './data';

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
    ...lotteries.map((lottery) => `/results/${lottery.slug}/`)
  ].map((path) => ({ url: `${site.url}${path}`, lastModified: now, changeFrequency: 'daily' as const, priority: path === '' ? 1 : 0.8 }));
}
