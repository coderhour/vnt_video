"""Verify amc_practice_amc8_mock_test_template:c2-441 and its variant.

Rectangle ABCD (A bottom-left, B bottom-right, C top-right, D top-left), P inside.
Claim: [PAB] + [PCD] = [PBC] + [PDA] = half the rectangle, wherever P is.
"""
import random
from fractions import Fraction as F


def area(*pts):
    """Shoelace area of a polygon."""
    s = 0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        s += x1 * y2 - x2 * y1
    return abs(F(s)) / 2


def four(w, h, p):
    A, B, C, D = (0, 0), (w, 0), (w, h), (0, h)
    return area(p, A, B), area(p, B, C), area(p, C, D), area(p, D, A)


# 1. The identity, for many random rectangles and points (exact fractions).
rng = random.Random(1)
for _ in range(20000):
    w, h = F(rng.randint(1, 400), 7), F(rng.randint(1, 400), 9)
    p = (w * F(rng.randint(1, 999), 1000), h * F(rng.randint(1, 999), 1000))
    ab, bc, cd, da = four(w, h, p)
    assert ab + cd == bc + da == w * h / 2
print("identity: PAB + PCD = PBC + PDA = rectangle / 2 holds for 20000 random cases")

# 2. The question: 15, 22, 25 -> PDA. Any rectangle w*h = 80 works; the bank figure is 10 x 8, P = (4.5, 3).
ab, bc, cd, da = four(10, 8, (F(9, 2), 3))
assert (ab, bc, cd) == (15, 22, 25), (ab, bc, cd)
print("figure 10 x 8, P = (4.5, 3): areas", ab, bc, cd, da)
ans = 15 + 25 - 22
assert ans == da == 18 and 80 - (15 + 22 + 25) == 18
# Solve for P in several other rectangles of area 80: PDA is always 18.
for w in [F(1), F(4), F(5), F(10), F(16), F(40)]:
    h = 80 / w
    y = 2 * F(15) / w  # [PAB] = w*y/2
    x = 2 * F(22) / h  # [PBC] = h*(w - x)/2  ->  w - x = 44/h
    x = w - x
    if 0 < x < w and 0 < y < h:
        a = four(w, h, (x, y))
        assert a[:3] == (15, 22, 25) and a[3] == 18, a
print("answer:", ans, "(bank correct_index 2 -> choice 18)")
choices = [12, 15, 18, 22, 28]
assert choices[2] == ans

# 3. Trap checks: each wrong choice breaks "opposite pairs have the same total" (15 + 25 = 40).
for v in choices:
    print(f"  choice {v}: 22 + {v} = {22 + v}  {'== 40 OK' if 22 + v == 40 else '!= 40 wrong'}")
assert 15 + 22 - 25 == 12            # trap: neighbours paired (15 + 22 = 25 + ?)
assert 22 + 28 == 50 and 15 + 22 == 37
# Left and right match only when P is halfway across (x = w/2): 18 vs 22, x = 4.5 of 10.
assert four(10, 8, (5, 3))[1] == four(10, 8, (5, 3))[3]

# 4. Solution 2 (cut into four small rectangles): each small rectangle's diagonal from P halves it,
#    one half in a top/bottom triangle, the other in a left/right triangle.
w, h, px, py = F(10), F(8), F(9, 2), F(3)
small = {"A": (px, py), "B": (w - px, py), "C": (w - px, h - py), "D": (px, h - py)}
halves_tb = sum(a * b / 2 for a, b in small.values())
assert halves_tb == w * h / 2 == 40
print("four small rectangles:", {k: a * b for k, (a, b) in small.items()}, "half of each sums to", halves_tb)

# 5. Slide P straight up (Solution 1 animation): bottom grows, top shrinks, sum stays 40; sides don't change.
for y in [F(1), F(2), F(3), F(5), F(7)]:
    ab, bc, cd, da = four(10, 8, (F(9, 2), y))
    assert ab + cd == 40 and (bc, da) == (22, 18)
print("slide P up: bottom + top stays 40, left/right stay 18/22")

# 6. Variant: PAB = 9, PBC = 20, PDA = 16 -> PCD = ?, rectangle = ?
pcd = 16 + 20 - 9
rect = 2 * (16 + 20)
assert (pcd, rect) == (27, 72)
a = four(9, 8, (4, 2))  # a concrete picture: 9 x 8 rectangle, P = (4, 2)
assert a == (9, 20, 27, 16), a
assert sum(a) == rect
print("variant: PCD =", pcd, " rectangle =", rect, " (9 x 8, P = (4, 2) gives", a, ")")
print("ALL CHECKS PASSED")
