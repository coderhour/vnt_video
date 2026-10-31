"""Exact check: a * b = (a + b) / (1 + ab), and every number the video shows."""
from fractions import Fraction as F
from functools import reduce


def star(a, b):
    return (a + b) / (1 + a * b)


def score(x):
    """The 'score' (1 + x) / (1 - x). Starring two numbers multiplies their scores."""
    return (1 + x) / (1 - x)


def from_score(s):
    """1 + x = s(1 - x)  ->  s + 1 equal parts make 2  ->  x = 1 - 2/(s + 1)."""
    return 1 - F(2) / (s + 1)


def chain(nums):
    return reduce(star, nums)


choices = [F(5, 7), F(9, 11), F(7, 8), F(14, 15), F(77, 60)]
correct_index = 2

# Solution 1: step by step, top and bottom computed separately.
a, b, c, d = F(1, 2), F(1, 3), F(1, 4), F(1, 5)
assert a + b == F(5, 6) and 1 + a * b == F(7, 6)
s1 = star(a, b)
assert s1 == F(5, 7)
assert s1 + c == F(27, 28) and 1 + s1 * c == F(33, 28)
s2 = star(s1, c)
assert s2 == F(27, 33) == F(9, 11)
assert s2 + d == F(56, 55) and 1 + s2 * d == F(64, 55)
s3 = star(s2, d)
assert s3 == F(56, 64) == F(7, 8)
assert choices.index(s3) == correct_index
print("answer:", s3, "index", choices.index(s3))

# Solution 2: scores. 1/n has score (n + 1)/(n - 1).
assert [score(x) for x in (a, b, c, d)] == [3, 2, F(5, 3), F(3, 2)]
assert F(3, 1) * F(4, 2) * F(5, 3) * F(6, 4) == F(5 * 6, 1 * 2) == 15
assert score(s1) == 6 == score(a) * score(b)          # check on the first step
assert score(s3) == 15 and from_score(15) == F(7, 8)
assert F(2, 16) == F(1, 8) and 1 - F(1, 8) == F(7, 8)
# Why scores multiply: 1 + a*b = (1+a)(1+b)/(1+ab), 1 - a*b = (1-a)(1-b)/(1+ab).
import itertools
grid = [F(p, q) for p in range(-5, 6) for q in range(1, 7) if abs(F(p, q)) < 1]
for x, y in itertools.product(grid, repeat=2):
    assert 1 + star(x, y) == (1 + x) * (1 + y) / (1 + x * y)
    assert 1 - star(x, y) == (1 - x) * (1 - y) / (1 + x * y)
    assert score(star(x, y)) == score(x) * score(y)

# Traps.
assert s1 == choices[0]                       # 5/7: stopped after the first step
assert s2 == choices[1]                       # 9/11: stopped after the second step
assert a + b + c + d == choices[4] == F(77, 60)   # 77/60: added the tops, ignored 1 + ab
assert 1 - 1 / score(s3) == choices[3]        # 14/15: what you'd get from 1 - 1/15 (forgot to turn the score back)
assert F(77, 60) > 1 and all(0 < x < 1 for x in (a, b, c, d))
assert star(F(9, 10), F(9, 10)) < 1           # starring numbers below 1 stays below 1

# Variant: ((1/3 * 1/4) * 1/5) * 1/6 = 3/4. Not one of the question's choices.
v1 = star(F(1, 3), F(1, 4))
assert F(1, 3) + F(1, 4) == F(7, 12) and 1 + F(1, 12) == F(13, 12) and v1 == F(7, 13)
v2 = star(v1, F(1, 5))
assert v1 + F(1, 5) == F(48, 65) and 1 + v1 * F(1, 5) == F(72, 65) and v2 == F(2, 3)
v3 = star(v2, F(1, 6))
assert v2 + F(1, 6) == F(5, 6) and 1 + v2 * F(1, 6) == F(10, 9) and v3 == F(45, 60) == F(3, 4)
assert [score(F(1, n)) for n in (3, 4, 5, 6)] == [2, F(5, 3), F(3, 2), F(7, 5)]
assert F(4 * 5 * 6 * 7, 2 * 3 * 4 * 5) == 7 == score(v3)
assert from_score(7) == F(3, 4) and F(2, 8) == F(1, 4)
assert chain([F(1, 3), F(1, 4), F(1, 5), F(1, 6)]) == F(3, 4) not in choices
print("variant:", v3)
print("ok")
