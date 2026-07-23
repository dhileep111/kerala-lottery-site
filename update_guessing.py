"""
update_guessing.py — Kerala Ticket Results
--------------------------------------------
Keeps guessing-numbers.json fresh every day with zero manual input.

If GUESS_A/GUESS_B/GUESS_C env vars are all set, those boards are used as-is
(manual override — e.g. from manual_updater.yml's optional workflow inputs).
Otherwise the boards are auto-derived from the most recently VERIFIED result's
1st-prize ticket number, so every result update also refreshes the guessing
page automatically — no separate manual entry required.

Entertainment only: the derivation is a fixed, explainable arithmetic pattern
on yesterday's winning ticket, not a prediction of anything. The page's own
disclaimer covers this; this script does not change that framing.
"""

import json, os, re, datetime
from pathlib import Path

DATA_DIR      = Path("artifacts/kerala-lottery/src/data")
RESULTS_PATH  = DATA_DIR / "results.json"
GUESSING_PATH = DATA_DIR / "guessing-numbers.json"


def load_json(p):
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(p, d):
    with p.open("w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"✅ Saved: {p}")


def extract_ticket_digits(entry):
    """entry is either a plain 'KV 877888' string or a JSON-encoded
    '{"ticket":"KV 877888","district":"..."}' string. Returns the 6 ticket
    digits, or None if there aren't enough to work with."""
    if not entry:
        return None
    s = str(entry)
    if s.startswith("{"):
        try:
            s = json.loads(s).get("ticket", "")
        except Exception:
            pass
    digits = re.sub(r"\D", "", s)
    return digits[-6:] if len(digits) >= 6 else None


def derive_boards():
    results = load_json(RESULTS_PATH)
    candidates = sorted(
        (r for r in results if r.get("status") == "verified"),
        key=lambda r: (r.get("drawDate", ""), r.get("lastUpdated", "")),
        reverse=True,
    )
    for r in candidates:
        first = next((p for p in r.get("prizes", []) if p["tier"] == "1st Prize"), None)
        if not first or not first.get("numbers"):
            continue
        digits = extract_ticket_digits(first["numbers"][0])
        if not digits:
            continue
        d = [int(c) for c in digits]
        A = str((d[0] + d[3]) % 10)
        B = str((d[1] + d[4]) % 10)
        C = str((d[2] + d[5]) % 10)
        return A, B, C, r["drawCode"]
    # No verified result exists anywhere yet — should only happen on a brand-new repo.
    return "0", "0", "0", None


# Fixed template — labels/types/digits never change day to day, only values do.
NUMBER_TEMPLATE = [
    (1, "A Board", "board"), (1, "B Board", "board"), (1, "C Board", "board"),
    (2, "AB Combo", "combo"), (2, "BC Combo", "combo"), (2, "CA Combo", "combo"),
    (3, "ABC Three Digit", "triple"), (3, "BCA Three Digit", "triple"), (3, "CAB Three Digit", "triple"),
    (4, "Hot Pick", "four"), (4, "Mirror Pick", "four"), (4, "Pattern Pick", "four"),
    (4, "Lucky Combo", "four"), (4, "Reverse Pick", "four"), (4, "Sequential", "four"),
    (4, "Zero Start", "four"), (4, "Double AB", "four"), (4, "Double BC", "four"),
]
HOT_LABELS = {"Hot Pick", "Lucky Combo"}


def build_numbers(A, B, C):
    combo_map = {
        "AB Combo": A + B, "BC Combo": B + C, "CA Combo": C + A,
        "ABC Three Digit": A + B + C, "BCA Three Digit": B + C + A, "CAB Three Digit": C + A + B,
        "Hot Pick": A + A + B + C, "Mirror Pick": B + B + C + A, "Pattern Pick": C + C + A + B,
        "Lucky Combo": A + B + C + A, "Reverse Pick": C + B + A + C, "Sequential": C + B + C + A,
        "Zero Start": "0" + A + B + C, "Double AB": A + B + A + B, "Double BC": B + C + B + C,
        "A Board": A, "B Board": B, "C Board": C,
    }
    numbers = []
    for digits, label, type_ in NUMBER_TEMPLATE:
        item = {"digits": digits, "label": label, "value": combo_map[label], "type": type_}
        if label in HOT_LABELS:
            item["hot"] = True
        numbers.append(item)
    return numbers


def apply_boards(A, B, C):
    data = load_json(GUESSING_PATH)
    history = data.setdefault("history", [])
    today = datetime.date.today()
    date_str = today.strftime("%Y-%m-%d")
    entry = {
        "date": date_str,
        "displayLabel": f"{today.strftime('%B')} {today.day}, {today.year}",
        "boards": {"A": A, "B": B, "C": C},
        "numbers": build_numbers(A, B, C),
    }
    if history and history[0].get("date") == date_str:
        # Re-run on the same day (e.g. a later result update) — replace, don't duplicate.
        history[0] = entry
    else:
        history.insert(0, entry)
    save_json(GUESSING_PATH, data)


def main():
    A = os.environ.get("GUESS_A", "").strip()
    B = os.environ.get("GUESS_B", "").strip()
    C = os.environ.get("GUESS_C", "").strip()
    if A and B and C:
        print(f"Manual boards: A={A} B={B} C={C}")
        apply_boards(A, B, C)
        return
    A, B, C, source = derive_boards()
    if source:
        print(f"Auto-derived boards from {source}: A={A} B={B} C={C}")
    else:
        print("⚠️ No verified result found to derive boards from — left at fallback 0/0/0")
    apply_boards(A, B, C)


if __name__ == "__main__":
    main()
