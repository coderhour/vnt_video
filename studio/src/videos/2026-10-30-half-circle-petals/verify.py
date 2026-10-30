"""Numeric check: four half circles inside a square, the shaded area, every trap and the variant.

Run: python3 verify.py   (pure Python, about 20 s)
Square [0,s]x[0,s]. Each half circle has a side as diameter (radius s/2) and bulges inward.
A point is white (in a petal) iff it lies in two or more half circles; shaded iff in exactly one.
"""
from math import isclose, pi


def cover_counts(s, n=1200):
    """Midpoint grid: area covered by exactly k half circles, k = 0..4."""
    r = s / 2
    centres = [(r, 0), (r, s), (0, r), (s, r)]  # bottom, top, left, right sides
    cell = (s / n) ** 2
    area = [0.0] * 5
    for i in range(n):
        x = (i + 0.5) * s / n
        for j in range(n):
            y = (j + 0.5) * s / n
            k = sum((x - cx) ** 2 + (y - cy) ** 2 < r * r for cx, cy in centres)
            area[k] += cell
    return area


def check(s, shaded_exact, petals_exact):
    a = cover_counts(s)
    tol = 2e-3 * s * s
    assert a[0] < tol, f"uncovered area {a[0]}"            # the half circles cover the whole square
    assert a[3] + a[4] < tol, "triple overlap"              # no point is in three of them
    assert abs(a[2] - petals_exact) < tol, (a[2], petals_exact)
    assert abs(a[1] - shaded_exact) < tol, (a[1], shaded_exact)
    print(f"side {s}: shaded {a[1]:.4f} (exact {shaded_exact:.4f}), petals {a[2]:.4f} (exact {petals_exact:.4f})")


# ---- the question: side 4, radius 2 ----
check(4, 32 - 8 * pi, 8 * pi - 16)

# Solution 1: one petal = two equal slices; slice = quarter circle - right triangle.
quarter = pi * 2 ** 2 / 4          # = pi
triangle = 2 * 2 / 2               # legs 2 and 2 -> 2
slice_ = quarter - triangle        # pi - 2
petal = 2 * slice_                 # 2pi - 4
assert isclose(petal * 4, 8 * pi - 16)
assert isclose(16 - 4 * petal, 32 - 8 * pi)
# Same split, per small 2x2 square: shaded part = 4 - petal = 8 - 2pi, four of them.
assert isclose(4 * (4 - petal), 32 - 8 * pi)

# Solution 2: count twice. Four half circles = 4 * (pi*2^2/2) = 8pi. Sum = square + petals.
halves = 4 * pi * 2 ** 2 / 2
assert isclose(halves, 8 * pi)
petals = halves - 16
assert isclose(petals, 8 * pi - 16) and isclose(16 - petals, 32 - 8 * pi)

# Numbers shown on screen
print(f"answer 32-8pi = {32 - 8 * pi:.3f}  ({(32 - 8 * pi) / 16:.1%} of the square)")
print(f"one slice pi-2 = {pi - 2:.3f}, one petal 2pi-4 = {2 * pi - 4:.3f}, petals 8pi-16 = {8 * pi - 16:.3f}")

# ---- the choices (bank correct_index = 1) ----
choices = [16 - 4 * pi, 32 - 8 * pi, 8 * pi - 16, 16 - 2 * pi, 48 - 8 * pi]
assert min(range(5), key=lambda i: abs(choices[i] - (32 - 8 * pi))) == 1
for i, v in enumerate(choices):
    print(f"  {'ABCDE'[i]}: {v:.3f}")
# A: square minus TWO half circles (= one whole circle of radius 2): 16 - 2*(2pi) = 16 - 4pi
assert isclose(16 - 2 * (pi * 4 / 2), choices[0])
# A is also exactly half the right answer (shows it is too small)
assert isclose(2 * choices[0], 32 - 8 * pi)
# C: the white petals, not the shaded part
assert isclose(choices[2], 8 * pi - 16)
# D: square minus ONE half circle
assert isclose(16 - pi * 4 / 2, choices[3])
# E: bigger than the whole square, impossible; = 16 - (8pi - 32), petals with the square taken away twice
assert choices[4] > 16 and isclose(16 - (8 * pi - 32), choices[4])
# shaded + petals = square
assert isclose(choices[1] + choices[2], 16)

# ---- the variant: side 6, radius 3 ----
check(6, 72 - 18 * pi, 18 * pi - 36)
halves6 = 4 * pi * 3 ** 2 / 2       # 18pi
assert isclose(halves6, 18 * pi)
assert isclose(36 - (halves6 - 36), 72 - 18 * pi)
slice6 = pi * 9 / 4 - 9 / 2           # quarter circle 9pi/4 - triangle 9/2
assert isclose(36 - 8 * slice6, 72 - 18 * pi)
assert isclose((32 - 8 * pi) * 9 / 4, 72 - 18 * pi)  # 1.5x the side -> 2.25x the area
print(f"variant 72-18pi = {72 - 18 * pi:.3f}")
print("all checks passed")
