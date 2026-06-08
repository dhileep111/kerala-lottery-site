#!/usr/bin/env python3
"""
et_scraper.py v7 - Kerala Lottery Auto-Scraper
Runs at 3:50 PM and 4:50 PM IST via GitHub Actions cron.
Sources: ET (via search + Google) → Goodreturns → keralalotteries.net → lotteryresultsnow.com

v7 fix: removed ET direct URL guesses (they always redirect to the generic index page).
        Added Google search to find the real ET articleshow URL.
        Tightened is_fresh_result_page: draw code must be within 5000 chars of a prize mention.
"""
import re, os, sys, json, datetime, urllib.request, urllib.parse

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,*/*',
    'Accept-Language': 'en-IN,en;q=0.9',
    'Referer': 'https://www.google.com/',
}

ET_NAMES = {
    'karunya':'karunya', 'karunya-plus':'karunya-plus',
    'sthree-sakthi':'sthree-sakthi', 'dhanalekshmi':'dhanalekshmi',
    'suvarna-keralam':'suvarna-keralam', 'bhagyathara':'bhagyathara', 'samrudhi':'samrudhi',
}

def fetch(url, timeout=20, extra_headers=None):
    h = {**HEADERS, **(extra_headers or {})}
    req = urllib.request.Request(url, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Fetch failed: {e}")
        return ""

def get_today_lottery():
    DATA = 'artifacts/kerala-lottery/src/data'
    with open(f'{DATA}/lotteries.json') as f:
        lotteries = json.load(f)
    with open(f'{DATA}/results.json') as f:
        results = json.load(f)
    ist = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    now = datetime.datetime.now(ist)
    today_s = now.strftime('%Y-%m-%d')
    today_j = (now.weekday() + 1) % 7
    lottery = next((l for l in lotteries if l['drawDayIndex'] == today_j and not l.get('isBumper')), None)
    if not lottery:
        print("No lottery today"); sys.exit(0)
    today_r = next((r for r in results if r['lotterySlug'] == lottery['slug'] and r.get('drawDate','') == today_s), None)
    if today_r:
        return lottery, today_r['drawCode'], now
    draws = [r for r in results if r['lotterySlug'] == lottery['slug'] and r['status'] in ('verified','live')]
    nums = []
    for d in draws:
        try: nums.append(int(d['drawCode'].split('-')[1]))
        except: pass
    next_n = max(nums) + 1 if nums else 1
    return lottery, f"{lottery['code']}-{next_n}", now

# ── Freshness validator ───────────────────────────────────
def is_fresh_result_page(html, draw_code):
    """
    Validate that the HTML actually contains today's result, not a generic/stale page.
    Key fix: draw code must appear CLOSE to a prize mention (within 5000 chars).
    ET's index page has BT-57 buried in old article snippets far from any prize table.
    """
    if not html or len(html) < 3000:
        return False
    lower = html.lower()
    dc = draw_code.lower()  # e.g. "bt-57"

    if dc not in lower:
        print(f"  ⚠ Draw code {draw_code} not found — stale page, skipping")
        return False

    has_1st  = '1st prize' in lower
    has_frst = 'first prize' in lower
    if not has_1st and not has_frst:
        print(f"  ⚠ No prize text found — skipping")
        return False

    # Draw code must appear within 5000 chars of a prize mention
    idx_dc    = lower.find(dc)
    idx_prize = lower.find('1st prize') if has_1st else lower.find('first prize')
    if abs(idx_dc - idx_prize) > 5000:
        print(f"  ⚠ Draw code and prize are {abs(idx_dc - idx_prize)} chars apart — index page, skipping")
        return False

    return True

# ── Source 1: Economic Times ──────────────────────────────
def google_search_et_url(lottery_name, draw_code, date_str):
    """Use Google to find the real ET articleshow URL for today's result."""
    query = urllib.parse.quote(f'site:economictimes.indiatimes.com {lottery_name} {draw_code} result {date_str}')
    url = f"https://www.google.com/search?q={query}&num=5"
    # Use Googlebot UA to reduce chance of block
    html = fetch(url, extra_headers={
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    })
    if not html:
        return []
    links = re.findall(r'https://economictimes\.indiatimes\.com[^"&\s<>]*articleshow/\d+[^"&\s<>]*', html)
    seen = []
    for l in links:
        if l not in seen:
            seen.append(l)
    return seen

def try_economic_times(lottery, draw_code, date):
    et_name  = ET_NAMES.get(lottery['slug'], lottery['slug'])
    date_str = date.strftime('%d-%m-%Y')

    # 1. ET's own search — only accept articleshow links mentioning this lottery/draw
    query = urllib.parse.quote(f'kerala lottery {lottery["name"]} {draw_code} result today')
    search_html = fetch(f"https://economictimes.indiatimes.com/searchresult.cms?query={query}")
    if search_html:
        links = re.findall(r'"(https://economictimes[^"]+articleshow/\d+[^"]*)"', search_html)
        for link in links:
            ll = link.lower()
            if et_name not in ll and draw_code.lower() not in ll:
                print(f"  ET: skipping unrelated: {link[:80]}")
                continue
            print(f"  ET search hit: {link[:80]}")
            h = fetch(link)
            if is_fresh_result_page(h, draw_code):
                return h
            print(f"  ET: article failed freshness check")

    # 2. Google search — finds the real article ET search misses for fresh publishes
    print(f"  ET: trying Google to find article...")
    for link in google_search_et_url(lottery['name'], draw_code, date_str):
        ll = link.lower()
        if et_name not in ll and draw_code.lower() not in ll:
            continue
        print(f"  Google→ET: {link[:80]}")
        h = fetch(link)
        if is_fresh_result_page(h, draw_code):
            return h
        print(f"  Google→ET: failed freshness check")

    # NOTE: No guessed direct URLs — ET always redirects unknown slugs to the generic
    # category index page (kerala-lottery-result-toda...) which has BT-XX in old snippets
    # and falsely passes naive freshness checks.
    print(f"  ET: not found")
    return ""

# ── Source 2: Goodreturns ─────────────────────────────────
def try_goodreturns(lottery_slug, draw_code):
    url = f"https://www.goodreturns.in/kerala-lottery-results-{lottery_slug}.html"
    print(f"  Goodreturns: {url}")
    h = fetch(url)
    if is_fresh_result_page(h, draw_code):
        return h
    print(f"  Goodreturns: stale or missing draw code")
    return ""

# ── Source 3: keralalotteries.net ────────────────────────
def try_keralalotteries(lottery_slug, draw_code, date):
    date_str = date.strftime('%d-%m-%Y')
    month    = date.strftime('%Y/%m')
    url = f"https://www.keralalotteries.net/{month}/{lottery_slug}-kerala-lottery-result-{draw_code.lower()}-today-{date_str}.html"
    print(f"  keralalotteries.net: {url}")
    h = fetch(url)
    if is_fresh_result_page(h, draw_code):
        return h
    print(f"  keralalotteries.net: stale or not found")
    return ""

# ── Source 4: lotteryresultsnow.com ──────────────────────
def try_lotteryresultsnow(lottery_slug, draw_code, date):
    names = {'karunya':'karunya','karunya-plus':'karunya-plus','sthree-sakthi':'sthree-sakthi',
             'dhanalekshmi':'dhanalekshmi','suvarna-keralam':'suvarna-keralam',
             'bhagyathara':'bhagyathara','samrudhi':'samrudhi'}
    name = names.get(lottery_slug, lottery_slug)
    date_str = date.strftime('%d-%m-%Y')
    url = f"https://lotteryresultsnow.com/{name}-{draw_code.lower()}-lottery-result-{date_str}/"
    print(f"  lotteryresultsnow: {url}")
    h = fetch(url)
    if is_fresh_result_page(h, draw_code):
        return h
    print(f"  lotteryresultsnow: stale or not found")
    return ""

# ── Prize parser ──────────────────────────────────────────
def parse_prizes(html):
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>',  ' ', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'&nbsp;|&#160;', ' ', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'\s+', ' ', text).strip()

    prizes = {}
    NOISE  = {'2026','2025','2024','2023','1000','2000','3000','4000','5000','0000','9999'}

    def find_ticket(patterns):
        for pat in patterns:
            m = re.search(pat + r'[^A-Z0-9]{0,20}([A-Z]{2})\s+(\d{6})(?:\s+\(([^)]+)\))?', text, re.IGNORECASE)
            if m:
                t, n = m.group(1).upper(), m.group(2)
                dist = m.group(3).strip().title() if m.group(3) else None
                return [json.dumps({'ticket':f'{t} {n}','district':dist}) if dist else f'{t} {n}']
        return None

    r1 = find_ticket([r'1st Prize[^:]*:', r'First Prize[^:]*:'])
    if r1: prizes['1st'] = r1; print(f"  1st: {r1[0][:30]}")

    r2 = find_ticket([r'2nd Prize[^:]*:', r'Second Prize[^:]*:'])
    if r2: prizes['2nd'] = r2; print(f"  2nd: {r2[0][:30]}")

    r3 = find_ticket([r'3rd Prize[^:]*:', r'Third Prize[^:]*:'])
    if r3: prizes['3rd'] = r3; print(f"  3rd: {r3[0][:30]}")

    if '1st' in prizes:
        try:
            obj = json.loads(prizes['1st'][0])
            first_6, first_s = obj['ticket'].split()[1], obj['ticket'].split()[0]
        except:
            parts = prizes['1st'][0].split()
            first_6, first_s = (parts[1], parts[0]) if len(parts) > 1 else ('', '')
        if first_6:
            cons_section = ''
            for lbl in ['Consolation Prize', 'Cons Prize', 'Consolation']:
                idx = text.find(lbl)
                if idx != -1:
                    chunk = text[idx: idx + 1500]
                    for stop in ['2nd Prize', 'Second Prize', '3rd Prize']:
                        si = chunk.find(stop, len(lbl))
                        if si > 0: chunk = chunk[:si]
                    cons_section = chunk
                    break
            series = []
            if cons_section and first_6 in cons_section:
                for s in re.findall(r'\b([A-Z]{2})\b', cons_section):
                    if s != first_s and s != 'RS' and s not in series:
                        series.append(s)
            if series:
                prizes['consolation'] = [f'{s} {first_6}' for s in series]
                print(f"  Consolation: {len(series)} series from section")
            else:
                print("  Consolation: could not parse series reliably — leaving empty")

    tier_stops = {
        '4th': ['5th Prize','Fifth Prize'],
        '5th': ['6th Prize','Sixth Prize'],
        '6th': ['7th Prize','Seventh Prize'],
        '7th': ['8th Prize','Eighth Prize'],
        '8th': ['9th Prize','Ninth Prize'],
        '9th': [],
    }
    for tier, labels in [
        ('4th', ['4th Prize','Fourth Prize']),
        ('5th', ['5th Prize','Fifth Prize']),
        ('6th', ['6th Prize','Sixth Prize']),
        ('7th', ['7th Prize','Seventh Prize']),
        ('8th', ['8th Prize','Eighth Prize']),
        ('9th', ['9th Prize','Ninth Prize']),
    ]:
        for label in labels:
            idx = text.find(label)
            if idx == -1: continue
            window = 8000 if tier in ('7th','8th','9th') else 4000
            chunk = text[idx:idx+window]
            for stop in tier_stops.get(tier, []):
                si = chunk.find(stop, 15)
                if si > 0: chunk = chunk[:si]
            for stop in ['Disclaimer','Kerala Government Gazette','prize winners are advised']:
                si = chunk.lower().find(stop.lower(), 15)
                if si > 0: chunk = chunk[:si]
            nums = [n for n in re.findall(r'\b(\d{4})\b', chunk) if n not in NOISE]
            if len(nums) >= 2:
                prizes[tier] = nums; print(f"  {tier}: {len(nums)} numbers"); break

    return prizes

def build_full_results(prizes):
    order = ['1st','consolation','2nd','3rd','4th','5th','6th','7th','8th','9th']
    return ' / '.join(f'{t}:{",".join(str(v) for v in prizes[t])}' for t in order if t in prizes and prizes[t])

def main():
    ist = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    now = datetime.datetime.now(ist)
    print(f"Scraper v7: {now.strftime('%H:%M IST, %d %b %Y')}")

    lottery, draw_code, _ = get_today_lottery()
    print(f"Lottery: {lottery['name']} | Draw: {draw_code}")

    html, source = "", ""
    for name, fn in [
        ("ET",               lambda: try_economic_times(lottery, draw_code, now)),
        ("Goodreturns",      lambda: try_goodreturns(lottery['slug'], draw_code)),
        ("keralalotteries",  lambda: try_keralalotteries(lottery['slug'], draw_code, now)),
        ("lotteryresultsnow",lambda: try_lotteryresultsnow(lottery['slug'], draw_code, now)),
    ]:
        h = fn()
        if h and len(h) > 2000:
            html, source = h, name
            print(f"  Got HTML from {name} ({len(h):,} bytes)")
            break

    if not html:
        print("No source returned result — exiting"); sys.exit(0)

    prizes = parse_prizes(html)
    if '1st' not in prizes:
        print("Could not extract 1st prize"); sys.exit(0)

    try:    first_prize = json.loads(prizes['1st'][0])['ticket']
    except: first_prize = str(prizes['1st'][0])

    full_results = build_full_results(prizes)
    tiers = len([t for t in ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'] if t in prizes])
    print(f"\n✅ {draw_code}: {first_prize} | {tiers}/9 tiers | {source}")

    with open('/tmp/et_first_prize.txt','w')  as f: f.write(first_prize)
    with open('/tmp/et_full_results.txt','w') as f: f.write(full_results)
    with open('/tmp/et_slug.txt','w')         as f: f.write(lottery['slug'])
    with open('/tmp/et_draw_code.txt','w')    as f: f.write(draw_code)
    print("Done ✅")

if __name__ == '__main__':
    main()
