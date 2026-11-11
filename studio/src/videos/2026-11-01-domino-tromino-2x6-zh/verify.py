"""Check: tile a 2x6 board with dominoes and L-trominoes (amc10 counting c2-017), every number shown."""
from functools import lru_cache

DOM = [[(0, 0), (0, 1)], [(0, 0), (1, 0)]]
L = [[(0, 0), (1, 0), (1, 1)], [(0, 0), (0, 1), (1, 0)], [(0, 0), (0, 1), (1, 1)], [(0, 1), (1, 0), (1, 1)]]
SQ = [[(0, 0), (0, 1), (1, 0), (1, 1)]]


def brute(n, shapes, cells=None):
    """Count exact covers of `cells` (default: the 2 x n board; row 0 = top) by translates of `shapes`."""
    cells = sorted(cells or [(r, c) for c in range(n) for r in range(2)], key=lambda p: (p[1], p[0]))
    index = {p: i for i, p in enumerate(cells)}

    @lru_cache(None)
    def go(filled):
        i = next((i for i in range(len(cells)) if not filled >> i & 1), None)
        if i is None:
            return 1
        r0, c0 = cells[i]
        total = 0
        for sh in shapes:
            a = min(sh, key=lambda p: (p[1], p[0]))  # first cell in column-major order sits on the first empty cell
            pts = [(r + r0 - a[0], c + c0 - a[1]) for r, c in sh]
            if all(p in index and not filled >> index[p] & 1 for p in pts):
                total += go(filled | sum(1 << index[p] for p in pts))
        return total

    return go(0)


# Question. Bank choices, correct_index 2 -> 53.
choices = [13, 50, 53, 59, 117]
assert brute(6, DOM + L) == 53 and choices[2] == 53
assert len(L) == 4  # an L can be turned four ways

# Solution 1: the tile on the top-left square.
# Only 2 of the 3 L's that contain the top-left cell work; the third (top-left, top-right, bottom-right of the 2x2 box)
# strands the bottom-left cell.
f = [brute(n, DOM + L) for n in range(9)]
assert f[:8] == [1, 1, 2, 5, 11, 24, 53, 117]
# zigzag blocks: L, lying dominoes, L. Exactly 2 per width w >= 3 (mirror twins), and they can't be cut.
def unbreakable(n):
    """Covers of 2 x n with no vertical cut line between columns that crosses no tile."""
    return f[n] - sum(unbreakable(k) * f[n - k] for k in range(1, n))
assert [unbreakable(w) for w in range(1, 7)] == [1, 1, 2, 2, 2, 2]  # standing domino, lying pair, zigzags
for n in range(1, 8):
    assert f[n] == f[n - 1] + (f[n - 2] if n >= 2 else 0) + 2 * sum(f[:max(n - 2, 0)])
assert 2 + 1 + 2 * 1 == 5
assert 5 + 2 + 2 * (1 + 1) == 11
assert 11 + 5 + 2 * (2 + 1 + 1) == 24 and 2 + 1 + 1 == 4 and 2 * 4 == 8
assert 5 + 2 + 1 + 1 == 9 and 2 * 9 == 18 and 24 + 11 + 18 == 53

# Solution 2: flat boards f and bumpy boards g (flat 2 x m plus one square sticking out on the left, top row).
def bumpy(m):
    return brute(m, DOM + L, [(0, -1)] + [(r, c) for c in range(m) for r in range(2)])
g = [bumpy(m) for m in range(6)]
assert g[:5] == [0, 1, 2, 4, 9]
for m in range(1, 6):
    assert g[m] == g[m - 1] + f[m - 1]          # lone square: lying domino -> bumpy one shorter; L -> flat one shorter
for n in range(2, 8):
    assert f[n] == f[n - 1] + f[n - 2] + 2 * g[n - 2]
assert 1 + 1 == 2 and 2 + 2 == 4 and 4 + 5 == 9
assert 2 + 1 + 2 * 1 == 5 and 5 + 2 + 2 * 2 == 11 and 11 + 5 + 2 * 4 == 24 and 24 + 11 + 2 * 9 == 53

# Traps. A 13 = dominoes only (1, 2, 3, 5, 8, 13). E 117 = the 2 x 7 board. B 50, D 59: no correct count.
assert [brute(n, DOM) for n in range(1, 7)] == [1, 2, 3, 5, 8, 13]
assert 11 + 5 + 2 + 1 + 1 == 20 and 53 + 24 + 2 * 20 == 117 == f[7]

# Variant: 2 x 5 with dominoes, L-trominoes AND 2 x 2 squares -> 41.
v = [brute(n, DOM + L + SQ) for n in range(6)]
assert v == [1, 1, 3, 7, 17, 41]
for n in range(2, 6):
    assert v[n] == v[n - 1] + 2 * v[n - 2] + 2 * sum(v[:n - 2])  # square = a second two-wide start; zigzags unchanged
assert 1 + 2 * 1 == 3 and 3 + 2 * 1 + 2 * 1 == 7
assert 7 + 2 * 3 + 2 * (1 + 1) == 17 and 17 + 2 * 7 + 2 * (3 + 1 + 1) == 41
assert 41 not in choices
print("ok")
