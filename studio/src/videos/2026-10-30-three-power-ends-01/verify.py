"""Brute-force check: smallest n with 3^n ending in 01, every number the video shows, and the variant."""

choices = [4, 10, 20, 40, 100]
CORRECT_INDEX = 2  # bank's correct_index

# Brute force: first power of 3 whose last two digits are 01.
n = next(k for k in range(1, 1000) if pow(3, k, 100) == 1)
assert n == 20 and choices.index(n) == CORRECT_INDEX
print("answer:", n, "= choice", "ABCDE"[CORRECT_INDEX])

# Last digits of 3^n cycle 3, 9, 7, 1 (period 4): only multiples of 4 end in 1.
assert [pow(3, k, 10) for k in range(1, 9)] == [3, 9, 7, 1, 3, 9, 7, 1]
assert all((pow(3, k, 10) == 1) == (k % 4 == 0) for k in range(1, 200))

# Rule: last two digits of a product depend only on the last two digits of the factors.
assert all((a * b) % 100 == ((a % 100) * (b % 100)) % 100 for a in range(1, 400) for b in (3, 81))

# Solution 1: test n = 4, 8, 12, 16, 20 by multiplying the last two digits by 81 each time.
assert 3 ** 4 == 81
assert 81 * 81 == 6561 and 61 * 81 == 4941 and 41 * 81 == 3321 and 21 * 81 == 1701
ends = [pow(3, k, 100) for k in (4, 8, 12, 16, 20)]
assert ends == [81, 61, 41, 21, 1], ends
# Tens digit drops by 2 each time: (10a + 1) * 81 ends in 10(a + 8) + 1 -> a - 2 (mod 10).
assert all(((10 * a + 1) * 81) % 100 == (10 * ((a - 2) % 10) + 1) for a in range(10))

# Solution 2: 81 = 80 + 1, and 80 x 80 = 6400 ends in 00, so 81^k ends like 1 + 80k.
assert 80 * 80 == 6400 and 6400 % 100 == 0
assert all(pow(81, k, 100) == (1 + 80 * k) % 100 for k in range(1, 30))
assert [80 * k for k in range(1, 6)] == [80, 160, 240, 320, 400]
k = next(k for k in range(1, 100) if (80 * k) % 100 == 0)
assert k == 5 and 4 * k == 20
# Steps shown: 81 -> 161 -> 241 -> 321 -> 401 (1 + 80k), last two digits 81, 61, 41, 21, 01.
assert [(1 + 80 * k) for k in range(1, 6)] == [81, 161, 241, 321, 401]

# Traps.
assert 3 ** 4 == 81 and 81 % 100 != 1                 # 4: ends in 1, but not 01
assert 3 ** 10 == 59049 and 10 % 4 != 0               # 10: ends in 49 (last digit 9)
assert pow(3, 40, 100) == 1 and pow(3, 100, 100) == 1 # 40, 100: work, but not smallest
assert 40 == 2 * 20 and 100 == 5 * 20
assert [k for k in range(1, 101) if pow(3, k, 100) == 1] == [20, 40, 60, 80, 100]

# Variant: smallest n with 9^n ending in 01 -> 10.
# Note: 10 is wrong choice B of the original; the variant scenes must not show the original choices.
m = next(k for k in range(1, 1000) if pow(9, k, 100) == 1)
assert m == 10
assert [pow(9, k, 10) for k in range(1, 7)] == [9, 1, 9, 1, 9, 1]   # last digit 9, 1: n even
assert 9 ** 2 == 81
assert [pow(9, k, 100) for k in (2, 4, 6, 8, 10)] == [81, 61, 41, 21, 1]
assert 9 ** 10 == 3 ** 20 and 2 * m == 20
print("variant:", m)
print("ok")
