#!/usr/bin/env python3
"""Narration -> per-line Gemini TTS WAVs + timeline.json + script.md + YouTube chapters.

Usage: tts.py <slug> [--check]   (--check transcribes every line back so misreads show up)
Reads   studio/src/videos/<slug>/narration.json
Writes  studio/public/<slug>/audio/<hash>.wav   (cached: unchanged lines are not re-synthesized)
        studio/public/<slug>/timeline.json      (read by the Remotion composition)
        videos/<slug>/script.md                 (shown on the preview site)
Prints  chapter lines for the YouTube description.
"""
import base64
import difflib
import hashlib
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.request
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
MODEL = "gemini-3.8-flash-tts"
DEFAULT_VOICE = "Achird"  # "Friendly" in the Gemini voice list
DEFAULT_STYLE = "warm and encouraging, speaking at a relaxed pace, no laughing"  # "playful" added laughs
CHECK_MODEL = "gemini-3.8-flash"
LINE_GAP = 0.35    # seconds of silence between lines
SCENE_TAIL = 0.8   # seconds after a scene's last line
# Spellings the TTS reads right. Captions keep the real word. "Van-tee" -> /ˈvæn.ti/ (plain "Vantee" came out "Vansi").
SPOKEN = {"Vantee": "Van-tee"}


def post(path, body):
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/{path}",
        data=json.dumps(body).encode(),
        headers={"x-goog-api-key": os.environ["GOOGLE_API_KEY"], "Content-Type": "application/json"},
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(5 * 2 ** attempt)
                continue
            sys.exit(f"{path} failed ({e.code}): {e.read().decode()[:500]}")


def synth(text, voice, style):
    # Gemini 3.8 TTS (Interactions API): `text` is a verbatim transcript, with inline tags like
    # <short pause>. Delivery goes in the speech_metadata style annotation, never into the text.
    item = {"type": "text", "text": text}
    if style:
        item["annotations"] = [{"type": "speech_metadata", "style": style}]
    resp = post("interactions", {
        "model": MODEL,
        "input": [{"type": "user_input", "content": [item]}],
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": [{"voice": voice}]},
    })
    audio = [c for st in resp["steps"] if st["type"] == "model_output"
             for c in st["content"] if c["type"] == "audio"][-1]["data"]
    return base64.b64decode(audio)  # WAV (RIFF, 24 kHz mono 16-bit)


def transcribe(path):
    resp = post(f"models/{CHECK_MODEL}:generateContent", {"contents": [{"parts": [
        {"inlineData": {"mimeType": "audio/wav", "data": base64.b64encode(path.read_bytes()).decode()}},
        {"text": "Transcribe this audio verbatim. Output only the words spoken, and mark any laughter, giggle or chuckle as [laugh]."},
    ]}]})
    return resp["candidates"][0]["content"]["parts"][0]["text"].strip()


ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def num_words(n):
    """0-999 as words (enough for contest narration)."""
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + num_words(n % 100))


def words(text):
    """Normalized word list for comparing script vs heard: digits -> words, 2x2 -> two by two, % -> percent."""
    t = re.sub(r"<[^>]+>", " ", text.lower())
    t = re.sub(r"(\d)\s*x\s*(\d)", r"\1 by \2", t).replace("%", " percent ").replace("+", " plus ").replace("*", " times ").replace("[laugh]", " LAUGH ")
    t = re.sub(r"\d+", lambda m: " " + num_words(int(m.group())) + " ", t)
    return re.findall(r"[a-z']+|LAUGH", t.replace("neighbour", "neighbor"))


def diff(script, heard):
    """Differences between what the line says and what the TTS said ([] = clean). Vantee's spelling is ignored."""
    a, b = words(script), words(heard)
    out = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if op == "equal" or (op == "replace" and a[i1:i2] == ["vantee"] and j2 - j1 == 1):
            continue
        out.append(f"{' '.join(a[i1:i2]) or '-'} -> {' '.join(b[j1:j2]) or '-'}")
    return out


def wav_seconds(path):
    with wave.open(str(path)) as w:
        return w.getnframes() / w.getframerate()


def spoken(text):
    for word, say in SPOKEN.items():
        text = re.sub(rf"\b{word}\b", say, text)
    return text


def caption(text):
    """Line text without inline TTS tags like <short pause>."""
    return re.sub(r"\s*<[^>]+>\s*", " ", text).strip()


def build_timeline(scenes, audio, fps):
    """audio: line text -> (staticFile path, seconds). Line `from` is relative to its scene."""
    t, out = 0.0, []
    for s in scenes:
        start, lines = t, []
        sf = round(start * fps)
        for text in s.get("lines", []):
            file, secs = audio[text]
            lines.append({"text": text, "caption": caption(text), "file": file, "from": round(t * fps) - sf, "frames": math.ceil(secs * fps)})
            t += secs + LINE_GAP
        if lines:
            t += SCENE_TAIL - LINE_GAP
        t += s.get("hold", 0)
        out.append({"id": s["id"], "kind": s.get("kind", "scene"), "chapter": s.get("chapter"),
                    "from": sf, "frames": round(t * fps) - sf, "lines": lines})
    return {"fps": fps, "durationInFrames": round(t * fps), "scenes": out}


def chapters(tl):
    """YouTube rules: first chapter at 0:00, at least 3 chapters, each at least 10 s."""
    marks = [(s["from"] / tl["fps"], s["chapter"]) for s in tl["scenes"] if s.get("chapter")]
    warnings = []
    if not marks or marks[0][0] != 0:
        warnings.append("first scene must have a chapter (YouTube needs one at 0:00)")
    if len(marks) < 3:
        warnings.append("YouTube needs at least 3 chapters")
    ends = [m[0] for m in marks[1:]] + [tl["durationInFrames"] / tl["fps"]]
    for (sec, title), end in zip(marks, ends):
        if end - sec < 10:
            warnings.append(f"chapter '{title}' is shorter than 10 s")
    return [f"{int(sec // 60)}:{int(sec % 60):02d} {title}" for sec, title in marks], warnings


def script_md(title, scenes):
    out = [f"# {title}", ""]
    for s in scenes:
        if s.get("chapter"):
            out += [f"## {s['chapter']}", ""]
        out += [line for text in s.get("lines", []) for line in (caption(text), "")]
        if s.get("kind") == "pause":
            out += [f"*(Pause and try it: {s.get('hold', 0)} s countdown)*", ""]
    return "\n".join(out)


def main():
    slug = sys.argv[1]
    n = json.loads((ROOT / "studio/src/videos" / slug / "narration.json").read_text())
    fps, voice, style = n.get("fps", 30), n.get("voice", DEFAULT_VOICE), n.get("style", DEFAULT_STYLE)
    pub = ROOT / "studio/public" / slug
    (pub / "audio").mkdir(parents=True, exist_ok=True)

    audio = {}
    for s in n["scenes"]:
        for text in s.get("lines", []):
            if text in audio:
                continue
            say = spoken(text)
            name = hashlib.sha1(f"{MODEL}|{voice}|{style}|{say}".encode()).hexdigest()[:16] + ".wav"
            f = pub / "audio" / name
            if not f.exists():
                print("tts:", text[:70], file=sys.stderr)
                f.write_bytes(synth(say, voice, style))
            audio[text] = (f"{slug}/audio/{name}", wav_seconds(f))

    tl = build_timeline(n["scenes"], audio, fps)
    (pub / "timeline.json").write_text(json.dumps(tl, indent=1))
    out = ROOT / "videos" / slug
    out.mkdir(parents=True, exist_ok=True)
    (out / "script.md").write_text(script_md(n.get("title", slug), n["scenes"]))

    lines, warnings = chapters(tl)
    print(f"duration {tl['durationInFrames'] / fps:.1f} s\n")
    print("\n".join(lines))
    for w in warnings:
        print("WARNING:", w, file=sys.stderr)

    if "--check" in sys.argv:  # what the kid will actually hear, for comparing with the script
        print("\n--- check: script / heard ---")
        bad = 0
        for text, (file, _) in audio.items():
            heard = transcribe(ROOT / "studio/public" / file)
            d = diff(text, heard)
            bad += bool(d)
            print(f"script: {text}\nheard:  {heard}" + "".join(f"\nMISMATCH: {x}" for x in d) + "\n")
        print(f"{bad} line(s) with MISMATCH" if bad else "voice check: all lines match")
        sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
