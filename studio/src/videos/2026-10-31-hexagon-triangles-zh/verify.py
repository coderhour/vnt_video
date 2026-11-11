"""Check: triangles of every size in a side-2 hexagon cut into 24 (amc8 counting c1-520).
Lattice: point (i, j) sits at x = i + j/2, y = j*sqrt(3)/2 (maths y up). Up triangle side s: (i,j),(i+s,j),(i,j+s);
down triangle side s: (i,j),(i+s,j),(i+s,j-s). Every lattice line through the shape is drawn, so any lattice triangle
inside the (convex) shape is in the figure."""
from collections import Counter


def count(inside, n=8):
    c = Counter(); where = {}
    for s in range(1, n):
        for i in range(-n, n + 1):
            for j in range(-n, n + 1):
                if inside(i, j) and inside(i + s, j) and inside(i, j + s):
                    c[(s, 'up')] += 1; where.setdefault((s, 'up'), []).append(((i, j), (i + s, j), (i, j + s)))
                if inside(i, j) and inside(i + s, j) and inside(i + s, j - s):
                    c[(s, 'down')] += 1; where.setdefault((s, 'down'), []).append(((i, j), (i + s, j), (i + s, j - s)))
    return c, where


hexa = lambda i, j: abs(i) <= 2 and abs(j) <= 2 and abs(i + j) <= 2
c, where = count(hexa)
assert dict(c) == {(1, 'up'): 12, (1, 'down'): 12, (2, 'up'): 6, (2, 'down'): 6, (3, 'up'): 1, (3, 'down'): 1}
assert sum(c.values()) == 38
choices = [24, 30, 32, 36, 38]
assert choices[4] == 38                                         # bank correct_index 4

# Solution 1 by size
assert 12 + 12 == 24 and 6 + 6 == 12 and 1 + 1 == 2 and 24 + 12 + 2 == 38
# size 2: six "wedge" triangles have a corner at the centre (0,0); six more do not
wedge = [t for k in [(2, 'up'), (2, 'down')] for t in where[k] if (0, 0) in t]
assert len(wedge) == 6
assert sum(1 for t in where[(2, 'up')] if (0, 0) in t) == 3      # wedges alternate up/down
# the other six have the centre (0,0) at the middle of one of their sides
other = [t for k in [(2, 'up'), (2, 'down')] for t in where[k] if (0, 0) not in t]
assert len(other) == 6
# size 3: corners at the midpoints of alternate hexagon sides
assert where[(3, 'up')] == [((-1, -1), (2, -1), (-1, 2))]
assert where[(3, 'down')] == [((-2, 1), (1, 1), (1, -2))]

# Solution 2: count pointing-up only, then double (turning the hexagon upside down swaps up and down)
up = c[(1, 'up')] + c[(2, 'up')] + c[(3, 'up')]
assert up == 12 + 6 + 1 == 19 and 2 * 19 == 38
assert all(hexa(-i, -j) for i in range(-2, 3) for j in range(-2, 3) if hexa(i, j))

# Traps
assert 24 + 6 + 2 == 32                                          # C: size 2 in only one direction
assert 24 + 12 == 36                                             # D: forgets the two big ones
assert 24 + 6 == 30                                              # B: only the 6 wedge triangles of size 2
# A: only the 24 small ones

# Variant: a triangle of side 4 cut into 16 small triangles
tri4 = lambda i, j: i >= 0 and j >= 0 and i + j <= 4
v, _ = count(tri4)
assert dict(v) == {(1, 'up'): 10, (1, 'down'): 6, (2, 'up'): 6, (2, 'down'): 1, (3, 'up'): 3, (4, 'up'): 1}
assert 10 + 6 == 16 and 6 + 1 == 7 and 16 + 7 + 3 + 1 == 27
assert 1 + 2 + 3 + 4 == 10 and 1 + 2 + 3 == 6                     # up smalls by rows, down smalls by rows
print("ok")
assert all(((t[1][0] + t[2][0]) / 2, (t[1][1] + t[2][1]) / 2) == (0, 0) or ((t[0][0] + t[1][0]) / 2, (t[0][1] + t[1][1]) / 2) == (0, 0)
           or ((t[0][0] + t[2][0]) / 2, (t[0][1] + t[2][1]) / 2) == (0, 0) for t in other)
print("ok centres")
# each of those six has one corner at the middle of a hexagon side, a different side each time
mids = {(1, 1), (-1, 2), (-2, 1), (-1, -1), (1, -2), (2, -1)}
hits = [m for t in other for m in t if m in mids]
assert len(hits) == 6 and set(hits) == mids
# no side-4 triangle: a side-4 edge must lie on one of the three length-4 lines through the centre,
# and the hexagon reaches only 2 rows beyond that line
assert c[(4, 'up')] == 0 and c[(4, 'down')] == 0
print("ok sides")
