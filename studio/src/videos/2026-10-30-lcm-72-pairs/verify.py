"""Brute-force check: ordered pairs (a, b) with lcm 72, every number the video shows."""
from math import gcd
from itertools import product


def lcm(a, b):
    return a * b // gcd(a, b)


def pairs(n, limit=None):
    limit = limit or n  # a, b divide lcm(a, b), so neither can exceed n; search wider to be sure
    return [(a, b) for a in range(1, 3 * limit) for b in range(1, 3 * limit) if lcm(a, b) == n]


P = pairs(72)
assert len(P) == 35
choices = [12, 18, 24, 35, 70]
assert choices.index(len(P)) == 3  # D, bank correct_index 3

# What are we asked: lcm(8, 9) = 72, and order matters.
assert lcm(8, 9) == 72 and (8, 9) in P and (9, 8) in P and (72, 72) in P

# Solution 1: a and b are divisors; 72 = 8 * 9 = 2*2*2 * 3*3; 12 divisors in a 3x4 table.
divs = [d for d in range(1, 73) if 72 % d == 0]
assert 8 * 9 == 72 == 2 * 2 * 2 * 3 * 3 and len(divs) == 12
assert all(a in divs and b in divs for a, b in P)
table = [[2 ** i * 3 ** j for i in range(4)] for j in range(3)]
assert table == [[1, 2, 4, 8], [3, 6, 12, 24], [9, 18, 36, 72]]
partners = {a: sorted(b for x, b in P if x == a) for a in divs}
# lcm = 72 iff (8 | a or 8 | b) and (9 | a or 9 | b), for divisors a, b.
for a, b in product(divs, divs):
    assert (lcm(a, b) == 72) == ((a % 8 == 0 or b % 8 == 0) and (a % 9 == 0 or b % 9 == 0))
assert partners[12] == [72]
assert partners[8] == [9, 18, 36, 72] == partners[24]
assert partners[9] == [8, 24, 72] == partners[18] == partners[36]
assert partners[72] == divs
for a in (1, 2, 4, 3, 6, 12):
    assert partners[a] == [72] and a % 8 and a % 9
counts = [[len(partners[d]) for d in row] for row in table]
assert counts == [[1, 1, 1, 4], [1, 1, 1, 4], [3, 3, 3, 12]]
assert [sum(r) for r in counts] == [7, 7, 21] and 7 + 7 + 21 == 35

# Solution 2: exponent grids. lcm(8, 18): 8 = 2^3, 18 = 2 * 3^2 -> 2^3 * 3^2 = 72.
assert lcm(8, 18) == 72


def good(e):
    """Cells (i, j) in an (e+1) x (e+1) grid with max(i, j) == e."""
    return sum(1 for i in range(e + 1) for j in range(e + 1) if max(i, j) == e)


assert 4 * 4 == 16 and good(3) == 7 == 4 + 4 - 1 == 16 - 9
assert 3 * 3 == 9 and good(2) == 5 == 3 + 3 - 1 == 9 - 4
# Grid cells <-> pairs: each (i,j) for 2 and (k,l) for 3 gives one pair.
grid_pairs = {(2 ** i * 3 ** k, 2 ** j * 3 ** l)
              for i in range(4) for j in range(4) if max(i, j) == 3
              for k in range(3) for l in range(3) if max(k, l) == 2}
assert grid_pairs == set(P) and 7 * 5 == 35

# Traps.
assert len(divs) == 12                                       # A: divisors, not pairs
unordered = {tuple(sorted(p)) for p in P}
assert len(unordered) == 18 == (35 - 1) // 2 + 1             # B: order ignored
assert [p for p in P if p[0] == p[1]] == [(72, 72)]          # only one pair has no twin
assert 2 * 12 == 24 and len(partners[8]) == 4                # C: doubled the divisors
assert 2 * 35 == 70                                          # E: doubled an ordered count

# Variant: lcm 48 = 16 * 3 = 2^4 * 3 -> 9 * 3 = 27.
V = pairs(48)
assert 16 * 3 == 48 and len(V) == 27
assert 5 * 5 == 25 and good(4) == 9 == 25 - 16
assert 2 * 2 == 4 and good(1) == 3 == 4 - 1 and 9 * 3 == 27
assert 27 not in choices
print("pairs for 72:", len(P), "unordered:", len(unordered), "variant 48:", len(V))
print("ok")
