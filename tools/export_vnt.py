#!/usr/bin/env python3
"""Deliver explainer videos to the Vantee app (contract: vnt openspec/changes/quiz-video-explainer/design.md, D1).
Usage: python3 tools/export_vnt.py <vnt repo> [--slug SLUG ...] [--dry-run]
Writes only <vnt>/priv/static/video_explainers/, <vnt>/priv/video_explainers/ and <vnt>/tmp/video_explainers/."""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "videos"
STUDIO = ROOT / "studio"
CJK = re.compile("[぀-ヿ㐀-䶿一-鿿가-힯豈-﫿＀-￯]")
STAGE_EXT = {".mp3", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}


def qualifies(meta):
    """Approved for delivery: ready or published, and not flagged for a fix."""
    status = meta.get("status")
    return status != "fix" and (status == "ready" or bool(meta.get("posts")))


def has_cjk(timeline):
    return any(CJK.search(l.get("caption", "") + l.get("text", "")) for s in timeline["scenes"] for l in s["lines"])


def find_question(bank_dir, question_id):
    bank, _, qid = question_id.partition(":")
    f = Path(bank_dir) / f"{bank}.json"
    if not f.exists():
        return None
    return next((q for q in json.loads(f.read_text()).get("questions", []) if q.get("id") == qid), None)


def explainer_json(slug, meta, timeline, question, brief):
    scenes = [
        {
            "id": s["id"],
            "chapter": s.get("chapter"),
            "from": s["from"],
            "frames": s["frames"],
            "lines": [{"text": l["caption"], "from": s["from"] + l["from"], "frames": l["frames"]} for l in s["lines"]],
        }
        for s in timeline["scenes"]
    ]
    return {
        "slug": slug,
        "question_id": meta["question_id"],
        "prompt_sha256": hashlib.sha256(question["prompt"].encode("utf-8")).hexdigest(),
        "title": meta["title"],
        "fps": timeline["fps"],
        "duration_frames": timeline["durationInFrames"],
        "scenes": scenes,
        "brief": brief,
    }


def dump(obj):
    return json.dumps(obj, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def candidates(explicit):
    slugs = sorted(p.parent.name for p in VIDEOS.glob("*/meta.json"))
    for s in explicit:
        if s not in slugs:
            sys.exit(f"unknown slug {s}")
    return [(s, s in explicit or qualifies(json.loads((VIDEOS / s / "meta.json").read_text()))) for s in slugs]


def check(slug, bank_dir):
    """-> (meta, timeline, question, None) or (..., reason to skip)."""
    meta = json.loads((VIDEOS / slug / "meta.json").read_text())
    tl_file = STUDIO / "public" / slug / "timeline.json"
    if not tl_file.exists() or not (STUDIO / "src/videos" / slug / "Composition.tsx").exists():
        return meta, None, None, "no timeline/composition"
    timeline = json.loads(tl_file.read_text())
    if has_cjk(timeline):
        return meta, timeline, None, "not English"
    q = find_question(bank_dir, meta.get("question_id", ""))
    if q is None:
        return meta, timeline, None, f"question {meta.get('question_id')} not in bank"
    return meta, timeline, q, None


def newer(dst, src):
    return dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime


def stage(slug, timeline, dest):
    """Copy/convert audio and other assets to dest at their staticFile-relative paths. -> count written."""
    public = STUDIO / "public"
    n = 0
    jobs = [public / l["file"] for s in timeline["scenes"] for l in s["lines"]]
    for f in jobs:
        out = dest / f.relative_to(public).with_suffix(".mp3")
        if f.suffix != ".wav" or newer(out, f):
            continue
        out.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(f), "-ac", "1", "-b:a", "64k", str(out)], check=True)
        n += 1
    srcs = [p for p in (public / slug).rglob("*") if p.is_file() and "short" not in p.relative_to(public / slug).parts]
    srcs += [p for p in (public / "brand").rglob("*") if p.is_file() and p.name != "logo.svg"]
    for f in srcs:
        out = dest / f.relative_to(public)
        if f.suffix not in STAGE_EXT or newer(out, f):
            continue
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(f, out)
        n += 1
    return n


def export(vnt, explicit=(), dry_run=False):
    vnt = Path(vnt)
    bank_dir = vnt / "priv/quiz_banks"
    static, priv, tmp = (vnt / "priv/static/video_explainers", vnt / "priv/video_explainers", vnt / "tmp/video_explainers")
    exported, skipped = [], []
    for slug, wanted in candidates(list(explicit)):
        if not wanted:
            continue
        meta, timeline, q, why = check(slug, bank_dir)
        if why:
            skipped.append((slug, why))
            continue
        if dry_run:
            exported.append((slug, None))
            continue
        out = static / slug / "player.min.js"
        out.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["node", "export/build.mjs", slug, str(out)], cwd=STUDIO, check=True)
        brief_f = STUDIO / "src/videos" / slug / "brief.md"
        brief = brief_f.read_text() if brief_f.exists() else None
        (priv / slug).mkdir(parents=True, exist_ok=True)
        (priv / slug / "explainer.json").write_text(dump(explainer_json(slug, meta, timeline, q, brief)))
        staged = stage(slug, timeline, tmp)
        exported.append((slug, (out.stat().st_size, staged)))
    keep = {s for s, _ in exported}
    deleted = []
    for base in (static, priv):
        for d in sorted(base.glob("*")) if base.exists() else []:
            if d.is_dir() and d.name not in keep:
                deleted.append(str(d.relative_to(vnt)))
                if not dry_run:
                    shutil.rmtree(d)
    return exported, skipped, deleted


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("vnt")
    ap.add_argument("--slug", action="append", default=[])
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    exported, skipped, deleted = export(a.vnt, a.slug, a.dry_run)
    print(("DRY RUN\n" if a.dry_run else "") + "exported:")
    for s, info in exported:
        print(f"  {s}" + (f"  bundle {info[0] / 1024:.0f} KB, {info[1]} staged files written" if info else ""))
    print("skipped:")
    for s, why in skipped:
        print(f"  {s}: {why}")
    print("deleted:")
    for d in deleted:
        print(f"  {d}")


if __name__ == "__main__":
    main()
