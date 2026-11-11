"""Verify 2026-11-07-frog-hexagon-cover (amc_practice_amc10_counting_template:c2-015).

Frog on a regular n-gon, fair +-1 jumps. Expected jumps until all n vertices visited.
Exact Markov chain over states (visited set, position), solved with Fractions.
"""
from fractions import Fraction as F
from itertools import combinations


def solve_linear(eqs, unknowns):
    """Gauss-Jordan on exact fractions. eqs: list of (coef dict, rhs)."""
    idx = {u: i for i, u in enumerate(unknowns)}
    n = len(unknowns)
    A = [[F(0)] * (n + 1) for _ in range(n)]
    for r, (coef, rhs) in enumerate(eqs):
        for u, c in coef.items():
            A[r][idx[u]] += c
        A[r][n] = F(rhs)
    for c in range(n):
        p = next(r for r in range(c, n) if A[r][c] != 0)
        A[c], A[p] = A[p], A[c]
        piv = A[c][c]
        A[c] = [x / piv for x in A[c]]
        for r in range(n):
            if r != c and A[r][c] != 0:
                f = A[r][c]
                A[r] = [a - f * b for a, b in zip(A[r], A[c])]
    return {u: A[idx[u]][n] for u in unknowns}


def cover_time(n):
    full = frozenset(range(n))
    states = []
    for size in range(1, n):
        for vs in combinations(range(n), size):
            for p in vs:
                states.append((frozenset(vs), p))
    eqs = []
    for (vs, p) in states:
        coef = {(vs, p): F(1)}
        for q in ((p + 1) % n, (p - 1) % n):
            nv = vs | {q}
            if nv != full:
                coef[(nv, q)] = coef.get((nv, q), F(0)) - F(1, 2)
        eqs.append((coef, 1))
    sol = solve_linear(eqs, states)
    return sol[(frozenset([0]), 0)]


def path_waits(m):
    """Exits at 0 and m; expected exit time from each spot 0..m."""
    inner = list(range(1, m))
    eqs = []
    for i in inner:
        coef = {i: F(1)}
        for j in (i - 1, i + 1):
            if 0 < j < m:
                coef[j] = coef.get(j, F(0)) - F(1, 2)
        eqs.append((coef, 1))
    sol = solve_linear(eqs, inner) if inner else {}
    return [F(0)] + [sol[i] for i in inner] + [F(0)]


# --- main answer ---
hex_ans = cover_time(6)
print("hexagon cover time =", hex_ans)
assert hex_ans == 15
choices = [10, 12, 15, 18, 21]
assert choices.index(hex_ans) == 2  # correct_index 2 -> C

# --- stage times: block of k green corners, frog at an end -> path with exits at 0 and k+1, start at 1 ---
stages = []
for k in range(1, 6):
    w = path_waits(k + 1)
    stages.append(w[1])
    assert w[1] == k, (k, w)
    # product of distances for every spot
    assert all(w[i] == i * (k + 1 - i) for i in range(k + 2))
print("stage waits k=1..5:", [int(s) for s in stages], "sum", sum(stages))
assert sum(stages) == 15

# --- Solution 1 equations (W = wait at an end, M/N = inner spots) ---
# stage 2: W = 1 + W/2 -> W = 2
W = F(2); assert W == 1 + W / 2
# stage 3: M = 1 + W, W = 1 + M/2 -> W = 3, M = 4
W, M = F(3), F(4); assert M == 1 + W and W == 1 + M / 2
# stage 4: N = 1 + W/2 + N/2 (mirror), W = 1 + N/2 -> N = 2 + W, W = 4, N = 6
W, N = F(4), F(6); assert N == 1 + W / 2 + N / 2 and N == 2 + W and W == 1 + N / 2
# stage 5: W=1+N/2, N=1+W/2+M/2, M=1+N (middle, both neighbours are N) -> W=5, N=8, M=9
W, N, M = F(5), F(8), F(9)
assert W == 1 + N / 2 and N == 1 + W / 2 + M / 2 and M == 1 + N and N == 3 + W

# --- Solution 2: the hill for stage five ---
hill = path_waits(6)
assert hill == [0, 5, 8, 9, 8, 5, 0]
climbs = [hill[i + 1] - hill[i] for i in range(6)]
assert climbs == [5, 3, 1, -1, -3, -5]
assert all(climbs[i] - climbs[i + 1] == 2 for i in range(5))
assert hill[2] == 1 + (hill[1] + hill[3]) / 2  # 8 = 1 + (5+9)/2
assert [hill[i] for i in (1, 2, 3)] == [1 * 5, 2 * 4, 3 * 3]
print("stage-5 hill:", [int(h) for h in hill], "climbs:", [int(c) for c in climbs])

# --- traps ---
assert sum(range(1, 5)) == 10   # A: stopped after stage four
assert 6 * 2 == 12              # B: two jumps per corner (coin-flip guess)
assert 18 > 15                  # D: too many
assert sum(range(1, 7)) == 21   # E: an extra stage six

# --- variant: octagon ---
oct_ans = cover_time(8)
print("octagon cover time =", oct_ans)
assert oct_ans == 28 == sum(range(1, 8))
for k in range(1, 8):
    assert path_waits(k + 1)[1] == k

# small sanity: square (n=4) = 6, pentagon = 10
assert cover_time(4) == 6 and cover_time(5) == 10
print("all checks passed")
