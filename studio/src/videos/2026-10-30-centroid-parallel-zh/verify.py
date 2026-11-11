"""Exact check: the segment through the centroid G parallel to BC, and every number the video shows."""
from fractions import Fraction as F
from math import acos, degrees, hypot
import random


def mid(p, q):
    return ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)


def lerp(p, q, t):
    return (p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1]))


def area(p, q, r):
    return abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2


def meet(p1, p2, p3, p4):
    """Intersection of lines p1p2 and p3p4."""
    (x1, y1), (x2, y2), (x3, y3), (x4, y4) = p1, p2, p3, p4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    return lerp(p1, p2, t)


def cross(u, v):
    return u[0] * v[1] - u[1] * v[0]


def vec(p, q):
    return (q[0] - p[0], q[1] - p[1])


def check(A, B, C):
    """All the facts used in the video, for one triangle (exact Fractions, BC on y = 0)."""
    assert B[1] == C[1] == 0
    M, L, P = mid(B, C), mid(A, C), mid(A, B)
    G = meet(A, M, B, L)                       # two medians meet ...
    assert cross(vec(C, P), vec(C, G)) == 0    # ... and the third passes through G too
    # Solution 1 (L = midpoint of AC): midline ML is parallel to AB and half as long (C M L = C B A shrunk by 1/2 from C).
    assert vec(L, M) == (vec(A, B)[0] / 2, vec(A, B)[1] / 2)
    # G A B is a copy of G M L, twice as big: AG = 2 GM, so AG is 2/3 of the median.
    assert vec(A, G) == (2 * vec(G, M)[0], 2 * vec(G, M)[1])
    assert G == lerp(A, M, F(2, 3))
    # Line through G parallel to BC: E on AB, F on AC.
    G2 = (G[0] + 1, G[1])
    E, Fp = meet(G, G2, A, B), meet(G, G2, A, C)
    assert E == lerp(A, B, F(2, 3)) and Fp == lerp(A, C, F(2, 3))
    assert (Fp[0] - E[0]) / (C[0] - B[0]) == F(2, 3)
    # Solution 2: the three triangles at G have equal area, each a third.
    T = area(A, B, C)
    assert area(A, B, M) == area(A, C, M) and area(G, B, M) == area(G, C, M)
    assert area(B, A, L) == area(B, C, L) and area(G, A, L) == area(G, C, L)
    assert area(G, A, B) == area(G, B, C) == area(G, C, A) == T / 3
    # Same base BC, a third of the area -> G is a third of the height up.
    assert G[1] == A[1] / 3
    return dict(G=G, E=E, F=Fp, M=M, L=L)


random.seed(618)
shapes = [((F(1), F(5)), (F(0), F(0)), (F(9), F(0))),
          ((F(-3), F(4)), (F(0), F(0)), (F(7), F(0)))]       # obtuse at B
for _ in range(50):
    shapes.append(((F(random.randint(-20, 40)), F(random.randint(1, 30))), (F(0), F(0)), (F(random.randint(5, 30)), F(0))))
for A, B, C in shapes:
    check(A, B, C)

# The question: BC = 24 -> EF = 2/3 * 24 = 16. Bank correct_index = 2.
choices = ["\\(8\\)", "\\(12\\)", "\\(16\\)", "\\(18\\)", "\\(20\\)"]
assert choices.index("\\(16\\)") == 2
r = check((F(7), F(11)), (F(0), F(0)), (F(24), F(0)))
assert r["F"][0] - r["E"][0] == 16 and F(2, 3) * 24 == 16
assert F(1, 2) * 24 == 12                      # trap 12: the midline joining the middles of AB and AC is half of BC

# Traps: a segment parallel to BC that sits a fraction k of the way UP from BC has length 24 * (1 - k).
def at_height(k, base=24):
    return base * (1 - k)

assert at_height(F(1, 3)) == 16                # the truth: G is one third of the way up
assert at_height(F(2, 3)) == 8                 # 8: G placed one third of the way down from A (2:1 flipped)
assert at_height(F(1, 2)) == 12                # 12: line through the midpoints (the midline)
assert at_height(F(1, 4)) == 18                # 18: G only a quarter of the way up
assert at_height(F(1, 6)) == 20                # 20: G only a sixth of the way up
assert F(1, 3) * 24 == 8 and F(3, 4) * 24 == 18 and F(5, 6) * 24 == 20

# Variant: the segment joining the midpoints of AB and AC is 21. How long is EF?
# Midline = half of BC -> BC = 42; EF = 2/3 * 42 = 28.
BC = 2 * 21
assert BC == 42 and F(2, 3) * BC == 28
r = check((F(10), F(15)), (F(0), F(0)), (F(42), F(0)))
PA, NA = mid((F(10), F(15)), (F(0), F(0))), mid((F(10), F(15)), (F(42), F(0)))
assert NA[0] - PA[0] == 21 and r["F"][0] - r["E"][0] == 28
assert 28 not in (8, 12, 16, 18, 20)

# Builder figure (screen coords, y down): B(140,790), C(1040,790), A(490,212). Check it doesn't mislead.
A, B, C = (490, 212), (140, 790), (1040, 790)
def ang(P, Q, R):
    v, w = vec(P, Q), vec(P, R)
    return degrees(acos((v[0] * w[0] + v[1] * w[1]) / hypot(*v) / hypot(*w)))
angles = [ang(A, B, C), ang(B, A, C), ang(C, A, B)]
assert all(abs(a - 90) > 10 for a in angles) and min(abs(x - y) for x in angles for y in angles if x != y) > 10, angles
Ms = [(A, mid(B, C), B, C), (B, mid(A, C), A, C), (C, mid(A, B), A, B)]
med_angles = [ang(m, v, s2) for v, m, s1, s2 in Ms]
assert all(abs(x - 90) > 8.5 for x in med_angles), med_angles  # a long base always makes one median steep; never mark it
sides = sorted([hypot(*vec(A, B)), hypot(*vec(A, C)), 900])
assert sides[1] / sides[0] > 1.1 and sides[2] / sides[1] > 1.05, sides
G = ((A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3)
print("figure angles", [round(a, 1) for a in angles], "median-side angles", [round(a, 1) for a in med_angles],
      "sides", [round(s) for s in sides], "G", tuple(round(g, 1) for g in G))
print("ok")
