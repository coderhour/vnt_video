"""Brute force: circles through >= 3 of the marked points of an n x n grid (exact, with fractions)."""
from collections import Counter
from fractions import Fraction as F
from itertools import combinations


def circumcircle(a, b, c):
    """Exact (center, radius^2) of the circle through a, b, c, or None if they are on one line."""
    (ax, ay), (bx, by), (cx, cy) = a, b, c
    d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
    if d == 0:
        return None
    a2, b2, c2 = ax * ax + ay * ay, bx * bx + by * by, cx * cx + cy * cy
    ux = F(a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by), d)
    uy = F(a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax), d)
    return (ux, uy), (ax - ux) ** 2 + (ay - uy) ** 2


def circles(n):
    pts = [(x, y) for x in range(n) for y in range(n)]
    triples = list(combinations(pts, 3))
    collinear = 0
    on = {}  # circle -> set of marked points on it
    for t in triples:
        c = circumcircle(*t)
        if c is None:
            collinear += 1
            continue
        on.setdefault(c, set()).update(t)
    # make sure each circle lists EVERY marked point on it
    for (ctr, r2), s in on.items():
        s.update(p for p in pts if (p[0] - ctr[0]) ** 2 + (p[1] - ctr[1]) ** 2 == r2)
    return pts, triples, collinear, on


def shape(s):
    """Name a 4-point set: square / rectangle / isosceles trapezoid (by side lengths²)."""
    p = sorted(s)
    import math
    cx = sum(x for x, _ in p) / 4; cy = sum(y for _, y in p) / 4
    p.sort(key=lambda q: math.atan2(q[1] - cy, q[0] - cx))
    d = lambda a, b: (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
    sides = [d(p[i], p[(i + 1) % 4]) for i in range(4)]
    diag = [d(p[0], p[2]), d(p[1], p[3])]
    if diag[0] == diag[1] and sides[0] == sides[2] and sides[1] == sides[3]:
        return "square" if sides[0] == sides[1] else "rectangle"
    return "trapezoid"


pts, triples, col, on = circles(3)
sizes = Counter(len(s) for s in on.values())
print(f"3x3: {len(triples)} triples, {col} collinear, {len(triples) - col} non-collinear")
print("circles by number of marked points:", dict(sizes))
assert (len(triples), col) == (84, 8)
assert sizes == {3: 20, 4: 14}
total = len(on)
assert total == 34 == 76 - 3 * 14
four = [frozenset(s) for s in on.values() if len(s) == 4]
kinds = Counter(shape(s) for s in four)
print("4-point circles:", dict(kinds))
for s in sorted(four, key=lambda s: (shape(s), sorted(s))):
    (ctr, r2), = [c for c, v in on.items() if frozenset(v) == s]
    print(f"  {shape(s):9s} {sorted(s)} center=({ctr[0]},{ctr[1]}) r2={r2}")
assert kinds == {"square": 6, "rectangle": 4, "trapezoid": 4}
# 6 squares = 4 small + 1 big + 1 tilted; rectangles 1x2: 4 (2 wide, 2 tall)
print("3-point circles:")
for (ctr, r2), s in sorted(on.items(), key=lambda kv: (kv[0][1], kv[0][0])):
    if len(s) == 3:
        print(f"  {sorted(s)} center=({ctr[0]},{ctr[1]}) r2={r2}")

# Bank: choices 20/34/48/62/76, correct_index 1 -> 34. Traps:
assert sizes[3] == 20                          # A: only exactly-three circles
assert len(triples) - col == 76                # E: every non-collinear triple
assert 76 - 14 == 62                           # D: subtract once per 4-point circle, not 3 times
assert 76 - 2 * 14 == 48                       # C: subtract twice
print("bank answer 34 (choice B) confirmed")

# The 20 three-point circles come in four families of the same size (r^2), as shown on screen.
fam = Counter(r2 for (ctr, r2), s in on.items() if len(s) == 3)
print("three-point families by r^2:", {str(k): v for k, v in fam.items()})
assert fam == {F(1): 4, F(25, 18): 4, F(25, 16): 4, F(5, 2): 8}
# Solution 2: 14 circles x 4 triples = 56 triples in pile one, 20 left over.
assert 14 * 4 == 56 and 76 - 56 == 20 and 14 + 20 == 34

# Variant: same 3x3 grid, but only the 8 points around the edge (center point (1,1) removed).
pts8 = [p for p in pts if p != (1, 1)]
tr8 = list(combinations(pts8, 3))
on8 = {}
col8 = 0
for t in tr8:
    c = circumcircle(*t)
    if c is None:
        col8 += 1
        continue
    on8.setdefault(c, set()).update(t)
for (ctr, r2), s in on8.items():
    s.update(p for p in pts8 if (p[0] - ctr[0]) ** 2 + (p[1] - ctr[1]) ** 2 == r2)
sz8 = Counter(len(s) for s in on8.values())
print(f"variant (8 edge points): {len(tr8)} triples, {col8} collinear, circles {len(on8)} by size {dict(sz8)}")
assert (len(tr8), col8) == (56, 4)
assert len(on8) == 22 == 52 - 3 * 10 and sz8 == {3: 12, 4: 10}
four8 = {frozenset(v) for v in on8.values() if len(v) == 4}
assert four8 == {s for s in four if (1, 1) not in s}            # big + tilted square, 4 rectangles, 4 trapezoids
assert Counter(shape(s) for s in four8) == {"square": 2, "rectangle": 4, "trapezoid": 4}
# The 4 small-square circles still exist: they now hold 3 of the 8 points each.
three8 = {frozenset(v) for v in on8.values() if len(v) == 3}
old3 = {frozenset(v) for v in on.values() if len(v) == 3 and (1, 1) not in v}
small = {s - {(1, 1)} for s in four if (1, 1) in s}
assert len(old3) == 8 and len(small) == 4 and three8 == old3 | small
print("variant answer 22 confirmed")
