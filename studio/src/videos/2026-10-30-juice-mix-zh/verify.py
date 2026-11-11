"""Check: juice + water mixing (amc8 arithmetic c1-387), every number the video shows."""
from fractions import Fraction as F


def split(total, juice_pct):
    j = F(total) * F(juice_pct, 100)
    return j, F(total) - j


def brute(start, start_pct, end, end_pct, step=F(1, 4)):
    """Every (juice added, water added) on a quarter-liter grid that turns start into end."""
    j0, w0 = split(start, start_pct)
    hits = []
    n = int(F(end) / step)
    for a in range(n + 1):
        for b in range(n + 1):
            ja, wa = a * step, b * step
            tot = start + ja + wa
            if tot == end and (j0 + ja) / tot == F(end_pct, 100):
                hits.append((ja, wa))
    return hits


# Question: 20 L at 30% -> 25 L at 40%. Choices 0,1,2,4,5; bank correct_index 1 -> 1 L.
choices = [0, 1, 2, 4, 5]
assert brute(20, 30, 25, 40) == [(4, 1)]
assert choices[1] == 1

# Solution 1: split each drink.
assert F(20) / 10 == 2 and 3 * 2 == 6 == split(20, 30)[0]   # 10% of 20 is 2, 30% is 6
assert 20 - 6 == 14 == split(20, 30)[1]
assert F(40, 100) == F(2, 5) and F(25, 5) == 5 and 2 * 5 == 10 == split(25, 40)[0]
assert 25 - 10 == 15 == split(25, 40)[1]
assert 10 - 6 == 4 and 15 - 14 == 1 and 4 + 1 == 5 and 20 + 5 == 25

# Solution 2: water only. 70% of 20 = 14, 60% of 25 = 3/5 of 25 = 15.
assert 100 - 30 == 70 and 7 * 2 == 14 and F(70, 100) * 20 == 14
assert 100 - 40 == 60 and F(60, 100) == F(3, 5) and 3 * 5 == 15 and F(60, 100) * 25 == 15
assert 15 - 14 == 1

# Traps.
assert 10 - 6 == 4                         # D: juice added, not water
assert 4 + 1 == 5 and 25 - 20 == 5         # E: everything added
assert 6 + 5 == 11 and 11 != 10            # A (0 water): 5 L of juice -> 11 L juice, too strong
assert F(11, 25) > F(40, 100)
assert F(10, 100) * 20 == 2                # C: 10% (the jump 30->40) of 20
assert 6 + (5 - 2) == 9 and 9 != 10        # C: with 2 L water she adds 3 juice -> only 9 L juice

# Variant: 15 L at 60% -> 24 L at 50%. Add 3 L juice, 6 L water (drink gets weaker yet juice is added).
assert brute(15, 60, 24, 50) == [(3, 6)]
assert F(60, 100) == F(3, 5) and F(15, 5) == 3 and 3 * 3 == 9 == split(15, 60)[0]
assert 15 - 9 == 6 == split(15, 60)[1]
assert F(24, 2) == 12 and split(24, 50) == (12, 12)
assert 12 - 9 == 3 and 12 - 6 == 6 and 3 + 6 == 9 and 15 + 9 == 24
assert F(9, 24) < F(1, 2)                  # only water would leave the drink under half juice
print("ok")
