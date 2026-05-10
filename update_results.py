import sys
import re
import urllib.request
from bs4 import BeautifulSoup
from datetime import datetime

# ── Lottery Config & Weekday Mapping ─────────────────────
LOTTERY_CONFIG = {
    "dhanalekshmi":   {"name": "Dhanalekshmi", "code": "DL", "prize1": "₹70,00,000",  "day": 0}, # Monday
    "sthree-sakthi":  {"name": "Sthree Sakthi","code": "SS", "prize1": "₹75,00,000",  "day": 1}, # Tuesday
    "bhagyathara":    {"name": "Bhagyathara",  "code": "BT", "prize1": "₹70,00,000",  "day": 2}, # Wednesday
    "karunya-plus":   {"name": "Karunya Plus", "code": "KN", "prize1": "₹1,00,00,000", "day": 3}, # Thursday
    "samrudhi":       {"name": "Samrudhi",     "code": "SM", "prize1": "₹1,00,00,000", "day": 4}, # Friday
    "karunya":        {"name": "Karunya",      "code": "KR", "prize1": "₹1,00,00,000", "day": 5}, # Saturday
    "suvarna-keralam":{"name": "Suvarna Keralam","code":"SK", "prize1": "₹1,00,00,000", "day": 6}, # Sunday
}

# Find which lottery corresponds to today
today_dt = datetime.now()
weekday_idx = today_dt.weekday()
auto_lottery = [k for k, v in LOTTERY_CONFIG.items() if v["day"] == weekday_idx][0]

# ── Check Inputs (Manual vs Cron Auto-Run) ───────────────
# GitHub Actions passes empty strings "" if fields are left blank during scheduled cron
manual_lottery = sys.argv[1] if len(sys.argv) > 1 else ""
manual_draw    = sys.argv[2] if len(sys.argv) > 2 else ""
manual_prize   = sys.argv[3] if len(sys.argv) > 3 else ""

if manual_lottery and manual_draw and manual_prize:
    print("🚀 MANUAL MODE DETECTED: Applying exact winning numbers.")
    lottery_page = manual_lottery
    draw_code = manual_draw
    first_prize = manual_prize
    status_badge = '<span class="badge badge-live">LIVE</span>'
else:
    print(f"🤖 AUTO MODE DETECTED: Setting up today's {LOTTERY_CONFIG[auto_lottery]['name']} draw.")
    lottery_page = auto_lottery
    code = LOTTERY_CONFIG[lottery_page]['code']
    draw_code = f"{code}-XXX"
    first_prize = "PENDING"
    status_badge = '<span class="badge badge-pending">PENDING</span>'
    
    # --- ATTEMPT BASIC SCRAPING ---
    try:
        req = urllib.request.Request('https://keralalotteries.net/', headers={'User-Agent': 'Mozilla/5.0'})
        html_content = urllib.request.urlopen(req, timeout=10).read()
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Look for today's draw code format (e.g., KR-753)
        page_text = soup.get_text()
        draw_match = re.search(rf'({code}-\d{{3,4}})', page_text)
        if draw_match:
            draw_code = draw_match.group(1)
            print(f"✅ Auto-scraped today's Draw Code: {draw_code}")
    except Exception as e:
        print(f"⚠️ Scraping bypassed or failed: {e}. Using placeholders.")

# ── Date Formatting ──────────────────────────────────────
today         = today_dt.strftime("%d %B %Y")   # e.g., "09 May 2026"
today_short   = today_dt.strftime("%B %d, %Y")  # e.g., "May 09, 2026"

cfg  = LOTTERY_CONFIG.get(lottery_page, {})
name = cfg.get("name", lottery_page.title())

# ── Helper Functions ─────────────────────────────────────
def read(path):
    with open(path, "r", encoding="utf-8") as f: return f.read()

def write(path, content):
    with open(path, "w", encoding="utf-8") as f: f.write(content)
    print(f"✅ Saved: {path}")

# ── 1. Update the Specific Lottery HTML Page ─────────────
page_file = f"{lottery_page}.html"
try:
    html = read(page_file)
    
    # Update badges
    html = re.sub(r'<span class="badge.*?</span>', status_badge, html, count=1)
    
    # Update Draw Codes & Dates
    html = re.sub(r'[A-Z]{2}-\d{3,4}|[A-Z]{2}-XXX', draw_code, html)
    html = re.sub(r'[A-Z][a-z]+ \d{2}, \d{4}', today_short, html) 
    html = re.sub(r'\d{2} [A-Z][a-z]+ \d{4}', today, html)
    
    # Update 1st Prize if provided
    if first_prize != "PENDING":
        html = re.sub(r'[A-Z]{2} \d{6}|PENDING', first_prize, html)
    else:
        # Reset to pending if running automatically
        html = re.sub(r'[A-Z]{2} \d{6}', 'PENDING', html)
        
    write(page_file, html)
except FileNotFoundError:
    print(f"❌ ERROR: {page_file} not found.")
    sys.exit(1)

# ── 2. Update the Index Homepage ─────────────────────────
try:
    idx = read("index.html")
    
    # Update Header
    idx = re.sub(r'[A-Z]{2}-\d{3,4}|[A-Z]{2}-XXX', draw_code, idx)
    idx = re.sub(r'[A-Z][a-z]+ \d{2}, \d{4}', today_short, idx)
    idx = re.sub(r'\d{2} [A-Z][a-z]+ \d{4}', today, idx)
    idx = re.sub(r'Karunya KR-\w+|Sthree Sakthi SS-\w+|Karunya Plus KN-\w+|Dhanalekshmi DL-\w+|Bhagyathara BT-\w+|Samrudhi SM-\w+|Suvarna Keralam SK-\w+', f"{name} {draw_code}", idx)
    
    # Dynamic Breaking Ticker
    if first_prize != "PENDING":
        idx = re.sub(r'[A-Z]{2} \d{6}|PENDING', first_prize, idx)
        ticker_new = f"LIVE: {name} {draw_code} Result Out | 1st Prize {first_prize} | Updated {today} 3 PM | Check your numbers now!"
    else:
        # Wipe old first prize to pending
        idx = re.sub(r'[A-Z]{2} \d{6}', 'PENDING', idx)
        ticker_new = f"AWAITING: {name} {draw_code} draw happening now | Check back at 3:15 PM for live updates!"
        
    idx = re.sub(r'(?:LIVE|AWAITING):.*?Check (?:your numbers now!|back at 3:15 PM for live updates!)', ticker_new, idx, flags=re.DOTALL)
    
    write("index.html", idx)
except FileNotFoundError:
    print("❌ ERROR: index.html not found")
    sys.exit(1)

print(f"🎉 Success! Processed {name} {draw_code} | Prize: {first_prize}")
