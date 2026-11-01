"""Check: polygon with two right angles, the rest 160 (amc8 geometry c1-124), every number shown."""
from math import cos, isclose, radians, sin


def closes(angles):
    """Walk sides of length L_i turning by the exterior angles; check a closed convex polygon exists."""
    ext = [180 - a for a in angles]
    return isclose(sum(ext), 360) and all(0 < e < 180 for e in ext)


# Question. Bank correct_index 2 -> 11.
choices = [9, 10, 11, 12, 20]
sol = [n for n in range(3, 50) if 2 * 90 + (n - 2) * 160 == (n - 2) * 180]
assert sol == [11] == [choices[2]]

# Solution 1: exterior angles add to 360. Right angle -> 90 outside, 160 -> 20 outside.
assert 180 - 90 == 90 and 180 - 160 == 20 and 360 - 2 * 90 == 180 and 180 / 20 == 9 and 9 + 2 == 11
assert closes([90, 90] + [160] * 9)

# A real convex 11-gon with these angles: the two right angles next to each other, side lengths chosen so it closes.
# Turn directions: 90, 90, then nine 20s. Sides: bottom b, right r, then nine equal sides of length 1 on the arc.
dirs = [0, 90] + [180 + 20 * i for i in range(9)]   # direction of each side after turning
ex = sum(cos(radians(d)) for d in dirs[2:])
ey = sum(sin(radians(d)) for d in dirs[2:])
b, r = -ex, -ey                                     # first two sides close the loop
assert b > 0 and r > 0                              # positive lengths: a genuine convex shape

# Solution 2: interior angle sum (n - 2) x 180 = 180 + 160 (n - 2) -> 20 (n - 2) = 180 -> n - 2 = 9 -> n = 11.
assert (11 - 2) * 180 == 1620 == 2 * 90 + 9 * 160

# Traps: 9 = only the 160 corners, 20 = exterior angle, 10 / 12: angles don't add up.
assert (10 - 2) * 180 == 1440 and 180 + 8 * 160 == 1460
assert (12 - 2) * 180 == 1800 and 180 + 10 * 160 == 1780

# Variant: three 120 angles, the rest 150. Outside: 3 x 60 = 180, rest 30 each -> 6 -> 9 sides.
assert 3 * (180 - 120) == 180 and 180 / (180 - 150) == 6 and 6 + 3 == 9
assert (9 - 2) * 180 == 1260 == 3 * 120 + 6 * 150 and closes([120] * 3 + [150] * 6)
print("ok")
