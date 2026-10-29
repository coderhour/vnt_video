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
import hashlib
import io
import json
import math
import os
import sys
import time
import urllib.error
import urllib.request
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
MODEL = "gemini-3.8-flash-tts"
DEFAULT_VOICE = "Puck"
CHECK_MODEL = "gemini-3.8-flash"
LINE_GAP = 0.35    # seconds of silence between lines
SCENE_TAIL = 0.8   # seconds after a scene's last line


def call(model, body):
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        data=json.dumps(body).encode(),
        headers={"x-goog-api-key": os.environ["GOOGLE_API_KEY"], "Content-Type": "application/json"},
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)["candidates"][0]["content"]["parts"]
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(5 * 2 ** attempt)
                continue
            sys.exit(f"{model} failed ({e.code}): {e.read().decode()[:500]}")


def synth(text, voice):
    # Text only: the model rejects systemInstruction, and any style prompt (a "Say warmly:" prefix,
    # director's notes) was sometimes read aloud or replaced words. The voice choice sets the tone.
    parts = call(MODEL, {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    })
    audio = base64.b64decode(parts[0]["inlineData"]["data"])
    if audio[:4] == b"RIFF":  # 3.8 returns a finished WAV
        return audio
    buf = io.BytesIO()  # older TTS models return raw 24 kHz 16-bit mono PCM
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(24000)
        w.writeframes(audio)
    return buf.getvalue()


def transcribe(path):
    parts = call(CHECK_MODEL, {"contents": [{"parts": [
        {"inlineData": {"mimeType": "audio/wav", "data": base64.b64encode(path.read_bytes()).decode()}},
        {"text": "Transcribe this audio verbatim. Output only the words spoken."},
    ]}]})
    return parts[0]["text"].strip()


def wav_seconds(path):
    with wave.open(str(path)) as w:
        return w.getnframes() / w.getframerate()


def build_timeline(scenes, audio, fps):
    """audio: line text -> (staticFile path, seconds). Line `from` is relative to its scene."""
    t, out = 0.0, []
    for s in scenes:
        start, lines = t, []
        sf = round(start * fps)
        for text in s.get("lines", []):
            file, secs = audio[text]
            lines.append({"text": text, "file": file, "from": round(t * fps) - sf, "frames": math.ceil(secs * fps)})
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
        out += [line for text in s.get("lines", []) for line in (text, "")]
        if s.get("kind") == "pause":
            out += [f"*(Pause and try it: {s.get('hold', 0)} s countdown)*", ""]
    return "\n".join(out)


def main():
    slug = sys.argv[1]
    n = json.loads((ROOT / "studio/src/videos" / slug / "narration.json").read_text())
    fps, voice = n.get("fps", 30), n.get("voice", DEFAULT_VOICE)
    pub = ROOT / "studio/public" / slug
    (pub / "audio").mkdir(parents=True, exist_ok=True)

    audio = {}
    for s in n["scenes"]:
        for text in s.get("lines", []):
            if text in audio:
                continue
            name = hashlib.sha1(f"{MODEL}|{voice}|{text}".encode()).hexdigest()[:16] + ".wav"
            f = pub / "audio" / name
            if not f.exists():
                print("tts:", text[:70], file=sys.stderr)
                f.write_bytes(synth(text, voice))
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
        for text, (file, _) in audio.items():
            print(f"script: {text}\nheard:  {transcribe(ROOT / 'studio/public' / file)}\n")


if __name__ == "__main__":
    main()
