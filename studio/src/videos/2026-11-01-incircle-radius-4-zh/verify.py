"""Verify c1-301: integer triangle, inradius 4, tangent lengths 6 from A -> largest perimeter 162 (choice E).
Also the variant: inradius 3, tangent lengths 4 from A -> largest perimeter 56."""
from fractions import Fraction as F
from math import isqrt, gcd


def brute(r, t, pmax):
    """All integer triangles (a=BC, b=CA, c=AB) with inradius r and s - a = t. Returns sorted (p, a, b, c), b <= c."""
    out = []
    for p in range(3, pmax + 1):
        if (p - 2 * t) % 2:
            continue
        a = (p - 2 * t) // 2  # s - a = t  <=>  p - 2a = 2t
        for b in range(1, p):
            c = p - a - b
            if c < b or not (a < b + c and b < a + c and c < a + b):
                continue
            # r^2 = (s-a)(s-b)(s-c)/s  <=>  (p-2a)(p-2b)(p-2c) = 4 p r^2
            if (p - 2 * a) * (p - 2 * b) * (p - 2 * c) == 4 * p * r * r:
                out.append((p, a, b, c))
    return out


# ---------- Question ----------
tri = brute(4, 6, 3000)
print("brute force (r=4, s-a=6):", tri)
assert [t[0] for t in tri] == [42, 60, 162]
choices = [42, 60, 81, 150, 162]
assert choices.index(max(t[0] for t in tri)) == 4  # correct_index 4

# Setup: tangent pieces 6, y, z. AB = 6+y, AC = 6+z, BC = y+z, s = 6+y+z.
# Area = r*s = 4s (three small triangles, height 4). Heron: s-BC = 6, s-AC = y, s-AB = z.
# (4s)^2 = s*6*y*z -> 16s = 6yz -> 8s = 3yz -> 48 + 8y + 8z = 3yz
# Solution 1: z = (8y + 48)/(3y - 8), y >= 3 (3y > 8); table y = 3..8.
table = {}
for y in range(3, 9):
    num, den = 8 * y + 48, 3 * y - 8
    table[y] = (num, den, F(num, den))
    print(f"  y={y}: z = {num}/{den} = {F(num, den)}")
assert table[3][:2] == (72, 1) and table[4][:2] == (80, 4) and table[5][:2] == (88, 7)
assert table[6][:2] == (96, 10) and table[7][:2] == (104, 13) and table[8][2] == 7
assert [y for y in table if table[y][2].denominator == 1] == [3, 4, 7, 8]
# z decreasing in y (derivative numerator 8(3y-8) - 3(8y+48) = -208 < 0), and for y >= 8, z <= 7 < y: table complete.
assert all(F(8 * y + 48, 3 * y - 8) < F(8 * (y - 1) + 48, 3 * (y - 1) - 8) for y in range(4, 200))
sols = []
for y, z in [(3, 72), (4, 20), (7, 8)]:
    s = 6 + y + z
    assert 48 + 8 * y + 8 * z == 3 * y * z
    AB, AC, BC = 6 + y, 6 + z, y + z
    area2 = s * 6 * y * z  # Heron, squared
    assert area2 == (4 * s) ** 2  # r = 4 exactly
    sols.append((y, z, s, 2 * s, (AB, AC, BC)))
    print(f"  y={y}, z={z}: s={s}, perimeter={2*s}, sides AB={AB}, AC={AC}, BC={BC}")
assert [x[3] for x in sols] == [162, 60, 42]
assert sols[0][4] == (9, 78, 75) and sols[1][4] == (10, 26, 24) and sols[2][4] == (13, 14, 15)
assert 10 ** 2 + 24 ** 2 == 26 ** 2  # the 60 triangle is right-angled at B

# Solution 2: x3 -> 9yz - 24y - 24z = 144; +64 -> (3y-8)(3z-8) = 208
assert 3 * 48 == 144 and 144 + 64 == 208
for y in range(1, 100):
    for z in range(1, 100):
        assert (3 * y * z - 8 * y - 8 * z == 48) == ((3 * y - 8) * (3 * z - 8) == 208)
pairs = [(d, 208 // d) for d in range(1, 15) if 208 % d == 0 and d <= 208 // d]
assert pairs == [(1, 208), (2, 104), (4, 52), (8, 26), (13, 16)]
good = [(d, e) for d, e in pairs if d % 3 == 1 and e % 3 == 1]  # 3y-8 = 3(y-3)+1
assert good == [(1, 208), (4, 52), (13, 16)]
assert [((d + 8) // 3, (e + 8) // 3) for d, e in good] == [(3, 72), (4, 20), (7, 8)]
# negative factor pairs impossible: 3y-8 >= -5 and 3z-8 >= -5, product of two would be <= 25 < 208

# Traps
assert sols[0][2] == 81            # C: semiperimeter, not doubled
assert 2 * (3 + 72) == 150 == 162 - 12  # D: leaving out the two 6s at A
# A = 42 and B = 60 are the other two real triangles

# ---------- Variant: r = 3, tangent lengths 4 from A ----------
vt = brute(3, 4, 3000)
print("variant brute force (r=3, s-a=4):", vt)
assert [t[0] for t in vt] == [32, 56]
# (3s)^2 = s*4yz -> 9s = 4yz -> 36 + 9y + 9z = 4yz -> z = (9y+36)/(4y-9), y >= 3
vtab = {y: (9 * y + 36, 4 * y - 9) for y in range(3, 8)}
assert vtab[3] == (63, 3) and vtab[4] == (72, 7) and vtab[5] == (81, 11) and vtab[6] == (90, 15)
assert [y for y, (n, d) in vtab.items() if n % d == 0] == [3, 6]
assert F(*vtab[7]) < 7  # after y=6, z drops below y
for y, z, s, p in [(3, 21, 28, 56), (6, 6, 16, 32)]:
    assert 36 + 9 * y + 9 * z == 4 * y * z and 4 + y + z == s and 2 * s == p
    assert s * 4 * y * z == (3 * s) ** 2
assert (4 + 3, 4 + 21, 3 + 21) == (7, 25, 24) and 7 ** 2 + 24 ** 2 == 25 ** 2  # 7-24-25 right triangle
assert (4 * 3 - 9) * (4 * 21 - 9) == 225  # factoring check: (4y-9)(4z-9) = 225

# ---------- Figure coordinates (maths coords, y up), A at origin, AC along +x ----------
# Question: incentre I = (6, 4); AB direction (5/13, 12/13) since tan(A/2) = 4/6 = 2/3.
from math import hypot, atan2, degrees
def fig(r, t, y, z):
    tt = F(r, t)
    ux, uy = (1 - tt * tt) / (1 + tt * tt), 2 * tt / (1 + tt * tt)
    A = (0, 0); B = (float(ux * (t + y)), float(uy * (t + y))); C = (t + z, 0)
    a, b, c = hypot(B[0] - C[0], B[1] - C[1]), t + z, t + y
    p = a + b + c
    I = ((a * A[0] + b * B[0] + c * C[0]) / p, (a * A[1] + b * B[1] + c * C[1]) / p)
    assert abs(I[0] - t) < 1e-9 and abs(I[1] - r) < 1e-9 and abs(a - (y + z)) < 1e-9
    return B, C
for y, z in [(7, 8), (4, 20), (3, 72)]:
    print("  question fig y,z =", (y, z), "B,C =", fig(4, 6, y, z))
for y, z in [(3, 21), (6, 6)]:
    print("  variant fig y,z =", (y, z), "B,C =", fig(3, 4, y, z))
print("angle A (question) =", round(degrees(2 * atan2(4, 6)), 2), "deg; variant", round(degrees(2 * atan2(3, 4)), 2))
print("ALL CHECKS PASS")
