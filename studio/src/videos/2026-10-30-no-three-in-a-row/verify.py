"""Brute-force check: 8 coin flips, the same side never comes up 3 times in a row.

Question: amc_practice_amc8_counting_template:c1-919 (correct_index 3 = 17/64).
Run: python3 verify.py   (asserts everything the video says)
"""
from fractions import Fraction
from itertools import groupby, product
from math import comb


def streaks(s):
    return [len(list(g)) for _, g in groupby(s)]


def good(s, bad_len=3):
    """No streak of `bad_len` or more of the same side."""
    return max(streaks(s)) < bad_len


def outcomes(n):
    return ["".join(p) for p in product("HT", repeat=n)]


def no_hhh(s):
    return "HHH" not in s


def compositions(n, parts=(1, 2)):
    """Ordered ways to write n as a sum of the given parts (streak-length patterns)."""
    if n == 0:
        return [()]
    return [(p,) + rest for p in parts if p <= n for rest in compositions(n - p, parts)]


def check(n):
    all_ = outcomes(n)
    g = [s for s in all_ if good(s)]
    # Solution 1: streak lengths are 1s and 2s adding to n; times 2 for the first side.
    pats = compositions(n)
    by_twos = {k: comb(n - k, k) for k in range(n // 2 + 1)}  # k twos -> n-k blocks, choose where the twos go
    assert len(pats) == sum(by_twos.values())
    for k, c in by_twos.items():
        assert sum(1 for p in pats if p.count(2) == k) == c
    assert 2 * len(pats) == len(g)
    # The map (pattern, first side) -> string is a bijection onto the good strings.
    built = set()
    for p in pats:
        for first in "HT":
            other = {"H": "T", "T": "H"}[first]
            built.add("".join((first if i % 2 == 0 else other) * L for i, L in enumerate(p)))
    assert built == set(g)
    # Solution 2: a_n = a_(n-1) + a_(n-2), with a_1 = 2, a_2 = 4.
    a = [None, 2, 4]
    for m in range(3, n + 1):
        a.append(a[m - 1] + a[m - 2])
    for m in range(1, n + 1):
        assert a[m] == sum(1 for s in outcomes(m) if good(s)), m
    # Split by how the string ends: last streak 1 long (single) or 2 long (double).
    single = [sum(1 for s in outcomes(m) if good(s) and streaks(s)[-1] == 1) for m in range(1, n + 1)]
    double = [sum(1 for s in outcomes(m) if good(s) and streaks(s)[-1] == 2) for m in range(1, n + 1)]
    return len(all_), len(g), by_twos, a[1:], single, double


# ---- the question: 8 flips ----
total, ngood, by_twos, a, single, double = check(8)
p = Fraction(ngood, total)
print(f"8 flips: {ngood} good of {total} -> {p}  (~{float(p):.1%})")
print("  patterns by number of twos:", by_twos, "sum", sum(by_twos.values()))
print("  good strings by length 1..8:", a)
print("  ending in a single:", single, " ending in a double:", double)
assert (total, ngood, p) == (256, 68, Fraction(17, 64))
assert by_twos == {0: 1, 1: 7, 2: 15, 3: 10, 4: 1}
assert a == [2, 4, 6, 10, 16, 26, 42, 68]
CHOICES = [Fraction(1, 8), Fraction(17, 128), Fraction(1, 4), Fraction(17, 64), Fraction(149, 256)]
assert CHOICES.index(p) == 3  # bank correct_index = 3 (D)

# Length 3: the six good strings, built from length 2 (+1 flip of the other side) and length 1 (+2 flips).
three = sorted(s for s in outcomes(3) if good(s))
print("  good strings of length 3:", three)
assert three == sorted(["HHT", "HTH", "THT", "TTH", "HTT", "THH"])

# Intro hook: a streak of 3 or more shows up in 188 of 256 = about 73%, almost three out of four.
bad = total - ngood
print(f"  with a streak of 3+: {bad}/{total} = {bad / total:.1%}")
assert bad == 188 and 0.70 < bad / total < 0.75

# ---- traps ----
# B 17/128 = 34/256: counted the 34 patterns but forgot the 2 starting sides.
assert Fraction(len(compositions(8)), 256) == Fraction(17, 128)
# E 149/256: only forbade three HEADS in a row (tails streaks allowed).
nh = sum(1 for s in outcomes(8) if no_hhh(s))
print("  E trap: no HHH only ->", nh, Fraction(nh, 256))
assert Fraction(nh, 256) == Fraction(149, 256)
# A 1/8: the chance that three given flips are all heads.
assert Fraction(sum(1 for s in outcomes(3) if s == "HHH"), 8) == Fraction(1, 8)
# C 1/4: the chance that three given flips all match (HHH or TTT).
assert Fraction(sum(1 for s in outcomes(3) if len(set(s)) == 1), 8) == Fraction(1, 4)
# Fibonacci link: 34 patterns; patterns for 1..8 flips are 1, 2, 3, 5, 8, 13, 21, 34.
assert [len(compositions(m)) for m in range(1, 9)] == [1, 2, 3, 5, 8, 13, 21, 34]

# ---- variant: 9 flips ----
total9, ngood9, by_twos9, a9, _, _ = check(9)
p9 = Fraction(ngood9, total9)
print(f"9 flips: {ngood9} good of {total9} -> {p9}  (~{float(p9):.1%})")
print("  patterns by number of twos:", by_twos9, "sum", sum(by_twos9.values()))
assert (total9, ngood9, p9) == (512, 110, Fraction(55, 256))
assert a9[-1] == a[-1] + a[-2] == 42 + 68
assert by_twos9 == {0: 1, 1: 8, 2: 21, 3: 20, 4: 5}

print("all checks passed")
