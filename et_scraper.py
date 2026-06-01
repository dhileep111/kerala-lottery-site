#!/usr/bin/env python3
"""
et_scraper.py — Kerala Lottery Auto-Scraper v4
Tries 3 sources in order: ET → Goodreturns → keralalotteries.net
"""
import re, os, sys, json, datetime, urllib.request, urllib.parse

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,*/*',
    'Accept-Language': 'en-US,en;q=0.9',
}

ET_NAMES = {
    'karunya':'karunya','karunya-plus':'karunya-plus',
    'sthree-sakthi':'sthree-sakthi','dhanalekshmi':'dhanalekshmi',
    'suvarna-keralam':'suvarna-keralam','bhagyathara':'bhagyathara','samrudhi':'samrudhi',
}

def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers=HEADERS)
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
    ist_now = datetime.datetime.now(ist)
    today_str = ist_now.strftime('%Y-%m-%d')
    today_js  = (ist_now.weekday() + 1) % 7

    lottery = next((l for l in lotteries if l['drawDayIndex'] == today_js and not l.get('isBumper')), None)
    if not lottery:
        print("No lottery today"); sys.exit(0)

    # Reuse today's existing draw code if already created
    today_result = next((r for r in results
                         if r['lotterySlug'] == lottery['slug']
                         and r.get('drawDate','') == today_str), None)
    if today_result:
        return lottery, today_result['drawCode']

    # Find next draw number — only from verified/live results (not pending)
    draws = [r for r in results
             if r['lotterySlug'] == lottery['slug']
             and r['status'] in ('verified', 'live')
             and r.get('drawDate','') != today_str]
    nums = []
    for d in draws:
        try: nums.append(int(d['drawCode'].split('-')[1]))
        except: pass
    next_num = max(nums) + 1 if nums else 1
    return lottery, f"{lottery['code']}-{next_num}"

def fetch_et(lottery, draw_code, date):
    """Try Economic Times article."""
    et_name  = ET_NAMES.get(lottery['slug'], lottery['slug'])
    date_str = date.strftime('%d-%m-%Y')
    base_url = f"https://economictimes.indiatimes.com/news/new-updates/kerala-lottery-{et_name}-{draw_code.lower()}-result-out-today-{date_str}-rs-1-crore-prize-winning-number-and-full-list-here"

    # Try to find actual articleshow ID via ET search
    search_q = urllib.parse.quote(f'kerala lottery {lottery["name"]} {draw_code} result')
    search_html = fetch(f"https://economictimes.indiatimes.com/searchresult.cms?query={search_q}")
    if search_html:
        links = re.findall(r'href="(https://economictimes[^"&]+articleshow/\d+[^"&]*)"', search_html)
        for link in links:
            if draw_code.lower() in link.lower() or lottery['slug'] in link.lower():
                print(f"  ET article found: {link[:80]}")
                html = fetch(link)
                if html and len(html) > 3000:
                    return html

    print(f"  ET: article not found")
    return ""

def fetch_goodreturns(lottery_slug):
    """Goodreturns — updates within 30 min of PDF."""
    url = f"https://www.goodreturns.in/kerala-lottery-results-{lottery_slug}.html"
    print(f"  Trying Goodreturns: {url}")
    return fetch(url)

def fetch_keralalotteries_net(lottery_slug, draw_code):
    """keralalotteries.net — fastest to publish full results."""
    ist = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    now = datetime.datetime.now(ist)
    date_str = now.strftime('%d-%m-%Y')
    month    = now.strftime('%Y/%m')
    url = f"https://www.keralalotteries.net/{month}/{lottery_slug}-kerala-lottery-result-{draw_code.lower()}-today-{date_str}.html"
    print(f"  Trying keralalotteries.net: {url}")
    return fetch(url)

def parse_prizes(html):
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', ' ', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'&nbsp;|&#160;', ' ', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'\s+', ' ', text).strip()

    prizes = {}
    NOISE  = {'2026','2025','2024','2023','1000','2000','3000','4000','5000','0000','9999','1234'}

    def extract_ticket(label_patterns):
        for pat in label_patterns:
            m = re.search(pat + r'[^A-Z0-9]*([A-Z]{2})\s+(\d{6})(?:\s+\(([^)]+)\))?', text, re.IGNORECASE)
            if m:
                t, n = m.group(1).upper(), m.group(2)
                dist = m.group(3).strip().title() if m.group(3) else None
                return [json.dumps({'ticket':f'{t} {n}','district':dist}) if dist else f'{t} {n}']
        return None

    r1 = extract_ticket([r'1st Prize[^:]*:', r'First Prize[^:]*:', r'first prize.*?:'])
    if r1: prizes['1st'] = r1; print(f"  1st: {r1[0]}")

    r2 = extract_ticket([r'2nd Prize[^:]*:', r'Second Prize[^:]*:'])
    if r2: prizes['2nd'] = r2; print(f"  2nd: {r2[0]}")

    r3 = extract_ticket([r'3rd Prize[^:]*:', r'Third Prize[^:]*:'])
    if r3: prizes['3rd'] = r3; print(f"  3rd: {r3[0]}")

    # Consolation
    if '1st' in prizes:
        try:    raw = prizes['1st'][0]; obj = json.loads(raw); first_6 = obj['ticket'].split()[1]; first_s = obj['ticket'].split()[0]
        except: parts = prizes['1st'][0].split(); first_6, first_s = (parts[1], parts[0]) if len(parts)>1 else ('', '')
        if first_6:
            cons = [f'{s} {first_6}' for s in re.findall(rf'([A-Z]{{2}})\s+{re.escape(first_6)}', text) if s != first_s]
            seen = set(); unique = []
            for c in cons:
                if c not in seen: seen.add(c); unique.append(c)
            if unique: prizes['consolation'] = unique; print(f"  Consolation: {len(unique)} tickets")

    # 4th–9th
    for tier, labels in [
        ('4th', ['4th Prize','Fourth Prize','4th prize']),
        ('5th', ['5th Prize','Fifth Prize','5th prize']),
        ('6th', ['6th Prize','Sixth Prize','6th prize']),
        ('7th', ['7th Prize','Seventh Prize','7th prize']),
        ('8th', ['8th Prize','Eighth Prize','8th prize']),
        ('9th', ['9th Prize','Ninth Prize','9th prize']),
    ]:
        for label in labels:
            idx = text.find(label)
            if idx == -1: continue
            chunk = text[idx:idx+4000]
            # Stop at next tier heading
            for stop in ['1st Prize','2nd Prize','3rd Prize','5th Prize','6th Prize','7th Prize','8th Prize','9th Prize','10th Prize']:
                si = chunk.find(stop, 15)
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
    print(f"Scraper: {now.strftime('%H:%M IST, %d %b %Y')}")

    lottery, draw_code = get_today_lottery()
    print(f"Lottery: {lottery['name']} | Draw: {draw_code}")

    # Try all three sources
    html, source = "", ""
    for name, fn in [
        ("ET",               lambda: fetch_et(lottery, draw_code, now)),
        ("Goodreturns",      lambda: fetch_goodreturns(lottery['slug'])),
        ("keralalotteries",  lambda: fetch_keralalotteries_net(lottery['slug'], draw_code)),
    ]:
        h = fn()
        if h and len(h) > 3000:
            html, source = h, name
            print(f"  Got HTML from {name} ({len(h)} bytes)")
            break

    if not html:
        print("No source returned result — will retry tomorrow"); sys.exit(0)

    prizes = parse_prizes(html)
    if '1st' not in prizes:
        print("Could not extract 1st prize"); sys.exit(0)

    try:    first_prize = json.loads(prizes['1st'][0])['ticket']
    except: first_prize = prizes['1st'][0]

    full_results = build_full_results(prizes)
    print(f"\n✅ {draw_code}: {first_prize} | {len(prizes)} tiers | source: {source}")

    with open('/tmp/et_first_prize.txt','w') as f: f.write(first_prize)
    with open('/tmp/et_full_results.txt','w') as f: f.write(full_results)
    with open('/tmp/et_slug.txt','w') as f: f.write(lottery['slug'])
    with open('/tmp/et_draw_code.txt','w') as f: f.write(draw_code)
    print("Done ✅")

if __name__ == '__main__':
    main()
