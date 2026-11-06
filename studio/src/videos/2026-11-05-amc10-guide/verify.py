"""Every number the AMC 10 guide says. Rules (Wikipedia, American_Mathematics_Competitions, 2026-11-05):
25 questions, 75 minutes, 6 right / 1.5 blank / 0 wrong, max 150, grade 10 and below, no calculators, November,
A and B versions (a student may take one A and one B). 2026-27: AIME cutoff fixed at 100 on the AMC 10.
AIME: 15 questions, 3 hours, integer answers 000-999."""
from fractions import Fraction as F

R, B, W = 6, F(3, 2), 0
Q, MIN = 25, 75
score = lambda right, blank, wrong: right * R + blank * B + wrong * W
assert MIN / Q == 3 and Q * R == 150

# the hook: 16 right + 9 wrong vs 14 right + 11 blank
assert score(16, 0, 9) == 96
assert score(14, 11, 0) == F(201, 2)  # 100.5
assert 14 * 6 == 84 and 11 * B == F(33, 2)  # 16.5
assert score(14, 11, 0) > score(16, 0, 9)
# 14 right, no mistakes, rest blank clears 100; 13 doesn't
assert score(14, 11, 0) >= 100 > score(13, 12, 0)

# guessing: expected points when k choices remain
ev = {k: F(R, k) for k in range(1, 6)}
assert ev[5] == F(6, 5) == F(12, 10) < B  # 1.2 < 1.5
assert ev[4] == B  # cross out one: a tie
assert ev[3] == 2 > B  # cross out two: guessing wins

# Try one: 2^10 + 2^10 + 2^10 + 2^10
s = 4 * 2**10
choices = {"A": 2**12, "B": 2**40, "C": 8**10, "D": 4**40, "E": 2**14}
assert s == 4096 == 2**2 * 2**10 == choices["A"]
assert 8**10 == 2**30 and 2**14 == 16384 and 2**14 > 16000
assert [k for k, v in choices.items() if v == s] == ["A"]
print("amc10 guide: ok")
