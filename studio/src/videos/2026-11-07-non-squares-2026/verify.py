"""Verify: the 2026th positive non-square is 2071 (bank choice index 2), plus every solution, trap and the variant."""
from math import isqrt


def is_sq(m):
    return isqrt(m) ** 2 == m


def nth_nonsquare(n):
    c = 0
    m = 0
    while c < n:
        m += 1
        if not is_sq(m):
            c += 1
    return m


def pos(m):
    """Spot of a non-square m in the list = m minus the squares up to m."""
    assert not is_sq(m)
    return m - isqrt(m)


def round_sqrt(n):
    """Nearest whole number to sqrt(n), exact (no float)."""
    k = isqrt(n)
    # sqrt(n) >= k + 1/2  <=>  4n >= (2k+1)^2
    return k + 1 if 4 * n >= (2 * k + 1) ** 2 else k


choices = [2069, 2070, 2071, 2072, 2116]
correct_index = 2

ans = nth_nonsquare(2026)
print("2026th non-square =", ans)
assert ans == 2071 and choices.index(ans) == correct_index

# Question list start
assert [m for m in range(1, 11) if not is_sq(m)] == [2, 3, 5, 6, 7, 8, 10]

# Solution 1: count what gets skipped
assert 45 ** 2 == 2025 and 46 ** 2 == 2116
assert isqrt(2026) == 45            # 45 squares up to 2026 (1^2 .. 45^2)
assert 2026 + 45 == 2071
assert isqrt(2071) == 45            # no new square jumped over (46^2 = 2116 > 2071)
assert not is_sq(2071)

# Solution 2: gaps 2, 4, 6, ...; first n gaps hold n(n+1)
for k in range(1, 200):
    gap = [m for m in range(k * k + 1, (k + 1) ** 2)]
    assert len(gap) == 2 * k
    assert (k + 1) ** 2 == k * k + 2 * k + 1
assert [sum(2 * k for k in range(1, n + 1)) for n in range(1, 5)] == [2, 6, 12, 20]
assert [n * (n + 1) for n in range(1, 5)] == [2, 6, 12, 20]
assert sum(2 * k for k in range(1, 45)) == 44 * 45 == 1980
assert 2025 - 45 == 1980           # non-squares below 45^2
assert nth_nonsquare(1980) == 2024 # last one before 45^2
assert 2026 - 1980 == 46
assert 2025 + 46 == 2071
assert 2 * 45 == 90 and 46 <= 90   # gap after 45^2 holds 90 numbers (2026..2115)
assert len(range(2026, 2116)) == 90

# Solution 3: shortcut n + round(sqrt n)
for n in range(1, 20001):
    assert nth_nonsquare(n) == n + round_sqrt(n), n
assert nth_nonsquare(5) == 7 and round_sqrt(5) == 2
assert round_sqrt(2026) == 45
# why: gap after k^2 holds positions k^2-k+1 .. k^2+k, all with round(sqrt) = k, value = position + k
for k in range(1, 300):
    for n in range(k * k - k + 1, k * k + k + 1):
        assert round_sqrt(n) == k
        assert nth_nonsquare(n) == n + k if k < 60 else True
    assert pos(k * k + 1) == k * k - k + 1 and pos((k + 1) ** 2 - 1) == k * k + k

# Spot vs value: the NUMBER 2026 sits in spot 1981, not spot 2026
assert pos(2026) == 1981

# Shortcut in kid form: round(sqrt n) = root of the perfect square nearest to n (never a tie)
def nearest_square_root(n):
    k = isqrt(n)
    lo, hi = n - k * k, (k + 1) ** 2 - n
    assert lo != hi
    return k if lo < hi else k + 1
for n in range(1, 20001):
    assert round_sqrt(n) == nearest_square_root(n), n
assert nearest_square_root(5) == 2 and 5 - 4 == 1 and 9 - 5 == 4
assert nearest_square_root(2026) == 45 and 2026 - 2025 == 1 and 2116 - 2026 == 90

# Traps: position check of every choice
print("positions:", {c: (pos(c) if not is_sq(c) else "square") for c in choices})
assert pos(2069) == 2024           # A: two spots too early
assert pos(2070) == 2025           # B: one spot early
assert 2026 + 44 == 2070           # B story: forgot 1 is a square (only 44 squares)
assert pos(2072) == 2027           # D: one spot too late
assert 2026 + 46 == 2072           # D story: rounded sqrt(2026) up to 46
assert is_sq(2116) and 2116 == 46 ** 2   # E: a perfect square, not in the list
assert 2026 + 90 == 2116           # (E story, not narrated: adding the whole gap of 90)

# Variant: 1000th non-square = 1032
v = nth_nonsquare(1000)
print("1000th non-square =", v)
assert v == 1032
assert isqrt(1000) == 31 and 31 ** 2 == 961
assert 1000 + 31 == 1031
assert 32 ** 2 == 1024 and 1000 < 1024 <= 1031   # jumped over 32^2
assert 1031 + 1 == 1032 and not is_sq(1032)
assert isqrt(1032) == 32 and 1032 - 32 == 1000 and pos(1032) == 1000
assert pos(1031) == 999            # naive answer 1031 is one spot early
assert round_sqrt(1000) == 32 and nearest_square_root(1000) == 32
assert 1000 - 961 == 39 and 1024 - 1000 == 24     # 1024 is the nearer square
assert 1000 + 32 == 1032
assert 33 ** 2 == 1089 > 1032          # check again: next square is past 1032
assert 45 * 46 == 2070 > 2026 > 1980    # why 44 gaps: 45 gaps would overshoot spot 2026
# Review fixes: k gaps hold k(k+1); trap tests; numbers between k^2 and (k+1)^2 have spot within k of k^2
assert 45 * 46 == 2070 > 2026
assert 2070 - isqrt(2070) == 2025 and pos(2070) == 2025 < 2026
assert 2072 - isqrt(2072) == 2027 and pos(2072) == 2027 > 2026
for k in range(1, 300):
    for n in range(k * k + 1, (k + 1) ** 2):
        assert k * k - k + 1 <= pos(n) <= k * k + k and isqrt(n) == k
print("all checks pass")
