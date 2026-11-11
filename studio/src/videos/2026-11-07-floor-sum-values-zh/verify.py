"""Verify: #{n in 1..1000 : n = floor(x)+floor(2x)+floor(3x) for some real x} = 667 (bank choice index 0),
plus every solution's numbers, every trap value and the variant (floor(x)+floor(2x)+floor(4x), 1..100 -> 57)."""
from fractions import Fraction as F
from math import floor


def f(x, ks=(1, 2, 3)):
    return sum(floor(k * x) for k in ks)


def reachable(ks, top_x, den):
    """Exact sweep: every breakpoint is a multiple of 1/L (L = lcm of ks), and f is constant on
    [j/L, (j+1)/L). Sampling all multiples of 1/den (den a multiple of L) is exhaustive; we also
    sample midpoints between them to be safe."""
    vals = set()
    for j in range(top_x * den * 2 + 1):
        vals.add(f(F(j, 2 * den), ks))
    return vals


choices = [667, 668, 670, 750, 834]
correct_index = 0

# ---- main question --------------------------------------------------------
vals = reachable((1, 2, 3), 170, 6)  # f(170) = 1020 > 1000, f increasing, so x in [0,170] covers all
hit = sorted(v for v in vals if 1 <= v <= 1000)
ans = len(hit)
print("answer:", ans)
assert ans == 667 and choices.index(ans) == correct_index

# Staircase on 0 <= x < 1: values and where they start
steps = []
prev = None
for j in range(0, 600):
    x = F(j, 600)
    v = f(x)
    if v != prev:
        steps.append((x, v))
        prev = v
print("staircase on [0,1):", [(str(x), v) for x, v in steps])
assert steps == [(F(0), 0), (F(1, 3), 1), (F(1, 2), 2), (F(2, 3), 3)]
# no jump at 1/6 or 5/6
assert f(F(1, 6)) == f(F(0)) == 0 and f(F(5, 6)) == f(F(2, 3)) == 3
# jump sizes: +1 at 1/3, 1/2, 2/3; +3 at 1 (from 3 to 6)
assert f(F(1)) == 6 and f(F(1) - F(1, 10**9)) == 3
# shift rule: f(x+1) = f(x) + 6
for j in range(0, 600):
    x = F(j, 97)
    assert f(x + 1) == f(x) + 6
# values reached are exactly remainders 0,1,2,3 mod 6
assert all((v % 6) in (0, 1, 2, 3) for v in vals)
assert set(range(0, 1021)) - vals == {v for v in range(0, 1021) if v % 6 in (4, 5)}
# the block near 1000: x in [166,167) gives 996..999, then 1002
assert [f(166 + t) for t in (F(0), F(1, 3), F(1, 2), F(2, 3))] == [996, 997, 998, 999]
assert f(F(167)) == 1002
assert 1000 not in vals and 1001 not in vals

# Solution 1: complement count
r4 = [n for n in range(1, 1001) if n % 6 == 4]
r5 = [n for n in range(1, 1001) if n % 6 == 5]
print("remainder 4:", len(r4), r4[:3], "...", r4[-1], "| remainder 5:", len(r5), r5[:3], "...", r5[-1])
assert len(r4) == 167 and r4[-1] == 1000 and len(r5) == 166 and r5[-1] == 995
assert 1000 == 6 * 166 + 4
assert len(r4) + len(r5) == 333 and 1000 - 333 == 667

# Solution 2: blocks of six. 1..996 = 166 blocks (6k+1..6k+6); each has 4 hits (6k+1,6k+2,6k+3,6k+6)
for k in range(166):
    blk = range(6 * k + 1, 6 * k + 7)
    assert sum(1 for n in blk if n in vals) == 4
assert 166 * 6 == 996 and 166 * 4 == 664
left = [n for n in range(997, 1001) if n in vals]
print("leftover 997..1000 hits:", left)
assert left == [997, 998, 999]
assert 664 + 3 == 667

# ---- traps ----------------------------------------------------------------
assert 1000 - 166 * 2 == 668        # B: forgot that 1000 itself is skipped (only 166 pairs)
assert 1000 - 2 * 165 == 670        # C: what you'd get counting only 165 skipped pairs
assert F(3, 4) * 1000 == 750        # D: thinking one in every four is skipped
assert 1000 - 166 == 834            # E: only one skipped number per block of six
print("traps: 668 = 1000 - 332, 670 = 1000 - 2*165, 750 = 3/4 of 1000, 834 = 1000 - 166")

# ---- variant: floor(x)+floor(2x)+floor(4x), 1 <= n <= 100 -----------------
ks = (1, 2, 4)
steps = []
prev = None
for j in range(0, 800):
    x = F(j, 800)
    v = f(x, ks)
    if v != prev:
        steps.append((x, v))
        prev = v
print("variant staircase on [0,1):", [(str(x), v) for x, v in steps])
assert steps == [(F(0), 0), (F(1, 4), 1), (F(1, 2), 3), (F(3, 4), 4)]   # DOUBLE jump at 1/2 (1 -> 3)
assert f(F(1), ks) == 7                                                  # jump at 1: 4 -> 7 (skips 5, 6)
for j in range(0, 400):
    x = F(j, 89)
    assert f(x + 1, ks) == f(x, ks) + 7
vvals = reachable(ks, 20, 4)
assert all(v % 7 in (0, 1, 3, 4) for v in vvals)
vhit = [n for n in range(1, 101) if n in vvals]
vans = len(vhit)
print("variant answer:", vans)
assert 100 == 7 * 14 + 2 and 14 * 4 == 56
assert [n for n in (99, 100) if n in vvals] == [99]
assert vans == 57 == 56 + 1
print("all checks passed")
