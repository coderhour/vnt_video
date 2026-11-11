"""Check: goldfish taken out of a pond (amc8 arithmetic c1-238), every number the video shows."""
from fractions import Fraction as F


def brute(total, gold_pct, target_pct):
    gold = total * gold_pct // 100
    other = total - gold
    return [k for k in range(gold + 1) if F(gold - k, total - k) == F(target_pct, 100)]


# Question: 200 fish, 90% goldfish -> remove k goldfish so 80% are goldfish. Bank correct_index 4 -> 100.
choices = [10, 20, 40, 50, 100]
assert brute(200, 90, 80) == [100] == [choices[4]]
assert 200 * 90 // 100 == 180 and 200 - 180 == 20             # 10% of 200 is 20; 90% is 180 goldfish

# Solution 1: the 20 other fish stay. At the end they are 100 - 80 = 20% = one fifth of the pond.
assert 100 - 80 == 20 and F(20, 100) == F(1, 5)
assert 20 * 5 == 100 and 200 - 100 == 100 and 180 - 100 == 80
assert F(80, 100) == F(80, 100)                                # 80 goldfish out of 100 fish

# Solution 2: ratio. 80% gold : 20% other = 4 : 1, so goldfish = 4 x 20 = 80; take out 180 - 80 = 100.
assert F(80, 20) == 4 and 4 * 20 == 80 and 180 - 80 == 100

# Traps: check "others must be one fifth of what's left".
for k, left, fifth in [(10, 190, 38), (20, 180, 36), (40, 160, 32), (50, 150, 30), (100, 100, 20)]:
    assert 200 - k == left and F(left, 5) == fifth
    assert (fifth == 20) == (k == 100)
assert 90 - 80 == 10                                           # A: difference of the percents
assert 200 - 180 == 20                                         # B: number of other fish

# Variant: 400 fish, 95% goldfish -> 75% goldfish. Others 20 = 25% = one quarter -> 80 left -> remove 320.
assert brute(400, 95, 75) == [320]
assert 400 * 95 // 100 == 380 and 400 - 380 == 20
assert 100 - 75 == 25 and 20 * 4 == 80 and 400 - 80 == 320 and 380 - 320 == 60 and F(60, 80) == F(75, 100)
print("ok")
