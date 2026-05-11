# Kerala Ticket Results

A data-driven Kerala Lottery result website rebuilt from fragile hand-edited HTML into a Next.js static-export application.

## What changed

- **Framework:** Next.js App Router with TypeScript.
- **Data layer:** Lottery schedules and results live in `data/*.json` instead of being pasted into every HTML file.
- **Shared components:** Header, footer, result card, result table, schedule grid, badges, and JSON-LD are reusable React components.
- **Safer updates:** `update_results.py` now updates `data/results.json`; it no longer edits HTML with broad regex replacements.
- **Static deployment:** GitHub Pages builds the Next.js app and deploys the generated `out/` folder.

## Key files

- `app/` — Next.js routes and pages.
- `components/` — Shared UI components.
- `data/lotteries.json` — Lottery schedule and metadata.
- `data/results.json` — Published result records.
- `data/guessing-numbers.json` — Guessing-number content.
- `update_results.py` — Structured data updater.
- `.github/workflows/static.yml` — Static export deployment to GitHub Pages.
- `.github/workflows/manual_updater.yml` — Manual/scheduled result-data update workflow.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The generated static site is written to `out/`.

## Manual result update

```bash
python update_results.py karunya KR-753 "KN 844574"
```

This updates `data/results.json`. The website pages are regenerated from that data during the Next.js build.

## Next development priorities

1. Move `data/*.json` to PostgreSQL/Supabase.
2. Add an authenticated admin dashboard.
3. Store full prize tables, source PDFs, and verification status per draw.
4. Add archive pages by date and draw code.
5. Add automated Playwright tests for result pages and ticket checking.
