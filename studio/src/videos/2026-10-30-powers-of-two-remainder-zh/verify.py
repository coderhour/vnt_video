"""Brute-force check: remainder of 1 + 2 + 2^2 + ... + 2^99 when divided by 7, and every number the video shows."""

S = sum(2**k for k in range(100))  # exact big integer, 100 terms (exponents 0..99)
CHOICES = [0, 1, 2, 4, 6]
CORRECT_INDEX = 1
assert S % 7 == 1 and CHOICES[CORRECT_INDEX] == 1
print("answer: remainder", S % 7, "= choice", "ABCDE"[CHOICES.index(S % 7)])

# The list has 100 terms, not 99.
assert len(range(0, 100)) == 100

# Solution 1: remainders of powers of two cycle 1, 2, 4 (length 3), and each next remainder is
# "double the last one, then take away sevens": 4 x 2 = 8 -> 1.
rems = [pow(2, k, 7) for k in range(100)]
assert rems[:6] == [1, 2, 4, 1, 2, 4]
assert all(rems[k] == [1, 2, 4][k % 3] for k in range(100))
assert all(rems[k + 1] == (2 * rems[k]) % 7 for k in range(99))
assert 8 == 7 + 1 and 16 == 14 + 2 and 32 == 28 + 4  # 2^3, 2^4, 2^5 on screen
assert 1 + 2 + 4 == 7
# 100 terms = 33 full groups of three (exponents 0..98) + 1 leftover (2^99).
assert 33 * 3 == 99 and 99 + 1 == 100
assert sum(2**k for k in range(99)) % 7 == 0      # first 99 terms: a multiple of 7
assert pow(2, 99, 7) == 1 and 99 % 3 == 0          # 2^99 starts a new group: remainder 1
# Each group is 8 times the one before (2^3 (1 + 2 + 4) = 8 + 16 + 32 = 56 = 8 x 7).
assert 8 + 16 + 32 == 56 == 8 * 7
# Running totals only ever leave 1, 3 or 0 (used for traps D and E).
run = [sum(2**j for j in range(k + 1)) % 7 for k in range(100)]
assert run[:6] == [1, 3, 0, 1, 3, 0] and set(run) == {0, 1, 3}

# Solution 2: the doubling trick. 1 + (1 + 2 + ... + 2^99) = 2^100, so S = 2^100 - 1.
assert S + 1 == 2**100
assert all(sum(2**j for j in range(k + 1)) + 1 == 2 ** (k + 1) for k in range(100))  # 1+1=2, 2+2=4, 4+4=8, ...
# 2^99 = 8^33, and 8 leaves 1, so 8^33 leaves 1. 2^100 = 2 x 2^99 leaves 2. S leaves 2 - 1 = 1.
assert 2**99 == 8**33 and pow(8, 33, 7) == 1 and pow(2, 100, 7) == 2 and (2 - 1) == S % 7
# "Multiply by 8 = multiply by 1 when we only care about sevens": (8n) % 7 == n % 7.
assert all((8 * n) % 7 == n % 7 for n in range(1000))

# Traps.
assert sum(2**k for k in range(99)) % 7 == 0       # A: 0 = stopped one term early (99 terms)
assert pow(2, 100, 7) == 2                         # C: 2 = remainder of 2^100, forgot the "minus 1"
assert 4 not in set(run) and 6 not in set(run)     # D, E: no running total ever leaves 4 or 6
assert 2 not in set(run)
print("remainders of 2^k:", rems[:9], "... running totals:", run[:9])

# Variant: 1 + 2 + 2^2 + ... + 2^50 divided by 5.
V = sum(2**k for k in range(51))
vr = [pow(2, k, 5) for k in range(51)]
assert vr[:8] == [1, 2, 4, 3, 1, 2, 4, 3] and all(vr[k] == [1, 2, 4, 3][k % 4] for k in range(51))
assert 1 + 2 + 4 + 3 == 10 and 8 == 5 + 3 and 16 == 15 + 1
assert 51 == 12 * 4 + 3                            # 51 terms = 12 groups of 4 (48 terms) + 3 leftover
assert sum(2**k for k in range(48)) % 5 == 0
assert [pow(2, k, 5) for k in (48, 49, 50)] == [1, 2, 4] and (1 + 2 + 4) == 7 and 7 % 5 == 2
assert V % 5 == 2
# Doubling-trick check for the variant: V = 2^51 - 1; 2^48 = 16^12 leaves 1, 2^51 = 8 x 2^48 leaves 3; 3 - 1 = 2.
assert V == 2**51 - 1 and pow(16, 12, 5) == 1 and pow(2, 51, 5) == 3 and (3 - 1) == V % 5
print("variant: 1 + 2 + ... + 2^50 leaves", V % 5, "when divided by 5")
# Intro: the total is 31 digits long (shown, not spoken as a number).
assert len(str(S)) == 31 and str(S) == "1267650600228229401496703205375"
# Question scene example: 20 = 2 x 7 + 6.
assert 20 % 7 == 6 and 20 == 2 * 7 + 6
print("total:", S, len(str(S)), "digits")
# Asked scene: going down, each power halves (4, 2, 1), so 1 = 2^0; 1 + 99 = 100 terms.
assert 2**2 // 2 == 2**1 and 2**1 // 2 == 2**0 == 1 and 1 + 99 == 100
# Cycle scene: each remainder is double the last, minus a 7 when too big (1, 2, 4, 8 -> 1).
assert [1, 2, 4, 8 - 7] == [pow(2, k, 7) for k in range(4)]
# Variant: 48 is a multiple of 4, so 2^48 starts a new cycle (leaves 1).
assert 48 % 4 == 0 and pow(2, 48, 5) == 1
print("ok")
