"""Check: increasing geometric a < b < c = 144 of positive integers (amc10 algebra c4-067), every number the video shows."""
from fractions import Fraction as F
from math import gcd, isqrt


def seqs(c):
    return [(a, b, c) for a in range(1, c) for b in range(a + 1, c) if b * b == a * c]


S = seqs(144)
assert len(S) == 11
choices = [9, 10, 11, 12, 14]
assert choices[2] == 11                                       # bank correct_index 2

# Solution 1: b squared = 144 a, so a = (b / 12) squared; b = 12k, a = k squared, k = 1..11
assert S == [(k * k, 12 * k, 144) for k in range(1, 12)]
assert all(F(b, a) == F(144, b) for a, b, _ in S)               # same ratio
assert F(6 * 6, 144) == F(1, 4) and F(18 * 18, 144) == F(9, 4)  # b = 6, 18 fail
assert 12 * 12 == 144 and 11 * 11 == 121 and 12 * 11 == 132     # k = 11 is the last: 121, 132, 144
# k = 12 gives 144, 144, 144: not increasing
assert (12 * 12, 12 * 12) == (144, 144)
ratios = [F(144, 12 * k) for k in range(1, 12)]
assert ratios == [F(12, k) for k in range(1, 12)]
assert [r for r in ratios if r.denominator == 1] == [12, 6, 4, 3, 2]

# Solution 2: ratio p/q lowest terms, p > q; a = 144 q^2 / p^2 needs p^2 | 144
ps = [p for p in range(2, 145) if 144 % (p * p) == 0]
assert ps == [2, 3, 4, 6, 12]
qs = {p: [q for q in range(1, p) if gcd(p, q) == 1] for p in ps}
assert qs == {2: [1], 3: [1, 2], 4: [1, 3], 6: [1, 5], 12: [1, 5, 7, 11]}
assert sum(map(len, qs.values())) == 1 + 2 + 2 + 2 + 4 == 11
assert sorted(F(p, q) for p in ps for q in qs[p]) == sorted(ratios)

# Traps: 12 includes 144,144,144; 14 = divisors of 144 other than 144 (as if every divisor worked as a)
divs = [d for d in range(1, 145) if 144 % d == 0]
assert len(divs) == 15 and len(divs) - 1 == 14
assert 1 + 11 == 12
# 9 and 10: missing some fraction ratios, e.g. 12/11 (121, 132, 144)

# Variant: c = 72. b^2 = 72 a = 36 * 2a, so 2a must be a square: a = 2 m^2, b = 12 m, m = 1..5
V = seqs(72)
assert V == [(2 * m * m, 12 * m, 72) for m in range(1, 6)] and len(V) == 5
assert V == [(2, 12, 72), (8, 24, 72), (18, 36, 72), (32, 48, 72), (50, 60, 72)]
assert 2 * 6 * 6 == 72 and 12 * 6 == 72                          # m = 6 gives 72, 72, 72
assert 72 * 2 == 144 and isqrt(144 * 1) == 12
print("ok")
