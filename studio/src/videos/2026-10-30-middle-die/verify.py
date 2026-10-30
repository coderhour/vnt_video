"""Brute-force check: three fair dice, sorted; probability that the middle number is m.
Checks the answer, both solutions' case counts, every trap value and the variant (middle = 3)."""
from fractions import Fraction
from itertools import product

ROLLS = list(product(range(1, 7), repeat=3))  # red, blue, green die: 216 equally likely rolls
assert len(ROLLS) == 216


def middle(t):
    return sorted(t)[1]


def count(pred):
    return sum(1 for t in ROLLS if pred(t))


def p(n):
    return Fraction(n, 216)


# ---- The question: middle = 2. Bank: choices 1/9, 1/6, 5/27, 11/54, 2/9; correct_index 2 -> 5/27.
CHOICES = [Fraction(1, 9), Fraction(1, 6), Fraction(5, 27), Fraction(11, 54), Fraction(2, 9)]
n = count(lambda t: middle(t) == 2)
assert n == 40 and p(n) == Fraction(5, 27) == CHOICES[2]
assert 40 // 8 == 5 and 216 // 8 == 27
print("middle = 2:", n, "of 216 =", p(n))

# Solution 1: split by how many 2s.
one_two = count(lambda t: t.count(2) == 1 and middle(t) == 2)
two_twos = count(lambda t: t.count(2) == 2)
three_twos = count(lambda t: t.count(2) == 3)
assert all(middle(t) == 2 for t in ROLLS if t.count(2) >= 2)  # two or three 2s: middle is always 2
# one 2: the others must be a 1 (below) and a 3-6 (above): 4 choices, 6 orders of 3 different numbers
assert one_two == 6 * 4 == 24
assert all(sorted(t)[0] == 1 and sorted(t)[2] >= 3 for t in ROLLS if t.count(2) == 1 and middle(t) == 2)
assert len({t for t in ROLLS if sorted(t) == [1, 2, 5]}) == 6  # the six orders shown on screen
assert two_twos == 3 * 5 == 15 and three_twos == 1
assert one_two + two_twos + three_twos == 40
print("solution 1: 24 + 15 + 1 =", one_two + two_twos + three_twos)

# Solution 2: "middle is at most 2" minus "middle is 1".
small = lambda x: x <= 2
at_most_2 = count(lambda t: middle(t) <= 2)
assert at_most_2 == count(lambda t: sum(map(small, t)) >= 2)  # middle <= 2  <=>  at least two small dice
exactly_two_small = count(lambda t: sum(map(small, t)) == 2)
three_small = count(lambda t: sum(map(small, t)) == 3)
assert exactly_two_small == 3 * (2 * 2) * 4 == 48 and three_small == 2 ** 3 == 8 and at_most_2 == 56
is_1 = count(lambda t: middle(t) == 1)
assert is_1 == count(lambda t: t.count(1) >= 2)  # middle is 1  <=>  at least two 1s
assert count(lambda t: t.count(1) == 2) == 3 * 5 == 15 and count(lambda t: t.count(1) == 3) == 1 and is_1 == 16
assert at_most_2 - is_1 == 40
print("solution 2: 56 - 16 =", at_most_2 - is_1)

# Traps.
assert p(one_two) == CHOICES[0]                    # A 1/9: only the one-2 case (24)
assert Fraction(1, 6) == CHOICES[1] == p(count(lambda t: t[0] == 2))  # B 1/6: one fixed die shows 2
# D 11/54 = 44: subtract only rolls like (1,1,5): two 1s and a big die (3*4 = 12), forgetting 1,1,2 and 1,1,1
one_one_big = count(lambda t: t.count(1) == 2 and max(t) >= 3)
assert one_one_big == 3 * 4 == 12 and p(at_most_2 - one_one_big) == CHOICES[3]
assert count(lambda t: sorted(t) == [1, 1, 2]) == 3 and count(lambda t: sorted(t) == [1, 1, 1]) == 1
# E 2/9 = 48: "exactly two small dice"; that includes rolls like (1,1,5) whose middle is 1
assert p(exactly_two_small) == CHOICES[4] and middle((1, 1, 5)) == 1
# ...it wrongly includes the 12 "1, 1, big" rolls and misses 1,2,2 (3 orders) and 2,2,2: 48 - 12 + 4 = 40
two_small_set = {t for t in ROLLS if sum(map(small, t)) == 2}
one_one_big_set = {t for t in ROLLS if t.count(1) == 2 and max(t) >= 3}
missed = {t for t in ROLLS if sorted(t) in ([1, 2, 2], [2, 2, 2])}
assert len(one_one_big_set) == 12 and len(missed) == 4
assert (two_small_set - one_one_big_set) | missed == {t for t in ROLLS if middle(t) == 2}
assert 48 - 12 + 4 == 40 and p(44) == Fraction(11, 54)
print("traps: A", p(one_two), "B 1/6, D", p(at_most_2 - one_one_big), "E", p(exactly_two_small))

# ---- Variant: middle = 3.  One 3: below 1-2 (2 choices), above 4-6 (3 choices), 6 orders.
v = count(lambda t: middle(t) == 3)
v1 = count(lambda t: t.count(3) == 1 and middle(t) == 3)
assert v1 == 6 * 2 * 3 == 36
assert count(lambda t: t.count(3) == 2) == 3 * 5 == 15 and count(lambda t: t.count(3) == 3) == 1
assert v == 36 + 15 + 1 == 52 and p(v) == Fraction(13, 54) and 52 // 4 == 13 and 216 // 4 == 54
# solution 2 check for the variant: at least two dice <= 3, minus at least two dice <= 2
assert count(lambda t: sum(x <= 3 for x in t) >= 2) == 108 and 108 - 56 == 52
print("variant middle = 3:", v, "of 216 =", p(v))

# Sanity: the middle-number distribution sums to 216 and is symmetric.
dist = [count(lambda t, m=m: middle(t) == m) for m in range(1, 7)]
assert sum(dist) == 216 and dist == dist[::-1]
print("distribution of the middle number:", dist)
print("ok")
