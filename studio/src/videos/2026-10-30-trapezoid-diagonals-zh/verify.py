"""Numeric check: trapezoid split by its diagonals, and every number the video shows."""
from fractions import Fraction as F
from math import isclose, sqrt


def tri(p, q, r):
    return abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2


def cross(a, c, b, d):
    """Intersection of lines AC and BD."""
    (x1, y1), (x2, y2), (x3, y3), (x4, y4) = a, c, b, d
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))


def pieces(top, bottom, top_area, shift=F(3, 2)):
    """Build a trapezoid with AB = top, DC = bottom (y up), sized so ABE has top_area."""
    # E splits the height top : bottom, so ABE's height is h * top/(top+bottom).
    h = F(2 * top_area, top) * F(top + bottom, top)
    D, C = (F(0), F(0)), (F(bottom), F(0))
    A, B = (shift, h), (shift + top, h)
    E = cross(A, C, B, D)
    return dict(ABE=tri(A, B, E), CDE=tri(C, D, E), ADE=tri(A, D, E), BCE=tri(B, C, E),
                total=(top + bottom) * h / 2, h=h, hE=h - E[1])


# Question: AB = 6, DC = 10, [ABE] = 9. Bank answer index 3 = 64. Any slant gives the same pieces.
for s in (F(0), F(3, 2), F(2), F(-1)):
    p = pieces(6, 10, 9, s)
    assert (p["ABE"], p["CDE"], p["ADE"], p["BCE"], p["total"]) == (9, 25, 15, 15, 64), p
assert ["34", "49", "54", "64", "68"].index("64") == 3
print("question pieces:", {k: str(v) for k, v in pieces(6, 10, 9).items()})

# Solution 1: similar triangles, ratio 6:10 = 3:5; areas scale by the square.
assert F(6, 10) == F(3, 5) and 9 * F(5, 3) ** 2 == 25
# Side triangles share a height with ABE, bases AE:EC = 3:5  ->  9 * 5/3 = 15.
assert 9 * F(5, 3) == 15 and 9 + 25 + 15 + 15 == 64
# Solution 2: heights. 9 = 1/2 * 6 * 3, E splits the height 3 : 5, so h = 8.
p = pieces(6, 10, 9)
assert p["hE"] == 3 and p["h"] == 8 and F(6 + 10, 2) * 8 == 64

# Traps.
assert 9 + 25 == 34                       # forgot the two side triangles
assert 9 + 25 + 15 == 49                  # counted only one side triangle
assert 9 * F(5, 3) == 15 and 9 + 15 * 3 == 54   # scaled the area by 5/3, not (5/3)^2
assert F(9 + 25, 2) == 17 and 9 + 25 + 17 + 17 == 68   # side = average of 9 and 25
assert isclose(sqrt(9 * 25), 15)          # the true side area: 3 x 5 = 15

# Variant: AB = 4, DC = 8, [ABE] = 4 -> 4 + 16 + 8 + 8 = 36; height 2 + 4 = 6. 36 is not a question choice.
v = pieces(4, 8, 4)
assert (v["ABE"], v["CDE"], v["ADE"], v["BCE"], v["total"]) == (4, 16, 8, 8, 36), v
assert v["hE"] == 2 and v["h"] == 6 and 4 * 2 ** 2 == 16 and 4 * 2 == 8
assert 36 not in (34, 49, 54, 64, 68)
print("variant pieces:", {k: str(x) for k, x in v.items()})
print("ok")
