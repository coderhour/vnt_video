"""Verify: unit square rolling clockwise around a fixed side-2 square (bank c2-075), plus variant.

Simulates the roll exactly: each move turns the small square clockwise about the corner where it
touches the big square, by the smallest angle (multiple of 90 deg) that puts one of its sides flat
against the big square again. Path length of a corner = sum(angle * distance to pivot).
"""
from math import pi, sqrt, isclose, hypot

def rot_cw(p, c, k):            # rotate p about c clockwise by k*90 degrees (exact, integer coords)
    x, y = p[0] - c[0], p[1] - c[1]
    for _ in range(k):
        x, y = y, -x
    return (x + c[0], y + c[1])

def flat_against(sq, N):        # does a whole side of the unit square lie on the big square's boundary?
    xs = sorted({p[0] for p in sq}); ys = sorted({p[1] for p in sq})
    x0, y0 = xs[0], ys[0]
    if y0 == N and 0 <= x0 <= N - 1: return True          # on top
    if y0 + 1 == 0 and 0 <= x0 <= N - 1: return True      # below
    if x0 == N and 0 <= y0 <= N - 1: return True          # right
    if x0 + 1 == 0 and 0 <= y0 <= N - 1: return True      # left
    return False

def roll(N, tracked_start):
    """Small square starts at [0,1]x[N,N+1] (left sides lined up). Returns list of (pivot, k, dist)."""
    sq = [(0, N), (1, N), (1, N + 1), (0, N + 1)]          # corners: BL, BR, TR, TL
    start = list(sq)
    P = tracked_start
    moves = []
    while True:
        # pivot: the "leading" corner touching the big square, going clockwise (right on top, etc.)
        touching = [p for p in sq if 0 <= p[0] <= N and 0 <= p[1] <= N]
        # leading corner = the one that rotating clockwise about keeps us outside: pick by direction
        cands = []
        for c in touching:
            for k in (1, 2, 3):
                new = [rot_cw(p, c, k) for p in sq]
                cx = sum(p[0] for p in new) / 4; cy = sum(p[1] for p in new) / 4
                if 0 < cx < N and 0 < cy < N: break      # would swing into the big square
                if flat_against(new, N):
                    # check intermediate positions stay outside (sample angles)
                    ok = True
                    for t in range(1, 90 * k):
                        import math
                        a = math.radians(t)
                        for p in sq:
                            dx, dy = p[0] - c[0], p[1] - c[1]
                            qx = c[0] + dx * math.cos(a) + dy * math.sin(a)
                            qy = c[1] - dx * math.sin(a) + dy * math.cos(a)
                            if 1e-9 < qx < N - 1e-9 and 1e-9 < qy < N - 1e-9: ok = False
                    if ok: cands.append((c, k, new))
                    break
        assert len(cands) == 1, cands
        c, k, new = cands[0]
        d = hypot(P[0] - c[0], P[1] - c[1])
        moves.append((c, k, d))
        P = rot_cw(P, c, k)
        sq = new
        if sorted(sq) == sorted(start) and P == tracked_start:
            return moves
        assert len(moves) < 100

def length(moves):
    return sum(k * pi / 2 * d for _, k, d in moves)

# ---- the question: N = 2, corner that starts at the big square's top-left corner (0,2)
moves = roll(2, (0, 2))
print("moves (pivot, quarter-turns, radius):")
for m in moves: print("  ", m)
L = length(moves)
ans = (2 + 2 * sqrt(2)) * pi
print("path length =", L, "=? (2+2*sqrt2)pi =", ans)
assert isclose(L, ans)
assert [k for _, k, _ in moves] == [1, 2] * 4
assert [round(d, 6) for *_, d in moves] == [1, round(sqrt(2), 6), 1, 0] * 2

choices = {"A": (2 + sqrt(2)) * pi, "B": 4 * pi, "C": (2 + 2 * sqrt(2)) * pi,
           "D": (4 + sqrt(2)) * pi, "E": (4 + 2 * sqrt(2)) * pi}
correct = [c for c, v in choices.items() if isclose(v, L)]
print("matching choice:", correct, "(bank correct_index 2 = C)")
assert correct == ["C"]

# first return really is after one lap (no earlier return): the loop stops at the first match.
assert len(moves) == 8

# glue-into-circles view (solution 2): 4 quarter arcs r=1 -> one circle r=1; 2 half arcs r=root2 -> one circle r=root2
assert isclose(4 * (pi / 2) * 1 + 2 * pi * sqrt(2), 2 * pi * 1 + 2 * pi * sqrt(2))
# half-lap symmetry: the second half is the first half turned 180 degrees about the centre (1,1)
assert moves[4:] == [((2 - c[0], 2 - c[1]), k, d) for c, k, d in moves[:4]]

# ---- trap models ("what you'd get if ...")
sides = 4 * (pi / 2) * 1
A = sides + 2 * (pi / 2) * sqrt(2)               # corner moves as quarter turns (bank note)
B = sides + 2 * pi * 1                            # used radius 1 (a side) instead of root 2 (a diagonal)
E = sides + 2 * pi * sqrt(2) + 2 * pi * 1         # gave the two flips where P IS the pivot radius 1 instead of 0
D = length(roll(2, (0, 3)))                       # traced the small square's own top-left corner instead
for name, v in [("A", A), ("B", B), ("D", D), ("E", E)]:
    print(f"trap {name}: {v / pi:.6f} pi")
    assert isclose(v, choices[name])
# D in detail: radii for the (0,3) corner
print("small square's top-left corner radii:", [round(d, 4) for *_, d in roll(2, (0, 3))])

# other corners' paths, for reference
for start in [(1, 2), (1, 3), (0, 3)]:
    print("corner starting at", start, "travels", length(roll(2, start)) / pi, "pi")

# ---- variant: same roll, but trace the CENTER of the small square
# centre is root2/2 from every pivot; total turning = 4 quarter turns + 4 half turns = 3 full turns = 6 pi
C0 = (0.5, 2.5)
Q = C0; VL = 0.0
for c, k, _ in moves:
    VL += k * pi / 2 * hypot(Q[0] - c[0], Q[1] - c[1])
    Q = rot_cw(Q, c, k)
assert Q == C0
total_turn = sum(k for _, k, _ in moves) * pi / 2
print("variant (centre): total turning =", total_turn / pi, "pi; path =", VL / pi, "pi =? 3*sqrt2 =", 3 * sqrt(2))
assert isclose(total_turn, 6 * pi) and isclose(VL, 3 * sqrt(2) * pi)
print("all checks passed")
