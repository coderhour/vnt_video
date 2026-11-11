"""Check: Ali gives 20% -> equal; Bea gives 10 -> Ali twice Bea (amc8 mock c2-038), every number the video shows."""
from fractions import Fraction as F


def solve(pct, gift, times):
    return [(a, b) for a in range(1, 1000) for b in range(1, 1000)
            if a - F(pct, 100) * a == b + F(pct, 100) * a and a + gift == times * (b - gift)]


assert solve(20, 10, 2) == [(150, 90)]
choices = [90, 150, 200, 240, 300]
assert choices[3] == 150 + 90                       # bank correct_index 3

# Solution 1: bar model. 20% = 1 of 5 parts. Ali 5 parts, gives 1 -> 4; Bea + 1 = 4 -> Bea 3 parts
assert F(20, 100) == F(1, 5) and 5 - 1 == 4 and 4 - 1 == 3
# Bea gives 10: Ali 5 parts + 10, Bea 3 parts - 10; twice Bea = 6 parts - 20
# 5 parts + 10 = 6 parts - 20 -> 1 part = 30
p = 30
assert 5 * p + 10 == 2 * (3 * p - 10) and 10 + 20 == 30
assert 5 * p == 150 and 3 * p == 90 and 8 * p == 240 and 5 + 3 == 8
# checks
assert 150 // 5 == 30 and 150 - 30 == 120 == 90 + 30
assert 150 + 10 == 160 and 90 - 10 == 80 and 160 == 2 * 80

# Solution 2: letters. a - a/5 = b + a/5 -> b = 3a/5; a + 10 = 2(b - 10) = 6a/5 - 20 -> a/5 = 30
a = 150
assert F(3, 5) * a == 90 and 2 * (F(3, 5) * a - 10) == F(6, 5) * a - 20 and F(6, 5) * a - a == 30 + 0 and F(a, 5) == 30

# Traps: 90 Bea alone, 150 Ali alone, 300 double Ali; 200 tested: 8 parts of 25
assert 2 * 150 == 300
assert 200 / 8 == 25 and 5 * 25 == 125 and 3 * 25 == 75 and 125 + 10 == 135 and 75 - 10 == 65 and 2 * 65 == 130 != 135

# Variant: Ali gives 25% -> equal; Bea gives 6 -> Ali three times Bea
assert solve(25, 6, 3) == [(48, 24)] and 48 + 24 == 72
# parts: Ali 4, gives 1 -> 3; Bea 2. 4p + 6 = 3(2p - 6) = 6p - 18 -> 2p = 24 -> p = 12; total 6 parts = 72
assert 4 - 1 == 3 and 3 - 1 == 2 and 6 + 18 == 24 and 24 // 2 == 12 and 4 * 12 == 48 and 2 * 12 == 24 and 6 * 12 == 72
assert 48 // 4 == 12 and 48 - 12 == 36 == 24 + 12 and 48 + 6 == 54 and 24 - 6 == 18 and 54 == 3 * 18
print("ok")
