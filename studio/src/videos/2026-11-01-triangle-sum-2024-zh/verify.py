"""Verify: smallest n with 1+2+...+n divisible by 2024 (bank answer index 2 = 528),
the 4-grouping walk used in Solution 1, the choice checks, and the 2025 variant."""
from itertools import product

T = lambda n: n * (n + 1) // 2

# Brute force
ans = next(n for n in range(1, 10**6) if T(n) % 2024 == 0)
assert ans == 528, ans
choices = [253, 483, 528, 736, 1012]
assert choices.index(ans) == 2  # bank correct_index
print("answer:", ans, "| all n <= 1100 that work:", [n for n in range(1, 1101) if T(n) % 2024 == 0])

# Key rewrite: 2024 | n(n+1)/2  <=>  4048 | n(n+1),  4048 = 16 * 11 * 23
assert 2 * 2024 == 4048 == 16 * 11 * 23
for n in range(1, 20000):
    assert (T(n) % 2024 == 0) == (n * (n + 1) % 4048 == 0)

# 8 cases: each of 16, 11, 23 goes whole into n (0) or n+1 (1); smallest n per case
case_min = {}
for s in product([0, 1], repeat=3):
    case_min[s] = next(n for n in range(1, 5000) if all((n + t) % m == 0 for m, t in zip([16, 11, 23], s)))
print("smallest n per case (16,11,23 -> n or n+1):", case_min)
assert min(case_min.values()) == 528

# Solution 1 walks (the four groupings)
# A: 16 & 11 together -> multiples of 176; neighbour must be a multiple of 23
assert [k * 176 for k in (1, 2, 3)] == [176, 352, 528]
assert all(x % 23 for x in (175, 177, 351, 353, 527)) and 529 == 23 * 23
assert (23 * 7, 23 * 8, 23 * 15, 23 * 16, 23 * 22) == (161, 184, 345, 368, 506)
# B: 16 & 23 together -> multiples of 368; neighbour must be a multiple of 11
assert all(x % 11 for x in (367, 369)) and 737 == 11 * 67 and 736 == 2 * 368
assert (11 * 33, 11 * 34) == (363, 374)
# C: 11 & 23 together -> multiples of 253; neighbour must be a multiple of 16
assert all(x % 16 for x in (252, 254, 505, 507)) and 759 > 529
assert (16 * 15, 16 * 16, 16 * 31, 16 * 32) == (240, 256, 496, 512)
# D: all together -> 4048 (n = 4047 or 4048), far too big

# Choice checks (Solution 2 / traps): n(n+1)/2 written as (even half) x (odd)
assert T(253) == 253 * 127 and T(253) % 2          # odd sum: no twos at all
assert T(483) == 483 * 242 and 242 == 2 * 121       # only one two
assert T(528) == 264 * 529 and 264 == 8 * 33 and T(528) == 2024 * 69
assert T(736) == 368 * 737 and T(736) % 2024 == 0   # works, but bigger
assert T(1012) == 506 * 1013 and 506 == 2 * 253     # only one two
for c in choices:
    print(c, "sum =", T(c), "divisible:", T(c) % 2024 == 0, "| mod 8, 11, 23:", T(c) % 8, T(c) % 11, T(c) % 23)

# Variant: smallest n with 1+...+n divisible by 2025 = 81 * 25  -> 324
v = next(n for n in range(1, 10**6) if T(n) % 2025 == 0)
assert v == 324 and T(324) == 52650 == 2025 * 26 and T(324) == 162 * 325
assert 2 * 2025 == 2 * 81 * 25
# walk multiples of 81: neighbours must be multiples of 25
assert all(x % 25 for x in (80, 82, 161, 163, 242, 244, 323)) and 325 == 25 * 13
# together: 2025 -> n = 2024 or 2025, too big
print("variant 2025 answer:", v)
print("all checks pass")
