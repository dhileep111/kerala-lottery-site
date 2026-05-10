# update_results.py — Kerala Ticket Results updater
# Called by GitHub Actions with 3 arguments:
# python update_results.py karunya "KR-753" "KN 844574"

import sys
import re
from datetime import datetime

# ── Read arguments from GitHub Actions ──────────────────
lottery_page  = sys.argv[1]   # e.g. "karunya"
draw_code     = sys.argv[2]   # e.g. "KR-753"
first_prize   = sys.argv[3]   # e.g. "KN 844574"

# ── Date & time ──────────────────────────────────────────
today         = datetime.now().strftime("%d %B %Y")   # "09 May 2026"
today_iso     = datetime.now().strftime("%Y-%m-%d")   # "2026-05-09"
today_short   = datetime.now().strftime("%B %d, %Y")  # "May 09, 2026"

# ── Lottery config: name, prize amounts ─────────────────
LOTTERY_CONFIG = {
    "karunya":        {"name": "Karunya",       "code": "KR", "prize1": "₹1,00,00,000", "prize2": "₹25,00,000"},
    "karunya-plus":   {"name": "Karunya Plus",  "code": "KN", "prize1": "₹1,00,00,000", "prize2": "₹30,00,000"},
    "sthree-sakthi":  {"name": "Sthree Sakthi","code": "SS", "prize1": "₹75,00,000",  "prize2": "₹10,00,000"},
    "dhanalekshmi":   {"name": "Dhanalekshmi", "code": "DL", "prize1": "₹70,00,000",  "prize2": "₹10,00,000"},
    "bhagyathara":    {"name": "Bhagyathara",  "code": "BT", "prize1": "₹70,00,000",  "prize2": "₹10,00,000"},
    "samrudhi":       {"name": "Samrudhi",     "code": "SM", "prize1": "₹1,00,00,000", "prize2": "₹25,00,000"},
    "suvarna-keralam":{"name": "Suvarna Keralam","code":"SK", "prize1": "₹1,00,00,000", "prize2": "₹30,00,000"},
}

cfg  = LOTTERY_CONFIG.get(lottery_page, {})
name = cfg.get("name", lottery_page.title())
p1   = cfg.get("prize1", "₹1,00,00,000")

# ── Helper: read file ────────────────────────────────────
def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

# ── Helper: write file ───────────────────────────────────
def write(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ Updated: {path}")

# ── Update lottery-specific page ─────────────────────────
page_file = f"{lottery_page}.html"
try:
    html = read(page_file)
    # Replace draw code (KR-XXX → KR-753)
    html = re.sub(r'[A-Z]{2}-XXX', draw_code, html)
    # Replace placeholder ticket number
    html = re.sub(r'KL-123456', first_prize, html)
    # Replace old date
    html = re.sub(r'May \d+, 2026', today_short, html)
    html = re.sub(r'\d+ May 2026', today, html)
    # Replace wrong prize amount
    html = re.sub(r'₹\s*80,00,000', p1, html)
    html = re.sub(r'80,00,000', p1.replace('₹','').strip(), html)
    write(page_file, html)
except FileNotFoundError:
    print(f"❌ ERROR: {page_file} not found in repo")
    sys.exit(1)

# ── Update index.html homepage ───────────────────────────
try:
    idx = read("index.html")
    idx = re.sub(r'[A-Z]{2}-XXX', draw_code, idx)
    idx = re.sub(r'KL-123456', first_prize, idx)
    idx = re.sub(r'May \d+, 2026', today_short, idx)
    idx = re.sub(r'₹\s*80,00,000', p1, idx)
    idx = re.sub(r'Karunya KR-\w+', f"{name} {draw_code}", idx)
    # Update breaking ticker
    ticker_new = (
        f"LIVE: {name} {draw_code} Result Out | "
        f"1st Prize {first_prize} | Updated {today} 3 PM | "
        f"Check your numbers now!"
    )
    idx = re.sub(r'LIVE:.*?Check your numbers now!', ticker_new, idx, flags=re.DOTALL)
    write("index.html", idx)
except FileNotFoundError:
    print("❌ ERROR: index.html not found")
    sys.exit(1)

print(f"🎉 Done! {name} {draw_code} — 1st Prize: {first_prize} — Date: {today}")
