"""Check: tip angles of a seven-point star (amc8 mixed c1-666), every number the video shows."""
from fractions import Fraction as F
from math import atan2, cos, degrees, isclose, pi, sin, acos


def tips(n, k):
    """Sum of the tip angles of the star joining each of n points to the k-th point after it."""
    P = [(cos(2 * pi * i / n), sin(2 * pi * i / n)) for i in range(n)]
    total = 0
    for i in range(n):
        a, b = P[(i + k) % n], P[(i - k) % n]
        u = (a[0] - P[i][0], a[1] - P[i][1])
        v = (b[0] - P[i][0], b[1] - P[i][1])
        total += degrees(acos((u[0] * v[0] + u[1] * v[1]) / ((u[0]**2 + u[1]**2) ** .5 * (v[0]**2 + v[1]**2) ** .5)))
    return total


# Question: 7 points, join to the 2nd point after. Choices 180..900, bank correct_index 2 -> 540.
choices = [180, 360, 540, 720, 900]
assert isclose(tips(7, 2), 540) and choices[2] == 540

# Solution 1: centre triangles. One slice s, 7 s = 360. Triangle O-P0-P2 has centre angle 2 s, legs are radii,
# so each base angle is (180 - 2 s) / 2 = 90 - s. Same for O-P0-P5. Tip = 2 (90 - s) = 180 - 2 s.
s = F(360, 7)
tip = 180 - 2 * s
assert isclose(float(tip), tips(7, 2) / 7)
assert 7 * tip == 7 * 180 - 14 * s == 1260 - 720 == 540 and 14 * s == 2 * 360

# Solution 2: pencil walk. Turn at each tip = 180 - tip. The star wraps around the centre twice: total turn 720.
winds = 2
assert 7 * 180 - winds * 360 == 540 and 7 * 180 == 1260

# Traps.
assert isclose(tips(5, 2), 180)                 # A: 180 is the five-point star
assert 7 * 180 - 3 * 360 == 180                # (also the 7 star joined to the 3rd point: the variant)
assert 360 == 360                              # B: one full turn (what a plain shape's turns add to)
assert winds * 360 == 720                       # D: the total turning, not the tips
assert (7 - 2) * 180 == 900 == 1260 - 360       # E: a plain seven-sided shape (pencil turns once)

# Variant: join each point to the 3rd point after it. Winds 3 times -> 1260 - 1080 = 180.
assert isclose(tips(7, 3), 180)
assert 7 * (180 - 3 * s) == 1260 - 21 * s == 1260 - 1080 == 180
print("ok")
