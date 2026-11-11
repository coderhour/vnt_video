"""Brute-force check: squares with all four corners on an R x C dot grid."""
from itertools import combinations


def count_squares(rows, cols):
    dots = {(x, y) for x in range(cols) for y in range(rows)}
    found = set()
    for a, b in combinations(sorted(dots), 2):
        dx, dy = b[0] - a[0], b[1] - a[1]
        c, d = (b[0] - dy, b[1] + dx), (a[0] - dy, a[1] + dx)  # rotate side ab by 90 degrees
        if c in dots and d in dots:
            found.add(frozenset([a, b, c, d]))
    return found


def by_box(sq):
    """Bounding box size of a square, and whether it is upright."""
    xs = [p[0] for p in sq]
    return max(xs) - min(xs), len(set(xs)) == 2


def box_formula(rows, cols):
    """A k x k box holds k squares (1 upright + k-1 tilted); there are (cols-k)(rows-k) boxes."""
    return sum((cols - k) * (rows - k) * k for k in range(1, min(rows, cols)))


for rows, cols, expect in [(4, 5, 30), (5, 5, 50)]:
    sq = count_squares(rows, cols)
    upright = sum(1 for s in sq if by_box(s)[1])
    print(f"{rows}x{cols} dots: {len(sq)} squares ({upright} upright, {len(sq) - upright} tilted)")
    assert len(sq) == expect == box_formula(rows, cols)

# Bank: 4 rows x 5 dots, choices 20/24/26/30/40, correct_index 3 -> 30. Trap values:
sq = count_squares(4, 5)
tilted_small = sum(1 for s in sq if by_box(s) == (2, False))   # tilted in 2x2 boxes
tilted_big = sum(1 for s in sq if by_box(s) == (3, False))     # tilted in 3x3 boxes
assert (20, 30 - tilted_small, 30 - tilted_big) == (20, 24, 26)
print("traps: 20 (no tilted), 24 (missing", tilted_small, "small tilted), 26 (missing", tilted_big, "big tilted)")
print("ok")
