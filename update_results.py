import sys
import re
import urllib.request
from bs4 import BeautifulSoup
from datetime import datetime
import os

# ── Lottery Config & Weekday Mapping ─────────────────────
# Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5, Sunday=6
LOTTERY_CONFIG = {
    "dhanalekshmi":   {"name": "Dhanalekshmi", "code": "DL", "prize1": "₹75,00,000",  "day": 0}, 
    "sthree-sakthi":  {"name": "Sthree Sakthi","code": "SS", "prize1": "₹75,00,000",  "day": 1}, 
    "bhagyathara":    {"name": "Bhagyathara",  "code": "BT", "prize1": "₹70,00,000",  "day": 2}, 
    "karunya-plus":   {"name": "Karunya Plus", "code": "KN", "prize1": "₹1,00,00,000", "day": 3}, 
    "samrudhi":       {"name": "Samrudhi",     "code": "SM", "prize1": "₹1,00,00,000", "day": 4}, 
    "karunya":        {"name": "Karunya",      "code": "KR", "prize1": "₹1,00,00,000", "day": 5}, 
    "suvarna-keralam":{"name": "Suvarna Keralam","code":"SK", "prize1": "₹50,00,000", "day": 6}, 
}

# ── Check Inputs (Manual vs Cron Auto-Run) ───────────────
manual_lottery = sys.argv[1] if len(sys.argv) > 1 else ""
manual_draw    = sys.argv[2] if len(sys.argv) > 2 else ""
manual_prize   = sys.argv[3] if len(sys.argv) > 3 else ""

is_scheduled_run = os.environ.get('GITHUB_EVENT_NAME') == 'schedule'

today_dt = datetime.now()
weekday_idx = today_dt.weekday()

if manual_lottery and not is_scheduled_run:
    print(f"🚀 MANUAL MODE DETECTED: Forcing update for {manual_lottery}.")
    lottery_page = manual_lottery
    
    code = LOTTERY_CONFIG.get(lottery_page, {}).get('code', 'XX')
    draw_code = manual_draw if manual_draw else f"{code}-XXX"
        
    if manual_prize:
        first_prize = manual_prize
        status_badge = '<span class="badge badge-live">LIVE</span>'
        print(f"Applying exact winning numbers: Draw: {draw_code}, Prize: {first_prize}")
    else:
        first_prize = "PENDING"
        status_badge = '<span class="badge badge-pending">PENDING</span>'
        print(f"No prize entered. Setting {lottery_page} to PENDING.")

else:
    # --- AUTO MODE (Cron Schedule) ---
    print("🤖 AUTO MODE DETECTED (Scheduled Run).")
    
    # Safely find today's lottery
    auto_lottery_list = [k for k, v in LOTTERY_CONFIG.items() if v["day"] == weekday_idx]
    
    if auto_lottery_list:
        lottery_page = auto_lottery_list[0]
        print(f"Setting up today's {LOTTERY_CONFIG[lottery_page]['name']} draw.")
    else:
        print(f"⚠️ ERROR: Could not find a lottery assigned to weekday {weekday_idx}. Defaulting to Suvarna Keralam to prevent crash.")
        lottery_page = "suvarna-keralam" # Fallback to prevent crash
        
    code = LOTTERY_CONFIG[lottery_page]['code']
    draw_code = f"{code}-XXX"
    first_prize = "PENDING"
    status_badge = '<span class="badge badge-pending">PENDING</span>'
    
    # --- ATTEMPT BASIC SCRAPING ---
    try:
        req = urllib.request.Request('https://keralalotteries.net/', headers={'User-Agent': 'Mozilla/5.0'})
        html_content = urllib.request.urlopen(req, timeout=10).read()
        soup = BeautifulSoup(html_content, 'html.parser')
        
        page_text = soup.get_text()
        draw_match = re.search(rf'({code}-\d{{2,4}})', page_text)
        if draw_match:
            draw_code = draw_match.group(1)
            print(f"✅ Auto-scraped today's Draw Code: {draw_code}")
    except Exception as e:
        print(f"⚠️ Scraping bypassed or failed: {e}. Using placeholders.")

# ── Date Formatting ──────────────────────────────────────
update_dt = datetime.now()
today         = update_dt.strftime("%d %B %Y")   
today_short   = update_dt.strftime("%B %d, %Y")  
iso_date      = update_dt.strftime("%Y-%m-%d") # For SEO schema

cfg  = LOTTERY_CONFIG.get(lottery_page, {})
name = cfg.get("name", lottery_page.title())

def read(path):
    with open(path, "r", encoding="utf-8") as f: return f.read()

def write(path, content):
    with open(path, "w", encoding="utf-8") as f: f.write(content)
    print(f"✅ Saved: {path}")

# ── 1. Update the Specific Lottery HTML Page ─────────────
page_file = f"{lottery_page}.html"
try:
    html = read(page_file)
    
    html = re.sub(r'<span class="badge.*?</span>', status_badge, html, count=1)
    html = re.sub(r'[A-Z]{2}-\d{2,4}|[A-Z]{2}-XXX', draw_code, html)
    
    if is_scheduled_run or (not is_scheduled_run and LOTTERY_CONFIG.get(lottery_page, {}).get("day") == datetime.now().weekday()):
        html = re.sub(r'[A-Z][a-z]+ \d{2}, \d{4}', today_short, html) 
        html = re.sub(r'\d{2} [A-Z][a-z]+ \d{4}', today, html)
        # Update SEO Schema Date
        html = re.sub(r'"dateModified":"\d{4}-\d{2}-\d{2}"', f'"dateModified":"{iso_date}"', html)
    
    if first_prize != "PENDING":
        html = re.sub(r'[A-Z]{2} \d{6}|PENDING', f'<div class="prize-number">{first_prize}</div>', html)
        html = re.sub(r'(<div class="prize-amount">&#8377; [\d,]+</div>)(?!<div class="prize-number">)', r'\1<div class="prize-number">' + first_prize + '</div>', html)
    else:
        html = re.sub(r'<div class="prize-number">.*?</div>', '<div class="prize-number">PENDING</div>', html)
        html = re.sub(r'(<div class="prize-amount">&#8377; [\d,]+</div>)(?!<div class="prize-number">)', r'\1<div class="prize-number">PENDING</div>', html)
        
    write(page_file, html)
except FileNotFoundError:
    print(f"❌ ERROR: {page_file} not found.")
    sys.exit(1)

# ── 2. Update the Index Homepage ─────────────────────────
try:
    idx = read("index.html")
    
    idx = re.sub(r'[A-Z]{2}-\d{2,4}|[A-Z]{2}-XXX', draw_code, idx)
    
    if is_scheduled_run or (not is_scheduled_run and LOTTERY_CONFIG.get(lottery_page, {}).get("day") == datetime.now().weekday()):
        idx = re.sub(r'[A-Z][a-z]+ \d{2}, \d{4}', today_short, idx)
        idx = re.sub(r'\d{2} [A-Z][a-z]+ \d{4}', today, idx)
        
    idx = re.sub(r'Karunya KR-\w+|Sthree Sakthi SS-\w+|Karunya Plus KN-\w+|Dhanalekshmi DL-\w+|Bhagyathara BT-\w+|Samrudhi SM-\w+|Suvarna Keralam SK-\w+', f"{name} {draw_code}", idx)
    
    if first_prize != "PENDING":
        idx = re.sub(r'[A-Z]{2} \d{6}|PENDING', first_prize, idx)
        ticker_new = f"LIVE: {name} {draw_code} Result Out | 1st Prize {first_prize} | Updated {today} 3 PM | Check your numbers now!"
    else:
        idx = re.sub(r'[A-Z]{2} \d{6}', 'PENDING', idx)
        ticker_new = f"AWAITING: {name} {draw_code} draw happening now | Check back at 3:15 PM for live updates!"
        
    idx = re.sub(r'(?:LIVE|AWAITING):.*?Check (?:your numbers now!|back at 3:15 PM for live updates!)', ticker_new, idx, flags=re.DOTALL)
    
    write("index.html", idx)
except FileNotFoundError:
    print("❌ ERROR: index.html not found")
    sys.exit(1)

print(f"🎉 Success! Processed {name} {draw_code} | Prize: {first_prize}")
