from tts import build_timeline, chapters

scenes = [
    {"id": "hook", "chapter": "Intro", "lines": ["a", "b"]},
    {"id": "try", "kind": "pause", "chapter": "Try it", "hold": 10},
    {"id": "sol", "chapter": "Solution", "lines": ["a"], "hold": 1},
]
audio = {"a": ("s/audio/a.wav", 2.0), "b": ("s/audio/b.wav", 3.0)}
tl = build_timeline(scenes, audio, 30)

hook, pause, sol = tl["scenes"]
assert [l["from"] for l in hook["lines"]] == [0, round(2.35 * 30)]
assert hook["frames"] == round((2 + 0.35 + 3 + 0.8) * 30)
assert pause["from"] == hook["frames"] and pause["frames"] == 300 and pause["lines"] == []
assert sol["lines"][0]["from"] == 0 and sol["lines"][0]["frames"] == 60
assert tl["durationInFrames"] == sol["from"] + sol["frames"]

lines, warnings = chapters(tl)
assert lines == ["0:00 Intro", "0:06 Try it", "0:16 Solution"], lines
assert warnings == ["chapter 'Intro' is shorter than 10 s", "chapter 'Solution' is shorter than 10 s"], warnings
print("ok")
