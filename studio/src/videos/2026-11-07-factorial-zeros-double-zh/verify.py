"""Verify c1-666: count n in 1..100 with zeros((2n)!) == 2*zeros(n!). Answer 26 (choice C, index 2).
Also every solution's key numbers, every trap value and the variant (tripling -> 7)."""
from math import factorial

choices = [20, 24, 26, 30, 50]
correct_index = 2


def zeros_bruteforce(m):
    s = str(factorial(m))
    return len(s) - len(s.rstrip("0"))


def fives(m):  # Legendre: floor(m/5) + floor(m/25) + floor(m/125) + ...
    c, p = 0, 5
    while p <= m:
        c += m // p
        p *= 5
    return c


for m in range(1, 301):
    assert zeros_bruteforce(m) == fives(m)

good = [n for n in range(1, 101) if zeros_bruteforce(2 * n) == 2 * zeros_bruteforce(n)]
print("answer:", len(good), good)
assert len(good) == 26 and choices.index(26) == correct_index

# Hook / asked numbers
assert (fives(10), fives(20)) == (2, 4)
assert (fives(8), fives(16)) == (1, 3)           # 16!: 3 > 2*1
assert zeros_bruteforce(8) == 1 and zeros_bruteforce(16) == 3
assert divmod(8, 5) == (1, 3) and divmod(16, 5) == (3, 1)    # spill
assert divmod(7, 5) == (1, 2) and divmod(14, 5) == (2, 4)    # no spill
assert zeros_bruteforce(2) == zeros_bruteforce(4) == 0 and zeros_bruteforce(6) == 1   # 1, 2 count; 3 fails
assert 2 * 12 < 25 <= 2 * 13 and 3 * 8 < 25 <= 3 * 9
v2 = lambda m: sum(m // 2 ** k for k in range(1, 10))
assert (v2(20), fives(20)) == (18, 4)
assert fives(100) < 125 and 2 * 100 >= 125                    # n! has 2 terms, (2n)! gets the 125 term

# Solution 1: floor(2x) = 2 floor(x) iff remainder < half the divisor
for d in (5, 25, 125):
    for n in range(0, 1000):
        assert ((2 * n) // d == 2 * (n // d)) == (n % d < d / 2)
        assert (2 * n) // d >= 2 * (n // d)          # never smaller
rule = [n for n in range(1, 101) if n % 5 <= 2 and n % 25 <= 12 and 2 * n < 125]
assert rule == good
assert max(n for n in range(1, 101) if 2 * n < 125) == 62
# rows of 25: 0..24 / 25..49 / 50..74 / 75..99 (+100)
rows = [[n for n in range(r * 25, r * 25 + 25) if n % 5 <= 2 and n % 25 <= 12] for r in range(4)]
assert all(len(r) == 9 for r in rows)
print("rows (rules 1+2):", rows, "100 passes rules 1+2:", 100 % 5 <= 2 and 100 % 25 <= 12)
assert [len([n for n in r if 1 <= n <= 62]) for r in rows] == [8, 9, 9, 0]
assert 8 + 9 + 9 == 26

# Solution 2: base five, every digit 0..2
def b5(n):
    return (n // 25, n // 5 % 5, n % 5)

assert b5(37) == (1, 2, 2) and b5(62) == (2, 2, 2) and b5(100) == (4, 0, 0)
assert [n for n in range(1, 101) if max(b5(n)) <= 2] == good
assert 3 ** 3 - 1 == 26

# Traps
assert len([n for n in range(1, 101) if n % 5 == 0]) == 20                       # A: multiples of five
assert len([n for n in good if n > 2]) == 24 and fives(1) == fives(2) == 0      # B: skip 1 and 2
assert len([n for n in range(1, 101) if n % 10 <= 2]) == 30                     # D: base-ten last digit 0,1,2
assert 100 // 2 == 50                                                           # E: "half the time"

# Variant: (3n)! has exactly three times as many zeros as n!, n = 1..100 -> 7
var = [n for n in range(1, 101) if zeros_bruteforce(3 * n) == 3 * zeros_bruteforce(n)]
print("variant:", len(var), var)
assert var == [1, 5, 6, 25, 26, 30, 31]
assert var == [n for n in range(1, 101) if n % 5 <= 1 and n % 25 <= 8 and 3 * n < 125]
assert max(n for n in range(1, 101) if 3 * n < 125) == 41
assert var == [n for n in range(1, 101) if max(b5(n)) <= 1] and 2 ** 3 - 1 == 7
print("all checks passed")
