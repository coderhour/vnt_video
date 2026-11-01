"""Check: AB = AC, BD = BC, angle ABD = 24 (amc8 mock c2-707), every number the video shows."""
import math
from fractions import Fraction as F


def abd_from_apex(a):
    C = (180 - F(a)) / 2            # base angles of isosceles ABC
    DBC = 180 - 2 * C               # triangle BDC: BD = BC so angle BDC = angle C
    return C - DBC                  # angle ABD = angle ABC - angle DBC


# brute force over tenths of a degree, and a coordinate check
assert [t / 10 for t in range(1, 1800) if abd_from_apex(F(t, 10)) == 24] == [44]
choices = [22, 24, 34, 36, 44]
assert choices[4] == 44                                   # bank correct_index 4


def coords(a):
    B, C = (0.0, 0.0), (2.0, 0.0)
    h = math.tan(math.radians((180 - a) / 2))
    A = (1.0, h)
    # D on AC with BD = BC = 2
    for i in range(1, 100000):
        s = i / 100000
        D = (A[0] + s * (C[0] - A[0]), A[1] + s * (C[1] - A[1]))
        if abs(math.hypot(*D) - 2) < 1e-4 and s < 0.999:
            ang = lambda P, Q, R: math.degrees(math.acos(((P[0]-Q[0])*(R[0]-Q[0]) + (P[1]-Q[1])*(R[1]-Q[1])) / (math.dist(P, Q) * math.dist(R, Q))))
            return ang(A, B, D)
assert abs(coords(44) - 24) < 0.05

# Solution 1 (a = 44): C = 68, angle DBC = 180 - 136 = 44 = a, and 24 + a = 90 - a/2 -> 3a/2 = 66
assert (180 - 44) / 2 == 68 and 180 - 2 * 68 == 44 and 24 + 44 == 68
assert 90 - 24 == 66 and F(66) * F(2, 3) == 44
# Solution 2 exterior angle: angle BDC = a + 24 = C; 2(a + 24) = 180 - a -> 3a = 132
assert 2 * 24 == 48 and 180 - 48 == 132 and 132 // 3 == 44 and 44 + 24 == 68

# Traps table: angle ABD = 90 - 3a/2 for each choice
table = {22: 57, 24: 54, 34: 39, 36: 36, 44: 24}
for a, abd in table.items():
    assert abd_from_apex(a) == abd == 90 - F(3 * a, 2)
    assert (180 - a) / 2 == {22: 79, 24: 78, 34: 73, 36: 72, 44: 68}[a]
# 36: the famous 36-72-72 triangle, where angle ABD would be 36, not 24

# Variant: angle ABD = 30 -> apex 40
assert [t for t in range(1, 180) if abd_from_apex(t) == 30] == [40]
assert (180 - 40) / 2 == 70 and 180 - 140 == 40 and 70 - 40 == 30 and 30 + 40 == 70
assert 90 - 30 == 60 and 60 * 2 // 3 == 40
print("ok")
