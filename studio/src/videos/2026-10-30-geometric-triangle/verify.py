#!/usr/bin/env python3
"""Verify: triangles with 3 different integer sides in a geometric sequence, longest side N.

Run: python3 verify.py   (asserts everything; prints the lists the video shows)
"""
import json
from fractions import Fraction
from math import gcd, isqrt
from pathlib import Path


def brute(N):
    """Every a < b < N with b^2 = N*a (geometric) and a + b > N (triangle)."""
    return [(a, b, N) for b in range(1, N) for a in range(1, b) if b * b == N * a and a + b > N]


def by_ratio(N):
    """Video solution 1: ratio p/q (lowest terms, p < q) going down from N.
    Sides N, N*p/q, N*p^2/q^2. All whole <=> q^2 divides N (since gcd(p, q) = 1)."""
    out = []
    for q in range(2, N + 1):
        if N % (q * q):
            continue
        for p in range(1, q):
            if gcd(p, q) != 1:
                continue
            b, a = N * p // q, N * p * p // (q * q)
            assert Fraction(N * p, q) == b and Fraction(N * p * p, q * q) == a
            if a + b > N:
                out.append((a, b, N))
    return sorted(out, key=lambda t: t[1])


def by_m(n):
    """Video: N = n^2, every allowed ratio is m/n, sides m^2, n*m, n^2 with m < n and m^2 + n*m > n^2."""
    return [(m * m, n * m, n * n) for m in range(1, n) if m * m + n * m > n * n]


def divisors_q(N):
    return [q for q in range(1, N + 1) if N % (q * q) == 0]


def check(N):
    n = isqrt(N)
    assert n * n == N
    b, r, m = brute(N), by_ratio(N), by_m(n)
    assert sorted(b) == sorted(r) == sorted(m), (b, r, m)
    # q^2 | N  <=>  q | n : so every ratio can be written over n
    assert all(n % q == 0 for q in divisors_q(N))
    ms = [t[1] // n for t in m]
    return len(b), ms, divisors_q(N)


bank = json.loads((Path("/home/brad/code/vnt/priv/quiz_banks/amc_practice_amc10_algebra_template.json")).read_text())
qs = bank["questions"] if isinstance(bank, dict) else bank
q = next(x for x in qs if x["id"] == "c4-092")

count, ms, qs_ = check(2025)
print("N = 2025:", count, "triangles, m =", ms[0], "...", ms[-1], "| q with q^2 | 2025:", qs_)
assert count == 17 and ms == list(range(28, 45))
assert q["choices"][q["correct_index"]] == "\\(17\\)", q["choices"][q["correct_index"]]

# boundary shown on screen
assert 27 * 27 + 45 * 27 == 1944 < 2025 < 2044 == 28 * 28 + 45 * 28
assert 44 * 44 + 45 * 44 == 3916
# the first and last triangles shown
assert (784, 1260, 2025) in brute(2025) and (1936, 1980, 2025) in brute(2025)
# by-ratio breakdown by denominator q (cross-check of solution 1 before rewriting over 45)
per_q = {}
for a, b_, _ in by_ratio(2025):
    fr = Fraction(b_, 2025)
    per_q[fr.denominator] = per_q.get(fr.denominator, 0) + 1
print("by lowest-terms denominator q:", dict(sorted(per_q.items())))
assert per_q == {3: 1, 5: 1, 9: 2, 15: 3, 45: 10}

# traps: 16 = 44 - 28 (forgot to count both ends), 18 = adds m = 45 (equal sides) or m = 27,
# 27 = counts the m that FAIL (1..27), 44 = forgets the triangle rule (all m = 1..44)
assert len(range(1, 45)) == 44 and len(range(1, 28)) == 27 and 44 - 28 == 16 and len(range(28, 46)) == 18

# variant: longest side 144 = 12^2
vc, vms, vq = check(144)
print("N = 144:", vc, "triangles, m =", vms, "| q:", vq)
assert vc == 4 and vms == [8, 9, 10, 11]
assert 7 * 7 + 12 * 7 == 133 < 144 < 160 == 8 * 8 + 12 * 8
print("all checks pass")
