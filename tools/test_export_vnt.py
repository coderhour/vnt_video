import hashlib, json, tempfile
from pathlib import Path
import export_vnt as ex

# qualification rule
assert ex.qualifies({"status": "ready"})
assert ex.qualifies({"posts": [{"platform": "YouTube", "url": "u"}]})
assert not ex.qualifies({})
assert not ex.qualifies({"status": "draft", "posts": []})
assert not ex.qualifies({"status": "fix", "posts": [{"platform": "YouTube", "url": "u"}]})
assert not ex.qualifies({"status": "fix"})

# fixture: absolute frames, caption text, prompt hash, key order
tl = {"fps": 30, "durationInFrames": 300, "scenes": [
    {"id": "a", "chapter": None, "from": 0, "frames": 100, "lines": [{"text": "Hi <short pause>", "caption": "Hi", "file": "x/audio/1.wav", "from": 5, "frames": 40}]},
    {"id": "b", "chapter": "Solve", "from": 100, "frames": 200, "lines": [{"text": "Go", "caption": "Go", "file": "x/audio/2.wav", "from": 10, "frames": 50}]},
]}
meta = {"title": "T", "question_id": "bank1:q-1"}
q = {"id": "q-1", "prompt": "What is 2 + 2? ½"}
out = ex.explainer_json("x", meta, tl, q, None)
assert out["prompt_sha256"] == hashlib.sha256("What is 2 + 2? ½".encode()).hexdigest()
assert [(s["from"], s["lines"][0]["from"], s["lines"][0]["text"]) for s in out["scenes"]] == [(0, 5, "Hi"), (100, 110, "Go")]
assert out["scenes"][0]["chapter"] is None and out["brief"] is None
assert (out["slug"], out["fps"], out["duration_frames"], out["title"]) == ("x", 30, 300, "T")
text = ex.dump(out)
assert text.endswith("}\n") and json.loads(text) == out and text.index('"brief"') < text.index('"slug"')

# bank lookup
with tempfile.TemporaryDirectory() as d:
    (Path(d) / "bank1.json").write_text(json.dumps({"questions": [q, {"id": "q-2", "prompt": "p"}]}))
    assert ex.find_question(d, "bank1:q-2")["prompt"] == "p"
    assert ex.find_question(d, "bank1:nope") is None
    assert ex.find_question(d, "missing:q-1") is None

# CJK skip
assert not ex.has_cjk(tl)
zh = json.loads(json.dumps(tl)); zh["scenes"][1]["lines"][0]["caption"] = "P10 在哪里"
assert ex.has_cjk(zh)
print("ok")
