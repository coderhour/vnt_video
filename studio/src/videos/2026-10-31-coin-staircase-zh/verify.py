"""Check: chance of standing on step 5 with 1-or-2 coin steps (amc8 counting c1-819), every number shown."""
from fractions import Fraction as F
from itertools import product

H = F(1, 2)


def exact(n, flips=12):
    """Chance of landing on step n, by enumerating every coin sequence (long enough to pass n)."""
    hit = F(0)
    for seq in product((1, 2), repeat=flips):
        pos = 0
        for s in seq:
            pos += s
            if pos == n:
                hit += H ** flips
                break
            if pos > n:
                break
    return hit


# Question: step 5. Choices; bank correct_index 3 -> 21/32.
choices = [F(1, 2), F(8, 13), F(5, 8), F(21, 32), F(11, 16)]
assert exact(5, 6) == F(21, 32) == choices[3]

# Solution 1: list the paths of 1s and 2s that add to 5.
paths = [p for r in range(1, 6) for p in product((1, 2), repeat=r) if sum(p) == 5]
assert len(paths) == 8
by_len = {}
for p in paths:
    by_len.setdefault(len(p), []).append(p)
assert {k: len(v) for k, v in by_len.items()} == {5: 1, 4: 4, 3: 3}
# five 1s: 1 path at 1/32; one 2 + three 1s: 4 paths at 1/16; two 2s + one 1: 3 paths at 1/8.
assert F(1, 32) + 4 * F(1, 16) + 3 * F(1, 8) == F(1, 32) + F(8, 32) + F(12, 32) == F(21, 32)
assert sum(H ** len(p) for p in paths) == F(21, 32)

# Solution 2: step ladder, each chance = half the step before + half the one before that.
p = [F(1), H]
for n in range(2, 7):
    p.append(H * p[n - 1] + H * p[n - 2])
assert p[:6] == [1, F(1, 2), F(3, 4), F(5, 8), F(11, 16), F(21, 32)]
assert all(p[n] == exact(n, 8) for n in range(1, 7))
# Halves the video reads aloud: (1/2 + 1) / 2 = 3/4, (3/4 + 1/2) / 2 = 5/8, (5/8 + 3/4) / 2 = 11/16, (11/16 + 5/8) / 2 = 21/32
assert (F(11, 16) + F(10, 16)) / 2 == F(21, 32)

# Traps: 1/2 (fifty-fifty), 8/13 (8 paths that land on 5 vs 5 that jump 4 -> 6, all treated as equal),
# 5/8 = step 3, 11/16 = step 4.
jump_over = [q for r in range(1, 6) for q in product((1, 2), repeat=r) if sum(q[:-1]) == 4 and q[-1] == 2]
assert len(jump_over) == 5 and F(8, 8 + 5) == F(8, 13)
assert p[3] == F(5, 8) and p[4] == F(11, 16)
assert sum(H ** len(q) for q in jump_over) == F(11, 32) and F(21, 32) + F(11, 32) == 1

# Variant: step 6 -> 43/64. Miss trick: you miss 6 only from step 5 with a 2: 1 - 21/64.
assert p[6] == F(43, 64) == exact(6, 8) == 1 - F(21, 32) * H
assert (F(21, 32) + F(11, 16)) / 2 == F(43, 64)
print("ok")
