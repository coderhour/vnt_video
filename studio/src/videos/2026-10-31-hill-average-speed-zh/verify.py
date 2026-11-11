"""Check: average speed up and down a hill (amc8 arithmetic c1-548), every number the video shows."""
from fractions import Fraction as F


def avg(km, up_kmh, down_ms):
    down_kmh = F(down_ms * 3600, 1000)
    return F(2 * km) / (F(km) / up_kmh + F(km) / down_kmh)


# Question: 3 km up at 12 km/h, down at 10 m/s. Bank correct_index 1 -> 18.
choices = [11, 18, 22, 24, 36]
assert avg(3, 12, 10) == 18 == choices[1]

# Solution 1: total distance / total time.
assert 10 * 3600 == 36000 and 36000 / 1000 == 36               # 10 m/s = 36 km/h
assert F(3, 12) == F(1, 4) and F(1, 4) * 60 == 15              # up: 15 minutes
assert F(3, 36) == F(1, 12) and F(1, 12) * 60 == 5             # down: 5 minutes (3000 m / 10 = 300 s)
assert 3000 / 10 == 300 and 300 / 60 == 5
assert 3 + 3 == 6 and 15 + 5 == 20 and F(20, 60) == F(1, 3) and 6 * 3 == 18

# Solution 2: pick a friendly hill, 36 km. Up 36 / 12 = 3 h, down 36 / 36 = 1 h. 72 km in 4 h = 18.
assert avg(36, 12, 10) == 18 and 36 / 12 == 3 and 36 / 36 == 1 and 72 / 4 == 18

# Traps.
assert (12 + 10) / 2 == 11          # A: averaged 12 and 10, no unit change
assert 12 + 10 == 22                # C: added
assert (12 + 36) / 2 == 24          # D: averaged the two speeds
assert 36 == 36                     # E: downhill speed only

# Variant: 3 km up at 9 km/h, down at 5 m/s (= 18 km/h). Up 20 min, down 10 min, 6 km in 30 min = 12 km/h.
assert 5 * 3600 == 18000 and avg(3, 9, 5) == 12
assert F(3, 9) * 60 == 20 and F(3, 18) * 60 == 10 and 6 * 2 == 12
assert (9 + 18) / 2 == 13.5         # the tempting average (shown as 13.5, never spoken)
print("ok")
