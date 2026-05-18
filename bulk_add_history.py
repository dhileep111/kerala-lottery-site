"""
bulk_add_history.py
-------------------
Adds historical draw entries (status: pending) for all Kerala lotteries
without overwriting existing results that already have real data.

Usage:
  python bulk_add_history.py

Run from the ROOT of your repo (kerala-lottery-site/).
Writes to: artifacts/kerala-lottery/src/data/results.json

FIXES vs previous version:
  1. drawDayIndex convention: lotteries.json uses JS day (Sun=0, Mon=1...Sat=6)
     but Python's last_weekday() needs Python weekday (Mon=0...Sun=6).
     Conversion: python_dow = (drawDayIndex - 1) % 7
  2. Prize amounts corrected to match actual Kerala lottery 2026 structure.
  3. Per-lottery prize amounts (Karunya has different 2nd/3rd vs others).
"""

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

# ── Config ────────────────────────────────────────────────
DATA_DIR     = Path("artifacts/kerala-lottery/src/data")
RESULTS_PATH = DATA_DIR / "results.json"
SITE_URL     = "https://statelottery.kerala.gov.in/"
WEEKS_BACK   = 20  # how many past weeks to generate per lottery

# ── Lottery definitions ───────────────────────────────────
# drawDayIndex: JS convention — Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
# latestNumber: most recent draw number as of May 2026 — update when running again
LOTTERIES = [
    {
        "slug": "bhagyathara",    "code": "BT", "drawDayIndex": 1,
        "latestNumber": 629,
        "firstPrizeAmount": "₹1,00,00,000",
        "prizes": {
            "2nd": "₹10,00,000", "3rd": "₹5,000",
            "4th": "₹2,000",    "5th": "₹1,000",
            "6th": "₹500",      "7th": "₹200", "8th": "₹100",
        },
    },
    {
        "slug": "sthree-sakthi",  "code": "SS", "drawDayIndex": 2,
        "latestNumber": 519,
        "firstPrizeAmount": "₹1,00,00,000",
        "prizes": {
            "2nd": "₹30,00,000", "3rd": "₹5,00,000",
            "4th": "₹5,000",    "5th": "₹2,000",
            "6th": "₹1,000",    "7th": "₹500", "8th": "₹100",
        },
    },
    {
        "slug": "dhanalekshmi",   "code": "DL", "drawDayIndex": 3,
        "latestNumber": 52,
        "firstPrizeAmount": "₹1,00,00,000",
        "prizes": {
            "2nd": "₹10,00,000", "3rd": "₹5,000",
            "4th": "₹2,000",    "5th": "₹1,000",
            "6th": "₹500",      "7th": "₹200", "8th": "₹100",
        },
    },
    {
        "slug": "karunya-plus",   "code": "KN", "drawDayIndex": 4,
        "latestNumber": 632,
        "firstPrizeAmount": "₹1,00,00,000",
        "prizes": {
            "2nd": "₹30,00,000", "3rd": "₹5,00,000",
            "4th": "₹5,000",    "5th": "₹2,000",
            "6th": "₹1,000",    "7th": "₹500", "8th": "₹100",
        },
    },
    {
        "slug": "suvarna-keralam", "code": "SK", "drawDayIndex": 5,
        "latestNumber": 52,
        "firstPrizeAmount": "₹1,00,00,000",
        "prizes": {
            "2nd": "₹30,00,000", "3rd": "₹5,00,000",
            "4th": "₹5,000",    "5th": "₹2,000",
            "6th": "₹1,000",    "7th": "₹500", "8th": "₹100",
        },
    },
    {
        "slug": "karunya",        "code": "KR", "drawDayIndex": 6,
        "latestNumber": 753,
        "firstPrizeAmount": "₹1,00,00,000",
        "prizes": {
            "2nd": "₹25,00,000", "3rd": "₹10,00,000",
            "4th": "₹5,000",    "5th": "₹2,000",
            "6th": "₹1,000",    "7th": "₹500", "8th": "₹100",
        },
    },
    {
        "slug": "samrudhi",       "code": "SM", "drawDayIndex": 0,
        "latestNumber": 52,
        "firstPrizeAmount": "₹1,00,00,000",
        "prizes": {
            "2nd": "₹10,00,000", "3rd": "₹5,000",
            "4th": "₹2,000",    "5th": "₹1,000",
            "6th": "₹500",      "7th": "₹200", "8th": "₹100",
        },
    },
]


def make_prizes(lottery):
    """Build 9-tier prize array with correct amounts per lottery."""
    p = lottery["prizes"]
    return [
        {"tier": "1st Prize",         "amount": lottery["firstPrizeAmount"], "numbers": []},
        {"tier": "Consolation Prize",  "amount": "₹5,000",                  "numbers": []},
        {"tier": "2nd Prize",          "amount": p["2nd"],                   "numbers": []},
        {"tier": "3rd Prize",          "amount": p["3rd"],                   "numbers": []},
        {"tier": "4th Prize",          "amount": p["4th"],                   "numbers": []},
        {"tier": "5th Prize",          "amount": p["5th"],                   "numbers": []},
        {"tier": "6th Prize",          "amount": p["6th"],                   "numbers": []},
        {"tier": "7th Prize",          "amount": p["7th"],                   "numbers": []},
        {"tier": "8th Prize",          "amount": p["8th"],                   "numbers": []},
    ]


def js_day_to_python_weekday(js_day):
    """
    Convert lotteries.json drawDayIndex (JS: Sun=0, Mon=1...Sat=6)
    to Python weekday (Mon=0, Tue=1...Sun=6).
    """
    return (js_day - 1) % 7


def last_weekday_on_or_before(ref_date, python_weekday):
    """Return the most recent date <= ref_date that falls on python_weekday."""
    days_behind = (ref_date.weekday() - python_weekday) % 7
    return ref_date - timedelta(days=days_behind)


def existing_keys(results):
    return {(r["lotterySlug"], r["drawCode"]) for r in results}


def main():
    results = json.loads(RESULTS_PATH.read_text(encoding="utf-8"))
    keys    = existing_keys(results)
    today   = datetime.now(timezone.utc).date()
    added   = 0
    updated = 0
    new_entries = []

    for lottery in LOTTERIES:
        slug       = lottery["slug"]
        code       = lottery["code"]
        python_dow = js_day_to_python_weekday(lottery["drawDayIndex"])
        latest_num = lottery["latestNumber"]

        # Find the most recent draw date for this lottery
        latest_draw_date = last_weekday_on_or_before(today, python_dow)

        for week in range(WEEKS_BACK):
            draw_date   = latest_draw_date - timedelta(weeks=week)
            draw_number = latest_num - week
            if draw_number <= 0:
                break

            draw_code = f"{code}-{draw_number}"
            key       = (slug, draw_code)

            if key in keys:
                # Update existing pending entry with correct prize amounts
                for r in results:
                    if r["lotterySlug"] == slug and r["drawCode"] == draw_code:
                        if r["status"] == "pending":
                            r["prizes"] = make_prizes(lottery)
                            updated += 1
                continue

            draw_dt = datetime(
                draw_date.year, draw_date.month, draw_date.day,
                9, 0, 0, tzinfo=timezone.utc
            )

            entry = {
                "lotterySlug": slug,
                "drawCode":    draw_code,
                "drawDate":    draw_date.isoformat(),
                "displayDate": draw_date.strftime("%B %d, %Y"),
                "status":      "pending",
                "sourceName":  "Awaiting official publication",
                "sourceUrl":   SITE_URL,
                "lastUpdated": draw_dt.isoformat().replace("+00:00", "Z"),
                "summary":     f"Historical record for {slug.replace('-', ' ').title()} {draw_code}.",
                "prizes":      make_prizes(lottery),
            }
            new_entries.append(entry)
            keys.add(key)
            added += 1

    # Merge and sort descending by drawDate then lastUpdated
    all_results = new_entries + results
    all_results.sort(
        key=lambda r: (r["drawDate"], r["lastUpdated"]),
        reverse=True
    )

    RESULTS_PATH.write_text(
        json.dumps(all_results, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"\n✅ Done!")
    print(f"   Added:   {added} new historical entries")
    print(f"   Updated: {updated} existing pending entries (prize amounts fixed)")
    print(f"   Total:   {len(all_results)} results in JSON")
    print()
    for lottery in LOTTERIES:
        count = sum(1 for r in all_results if r["lotterySlug"] == lottery["slug"])
        live  = sum(1 for r in all_results if r["lotterySlug"] == lottery["slug"] and r["status"] != "pending")
        print(f"   {lottery['slug']:20} {count:3} entries  ({live} with real data)")


if __name__ == "__main__":
    main()
