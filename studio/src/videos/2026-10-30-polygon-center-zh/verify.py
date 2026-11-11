"""Brute-force check: 4 of the 13 vertices of a regular 13-gon; does the quadrilateral contain the center?

Question: amc_practice_amc10_mock_test_template:c2-007 (correct_index 2 = 455).
Run: python3 verify.py   (asserts everything the video says)
"""
from itertools import combinations
from math import comb, cos, pi, sin


def pts(n, idx):
    return [(cos(2 * pi * i / n), sin(2 * pi * i / n)) for i in idx]


def contains_center(n, idx):
    """Geometry: the origin is strictly inside the convex polygon (vertices in circle order)."""
    p = pts(n, sorted(idx))
    k = len(p)
    signs = []
    for i in range(k):
        (ax, ay), (bx, by) = p[i], p[(i + 1) % k]
        cr = ax * by - ay * bx  # cross(a, b) = which side of edge a->b the origin is on
        assert abs(cr) > 1e-9, "center on an edge (cannot happen for odd n)"
        signs.append(cr > 0)
    return all(signs)


def gaps(n, idx):
    s = sorted(idx)
    return [(s[(i + 1) % len(s)] - s[i]) % n or n for i in range(len(s))]


def in_half(n, idx):
    """All chosen vertices fit in (n-1)/2 steps = some 'first vertex + next (n-1)/2 vertices'."""
    h = (n - 1) // 2
    return any(all((v - a) % n <= h for v in idx) for a in idx)


def first_vertices(n, idx):
    h = (n - 1) // 2
    return [a for a in idx if all((v - a) % n <= h for v in idx)]


def check(n, k):
    sets = list(combinations(range(n), k))
    h = (n - 1) // 2
    good = [s for s in sets if contains_center(n, s)]
    bad = [s for s in sets if not contains_center(n, s)]
    # criterion: misses the center <=> all in a half <=> some gap is more than half (>= h+1 steps)
    for s in sets:
        assert (not contains_center(n, s)) == in_half(n, s) == (max(gaps(n, s)) >= h + 1)
        assert sum(gaps(n, s)) == n
        assert sum(g >= h + 1 for g in gaps(n, s)) <= 1  # at most one big gap
    # Solution 1: each bad set has exactly one first vertex; the others are among the next h
    for s in bad:
        assert len(first_vertices(n, s)) == 1
    assert len(bad) == n * comb(h, k - 1)
    # Solution 2: count by the size of the big gap; the other k-1 gaps fill the rest (each >= 1)
    by_gap = {g: comb(n - g - 1, k - 2) for g in range(h + 1, n - k + 2)}
    for g, ways in by_gap.items():
        brute = sum(1 for s in bad if max(gaps(n, s)) == g)
        assert brute == n * ways, (g, brute, ways)
    assert sum(by_gap.values()) == comb(h, k - 1)
    return len(sets), len(bad), len(good), by_gap


total, bad, good, by_gap = check(13, 4)
assert (total, bad, good) == (715, 260, 455)
assert 13 * 12 * 11 * 10 // 24 == 715 and 13 * 12 * 11 * 10 % 24 == 0
assert comb(6, 3) == 6 * 5 * 4 // 6 == 20
assert by_gap == {7: 10, 8: 6, 9: 3, 10: 1}
print(f"13-gon, 4 vertices: total {total}, miss {bad} = 13 x 20, contain {good}")
print(f"  by big gap: {by_gap} -> {sum(by_gap.values())} per position")

# Bank's answer: choices 260, 390, 455, 520, 715; correct_index 2
choices = [260, 390, 455, 520, 715]
assert choices[2] == good

# Traps
assert choices[4] == comb(13, 4)                 # E: every choice, no condition
assert choices[0] == bad                         # A: the misses, forgot to subtract
assert choices[3] == 715 - 13 * comb(6, 4)       # D: picked all four from the next six (forgot the first vertex is one of the four)
assert comb(6, 4) == 15 and 13 * 15 == 195
assert choices[1] == 715 - 325 and 325 != bad    # B: would need 325 misses; no correct count gives that
print("traps: A=misses 260, B needs 325 misses, D=715-13*C(6,4)=520, E=total 715")

# A half of the 13-gon: 6.5 steps, so a half holds at most 7 vertices (6 steps)
assert max(len(first_vertices(13, s)) for s in combinations(range(13), 4)) == 1

# Variant: 3 of the 11 vertices of a regular 11-gon, triangle contains the center
vt, vb, vg, vgap = check(11, 3)
assert (vt, vb, vg) == (165, 110, 55)
assert 11 * 10 * 9 // 6 == 165 and comb(5, 2) == 5 * 4 // 2 == 10
print(f"variant 11-gon, triangles: total {vt}, miss {vb} = 11 x 10, contain {vg}")

# a few sanity checks on other sizes (the method in general)
for n in (5, 7, 9, 11, 15):
    for k in (3, 4):
        t, b, g, _ = check(n, k)
        assert g == comb(n, k) - n * comb((n - 1) // 2, k - 1)
print("all checks passed")
