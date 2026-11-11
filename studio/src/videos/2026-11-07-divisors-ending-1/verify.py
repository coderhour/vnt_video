"""Verify 2026-11-07-divisors-ending-1 (amc_practice_amc10_number_theory_template:c2-020).
How many positive divisors of 3^6 * 7^4 * 13^2 end in the digit 1?  Choices 24,25,26,27,28 -> C = 26."""
from itertools import product
from collections import Counter

A, B, C = 6, 4, 2
N = 3**A * 7**B * 13**C
def divisors(n):  # independent trial division up to sqrt(n)
    small = [d for d in range(1, int(n**0.5) + 1) if n % d == 0]
    return sorted(set(small + [n // d for d in small]))
divs = divisors(N)
assert len(divs) == 105 == (A + 1) * (B + 1) * (C + 1)
brute = sum(1 for d in divs if d % 10 == 1)
assert brute == 26, brute
print("brute force (all 105 divisors listed):", brute)

# Last-digit cycles
assert [3**k % 10 for k in range(7)] == [1, 3, 9, 7, 1, 3, 9]
assert [7**k % 10 for k in range(5)] == [1, 7, 9, 3, 1]
assert [13**k % 10 for k in range(3)] == [1, 3, 9]
assert [3**k for k in range(5)] == [1, 3, 9, 27, 81]
assert 27 % 10 == 7 and 13 % 10 == 3 and 3**4 % 10 == 1

# Solution 1: grid of last digits of 3^a * 13^c (rows c = 0..2, columns a = 0..6)
grid = [[(3**a * 13**c) % 10 for a in range(A + 1)] for c in range(C + 1)]
assert grid == [[1, 3, 9, 7, 1, 3, 9], [3, 9, 7, 1, 3, 9, 7], [9, 7, 1, 3, 9, 7, 1]], grid
ones_per_row = [row.count(1) for row in grid]
assert ones_per_row == [2, 1, 2]
ones = sum(ones_per_row)
assert ones == 5 and 21 - ones == 16
partner = {1: 1, 3: 7, 9: 9, 7: 3}           # box digit -> needed 7-part digit
for x, y in partner.items():
    assert x * y % 10 == 1
ways = Counter(7**b % 10 for b in range(B + 1))  # {1:2, 7:1, 9:1, 3:1}
assert ways == {1: 2, 7: 1, 9: 1, 3: 1}
sol1 = sum(ways[partner[d]] for row in grid for d in row)
assert sol1 == 5 * 2 + 16 * 1 == 26
print("solution 1 grid:", grid, "-> 5*2 + 16 =", sol1)

# Solution 2: divisor ends like 3^(a+3b+c); need a+3b+c = 0 mod 4
for a, b, c in product(range(A + 1), range(B + 1), range(C + 1)):
    assert (3**a * 7**b * 13**c) % 10 == 3**(a + 3 * b + c) % 10
sums = Counter(a + c for a in range(A + 1) for c in range(C + 1))
assert dict(sums) == {0: 1, 1: 2, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 2, 8: 1}
targets = {0: [0, 4, 8], 1: [1, 5], 2: [2, 6], 3: [3, 7], 4: [0, 4, 8]}
per_b = {}
for b, ts in targets.items():
    assert ts == [s for s in range(9) if (s + 3 * b) % 4 == 0]
    per_b[b] = sum(sums[s] for s in ts)
assert per_b == {0: 5, 1: 5, 2: 6, 3: 5, 4: 5}, per_b
assert sum(per_b.values()) == 26
print("solution 2 per b:", per_b, "-> 26")

# Traps
assert N % 10 == 1                       # 1 and N both end in 1
print("A 24 = 26 - 2 (dropping 1 and N):", brute - 2)
t25 = sum(1 for a, c in product(range(A + 1), range(C + 1)) if (3**a * 13**c) % 10 == 1) * (B + 1)
assert t25 == 25, t25                    # 7-powers treated as ending in 1: 5 boxes * 5 b's
pairs_ab = sum(1 for a, b in product(range(A + 1), range(B + 1)) if (3**a * 7**b) % 10 == 1)
assert pairs_ab == 9 and pairs_ab * (C + 1) == 27   # 13-powers treated as ending in 1
print("B 25 (7 as 1):", t25, " D 27 (13 as 1):", pairs_ab, "* 3 =", pairs_ab * 3, " E 28: too many")
assert 26 < 28

# Variant: divisors of 3^5 * 7^4 * 13^3 ending in 1 -> 30
VA, VB, VC = 5, 4, 3
M = 3**VA * 7**VB * 13**VC
vbrute = sum(1 for a, b, c in product(range(VA + 1), range(VB + 1), range(VC + 1))
             if (3**a * 7**b * 13**c) % 10 == 1)
boxes = (VA + 1) * (VC + 1)
vones = sum(1 for a, c in product(range(VA + 1), range(VC + 1)) if (a + c) % 4 == 0)
vs = Counter(a + c for a in range(VA + 1) for c in range(VC + 1))
assert boxes == 24 and (vs[0], vs[4], vs[8]) == (1, 4, 1) and vones == 6
assert vones * 2 == 12 and boxes - vones == 18
assert vbrute == 30 == 12 + 18, vbrute
vdivs = divisors(M)
assert sum(1 for d in vdivs if d % 10 == 1) == 30
print("variant 3^5*7^4*13^3:", vbrute)
print("ALL CHECKS PASS: answer C = 26, variant = 30")
