"""Check: 4 socks from 5 pairs with a matching pair (amc8 counting c1-393), every number shown."""
from itertools import combinations
from math import comb


def count(pairs, k=4):
    socks = [(c, s) for c in range(pairs) for s in range(2)]
    sets = list(combinations(socks, k))
    pair = [t for t in sets if len({c for c, _ in t}) < k]
    two = [t for t in sets if len({c for c, _ in t}) == k - 2]
    return len(sets), len(pair), len(sets) - len(pair), len(two)


# Question: 5 pairs. Bank correct_index 2 -> 130.
choices = [80, 125, 130, 140, 210]
assert count(5) == (210, 130, 80, 10) and choices[2] == 130

# Solution 1: all minus no-pair. C(10,4) = 210. No pair: choose 4 colours of 5 (5 ways), a sock of each (2^4 = 16).
assert comb(10, 4) == 10 * 9 * 8 * 7 // 24 == 5040 // 24 == 210
assert comb(5, 4) == 5 and 2 ** 4 == 16 and 5 * 16 == 80 and 210 - 80 == 130

# Solution 2: direct. Exactly one pair: pair colour 5, two other colours C(4,2) = 6, a sock of each 2 x 2 = 4 -> 120.
# Two pairs: C(5,2) = 10.  120 + 10 = 130.
assert comb(4, 2) == 6 and 5 * 6 * 4 == 120 and comb(5, 2) == 10 and 120 + 10 == 130

# Traps: 80 = no-pair sets, 210 = all sets, 140 = pick a pair (5) then any 2 of the other 8 (28), double-counting
# the 10 two-pair sets.
assert comb(8, 2) == 28 and 5 * 28 == 140 and 140 - 10 == 130
# 125: matches neither count (our two methods agree on 130).

# Variant: 6 pairs. C(12,4) = 495; no pair C(6,4) x 16 = 15 x 16 = 240; 495 - 240 = 255.
assert count(6) == (495, 255, 240, 15)
assert comb(12, 4) == 495 and comb(6, 4) == 15 and 15 * 16 == 240 and 495 - 240 == 255
assert 6 * comb(5, 2) * 4 == 240 and comb(6, 2) == 15 and 240 + 15 == 255
assert 12 * 11 * 10 * 9 == 11880 and 11880 // 24 == 495 and 10 * 9 * 8 * 7 == 5040 and 4 * 3 * 2 == 24
assert 5 * 28 == 140
print("ok")
