"""Brute-force check: positive integers, a(n+2) = a(n+1) + a(n), a10 = 2024. Largest a1 + a2?

Question: amc_practice_amc10_algebra_template:c2-043 (correct_index 2 = 84).
Run: python3 verify.py   (asserts everything the video says)
"""

CHOICES = [50, 71, 84, 94, 105]
CORRECT_INDEX = 2


def seq(a, b, n=10):
    s = [a, b]
    while len(s) < n:
        s.append(s[-1] + s[-2])
    return s


def solutions(target, n=10):
    """Every (a1, a2) of positive integers whose n-th term is target (brute force)."""
    return [(a, b) for a in range(1, target + 1) for b in range(1, target + 1) if seq(a, b, n)[-1] == target]


# ---- the main question ----
sols = solutions(2024)
assert sols == [(30, 41), (64, 20)], sols
best = max(a + b for a, b in sols)
assert best == 84 == CHOICES[CORRECT_INDEX]

# Solution 1: every term in a and b; coefficients are Fibonacci numbers.
coef = [(1, 0), (0, 1)]
while len(coef) < 10:
    coef.append((coef[-1][0] + coef[-2][0], coef[-1][1] + coef[-2][1]))
assert coef == [(1, 0), (0, 1), (1, 1), (1, 2), (2, 3), (3, 5), (5, 8), (8, 13), (13, 21), (21, 34)]
for a in range(1, 30):
    for b in range(1, 30):
        assert seq(a, b)[-1] == 21 * a + 34 * b
        # split 34b = 21b + 13b:  21(a+b) + 13b
        assert 21 * a + 34 * b == 21 * (a + b) + 13 * b

# Largest S is when b is smallest; b >= 1 gives 21S <= 2011, so S <= 95.
assert 2024 - 13 == 2011 and 2011 // 21 == 95 and 21 * 95 == 1995 and 21 * 96 > 2011
leftovers = [(S, 2024 - 21 * S) for S in range(95, 83, -1)]
assert [l for _, l in leftovers] == [29, 50, 71, 92, 113, 134, 155, 176, 197, 218, 239, 260]
assert all(l % 13 for _, l in leftovers[:-1]) and leftovers[-1] == (84, 260) and 260 == 13 * 20
assert 21 * 84 == 1764
a, b = 84 - 20, 20
assert (a, b) == (64, 20)
assert seq(64, 20) == [64, 20, 84, 104, 188, 292, 480, 772, 1252, 2024]
assert 21 * 64 == 1344 and 34 * 20 == 680 and 1344 + 680 == 2024

# Keep counting down: next S that works is 71 (leftover 533 = 13 x 41), then 58 gives a < 0.
works = [S for S in range(95, 0, -1) if (2024 - 21 * S) % 13 == 0]
assert works[:3] == [84, 71, 58]
assert 2024 - 21 * 71 == 533 == 13 * 41 and 71 - 41 == 30
assert 2024 - 21 * 58 == 806 == 13 * 62 and 58 - 62 == -4
assert seq(30, 41) == [30, 41, 71, 112, 183, 295, 478, 773, 1251, 2024]
# Trade: a - 34, b + 21 keeps 21a + 34b the same (21*34 = 34*21 = 714).
assert 21 * 34 == 714 and (64 - 34, 20 + 21) == (30, 41)

# Solution 2: a1 + a2 = a3, so start the list at a2 = b and a3 = S:  a10 = 13*a2 + 21*a3.
for a in range(1, 30):
    for b in range(1, 30):
        assert seq(a, b)[-1] == 13 * b + 21 * (a + b)
# Test the choices, biggest first.
assert 21 * 105 == 2205 and 2205 > 2024                 # E: too big already
assert 21 * 94 == 1974 and 2024 - 1974 == 50 and 50 % 13  # D: 50 is not 13 x anything
assert 2024 - 21 * 84 == 260 == 13 * 20                  # C: works, b = 20, a = 64

# Traps
assert 64 + 41 == 105 and 64 + 30 == 94 and 30 + 20 == 50  # mixing numbers from the two sequences
assert 2024 - 21 * 50 == 974 and 974 % 13 and 13 * 75 == 975  # A: not 13 x anything
for wrong in (50, 94, 105):
    assert all(a + b != wrong for a, b in sols)
assert 21 * 64 + 34 * 41 == 2738 and 2738 > 2024  # E's pair (64, 41) is not a real sequence

# ---- variant: a10 = 2025 ----
vs = solutions(2025)
assert vs == [(9, 54), (43, 33), (77, 12)], vs
assert sorted(a + b for a, b in vs) == [63, 76, 89]
assert (2025 - 13) // 21 == 95
vl = [(S, 2025 - 21 * S) for S in range(95, 88, -1)]
assert [l for _, l in vl] == [30, 51, 72, 93, 114, 135, 156]
assert all(l % 13 for _, l in vl[:-1]) and vl[-1] == (89, 156) and 156 == 13 * 12
assert seq(77, 12) == [77, 12, 89, 101, 190, 291, 481, 772, 1253, 2025]

print("all checks pass: answer 84 (C); variant a10 = 2025 -> 89")
