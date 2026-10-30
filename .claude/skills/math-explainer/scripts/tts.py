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
# Pronunciation hints, added to the style annotation of every line that uses the word (never spoken).
# Google's TTS has no IPA/SSML field; a style hint got /ˈvæn.ti/ in 4/4 takes vs 2/4 for spelling it "Van-tee".
PRONOUNCE = {"Vantee": '/ˈvæn.ti/ (VAN-tee, rhymes with "can tea")'}


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
    """Whole numbers as words; years like 2025 read as "two thousand twenty five"."""
    if n >= 1000:
        return num_words(n // 1000) + " thousand" + ("" if n % 1000 == 0 else " " + num_words(n % 1000))
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + num_words(n % 100))


MATH_WORDS = [  # what a transcriber writes -> how a script line says it
    (r"\b1\s*/\s*2\b|\b(?:a|one)[\s-]half\b|\bone over two\b", " half "), 
    (r"square root of", " root "), (r"√", " root "), (r"²|\s*\^\s*2\b", " squared "), (r"°", " degrees "),
    (r"−|(?<=[\d)²])\s*-\s*(?=[\d√(])|\s-\s", " minus "), (r"(?<=[\d)])\s*/\s*(?=\d)|(?<=squared)\s*/\s*(?=\d)", " over "),
    (r"(\d)\s*x\s*(\d)", r"\1 by \2"), (r"[×*]", " times "), (r"\+", " plus "), (r"=", " equals "),
    (r"'s\b", " is "), (r"'re\b", " are "), (r"'ll\b", " will "), (r"'m\b", " am "),  # here's = here is
    (r"%", " percent "), (r"\bequal to\b", " equals "), (r"(?<!\d)\s*/\s*(?=[a-z])", " divided "), (r"(?<=\d)\s*cm\b", " centimeters "), (r"\bcm\b", " centimeters "), (r"\[laugh\]", " LAUGH "), (r"neighbour", "neighbor"),
    (r"\ba (third|quarter|fourth|fifth)", r"one \1"),  # "two thirds" vs "2/3"
    (r"\b(one|two|three|four|five|six|seven|eight|nine|ten) (?:thirds?)\b", r"\1 over three"),
    (r"\b(one|two|three|four|five|six|seven|eight|nine|ten) (?:quarters?|fourths?)\b", r"\1 over four"),
    (r"\b(one|two|three|four|five|six|seven|eight|nine|ten) (?:fifths?)\b", r"\1 over five"),
    (r"(?<=\d)\s*km\b|\bkm\b|\bkilometer\b", " kilometers "), (r"\banne\b", "ann"), (r"\bbeau\b", "bo"),  # sound-alike spellings
    (r"\bdivided(?: by)?\b", " over "),  # "5 and 1/2", "11/2" for "divided by"
]
ORD = {"one": "first", "two": "second", "three": "third", "five": "fifth", "eight": "eighth", "nine": "ninth", "twelve": "twelfth"}


def ordinal(n):
    """10 -> "tenth", 21 -> "twenty first" (how a transcriber's "10th" is said)."""
    *head, last = num_words(n).split()
    return " ".join([*head, ORD.get(last) or (last[:-1] + "ieth" if last.endswith("y") else last + "th")])


def words(text):
    """Normalized word list for comparing script vs heard: digits -> words, math symbols -> their spoken words."""
    t = re.sub(r"<[^>]+>", " ", text.lower())
    for pat, rep in MATH_WORDS:
        t = re.sub(pat, rep, t)
    t = re.sub(r"(?<=\d),(?=\d{3}\b)", "", t)  # 2,025 -> 2025
    t = re.sub(r"(\d+)(?:st|nd|rd|th)\b", lambda m: " " + ordinal(int(m.group(1))) + " ", t)
    t = re.sub(r"(\d+)'?s\b", lambda m: " " + num_words(int(m.group(1))) + ("es" if m.group(1)[-1] == "6" else "s") + " ", t)  # 3s -> threes
    t = re.sub(r"\d+", lambda m: " " + num_words(int(m.group())) + " ", t)
    t = re.sub(r"\b(?:one|a) hundred\b", "hundred", t)  # "our hundred" vs "100"
    out, run = [], False  # spelled letters "P A B" vs "PAB": join runs of single letters
    for w in re.findall(r"[a-z']+|LAUGH", t):
        if len(w) == 1 and run:
            out[-1] += w
        else:
            out.append(w)
        run = len(w) == 1 or (run and len(w) == 1)
    return ["equals" if w == "is" else w for w in out]  # "2 + 3 = 5" said "is"


def diff(script, heard):
    """Differences between what the line says and what the TTS said ([] = clean). Vantee's spelling is ignored, but it must still start with a V sound ("Fancy" is flagged)."""
    a, b = words(script), words(heard)
    out = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if op == "equal" or (op == "replace" and a[i1:i2] == ["vantee"] and j2 - j1 <= 3 and b[j1].startswith("v")):
            continue
        out.append(f"{' '.join(a[i1:i2]) or '-'} -> {' '.join(b[j1:j2]) or '-'}")
    return out


def wav_seconds(path):
    with wave.open(str(path)) as w:
        return w.getnframes() / w.getframerate()


def line_style(text, style):
    """The style annotation for one line: the delivery style plus a hint for each name it says."""
    hints = [f'Pronounce the name "{w}" as {ipa}.' for w, ipa in PRONOUNCE.items() if re.search(rf"\b{w}\b", text)]
    return ". ".join([style, *hints]) if hints else style


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
            st = line_style(text, style)
            name = hashlib.sha1(f"{MODEL}|{voice}|{st}|{text}".encode()).hexdigest()[:16] + ".wav"
            f = pub / "audio" / name
            if not f.exists():
                print("tts:", text[:70], file=sys.stderr)
                f.write_bytes(synth(text, voice, st))
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
            if d:  # a real audio error repeats; a transcriber slip usually doesn't, so listen twice
                heard2 = transcribe(ROOT / "studio/public" / file)
                if not diff(text, heard2):
                    print(f"(transcriber noise, clean on 2nd listen: {'; '.join(d)})")
                    d = []
                else:
                    heard += f"\nheard2: {heard2}"
            bad += bool(d)
            print(f"script: {text}\nheard:  {heard}" + "".join(f"\nMISMATCH: {x}" for x in d) + "\n")
        print(f"{bad} line(s) with MISMATCH" if bad else "voice check: all lines match")
        sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
