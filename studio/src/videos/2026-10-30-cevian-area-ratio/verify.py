"""Exact check (Fractions): triangle ABC, D on BC, E on AC, AD and BE meet at P.

Question: [ABC] = 60, BD:DC = 1:1, AE:EC = 2:1  ->  [ABP] = 24 (bank correct_index 2).
Variant:  [ABC] = 84, BD:DC = 1:1, AE:EC = 3:1  ->  [ABP] = 36.
"""
from fractions import Fraction as F


def area(*pts):
    """Shoelace area of a polygon."""
    s = 0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        s += x1 * y2 - x2 * y1
    return abs(F(s)) / 2


def cross(p1, p2, p3, p4):
    """Intersection of line p1p2 with line p3p4."""
    (x1, y1), (x2, y2), (x3, y3), (x4, y4) = p1, p2, p3, p4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    t = F((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4), den)
    return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))


def split(p, q, a, b):
    """Point on pq with p-part : q-part = a : b."""
    return tuple(p[i] + F(a, a + b) * (q[i] - p[i]) for i in range(2))


def build(A, B, C, total, ae, ec):
    """Scale the shape so [ABC] = total, then return every piece."""
    k = F(total) / area(A, B, C)
    # Scale y only (area scales by k, ratios unchanged).
    A, B, C = [(x, y * k) for x, y in (A, B, C)]
    D = split(B, C, 1, 1)
    E = split(A, C, ae, ec)
    P = cross(A, D, B, E)
    F_ = split(E, C, 1, 1)  # foot of the line through D parallel to BE
    return dict(A=A, B=B, C=C, D=D, E=E, P=P, F=F_,
                ABC=area(A, B, C), ABP=area(A, B, P), BPD=area(B, P, D), CPD=area(C, P, D),
                CPE=area(C, P, E), APE=area(A, P, E), ABD=area(A, B, D), ABE=area(A, B, E),
                BEC=area(B, E, C), ADC=area(A, D, C),
                AP_PD=F(P[1] - A[1], D[1] - P[1]) if D[1] != P[1] else None)


def parallel(u, v):
    return u[0] * v[1] - u[1] * v[0] == 0


shapes = [((98, 32), (32, 208), (252, 208)),   # the bank figure (screen coords)
          ((0, 0), (10, 0), (3, 7)),
          ((1, 5), (-4, -2), (9, 1))]
choices = [15, 20, 24, 30, 40]
CORRECT_INDEX = 2

# ---- Question ----
for s in shapes:
    q = build(*s, total=60, ae=2, ec=1)
    assert q["ABC"] == 60
    assert q["ABP"] == 24, q["ABP"]
    # Solution 1: the five pieces (draw CP)
    assert (q["BPD"], q["CPD"], q["CPE"], q["APE"]) == (6, 6, 8, 16), q
    assert q["ABD"] == 30 and q["ADC"] == 30 and q["ABE"] == 40 and q["BEC"] == 20
    assert q["ABP"] + q["BPD"] + q["CPD"] + q["CPE"] + q["APE"] == 60
    # Solution 2: line through D parallel to BE meets AC at F, the midpoint of EC
    D, E, B, F_, A, P = q["D"], q["E"], q["B"], q["F"], q["A"], q["P"]
    assert parallel((F_[0] - D[0], F_[1] - D[1]), (E[0] - B[0], E[1] - B[1]))
    # AE : EF = 4 : 1, so AP : PD = 4 : 1
    AE = (E[0] - A[0], E[1] - A[1]); EF = (F_[0] - E[0], F_[1] - E[1])
    assert AE[0] == 4 * EF[0] and AE[1] == 4 * EF[1]
    AP = (P[0] - A[0], P[1] - A[1]); AD = (D[0] - A[0], D[1] - A[1])
    assert 5 * AP[0] == 4 * AD[0] and 5 * AP[1] == 4 * AD[1]
    assert F(4, 5) * 30 == 24

assert choices.index(24) == CORRECT_INDEX

# Solution 1 algebra: x + 3y = 30 (ADC), 2x + y = 20 (BEC)
x, y = 6, 8
assert x + 3 * y == 30 and 2 * x + y == 20
assert 2 * x + 6 * y == 60 and (2 * x + 6 * y) - (2 * x + y) == 5 * y == 40
assert 30 - x == 24 and 24 + 2 * y == 40

# Bank figure coordinates: P and E match the SVG
q = build(*shapes[0], total=area(*shapes[0]), ae=2, ec=1)
assert q["D"] == (142, 208) and q["P"] == (F(666, 5), F(864, 5))  # (133.2, 172.8)
assert q["E"] == (F(602, 3), F(448, 3))                           # (200.67, 149.33)

# Traps
assert F(1, 2) * 30 == 15       # P taken as the midpoint of AD
assert F(2, 3) * 30 == 20       # copied AE:EC = 2:1 onto AD (AP:PD = 2:1)
assert F(1, 2) * 60 == 30       # triangle ABD, half the whole
assert F(2, 3) * 60 == 40       # triangle ABE, two thirds of the whole

# ---- Variant ----
for s in shapes:
    v = build(*s, total=84, ae=3, ec=1)
    assert v["ABP"] == 36, v["ABP"]
    assert (v["BPD"], v["CPD"], v["CPE"], v["APE"]) == (6, 6, 9, 27), v
    assert v["ABD"] == 42 and v["BEC"] == 21 and v["ABE"] == 63
    D, E, F_, A, P = v["D"], v["E"], v["F"], v["A"], v["P"]
    AE = (E[0] - A[0], E[1] - A[1]); EF = (F_[0] - E[0], F_[1] - E[1])
    assert AE[0] == 6 * EF[0] and AE[1] == 6 * EF[1]   # AP : PD = 6 : 1
    assert F(6, 7) * 42 == 36
assert 36 not in choices
print("question: ABP = 24 (choice index 2); pieces 24, 6, 6, 8, 16")
print("variant:  ABP = 36; pieces 36, 6, 6, 9, 27")
print("ok")
