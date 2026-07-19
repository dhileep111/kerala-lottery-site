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


def apply_boards(A, B, C):
    data = load_json(GUESSING_PATH)
    combo_map = {
        "AB Combo": A + B, "BC Combo": B + C, "CA Combo": C + A,
        "ABC Three Digit": A + B + C, "BCA Three Digit": B + C + A, "CAB Three Digit": C + A + B,
        "Hot Pick": A + A + B + C, "Mirror Pick": B + B + C + A, "Pattern Pick": C + C + A + B,
        "Lucky Combo": A + B + C + A, "Reverse Pick": C + B + A + C, "Sequential": C + B + C + A,
        "Zero Start": "0" + A + B + C, "Double AB": A + B + A + B, "Double BC": B + C + B + C,
    }
    data["boards"]["A"] = A
    data["boards"]["B"] = B
    data["boards"]["C"] = C
    today = datetime.date.today()
    data["updatedDate"] = today.strftime("%Y-%m-%d")
    data["updatedLabel"] = f"{today.strftime('%B')} {today.day}, {today.year}"
    for item in data["numbers"]:
        if item["label"] in combo_map:
            item["value"] = combo_map[item["label"]]
        elif item["label"] == "A Board":
            item["value"] = A
        elif item["label"] == "B Board":
            item["value"] = B
        elif item["label"] == "C Board":
            item["value"] = C
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
