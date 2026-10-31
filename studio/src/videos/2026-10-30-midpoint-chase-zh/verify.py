"""Exact check (Fractions): the midpoint chase, every number the video shows, and the variant."""
from fractions import Fraction as F


def chase(p1, p2, n):
    """P1, P2 given; each later point is the midpoint of the two before it. Returns [P1..Pn]."""
    pts = [F(p1), F(p2)]
    while len(pts) < n:
        pts.append((pts[-2] + pts[-1]) / 2)
    return pts


# Question: P1 = 0, P2 = 64, P3 = 32, P4 = 48. Find P10. Bank answer: index 2 = 42.75.
P = chase(0, 64, 11)
assert P[2] == 32 and P[3] == 48
assert P == [0, 64, 32, 48, 40, 44, 42, 43, F(85, 2), F(171, 4), F(341, 8)], P
choices = [F(85, 2), F(341, 8), F(171, 4), F(43), F(44)]   # 42.5, 42.625, 42.75, 43, 44
correct_index = 2
assert choices.index(P[9]) == correct_index and P[9] == 42 + F(3, 4)

# Solution 1: each gap is half the one before, and flips direction.
gaps = [P[i + 1] - P[i] for i in range(9)]
assert gaps == [64, -32, 16, -8, 4, -2, 1, F(-1, 2), F(1, 4)], gaps
assert all(gaps[i + 1] == -gaps[i] / 2 for i in range(8))

# Solution 2: add the gaps in pairs. (64-32)+(16-8)+(4-2)+(1-1/2)+1/4.
pairs = [64 - 32, 16 - 8, 4 - 2, 1 - F(1, 2)]
assert pairs == [32, 8, 2, F(1, 2)]
assert sum(pairs) + F(1, 4) == P[9] == sum(gaps)
assert 32 + 8 + 2 == 42 and F(1, 2) + F(1, 4) == F(3, 4)

# Traps: each wrong choice is another point of the chase.
assert P[8] == choices[0]    # 42.5  = P9, one point too early
assert P[10] == choices[1]   # 42.625 = P11, one too late (calling 0 "point zero" and 64 "point one")
assert P[7] == choices[3]    # 43 = P8, two too early: where the gaps stop being whole numbers (64..1)
assert sum(gaps[:7]) == 43
assert P[5] == choices[4]    # 44 = P6, far too early
assert sum(gaps[:5]) == 44
# The chase closes in on 42 2/3 (2*newest + older stays 128), which is not a choice.
assert all(2 * P[i + 1] + P[i] == 128 for i in range(10))
assert F(128, 3) not in choices

# Variant: P1 = 0, P2 = 32. Where is P9? -> 21.25 (twenty-one and a quarter).
V = chase(0, 32, 9)
assert V == [0, 32, 16, 24, 20, 22, 21, F(43, 2), F(85, 4)], V
vg = [V[i + 1] - V[i] for i in range(8)]
assert vg == [32, -16, 8, -4, 2, -1, F(1, 2), F(-1, 4)]
assert (32 - 16) + (8 - 4) + (2 - 1) + (F(1, 2) - F(1, 4)) == 16 + 4 + 1 + F(1, 4) == V[8] == 21 + F(1, 4)
assert V[8] not in choices

print("question:", [str(x) for x in P])
print("variant: ", [str(x) for x in V])
print("ok")
