"""Verify c3-017 (ant on a triangular prism) and the variant.

Prism: bases ABC (bottom) and DEF (top), vertical edges AD, BE, CF.
Original: start C, P(reach E before A) = 4/11 (bank correct_index 1 -> 4/11).
Variant:  start C, P(reach F before A) = 5/11.
"""
from fractions import Fraction as Fr
import random

ADJ = {
    "A": "BCD", "B": "ACE", "C": "ABF",
    "D": "EFA", "E": "DFB", "F": "DEC",
}
assert all(len(v) == 3 for v in ADJ.values())
assert all(u in ADJ[w] for u in ADJ for w in ADJ[u])  # undirected


def exact(win, lose):
    """Solve p(v) = mean of neighbours, p(win)=1, p(lose)=0, by Gaussian elimination in Fractions."""
    unk = [v for v in ADJ if v not in (win, lose)]
    n = len(unk)
    M = [[Fr(0)] * (n + 1) for _ in range(n)]
    for i, v in enumerate(unk):
        M[i][i] = Fr(3)
        for w in ADJ[v]:
            if w == win:
                M[i][n] += 1
            elif w != lose:
                M[i][unk.index(w)] -= 1
    for c in range(n):
        piv = next(r for r in range(c, n) if M[r][c] != 0)
        M[c], M[piv] = M[piv], M[c]
        M[c] = [x / M[c][c] for x in M[c]]
        for r in range(n):
            if r != c and M[r][c] != 0:
                M[r] = [a - M[r][c] * b for a, b in zip(M[r], M[c])]
    p = {v: M[i][n] for i, v in enumerate(unk)}
    p[win], p[lose] = Fr(1), Fr(0)
    return p


def path_sum(start, win, lose, steps=400):
    """Brute force: push probability mass step by step (exact distribution over walks), sum mass absorbed at win."""
    mass = {v: 0.0 for v in ADJ}
    mass[start] = 1.0
    won = 0.0
    for _ in range(steps):
        new = {v: 0.0 for v in ADJ}
        for v, m in mass.items():
            if m == 0 or v in (win, lose):
                continue
            for w in ADJ[v]:
                new[w] += m / 3
        won += new[win]
        new[win] = new[lose] = 0.0
        mass = new
    return won


def monte_carlo(start, win, lose, trials=200_000, seed=1):
    rng = random.Random(seed)
    hits = 0
    for _ in range(trials):
        v = start
        while v not in (win, lose):
            v = rng.choice(ADJ[v])
        hits += v == win
    return hits / trials


# ---------- original ----------
p = exact("E", "A")
print("original:", {k: str(v) for k, v in sorted(p.items())})
assert p["C"] == Fr(4, 11)
assert p["B"] == Fr(5, 11) and p["D"] == Fr(6, 11) and p["F"] == Fr(7, 11)
assert abs(path_sum("C", "E", "A") - 4 / 11) < 1e-12
mc = monte_carlo("C", "E", "A")
print("  monte carlo from C:", mc)
assert abs(mc - 4 / 11) < 0.005

# symmetry A<->E, B<->D, C<->F is a graph automorphism
sig = {"A": "E", "E": "A", "B": "D", "D": "B", "C": "F", "F": "C"}
assert all(set(sig[w] for w in ADJ[v]) == set(ADJ[sig[v]]) for v in ADJ)
assert p["C"] + p["F"] == 1 and p["B"] + p["D"] == 1

# Solution 1 working: 8c = 1 + 3f, 8f = 4 + 3c
c, f = p["C"], p["F"]
assert 8 * c == 1 + 3 * f and 8 * f == 4 + 3 * c
# Solution 2 working: b = (1+c)/3, 4c = b + 1, 11c = 4
b = p["B"]
assert b == (1 + c) / 3 and 4 * c == b + 1 and 11 * c == 4

# Bank choices: [1/3, 4/11, 5/11, 6/11, 7/11], correct_index 1
choices = [Fr(1, 3), Fr(4, 11), Fr(5, 11), Fr(6, 11), Fr(7, 11)]
assert choices.index(p["C"]) == 1
# Trap A: assume b = f = 1/2
assert (0 + Fr(1, 2) + Fr(1, 2)) / 3 == Fr(1, 3)
# Trap E: chance A comes first from C
assert 1 - p["C"] == Fr(7, 11)

# ---------- variant: start C, reach F before A ----------
q = exact("F", "A")
print("variant:", {k: str(v) for k, v in sorted(q.items())})
assert q["C"] == Fr(5, 11)
assert abs(path_sum("C", "F", "A") - 5 / 11) < 1e-12
mc = monte_carlo("C", "F", "A", seed=2)
print("  monte carlo from C:", mc)
assert abs(mc - 5 / 11) < 0.005
tau = {"A": "F", "F": "A", "C": "D", "D": "C", "B": "E", "E": "B"}
assert all(set(tau[w] for w in ADJ[v]) == set(ADJ[tau[v]]) for v in ADJ)
assert q["C"] + q["D"] == 1 and q["B"] + q["E"] == 1
qc, qb = q["C"], q["B"]
assert qc == (1 + qb) / 3 and 4 * qb == qc + 1 and 11 * qc == 5
print("all checks passed")
