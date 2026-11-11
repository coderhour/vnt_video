"""Exact check: ant on a cube, 3 random moves, chance of ending at the far corner (+ variant)."""
from fractions import Fraction as F
from itertools import product, permutations

# Corners as (x, y, z) bits. Labels match the video's drawing:
# front face A B C D (A bottom-left, counter-clockwise), back face E F G H behind them.
LABEL = {(0, 0, 0): "A", (1, 0, 0): "B", (1, 1, 0): "C", (0, 1, 0): "D",
         (0, 0, 1): "E", (1, 0, 1): "F", (1, 1, 1): "G", (0, 1, 1): "H"}
START, FAR = (0, 0, 0), (1, 1, 1)


def step(c, axis):
    """Walk along the edge in direction axis (0 = across, 1 = up, 2 = back)."""
    c = list(c)
    c[axis] ^= 1
    return tuple(c)


def dist(c):
    return sum(c)


# Every corner has exactly 3 neighbours; the drawing's edges.
for c in LABEL:
    assert len({step(c, a) for a in range(3)}) == 3

# Question: 3 x 3 x 3 = 27 equally likely walks.
walks = list(product(range(3), repeat=3))
assert len(walks) == 27
good = []
for w in walks:
    c, path = START, [START]
    for a in w:
        c = step(c, a)
        path.append(c)
    if c == FAR:
        good.append("".join(LABEL[p] for p in path))
p = F(len(good), len(walks))
assert len(good) == 6 and p == F(2, 9), (good, p)
assert sorted(good) == ["ABCG", "ABFG", "ADCG", "ADHG", "AEFG", "AEHG"], good
# The 6 good walks are exactly the 3! orders of the three directions.
def end(w):
    c = START
    for a in w:
        c = step(c, a)
    return c


good_dirs = sorted(w for w in walks if end(w) == FAR)
assert good_dirs == sorted(permutations(range(3)))
assert 3 * 2 * 1 == 6

choices = [F(1, 27), F(1, 9), F(2, 9), F(1, 3), F(4, 9)]
assert choices.index(p) == 2  # bank correct_index

# Solution 1: must move away every time (far corner is 3 edges away, only 3 moves).
# From distance d, (3 - d) of the 3 edges lead farther away.
chain = F(1)
for d in range(3):
    chain *= F(3 - d, 3)
assert chain == F(3, 3) * F(2, 3) * F(1, 3) == F(2, 9)

# Side fact: after 3 moves the ant is always 1 or 3 edges away (odd), never at A or a distance-2 corner.
ends = {}
for w in walks:
    c = START
    for a in w:
        c = step(c, a)
    ends[dist(c)] = ends.get(dist(c), 0) + 1
assert ends == {1: 21, 3: 6}, ends

# Traps.
assert F(1, 3) ** 3 == F(1, 27)                 # 0: one route only, 1/3 each move
assert F(1, 3) * F(1, 3) == F(1, 9)             # 1: what you'd get if 2nd move were also 1/3 (one good edge)
assert F(3, 27) == F(1, 9)                      #    = counting 3 routes instead of 6
assert F(1, 1) * F(1, 1) * F(1, 3) == F(1, 3)   # 3: what you'd get if only the last move mattered
assert F(2, 3) * F(2, 3) == F(4, 9)             # 4: what you'd get if the last move also had 2 good edges
assert F(12, 27) == F(4, 9)

# Variant: each minute the ant walks one of the 3 edges OR rests (stays put), all 4 equally likely.
# Chance it is at the far corner after 3 minutes.
vwalks = list(product(range(4), repeat=3))       # 3 = rest
assert len(vwalks) == 64
vgood = 0
for w in vwalks:
    c = START
    for a in w:
        if a != 3:
            c = step(c, a)
    vgood += c == FAR
vp = F(vgood, 64)
assert vgood == 6 and vp == F(3, 32), (vgood, vp)
assert F(3, 4) * F(2, 4) * F(1, 4) == F(6, 64) == F(3, 32)
assert vp not in choices
print("question:", p, good)
print("variant:", vp)
print("ok")
