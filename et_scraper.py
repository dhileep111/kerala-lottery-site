#!/usr/bin/env python3
"""
et_scraper.py v8 - Kerala Lottery Auto-Scraper
Sources: ET (via search + Google) → Goodreturns → keralalotteries.net → lotteryresultsnow.com

v8 fix: freshness check now works on stripped plain text (not raw HTML).
        Raw HTML has huge gaps between draw code in <title> and prize table deep in page.
        Plain text collapses this and lets the freshness check compare meaningful positions.
"""
import re, os, sys, json, datetime, html as html_lib, urllib.request, urllib.parse

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

def html_to_text(html):
    """Strip HTML tags and collapse whitespace to plain text for proximity checks."""
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>',   ' ', text, flags=re.DOTALL)
    text = re.sub(r'<br\s*/?>', ' ', text, flags=re.IGNORECASE)
    text = re.sub(r'</(?:p|div|li|h[1-6]|tr|td|th)>', ' ', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html_lib.unescape(text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

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
    Check on PLAIN TEXT (not raw HTML) so tag/script bloat doesn't inflate distances.
    Real result pages keep the draw code and '1st prize' reasonably close in plain text.
    Generic index/guessing pages may contain the draw code and prize words, but should not
    be trusted as final result sources.
    """
    if not html or len(html) < 3000:
        return False

    text  = html_to_text(html)
    lower = text.lower()
    dc    = draw_code.lower()

    if dc not in lower:
        print(f"  ⚠ '{draw_code}' not in page text — stale, skipping")
        return False

    early_text = lower[:2500]
    bad_article_markers = (
        'guessing', 'prediction', 'predict', 'lucky number', 'lucky numbers',
        'probable', 'expected result', 'winning chance'
    )
    if any(marker in early_text for marker in bad_article_markers):
        print("  ⚠ Guessing/prediction article — not an official result page, skipping")
        return False

    has_1st  = '1st prize' in lower
    has_frst = 'first prize' in lower
    if not has_1st and not has_frst:
        print(f"  ⚠ No prize text in page — skipping")
        return False

    dc_positions = [m.start() for m in re.finditer(re.escape(dc), lower)]
    prize_positions = [m.start() for m in re.finditer(r'\b(?:1st|first)\s+prize\b', lower)]
    dist = min(abs(d - p) for d in dc_positions for p in prize_positions)

    result_markers = (
        'winning numbers today', 'winner takes home', 'secured the first prize',
        'ticket number', 'date of draw', 'today lottery series', 'check winning list',
        'winners numbers'
    )
    has_result_marker = any(marker in lower for marker in result_markers)
    max_dist = 6000 if has_result_marker else 3000

    # In plain text a real result page keeps the draw code and prize table close.
    # ET pages sometimes include a large nav/synopsis block before the prize table,
    # so allow a wider window only when result-specific article markers are present.
    if dist > max_dist:
        print(f"  ⚠ '{draw_code}' and prize are {dist} plain-text chars apart — index page, skipping")
        return False

    print(f"  ✓ Freshness OK — '{draw_code}' and prize are {dist} plain-text chars apart")
    return True

# ── Source 1: Economic Times ──────────────────────────────
def google_search_et_url(lottery_name, draw_code, date_str):
    """Use Google to find the real ET articleshow URL for today's result."""
    query = urllib.parse.quote(f'site:economictimes.indiatimes.com {lottery_name} {draw_code} result {date_str}')
    url   = f"https://www.google.com/search?q={query}&num=5"
    html  = fetch(url, extra_headers={
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

def is_result_article_url(url):
    """Reject ET articles that are about guesses/predictions instead of published results."""
    u = urllib.parse.unquote(url).lower()
    blocked = ('guess', 'prediction', 'predict', 'lucky-number', 'lucky-numbers')
    return not any(word in u for word in blocked)

def try_economic_times(lottery, draw_code, date):
    et_name  = ET_NAMES.get(lottery['slug'], lottery['slug'])
    date_str = date.strftime('%d-%m-%Y')

    # 0. Optional exact ET URL for manual reruns/debugging when search pages lag.
    for env_name in ('ET_ARTICLE_URL', 'RESULT_ARTICLE_URL', 'SOURCE_URL'):
        direct_url = os.environ.get(env_name, '').strip()
        if not direct_url:
            continue
        if 'economictimes.indiatimes.com' not in direct_url.lower():
            continue
        if not is_result_article_url(direct_url):
            print(f"  ET: skipping {env_name} guessing/prediction article: {direct_url[:80]}")
            continue
        print(f"  ET direct ({env_name}): {direct_url[:80]}")
        h = fetch(direct_url)
        if is_fresh_result_page(h, draw_code):
            return h
        print(f"  ET direct ({env_name}): failed freshness check")

    # 1. ET's own search — only follow articleshow links for this lottery/draw
    query = urllib.parse.quote(f'kerala lottery {lottery["name"]} {draw_code} result today')
    search_html = fetch(f"https://economictimes.indiatimes.com/searchresult.cms?query={query}")
    if search_html:
        links = re.findall(r'"(https://economictimes[^"]+articleshow/\d+[^"]*)"', search_html)
        seen  = []
        for link in links:
            ll = link.lower()
            if et_name not in ll and draw_code.lower() not in ll:
                print(f"  ET: skipping unrelated: {link[:80]}")
                continue
            if not is_result_article_url(link):
                print(f"  ET: skipping guessing/prediction article: {link[:80]}")
                continue
            if link in seen:
                continue
            seen.append(link)
            print(f"  ET search hit: {link[:80]}")
            h = fetch(link)
            if is_fresh_result_page(h, draw_code):
                return h
            print(f"  ET: article failed freshness check")

    # 2. Google search for real article (ET search misses fresh publishes)
    print(f"  ET: trying Google to find article...")
    for link in google_search_et_url(lottery['name'], draw_code, date_str):
        if et_name not in link.lower() and draw_code.lower() not in link.lower():
            continue
        if not is_result_article_url(link):
            print(f"  Google→ET: skipping guessing/prediction article: {link[:80]}")
            continue
        print(f"  Google→ET: {link[:80]}")
        h = fetch(link)
        if is_fresh_result_page(h, draw_code):
            return h
        print(f"  Google→ET: failed freshness check")

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
    name     = names.get(lottery_slug, lottery_slug)
    date_str = date.strftime('%d-%m-%Y')
    url = f"https://lotteryresultsnow.com/{name}-{draw_code.lower()}-lottery-result-{date_str}/"
    print(f"  lotteryresultsnow: {url}")
    h = fetch(url)
    if is_fresh_result_page(h, draw_code):
        return h
    print(f"  lotteryresultsnow: stale or not found")
    return ""

# ── Prize parser ──────────────────────────────────────────
def parse_prizes(html, draw_code=''):
    full_text = html_to_text(html)

    # ── KEY FIX: anchor to the draw_code's position ────────
    # ET "result today" articles often contain yesterday's full result
    # followed by today's result. If we parse the whole page, we pick
    # up yesterday's prize numbers. Instead, find where THIS draw code
    # appears and slice the text to start from there.
    scoped_text = full_text
    if draw_code:
        dc_lower = draw_code.lower()
        idx = full_text.lower().find(dc_lower)
        if idx > 0:
            # Start from 200 chars before the draw code so we catch labels
            # that appear just before it (e.g. "Sthree Sakthi SS-523 Result")
            scoped_text = full_text[max(0, idx - 200):]
            print(f"  Anchored parse to '{draw_code}' at pos {idx} (scoped {len(scoped_text):,} of {len(full_text):,} chars)")

    text = scoped_text
    prizes = {}
    NOISE  = {'2026','2025','2024','2023','1000','2000','3000','4000','5000','0000','9999'}

    def matching_sections(labels, window=2500):
        """Yield every matching prize-label section, trimmed at the next prize label.

        ET articles often mention the prize structure before the actual winning
        numbers.  A single ``re.search`` can therefore stop at a label like
        ``1st Prize: Rs 1 Crore`` that has no ticket number and miss the later
        ``Winning Numbers`` section.  Walk all label occurrences and let callers
        pick the first section containing a valid ticket.
        """
        label_pat = '|'.join(re.escape(label) for label in labels)
        for m in re.finditer(label_pat, text, re.IGNORECASE):
            chunk = text[m.start():m.start() + window]
            stop = re.search(
                r'\b(?:Consolation|1st|First|2nd|Second|3rd|Third|4th|Fourth|5th|Fifth|6th|Sixth|7th|Seventh|8th|Eighth|9th|Ninth)\s+Prize\b',
                chunk[25:],
                re.IGNORECASE,
            )
            if stop:
                chunk = chunk[:25 + stop.start()]
            yield chunk

    def find_ticket(labels):
        for chunk in matching_sections(labels, window=900):
            m = re.search(r'\b([A-Z]{2})\s+(\d{6})(?:\s+\(([^)]+)\))?', chunk, re.IGNORECASE)
            if m:
                t, n = m.group(1).upper(), m.group(2)
                dist = m.group(3).strip().title() if m.group(3) else None
                return [json.dumps({'ticket':f'{t} {n}','district':dist}) if dist else f'{t} {n}']
        return None

    def extract_series():
        # Prefer the page's explicit "Today Lottery Series" list when available.
        m = re.search(r'Today\s+Lottery\s+Series\s*:?\s*((?:[A-Z]{2}\s*,?\s*){3,})', text, re.IGNORECASE)
        if m:
            return list(dict.fromkeys(s.upper() for s in re.findall(r'\b[A-Z]{2}\b', m.group(1))))
        # Weekly Kerala lottery pages commonly use these 12 series; this is only a
        # fallback for pages saying "all remaining series" without listing them nearby.
        return ['BA','BB','BC','BD','BE','BF','BG','BH','BJ','BK','BL','BM']

    def find_first_prize_anchored():
        # On multi-draw / live-blog pages there can be several "1st Prize" mentions.
        # Pick the one nearest the target draw code so we never grab another draw's number.
        mdc = re.match(r'([A-Za-z]+)-?(\d+)', draw_code)
        dc_re = rf"{mdc.group(1)}\s*-?\s*{mdc.group(2)}" if mdc else re.escape(draw_code)
        dc_positions = [m.start() for m in re.finditer(dc_re, text, re.IGNORECASE)]
        if not dc_positions:
            return None
        best = None
        for m in re.finditer(r'\b(?:1st|First)\s+Prize\b', text, re.IGNORECASE):
            chunk = text[m.start(): m.start() + 900]
            stop = re.search(r'\b(?:Consolation|2nd|Second|3rd|Third)\s+Prize\b', chunk[25:], re.IGNORECASE)
            if stop:
                chunk = chunk[:25 + stop.start()]
            tm = re.search(r'\b([A-Z]{2})\s+(\d{6})(?:\s+\(([^)]+)\))?', chunk, re.IGNORECASE)
            if not tm:
                continue
            dist = min(abs(m.start() - d) for d in dc_positions)
            if best is None or dist < best[0]:
                best = (dist, tm.group(1).upper(), tm.group(2), tm.group(3))
        if not best:
            return None
        _, t, n, dpar = best
        district = dpar.strip().title() if dpar else None
        return [json.dumps({'ticket': f'{t} {n}', 'district': district}) if district else f'{t} {n}']

    r1 = find_first_prize_anchored() or find_ticket(['1st Prize', 'First Prize'])
    if r1: prizes['1st'] = r1; print(f"  1st: {r1[0][:30]}")

    r2 = find_ticket(['2nd Prize', 'Second Prize'])
    if r2: prizes['2nd'] = r2; print(f"  2nd: {r2[0][:30]}")

    r3 = find_ticket(['3rd Prize', 'Third Prize'])
    if r3: prizes['3rd'] = r3; print(f"  3rd: {r3[0][:30]}")

    if '1st' in prizes:
        try:
            obj = json.loads(prizes['1st'][0])
            first_6, first_s = obj['ticket'].split()[1], obj['ticket'].split()[0]
        except:
            parts = prizes['1st'][0].split()
            first_6, first_s = (parts[1], parts[0]) if len(parts) > 1 else ('', '')
        if first_6 and first_s:
            first_letter = first_s[0]
            series = []
            # Each consolation series is printed with the 1st-prize number (e.g. "BA 304203
            # BB 304203"). That number is unique to this draw, so "<series> <number>" appears
            # only for the 1st prize + consolation. The lookbehind avoids 3-letter runs and
            # \s* tolerates extractor glue like "...304203BC 304203" that breaks \b matching.
            for s in re.findall(rf'(?<![A-Z])([A-Z]{{2}})\s*{re.escape(first_6)}', text):
                if s != first_s and s != 'RS' and s not in series:
                    series.append(s)
            # Fallback: a few sources list the series without repeating the number — read the
            # Consolation section and take codes sharing the 1st-prize series' first letter.
            if len(series) < 3:
                for m in re.finditer(r'Consolation\s+Prize|Cons\s+Prize|Consolation', text, re.IGNORECASE):
                    chunk = text[m.start(): m.start() + 2200]
                    for stop in ['2nd Prize', 'Second Prize', '3rd Prize', 'Third Prize', 'How to Check']:
                        si = chunk.lower().find(stop.lower(), 20)
                        if si > 0:
                            chunk = chunk[:si]
                    for s in re.findall(r'\b([A-Z]{2})\b', chunk):
                        if s[0] == first_letter and s != first_s and s != 'RS' and s not in series:
                            series.append(s)
                    if series:
                        break
            series = sorted(series)
            if series:
                prizes['consolation'] = [f'{s} {first_6}' for s in series]
                print(f"  Consolation: {len(series)} series")
            else:
                print("  Consolation: could not parse series reliably — leaving empty")

    for tier, labels in [
        ('4th', ['4th Prize','Fourth Prize']),
        ('5th', ['5th Prize','Fifth Prize']),
        ('6th', ['6th Prize','Sixth Prize']),
        ('7th', ['7th Prize','Seventh Prize']),
        ('8th', ['8th Prize','Eighth Prize']),
        ('9th', ['9th Prize','Ninth Prize']),
    ]:
        window = 8000 if tier in ('7th','8th','9th') else 4000
        for chunk in matching_sections(labels, window=window):
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

# ── Source 5: klresultstoday.com ─────────────────────────
def try_klresultstoday(lottery_slug, draw_code, date):
    # URL format: klresultstoday.com/sthree-sakthi-ss-523-result-today-09-06-2026/
    slug_map = {
        'sthree-sakthi': 'sthree-sakthi', 'karunya': 'karunya',
        'karunya-plus': 'karunya-plus', 'dhanalekshmi': 'dhanalekshmi',
        'suvarna-keralam': 'suvarna-keralam', 'bhagyathara': 'bhagyathara',
        'samrudhi': 'samrudhi',
    }
    name     = slug_map.get(lottery_slug, lottery_slug)
    dc_lower = draw_code.lower().replace('-','-')
    date_str = date.strftime('%d-%m-%Y')
    url = f"https://klresultstoday.com/{name}-{dc_lower}-result-today-{date_str}/"
    print(f"  klresultstoday: {url}")
    h = fetch(url)
    if is_fresh_result_page(h, draw_code):
        return h
    print(f"  klresultstoday: stale or not found")
    return ""


def get_recent_prizes(lottery_slug, limit=3):
    """Return set of ticket numbers from recent results of OTHER lotteries.
    Used to detect cross-draw contamination (scraper returns yesterday's prize)."""
    try:
        with open('artifacts/kerala-lottery/src/data/results.json') as f:
            results = json.load(f)
        seen = set()
        for r in results[:15]:  # check last 15 entries
            if r['lotterySlug'] == lottery_slug:
                continue  # skip same lottery
            for p in r.get('prizes', []):
                for num in p.get('numbers', []):
                    ticket = num if isinstance(num, str) else num.get('ticket', '')
                    parts = ticket.split()
                    if len(parts) == 2:
                        seen.add(ticket.upper())
        return seen
    except Exception:
        return set()


def main():
    ist = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    now = datetime.datetime.now(ist)
    print(f"Scraper v10: {now.strftime('%H:%M IST, %d %b %Y')}")

    lottery, draw_code, _ = get_today_lottery()
    print(f"Lottery: {lottery['name']} | Draw: {draw_code}")

    # Build set of known prizes from OTHER recent lotteries to detect contamination
    other_recent_prizes = get_recent_prizes(lottery['slug'])
    if other_recent_prizes:
        print(f"  Cross-validation: loaded {len(other_recent_prizes)} known prizes from other draws")

    html, source, prizes = "", "", {}
    for name, fn in [
        ("klresultstoday",  lambda: try_klresultstoday(lottery['slug'], draw_code, now)),
        ("ET",              lambda: try_economic_times(lottery, draw_code, now)),
        ("Goodreturns",     lambda: try_goodreturns(lottery['slug'], draw_code)),
        ("keralalotteries", lambda: try_keralalotteries(lottery['slug'], draw_code, now)),
        ("lotteryresultsnow",lambda: try_lotteryresultsnow(lottery['slug'], draw_code, now)),
    ]:
        h = fn()
        if not h or len(h) <= 2000:
            continue

        print(f"  Got HTML from {name} ({len(h):,} bytes)")
        parsed = parse_prizes(h, draw_code)
        if '1st' not in parsed:
            print(f"  {name}: could not extract 1st prize — trying next source")
            continue

        # ── Cross-draw contamination check ────────────────
        # If the extracted 1st prize matches a known prize from a DIFFERENT
        # lottery's recent results, this source has stale/wrong data.
        try:
            p1_ticket = json.loads(parsed['1st'][0])['ticket'] if '{' in str(parsed['1st'][0]) else str(parsed['1st'][0])
        except Exception:
            p1_ticket = str(parsed['1st'][0])

        if p1_ticket.upper() in other_recent_prizes:
            print(f"  ⚠ {name}: 1st prize '{p1_ticket}' matches a DIFFERENT lottery's recent result — contaminated, skipping")
            continue

        html, source, prizes = h, name, parsed
        break

    if not html:
        print("No source returned a parseable result — exiting"); sys.exit(0)

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
