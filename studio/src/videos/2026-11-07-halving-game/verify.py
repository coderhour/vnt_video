#!/usr/bin/env python3
"""Verify 2026-11-07-halving-game (amc_practice_amc10_mock_test_template:c2-100).

Game: number k on the board; a move replaces k with k-1 or floor(k/2). Whoever writes 0 wins.
Second player wins from n  <=>  n is a losing position (L) for the player to move.
"""

def v2(n):
    c = 0
    while n % 2 == 0:
        n //= 2
        c += 1
    return c

def solve(N):
    # lose[k] = True if the player to move at k loses. At 0 the game is over: the mover already lost.
    lose = [True] + [False] * N
    for k in range(1, N + 1):
        lose[k] = not any(lose[m] for m in (k - 1, k // 2))
    return lose

lose = solve(1000)

# Table 0..16 shown in the video
print("k   :", list(range(17)))
print("L/W :", ["L" if lose[k] else "W" for k in range(17)])
small_L = [k for k in range(1, 17) if lose[k]]
print("losing 1..16:", small_L)
assert small_L == [2, 6, 8, 10, 14]
assert not lose[1] and not lose[4] and not lose[12] and not lose[16]

# Rule: losing <=> number of halvings to reach odd (v2) is odd
for k in range(1, 1001):
    assert lose[k] == (v2(k) % 2 == 1), k
print("rule v2(n) odd <=> losing: ok up to 1000")

# Proof checks (the two facts used in the narration)
for k in range(1, 1001):
    if v2(k) % 2 == 1:   # losing: both moves go to a number with an even count (winning)
        assert v2(k - 1) % 2 == 0 and v2(k // 2) % 2 == 0
    else:                # winning: some move reaches 0 or a number with an odd count
        opts = [m for m in (k - 1, k // 2) if m == 0 or v2(m) % 2 == 1]
        assert opts, k
        if k % 2 == 1:
            assert k // 2 == (k - 1) // 2   # odd k: halving k = halving k-1
print("proof facts: ok")

# Answer
ans = sum(lose[k] for k in range(1, 101))
print("answer (1..100):", ans)
assert ans == 33
choices = [25, 31, 33, 34, 50]
assert choices.index(ans) == 2  # correct_index 2 -> C

# Solution 1: groups
g1 = [k for k in range(1, 101) if v2(k) == 1]
g3 = [k for k in range(1, 101) if v2(k) == 3]
g5 = [k for k in range(1, 101) if v2(k) == 5]
print("count 1:", len(g1), "(", g1[:3], "...", g1[-1], ")")
print("count 3:", len(g3), g3)
print("count 5:", len(g5), g5)
assert (len(g1), len(g3), len(g5)) == (25, 6, 2)
assert g3 == [8, 24, 40, 56, 72, 88] and g5 == [32, 96]
assert not any(v2(k) == 7 for k in range(1, 101))
# multiples: 50 even, 25 of 4, 12 of 8, 6 of 16, 3 of 32, 1 of 64
assert [100 // d for d in (2, 4, 8, 16, 32, 64)] == [50, 25, 12, 6, 3, 1]
assert 50 - 25 == 25 and 12 - 6 == 6 and 3 - 1 == 2

# Solution 2: losing numbers = doubles of winning numbers  =>  L(N) = floor(N/2) - L(floor(N/2))
for k in range(1, 501):
    assert lose[2 * k] == (not lose[k])
def Lcount(N):
    return sum(lose[k] for k in range(1, N + 1))
for N in range(1, 1001):
    assert Lcount(N) == N // 2 - Lcount(N // 2)
chain = {N: Lcount(N) for N in (3, 6, 12, 25, 50, 100)}
print("L(N) chain:", chain)
assert chain == {3: 1, 6: 2, 12: 4, 25: 8, 50: 17, 100: 33}
assert 50 - 25 + 12 - 6 + 3 - 1 == 33

# Traps
assert len(g1) == 25                      # A: only 2 more than a multiple of 4
assert ans - 2 == 31                      # B: missing 32 and 96
assert ans + 1 == 34                      # D: also counting 1 as losing
assert sum(1 for k in range(1, 101) if k % 2 == 0) == 50  # E: all even numbers
assert lose[4] is False and lose[16] is False  # evens that are wins (4 -> 2, 16 -> 8)

# Variant: 1..200
var = Lcount(200)
print("variant (1..200):", var)
assert var == 67
assert [200 // d for d in (2, 4, 8, 16, 32, 64, 128)] == [100, 50, 25, 12, 6, 3, 1]
assert 100 - 50 + 25 - 12 + 6 - 3 + 1 == 67
assert [sum(1 for k in range(1, 201) if v2(k) == e) for e in (1, 3, 5, 7)] == [50, 13, 3, 1]
assert [k for k in range(1, 201) if v2(k) == 7] == [128]
print("all checks passed")
