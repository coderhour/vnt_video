from tts import build_timeline, caption, chapters, diff, line_style

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
assert caption("So <short pause> it is <laugh> THIRTY!") == "So it is THIRTY!"
print("ok")

assert line_style("Hi, I'm Vantee!", "warm") == 'warm. Pronounce the name "Vantee" as /ˈvæn.ti/ (VAN-tee, rhymes with "can tea").'
assert line_style("No name here.", "warm") == "warm"
assert diff("If you got fifty, amazing work!", "If you got 50%, amazing work.") == ["- -> percent"]
assert diff("Two three by three boxes, times three, is six.", "Two 3x3 boxes times 3 is 6") == []
assert diff("Twenty-four means you missed the six small tilted squares.", "24 means you missed the 6 small tilted squares") == []
assert diff("Hi, I'm Vantee! <short pause> Neighbouring dots.", "Hi, I'm Vanti. Neighboring dots") == []
assert diff("A four by four box. That doesn't fit.", "A four-by-four box. [laugh] That doesn't fit.") == ["- -> LAUGH"]
assert diff("And this one counts too.", "And this white counts too.") == ["one -> white"]
assert diff("Twelve, plus twelve, times two.", "12 + 12 * 2") == []
assert diff("t equals two minus root three", "t = 2 - √3") == []
assert diff("two root three minus three", "2√3 − 3") == []
assert diff("one plus t squared", "1 + t²") == []
assert diff("root three over four", "√3/4") == []
assert diff("the square root of three", "the √3") == []
assert diff("fifteen degrees", "15°") == []
assert diff("twenty-four and four-by-four", "24 and 4-by-4") == []
assert diff("I'm Vantee. One plus x squared", "I'm Van T. 1 + x^2") == []
assert diff("Here's a square. I'll wait!", "Here is a square. I will wait.") == []
assert diff("Watch the side length.", "What's the side length?") != []
assert diff("ten centimeters", "10 cm") == []
assert diff("radius two centimeters", "radius 2cm") == []
assert diff("two hundred fifty-six squared", "256 ^ 2") == []
assert diff("one plus two is three", "1 + 2 = 3") == []
assert diff("I'm Vantee.", "I'm Fancy.") == ["vantee -> fancy"]
assert diff("I'm Vantee.", "I'm Vanti.") == []
assert diff("two thousand twenty-five", "2025") == []
assert diff("one thousand nine hundred forty-four", "1944") == []
assert diff("two thousand twenty-five", "2,025") == []
assert diff("two threes and one five", "two 3s and one 5") == []
assert diff("two sixes", "two 6s") == []
assert diff("our hundred terms", "our 100 terms") == []
assert diff("Divided by five, the powers", "/ by five, the powers") == []
assert diff("m equal to forty-five", "m = 45") == []
