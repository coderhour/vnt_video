"""Coordinate check: ladder over a box against a wall, and every number the video shows.

Coordinates in feet, y up: ladder foot at (0, 0), box from x = foot_gap to the wall, box height h.
The ladder touches the box's top OUTER corner (foot_gap, h), the edge away from the wall.
"""
from fractions import Fraction as F
from math import isqrt


def ladder(foot_gap, depth, h):
    wall = foot_gap + depth                     # wall's distance from the foot
    slope = F(h, foot_gap)                      # rise over run through the box corner
    top = slope * wall                          # height where the ladder meets the wall
    L2 = wall ** 2 + top ** 2
    L = F(isqrt(int(L2)))
    assert L * L == L2, L2                      # whole-number length
    low = (foot_gap ** 2 + h ** 2)              # piece from foot to box corner
    up_rise = top - h                           # piece from box corner to wall
    up2 = depth ** 2 + up_rise ** 2
    lo, up = F(isqrt(low)), F(isqrt(int(up2)))
    assert lo * lo == low and up * up == up2
    # The corner really is on the ladder, and the ladder clears the box everywhere else:
    # over the box (foot_gap <= x <= wall) the ladder is at slope*x >= h.
    assert slope * foot_gap == h
    for i in range(0, 101):
        x = foot_gap + F(depth * i, 100)
        assert slope * x >= h
    return dict(wall=wall, slope=slope, top=top, L=L, low=lo, up_rise=up_rise, up=up)


# Question: gap 9, box 12 deep, 12 tall. Bank answer index 3 = 35.
q = ladder(9, 12, 12)
assert (q["wall"], q["slope"], q["top"], q["L"]) == (21, F(4, 3), 28, 35), q
choices = [15, 20, 28, 35, 37]
assert choices.index(q["L"]) == 3
print("question:", {k: str(v) for k, v in q.items()})

# Solution 1: rise over run. 12 up per 9 across = 4 up per 3 across; 21 = 7 x 3 -> 7 x 4 = 28.
assert F(12, 9) == F(4, 3) and 21 == 7 * 3 and 7 * 4 == 28
# Pythagoras: 21^2 + 28^2 = 441 + 784 = 1225 = 35^2 (also 7 x the 3-4-5 triangle).
assert 21 ** 2 == 441 and 28 ** 2 == 784 and 441 + 784 == 1225 == 35 ** 2
assert (21, 28, 35) == (7 * 3, 7 * 4, 7 * 5)
# Solution 2: two pieces. Lower: 9-12-15 (3 x 3-4-5). Upper: 12 across, rises 16 (12 x 4/3), 12-16-20 (4 x 3-4-5).
assert q["low"] == 15 and q["up_rise"] == 16 and q["up"] == 20 and 15 + 20 == 35
assert 9 ** 2 + 12 ** 2 == 81 + 144 == 225 == 15 ** 2
assert 12 ** 2 + 16 ** 2 == 144 + 256 == 400 == 20 ** 2
assert 12 * F(4, 3) == 16 and 12 + 16 == 28
# Same answer by scaling: whole triangle is 21/9 = 7/3 times the small one -> 15 x 7/3 = 35.
assert F(21, 9) == F(7, 3) and 15 * F(7, 3) == 35

# Traps.
assert q["low"] == 15                     # A: stopped at the box corner
assert q["up"] == 20                      # B: only the upper piece
assert q["top"] == 28                     # C: the height on the wall, not the length
assert 9 + 28 == 37                       # E: what you'd get adding 9 across and 28 up

# Wrong geometry check: if the ladder touched the box's INNER top edge (against the wall),
# it would be at (21, 12): slope 12/21 and it would pass through the box. So "outer" matters.
assert F(12, 21) * 9 < 12

# Variant: foot 6 ft from a box 8 ft tall and 9 ft deep. Slope 8/6 = 4/3, wall at 15, height 20, length 25.
v = ladder(6, 9, 8)
assert (v["wall"], v["slope"], v["top"], v["L"]) == (15, F(4, 3), 20, 25), v
assert v["low"] == 10 and v["up_rise"] == 12 and v["up"] == 15 and 10 + 15 == 25
assert 15 == 5 * 3 and 20 == 5 * 4 and 15 ** 2 + 20 ** 2 == 225 + 400 == 625 == 25 ** 2
print("variant:", {k: str(x) for k, x in v.items()})
print("ok")
