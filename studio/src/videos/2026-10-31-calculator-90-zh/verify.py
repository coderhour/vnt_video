"""Check: fewest presses of +1 / x2 from 3 to 90 (amc8 arithmetic c1-963), every number the video shows."""
from collections import deque
from itertools import product


def bfs(start, target):
    seen = {start: 0}
    q = deque([start])
    while q:
        n = q.popleft()
        for m in (n + 1, 2 * n):
            if m <= target and m not in seen:
                seen[m] = seen[n] + 1
                q.append(m)
    return seen[target]


def backward(start, target):
    chain = [target]
    while chain[-1] != start:
        n = chain[-1]
        chain.append(n // 2 if n % 2 == 0 and n // 2 >= start else n - 1)
    return chain


def reachable_in(start, target, k):
    """Can exactly k presses make target?"""
    for keys in product("+d", repeat=k):
        n = start
        for c in keys:
            n = n + 1 if c == "+" else 2 * n
        if n == target:
            return True
    return False


# Question: 3 -> 90. Choices 6..10, bank correct_index 2 -> 8.
choices = [6, 7, 8, 9, 10]
assert bfs(3, 90) == 8 == choices[2]
assert backward(3, 90) == [90, 45, 44, 22, 11, 10, 5, 4, 3]
assert len(backward(3, 90)) == 9                  # 9 numbers, 8 presses between them
# Forward chain: 3, 4, 5, 10, 11, 22, 44, 45, 90  = +1 +1 x2 +1 x2 x2 +1 x2 (4 adds, 4 doubles)

# Solution 2: plan the doubles. 5 doubles: 3 x 32 = 96 > 90, too big. 4 doubles: 3 x 16 = 48, need 42 more.
assert 3 * 32 == 96 > 90 and 3 * 16 == 48 and 90 - 48 == 42
# An add pressed before k doubles is worth 2^k: before all 4 -> 16, before 3 -> 8, 2 -> 4, 1 -> 2, after -> 1.
# Fewest adds that make 42 from {16, 8, 4, 2, 1}: 16 + 16 + 8 + 2 (4 adds). No 3 of them make 42.
best = min(len(c) for r in range(1, 8) for c in product([16, 8, 4, 2, 1], repeat=r) if sum(c) == 42)
assert best == 4 and 16 + 16 + 8 + 2 == 42
assert not any(sum(c) == 42 for c in product([16, 8, 4, 2, 1], repeat=3))
# 3 doubles: 3 x 8 = 24, need 66 from {8,4,2,1}: at least 9 adds -> 12 presses. Fewer doubles is worse.
assert min(len(c) for r in range(1, 12) for c in product([8, 4, 2, 1], repeat=r) if sum(c) == 66) == 9
# Matches the chain: two adds before all doubles (16+16), one before 3 doubles (8), one before 1 double (2).

# Traps: 6 and 7 impossible, 9 = numbers in the chain, 10 works but isn't fewest.
assert not reachable_in(3, 90, 6) and not reachable_in(3, 90, 7)
assert reachable_in(3, 90, 10)

# Variant: 3 -> 100. Backward: 100, 50, 25, 24, 12, 6, 3 -> 6 presses.
assert backward(3, 100) == [100, 50, 25, 24, 12, 6, 3] and bfs(3, 100) == 6
assert 3 * 32 == 96 and 100 - 96 == 4         # 5 doubles fit now; the 4 left = one add before the last 2 doubles
assert not reachable_in(3, 100, 5)
print("ok")

# The recap rule (halve when even unless it drops below the start, else take one away) is always fewest:
assert all(len(backward(s, t)) - 1 == bfs(s, t) for s in range(1, 21) for t in range(s, 600))
print("rule ok")
