"""Verify: floor(1/sqrt(1) + ... + 1/sqrt(100)) = 18 (bank choice index 2), plus the squeeze and the variant."""
from decimal import Decimal, getcontext
from fractions import Fraction
import math

getcontext().prec = 50
D = Decimal


def S(n):
    return sum(1 / D(k).sqrt() for k in range(1, n + 1))


choices = [10, 17, 18, 19, 20]
correct_index = 2

s = S(100)
print("sum to 100 =", s)  # ~18.5896
ans = int(s)
assert ans == 18 and choices.index(ans) == correct_index

# Per-term squeeze: 2(sqrt(k+1)-sqrt(k)) < 1/sqrt(k) < 2(sqrt(k)-sqrt(k-1))
for k in range(1, 10001):
    r = 1 / D(k).sqrt()
    lo = 2 * (D(k + 1).sqrt() - D(k).sqrt())
    hi = 2 * (D(k).sqrt() - D(k - 1).sqrt())
    assert lo < r < hi, k
    # difference of squares identity: (sqrt(k+1)-sqrt(k))(sqrt(k+1)+sqrt(k)) = 1
    assert abs((D(k + 1).sqrt() - D(k).sqrt()) * (D(k + 1).sqrt() + D(k).sqrt()) - 1) < D(10) ** -40

# Telescoped bounds for n = 100
lower = 2 * (D(101).sqrt() - 1)
upper = 1 + 2 * (D(100).sqrt() - 1)
print("lower 2(sqrt101 - 1) =", lower, " upper 1 + 2(10 - 1) =", upper)
assert 18 < lower < s < upper == 19
# telescoping sums equal the bounds
assert abs(sum(2 * (D(k + 1).sqrt() - D(k).sqrt()) for k in range(1, 101)) - lower) < D(10) ** -40
assert abs(1 + sum(2 * (D(k).sqrt() - D(k - 1).sqrt()) for k in range(2, 101)) - upper) < D(10) ** -40

# Trap checks
assert all(1 / D(k).sqrt() >= D(1) / 10 for k in range(1, 101))  # each term >= 1/10, so sum >= 10 (weak)
assert 2 * D(100).sqrt() == 20                                     # 2*sqrt(100), no constant -> 20
assert upper == 19 and s < 19                                      # upper bound alone -> 19 (sum is below it)
assert s > 18 > 17                                                 # 17 too small

# Small-case sanity check shown on screen (n = 4): 2(sqrt5 - 1) < S(4) < 3
s4 = S(4)
print("n=4:", 2 * (D(5).sqrt() - 1), "<", s4, "< 3")
assert 2 * (D(5).sqrt() - 1) < s4 < 3

# Variant: floor(1/sqrt1 + ... + 1/sqrt10000) = 198
sv = S(10000)
print("sum to 10000 =", sv)
lo_v = 2 * (D(10001).sqrt() - 1)
hi_v = 1 + 2 * (D(10000).sqrt() - 1)
print("variant bounds:", lo_v, hi_v)
assert 198 < lo_v < sv < hi_v == 199
assert int(sv) == 198
# variant traps: upper bound alone -> 199, 2*sqrt(10000) -> 200
assert 2 * D(10000).sqrt() == 200

print("all checks pass: answer 18, variant 198")
