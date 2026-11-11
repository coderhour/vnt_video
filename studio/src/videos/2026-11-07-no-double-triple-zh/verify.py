#!/usr/bin/env python3
"""Verify 2026-11-07-no-double-triple (amc_practice_amc10_mixed_template:c2-022).

Largest subset of {1..N} with no pair x, 2x and no pair x, 3x.
Answer N=100: 61 (choice C). Variant N=30: 18.
Checks: per-family brute force on the real numbers, no clash across families,
an independent whole-graph max-independent-set search, explicit domino covers,
the colouring, every number spoken in the narration, and every trap value.
"""
from itertools import combinations

CHOICES = [50, 58, 61, 64, 67]
CORRECT_INDEX = 2


def clash(x, y):
    x, y = min(x, y), max(x, y)
    return y == 2 * x or y == 3 * x


def valid(S):
    return not any(clash(x, y) for x, y in combinations(S, 2))


def core(n):
    a = b = 0
    while n % 2 == 0:
        n //= 2; a += 1
    while n % 3 == 0:
        n //= 3; b += 1
    return n, a, b


def families(N):
    fam = {}
    for n in range(1, N + 1):
        m, a, b = core(n)
        fam.setdefault(m, []).append(n)
    return fam


def brute_family(nums):
    """Largest clash-free subset of one family: tries every clash-free subset
    (decide each number in turn: skip it, or keep it if it clashes with nothing kept)."""
    nums = sorted(nums)
    best = []

    def go(i, kept):
        nonlocal best
        if len(kept) + len(nums) - i <= len(best):
            return
        if i == len(nums):
            best = list(kept)
            return
        x = nums[i]
        if not any(clash(x, y) for y in kept):
            go(i + 1, kept + [x])
        go(i + 1, kept)
    go(0, [])
    assert valid(best)
    return best


def mis_whole(N):
    """Independent check, no cores used: split the clash graph of 1..N into its
    connected pieces (search along edges), brute-force each piece, add."""
    seen, total = set(), 0
    for s in range(1, N + 1):
        if s in seen:
            continue
        comp, stack = [], [s]
        seen.add(s)
        while stack:
            u = stack.pop(); comp.append(u)
            for w in range(1, N + 1):
                if w not in seen and clash(u, w):
                    seen.add(w); stack.append(w)
        total += len(brute_family(comp))
    return total


def check_cover(N, dominoes, fam):
    """dominoes: list of clashing pairs, disjoint. Return leftover singles."""
    used = [x for d in dominoes for x in d]
    assert len(used) == len(set(used)), "dominoes overlap"
    for x, y in dominoes:
        assert clash(x, y), (x, y)
        assert core(x)[0] == core(y)[0]
    return sorted(set(range(1, N + 1)) - set(used))


def run(N, dominoes, chosen, expected):
    fam = families(N)
    # different families never clash
    for x, y in combinations(range(1, N + 1), 2):
        if clash(x, y):
            assert core(x)[0] == core(y)[0]
    # doubling/tripling keeps the core
    for n in range(1, N + 1):
        for k in (2, 3):
            if k * n <= N:
                assert core(k * n)[0] == core(n)[0]
    per = {m: len(brute_family(nums)) for m, nums in fam.items()}
    total = sum(per.values())
    assert total == expected, (N, total)
    assert mis_whole(N) == expected
    singles = check_cover(N, dominoes, fam)
    assert len(dominoes) + len(singles) == expected  # upper bound meets answer
    assert N - len(dominoes) == expected
    # chosen set: valid, right size, exactly one per domino, all singles
    assert valid(chosen) and len(chosen) == expected and len(set(chosen)) == expected
    for d in dominoes:
        assert sum(x in chosen for x in d) == 1, d
    assert all(s in chosen for s in singles)
    # neighbours in the grid have different colours (a+b parity)
    for x, y in combinations(range(1, N + 1), 2):
        if clash(x, y):
            assert (sum(core(x)[1:]) + sum(core(y)[1:])) % 2 == 1
    return fam, per, singles


# ---------- main question, N = 100 ----------
N = 100
L4 = [17, 19, 23, 25]
L3 = [29, 31]
PAIRS = [35, 37, 41, 43, 47, 49]
DOM = (
    [(1, 2), (4, 8), (16, 32), (3, 6), (12, 24), (48, 96), (9, 18), (36, 72), (27, 54)]  # core 1: 9
    + [(5, 10), (40, 80), (20, 60), (15, 30), (45, 90)]                                  # core 5: 5
    + [(7, 14), (28, 56), (21, 63), (42, 84)]                                            # core 7: 4
    + [(11, 22), (44, 88), (33, 66)]                                                     # core 11: 3 (+99)
    + [(13, 26), (39, 78)]                                                               # core 13: 2 (+52)
    + [d for m in L4 for d in ((2 * m, 4 * m), (m, 3 * m))]                              # L's: 2 each
    + [(m, 2 * m) for m in L3]                                                           # (+3m)
    + [(m, 2 * m) for m in PAIRS]
)
CHOSEN = ([1, 4, 16, 64, 6, 24, 96, 9, 36, 54, 81]       # core 1 green: 11
          + [5, 20, 80, 30, 45]                           # core 5: 5
          + [7, 28, 42, 63]                               # core 7: 4
          + [11, 44, 66, 99]                              # core 11: 4
          + [13, 52, 78]                                  # core 13: 3
          + [x for m in L4 for x in (m, 4 * m)]           # 2 each
          + [x for m in L3 for x in (2 * m, 3 * m)]       # purple wins: 2 each
          + PAIRS                                         # 1 each
          + [m for m in range(53, 101) if m % 2 and m % 3])  # loners
fam, per, singles = run(N, DOM, CHOSEN, 61)
answer = 61
assert CHOICES[CORRECT_INDEX] == answer
print("answer:", answer, "= choice", "ABCDE"[CORRECT_INDEX])

# families
assert len(fam) == 33
assert fam[1] == sorted([1, 2, 4, 8, 16, 32, 64, 3, 6, 12, 24, 48, 96, 9, 18, 36, 72, 27, 54, 81])
assert len(fam[1]) == 20
assert core(72) == (1, 3, 2) and core(40) == (5, 3, 0)
rows = {}
for n in fam[1]:
    _, a, b = core(n); rows.setdefault(b, []).append(n)
assert rows[0] == [1, 2, 4, 8, 16, 32, 64] and rows[1] == [3, 6, 12, 24, 48, 96]
assert rows[2] == [9, 18, 36, 72] and rows[3] == [27, 54] and rows[4] == [81]
green1 = [n for n in fam[1] if sum(core(n)[1:]) % 2 == 0]
green_rows = [sum(1 for n in rows[b] if (core(n)[1] + b) % 2 == 0) for b in range(5)]
assert green_rows == [4, 3, 2, 1, 1] and len(green1) == 11 and 20 - 11 == 9
assert 11 > 20 // 2  # more than half
assert sorted(set(singles) & set(fam[1])) == [64, 81]
assert sum(1 for d in DOM if core(d[0])[0] == 1) == 9
print("core 1: 20 numbers, green", green_rows, "= 11, purple 9; 9 dominoes + 64, 81")

assert fam[5] == [5, 10, 15, 20, 30, 40, 45, 60, 80, 90] and per[5] == 5
assert len(fam[7]) == 8 and per[7] == 4
assert len(fam[11]) == 7 and per[11] == 4
assert len(fam[13]) == 5 and per[13] == 3
for m in L4:
    assert fam[m] == sorted([m, 2 * m, 4 * m, 3 * m]) and per[m] == 2
for m in L3:
    assert fam[m] == sorted([m, 2 * m, 3 * m]) and per[m] == 2
    # purple (the two ends 2m, 3m) beats green (m alone)
    assert valid([2 * m, 3 * m])
for m in PAIRS:
    assert fam[m] == [m, 2 * m] and per[m] == 1
assert fam[49] == [49, 98]
loners = [m for m in fam if len(fam[m]) == 1]
assert len(loners) == 16 and min(loners) == 53
assert set(fam) == {1, 5, 7, 11, 13} | set(L4) | set(L3) | set(PAIRS) | set(loners)
s1 = 11 + 5 + 4 + 4 + 3
assert s1 == 27
assert 2 * len(L4) == 8 and 2 * len(L3) == 4 and len(PAIRS) == 6
assert s1 + 8 + 4 + 6 + 16 == 61
print("per family: 11+5+4+4+3 = 27, L's 8 + 4, pairs 6, loners 16 -> 61")

# solution 2
assert len(DOM) == 39 and 100 - 39 == 61
print("solution 2: 39 dominoes, 100 - 39 = 61; colouring keeps exactly one per domino")

# traps
top = list(range(51, 101))
assert len(top) == 50 and valid(top) and 50 < 61
print("A 50: 51..100 is clash-free, 50 numbers")
t67 = list(range(34, 101))
assert len(t67) == 67 and not valid(t67) and clash(34, 68)
print("E 67: 34..100 has 67 numbers, but 34 & 68 clash")
assert 58 < 61 and 64 > 61
print("B 58 < 61 (we built 61); D 64 > 61 (domino bound)")

# ---------- variant, N = 30 ----------
NV = 30
DOMV = ([(1, 3), (2, 4), (8, 16), (12, 24), (6, 18), (9, 27)]   # core 1: 6 dominoes, 12 numbers
        + [(5, 10), (15, 30)]                                  # core 5 (+20)
        + [(14, 28), (7, 21)]                                  # core 7
        + [(11, 22), (13, 26)])
CHOSENV = [1, 4, 16, 6, 24, 9, 5, 20, 30, 7, 28, 11, 13, 17, 19, 23, 25, 29]
famv, perv, singlesv = run(NV, DOMV, CHOSENV, 18)
assert len(famv[1]) == 12 and perv[1] == 6
assert perv[5] == 3 and perv[7] == 2 and perv[11] == 1 and perv[13] == 1
assert sorted(m for m in famv if len(famv[m]) == 1) == [17, 19, 23, 25, 29]
assert 6 + 3 + 2 + 1 + 1 + 5 == 18
assert NV - len(DOMV) == 18
print("variant 1..30: 6+3+2+1+1+5 = 18 (12 dominoes, 30 - 12 = 18)")
print("all checks passed")
# variant core-1 grid: the two colours tie 6 / 6
g1 = [n for n in families(30)[1] if sum(core(n)[1:]) % 2 == 0]
assert len(g1) == 6 and len(families(30)[1]) - len(g1) == 6
print("variant core 1: green 6, purple 6 (either colour)")
