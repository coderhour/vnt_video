"""Brute force: clock-hand angles at every minute, with exact Fractions."""
from fractions import Fraction as F


def angle(hour, m):
    """Smaller angle between the hands at hour:m (exact)."""
    hour_hand = 30 * hour + F(m, 2)      # half a degree per minute
    minute_hand = 6 * m                  # six degrees per minute
    gap = abs(hour_hand - minute_hand)
    return min(gap, 360 - gap)


def whole(x):
    return x.denominator == 1


# Question: 1:00 .. 1:59. Bank answer index 3 = 30.
hits = [m for m in range(60) if whole(angle(1, m))]
assert hits == list(range(0, 60, 2)) and len(hits) == 30
assert [12, 15, 29, 30, 60].index(len(hits)) == 3
print("whole at 1:m for m =", hits)

# Formula 30 - 5.5m, then "drop the minus sign", then 360 minus if over 180.
for m in range(60):
    g = abs(30 - F(11, 2) * m)
    assert angle(1, m) == (g if g <= 180 else 360 - g)

# Numbers shown in the video.
assert angle(1, 0) == 30 and angle(1, 1) == F(49, 2)          # 30, 24.5
assert angle(1, 2) == 19                                       # odd but whole
assert 30 - F(11, 2) * 20 == -80 and angle(1, 20) == 80
assert abs(30 - F(11, 2) * 40) == 190 and angle(1, 40) == 170
assert F(11, 2) * 2 == 11 and F(11, 2) * 3 == F(33, 2)          # 11, 16.5
assert 30 + F(1, 2) * 1 == F(61, 2)                             # hour hand 30.5 at 1:01
assert F(360, 60) == 6 and F(30, 60) == F(1, 2) and 6 - F(1, 2) == F(11, 2)

# Traps.
assert len(range(2, 59, 2)) == 29                               # even minutes, forgot 1:00
assert len(range(60)) == 60                                     # every minute
assert len(range(0, 60, 5)) == 12                               # minute hand on a number
even_angles = [m for m in range(60) if whole(angle(1, m)) and angle(1, m) % 2 == 0]
assert len(even_angles) == 15 and even_angles == list(range(0, 60, 4))  # only even angles

# Variant: 2:00 .. 2:59, smaller angle a multiple of 5 degrees -> 6 (m = 0, 10, ..., 50).
v = [m for m in range(60) if whole(angle(2, m)) and angle(2, m) % 5 == 0]
assert v == [0, 10, 20, 30, 40, 50] and len(v) == 6
assert [F(11, 2) * m for m in (2, 4, 6)] == [11, 22, 33]
assert [F(11, 2) * m for m in v] == [0, 55, 110, 165, 220, 275]
assert angle(2, 0) == 60 and 60 - F(11, 2) * 10 == 5 and angle(2, 10) == 5
assert 6 not in (12, 15, 29, 30, 60)
print("variant:", v, [str(angle(2, m)) for m in v])
print("ok")
