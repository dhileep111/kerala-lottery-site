# Project: keralaticketresults.in

## Stack
React/Vite/TypeScript — deployed GitHub Pages via GitHub Actions.
Routing: Wouter. No new npm packages ever.

## Key paths
- Prerender SEO: prerender.mjs (repo root)
- React pages: artifacts/kerala-lottery/src/pages/
- Components: artifacts/kerala-lottery/src/components/
- Data: artifacts/kerala-lottery/src/data/ (results.json, lotteries.json, bumpers.json)
- Data helpers: artifacts/kerala-lottery/src/data.ts
- Routes: artifacts/kerala-lottery/src/App.tsx
- Nav: artifacts/kerala-lottery/src/components/Header.tsx
- Scraper: et_scraper.py (repo root)

## CSS
Existing classes only: .container .hero .content-card .table .badge .notice
Inline styles via React.CSSProperties.

## Audience
95% mobile, Tamil Nadu border, Tamil + English queries.
Always include Tamil script + time signals in titles: "இன்று", "3:00 மணி", "முடிவு".

## After every change
Run: node --check prerender.mjs