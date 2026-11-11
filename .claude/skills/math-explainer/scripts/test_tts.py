from tts import build_timeline, caption, chapters, diff, line_style, zh_num

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
from tts import digits
assert digits("The longest is two thousand twenty-five. At twenty-seven, they fall short.") == "The longest is 2025. At 27, they fall short."
assert digits("The sides are k squared, forty-five k, and two thousand twenty-five, with k up to forty-four.") == "The sides are k², 45k, and 2025, with k up to 44."
assert digits("Each one is the last. AMC ten. Did you get seventeen? Three hundred") == "Each one is the last. AMC 10. Did you get 17? 300"
assert digits("ends in zero one. A hundred. twenty twenty-five. one hundred eighty. Two three by three boxes") == "ends in 0 1. A 100. 20 25. 180. 2 3 by 3 boxes"
assert digits("three, nine, seven, one. one, two, four. only one out of three. zero and sixty-four") == "3, 9, 7, 1. 1, 2, 4. only one out of 3. zero and 64"
assert digits("twenty-one thirty-seconds") == "21 thirty-seconds"
tl2 = build_timeline([{"id": "a", "lines": ["one fifty-nine"]}], {"one fifty-nine": ("x.wav", 1.0)}, 30, captions={"one fifty-nine": "1:59"})
assert tl2["scenes"][0]["lines"][0]["caption"] == "1:59"
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
assert diff("twelve kilometers from Ann", "12 km from Anne") == []
assert diff("Bo walks one kilometer", "Beau walks 1 km") == []
assert diff("five and a half steps", "5 and 1/2 steps") == []
assert diff("eleven divided by two", "11/2") == []
assert diff("Divided by five", "/ by five") == []
assert diff("term ten is the tenth term", "term 10 is the 10th term") == []
assert diff("the twenty-first and second", "the 21st and 2nd") == []
assert diff("triangle P A B and A, B, C, D", "triangle PAB and ABCD") == []
assert diff("a big square", "a big square") == []
assert diff("half of eleven", "half of eleven") == []
assert diff("Ann walks", "And walks") != []
print("new tests ok")
assert diff("two squared, over four", "2² / 4") == []
assert diff("two thirds of it", "2/3 of it") == []
assert diff("a third and three quarters", "1/3 and 3/4") == []
assert diff("the third side", "the third side") == []
assert diff("the third side", "the 3rd side") == []
assert diff("add up to one over two times the width", "add up to 1/2 times the width") == []
assert diff("one-half of it", "half of it") == []
assert diff("ends in zero one", "ends in 01") == []
assert diff("add the eighties", "add the 80s") == []
assert diff("it is twelve feet tall", "it is 12 ft tall") == []
assert diff("a three, four, five triangle", "a 3-4-5 triangle") == []
assert diff("the sixes and threes", "the 6s and 3s") == []
assert diff("four fifths of it", "four-fifths of it") == []
assert diff("triangle C P E y", "triangle CPE y") == []
assert diff("the answer is NOT twenty-six", "The answer is not 26") == []
assert diff('hi there', 'hi [LAUGH] there') == ['- -> LAUGH']
assert diff("at one o'clock sharp", 'at 1:00 sharp') == []
assert diff("it is ALSO a whole number", "it is also a whole number") == []
assert diff("five and a half degrees", "5 1/2 degrees") == []
assert zh_num(42) == "四十二" and zh_num(15) == "十五" and zh_num(105) == "一百零五" and zh_num(1000) == "一千" and zh_num(2025) == "二千零二十五"
assert diff("P十在四十二点七五。", "P10在42.75", "zh") == []
assert diff("1只山羊吃1份草，她做的", "一只山羊吃一分草，他作的", "zh") == [] and diff("猫", "狗", "zh") == ["猫 -> 狗"]  # ZH_SAME homophones
assert diff("我是Vantee，两个点！", "我是 vantee 二个点", "zh") == []
assert diff("答案是四十二。", "答案是四十三", "zh") == ["二 -> 三"]
assert diff("好的", "好的[laugh]", "zh") == ["- -> LAUGH"]
assert zh_num(110) == "一百一十" and zh_num(64) == "六十四"
assert "VAN-tee" in line_style("我是Vantee，你好", "warm")
assert diff("we take one over two, times twelve", "We take 1 over 2 times 12") == []
assert caption("所以P十是 <short pause> 四十二。") == "所以P十是四十二。" and caption("So <short pause> forty.") == "So forty."
assert diff("P10在42又3/4。", "P十在四十二又四分之三", "zh") == []
assert diff("eleven blanks earn sixteen point five", "Eleven blanks earn 16.5") == []
assert zh_num(39996) == "三万九千九百九十六" and zh_num(40004) == "四万零四" and zh_num(40000) == "四万" and zh_num(16000) == "一万六千"
assert diff("得分前5%的同学", "得分前百分之五的同学", "zh") == []
