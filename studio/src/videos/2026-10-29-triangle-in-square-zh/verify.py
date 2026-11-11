"""Numeric check: the largest equilateral triangle inside a square, and every number the video shows."""
from math import cos, isclose, radians, sin, sqrt


def best_side(square, steps=360_000):
    """Search every rotation. A triangle fits (after sliding) iff its bounding box fits in the square."""
    best = (0, 0)
    for i in range(steps + 1):
        th = radians(120 * i / steps)  # an equilateral triangle repeats every 120 degrees
        xs = [cos(th + radians(120 * k)) for k in range(3)]
        ys = [sin(th + radians(120 * k)) for k in range(3)]
        r = square / max(max(xs) - min(xs), max(ys) - min(ys))  # largest circumradius that fits
        best = max(best, (r * sqrt(3), th))
    return best[0]


area = lambda s: sqrt(3) / 4 * s * s

# Question: unit square. Bank answer index 2 = 2*sqrt(3) - 3.
s = best_side(1)
assert isclose(area(s), 2 * sqrt(3) - 3, rel_tol=1e-6), area(s)
print(f"unit square: side {s:.6f}, area {area(s):.6f} = 2*sqrt3 - 3 = {2 * sqrt(3) - 3:.6f}")

# Solution 1: vertices (0,0), (1,t), (t,1); 1 + t^2 = 2(1-t)^2  <=>  (t-2)^2 = 3  ->  t = 2 - sqrt3.
t = 2 - sqrt(3)
assert isclose(1 + t * t, 2 * (1 - t) ** 2) and isclose((t - 2) ** 2, 3)
assert isclose(1 + t * t, 8 - 4 * sqrt(3)) and isclose(area(sqrt(1 + t * t)), 2 * sqrt(3) - 3)
assert 2 + sqrt(3) > 1  # the other root is off the square
# Solution 2: cut the corners. 1 - t/2 - t/2 - (1-t)^2/2, with 1-t = sqrt3-1 and (sqrt3-1)^2 = 4 - 2sqrt3.
assert isclose((sqrt(3) - 1) ** 2, 4 - 2 * sqrt(3))
assert isclose(1 - t / 2 - t / 2 - (1 - t) ** 2 / 2, 2 * sqrt(3) - 3)
# The turn: vertex at a corner, one side at angle a from the bottom. It fits while
# s*cos(a) <= 1 and s*sin(a+60) <= 1, so the best side is min(1/cos a, 1/sin(a+60)): peak at a = 15.
turn = {a: min(1 / cos(radians(a)), 1 / sin(radians(a + 60))) for a in range(0, 31)}
assert max(turn, key=turn.get) == 15 and isclose(turn[15], s, rel_tol=1e-6) and turn[0] == 1
print("turning: side at 0, 15, 30 degrees =", [round(turn[a], 4) for a in (0, 15, 30)])
# Decimal values shown on screen.
assert round(sqrt(3) / 4, 3) == 0.433 and round(2 * sqrt(3) - 3, 3) == 0.464 and round(t, 3) == 0.268

# Traps (choices A, B, D, E).
assert isclose(sqrt(3) / 4 * sqrt(8 - 4 * sqrt(3)), (3 * sqrt(2) - sqrt(6)) / 4)  # B: side, not side squared
assert isclose(area(2 / sqrt(3)), sqrt(3) / 3) and 2 / sqrt(3) > s   # D: height 1, base 1.155 too wide
assert isclose(area(sqrt(2)), sqrt(3) / 2) and sqrt(2) > s           # E: side = diagonal, sticks out
assert sqrt(3) / 4 < 2 * sqrt(3) - 3 < sqrt(3) / 3                    # A fits but is smaller
print("traps: A", round(sqrt(3) / 4, 4), "B", round((3 * sqrt(2) - sqrt(6)) / 4, 4),
      "D", round(sqrt(3) / 3, 4), "E", round(sqrt(3) / 2, 4))

# Variant: square of side 2.  4 + u^2 = 2(2-u)^2  <=>  (u-4)^2 = 12  ->  u = 4 - 2sqrt3.
s2 = best_side(2)
u = 4 - 2 * sqrt(3)
assert isclose(4 + u * u, 2 * (2 - u) ** 2) and isclose((u - 4) ** 2, 12)
assert isclose(area(s2), 8 * sqrt(3) - 12, rel_tol=1e-6)
assert isclose(4 - 2 * u / 2 - 2 * u / 2 - (2 - u) ** 2 / 2, 8 * sqrt(3) - 12)  # cut the corners
assert isclose((2 * sqrt(3) - 2) ** 2, 16 - 8 * sqrt(3)) and round(u, 3) == 0.536
assert isclose(4 * (2 * sqrt(3) - 3), 8 * sqrt(3) - 12)             # double the side: area x 4
print(f"variant side-2 square: area {area(s2):.6f} = 8*sqrt3 - 12")
print("ok")
