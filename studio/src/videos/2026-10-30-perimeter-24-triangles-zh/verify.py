"""Brute force: whole-number triangles with a given perimeter, and every number the video shows."""
from collections import Counter


def triangles(p):
    """All (a, b, c) with a <= b <= c, a + b + c = p, a + b > c (a real, non-flat triangle)."""
    return [(a, b, p - a - b) for a in range(1, p) for b in range(a, p)
            if b <= p - a - b and a + b > p - a - b]


def by_longest(p):
    return dict(sorted(Counter(c for _, _, c in triangles(p)).items(), reverse=True))


def partitions3(n):
    """Ways to split n into three positive whole numbers, order ignored (x >= y >= z >= 1)."""
    return [(x, y, n - x - y) for x in range(1, n) for y in range(1, x + 1) if 1 <= n - x - y <= y]


# ---- Question: perimeter 24. Choices 10, 11, 12, 13, 19; correct_index 2 -> 12.
T = triangles(24)
assert len(T) == 12 and [10, 11, 12, 13, 19].index(len(T)) == 2
print("perimeter 24:", T)

# Limits for the longest side c: c is the biggest, so 3c >= 24 -> c >= 8.
# The other two add to 24 - c and must beat c, so 24 - c > c -> c < 12 (half the perimeter).
assert min(c for *_, c in T) == 8 and max(c for *_, c in T) == 11
assert all(3 * c >= 24 and 24 - c > c for *_, c in T)
assert 3 * 7 < 24          # longest 7 is impossible: 7 + 7 + 7 = 21 is too short
assert 12 + 12 == 24       # longest 12: other two add to 12, so it lies flat (6, 6, 12)

# Solution 1: organized list by longest side.
L = {11: [(2, 11), (3, 10), (4, 9), (5, 8), (6, 7)],
     10: [(4, 10), (5, 9), (6, 8), (7, 7)],
     9: [(6, 9), (7, 8)],
     8: [(8, 8)]}
assert by_longest(24) == {11: 5, 10: 4, 9: 2, 8: 1}
for c, pairs in L.items():
    assert sorted((a, b, c) for a, b in pairs) == sorted(t for t in T if t[2] == c)
    assert all(a + b == 24 - c for a, b in pairs)
# For longest 11 the other two add to 13 and the middle side is at most 11 -> smallest 2 (2 + 11).
# Longest 10: add to 14, middle <= 10 -> smallest 4. Longest 9: add to 15, middle <= 9 -> smallest 6.
assert (24 - 11, 24 - 10, 24 - 9, 24 - 8) == (13, 14, 15, 16)
assert (13 - 11, 14 - 10, 15 - 9, 16 - 8) == (2, 4, 6, 8)
assert 5 + 4 + 2 + 1 == 12

# Solution 2: gaps. Gap = 12 - side (12 = half the perimeter). Each side < 12 -> each gap >= 1.
# Gaps add to 36 - 24 = 12. Any three positive gaps adding to 12 give a valid triangle.
P = partitions3(12)
assert 3 * 12 - 24 == 12 and len(P) == 12
assert sorted(tuple(sorted(12 - g for g in gaps)) for gaps in P) == sorted(T)
gap_list = [(10, 1, 1), (9, 2, 1), (8, 3, 1), (8, 2, 2), (7, 4, 1), (7, 3, 2),
            (6, 5, 1), (6, 4, 2), (6, 3, 3), (5, 5, 2), (5, 4, 3), (4, 4, 4)]
assert sorted(gap_list) == sorted(P)
# Grouped by biggest gap: 10 -> 1, 9 -> 1, 8 -> 2, 7 -> 2, 6 -> 3, 5 -> 2, 4 -> 1.
assert dict(Counter(g[0] for g in gap_list)) == {10: 1, 9: 1, 8: 2, 7: 2, 6: 3, 5: 2, 4: 1}
assert 1 + 1 + 2 + 2 + 3 + 2 + 1 == 12
assert tuple(12 - g for g in (10, 1, 1)) == (2, 11, 11) and tuple(12 - g for g in (4, 4, 4)) == (8, 8, 8)
assert tuple(12 - g for g in (5, 4, 3)) == (7, 8, 9)

# ---- Traps.
assert 12 - 2 == 10            # A: left out the two with longest side 9
assert 12 - 1 == 11            # B: left out 8, 8, 8
assert 12 + 1 == 13            # D: one trio counted twice (e.g. 7, 8, 9 again as 9, 8, 7)
assert 19 > 12                 # E: just too many
# Flat ones with longest 12 (6 of them) would give 18, not a choice -- not used in narration as a trap.
assert sum(1 for a in range(1, 13) for b in range(a, 13) if a + b == 12) == 6

# ---- Variant: perimeter 20. Half is 10 -> longest < 10; 3c >= 20 -> c >= 7 (6 + 6 + 6 = 18 too short).
V = triangles(20)
assert len(V) == 8 and by_longest(20) == {9: 4, 8: 3, 7: 1}
assert sorted(V) == sorted([(2, 9, 9), (3, 8, 9), (4, 7, 9), (5, 6, 9),
                            (4, 8, 8), (5, 7, 8), (6, 6, 8), (6, 7, 7)])
assert 3 * 6 < 20 <= 3 * 7 and 20 % 3 != 0     # no equilateral this time
assert (20 - 9, 20 - 8, 20 - 7) == (11, 12, 13) and 4 + 3 + 1 == 8
# Gap check: gaps = 10 - side add to 30 - 20 = 10; splits of 10 into three parts = 8.
assert len(partitions3(10)) == 8
assert 8 not in (10, 11, 12, 13, 19)
print("perimeter 20:", V)
print("ok")
