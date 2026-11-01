"""Numeric check: nested square / circle / square / circle, and every number the video shows."""
from math import isclose, pi, sqrt, hypot


def nest(side, levels):
    """Big square of given side; returns radii of `levels` nested circles.
    Square in a circle: diagonal = diameter. Circle in a square: diameter = side."""
    radii, s = [], side
    for _ in range(levels):
        r = s / 2                    # circle snug in square of side s
        radii.append(r)
        s = (2 * r) / sqrt(2)        # next square: diagonal = 2r
    return radii


def grid_area(inside, half, n=1600):
    """Midpoint-grid area of {inside(x, y)} over the square [-half, half]^2."""
    h = 2 * half / n
    cnt = sum(inside(-half + (i + .5) * h, -half + (j + .5) * h) for i in range(n) for j in range(n))
    return cnt * h * h


# Question: side 8. Choices (in units of pi): 4, 8, 12, 16, 24; correct_index 1 -> 8 pi.
R, r = nest(8, 2)
assert isclose(R, 4) and isclose(r, 2 * sqrt(2)) and isclose(r * r, 8)
ring = pi * R * R - pi * r * r
assert isclose(ring, 8 * pi)
assert [4, 8, 12, 16, 24].index(8) == 1
# Brute force the shaded region straight from the figure's geometry (centre at origin).
g = grid_area(lambda x, y: r * r < x * x + y * y < R * R, 4)
assert abs(g - 8 * pi) < 0.02, g
# The small square's corners (on the big circle) at the side midpoints (0,±4),(±4,0), as drawn.
corners = [(4, 0), (0, 4), (-4, 0), (0, -4)]
assert all(isclose(hypot(*c), R) for c in corners)
mid = (2, 2)                                  # midpoint of a small-square side
assert isclose(hypot(*mid), r)                # small circle touches it: radius 2 root 2

# Solution 1: diameter 8 -> radius 4 -> 16 pi; diagonal 8, side^2 + side^2 = 64.
assert 4 ** 2 == 16 and 8 ** 2 == 64 and 64 / 2 == 32
side = sqrt(32)
assert isclose(side, 4 * sqrt(2)) and isclose(side / 2, 2 * sqrt(2)) and 4 * 2 == 8
assert 16 - 8 == 8

# Solution 2: fold the 4 corner triangles (legs 4, 4) in: they cover the small square.
corner_tri = 4 * 4 / 2
assert 4 * corner_tri == 32 and isclose(side ** 2, 32) and 64 - 4 * corner_tri == 32
assert 32 / 64 == 0.5
# Turned 45 deg it is a scaled copy (scale 1/root2), so every area halves: circle 16 pi -> 8 pi.
assert isclose((side / 8) ** 2, 0.5) and isclose(pi * r * r / (pi * R * R), 0.5)
assert 16 / 2 == 8 and 16 - 8 == 8           # ring = small circle = 8 pi

# Traps (units of pi).
assert 4 ** 2 - 2 ** 2 == 12                  # C: small radius taken as 2
assert isclose(4 * sqrt(2), 5.657, abs_tol=1e-3) and 4 * sqrt(2) > 5.5   # real small side
assert 16 == 16                               # D: forgot to subtract
assert 16 + 8 == 24                           # E: added instead of subtracted
r3 = nest(8, 3)[2]
assert isclose(r3, 2) and isclose(r3 ** 2, 4) and 8 / 2 == 4   # A: halved once too often = next circle in

# Variant: side 12, three circles; shade between biggest and smallest. Answer 27 pi.
v = nest(12, 3)
assert isclose(v[0], 6) and isclose(v[1], 3 * sqrt(2)) and isclose(v[2], 3)
areas = [x * x for x in v]                   # in units of pi
assert [round(a, 9) for a in areas] == [36, 18, 9]
assert 36 / 2 == 18 and 18 / 2 == 9 and 36 - 9 == 27
assert isclose(6 / 2, v[2]) and 3 ** 2 == 9   # area / 4 -> radius / 2
gv = grid_area(lambda x, y: v[2] ** 2 < x * x + y * y < v[0] ** 2, 6)
assert abs(gv - 27 * pi) < 0.05, gv
assert 27 not in (4, 8, 12, 16, 24)
print("question ring:", g / pi, "pi; variant:", gv / pi, "pi")
print("ok")
