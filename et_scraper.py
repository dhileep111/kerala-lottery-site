#!/usr/bin/env python3
"""
et_scraper.py — Kerala Lottery Auto-Scraper v5
Run at 3:50 PM: gets 1st/2nd/3rd prizes from ET article
Run at 4:50 PM: gets full result including all 4-digit prizes

Sources tried in order:
1. Economic Times (via sitemap article discovery)
2. Goodreturns
3. keralalotteries.net
"""
import re, os, sys, json, datetime, urllib.request, urllib.parse

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,*/*',
    'Accept-Language': 'en-IN,en;q=0.9',
    'Referer': 'https://www.google.com/',
}

ET_NAMES = {
    'karunya':'karunya','karunya-plus':'karunya-plus',
    'sthree-sakthi':'sthree-sakthi','dhanalekshmi':'dhanalekshmi',
    'suvarna-keralam':'suvarna-keralam','bhagyathara':'bhagyathara','samrudhi':'samrudhi',
}

LOTTERY_FULL_NAMES = {
    'karunya': 'Karunya',
    'karunya-plus': 'Karunya Plus',
    'sthree-sakthi': 'Sthree Sakthi',
    'dhanalekshmi': 'Dhanalekshmi',
    'suvarna-keralam': 'Suvarna Keralam',
    'bhagyathara': 'Bhagyathara',
    'samrudhi': 'Samrudhi',
}

def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Fetch error {url[:60]}: {e}")
        return ""

def get_today_lottery():
    DATA = 'artifacts/kerala-lottery/src/data'
    with open(f'{DATA}/lotteries.json') as f:
        lotteries = json.load(f)
    with open(f'{DATA}/results.json') as f:
        results = json.load(f)

    ist     = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    ist_now = datetime.datetime.now(ist)
    today_s = ist_now.strftime('%Y-%m-%d')
    today_j = (ist_now.weekday() + 1) % 7

    lottery = next((l for l in lotteries if l['drawDayIndex'] == today_j and not l.get('isBumper')), None)
    if not lottery:
        print("No lottery today"); sys.exit(0)

    # Reuse today's draw code if already exists
    today_r = next((r for r in results
                    if r['lotterySlug'] == lottery['slug'] and r.get('drawDate','') == today_s), None)
    if today_r:
        return lottery, today_r['drawCode'], ist_now

    # Compute next draw number from verified/live only
    draws = [r for r in results
             if r['lotterySlug'] == lottery['slug']
             and r['status'] in ('verified','live')]
    nums = []
    for d in draws:
        try: nums.append(int(d['drawCode'].split('-')[1]))
        except: pass
    next_n = max(nums) + 1 if nums else 1
    return lottery, f"{lottery['code']}-{next_n}", ist_now

def find_et_article(lottery, draw_code, date):
    """Find ET article URL via sitemap or search."""
    et_name  = ET_NAMES.get(lottery['slug'], lottery['slug'])
    date_str = date.strftime('%d-%m-%Y')
    slug_pat = f"kerala-lottery-{et_name}-{draw_code.lower()}-result"

    # 1. Try ET news sitemap (daily sitemap)
    sitemap_url = f"https://economictimes.indiatimes.com/news/new-updates/sitemap.xml"
    sitemap = fetch(sitemap_url)
    if sitemap:
        urls = re.findall(r'<loc>(https://economictimes[^<]+)</loc>', sitemap)
        for u in urls:
            if slug_pat in u.lower() or (draw_code.lower() in u.lower() and et_name in u.lower()):
                print(f"  ET article via sitemap: {u[:80]}")
                return fetch(u)

    # 2. Try ET search page
    query = urllib.parse.quote(f'kerala lottery {lottery["name"]} {draw_code} result today')
    search = fetch(f"https://economictimes.indiatimes.com/searchresult.cms?query={query}")
    if search:
        links = re.findall(r'"(https://economictimes[^"]+articleshow/\d+[^"]*)"', search)
        for link in links:
            if et_name in link.lower() or draw_code.lower() in link.lower():
                print(f"  ET article via search: {link[:80]}")
                html = fetch(link)
                if html and len(html) > 3000:
                    return html

    # 3. Try constructed URL with today's date (ET uses predictable pattern)
    # ET article IDs are sequential — try a range around today's expected ID
    # (roughly 121000000 + days since Jan 2026 * 50)
    base = f"https://economictimes.indiatimes.com/news/new-updates/{slug_pat}-out-today-{date_str}-rs-1-crore-prize-winning-number-and-full-list-here"
    # Try without articleshow ID - ET sometimes serves the article at base URL
    html = fetch(base)
    if html and len(html) > 5000 and ('prize' in html.lower() or draw_code.lower() in html.lower()):
        print(f"  ET article via base URL")
        return html

    print(f"  ET: article not found for {draw_code}")
    return ""

def fetch_goodreturns(lottery_slug):
    url = f"https://www.goodreturns.in/kerala-lottery-results-{lottery_slug}.html"
    print(f"  Trying Goodreturns: {url}")
    return fetch(url)

def fetch_keralalotteries(lottery_slug, draw_code, date):
    date_str = date.strftime('%d-%m-%Y')
    month    = date.strftime('%Y/%m')
    url = f"https://www.keralalotteries.net/{month}/{lottery_slug}-kerala-lottery-result-{draw_code.lower()}-today-{date_str}.html"
    print(f"  Trying keralalotteries.net: {url}")
    return fetch(url)

def fetch_lotteryresultsnow(lottery_slug, draw_code, date):
    """lotteryresultsnow.com — very fast publisher, less blocking."""
    date_str = date.strftime('%d-%m-%Y')
    name     = LOTTERY_FULL_NAMES.get(lottery_slug, lottery_slug).lower().replace(' ','-')
    url = f"https://lotteryresultsnow.com/{name}-{draw_code.lower()}-lottery-result-{date_str}/"
    print(f"  Trying lotteryresultsnow.com: {url}")
    return fetch(url)

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
                val = json.dumps({'ticket':f'{t} {n}','district':dist}) if dist else f'{t} {n}'
                return [val]
        return None

    # Also check inline paragraph format: "BJ 659839 wins the Rs 1 crore"
    def find_ticket_prose(prize_label):
        m = re.search(
            rf'([A-Z]{{2}})\s+(\d{{6}})\s+wins?\s+the\s+Rs\s+[0-9,]+\s+{prize_label}',
            text, re.IGNORECASE
        )
        if m:
            return [f'{m.group(1)} {m.group(2)}']
        return None

    r1 = find_ticket([r'1st Prize[^:]*:', r'First Prize[^:]*:', r'1st\s+Prize\s*[-–]']) \
         or find_ticket_prose('(first|1 crore|1st)')
    if r1: prizes['1st'] = r1; print(f"  1st: {r1[0][:30]}")

    r2 = find_ticket([r'2nd Prize[^:]*:', r'Second Prize[^:]*:']) \
         or find_ticket_prose('(second|25 lakh|2nd)')
    if r2: prizes['2nd'] = r2; print(f"  2nd: {r2[0][:30]}")

    r3 = find_ticket([r'3rd Prize[^:]*:', r'Third Prize[^:]*:']) \
         or find_ticket_prose('(third|5 lakh|3rd)')
    if r3: prizes['3rd'] = r3; print(f"  3rd: {r3[0][:30]}")

    # Consolation
    if '1st' in prizes:
        try:
            raw  = prizes['1st'][0]
            obj  = json.loads(raw)
            first_6, first_s = obj['ticket'].split()[1], obj['ticket'].split()[0]
        except:
            parts = prizes['1st'][0].split()
            first_6, first_s = (parts[1],parts[0]) if len(parts)>1 else ('','')
        if first_6:
            cons = [f'{s} {first_6}' for s in re.findall(rf'([A-Z]{{2}})\s+{re.escape(first_6)}',text) if s!=first_s]
            seen=set(); unique=[]
            for c in cons:
                if c not in seen: seen.add(c); unique.append(c)
            if unique: prizes['consolation']=unique; print(f"  Consolation: {len(unique)}")

    # 4th–9th
    for tier, labels in [
        ('4th',['4th Prize','Fourth Prize','4th prize']),
        ('5th',['5th Prize','Fifth Prize','5th prize']),
        ('6th',['6th Prize','Sixth Prize','6th prize']),
        ('7th',['7th Prize','Seventh Prize','7th prize']),
        ('8th',['8th Prize','Eighth Prize','8th prize']),
        ('9th',['9th Prize','Ninth Prize','9th prize']),
    ]:
        for label in labels:
            idx = text.find(label)
            if idx==-1: continue
            chunk = text[idx:idx+4000]
            for stop in ['1st Prize','2nd Prize','3rd Prize','5th Prize','6th Prize',
                         '7th Prize','8th Prize','9th Prize','10th Prize']:
                si=chunk.find(stop,15)
                if si>0: chunk=chunk[:si]
            nums=[n for n in re.findall(r'\b(\d{4})\b',chunk) if n not in NOISE]
            if len(nums)>=2:
                prizes[tier]=nums; print(f"  {tier}: {len(nums)} numbers"); break

    return prizes

def build_full_results(prizes):
    order=['1st','consolation','2nd','3rd','4th','5th','6th','7th','8th','9th']
    return ' / '.join(f'{t}:{",".join(str(v) for v in prizes[t])}' for t in order if t in prizes and prizes[t])

def main():
    ist = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    now = datetime.datetime.now(ist)
    print(f"Scraper v5: {now.strftime('%H:%M IST, %d %b %Y')}")

    lottery, draw_code, _ = get_today_lottery()
    print(f"Lottery: {lottery['name']} | Draw: {draw_code}")

    html, source = "", ""
    attempts = [
        ("ET",              lambda: find_et_article(lottery, draw_code, now)),
        ("Goodreturns",     lambda: fetch_goodreturns(lottery['slug'])),
        ("keralalotteries", lambda: fetch_keralalotteries(lottery['slug'], draw_code, now)),
        ("lotteryresultsnow", lambda: fetch_lotteryresultsnow(lottery['slug'], draw_code, now)),
    ]

    for name, fn in attempts:
        h = fn()
        if h and len(h) > 2000:
            html, source = h, name
            print(f"  ✅ Got HTML from {name} ({len(h):,} bytes)")
            break

    if not html:
        print("❌ No source returned result — exiting"); sys.exit(0)

    prizes = parse_prizes(html)
    if '1st' not in prizes:
        print("❌ Could not extract 1st prize"); sys.exit(0)

    try:    first_prize = json.loads(prizes['1st'][0])['ticket']
    except: first_prize = str(prizes['1st'][0]).split()[0]+' '+str(prizes['1st'][0]).split()[1] if ' ' in str(prizes['1st'][0]) else str(prizes['1st'][0])

    full_results  = build_full_results(prizes)
    tiers_found   = len([t for t in ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'] if t in prizes])
    print(f"\n✅ {draw_code}: {first_prize} | {tiers_found}/9 tiers | source: {source}")

    with open('/tmp/et_first_prize.txt','w')  as f: f.write(first_prize)
    with open('/tmp/et_full_results.txt','w') as f: f.write(full_results)
    with open('/tmp/et_slug.txt','w')         as f: f.write(lottery['slug'])
    with open('/tmp/et_draw_code.txt','w')    as f: f.write(draw_code)
    print("Done ✅")

if __name__ == '__main__':
    main()
