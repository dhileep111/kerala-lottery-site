"""
update_results.py  —  Kerala Ticket Results
--------------------------------------------
Called by GitHub Actions (manual_updater.yml).

Manual:    python update_results.py <slug> <draw_code> <first_prize> [full_results]
Scheduled: python update_results.py   (env GITHUB_EVENT_NAME=schedule)

full_results format (newline or ' / ' separated):
  1st:KN 844574
  consolation:RA 844574,RB 844574,RC 844574
  2nd:KU 399061
  3rd:AB 123456
  4th:1234,5678,9012
  5th:0123,4567
  6th:0001,0002,0003
  7th:1111,2222
  8th:9999,8888
"""

import json, os, re, sys, urllib.request
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR       = Path("artifacts/kerala-lottery/src/data")
LOTTERIES_PATH = DATA_DIR / "lotteries.json"
RESULTS_PATH   = DATA_DIR / "results.json"

# ── Per-lottery correct prize amounts (2026) ──────────────
LOTTERY_PRIZES = {
    "karunya": [
        {"tier": "1st Prize",        "amount": "₹1,00,00,000"},
        {"tier": "Consolation Prize","amount": "₹5,000"},
        {"tier": "2nd Prize",        "amount": "₹25,00,000"},
        {"tier": "3rd Prize",        "amount": "₹10,00,000"},
        {"tier": "4th Prize",        "amount": "₹5,000"},
        {"tier": "5th Prize",        "amount": "₹2,000"},
        {"tier": "6th Prize",        "amount": "₹1,000"},
        {"tier": "7th Prize",        "amount": "₹500"},
        {"tier": "8th Prize",        "amount": "₹100"},
    ],
    "karunya-plus": [
        {"tier": "1st Prize",        "amount": "₹1,00,00,000"},
        {"tier": "Consolation Prize","amount": "₹5,000"},
        {"tier": "2nd Prize",        "amount": "₹30,00,000"},
        {"tier": "3rd Prize",        "amount": "₹5,00,000"},
        {"tier": "4th Prize",        "amount": "₹5,000"},
        {"tier": "5th Prize",        "amount": "₹2,000"},
        {"tier": "6th Prize",        "amount": "₹1,000"},
        {"tier": "7th Prize",        "amount": "₹500"},
        {"tier": "8th Prize",        "amount": "₹100"},
    ],
    "sthree-sakthi": [
        {"tier": "1st Prize",        "amount": "₹1,00,00,000"},
        {"tier": "Consolation Prize","amount": "₹5,000"},
        {"tier": "2nd Prize",        "amount": "₹30,00,000"},
        {"tier": "3rd Prize",        "amount": "₹5,00,000"},
        {"tier": "4th Prize",        "amount": "₹5,000"},
        {"tier": "5th Prize",        "amount": "₹2,000"},
        {"tier": "6th Prize",        "amount": "₹1,000"},
        {"tier": "7th Prize",        "amount": "₹500"},
        {"tier": "8th Prize",        "amount": "₹100"},
    ],
    "suvarna-keralam": [
        {"tier": "1st Prize",        "amount": "₹1,00,00,000"},
        {"tier": "Consolation Prize","amount": "₹5,000"},
        {"tier": "2nd Prize",        "amount": "₹30,00,000"},
        {"tier": "3rd Prize",        "amount": "₹5,00,000"},
        {"tier": "4th Prize",        "amount": "₹5,000"},
        {"tier": "5th Prize",        "amount": "₹2,000"},
        {"tier": "6th Prize",        "amount": "₹1,000"},
        {"tier": "7th Prize",        "amount": "₹500"},
        {"tier": "8th Prize",        "amount": "₹100"},
    ],
    "dhanalekshmi": [
        {"tier": "1st Prize",        "amount": "₹1,00,00,000"},
        {"tier": "Consolation Prize","amount": "₹5,000"},
        {"tier": "2nd Prize",        "amount": "₹10,00,000"},
        {"tier": "3rd Prize",        "amount": "₹5,000"},
        {"tier": "4th Prize",        "amount": "₹2,000"},
        {"tier": "5th Prize",        "amount": "₹1,000"},
        {"tier": "6th Prize",        "amount": "₹500"},
        {"tier": "7th Prize",        "amount": "₹200"},
        {"tier": "8th Prize",        "amount": "₹100"},
    ],
    "bhagyathara": [
        {"tier": "1st Prize",        "amount": "₹1,00,00,000"},
        {"tier": "Consolation Prize","amount": "₹5,000"},
        {"tier": "2nd Prize",        "amount": "₹10,00,000"},
        {"tier": "3rd Prize",        "amount": "₹5,000"},
        {"tier": "4th Prize",        "amount": "₹2,000"},
        {"tier": "5th Prize",        "amount": "₹1,000"},
        {"tier": "6th Prize",        "amount": "₹500"},
        {"tier": "7th Prize",        "amount": "₹200"},
        {"tier": "8th Prize",        "amount": "₹100"},
    ],
    "samrudhi": [
        {"tier": "1st Prize",        "amount": "₹1,00,00,000"},
        {"tier": "Consolation Prize","amount": "₹5,000"},
        {"tier": "2nd Prize",        "amount": "₹10,00,000"},
        {"tier": "3rd Prize",        "amount": "₹5,000"},
        {"tier": "4th Prize",        "amount": "₹2,000"},
        {"tier": "5th Prize",        "amount": "₹1,000"},
        {"tier": "6th Prize",        "amount": "₹500"},
        {"tier": "7th Prize",        "amount": "₹200"},
        {"tier": "8th Prize",        "amount": "₹100"},
    ],
}

TIER_MAP = {
    "1st":"1st Prize","first":"1st Prize","1":"1st Prize",
    "consolation":"Consolation Prize","cons":"Consolation Prize",
    "2nd":"2nd Prize","second":"2nd Prize","2":"2nd Prize",
    "3rd":"3rd Prize","third":"3rd Prize","3":"3rd Prize",
    "4th":"4th Prize","fourth":"4th Prize","4":"4th Prize",
    "5th":"5th Prize","fifth":"5th Prize","5":"5th Prize",
    "6th":"6th Prize","sixth":"6th Prize","6":"6th Prize",
    "7th":"7th Prize","seventh":"7th Prize","7":"7th Prize",
    "8th":"8th Prize","eighth":"8th Prize","8":"8th Prize",
}

def load_json(p):
    with p.open("r",encoding="utf-8") as f: return json.load(f)

def save_json(p, d):
    with p.open("w",encoding="utf-8") as f:
        json.dump(d,f,ensure_ascii=False,indent=2); f.write("\n")
    print(f"✅ Saved: {p}")

def find_today_lottery(lotteries, python_weekday):
    # lotteries.json: JS day (Sun=0,Mon=1..Sat=6)
    # Python weekday: Mon=0..Sun=6
    # Conversion: js_day = (python_weekday + 1) % 7
    js_day = (python_weekday + 1) % 7
    return next((l for l in lotteries if l.get("drawDayIndex") == js_day), lotteries[0])

def scrape_draw_code(code):
    try:
        req  = urllib.request.Request("https://keralalotteries.net/",headers={"User-Agent":"Mozilla/5.0"})
        html = urllib.request.urlopen(req,timeout=10).read().decode("utf-8",errors="ignore")
        m    = re.search(rf"({re.escape(code)}-\d{{2,4}})",html)
        if m: print(f"✅ Scraped: {m.group(1)}"); return m.group(1)
    except Exception as e: print(f"⚠️ Scrape failed: {e}")
    return f"{code}-XXX"

def get_tiers(slug):
    return LOTTERY_PRIZES.get(slug, LOTTERY_PRIZES["samrudhi"])

def parse_prizes(text, first_prize, slug):
    tiers = get_tiers(slug)
    if not text or not text.strip():
        prizes = []
        for t in tiers:
            nums = [first_prize] if t["tier"]=="1st Prize" and first_prize and first_prize!="PENDING" else []
            prizes.append({"tier":t["tier"],"amount":t["amount"],"numbers":nums})
        return prizes
    parsed = {}
    for line in re.split(r"\n| / ", text):
        line = line.strip()
        if not line or ":" not in line: continue
        key,_,vals = line.partition(":")
        canonical  = TIER_MAP.get(key.strip().lower())
        if not canonical: print(f"⚠️ Unknown key: '{key}'"); continue
        parsed[canonical] = [n.strip() for n in vals.split(",") if n.strip()]
        print(f"  ✓ {canonical}: {parsed[canonical]}")
    prizes = []
    for t in tiers:
        tier = t["tier"]
        nums = parsed.get(tier,[])
        if tier=="1st Prize" and not nums and first_prize and first_prize!="PENDING":
            nums = [first_prize]
        prizes.append({"tier":tier,"amount":t["amount"],"numbers":nums})
    return prizes

def upsert(results, new):
    for i,r in enumerate(results):
        if r["lotterySlug"]==new["lotterySlug"] and r["drawCode"]==new["drawCode"]:
            # Never overwrite a verified result with a pending/live one (e.g. from scheduled run)
            if r.get("status") == "verified" and new.get("status") in ("pending", "live"):
                print(f"⏭️  Skipped: {new['drawCode']} is already verified — will not overwrite with '{new['status']}'.")
                return results
            results[i]=new; print(f"🔄 Updated: {new['drawCode']}"); return results
    print(f"➕ Added: {new['drawCode']}")
    return [new, *results]

def main():
    lotteries    = load_json(LOTTERIES_PATH)
    results      = load_json(RESULTS_PATH)
    manual_lot   = sys.argv[1] if len(sys.argv)>1 else ""
    manual_draw  = sys.argv[2] if len(sys.argv)>2 else ""
    manual_prize = sys.argv[3] if len(sys.argv)>3 else ""
    full_results = sys.argv[4] if len(sys.argv)>4 else ""
    is_scheduled = os.environ.get("GITHUB_EVENT_NAME")=="schedule"
    now          = datetime.now(timezone.utc)

    if manual_lot and not is_scheduled:
        lottery = next((l for l in lotteries if l["slug"]==manual_lot),None)
        if not lottery: raise SystemExit(f"❌ Unknown slug: '{manual_lot}'")
        print(f"🚀 Manual: {lottery['name']}")
        draw_code   = (manual_draw or f"{lottery['code']}-XXX").strip()  # strip accidental spaces
        first_prize = manual_prize or "PENDING"
    else:
        lottery     = find_today_lottery(lotteries, now.weekday())
        print(f"🤖 Scheduled: {lottery['name']}")
        draw_code   = scrape_draw_code(lottery["code"])
        first_prize = "PENDING"
        full_results= ""

    slug   = lottery["slug"]
    prizes = parse_prizes(full_results, first_prize, slug)
    filled = sum(1 for p in prizes if p["numbers"])
    status = "verified" if filled>=8 else ("live" if filled>=1 else "pending")

    result = {
        "lotterySlug": slug,
        "drawCode":    draw_code,
        "drawDate":    now.strftime("%Y-%m-%d"),
        "displayDate": now.strftime("%B %d, %Y"),
        "status":      status,
        "sourceName":  "Manual admin update" if manual_prize else "Awaiting official publication",
        "sourceUrl":   "https://statelottery.kerala.gov.in/",
        "lastUpdated": now.isoformat().replace("+00:00","Z"),
        "summary":     f"Result for {lottery['name']} {draw_code}. {filled}/9 tiers updated.",
        "prizes":      prizes,
    }

    save_json(RESULTS_PATH, upsert(results, result))
    print(f"\n🎉 {lottery['name']} {draw_code} | Prize: {first_prize} | Tiers: {filled}/9")

if __name__=="__main__":
    main()
