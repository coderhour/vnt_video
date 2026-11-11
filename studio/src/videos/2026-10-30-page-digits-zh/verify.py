#!/usr/bin/env python3
"""Verification for amc_practice_amc8_counting_template:c1-164 (page digits).
Question: pages numbered from 1; total digits printed = exactly twice the number of pages. How many pages?
Choices: 99, 100, 108, 117, 189; bank correct_index = 2 (108)."""


N = 200_000
D = [0] * (N + 1)  # brute force: D[n] = total digits printed on pages 1..n
for p in range(1, N + 1):
    D[p] = D[p - 1] + len(str(p))
digits = D.__getitem__


CHOICES = [99, 100, 108, 117, 189]

# --- main question: brute force over a big range ---
sols = [n for n in range(1, N + 1) if D[n] == 2 * n]
sols3 = [n for n in range(1, N + 1) if D[n] == 3 * n]
print("solutions to digits = 2n:", sols)
assert sols == [108]
assert CHOICES[2] == 108

# --- Solution 1 numbers: group counts and the gap table ---
assert digits(9) == 9 and digits(99) - digits(9) == 180 and digits(99) == 189
assert 2 * 99 == 198 and 198 - 189 == 9           # 9 short at page 99
for n in range(10, 100):
    assert digits(n) == 2 * n - 9                   # 10..99: always 9 short of twice
for n in range(1, 10):
    assert digits(n) == n and n < 2 * n             # 1..9: one digit each, short
for k in range(0, 10):                              # k three-digit pages
    n = 99 + k
    assert digits(n) == 189 + 3 * k and 2 * n == 198 + 2 * k
    assert 2 * n - digits(n) == 9 - k               # the gap shrinks by one per page
print("gap table:", [(99 + k, digits(99 + k), 2 * (99 + k)) for k in range(0, 10)])
assert 189 + 3 * 9 == 198 + 2 * 9 == 216 and digits(108) == 216
for n in range(100, 1000):
    assert digits(n) == 3 * n - 108                  # the bank's formula
for n in range(109, N + 1):
    assert digits(n) > 2 * n                         # after 108 always too many

# --- Solution 2: balance (each page "should" give 2 digits) ---
bal = lambda n: sum(len(str(p)) - 2 for p in range(1, n + 1))
assert bal(9) == -9 and bal(99) == -9 and bal(108) == 0
assert list(range(100, 109)) == [100 + i for i in range(9)] and len(range(100, 109)) == 9

# --- traps ---
for n in CHOICES:
    print(f"  {n} pages: {digits(n)} digits, twice pages = {2*n}")
assert (digits(99), 2 * 99) == (189, 198)
assert (digits(100), 2 * 100) == (192, 200)
assert (digits(117), 2 * 117) == (243, 234) and digits(117) - 234 == 9   # 9 too many
assert 117 == 99 + 9 + 9                                                    # adds the 9 twice
assert (digits(189), 2 * 189) == (459, 378)
assert digits(99) == 189                                                    # E: digits, not pages

# --- variant: digits = 3 x pages ---
print("solutions to digits = 3n:", sols3)
assert sols3 == [1107]
bal3 = lambda n: sum(len(str(p)) - 3 for p in range(1, n + 1))
assert bal3(9) == -18 and bal3(99) - bal3(9) == -90 and bal3(999) == -108
assert 1000 + 108 - 1 == 1107 and bal3(1107) == 0
assert digits(999) == 2889 and digits(1107) == 2889 + 4 * 108 == 3321 == 3 * 1107
print("all checks pass")
