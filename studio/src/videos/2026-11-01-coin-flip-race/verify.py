"""Check: Ann flips 5 fair coins, Bob flips 7. P(Bob gets more heads)? (amc10 mixed c2-047), every number shown."""
from fractions import Fraction as F
from itertools import product
from math import comb


def race(a, b, strict=True):
    """Brute force: P(Bob's heads > Ann's heads) (or >= if not strict) over all 2^(a+b) outcomes."""
    win = 0
    for flips in product((0, 1), repeat=a + b):
        A, B = sum(flips[:a]), sum(flips[a:])
        win += B > A if strict else B >= A
    return F(win, 2 ** (a + b))


# Question. Bank correct_index 3 -> 1255/2048.
choices = [F(793, 2048), F(1, 2), F(575, 1024), F(1255, 2048), F(1651, 2048)]
ans = race(5, 7)
assert ans == F(1255, 2048) == choices[3]
assert sum(B > A for A in range(6) for B in range(8) for _ in range(comb(5, A) * comb(7, B))) == 2510

# Solution 1: flip Ann's coins over. Her heads count has the same chances as her tails count (C(5,k) = C(5,5-k)).
# B > A  with A = 5 - T  ->  B > 5 - T  ->  B + T > 5  ->  B + T >= 6: at least 6 heads among 12 fair coins.
assert all(comb(5, k) == comb(5, 5 - k) for k in range(6))
assert all((B > 5 - T) == (B + T >= 6) for B in range(8) for T in range(6))
assert ans == F(sum(comb(12, k) for k in range(6, 13)), 2 ** 12)
# Three piles: fewer than 6 / exactly 6 / more than 6 heads; the outer piles mirror each other.
assert 2 ** 12 == 4096
assert 12 * 11 * 10 * 9 * 8 * 7 == 665280 and 6 * 5 * 4 * 3 * 2 * 1 == 720 and 665280 // 720 == 924 == comb(12, 6)
assert 4096 - 924 == 3172 and 3172 // 2 == 1586
assert sum(comb(12, k) for k in range(7, 13)) == sum(comb(12, k) for k in range(0, 6)) == 1586
assert 1586 + 924 == 2510 and F(2510, 4096) == F(1255, 2048)

# Solution 2: fair game + tiebreak coin. Bob's first 6 coins vs Ann's 5: he has more heads or more tails, never both,
# never neither (6 = 5 + 1), so P(B6 > A) = 1/2 exactly.
assert race(5, 6) == F(1, 2)
for flips in product((0, 1), repeat=11):
    A, B6 = sum(flips[:5]), sum(flips[5:])
    assert (B6 > A) != (6 - B6 > 5 - A)
# Coin 7 only matters on a tie: Bob wins <=> B6 > A, or B6 == A and coin 7 is heads.
for flips in product((0, 1), repeat=12):
    A, B6, c7 = sum(flips[:5]), sum(flips[5:11]), flips[11]
    assert (B6 + c7 > A) == (B6 > A or (B6 == A and c7 == 1))
# Tie B6 == A  <=>  B6 + T == 5: exactly 5 heads among 11 coins.  C(11,5) = 462, out of 2^11 = 2048.
tie = F(sum(comb(5, a) * comb(6, a) for a in range(6)), 2 ** 11)
assert tie == F(comb(11, 5), 2 ** 11) == F(462, 2048)
assert 11 * 10 * 9 * 8 * 7 == 55440 and 55440 // 120 == 462 and 2 ** 11 == 2048
assert F(1, 2) + tie / 2 == F(1024 + 231, 2048) == ans and 462 // 2 == 231 and 1024 + 231 == 1255

# Traps.
# A: "more than 6" heads among 12 (strict instead of at least 6): 1586/4096 = 793/2048.
assert F(1586, 4096) == F(793, 2048) == choices[0]
# B: 1/2 is the fair game for exactly one extra coin (Bob with 6 coins), not 7.
assert choices[1] == race(5, 6)
# E: at least 5 of 12 = adding the exactly-5 pile C(12,5) = 792: 3302/4096 = 1651/2048.
# (Same as P(Bob gets AT LEAST as many heads as Ann), i.e. counting ties as wins.)
assert comb(12, 5) == 792 and 2510 + 792 == 3302 and F(3302, 4096) == F(1651, 2048) == choices[4]
assert race(5, 7, strict=False) == choices[4]
# C (no bank note), "what you'd get if": compare Bob's FIRST 5 coins with Ann's 5. Ahead -> win; tied -> needs a head
# from his 2 spares (3/4); and forget he can win from exactly one behind (needs both spares heads).
t5 = F(comb(10, 5), 2 ** 10)  # tie 5 vs 5 = exactly 5 heads of 10 after the flip = 252/1024
assert t5 == F(252, 1024) and race(5, 5) == (1 - t5) / 2 == F(386, 1024)
assert F(386, 1024) + t5 * F(3, 4) == F(386 + 189, 1024) == F(575, 1024) == choices[2] == F(1150, 2048)
behind1 = F(sum(comb(5, a) * comb(5, a - 1) for a in range(1, 6)), 2 ** 10)
assert behind1 == F(210, 1024) and F(575, 1024) + behind1 * F(1, 4) == ans  # the missed comeback case
# All five chips over 2048, in order.
assert [c * 2048 for c in choices] == [793, 1024, 1150, 1255, 1651]

# Variant: Ann 3 coins, Bob 5 coins -> at least 4 heads among 8.
v = race(3, 5)
assert v == F(sum(comb(8, k) for k in range(4, 9)), 2 ** 8) == F(163, 256)
assert 2 ** 8 == 256 and comb(8, 4) == 70 == 8 * 7 * 6 * 5 // 24 and 256 - 70 == 186 and 186 // 2 == 93 and 93 + 70 == 163
# Cross-check by Solution 2: 4 vs 3 is fair; tie = exactly 3 heads of 7 = C(7,3)/128 = 35/128; half -> 35/256.
assert race(3, 4) == F(1, 2) and F(comb(7, 3), 128) == F(35, 128) and F(1, 2) + F(35, 256) == F(128 + 35, 256) == v
print("ok", ans, v)
