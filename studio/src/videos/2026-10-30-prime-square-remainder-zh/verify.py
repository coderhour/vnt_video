"""Brute-force check: remainder of p^2 + 17 mod 12 for primes p > 3, plus every number the video shows."""


def is_prime(n):
    return n > 1 and all(n % d for d in range(2, int(n ** 0.5) + 1))


PRIMES = [p for p in range(5, 100000) if is_prime(p)]
CHOICES = [0, 1, 5, 6, 11]

# Answer: always 6, bank correct_index 3 -> choice D.
assert {(p * p + 17) % 12 for p in PRIMES} == {6}
assert CHOICES.index(6) == 3 and "ABCDE"[3] == "D"
# Primes 2 and 3 break the pattern (why "greater than 3" matters).
assert (2 * 2 + 17) % 12 == 9 and (3 * 3 + 17) % 12 == 2

# Solution 1: test 5, 7, 11, 13  ->  p^2, p^2 + 17, twelves, remainder.
table = {5: (25, 42, 3), 7: (49, 66, 5), 11: (121, 138, 11), 13: (169, 186, 15)}
for p, (sq, tot, q) in table.items():
    assert p * p == sq and sq + 17 == tot and tot == 12 * q + 6
    assert sq % 12 == 1
assert 3 * 12 == 36 and 5 * 12 == 60 and 11 * 12 == 132 and 15 * 12 == 180
assert 26 == 2 * 12 + 2  # "what is a remainder" example

# Solution 2: six columns (1..36). Primes > 3 only in columns 1 and 5 (n % 6 in {1, 5}).
assert {p % 6 for p in PRIMES} == {1, 5}
grid = [[r * 6 + c for c in range(1, 7)] for r in range(6)]
shown = [n for row in grid for n in row if is_prime(n) and n > 3]
assert shown == [5, 7, 11, 13, 17, 19, 23, 29, 31]
assert all((n - 1) % 6 for n in shown if n % 6 == 5) and all(n % 6 in (1, 5) for n in shown)
assert 25 % 6 == 1 and not is_prime(25) and 35 % 6 == 5 and not is_prime(35)  # not all there are prime
assert 2 % 6 == 2 and 3 % 6 == 3  # 2 and 3 sit in crossed-out columns
# Column 1 = one after a multiple of 6; column 5 = one before.
assert all(((n - 1) % 6 == 0) or ((n + 1) % 6 == 0) for n in PRIMES)

# Dot picture for p = 7: 49 dots, remove a corner -> 48; bottom row's other 6 dots become a column -> 6 x 8.
assert 7 * 7 == 49 and 49 - 1 == 48 and 7 - 1 == 6 and 6 * 7 + 6 == 6 * 8 == 48
for p in PRIMES[:2000]:
    a, b = p - 1, p + 1
    assert p * p - 1 == a * b
    assert (a % 6 == 0 and b % 2 == 0) or (b % 6 == 0 and a % 2 == 0)
    assert (a * b) % 12 == 0
assert (5 - 1) * (5 + 1) == 24 == 2 * 12
# Finish: 17 = 12 + 5, 1 + 5 = 6.
assert 17 == 12 + 5 and 1 + 5 == 6

# Traps.
assert (5 * 5) % 12 == 1                 # 1: p^2 alone, forgot the 17
assert 17 % 12 == 5                      # 5: 17 alone, forgot p^2
assert (7 + 17) % 12 == 0 and 7 + 17 == 24 == 2 * 12   # 0: forgot to square, with p = 7
assert (5 + 17) % 12 == 10 and (11 + 17) % 12 == 4  # the "forgot to square" trap only gives 0 for p = 7
assert max(range(12)) == 11 and 11 not in {(p * p + 17) % 12 for p in PRIMES}  # 11: biggest remainder, never happens

# Variant: remainder of 5p^2 + 9 mod 12 -> 5 + 9 = 14 = 12 + 2 -> 2.
assert {(5 * p * p + 9) % 12 for p in PRIMES} == {2}
assert 5 * 1 == 5 and 5 + 9 == 14 == 12 + 2
assert 5 * 25 == 125 and 125 + 9 == 134 == 11 * 12 + 2
print("primes checked:", len(PRIMES), "| answer 6 | variant 2 | ok")
