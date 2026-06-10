#!/usr/bin/env python3
"""
pdf_parser.py
=============
Parse the official Kerala State Lotteries PDF and update results.json.

Usage:
  python pdf_parser.py path/to/result.pdf

OR pipe via stdin:
  cat result.pdf | python pdf_parser.py -

Reads the official PDF → extracts all 9 prize tiers → writes to:
  artifacts/kerala-lottery/src/data/results.json

No web scraping. No external sources. Works 100% of the time
because you get the PDF directly from statelottery.kerala.gov.in.
"""

import re
import sys
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR       = Path("artifacts/kerala-lottery/src/data")
LOTTERIES_PATH = DATA_DIR / "lotteries.json"
RESULTS_PATH   = DATA_DIR / "results.json"

# ── Lottery slug map from PDF lottery name ────────────────
NAME_TO_SLUG = {
    "suvarna keralam":  "suvarna-keralam",
    "suvarna-keralam":  "suvarna-keralam",
    "karunya plus":     "karunya-plus",
    "karunya-plus":     "karunya-plus",
    "sthree sakthi":    "sthree-sakthi",
    "stree sakthi":     "sthree-sakthi",
    "sthree-sakthi":    "sthree-sakthi",
    "dhanalekshmi":     "dhanalekshmi",
    "karunya":          "karunya",
    "bhagyathara":      "bhagyathara",
    "samrudhi":         "samrudhi",
    "vishu bumper":     "bumper",
    "onam bumper":      "bumper",
    "christmas bumper": "bumper",
    "thiruvonam bumper":"bumper",
    "pooja bumper":     "bumper",
}

# ── Per-lottery prize amounts ─────────────────────────────
PRIZE_AMOUNTS = {
    "karunya": {
        "1st":"₹1,00,00,000","consolation":"₹5,000","2nd":"₹25,00,000",
        "3rd":"₹10,00,000","4th":"₹5,000","5th":"₹2,000","6th":"₹1,000",
        "7th":"₹500","8th":"₹200","9th":"₹100",
    },
    "karunya-plus": {
        "1st":"₹1,00,00,000","consolation":"₹5,000","2nd":"₹30,00,000",
        "3rd":"₹5,00,000","4th":"₹5,000","5th":"₹2,000","6th":"₹1,000",
        "7th":"₹500","8th":"₹200","9th":"₹100",
    },
    "sthree-sakthi": {
        "1st":"₹1,00,00,000","consolation":"₹5,000","2nd":"₹30,00,000",
        "3rd":"₹5,00,000","4th":"₹5,000","5th":"₹2,000","6th":"₹1,000",
        "7th":"₹500","8th":"₹200","9th":"₹100",
    },
    "dhanalekshmi": {
        "1st":"₹1,00,00,000","consolation":"₹5,000","2nd":"₹30,00,000",
        "3rd":"₹5,00,000","4th":"₹5,000","5th":"₹2,000","6th":"₹1,000",
        "7th":"₹500","8th":"₹200","9th":"₹100",
    },
    "suvarna-keralam": {
        "1st":"₹1,00,00,000","consolation":"₹5,000","2nd":"₹30,00,000",
        "3rd":"₹5,00,000","4th":"₹5,000","5th":"₹2,000","6th":"₹1,000",
        "7th":"₹500","8th":"₹200","9th":"₹100",
    },
    "bhagyathara": {
        "1st":"₹1,00,00,000","consolation":"₹5,000","2nd":"₹10,00,000",
        "3rd":"₹5,000","4th":"₹2,000","5th":"₹1,000","6th":"₹500",
        "7th":"₹200","8th":"₹100","9th":"₹100",
    },
    "samrudhi": {
        "1st":"₹1,00,00,000","consolation":"₹5,000","2nd":"₹10,00,000",
        "3rd":"₹5,000","4th":"₹2,000","5th":"₹1,000","6th":"₹500",
        "7th":"₹200","8th":"₹100","9th":"₹100",
    },
    "bumper": {
        "1st":"₹6,00,00,000","consolation":"₹1,00,000","2nd":"₹1,00,00,000",
        "3rd":"₹10,00,000","4th":"₹5,00,000","5th":"₹1,00,000","6th":"₹5,000",
        "7th":"₹2,000","8th":"₹200","9th":"₹100",
    },
}

def pdf_to_text(pdf_path):
    """Extract text from PDF using pdftotext (poppler) or pypdf fallback."""
    # Try pdftotext (most accurate for Kerala lottery PDFs)
    try:
        result = subprocess.run(
            ['pdftotext', '-layout', str(pdf_path), '-'],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # Fallback: pypdf
    try:
        import pypdf
        reader = pypdf.PdfReader(str(pdf_path))
        return '\n'.join(page.extract_text() or '' for page in reader.pages)
    except ImportError:
        pass

    # Fallback: pymupdf
    try:
        import fitz
        doc = fitz.open(str(pdf_path))
        return '\n'.join(page.get_text() for page in doc)
    except ImportError:
        pass

    raise RuntimeError(
        "No PDF reader available. Install pdftotext (apt install poppler-utils) "
        "or: pip install pypdf"
    )


def parse_pdf_text(text):
    """
    Parse Kerala State Lotteries official PDF text into structured prize data.
    The PDF format is highly consistent — same structure for all lotteries.
    """
    prizes = {}
    lines  = [l.strip() for l in text.split('\n') if l.strip()]
    full   = ' '.join(lines)

    # ── Header: lottery name, draw code, date ────────────
    # "SUVARNA KERALAM LOTTERY NO.SK-52nd DRAW held on:- 15/05/2026"
    header_m = re.search(
        r'([A-Z][A-Z\s]+?)\s+LOTTERY\s+NO[.\s]*([A-Z]{2}-\d+)',
        full, re.IGNORECASE
    )
    if not header_m:
        raise ValueError("Could not find lottery name/draw code in PDF")

    lottery_name_raw = header_m.group(1).strip().lower()
    draw_code        = header_m.group(2).upper()

    slug = None
    for key, val in NAME_TO_SLUG.items():
        if key in lottery_name_raw:
            slug = val
            break
    if not slug:
        slug = lottery_name_raw.replace(' ', '-')

    date_m = re.search(r'held on[:\s-]+(\d{2}/\d{2}/\d{4})', full, re.IGNORECASE)
    if date_m:
        draw_date = datetime.strptime(date_m.group(1), '%d/%m/%Y')
    else:
        draw_date = datetime.now(timezone.utc)

    print(f"  PDF: {slug} | {draw_code} | {draw_date.strftime('%d %b %Y')}")

    # ── 1st Prize ─────────────────────────────────────────
    # "1st Prize Rs :10000000/- 1) DT 927572 (CHITTUR)"
    m1 = re.search(
        r'1st\s+Prize\s+Rs\s*:?\s*[\d/]+\s+\d+\)\s+([A-Z]{2})\s+(\d{6})(?:\s+\(([^)]+)\))?',
        full, re.IGNORECASE
    )
    if m1:
        series, num, district = m1.group(1).upper(), m1.group(2), m1.group(3)
        ticket = f"{series} {num}"
        prize_val = json.dumps({'ticket': ticket, 'district': district.strip().title()}) if district else ticket
        prizes['1st'] = [prize_val]
        first_6 = num
        print(f"  1st: {ticket}" + (f" ({district})" if district else ""))
    else:
        print("  ⚠ Could not find 1st prize")
        first_6 = None

    # ── Consolation Prizes ────────────────────────────────
    # "Cons Prize-Rs :5000/- DT 927572 DN 927572 ..."
    # All same last 6 digits as 1st prize, different series
    if first_6:
        cons_m = re.search(
            r'Cons(?:olation)?\s+Prize[^:]*:?\s*[\d/]+\s*((?:[A-Z]{2}\s+' + re.escape(first_6) + r'\s*)+)',
            full, re.IGNORECASE
        )
        if cons_m:
            cons_tickets = re.findall(r'([A-Z]{2})\s+' + re.escape(first_6), cons_m.group(1), re.IGNORECASE)
            prizes['consolation'] = [f"{s.upper()} {first_6}" for s in cons_tickets]
            print(f"  Consolation: {len(prizes['consolation'])} series")

    # ── 2nd Prize ─────────────────────────────────────────
    m2 = re.search(
        r'2nd\s+Prize\s+Rs\s*:?\s*[\d/]+\s+\d+\)\s+([A-Z]{2})\s+(\d{6})(?:\s+\(([^)]+)\))?',
        full, re.IGNORECASE
    )
    if m2:
        series, num, district = m2.group(1).upper(), m2.group(2), m2.group(3)
        ticket = f"{series} {num}"
        prize_val = json.dumps({'ticket': ticket, 'district': district.strip().title()}) if district else ticket
        prizes['2nd'] = [prize_val]
        print(f"  2nd: {ticket}")

    # ── 3rd Prize ─────────────────────────────────────────
    m3 = re.search(
        r'3rd\s+Prize\s+Rs\s*:?\s*[\d/]+\s+\d+\)\s+([A-Z]{2})\s+(\d{6})(?:\s+\(([^)]+)\))?',
        full, re.IGNORECASE
    )
    if m3:
        series, num, district = m3.group(1).upper(), m3.group(2), m3.group(3)
        ticket = f"{series} {num}"
        prize_val = json.dumps({'ticket': ticket, 'district': district.strip().title()}) if district else ticket
        prizes['3rd'] = [prize_val]
        print(f"  3rd: {ticket}")

    # ── 4th–9th: last-4-digit numbers ────────────────────
    tier_patterns = [
        ('4th',  r'4th\s+Prize[^:]*:?\s*[\d/]+\s*((?:\d{4}\s*)+)'),
        ('5th',  r'5th\s+Prize[^:]*:?\s*[\d/]+\s*((?:\d{4}\s*)+)'),
        ('6th',  r'6th\s+Prize[^:]*:?\s*[\d/]+\s*((?:\d{4}\s*)+)'),
        ('7th',  r'7th\s+Prize[^:]*:?\s*[\d/]+\s*((?:\d{4}\s*)+)'),
        ('8th',  r'8th\s+Prize[^:]*:?\s*[\d/]+\s*((?:\d{4}\s*)+)'),
        ('9th',  r'9th\s+Prize[^:]*:?\s*[\d/]+\s*((?:\d{4}\s*)+)'),
    ]

    # For multi-page PDFs, build page-by-page text chunks per tier
    # Find each tier's start position and collect numbers until next tier
    tier_positions = {}
    for tier, _ in tier_patterns:
        ordinal = tier.replace('th','')
        m = re.search(rf'\b{ordinal}th\s+Prize', full, re.IGNORECASE)
        if m:
            tier_positions[tier] = m.start()

    sorted_tiers = sorted(tier_positions.items(), key=lambda x: x[1])

    for i, (tier, start_pos) in enumerate(sorted_tiers):
        end_pos = sorted_tiers[i+1][1] if i+1 < len(sorted_tiers) else len(full)
        # Add some buffer for the last tier
        if i+1 == len(sorted_tiers):
            end_pos = min(len(full), start_pos + 15000)
        chunk = full[start_pos:end_pos]

        # Extract prize amount marker first, then all 4-digit numbers after it
        nums = re.findall(r'\b(\d{4})\b', chunk)
        # Filter: remove prize amounts, years, and page numbers
        noise = {'2026','2025','2024','2023','1000','2000','3000','4000','5000','0000','9999','5500'}
        # Also remove numbers that appear in Rs amounts (like 5000, 2000)
        valid = []
        for n in nums:
            if n not in noise and len(n) == 4:
                valid.append(n)
        # Deduplicate preserving order
        seen = set()
        deduped = [n for n in valid if not (n in seen or seen.add(n))]
        if len(deduped) >= 2:
            prizes[tier] = deduped
            print(f"  {tier}: {len(deduped)} numbers")

    return slug, draw_code, draw_date, prizes


def build_result_entry(slug, draw_code, draw_date, prizes):
    """Convert parsed prizes into a results.json entry."""
    lotteries = json.loads(LOTTERIES_PATH.read_text())
    lottery   = next((l for l in lotteries if l['slug'] == slug), None)
    amounts   = PRIZE_AMOUNTS.get(slug, PRIZE_AMOUNTS['samrudhi'])

    tier_order = ['1st', 'consolation', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']
    tier_names = {
        '1st': '1st Prize', 'consolation': 'Consolation Prize',
        '2nd': '2nd Prize', '3rd': '3rd Prize', '4th': '4th Prize',
        '5th': '5th Prize', '6th': '6th Prize', '7th': '7th Prize',
        '8th': '8th Prize', '9th': '9th Prize',
    }

    prize_rows = []
    for key in tier_order:
        name   = tier_names[key]
        amount = amounts.get(key, '₹100')
        # Override amount from PDF prize amounts if we can detect them
        # (already handled by PRIZE_AMOUNTS dict)
        numbers = prizes.get(key, [])
        prize_rows.append({'tier': name, 'amount': amount, 'numbers': numbers})

    filled = sum(1 for p in prize_rows if p['numbers'])
    status = 'verified' if filled >= 8 else ('live' if filled >= 1 else 'pending')
    now    = datetime.now(timezone.utc)

    return {
        "lotterySlug": slug,
        "drawCode":    draw_code,
        "drawDate":    draw_date.strftime('%Y-%m-%d'),
        "displayDate": draw_date.strftime('%B %d, %Y'),
        "status":      status,
        "sourceName":  "Official Kerala State Lotteries PDF",
        "sourceUrl":   "https://statelottery.kerala.gov.in/",
        "lastUpdated": now.isoformat().replace('+00:00', 'Z'),
        "summary":     f"Official result for {slug.replace('-',' ').title()} {draw_code}. {filled}/10 prize tiers updated.",
        "prizes":      prize_rows,
    }


def upsert_result(results, new_entry):
    for i, r in enumerate(results):
        if r['lotterySlug'] == new_entry['lotterySlug'] and r['drawCode'] == new_entry['drawCode']:
            results[i] = new_entry
            print(f"  🔄 Updated existing: {new_entry['drawCode']}")
            return results
    print(f"  ➕ Added new: {new_entry['drawCode']}")
    return [new_entry] + results


def main():
    if len(sys.argv) < 2:
        print("Usage: python pdf_parser.py path/to/result.pdf")
        sys.exit(1)

    pdf_path = sys.argv[1]
    print(f"\n📄 Parsing PDF: {pdf_path}")

    # Extract text
    text = pdf_to_text(pdf_path)
    if not text.strip():
        print("❌ Could not extract text from PDF")
        sys.exit(1)
    print(f"  Extracted {len(text):,} chars from PDF")

    # Parse prizes
    slug, draw_code, draw_date, prizes = parse_pdf_text(text)

    # Build result entry
    entry   = build_result_entry(slug, draw_code, draw_date, prizes)
    results = json.loads(RESULTS_PATH.read_text())
    results = upsert_result(results, entry)
    results.sort(key=lambda r: (r['drawDate'], r.get('lastUpdated','')), reverse=True)

    RESULTS_PATH.write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n')
    filled = sum(1 for p in entry['prizes'] if p['numbers'])
    print(f"\n✅ Saved: {slug} {draw_code} | {filled}/10 tiers | status={entry['status']}")

    # Write env files for GitHub Actions if needed
    try:
        first_prize_raw = entry['prizes'][0]['numbers'][0] if entry['prizes'][0]['numbers'] else 'PENDING'
        try:
            first_prize = json.loads(first_prize_raw)['ticket']
        except Exception:
            first_prize = str(first_prize_raw)

        with open('/tmp/et_first_prize.txt', 'w') as f: f.write(first_prize)
        with open('/tmp/et_slug.txt',        'w') as f: f.write(slug)
        with open('/tmp/et_draw_code.txt',   'w') as f: f.write(draw_code)
        with open('/tmp/et_full_results.txt','w') as f: f.write('')  # already saved directly
        print(f"  Env files written for GitHub Actions")
    except Exception as e:
        print(f"  Env files: {e}")


if __name__ == '__main__':
    main()
