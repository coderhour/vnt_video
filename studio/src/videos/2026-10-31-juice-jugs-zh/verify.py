"""Check: juice jugs poured back and forth (amc8 arithmetic c1-384), every number the video shows. Tracks liters of juice."""
from fractions import Fraction as F


def pour_back(water_a, vol_b, pct_b, x):
    a_vol, a_juice = F(water_a), F(0)
    b_vol, b_juice = F(vol_b), F(vol_b) * pct_b / 100
    steps = [(a_vol, a_juice, b_vol, b_juice)]
    m = b_juice * x / b_vol; b_juice -= m; b_vol -= x; a_juice += m; a_vol += x
    steps.append((a_vol, a_juice, b_vol, b_juice, m))
    m = a_juice * x / a_vol; a_juice -= m; a_vol -= x; b_juice += m; b_vol += x
    steps.append((a_vol, a_juice, b_vol, b_juice, m))
    return steps


s = pour_back(10, 10, 60, 5)
assert s[0] == (10, 0, 10, 6)                        # B: 60% of 10 is 6 liters juice
assert s[1] == (15, 3, 5, 3, 3)                      # half of B goes: 3 juice moves; A 15 L with 3 juice
assert F(3, 15) == F(20, 100)                        # A is 20% juice (one fifth)
assert s[2] == (10, 2, 10, 4, 1)                     # 5 of 15 = one third of A -> 1 L juice back; F(5,15)==1/3
assert F(5, 15) == F(1, 3) and F(5) * F(20, 100) == 1
assert F(4, 10) * 100 == 40
choices = [20, 30, 40, 45, 60]
assert choices[2] == 40                              # bank correct_index 2

# Solution 2: juice is never lost. A ends with 10 L at 20% -> 2 L juice; B has 6 - 2 = 4.
assert F(10) * F(20, 100) == 2 and 6 - 2 == 4

# Traps
assert F(3, 15) * 100 == 20                          # A: jug A's percent
assert F(3, 10) * 100 == 30                          # B: forget the juice that came back
assert (30 + 60) / 2 == 45                           # D: what you'd get averaging 30% and 60%
# E: 60 is B's starting percent

# Variant: A 8 L water, B 8 L at 75% juice, pour 4 over and 4 back -> 50%.
v = pour_back(8, 8, 75, 4)
assert v[0] == (8, 0, 8, 6)
assert v[1] == (12, 3, 4, 3, 3) and F(3, 12) == F(1, 4)
assert v[2] == (8, 2, 8, 4, 1) and F(4, 12) == F(1, 3)
assert F(4, 8) * 100 == 50
print("ok")
