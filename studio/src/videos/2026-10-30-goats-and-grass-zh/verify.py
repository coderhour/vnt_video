#!/usr/bin/env python3
"""Verify amc_practice_amc8_arithmetic_template:c1-493 (goats and growing grass) and the variant.

Model: unit = one "goat-day" (what one goat eats in one day). The field starts with S units and
grows g units per day. n goats finish it after t days when S + g*t = n*t.
"""
from fractions import Fraction as F


def solve_field(n1, t1, n2, t2):
    """Starting grass S and daily growth g from two (animals, days) cases."""
    e1, e2 = n1 * t1, n2 * t2          # total eaten = S + g*t
    g = F(e1 - e2, t1 - t2)
    S = e1 - g * t1
    return S, g


def days(S, g, n):
    return F(S, n - g)


def simulate(S, g, n, step=F(1, 100)):
    """Tick-by-tick: grass grows and goats eat in small steps; first time grass <= 0."""
    grass, t = F(S), F(0)
    while grass > 0:
        grass += (g - n) * step
        t += step
    return t


def brute(n1, t1, n2, t2, n, top=400):
    """Search all whole-number (S, g) that fit both cases, then the days for n animals."""
    hits = {(S, g, days(S, g, n)) for S in range(top + 1) for g in range(top + 1)
            if S + g * t1 == n1 * t1 and S + g * t2 == n2 * t2}
    return hits


def check(name, n1, t1, n2, t2, n, expect, helpers_expect):
    S, g = solve_field(n1, t1, n2, t2)
    d = days(S, g, n)
    print(f"{name}: eaten {n1*t1} and {n2*t2}; growth {g}/day; start {S}; {n} animals -> {d} days")
    assert d == expect
    assert simulate(S, g, n) == d
    assert brute(n1, t1, n2, t2, n) == {(S, g, d)}
    # check both given cases
    assert S + g * t1 == n1 * t1 and S + g * t2 == n2 * t2
    # "helper" view: g animals eat exactly the new growth, the rest eat the starting pile
    assert g == helpers_expect
    for nn, tt in [(n1, t1), (n2, t2), (n, d)]:
        assert F(S, nn - g) == tt, (nn, tt)
    # guess-and-check table for the helpers: (n1-k)*t1 vs (n2-k)*t2, gap shrinks by t1-t2 each step
    rows = [(k, (n1 - k) * t1, (n2 - k) * t2) for k in range(int(g) + 1)]
    print("   helpers k, pile from case 1, pile from case 2:", rows)
    assert rows[-1][1] == rows[-1][2] == S
    assert all(a != b for _, a, b in rows[:-1])
    # final check: n animals for d days eat S + g*d
    assert n * d == S + g * d
    return S, g, d


S, g, d = check("question", 10, 20, 15, 10, 25, 5, 5)
print("   check: 25 goats x 5 days =", 25 * d, "= start", S, "+ growth", g * d)

# Traps (choices 4, 6, 8, 10; the answer is 5)
traps = {
    "A 4  (start pile only, forget growth while the 25 goats eat)": F(S, 25),
    "C 6  (150 goat-days of case 2 / 25)": F(15 * 10, 25),
    "D 8  (200 goat-days of case 1 / 25)": F(10 * 20, 25),
    "E 10 (case-1 total 200 used as the start pile: 200 / (25 - 5))": F(10 * 20, 25 - g),
}
for k, v in traps.items():
    print("   trap", k, "->", v)
assert [traps[k] for k in traps] == [4, 6, 8, 10]
# "more goats, proportionally less time" (ignoring growth) gives 200/25 = 8 too
assert F(10 * 20, 25) == 8
choices = [4, 5, 6, 8, 10]
assert choices.index(d) == 1  # bank correct_index

# Variant: 8 sheep eat it in 30 days, 12 sheep in 15 days. 24 sheep?
vS, vg, vd = check("variant", 8, 30, 12, 15, 24, 6, 4)
print("   check: 24 sheep x 6 days =", 24 * vd, "= start", vS, "+ growth", vg * vd)
print("ALL CHECKS PASS")
