import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR = Path("data")
LOTTERIES_PATH = DATA_DIR / "lotteries.json"
RESULTS_PATH = DATA_DIR / "results.json"


def load_json(path):
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_json(path, payload):
    with path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)
        file.write("\n")
    print(f"✅ Saved structured data: {path}")


def find_today_lottery(lotteries, weekday_index):
    # Python weekday(): Monday=0. JSON drawDayIndex follows JS: Sunday=0, Monday=1.
    js_day = (weekday_index + 1) % 7
    return next((lottery for lottery in lotteries if lottery.get("drawDayIndex") == js_day), lotteries[0])


def scrape_draw_code(code):
    try:
        req = urllib.request.Request("https://keralalotteries.net/", headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")
        match = re.search(rf"({re.escape(code)}-\d{{2,4}})", html)
        if match:
            print(f"✅ Auto-scraped draw code: {match.group(1)}")
            return match.group(1)
    except Exception as exc:
        print(f"⚠️ Scrape skipped/failed: {exc}")
    return f"{code}-XXX"


def build_default_prizes(first_amount, first_prize):
    return [
        {"tier": "1st Prize", "amount": first_amount, "numbers": [] if first_prize == "PENDING" else [first_prize]},
        {"tier": "2nd Prize", "amount": "₹5,00,000", "numbers": []},
        {"tier": "3rd Prize", "amount": "₹1,00,000", "numbers": []},
        {"tier": "Consolation Prize", "amount": "₹5,000", "numbers": [] if first_prize == "PENDING" else [first_prize]},
    ]


def upsert_result(results, result):
    for index, existing in enumerate(results):
        if existing["lotterySlug"] == result["lotterySlug"] and existing["drawCode"] == result["drawCode"]:
            results[index] = result
            return results
    return [result, *results]


def main():
    lotteries = load_json(LOTTERIES_PATH)
    results = load_json(RESULTS_PATH)

    manual_lottery = sys.argv[1] if len(sys.argv) > 1 else ""
    manual_draw = sys.argv[2] if len(sys.argv) > 2 else ""
    manual_prize = sys.argv[3] if len(sys.argv) > 3 else ""
    is_scheduled_run = os.environ.get("GITHUB_EVENT_NAME") == "schedule"

    now = datetime.now(timezone.utc)

    if manual_lottery and not is_scheduled_run:
        lottery = next((item for item in lotteries if item["slug"] == manual_lottery), None)
        if not lottery:
            raise SystemExit(f"❌ Unknown lottery slug: {manual_lottery}")
        print(f"🚀 Manual structured-data update for {lottery['name']}.")
        draw_code = manual_draw or f"{lottery['code']}-XXX"
        first_prize = manual_prize or "PENDING"
    else:
        lottery = find_today_lottery(lotteries, now.weekday())
        print(f"🤖 Scheduled structured-data update for {lottery['name']}.")
        draw_code = scrape_draw_code(lottery["code"])
        first_prize = "PENDING"

    status = "live" if first_prize != "PENDING" else "pending"
    result = {
        "lotterySlug": lottery["slug"],
        "drawCode": draw_code,
        "drawDate": now.strftime("%Y-%m-%d"),
        "displayDate": now.strftime("%B %d, %Y"),
        "status": status,
        "sourceName": "Manual admin update" if manual_prize else "Awaiting official publication",
        "sourceUrl": "https://statelottery.kerala.gov.in/",
        "lastUpdated": now.isoformat().replace("+00:00", "Z"),
        "summary": "Manual live update" if manual_prize else "Awaiting official result publication.",
        "prizes": build_default_prizes(lottery["firstPrizeAmount"], first_prize),
    }

    save_json(RESULTS_PATH, upsert_result(results, result))
    print(f"🎉 Success! Updated data for {lottery['name']} {draw_code} | First prize: {first_prize}")


if __name__ == "__main__":
    main()
