"""Brute-force check: which numbers are sums of two or more consecutive positive whole numbers,
plus every number the video shows (board runs, block examples, traps, variant)."""


def runs(n):
    """Every run (a, length) of >= 2 consecutive positive whole numbers that adds up to n."""
    out = []
    for length in range(2, n + 1):
        for a in range(1, n + 1):
            s = length * a + length * (length - 1) // 2
            if s > n:
                break
            if s == n:
                out.append((a, length))
    return out


def ok(n):
    return bool(runs(n))


def odd_part(n):
    while n % 2 == 0:
        n //= 2
    return n


# ---- the question: 1..50, bank answer index 2 = 44 ----
fails = [n for n in range(1, 51) if not ok(n)]
assert fails == [1, 2, 4, 8, 16, 32], fails
answer = 50 - len(fails)
assert answer == 44
CHOICES = [24, 43, 44, 45, 47]
assert CHOICES[2] == answer
print("1..50 fails:", fails, "-> answer", answer)

# ---- the rule: n works  <=>  n has an odd factor > 1  <=>  n is not a power of two (checked to 2000) ----
for n in range(1, 2001):
    assert ok(n) == (odd_part(n) > 1), n
print("rule 'works iff odd factor > 1' holds for 1..2000")

# ---- Solution 1: the board, one run length at a time ----
covered = set()
new_by_length = {}
for length in range(2, 11):
    sums = [length * a + length * (length - 1) // 2 for a in range(1, 51)]
    sums = [s for s in sums if s <= 50]
    new = sorted(set(sums) - covered)
    new_by_length[length] = new
    covered |= set(sums)
    print(f"runs of {length}: sums {sums}  new {new}")
assert new_by_length[2] == list(range(3, 50, 2)) and len(new_by_length[2]) == 24  # every odd from 3 up
assert set(sum([[s for s in range(6, 51, 3)]], [])) == {3 * a + 3 for a in range(1, 16)}  # 3-runs = multiples of 3 from 6
assert [4 * a + 6 for a in range(1, 11)] == [10, 14, 18, 22, 26, 30, 34, 38, 42, 46]  # 4-runs step by 4
assert [5 * a + 10 for a in range(1, 9)] == [15, 20, 25, 30, 35, 40, 45, 50]  # 5-runs up to 50 = 8+...+12
assert new_by_length[6] == [] and new_by_length[9] == [] and new_by_length[10] == []
assert new_by_length[7] == [28] and sum(range(1, 8)) == 28
assert new_by_length[8] == [44] and sum(range(2, 10)) == 44
assert sum(range(1, 11)) == 55  # ten in a row is already too big
assert sorted(set(range(1, 51)) - covered) == fails

# ---- Solution 2: blocks ----
assert 4 + 5 + 6 == 3 * 5 == 15  # odd run: length x middle
assert 2 + 3 + 4 + 5 == 2 * 7 == 14 and 2 + 5 == 3 + 4 == 7  # even run: pairs with an odd sum
# every run's total has an odd factor > 1: the odd length, or the odd pair sum
for n in range(1, 301):
    for a, length in runs(n):
        pair = 2 * a + length - 1  # first + last
        assert pair % 2 == 1 or length % 2 == 1
        oddf = length if length % 2 else pair
        assert oddf >= 3 and n % oddf == 0
# building: n = m * q, m odd > 1. If q > m/2, m numbers around q; else q pairs adding to m.
for n in range(1, 301):
    for m in range(3, n + 1, 2):
        if n % m:
            continue
        q = n // m
        if q > m / 2:
            run = list(range(q - (m - 1) // 2, q + (m - 1) // 2 + 1))
        else:
            run = list(range((m + 1) // 2 - q, (m - 1) // 2 + q + 1))
        assert len(run) >= 2 and run[0] >= 1 and sum(run) == n, (n, m, run)
assert 5 + 6 + 7 == 18 == 3 * 6
assert 1 + 4 == 2 + 3 == 5 and 1 + 2 + 3 + 4 == 10 == 5 * 2
assert 3 + 4 + 5 + 6 + 7 == 25  # shown example: five around five
print("block examples and both build methods OK")

# ---- traps ----
assert len([n for n in range(1, 51) if n % 2 == 1 and n >= 3]) == 24  # A: only two-number sums (odds)
upto7 = {n for n in range(1, 51) if any(L <= 7 for _, L in runs(n))}
assert len(upto7) == 43 and sorted(set(range(1, 51)) - upto7) == [1, 2, 4, 8, 16, 32, 44]  # B: stop at 7
assert 50 - 5 == 45  # D: counts 1 as a sum (removes only 2, 4, 8, 16, 32)
assert 50 - 3 == 47  # E: removes only 1, 2, 4
print("traps: 24 = odds only, 43 = runs up to 7 (misses 44), 45 = keeps 1, 47 = removes only 1, 2, 4")

# ---- variant: 1..100 ----
vfails = [n for n in range(1, 101) if not ok(n)]
assert vfails == [1, 2, 4, 8, 16, 32, 64]
assert 100 - len(vfails) == 93
assert 18 + 19 + 20 + 21 + 22 == 100 and 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16 == 100
print("variant 1..100 fails:", vfails, "-> answer", 100 - len(vfails))

# ---- trap B (review fix): listing powers of two up to 64 and taking 50 - 7 ----
p2_to_64 = [2 ** k for k in range(7)]
assert p2_to_64 == [1, 2, 4, 8, 16, 32, 64] and 50 - len(p2_to_64) == 43 and 64 > 50
# rule scene: eleven numbers around four would go below one (4 - 5 = -1)
assert 4 - (11 - 1) // 2 == -1 and sum(range(-1, 10)) == 44
print("trap B: 43 = 50 - 7 powers of two, but 64 is past 50")
