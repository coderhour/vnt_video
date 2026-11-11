"""Brute force: 5 boys + 3 girls in a random row; P(no two girls adjacent). Every number the video shows."""
from fractions import Fraction as F
from itertools import combinations, permutations
from math import comb, factorial


def ok(seats):
    s = sorted(seats)
    return all(b - a >= 2 for a, b in zip(s, s[1:]))


# All 8! orders of eight named kids (G1..G3 girls, B1..B5 boys).
kids = ["G1", "G2", "G3", "B1", "B2", "B3", "B4", "B5"]
orders = list(permutations(kids))
good = [o for o in orders if ok([i + 1 for i, k in enumerate(o) if k[0] == "G"])]
assert len(orders) == factorial(8) == 40320
assert len(good) == 14400
p = F(len(good), len(orders))
assert p == F(5, 14)
choices = [F(1, 14), F(5, 28), F(5, 14), F(3, 8), F(1, 2)]
assert choices.index(p) == 2  # bank correct_index = 2 (C)

# Why only seats matter: every seat pattern is filled by 3! * 5! = 720 orders.
from collections import Counter
per = Counter(tuple(i + 1 for i, k in enumerate(o) if k[0] == "G") for o in orders)
assert len(per) == 56 and set(per.values()) == {720} and factorial(3) * factorial(5) == 6 * 120 == 720

# Solution 1: seat patterns. 8*7*6 = 336, each set counted 6 times -> 56.
pats = list(combinations(range(1, 9), 3))
assert len(pats) == comb(8, 3) == 8 * 7 * 6 // 6 == 56 and 8 * 7 * 6 == 336
goodp = [s for s in pats if ok(s)]
assert len(goodp) == 20 and F(20, 56) == F(5, 14)
# The list, grouped by the first girl's seat: 10 + 6 + 3 + 1.
by_first = Counter(s[0] for s in goodp)
assert dict(by_first) == {1: 10, 2: 6, 3: 3, 4: 1}
# First girl in seat 1, by the second girl's seat: 4 + 3 + 2 + 1.
assert dict(Counter(s[1] for s in goodp if s[0] == 1)) == {3: 4, 4: 3, 5: 2, 6: 1}
assert [s for s in goodp if s[0] == 4] == [(4, 6, 8)]
print("good patterns:", goodp)

# Solution 2: boys first, 6 gaps (4 between + 2 ends), choose 3: 6*5*4/6 = 20.
assert 5 + 1 == 6 and comb(6, 3) == 6 * 5 * 4 // 6 == 20 and 6 * 5 * 4 == 120
# Gap choice <-> good pattern is one-to-one: girl in gap g (0..5) sits after g boys.
def from_gaps(gaps):
    row, seats = [], []
    for g in range(6):
        if g in gaps:
            row.append("G")
        if g < 5:
            row.append("B")
    return tuple(i + 1 for i, c in enumerate(row) if c == "G")
assert sorted(from_gaps(g) for g in combinations(range(6), 3)) == goodp
# Full orders check: 120 boy orders * 20 * 6 girl orders = 14400 of 40320.
assert 120 * 20 * 6 == 14400 and F(14400, 40320) == F(5, 14)
# Bad patterns: 56 - 20 = 36, more than half -> "more often than not, two girls touch".
assert 56 - 20 == 36 and F(36, 56) > F(1, 2)

# Traps.
assert comb(4, 3) == 4 and F(4, 56) == F(1, 14)     # A: only the 4 inside gaps, no ends
assert sum(1 for s in pats if s[1] - s[0] == 2 and s[2] - s[1] == 2) == 4  # (also: exactly every other seat)
assert comb(5, 3) == 10 and F(10, 56) == F(5, 28)   # B: only five gaps (one end forgotten)
assert F(3, 8) == F(21, 56) != p                    # D: just three girls over eight kids
assert F(1, 2) != p and 20 != 36                    # E: "touch or not" are not equally likely

# Variant: 4 boys + 3 girls -> 5 gaps, C(5,3) = 10; C(7,3) = 35; 10/35 = 2/7.
kids7 = ["G1", "G2", "G3", "B1", "B2", "B3", "B4"]
o7 = list(permutations(kids7))
g7 = [o for o in o7 if ok([i + 1 for i, k in enumerate(o) if k[0] == "G"])]
assert F(len(g7), len(o7)) == F(2, 7)
assert comb(5, 3) == 5 * 4 * 3 // 6 == 10 and comb(7, 3) == 7 * 6 * 5 // 6 == 35 and F(10, 35) == F(2, 7)
p7 = [s for s in combinations(range(1, 8), 3) if ok(s)]
assert dict(Counter(s[0] for s in p7)) == {1: 6, 2: 3, 3: 1}
assert F(2, 7) not in choices
print("ok")
