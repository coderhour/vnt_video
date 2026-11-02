"""Check: integers b with both roots of x^2 + b x + 12 b = 0 integers (amc10 algebra c2-002), every number the video shows."""
from math import isqrt


def good_bs(k, lo=-10**4, hi=10**4):
    """Brute force: b such that x^2 + b x + k b has two integer roots (a double root counts)."""
    out = []
    for b in range(lo, hi + 1):
        D = b * b - 4 * k * b
        if D >= 0 and isqrt(D) ** 2 == D and (-b + isqrt(D)) % 2 == 0:
            out.append(b)
    return out


B = good_bs(12)
assert len(B) == 16
choices = [8, 15, 16, 30, 32]
assert choices[2] == 16                                           # bank correct_index 2
# bounds are wide enough: the extreme b values are -121 and 169
assert min(B) == -121 and max(B) == 169

# Intro example: b = -1 -> x^2 - x - 12 = (x - 4)(x + 3), roots 4 and -3
assert -1 in B and all(r * r - r - 12 == 0 for r in (4, -3))

# Solution 1: r + s = -b, rs = 12b  =>  rs + 12r + 12s = 0  =>  (r + 12)(s + 12) = 144
divs = [d for d in range(1, 145) if 144 % d == 0]
assert divs == [1, 2, 3, 4, 6, 8, 9, 12, 16, 18, 24, 36, 48, 72, 144] and len(divs) == 15
pos_pairs = [(u, 144 // u) for u in divs if u <= 144 // u]
assert pos_pairs == [(1, 144), (2, 72), (3, 48), (4, 36), (6, 24), (8, 18), (9, 16), (12, 12)]
pairs = pos_pairs + [(-u, -v) for u, v in pos_pairs]
assert len(pairs) == 16
bs = [24 - (u + v) for u, v in pairs]                             # r = u - 12, s = v - 12, b = -(r + s)
assert bs == [-121, -50, -27, -16, -6, -2, -1, 0, 169, 98, 75, 64, 54, 50, 49, 48]
assert sorted(bs) == B and len(set(u + v for u, v in pairs)) == 16  # all sums different
for (u, v), b in zip(pairs, bs):
    r, s = u - 12, v - 12
    assert r + s == -b and r * s == 12 * b
    assert r * r + b * r + 12 * b == 0 and s * s + b * s + 12 * b == 0
assert 24 - (9 + 16) == -1 and (9 - 12, 16 - 12) == (-3, 4)        # opening example
assert 24 - (12 + 12) == 0                                         # double root 0, x^2 = 0
assert 24 - (-12 - 12) == 48                                       # (x + 24)^2, double root -24
assert 24 - (-1 - 144) == 169

# Solution 2: d = r + 12, b = 24 - d - 144/d, d | 144 (d = 0 impossible: 0 = -144)
ds = divs + [-d for d in divs]
assert len(ds) == 30
for d in ds:
    r = d - 12
    b = 24 - d - 144 // d
    assert b * d == -r * r and r * r + b * r + 12 * b == 0
    s = -b - r
    assert s * s + b * s + 12 * b == 0 and s + 12 == 144 // d      # partner of d is 144/d
assert 24 - 16 - 144 // 16 == -1 and 24 - 9 - 144 // 9 == -1
assert [d for d in ds if d * d == 144] == [12, -12]
assert (30 - 2) // 2 == 14 and 14 + 2 == 16
assert sorted(set(24 - d - 144 // d for d in ds)) == B

# Traps: 8 positive pairs only; 15 positive divisors; 30 all divisors (ordered pairs); 32 = 2 * 16
assert len(pos_pairs) == 8 and len(divs) == 15 and len(ds) == 30 and 2 * 16 == 32
ordered = [(u, 144 // u) for u in ds]
assert len(ordered) == 30

# Variant: x^2 + b x + 6 b = 0  =>  (r + 6)(s + 6) = 36
V = good_bs(6)
assert len(V) == 10
d36 = [d for d in range(1, 37) if 36 % d == 0]
assert len(d36) == 9
vp = [(u, 36 // u) for u in d36 if u <= 36 // u]
assert vp == [(1, 36), (2, 18), (3, 12), (4, 9), (6, 6)]
vb = [12 - (u + v) for u, v in vp] + [12 + (u + v) for u, v in vp]
assert sorted(vb) == V and 5 + 5 == 10
assert (4 - 6, 9 - 6) == (-2, 3) and -(-2 + 3) == -1 and (-2) * 3 == 6 * -1
assert all(x * x - x - 6 == 0 for x in (3, -2))                   # (x - 3)(x + 2)
print("ok")
