#!/usr/bin/env python3
"""
Laya quick-take verdicts for compare pages.

Reads public/data/compare-pairs.json (written by scripts/export-compare-pairs.ts)
plus public/data/trending-summary.json, runs the Laya decision engine
(choice: A / B / tie) for each pair, and writes public/data/laya-verdicts.json.

Keyed by "ownerA/nameA|ownerB/nameB" (both lowercase, sorted) so the compare page
can look the pair up in either order.

Soft-fail by design: any error exits 0 with no output file, so the ETL data
commit still proceeds. The compare page hides the quick-take section when no
verdict exists.
"""
import json
import os
import sys
import traceback

PAIRS_PATH = os.path.join("public", "data", "compare-pairs.json")
DATA_PATH = os.path.join("public", "data", "trending-summary.json")
OUT_PATH = os.path.join("public", "data", "laya-verdicts.json")


def repo_state(r: dict, label: str) -> str:
    return (
        f"Repo {label}: {r['fullName']} — {r.get('description') or 'No description'}. "
        f"{r['totalStars']:,} stars, +{r['starsGainedToday']:,} today, "
        f"+{r['starsGainedWeek']:,} this week, velocity {r.get('velocityScore', 0):.1f}, "
        f"{r.get('forksCount', 0):,} forks, {r.get('openIssuesCount', 0):,} open issues, "
        f"language {r.get('language') or 'Unknown'}, anomaly status {r.get('anomalyStatus', 'NORMAL')}."
    )


def deciding_factors(a: dict, b: dict) -> str:
    """Deterministic, data-driven note — Laya makes the pick, the numbers explain it."""
    facts = []
    if a["starsGainedToday"] != b["starsGainedToday"]:
        w = a if a["starsGainedToday"] > b["starsGainedToday"] else b
        l = b if w is a else a
        facts.append(f"stars today (+{w['starsGainedToday']:,} vs +{l['starsGainedToday']:,})")
    va, vb = a.get("velocityScore", 0), b.get("velocityScore", 0)
    if abs(va - vb) >= 1:
        w, l = (a, b) if va > vb else (b, a)
        facts.append(f"velocity ({w.get('velocityScore', 0):.1f} vs {l.get('velocityScore', 0):.1f})")
    if a["totalStars"] != b["totalStars"]:
        w = a if a["totalStars"] > b["totalStars"] else b
        l = b if w is a else a
        facts.append(f"total stars ({w['totalStars']:,} vs {l['totalStars']:,})")
    if not facts:
        return "The numbers are nearly identical."
    return "Deciding factors: " + ", ".join(facts[:2]) + "."


def main() -> int:
    try:
        with open(PAIRS_PATH) as f:
            pairs = json.load(f)
        with open(DATA_PATH) as f:
            dataset = json.load(f)
    except FileNotFoundError as e:
        print(f"[laya-verdicts] input missing, skipping: {e}")
        return 0
    if not pairs:
        print("[laya-verdicts] no pairs, skipping")
        return 0

    by_name = {r["fullName"].lower(): r for r in dataset.get("repositories", [])}

    try:
        from laya import Router

        router = Router()
    except Exception:
        print("[laya-verdicts] failed to load Laya, skipping")
        traceback.print_exc()
        return 0

    out: dict = {}
    for full_a, full_b in pairs:
        a = by_name.get(full_a.lower())
        b = by_name.get(full_b.lower())
        if not a or not b or a["fullName"].lower() == b["fullName"].lower():
            continue
        # Sort for a canonical key; remember display order for the pick label.
        first, second = sorted([a, b], key=lambda r: r["fullName"].lower())
        state = (
            "Two open-source repositories. Decide which one a developer should try "
            "FIRST for a new project, weighing star momentum, maintenance signals and "
            "overall trust together.\n\n"
            + repo_state(first, "A")
            + "\n"
            + repo_state(second, "B")
        )
        q = {
            "pick": {
                "type": "choice",
                "instructions": (
                    "Which repo should a developer try FIRST for a new project? "
                    "Answer A, B, or tie if too close to call."
                ),
                "criteria": {
                    "A": first["fullName"],
                    "B": second["fullName"],
                    "tie": "Too close to call",
                },
            }
        }
        try:
            r = router.predict(state, q)
            ans = r["answers"]["pick"]
        except Exception:
            print(f"[laya-verdicts] predict failed for {full_a} vs {full_b}, skipping pair")
            traceback.print_exc()
            continue
        key = f"{first['fullName'].lower()}|{second['fullName'].lower()}"
        out[key] = {
            "pick": ans["choice"],
            "confidence": round(float(ans.get("answer_confidence", 0)), 4),
            "note": deciding_factors(a, b),
            "computedAt": dataset.get("updatedAt"),
        }

    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2)
    print(f"[laya-verdicts] wrote {len(out)} verdicts -> {OUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
