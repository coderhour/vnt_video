#!/usr/bin/env python3
"""Verify 2026-11-07-broken-stick (amc_practice_amc10_counting_template:c1-981).

A stick is cut at two independent uniform points. P(longest < 2 * shortest) = 1/10.
Video uses a 60-unit stick: cuts x, y in [0, 60], square area 3600.
Exact: clip the square into convex polygons (half-planes, Fractions) and add areas.
Plus a seeded Monte Carlo check.
"""
from fractions import Fraction as F
from itertools import permutations
import random

L = 60  # stick length used on screen


def area(poly):
    s = 0
    for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]):
        s += x1 * y2 - x2 * y1
    return abs(F(s)) / 2


def clip(poly, a, b, c):
    """Keep the part of poly with a*x + b*y + c >= 0 (exact)."""
    out = []
    n = len(poly)
    for i in range(n):
        P, Q = poly[i], poly[(i + 1) % n]
        fp = a * P[0] + b * P[1] + c
        fq = a * Q[0] + b * Q[1] + c
        if fp >= 0:
            out.append(P)
        if (fp >= 0) != (fq >= 0):
            t = F(fp) / (fp - fq)
            out.append((P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])))
    return out


# Pieces in the top half (y > x): left = x, middle = y - x, right = L - y, as linear forms (a, b, c).
PIECES_TOP = [(1, 0, 0), (-1, 1, 0), (0, -1, L)]
PIECES_BOT = [(0, 1, 0), (1, -1, 0), (-1, 0, L)]  # x > y: left = y, middle = x - y, right = L - x


def sub(p, q, k=1):  # form p - k*q
    return tuple(pi - k * qi for pi, qi in zip(p, q))


def region(pieces, half, cond):
    """List of (ordering, polygon) for each ordering, clipped by cond(lo, mid, hi)."""
    square = [(F(0), F(0)), (F(L), F(0)), (F(L), F(L)), (F(0), F(L))]
    res = []
    for order in permutations(range(3)):
        lo, mid, hi = (pieces[i] for i in order)
        poly = clip(square, *half)
        poly = clip(poly, *sub(mid, lo))   # mid >= lo
        poly = clip(poly, *sub(hi, mid))   # hi >= mid
        for h in cond(lo, mid, hi):
            if poly:
                poly = clip(poly, *h)
        res.append((order, poly))
    return res


def prob(cond):
    tot = F(0)
    for pieces, half in ((PIECES_TOP, (-1, 1, 0)), (PIECES_BOT, (1, -1, 0))):
        tot += sum(area(p) for _, p in region(pieces, half, cond) if len(p) >= 3)
    return tot / (L * L)


def ratio(k):  # longest < k * shortest  <=>  k*lo - hi > 0
    return lambda lo, mid, hi: [sub(tuple(k * v for v in lo), hi)]


ans = prob(ratio(2))
print("P(longest < 2 shortest) =", ans)
assert ans == F(1, 10)

# --- Solution 1 numbers (top half, 60-unit square) ---
top = region(PIECES_TOP, (-1, 1, 0), lambda *a: [])
for order, poly in top:
    assert area(poly) == 300, (order, area(poly))
print("top half area =", sum(area(p) for _, p in top), "; each of 6 orderings = 300")
# ordering left <= middle <= right: triangle O(0,0) Q(0,30) P(20,40)
T = dict(top)[(0, 1, 2)]
assert set(T) == {(0, 0), (0, 30), (20, 40)}, T
assert area([(0, 0), (0, 30), (20, 40)]) == F(1, 2) * 30 * 20 == 300
good = region(PIECES_TOP, (-1, 1, 0), ratio(2))
G = dict(good)[(0, 1, 2)]
assert set(G) == {(20, 40), (15, 30), (12, 36)}, G
# box method: box x 12..20, y 30..40, minus three right triangles
box = 8 * 10
cuts = [F(5 * 10, 2), F(8 * 4, 2), F(3 * 6, 2)]
assert cuts == [25, 16, 9] and box - sum(cuts) == 30 == area(G)
for order, poly in good:
    assert area(poly) == 30, order
hexagon = sum(area(p) for _, p in good)
assert hexagon == 180 and F(hexagon, 1800) == F(1, 10)
print("good triangle = 80 - 25 - 16 - 9 =", area(G), "; hexagon =", hexagon, "of 1800")
# pieces at the good triangle's corners
pc = lambda x, y: (x, y - x, L - y)
assert pc(15, 30) == (15, 15, 30) and pc(12, 36) == (12, 24, 24) and pc(20, 40) == (20, 20, 20)
# hexagon corners (top half)
hexpts = set()
for _, p in good:
    hexpts |= set(p)
hexpts.discard((20, 40))
assert hexpts == {(15, 30), (24, 36), (30, 45), (24, 48), (15, 45), (12, 36)}, hexpts
print("hexagon corners:", sorted(hexpts))
# the three equal-piece lines are the medians of the top triangle (0,0),(0,60),(60,60)
# left=middle: y=2x through (0,0),(30,60); middle=right: 2y-x=60 through (0,30),(60,60); left=right: x+y=60 through (0,60),(30,30)
for (x, y) in [(0, 0), (30, 60), (20, 40)]:
    assert y == 2 * x
for (x, y) in [(0, 30), (60, 60), (20, 40)]:
    assert 2 * y - x == 60
for (x, y) in [(0, 60), (30, 30), (20, 40)]:
    assert x + y == 60

# --- Solution 2: walk from the equal point, fraction of the way = 1 - 3 * shortest (unit stick) ---
walk = lambda s: 1 - 3 * s
assert walk(F(1, 4)) == F(1, 4) and walk(F(1, 5)) == F(2, 5)
assert walk(F(1, 4)) * walk(F(1, 5)) == F(1, 10)
# stopping pieces: 1+1+2 = 4 parts and 1+2+2 = 5 parts
assert (F(1, 4), F(1, 4), F(2, 4)) == (F(1, 4), F(1, 4), F(1, 2))
assert (F(1, 5), F(2, 5), F(2, 5))[0] == F(1, 5)
print("Solution 2: 1/4 x 2/5 =", walk(F(1, 4)) * walk(F(1, 5)))

# --- Traps ---
assert F(180, 3600) == F(1, 20)          # A: hexagon over the whole square (forgot the mirror half)
assert F(300, 3600) == F(1, 12)          # B: one ordering's triangle area over the whole square
assert F(1, 6) * 1 == F(1, 6)            # D: one ordering, condition ignored
tri = prob(lambda lo, mid, hi: [sub(sub(lo, (0, 0, 0)), sub(hi, mid))])  # lo + mid - hi > 0
assert tri == F(1, 4)                    # E: chance the pieces make a triangle
print("traps: 1/20, 1/12, 1/6, triangle chance =", tri)
# stricter: c < 2a implies c < a + b (since a <= b)
assert ans < tri

# --- Variant: longest < 3 x shortest ---
v = prob(ratio(3))
assert v == F(8, 35), v
assert walk(F(1, 5)) == F(2, 5) and walk(F(1, 7)) == F(4, 7) and F(2, 5) * F(4, 7) == F(8, 35)
Gv = dict(region(PIECES_TOP, (-1, 1, 0), ratio(3)))[(0, 1, 2)]
assert set(Gv) == {(20, 40), (12, 24), (F(60, 7), F(240, 7))}, Gv  # pieces (12,12,36), (60/7,180/7,180/7)
print("variant P(longest < 3 shortest) =", v)

# --- Monte Carlo (seeded) ---
rng = random.Random(981)
N = 2_000_000
hit = hit3 = 0
for _ in range(N):
    u, w = rng.random(), rng.random()
    a, b = min(u, w), max(u, w)
    p = (a, b - a, 1 - b)
    lo, hi = min(p), max(p)
    hit += hi < 2 * lo
    hit3 += hi < 3 * lo
mc, mc3 = hit / N, hit3 / N
print(f"Monte Carlo: {mc:.4f} (1/10), {mc3:.4f} (8/35 = {8/35:.4f})")
assert abs(mc - 0.1) < 0.002 and abs(mc3 - 8 / 35) < 0.003

# bank: correct_index 2 -> 1/10
choices = [F(1, 20), F(1, 12), F(1, 10), F(1, 6), F(1, 4)]
assert choices.index(ans) == 2
print("ALL CHECKS PASS: answer C = 1/10, variant 8/35")
