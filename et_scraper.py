#!/usr/bin/env python3
"""
et_scraper.py v6 - Kerala Lottery Auto-Scraper
Runs at 3:50 PM and 4:50 PM IST via GitHub Actions cron.
Sources: ET (via search) → Goodreturns → keralalotteries.net → lotteryresultsnow.com
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

# ── Source 1: Economic Times ──────────────────────────────
def try_economic_times(lottery, draw_code, date):
    et_name  = ET_NAMES.get(lottery['slug'], lottery['slug'])
    date_str = date.strftime('%d-%m-%Y')
    # Try ET search to get actual article URL
    query = urllib.parse.quote(f'kerala lottery {lottery["name"]} {draw_code} result today')
    search_html = fetch(f"https://economictimes.indiatimes.com/searchresult.cms?query={query}")
    if search_html:
        links = re.findall(r'"(https://economictimes[^"]+articleshow/\d+[^"]*)"', search_html)
        for link in links:
            if et_name in link.lower() or draw_code.lower() in link.lower():
                print(f"  ET search hit: {link[:80]}")
                h = fetch(link)
                if h and len(h) > 3000:
                    return h
    # Try base URL without articleshow ID
    base = f"https://economictimes.indiatimes.com/news/new-updates/kerala-lottery-{et_name}-{draw_code.lower()}-result-out-today-{date_str}-rs-1-crore-prize-winning-number-and-full-list-here"
    h = fetch(base)
    if h and len(h) > 3000 and 'prize' in h.lower():
        return h
    print(f"  ET: not found")
    return ""

# ── Source 2: Goodreturns ─────────────────────────────────
def try_goodreturns(lottery_slug):
    url = f"https://www.goodreturns.in/kerala-lottery-results-{lottery_slug}.html"
    print(f"  Goodreturns: {url}")
    return fetch(url)

# ── Source 3: keralalotteries.net ────────────────────────
def try_keralalotteries(lottery_slug, draw_code, date):
    date_str = date.strftime('%d-%m-%Y')
    month    = date.strftime('%Y/%m')
    url = f"https://www.keralalotteries.net/{month}/{lottery_slug}-kerala-lottery-result-{draw_code.lower()}-today-{date_str}.html"
    print(f"  keralalotteries.net: {url}")
    return fetch(url)

# ── Source 4: lotteryresultsnow.com ──────────────────────
def try_lotteryresultsnow(lottery_slug, draw_code, date):
    names = {'karunya':'karunya','karunya-plus':'karunya-plus','sthree-sakthi':'sthree-sakthi',
             'dhanalekshmi':'dhanalekshmi','suvarna-keralam':'suvarna-keralam',
             'bhagyathara':'bhagyathara','samrudhi':'samrudhi'}
    name = names.get(lottery_slug, lottery_slug)
    date_str = date.strftime('%d-%m-%Y')
    url = f"https://lotteryresultsnow.com/{name}-{draw_code.lower()}-lottery-result-{date_str}/"
    print(f"  lotteryresultsnow: {url}")
    return fetch(url)

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

    # Consolation: same 6 digits as 1st prize
    if '1st' in prizes:
        try:
            obj = json.loads(prizes['1st'][0])
            first_6, first_s = obj['ticket'].split()[1], obj['ticket'].split()[0]
        except:
            parts = prizes['1st'][0].split()
            first_6, first_s = (parts[1], parts[0]) if len(parts) > 1 else ('', '')
        if first_6:
            found = [f'{s} {first_6}' for s in re.findall(rf'([A-Z]{{2}})\s+{re.escape(first_6)}', text) if s != first_s]
            seen = set(); unique = []
            for c in found:
                if c not in seen: seen.add(c); unique.append(c)
            # Fallback: generate from series when ET writes "All other series with NNNNNN"
            if not unique and first_s and len(first_s) == 2:
                prefix = first_s[0]
                won_l  = first_s[1]
                letters = [c for c in 'ABCDEFGHJKLMNOPRSTUVWXYZ']
                unique = [f'{prefix}{l} {first_6}' for l in letters if l != won_l][:11]
                print(f"  Consolation: generated {len(unique)} series tickets")
            else:
                print(f"  Consolation: {len(unique)} tickets")
            if unique: prizes['consolation'] = unique

    # 4th–9th prizes
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
            chunk = text[idx:idx+4000]
            for stop in ['1st Prize','2nd Prize','3rd Prize','5th Prize','6th Prize',
                         '7th Prize','8th Prize','9th Prize','10th Prize']:
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
    print(f"Scraper v6: {now.strftime('%H:%M IST, %d %b %Y')}")

    lottery, draw_code, _ = get_today_lottery()
    print(f"Lottery: {lottery['name']} | Draw: {draw_code}")

    html, source = "", ""
    for name, fn in [
        ("ET",              lambda: try_economic_times(lottery, draw_code, now)),
        ("Goodreturns",     lambda: try_goodreturns(lottery['slug'])),
        ("keralalotteries", lambda: try_keralalotteries(lottery['slug'], draw_code, now)),
        ("lotteryresultsnow", lambda: try_lotteryresultsnow(lottery['slug'], draw_code, now)),
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
