"""Check how "Vantee" is pronounced in every line that says it: name_check.py <slug> [<slug> ...]
tts.py --check normalizes the name's spelling away, so it can't hear VON-tee or VEN-tee. This asks the
check model for the vowel twice; a line passes only if both answers have /æ/ (VAN-tee).
Fix a failing line by deleting its WAV and re-running tts.py <slug> --check (it regenerates just that line)."""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import tts  # noqa: E402

ASK = ('Listen to how the speaker says the name "Vantee". Reply with exactly one word: '
       'VAN if the first vowel is as in "van" or "cat", VON if as in "father" or "on", VEN if as in "ten", else OTHER.')
ROOT = Path(__file__).resolve().parents[4]


def heard(wav):
    resp = tts.post(f"models/{tts.CHECK_MODEL}:generateContent", {"contents": [{"parts": [
        {"inlineData": {"mimeType": "audio/wav", "data": tts.base64.b64encode(wav.read_bytes()).decode()}},
        {"text": ASK}]}]})
    return resp["candidates"][0]["content"]["parts"][0]["text"].strip().upper()


bad = 0
for slug in sys.argv[1:]:
    tl = json.loads((ROOT / "studio/public" / slug / "timeline.json").read_text())
    for s in tl["scenes"]:
        for i, l in enumerate(s["lines"]):
            if "Vantee" in l["text"]:
                wav = ROOT / "studio/public" / l["file"]
                got = [heard(wav), heard(wav)]
                ok = all(g.startswith("VAN") for g in got)
                bad += not ok
                print(f"{'ok ' if ok else 'BAD'} {slug} {s['id']}[{i}] {got} {wav.name}")
sys.exit(1 if bad else 0)
