"""Check: right triangle (0,0),(p,0),(0,q) with exactly 10 interior lattice points
(amc_practice_amc10_mock_test_template:c1-316), every number shown in the video."""
from math import gcd


def inside(p, q):
    """Brute force: lattice points strictly inside the triangle (x>0, y>0, x/p + y/q < 1)."""
    return sum(1 for x in range(1, p) for y in range(1, q) if q * x + p * y < p * q)


def formula(p, q):
    """Rectangle cut in half: ((p-1)(q-1) - (g-1)) / 2."""
    return ((p - 1) * (q - 1) - (gcd(p, q) - 1)) // 2


def diag_dots(p, q):
    """Lattice points strictly between (p,0) and (0,q) on the slanted side."""
    return sum(1 for x in range(1, p) for y in range(1, q) if q * x + p * y == p * q)


# The formula and the diagonal count hold for every small triangle.
for p in range(1, 40):
    for q in range(1, 40):
        assert diag_dots(p, q) == gcd(p, q) - 1
        assert inside(p, q) == formula(p, q)
        # Pick: area = I + B/2 - 1 with B = p + q + g
        assert 2 * inside(p, q) + (p + q + gcd(p, q)) - 2 == p * q


def solutions(n, lim=200):
    # interior count grows with each leg, and a leg of 1 or a short leg past the bound gives too many/few; lim is plenty
    return sorted((p, q) for p in range(1, lim) for q in range(1, lim) if formula(p, q) == n)


# Question: 10 inside. Bank correct_index 3 -> 11.
choices = [5, 6, 10, 11, 12]
sol = solutions(10)
assert len(sol) == 11 and choices[3] == 11
# brute-force cross-check on a smaller box
assert sorted((p, q) for p in range(1, 30) for q in range(1, 30) if inside(p, q) == 10) == sol
short = [(p, q) for p, q in sol if p <= q]
assert short == [(2, 21), (2, 22), (3, 11), (3, 12), (5, 6), (6, 6)]

# Example rectangle 6 by 4 (asked/rect scene): 15 inside, g = 2, 1 dot on the diagonal, 7 per triangle.
assert 5 * 3 == 15 and gcd(6, 4) == 2 and diag_dots(6, 4) == 1 and inside(6, 4) == 7 == (15 - 1) // 2

# Equation: (p-1)(q-1) - (g-1) = 20  <=>  (p-1)(q-1) = 19 + g
for p, q in sol:
    assert (p - 1) * (q - 1) == 19 + gcd(p, q)

# Bound: 7 by 7 triangle has 15 inside (36 - 6 = 30, half 15); both legs >= 7 covers it -> short leg <= 6.
assert 6 * 6 == 36 and gcd(7, 7) - 1 == 6 and inside(7, 7) == 15
assert all(inside(p, q) >= 15 for p in range(7, 30) for q in range(7, 30))
assert inside(1, 50) == 0  # p = 1 leaves no room

# Case table, short leg p = 2..6, g must divide p; q-1 = (19+g)/(p-1); keep if gcd(p,q) == g.
def cases(n, pmax):
    rows = []
    for p in range(2, pmax + 1):
        for g in [d for d in range(1, p + 1) if p % d == 0]:
            rhs = 2 * n - 1 + g
            if rhs % (p - 1) == 0:
                q = rhs // (p - 1) + 1
                rows.append((p, g, rhs, q, gcd(p, q) == g, q >= p))
    return rows

rows = cases(10, 6)
assert rows == [
    (2, 1, 20, 21, True, True), (2, 2, 21, 22, True, True),
    (3, 1, 20, 11, True, True), (3, 3, 22, 12, True, True),
    (4, 2, 21, 8, False, True),                       # 3(q-1) in {20, 21, 23}: only 21, q = 8, gcd(4,8) = 4 != 2
    (5, 1, 20, 6, True, True), (5, 5, 24, 7, False, True),  # 4(q-1) in {20, 24}; gcd(5,7) = 1 != 5
    (6, 1, 20, 5, True, False), (6, 6, 25, 6, True, True),  # 5(q-1) in {20,21,22,25}; q = 5 is (5,6) flipped
], rows
assert [19 + g for g in (1, 2, 4)] == [20, 21, 23] and [19 + g for g in (1, 2, 3, 6)] == [20, 21, 22, 25]
assert 5 * 2 + 1 == 11

# Pick's theorem algebra: pq/2 = 10 + (p+q+g)/2 - 1  ->  pq = 18 + p + q + g  ->  (p-1)(q-1) = 19 + g
for p, q in sol:
    g = gcd(p, q)
    assert p * q == 18 + p + q + g and p * q - p - q + 1 == 19 + g

# Traps (stories worded "what you'd get if"):
assert len(short) * 2 == 12                    # E: flip all six, including (6,6)
assert len(sol) - 1 == 10                      # C: miss (6,6)  (its slanted side hides 5 dots)
assert diag_dots(6, 6) == 5
assert len(short) == 6                         # B: forget to flip
forgot_diag = [(p, q) for p in range(1, 60) for q in range(1, 60) if (p - 1) * (q - 1) == 20]
assert len(forgot_diag) == 6                   # B also: ignore dots on the slant -> (p-1)(q-1) = 20
assert len([t for t in short if t[0] < t[1]]) == 5  # A: p < q only, never flipped

# Variant: exactly 6 inside -> (p-1)(q-1) = 11 + g; 6 by 6 triangle has 10 inside -> short leg <= 5. Answer 9.
assert 2 * 6 - 1 == 11
assert inside(6, 6) == 10 == (25 - 5) // 2 and inside(5, 5) == 6
v = solutions(6)
assert len(v) == 9
assert [(p, q) for p, q in v if p <= q] == [(2, 13), (2, 14), (3, 7), (4, 5), (5, 5)]
vrows = cases(6, 5)
assert vrows == [
    (2, 1, 12, 13, True, True), (2, 2, 13, 14, True, True),
    (3, 1, 12, 7, True, True), (3, 3, 14, 8, False, True),   # gcd(3,8) = 1
    (4, 1, 12, 5, True, True), (4, 4, 15, 6, False, True),   # gcd(4,6) = 2
    (5, 1, 12, 4, True, False), (5, 5, 16, 5, True, True),   # q = 4 is (4,5) flipped
], vrows
assert 4 * 2 + 1 == 9
print("ok")
