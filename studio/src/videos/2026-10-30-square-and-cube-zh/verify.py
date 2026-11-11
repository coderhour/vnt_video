"""Brute-force check of every number the video shows: 20n a perfect square, 50n a perfect cube."""
from math import isqrt


def is_square(m):
    return isqrt(m) ** 2 == m


def is_cube(m):
    r = round(m ** (1 / 3))
    return any((r + d) ** 3 == m for d in (-1, 0, 1))


def smallest(p, q, limit=10**6):
    return next(n for n in range(1, limit) if is_square(p * n) and is_cube(q * n))


def factor(m):
    out, d = {}, 2
    while d * d <= m:
        while m % d == 0:
            out[d] = out.get(d, 0) + 1
            m //= d
        d += 1
    if m > 1:
        out[m] = out.get(m, 0) + 1
    return out


# Question. Choices A-E; bank correct_index 1 = 20.
CHOICES = [10, 20, 40, 50, 100]
n = smallest(20, 50)
assert n == 20 and CHOICES.index(n) == 1
assert 20 * n == 400 == 20**2 and 50 * n == 1000 == 10**3
print("question: n =", n, "-> 20n = 400 = 20^2, 50n = 1000 = 10^3")

# Shown facts
assert factor(20) == {2: 2, 5: 1} and factor(50) == {2: 1, 5: 2} and factor(400) == {2: 4, 5: 2} and factor(1000) == {2: 3, 5: 3}

# Solution 1: 20n is a square exactly when n = 5 * (a square). List them, test 50n.
sq_n = [m for m in range(1, 200) if is_square(20 * m)]
assert sq_n[:5] == [5, 20, 45, 80, 125] and all(m == 5 * k * k for k, m in zip(range(1, 6), sq_n))
assert 20 * 5 == 100 == 10**2 and 50 * 5 == 250 and not is_cube(250)  # 6^3=216 < 250 < 343=7^3
assert 6**3 == 216 and 7**3 == 343
print("solution 1 list:", sq_n[:5], "-> 50n:", [50 * m for m in sq_n[:2]])

# Solution 2: n = 2^a 5^b. 20n = 2^(a+2) 5^(b+1), 50n = 2^(a+1) 5^(b+2).
twos = [a for a in range(12) if (a + 2) % 2 == 0 and (a + 1) % 3 == 0]
fives = [b for b in range(12) if (b + 1) % 2 == 0 and (b + 2) % 3 == 0]
assert twos[0] == 2 and fives[0] == 1 and 2 ** twos[0] * 5 ** fives[0] == 20
assert [a for a in range(10) if a % 2 == 0] == [0, 2, 4, 6, 8]
assert [a for a in range(10) if (a + 1) % 3 == 0] == [2, 5, 8]
assert [b for b in range(10) if b % 2 == 1] == [1, 3, 5, 7, 9]
assert [b for b in range(10) if (b + 2) % 3 == 0] == [1, 4, 7]
print("solution 2: a =", twos[0], " b =", fives[0])
# Any other prime p in n needs an exponent that is even AND a multiple of 3, so at least 6: only makes n bigger.

# Traps: every wrong choice fails; show which condition fails.
for c in CHOICES:
    print(f"  n={c}: 20n={20 * c} square={is_square(20 * c)}  50n={50 * c} cube={is_cube(50 * c)}")
assert not is_square(200) and not is_cube(500)            # 10
assert not is_square(800) and not is_cube(2000)           # 40
assert 28**2 == 784 and 29**2 == 841 and 12**3 == 1728 and 13**3 == 2197
assert 20 * 50 == 1000 and is_cube(1000) and not is_square(1000)  # 50: roles swapped
assert 50 * 50 == 2500 == 50**2 and not is_cube(2500)
assert not is_square(2000) and not is_cube(5000)          # 100 = lcm(20, 50)
assert 44**2 == 1936 and 45**2 == 2025 and 17**3 == 4913 and 18**3 == 5832
from math import gcd, lcm
assert gcd(20, 50) == 10 and lcm(20, 50) == 100
# Only-the-square trap: smallest n with 20n square is 5 (fails the cube). Smallest with 50n cube is 20.
assert next(m for m in range(1, 99) if is_square(20 * m)) == 5
assert next(m for m in range(1, 99) if is_cube(50 * m)) == 20

# Variant: 2n a perfect square and 3n a perfect cube -> 72.
v = smallest(2, 3)
assert v == 72 == 2**3 * 3**2 and 2 * v == 144 == 12**2 and 3 * v == 216 == 6**3
vlist = [m for m in range(1, 100) if is_square(2 * m)]
assert vlist[:6] == [2, 8, 18, 32, 50, 72]
assert [3 * m for m in vlist[:6]] == [6, 24, 54, 96, 150, 216]
assert [is_cube(3 * m) for m in vlist[:6]] == [False] * 5 + [True]
# exponents: 2n = 2^(a+1) 3^b, 3n = 2^a 3^(b+1)
assert next(a for a in range(12) if (a + 1) % 2 == 0 and a % 3 == 0) == 3
assert next(b for b in range(12) if b % 2 == 0 and (b + 1) % 3 == 0) == 2
print("variant: n =", v, "-> 2n = 144 = 12^2, 3n = 216 = 6^3")
print("all checks pass")
