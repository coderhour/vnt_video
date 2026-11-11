"""Brute-force check: routes from A to B on a 5-by-3 street grid, right/up only, avoiding corner X.

Question: amc_practice_amc8_mock_test_template:c2-479 (correct_index 1 = 26).
Figure: A = (0, 0) bottom-left, B = (5, 3) top-right, X = (2, 1) (svg circle at 130,130; 50 px per block).
Run: python3 verify.py   (asserts every number the video says)
"""
from itertools import combinations
from math import comb


def routes(w, h):
    """Every route as a string of R/U steps (brute force: pick which steps are U)."""
    out = []
    for ups in combinations(range(w + h), h):
        out.append("".join("U" if i in ups else "R" for i in range(w + h)))
    return out


def corners(route):
    x = y = 0
    pts = [(0, 0)]
    for s in route:
        x, y = (x + 1, y) if s == "R" else (x, y + 1)
        pts.append((x, y))
    return pts


def avoid(w, h, bad):
    return [r for r in routes(w, h) if bad not in corners(r)]


def table(w, h, bad):
    """Corner numbers: ways to reach each corner = from the left + from below, 0 at the bad corner."""
    T = {}
    for y in range(h + 1):
        for x in range(w + 1):
            if (x, y) == bad:
                T[x, y] = 0
            elif x == 0 and y == 0:
                T[x, y] = 1
            else:
                T[x, y] = T.get((x - 1, y), 0) + T.get((x, y - 1), 0)
    return T


W, H, X = 5, 3, (2, 1)
CHOICES = [20, 26, 30, 35, 56]
CORRECT = 1

all_r = routes(W, H)
assert len(all_r) == 56 == comb(8, 3) == 8 * 7 * 6 // (3 * 2 * 1)
assert all(len(r) == 8 and r.count("R") == 5 and r.count("U") == 3 for r in all_r)

through = [r for r in all_r if X in corners(r)]
assert len(through) == 30
# A -> X: 2 rights, 1 up = 3 ways (RRU, RUR, URR); X -> B: 3 rights, 2 ups = 10 ways
assert sorted(routes(2, 1)) == ["RRU", "RUR", "URR"]
assert all(sorted(r[:3]) == ["R", "R", "U"] for r in through)  # every route through X starts with a route A -> X
assert len(routes(3, 2)) == 10 == 5 * 4 // 2
assert len(through) == 3 * 10

good = avoid(W, H, X)
assert len(good) == 26 == 56 - 30
assert CHOICES[CORRECT] == len(good)

# Solution 1: corner numbers with a 0 at X
T = table(W, H, X)
rows = [[T[x, y] for x in range(W + 1)] for y in range(H + 1)]
assert rows == [[1, 1, 1, 1, 1, 1], [1, 2, 0, 1, 2, 3], [1, 3, 3, 4, 6, 9], [1, 4, 7, 11, 17, 26]], rows
T0 = table(W, H, None)
assert T0[W, H] == 56
assert T0[2, 1] == 3

# Above / below split (side check): pass under X via (3, 0), or over it
below = [r for r in good if (3, 0) in corners(r)]
assert len(below) == 10 and len(good) - len(below) == 16

# Traps
assert len(through) == 30          # C: counted the routes THROUGH X
assert len(all_r) == 56            # E: ignored X
assert comb(7, 3) == 35            # D: every route on a grid 4 blocks wide (miscounted the blocks), no X rule
assert comb(6, 3) == 20            # A: every route on a grid 3 blocks wide (miscounted the blocks), no X rule
assert 56 - (3 + 10) == 43         # adding 3 + 10 instead of multiplying gives 43: not even a choice

# Variant: 4-by-4 grid, X at the centre (2, 2)
vr = routes(4, 4)
assert len(vr) == 70 == comb(8, 4) == 8 * 7 * 6 * 5 // (4 * 3 * 2 * 1)
vthrough = [r for r in vr if (2, 2) in corners(r)]
assert len(routes(2, 2)) == 6 and len(vthrough) == 36 == 6 * 6
vgood = avoid(4, 4, (2, 2))
assert len(vgood) == 34 == 70 - 36
VT = table(4, 4, (2, 2))
assert VT[4, 4] == 34
print("variant corner table:", [[VT[x, y] for x in range(5)] for y in range(5)])
print("all checks pass: 56 total, 30 through X, answer 26 (choice B); variant 70 - 36 = 34")
