#!/usr/bin/env python3
"""
et_scraper.py
=============
Automatically fetches Kerala Lottery results from Economic Times at ~3:40 PM IST.
Runs as a GitHub Actions step. Finds today's ET article, extracts all prize numbers,
formats them into the FIELD 4 format, then calls update_results.py.

ET URL pattern:
  https://economictimes.indiatimes.com/news/new-updates/kerala-lottery-[name]-[code]-result-out-today-[DD-MM-YYYY]-...

Run from repo ROOT:
  python et_scraper.py
"""

import re
import os
import sys
import json
import datetime
import urllib.request
import urllib.parse

# ── Config ────────────────────────────────────────────────
ET_SEARCH_URL = "https://economictimes.indiatimes.com/searchresult.cms?query=kerala+lottery+result+today"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

# Lottery slug → keywords that appear in ET article URL/title
LOTTERY_KEYWORDS = {
    'bhagyathara':     ['bhagyathara', 'bt-'],
    'sthree-sakthi':   ['sthree-sakthi', 'sthree sakthi', 'ss-'],
    'dhanalekshmi':    ['dhanalekshmi', 'dl-'],
    'karunya-plus':    ['karunya-plus', 'karunya plus', 'kn-'],
    'suvarna-keralam': ['suvarna-keralam', 'suvarna keralam', 'sk-'],
    'karunya':         ['karunya-kr', 'karunya kr', 'kr-'],
    'samrudhi':        ['samrudhi', 'sm-'],
}

def fetch_url(url, timeout=15):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Fetch error {url}: {e}")
        return ""

def get_today_lottery():
    """Get today's lottery slug based on day of week."""
    DATA = 'artifacts/kerala-lottery/src/data'
    with open(f'{DATA}/lotteries.json') as f:
        lotteries = json.load(f)
    with open(f'{DATA}/results.json') as f:
        results = json.load(f)

    ist = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    now = datetime.datetime.now(ist)
    today_js = (now.weekday() + 1) % 7  # Python Mon=0 → JS Sun=0

    lottery = next(
        (l for l in lotteries if l['drawDayIndex'] == today_js and not l.get('isBumper')),
        None
    )
    if not lottery:
        print("❌ No lottery found for today")
        sys.exit(1)

    # Get next draw number
    draws = [r for r in results if r['lotterySlug'] == lottery['slug'] and '-' in r['drawCode']]
    nums = []
    for d in draws:
        try: nums.append(int(d['drawCode'].split('-')[1]))
        except: pass
    next_num = max(nums) + 1 if nums else 1
    draw_code = f"{lottery['code']}-{next_num}"

    return lottery, draw_code, now

def find_et_article_url(lottery, draw_code, date):
    """Search ET for today's lottery result article URL."""
    slug = lottery['slug']
    name_variants = LOTTERY_KEYWORDS.get(slug, [slug])

    # Try direct URL construction first (ET uses a predictable pattern)
    date_str = date.strftime('%d-%m-%Y')
    code_lower = draw_code.lower().replace('-', '-')

    # ET URL pattern: /kerala-lottery-[name]-[code]-result-out-today-[date]-...
    name_for_url = slug.replace('-', '-')
    candidate_patterns = [
        f"kerala-lottery-{name_for_url}-{code_lower}-result",
        f"kerala-lottery-{name_for_url}-{code_lower.replace('-','-')}-result-out-today",
    ]

    # Search ET
    search_query = f"kerala lottery {lottery['name']} {draw_code} result today"
    search_url = f"https://economictimes.indiatimes.com/searchresult.cms?query={urllib.parse.quote(search_query)}"
    print(f"  Searching ET: {search_query}")

    html = fetch_url(search_url)
    if not html:
        return None

    # Find article links matching today's lottery
    links = re.findall(r'href="(https://economictimes\.indiatimes\.com/[^"]+articleshow[^"]+)"', html)
    links += re.findall(r'href="(/news/new-updates/[^"]+)"', html)

    for link in links:
        if not link.startswith('http'):
            link = 'https://economictimes.indiatimes.com' + link
        link_lower = link.lower()
        # Must contain lottery name and draw code
        if any(kw in link_lower for kw in name_variants) and code_lower in link_lower:
            print(f"  Found ET article: {link}")
            return link

    # Try Google search as fallback
    print("  ET search didn't find it — trying direct pattern")
    return None

def parse_prizes_from_html(html, lottery_slug):
    """
    Extract prize data from ET article HTML.
    ET articles follow the Kerala official PDF structure.
    """
    # Remove HTML tags to get plain text
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'&nbsp;', ' ', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'\s+', ' ', text).strip()

    prizes = {}

    # Extract 1st prize: "1st Prize Rs :10000000/- 1) KU 144057 (THIRUVALLA)"
    m = re.search(r'1st Prize[^)]*?\)\s*([A-Z]{2})\s*(\d{6})\s*\(([^)]+)\)', text, re.IGNORECASE)
    if m:
        prizes['1st'] = [json.dumps({'ticket': f'{m.group(1)} {m.group(2)}', 'district': m.group(3).strip().title()})]
        print(f"  1st Prize: {m.group(1)} {m.group(2)} ({m.group(3)})")

    # Extract consolation: same last 6 digits, multiple series
    cons_m = re.search(r'Cons[^\d]*(\d{6})((?:\s+[A-Z]{2}\s+\d{6})+)', text, re.IGNORECASE)
    if cons_m:
        all_cons = re.findall(r'([A-Z]{2})\s+(\d{6})', cons_m.group(0))
        prizes['consolation'] = [f'{s} {n}' for s, n in all_cons]

    # Extract 2nd prize
    m2 = re.search(r'2nd Prize[^)]*?\)\s*([A-Z]{2})\s*(\d{6})\s*\(([^)]+)\)', text, re.IGNORECASE)
    if m2:
        prizes['2nd'] = [json.dumps({'ticket': f'{m2.group(1)} {m2.group(2)}', 'district': m2.group(3).strip().title()})]
        print(f"  2nd Prize: {m2.group(1)} {m2.group(2)} ({m2.group(3)})")

    # Extract 3rd prize
    m3 = re.search(r'3rd Prize[^)]*?\)\s*([A-Z]{2})\s*(\d{6})\s*\(([^)]+)\)', text, re.IGNORECASE)
    if m3:
        prizes['3rd'] = [json.dumps({'ticket': f'{m3.group(1)} {m3.group(2)}', 'district': m3.group(3).strip().title()})]
        print(f"  3rd Prize: {m3.group(1)} {m3.group(2)} ({m3.group(3)})")

    # Extract 4th-9th prizes (4-digit numbers)
    tier_patterns = [
        ('4th', r'4th Prize[^0-9]*?((?:\d{4}[\s,]+){3,})'),
        ('5th', r'5th Prize[^0-9]*?((?:\d{4}[\s,]+){1,})'),
        ('6th', r'6th Prize[^0-9]*?((?:\d{4}[\s,]+){3,})'),
        ('7th', r'7th Prize[^0-9]*?((?:\d{4}[\s,]+){5,})'),
        ('8th', r'8th Prize[^0-9]*?((?:\d{4}[\s,]+){10,})'),
        ('9th', r'9th Prize[^0-9]*?((?:\d{4}[\s,]+){10,})'),
    ]

    for tier, pattern in tier_patterns:
        # Find the section after this tier heading
        tier_match = re.search(
            rf'{tier}.*?Prize[^0-9]*?((?:\b\d{{4}}\b[\s,]*)+)',
            text, re.IGNORECASE
        )
        if tier_match:
            nums = re.findall(r'\b(\d{4})\b', tier_match.group(1))
            # Filter out years/noise
            nums = [n for n in nums if n not in ('2026','2025','2024','3000','4000','5000','1000','2000')]
            if len(nums) >= 2:
                prizes[tier] = nums
                print(f"  {tier} Prize: {len(nums)} numbers")

    return prizes

def build_full_results_string(prizes):
    """Build the FIELD 4 format string for update_results.py."""
    order = ['1st', 'consolation', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']
    parts = []
    for tier in order:
        if tier in prizes and prizes[tier]:
            vals = ','.join(str(v) for v in prizes[tier])
            parts.append(f'{tier}:{vals}')
    return ' / '.join(parts)

def main():
    ist = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    now = datetime.datetime.now(ist)
    print(f"ET Scraper running at {now.strftime('%Y-%m-%d %H:%M IST')}")

    lottery, draw_code, date = get_today_lottery()
    print(f"Today's lottery: {lottery['name']} | Draw code: {draw_code}")

    # Find ET article
    article_url = find_et_article_url(lottery, draw_code, date)

    if not article_url:
        print("⚠️  Could not find ET article. Exiting without update.")
        # Write empty output so workflow knows scraper found nothing
        with open('/tmp/et_result.txt', 'w') as f:
            f.write('')
        sys.exit(0)

    # Fetch and parse article
    print(f"Fetching article: {article_url}")
    html = fetch_url(article_url)
    if not html:
        print("⚠️  Could not fetch article content.")
        sys.exit(0)

    prizes = parse_prizes_from_html(html, lottery['slug'])

    if '1st' not in prizes:
        print("⚠️  Could not extract 1st prize from article.")
        sys.exit(0)

    # Get just the ticket string for FIELD 3
    first_prize_obj = prizes['1st'][0]
    try:
        first_prize = json.loads(first_prize_obj)['ticket']
    except:
        first_prize = first_prize_obj

    full_results = build_full_results_string(prizes)

    print(f"\n✅ Extracted result:")
    print(f"   Lottery:     {lottery['name']}")
    print(f"   Draw code:   {draw_code}")
    print(f"   1st Prize:   {first_prize}")
    print(f"   Tiers found: {len(prizes)}/9")

    # Write to temp files for workflow to read
    with open('/tmp/et_first_prize.txt', 'w') as f:
        f.write(first_prize)
    with open('/tmp/et_full_results.txt', 'w') as f:
        f.write(full_results)
    with open('/tmp/et_slug.txt', 'w') as f:
        f.write(lottery['slug'])
    with open('/tmp/et_draw_code.txt', 'w') as f:
        f.write(draw_code)

    print("\n✅ Output files written. Workflow will proceed with update.")

if __name__ == '__main__':
    main()
