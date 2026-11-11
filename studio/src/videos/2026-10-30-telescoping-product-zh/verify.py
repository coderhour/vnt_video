"""Exact check (fractions) of (1 + 1/2)(1 + 1/4)(1 + 1/16)(1 + 1/256), every number the video shows, the traps and the variant."""
from fractions import Fraction as F
from functools import reduce

prod = lambda xs: reduce(lambda a, b: a * b, xs, F(1))

# Question. Bank choices; correct_index 2 = 65535/32768.
CHOICES = [F(65535, 65536), F(255, 128), F(65535, 32768), F(131071, 65536), F(65537, 32768)]
dens = [2, 4, 16, 256]
P = prod(1 + F(1, d) for d in dens)
assert P == F(65535, 32768) == CHOICES[2]
assert [c == P for c in CHOICES] == [False, False, True, False, False]
print("answer:", P, "= choice C, about", float(P))

# Each bottom number is the one before it, squared.
assert all(dens[i + 1] == dens[i] ** 2 for i in range(3))
assert P > F(3, 2) and P < 2  # every bracket > 1, so the answer is above 3/2; and just under 2

# Solution 1: multiply one bracket at a time.
steps = [prod(1 + F(1, d) for d in dens[:k]) for k in range(1, 5)]
assert steps == [F(3, 2), F(15, 8), F(255, 128), F(65535, 32768)]
assert 3 * 5 == 15 and 2 * 4 == 8 and 15 * 17 == 255 and 8 * 16 == 128 and 128 * 256 == 32768
# Fractions are already in lowest terms (odd tops), so "top" and "bottom" are what's shown.
for s, (top, bot) in zip(steps, [(3, 2), (15, 8), (255, 128), (65535, 32768)]):
    assert s.numerator == top and s.denominator == bot
    assert top == 2 * bot - 1          # each top is one less than double its bottom
    assert s == 2 - F(1, bot)          # so each answer is two minus a small piece
assert [4 - 1, 16 - 1, 256 - 1] == [3, 15, 255]
# Last step: 255 x 257 = (256 - 1)(256 + 1) = 256^2 - 1, and 256^2 is double the new bottom.
assert 255 * 257 == (256 - 1) * (256 + 1) == 256 ** 2 - 1 == 65535
assert 256 ** 2 == 65536 == 2 * 32768
for a in range(-50, 50):
    assert (a - 1) * (a + 1) == a * a + a - a - 1 == a * a - 1

# Solution 2: the helper (1 - 1/2), then the chain collapses.
h = 1 - F(1, 2)
chain = [h]
for d in dens:
    chain.append(chain[-1] * (1 + F(1, d)))
assert chain[1:] == [1 - F(1, 4), 1 - F(1, 16), 1 - F(1, 256), 1 - F(1, 256 ** 2)]
assert chain[-1] == h * P == 1 - F(1, 65536)
undone = chain[-1] / h  # undo the helper: divide by one half = double
assert undone == 2 * (1 - F(1, 65536)) == 2 - F(2, 65536) == 2 - F(1, 32768) == P

# Traps.
A, B, C_, D, E = CHOICES
assert A == h * P == 1 - F(1, 65536) and A < 1          # forgot to undo the helper; below 1, impossible
assert B == steps[2]                                    # only three brackets
assert D == 2 - F(1, 65536) and D != P                  # doubled the 1 but not the tiny piece
assert E == 2 * (1 + F(1, 65536)) and E > 2             # plus instead of minus: above 2
print("traps: A", A, "B", B, "D", D, "E", E)

# Variant: (1 + 1/3)(1 + 1/9). Helper (1 - 1/3) = 2/3; divide by 2/3 = times 3/2.
V = (1 + F(1, 3)) * (1 + F(1, 9))
assert F(4, 3) * F(10, 9) == V == F(40, 27) and 4 * 10 == 40 and 3 * 9 == 27
hv = 1 - F(1, 3)
assert hv == F(2, 3)
assert hv * (1 + F(1, 3)) == 1 - F(1, 9)
assert hv * V == 1 - F(1, 81) == F(80, 81)
assert F(80, 81) * F(3, 2) == F(240, 162) == F(40, 27) == V
assert 80 * 3 == 240 and 81 * 2 == 162
assert 2 * F(80, 81) == F(160, 81) != V                 # trap: doubling out of habit
assert 9 == 3 ** 2
print("variant:", V, "| doubling by habit gives", F(160, 81))
print("ok")
