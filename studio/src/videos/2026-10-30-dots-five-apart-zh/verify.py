"""Brute force: pairs of dots exactly 5 apart on a 5x5 grid, every number the video shows, and the 6x6 variant."""
from itertools import combinations
from math import sqrt


def grid(n):
    return [(x, y) for y in range(n) for x in range(n)]


def d2(p, q):
    return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2


def pairs(n, dist=5):
    return [(p, q) for p, q in combinations(grid(n), 2) if d2(p, q) == dist * dist]


def offsets_fit(n, dist=5):
    """Unordered offsets (dx, dy) with dy >= 0 (and dx > 0 when dy == 0), each with its number of placements."""
    out = {}
    for dx in range(-(n - 1), n):
        for dy in range(0, n):
            if dy == 0 and dx <= 0:
                continue
            if dx * dx + dy * dy == dist * dist:
                out[(dx, dy)] = (n - abs(dx)) * (n - dy)
    return out


# --- The question: 25 dots, 0..4 in each direction. Bank answer index 3 = 8.
P = grid(5)
assert len(P) == 25
ans = len(pairs(5))
assert ans == 8, ans
choices = [2, 4, 6, 8, 16]
assert choices.index(ans) == 3

# Solution 1: whole-number steps a, b (0..4) with a^2 + b^2 = 25. Only 3 and 4 work.
assert [(a, b) for a in range(5) for b in range(a, 5) if a * a + b * b == 25] == [(3, 4)]
# The ladder of tries: 25 - a^2 must be a square <= 16.
assert [25 - a * a for a in range(5)] == [25, 24, 21, 16, 9]
# Straight 5 doesn't fit: a row of 5 dots is only 4 units long; even the long diagonal is about 5.66.
assert max(abs(p[0] - q[0]) for p in P for q in P) == 4
assert round(sqrt(32), 2) == 5.66 and sqrt(32) > 5
# Four slants (going down from the upper dot): 3 right 4 down, 3 left 4 down, 4 right 3 down, 4 left 3 down.
off = offsets_fit(5)
assert off == {(3, 4): 2, (-3, 4): 2, (4, 3): 2, (-4, 3): 2}, off
assert sum(off.values()) == 4 * 2 == 8
# A 3-wide, 4-tall box fits 2 * 1 = 2 ways; a 4-wide, 3-tall box 1 * 2 = 2 ways; each box has 2 diagonals.
assert (5 - 3) * (5 - 4) == 2 and (5 - 4) * (5 - 3) == 2 and (2 + 2) * 2 == 8

# Solution 2: dot by dot. Partners per dot; corners have 2, the dot next to a corner on the edge has 1.
part = {p: sum(1 for q in P if d2(p, q) == 25) for p in P}
rows = [[part[(x, y)] for x in range(5)] for y in range(5)]
assert rows == [[2, 1, 0, 1, 2], [1, 0, 0, 0, 1], [0] * 5, [1, 0, 0, 0, 1], [2, 1, 0, 1, 2]], rows
assert part[(0, 0)] == 2 and part[(2, 2)] == 0
assert [q for q in P if d2((0, 0), q) == 25] == [(4, 3), (3, 4)] and [q for q in P if d2((1, 0), q) == 25] == [(4, 4)]
assert 4 * 2 + 8 * 1 == 16 == sum(part.values())
assert 16 // 2 == 8
assert sum(1 for v in part.values() if v) == 12  # dots with any partner

# Traps.
assert 1 * 2 == 2                       # 2: only one slant (3 right, 4 down), in its 2 places
assert 2 * 2 == 4                       # 4: only (3,4) and (4,3) with no minus signs: slants leaning one way
assert 12 // 2 == 6                     # 6: twelve dots have a partner, halved (but corners have two partners)
ordered = sum(1 for p in P for q in P if d2(p, q) == 25)
assert ordered == 16 == 2 * ans         # 16: each pair counted from both ends (ordered pairs)
# If you thought a row of 5 dots was 5 long: 5 rows + 5 columns more = 18 (not a choice).
assert 8 + 5 + 5 == 18 and 18 not in choices

# --- Variant: 36 dots, 6 by 6 (0..5). Now straight 5s fit too.
V = pairs(6)
assert len(V) == 36, len(V)
voff = offsets_fit(6)
assert voff == {(5, 0): 6, (0, 5): 6, (3, 4): 6, (-3, 4): 6, (4, 3): 6, (-4, 3): 6}, voff
assert 6 + 6 == 12                       # straight: one pair per row (ends), six rows; same for columns
assert (6 - 3) * (6 - 4) == 6            # a 3-wide 4-tall box fits 3 * 2 = 6 ways; 4-wide 3-tall also 6
assert (6 + 6) * 2 == 24 and 12 + 24 == 36
# Without the straight ones you'd say 24.
assert sum(v for (dx, dy), v in voff.items() if dx and dy) == 24
assert 36 not in choices
print("question:", ans, "ordered:", ordered, "variant:", len(V))
print("ok")
