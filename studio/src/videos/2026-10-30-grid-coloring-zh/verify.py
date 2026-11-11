"""Brute force: 3x3 grid, centre red, side-sharing squares differ. Checks every number the video shows."""
from itertools import product
from collections import Counter

R, B, G = "RBG"
# Cells: (row, col), row 0 = top (screen order).
CELLS = [(r, c) for r in range(3) for c in range(3)]


def ok(col, cells):
    for (r, c) in cells:
        for (dr, dc) in ((0, 1), (1, 0)):
            n = (r + dr, c + dc)
            if n in col and col[n] == col[(r, c)]:
                return False
    return True


def colorings(rows, cols, fixed):
    cells = [(r, c) for r in range(rows) for c in range(cols)]
    out = []
    for combo in product(R + B + G, repeat=len(cells)):
        col = dict(zip(cells, combo))
        if all(col[k] == v for k, v in fixed.items()) and ok(col, cells):
            out.append(col)
    return out


# ---- Question: all 3^9 grids filtered by centre red  ==  all 3^8 colourings of the other squares.
sols = colorings(3, 3, {(1, 1): R})
assert len(sols) == 82
choices = [16, 32, 81, 82, 162]
assert choices.index(82) == 3          # bank correct_index = 3

TOP, LEFT, RIGHT, BOT = (0, 1), (1, 0), (1, 2), (2, 1)
EDGES = [TOP, RIGHT, BOT, LEFT]        # in ring order
CORNERS = {(0, 0): (TOP, LEFT), (0, 2): (TOP, RIGHT), (2, 2): (BOT, RIGHT), (2, 0): (BOT, LEFT)}

# Edges are never red; corners can be red.
assert all(s[e] != R for s in sols for e in EDGES)
assert any(s[k] == R for s in sols for k in CORNERS)

# ---- Solution 1: edges first (2^4 = 16 patterns), corner options 2 if neighbours match else 1.
def corner_opts(a, b):
    """A corner touches two edges, not the centre, so only its two edge neighbours rule colours out."""
    return len([x for x in R + B + G if x not in (a, b)])

assert corner_opts(B, B) == 2 and corner_opts(B, G) == 1   # red/green vs red only
pats = list(product(B + G, repeat=4))
assert len(pats) == 16 == 2 ** 4
total, groups = 0, Counter()
kinds = Counter()
for p in pats:
    e = dict(zip(EDGES, p))
    matches = sum(e[a] == e[b] for a, b in CORNERS.values())
    ways = 1
    for a, b in CORNERS.values():
        ways *= corner_opts(e[a], e[b])
    # cross-check against brute force
    assert ways == sum(all(s[k] == e[k] for k in EDGES) for s in sols)
    assert ways == 2 ** matches
    groups[matches] += 1
    total += ways
    nb = p.count(B)
    alt = p[0] == p[2] and p[1] == p[3] and p[0] != p[1]
    kind = "same" if nb in (0, 4) else "checker" if alt else "3-1" if nb in (1, 3) else "2-2 side by side"
    kinds[kind] += 1
    if kind in ("3-1", "2-2 side by side"):
        assert matches == 2
assert total == 82
assert groups == {4: 2, 0: 2, 2: 12}
assert kinds == {"same": 2, "checker": 2, "3-1": 8, "2-2 side by side": 4}
assert 16 - 2 - 2 == 12 and 8 + 4 == 12
assert 2 * 2 ** 4 == 32 and 2 * 1 == 2 and 12 * 4 == 48 and 32 + 48 + 2 == 82

# ---- Solution 2: sort by how many corners are NOT red.
by_nonred = Counter(sum(s[k] != R for k in CORNERS) for s in sols)
assert by_nonred == {0: 16, 1: 32, 2: 24, 3: 8, 4: 2}, by_nonred
assert 2 ** 4 == 16 and 4 * 2 * 4 == 32 and 4 * 2 * 2 + 2 * 2 * 2 == 24 and 4 * 2 == 8
assert 16 + 32 + 24 + 8 + 2 == 82
# two non-red corners: same side (4 pairs, 4 each) vs opposite (2 pairs, 4 each)
ks = list(CORNERS)
same_side = Counter(); opp = Counter()
for s in sols:
    nr = tuple(k for k in ks if s[k] != R)
    if len(nr) == 2:
        (r1, c1), (r2, c2) = nr
        (same_side if (r1 == r2 or c1 == c2) else opp)[nr] += 1
assert len(same_side) == 4 and set(same_side.values()) == {4}
assert len(opp) == 2 and set(opp.values()) == {4}
# a non-red corner's colour is forced: the colour its (matching) neighbours are not
for s in sols:
    for k, (a, b) in CORNERS.items():
        if s[k] != R:
            assert s[a] == s[b] and s[k] not in (s[a], R)

# ---- Traps (stories, not bank facts except 16).
assert 2 ** 4 == 16          # edges only, corners forgotten
assert 2 * 16 == 32          # only the two all-same edge patterns kept
assert 3 ** 4 == 81 == 82 - 1
assert 2 * 81 == 162 and 162 > 82

# ---- Variant: 2x3 grid, bottom-middle red. Answer 18.
v = colorings(2, 3, {(1, 1): R})
assert len(v) == 18
TM, BL, BR = (0, 1), (1, 0), (1, 2)
vg = Counter()
for p in product(B + G, repeat=3):
    e = dict(zip((TM, BL, BR), p))
    m = (e[TM] == e[BL]) + (e[TM] == e[BR])
    vg[m] += 1
    assert 2 ** m == sum(all(s[k] == e[k] for k in e) for s in v)
assert vg == {2: 2, 1: 4, 0: 2} and 2 ** 3 == 8
assert 2 * 4 + 4 * 2 + 2 * 1 == 18 and 8 + 8 + 2 == 18
assert Counter(sum(s[k] != R for k in ((0, 0), (0, 2))) for s in v) == {0: 8, 1: 8, 2: 2}
print("ok: 82; groups", dict(groups), "kinds", dict(kinds), "non-red corners", dict(sorted(by_nonred.items())), "variant 18")
