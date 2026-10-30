#!/usr/bin/env python3
"""List hard AMC-style questions from the Vantee quiz bank that have no video yet.

Usage:
  pick_question.py [--contest amc8|amc10] [--min-difficulty 4] [--figure] [--limit 15]
  pick_question.py --show <bank>:<id>      # full question JSON
"""
import argparse
import json
import os
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
BANKS = Path(os.environ.get("VNT_REPO", "/home/brad/code/vnt")) / "priv/quiz_banks"


def used_keys():
    keys = set()
    for meta in (ROOT / "videos").glob("*/meta.json"):
        keys.add(json.loads(meta.read_text()).get("question_id"))
    return keys


def load(contest):
    for f in sorted(BANKS.glob(f"amc_practice_{contest or 'amc*'}_*.json")):
        if contest == "amc8" and "amc10" in f.name:
            continue
        for q in json.loads(f.read_text())["questions"]:
            yield f.stem, q


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--contest", choices=["amc8", "amc10"])
    p.add_argument("--min-difficulty", type=int, default=4)
    p.add_argument("--figure", action="store_true", help="only questions with an SVG figure")
    p.add_argument("--limit", type=int, default=15)
    p.add_argument("--show")
    a = p.parse_args()

    if a.show:
        bank, qid = a.show.split(":")
        q = next(q for q in json.loads((BANKS / f"{bank}.json").read_text())["questions"] if q["id"] == qid)
        print(json.dumps(q, indent=1, ensure_ascii=False))
        return

    used = used_keys()
    # ponytail: mock_test/mixed banks overlap topics with the per-topic banks; dedupe by prompt text
    seen, pool = set(), []
    for bank, q in load(a.contest):
        if q["difficulty"] < a.min_difficulty or f"{bank}:{q['id']}" in used or q["prompt"] in seen:
            continue
        if a.figure and "figure" not in q:
            continue
        seen.add(q["prompt"])
        pool.append((bank, q))
    print(f"{len(pool)} unused questions match; showing {min(a.limit, len(pool))} at random\n")
    for bank, q in random.sample(pool, min(a.limit, len(pool))):
        fig = " [figure]" if "figure" in q else ""
        print(f"{bank}:{q['id']}  d{q['difficulty']}  {q['metadata'].get('concept')}{fig}")
        print(f"    {q['prompt'][:200]}\n")


if __name__ == "__main__":
    main()
