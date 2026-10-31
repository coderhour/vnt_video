"""Brute-force check: whole numbers 1..1000 that are multiples of at least one of 4, 6, 9."""
from math import lcm

N = 1000
nums = range(1, N + 1)
hit = [n for n in nums if n % 4 == 0 or n % 6 == 0 or n % 9 == 0]
answer = len(hit)
choices = [362, 388, 389, 416, 527]
correct_index = 2  # bank's correct_index
assert answer == 389 and choices.index(answer) == correct_index

# Every count shown on screen.
c = lambda d, n=N: n // d
assert (c(4), c(6), c(9)) == (250, 166, 111)
assert (lcm(4, 6), lcm(4, 9), lcm(6, 9), lcm(4, 6, 9)) == (12, 36, 18, 36)
assert 4 * 6 == 24                                  # tempting product, but 12 comes first
assert min(n for n in nums if n % 4 == 0 and n % 6 == 0) == 12
assert (c(12), c(36), c(18)) == (83, 27, 55)
# Brute-force the overlaps too.
assert sum(1 for n in nums if n % 4 == 0 and n % 6 == 0) == 83
assert sum(1 for n in nums if n % 4 == 0 and n % 9 == 0) == 27
assert sum(1 for n in nums if n % 6 == 0 and n % 9 == 0) == 55
assert sum(1 for n in nums if n % 4 == 0 and n % 6 == 0 and n % 9 == 0) == 27

# Solution 1: inclusion-exclusion.
assert 250 + 166 + 111 == 527
assert 83 + 27 + 55 == 165 and 527 - 165 == 362 and 362 + 27 == 389
# Aha: the 4&9 overlap IS the all-three overlap (both are multiples of 36), so -27 +27 cancels.
assert 527 - 83 - 55 == 389
assert all((n % 4 == 0 and n % 9 == 0) == (n % 36 == 0) for n in nums)

# Venn regions (for the diagram).
def only(f):
    return sum(1 for n in nums if tuple(n % d == 0 for d in (4, 6, 9)) == f)
regions = {f: only(f) for f in [(1,0,0),(0,1,0),(0,0,1),(1,1,0),(1,0,1),(0,1,1),(1,1,1)]}
assert regions == {(1,0,0): 167, (0,1,0): 55, (0,0,1): 56, (1,1,0): 56,
                   (1,0,1): 0, (0,1,1): 28, (1,1,1): 27}, regions
assert sum(regions.values()) == 389
print("regions (4,6,9 flags -> count):", regions)

# Solution 2: build it up. Multiples of 4 or 6, then add the multiples of 9 not yet counted.
four_or_six = [n for n in nums if n % 4 == 0 or n % 6 == 0]
assert len(four_or_six) == 250 + 166 - 83 == 333
new9 = [n for n in nums if n % 9 == 0 and n not in four_or_six]
# An even multiple of 9 is a multiple of 18, so of 6; an odd one is a multiple of neither 4 nor 6.
assert new9 == [n for n in nums if n % 9 == 0 and n % 2 == 1]
assert len(new9) == 111 - 55 == 56 and 333 + 56 == 389
assert new9[:4] == [9, 27, 45, 63]

# Traps.
assert 250 + 166 + 111 == 527                       # no overlaps removed
assert 527 - 83 - 27 - 55 == 362                    # forgot to add back the all-three overlap
assert sum(1 for n in range(1, 1000) if n % 4 == 0 or n % 6 == 0 or n % 9 == 0) == 388  # stopped at 999
assert 1000 % 4 == 0 and 1000 % 6 and 1000 % 9     # 1000 itself counts (multiple of 4)
assert 527 - 83 - 55 + 27 == 416                    # skipped the 4&9 pair, still added back 27
assert sum(1 for n in nums if n % 4 == 0 and n % 9 == 0) > 0   # 4 and 9 share no factor, yet overlap (36)
assert 1000 // 24 == 41                             # LCM trap: 24 would count only 41 of the 83

# Variant: 1..300, multiples of at least one of 4, 6, 10 -> 110.
M = 300
v = sum(1 for n in range(1, M + 1) if n % 4 == 0 or n % 6 == 0 or n % 10 == 0)
assert (lcm(4, 6), lcm(4, 10), lcm(6, 10), lcm(4, 6, 10)) == (12, 20, 30, 60)
assert (M // 4, M // 6, M // 10) == (75, 50, 30) and 75 + 50 + 30 == 155
assert (M // 12, M // 20, M // 30, M // 60) == (25, 15, 10, 5) and 25 + 15 + 10 == 50
assert 155 - 50 + 5 == 110 == v
assert v not in choices
print("answer", answer, "variant", v, "ok")
