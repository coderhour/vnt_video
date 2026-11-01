"""Check: tree equally far from A and C (amc8 mixed c1-766), every number the video shows."""
from fractions import Fraction as F


def solve(L, W):
    """x = EA = EC, with E on AB, AB = L, BC = W: (L - x)^2 + W^2 = x^2."""
    return F(L * L + W * W, 2 * L)


# Question: 16 by 8. Choices; bank correct_index 2 -> 10.
choices = [6, 8, 10, 12, 14]
assert solve(16, 8) == 10 == choices[2]
assert [x for x in range(0, 17) if (16 - x) ** 2 + 8 ** 2 == x ** 2] == [10]

# Solution 1: algebra. (16 - x)^2 + 64 = x^2 -> 256 - 32x + x^2 + 64 = x^2 -> 320 = 32x -> x = 10.
assert 16 ** 2 == 256 and 8 ** 2 == 64 and 2 * 16 == 32 and 256 + 64 == 320 and 320 / 32 == 10
assert 16 - 10 == 6 and 6 ** 2 + 8 ** 2 == 100 == 10 ** 2         # E B = 6: a 6-8-10 triangle

# Solution 2 / traps: test each choice. EB = 16 - x; EB^2 + 64 must equal x^2.
table = {x: ((16 - x) ** 2 + 64, x ** 2) for x in choices}
assert table == {6: (164, 36), 8: (128, 64), 10: (100, 100), 12: (80, 144), 14: (68, 196)}
assert [x for x, (a, b) in table.items() if a == b] == [10]

# Variant: 18 by 12. (18 - x)^2 + 144 = x^2 -> 324 + 144 = 36x -> 468 = 36x -> x = 13. EB = 5: 5-12-13.
assert solve(18, 12) == 13
assert 18 ** 2 == 324 and 12 ** 2 == 144 and 324 + 144 == 468 and 2 * 18 == 36 and 468 / 36 == 13
assert 18 - 13 == 5 and 5 ** 2 + 12 ** 2 == 13 ** 2
print("ok")
