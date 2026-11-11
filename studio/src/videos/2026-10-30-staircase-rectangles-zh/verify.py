"""Brute-force check: rectangles inside a left-aligned staircase of unit squares.

Cells are (col, row), both counted from 1; col from the left, row from the BOTTOM.
The question's staircase has rows of 5, 4, 3, 2, 1 from the bottom up.
"""
from itertools import product


def stair(n):
    """Rows of n, n-1, ..., 1 from the bottom, lined up on the left."""
    return {(c, r) for r in range(1, n + 1) for c in range(1, n + 2 - r)}


def rectangles(cells):
    """Every rectangle (c1, c2, r1, r2) whose cells are all in the shape."""
    cols = sorted({c for c, _ in cells})
    rows = sorted({r for _, r in cells})
    out = []
    for c1, c2, r1, r2 in product(cols, cols, rows, rows):
        if c1 <= c2 and r1 <= r2 and all((c, r) in cells for c in range(c1, c2 + 1) for r in range(r1, r2 + 1)):
            out.append((c1, c2, r1, r2))
    return out


tri = lambda n: n * (n + 1) // 2


def by_layers(n):
    """Solution 1: sort by height h. A band of h rows is as wide as its TOP row; a strip of w holds tri(w)."""
    per_h = [sum(tri(n + 1 - top) for top in range(h, n + 1)) for h in range(1, n + 1)]
    return per_h


def by_corner(n):
    """Solution 2: top-right cell (b, d) gives b*d choices of bottom-left cell. Column sums."""
    return [sum(b * d for d in range(1, n + 2 - b)) for b in range(1, n + 1)]


for n, expect in [(5, 70), (6, 126)]:
    cells = stair(n)
    rects = rectangles(cells)
    layers, cols = by_layers(n), by_corner(n)
    heights = [sum(1 for r in rects if r[3] - r[2] + 1 == h) for h in range(1, n + 1)]
    print(f"staircase {n}: {len(cells)} cells, {len(rects)} rectangles; by height {heights}; layers {layers}; columns {cols}")
    assert len(rects) == expect == sum(layers) == sum(cols)
    assert heights == layers
    # each column sum is b times 1+2+...+(height of column b)
    assert cols == [b * tri(n + 1 - b) for b in range(1, n + 1)]
    # the corner rule is a bijection: each rectangle <-> (top-right cell, bottom-left cell)
    assert sorted((c2, r2, c1, r1) for c1, c2, r1, r2 in rects) == sorted(
        (b, d, c, r) for (b, d) in cells for c in range(1, b + 1) for r in range(1, d + 1))

assert by_layers(5) == [35, 20, 10, 4, 1]
assert by_corner(5) == [15, 20, 18, 12, 5]
assert by_corner(6) == [21, 30, 30, 24, 15, 6]

# Bank: choices 15/35/55/70/75, correct_index 3 -> 70.
choices = [15, 35, 55, 70, 75]
assert choices[3] == len(rectangles(stair(5))) == 70
rects = rectangles(stair(5))
unit = sum(1 for c1, c2, r1, r2 in rects if c1 == c2 and r1 == r2)
one_tall = sum(1 for c1, c2, r1, r2 in rects if r1 == r2)
one_wide = sum(1 for c1, c2, r1, r2 in rects if c1 == c2)
thin = sum(1 for c1, c2, r1, r2 in rects if r1 == r2 or c1 == c2)
assert (unit, one_tall, one_wide, thin) == (15, 35, 35, 55)
print("traps: 15 = unit squares only; 35 = only one-row-tall strips (each row 15+10+6+3+1);",
      "55 = only strips one square thick (35 + 35 - 15 counted twice); 75 > 70 = too many")
# 75: a natural over-count -- a 2-tall rectangle in the bottom two rows using the bottom row's width 5
# instead of the top row's 4 gives tri(5) - tri(4) = 5 extra.
assert 70 + tri(5) - tri(4) == 75
print("ok")
