#!/usr/bin/env python3
"""Verify amc_practice_amc10_geometry_template:c2-019 (AP:PD for incircle cevians in 13-14-15),
both solutions, every trap value and the 3-4-5 variant, with exact rational coordinates."""
from fractions import Fraction as Fr
from math import gcd, lcm


def foot(P, A, B):
    """Foot of perpendicular from P to line AB (exact)."""
    dx, dy = B[0] - A[0], B[1] - A[1]
    t = ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / Fr(dx * dx + dy * dy)
    return (A[0] + t * dx, A[1] + t * dy)


def intersect(A, D, B, E):
    """Return t with P = A + t (D - A) on AD ∩ BE."""
    # A + t(D-A) = B + s(E-B)
    a1, b1, c1 = D[0] - A[0], -(E[0] - B[0]), B[0] - A[0]
    a2, b2, c2 = D[1] - A[1], -(E[1] - B[1]), B[1] - A[1]
    det = a1 * b2 - a2 * b1
    return (c1 * b2 - c2 * b1) / det


def dist2(P, Q):
    return (P[0] - Q[0]) ** 2 + (P[1] - Q[1]) ** 2


def solve(A, B, C, a, b, c):
    """a = BC, b = CA, c = AB. Exact coordinates, incircle by incenter formula."""
    s = a + b + c
    I = ((a * A[0] + b * B[0] + c * C[0]) / Fr(s), (a * A[1] + b * B[1] + c * C[1]) / Fr(s))
    D = foot(I, B, C)
    E = foot(I, C, A)
    F = foot(I, A, B)
    # touch points really are on the circle of radius r (all feet equidistant)
    assert dist2(I, D) == dist2(I, E) == dist2(I, F)
    t = intersect(A, D, B, E)
    P = (A[0] + t * (D[0] - A[0]), A[1] + t * (D[1] - A[1]))
    return I, D, E, F, P, t / (1 - t)


def check(name, A, B, C, a, b, c, expect):
    for P, Q, L in ((B, C, a), (C, A, b), (A, B, c)):
        assert dist2(P, Q) == L * L, (name, P, Q, L)
    I, D, E, F, P, ratio = solve(A, B, C, a, b, c)
    s = Fr(a + b + c, 2)
    x, y, z = s - a, s - b, s - c          # tangent lengths from A, B, C
    BD, DC, CE, EA = y, z, z, x
    assert dist2(B, D) == BD ** 2 and dist2(D, C) == DC ** 2
    assert dist2(C, E) == CE ** 2 and dist2(E, A) == EA ** 2
    print(f"--- {name}: sides AB={c} BC={a} CA={b}, s={s}")
    print(f"tangents x(A)={x} y(B)={y} z(C)={z};  BD={BD} DC={DC} CE={CE} EA={EA}")
    print(f"incenter I={I}, D={D}, E={E}, F={F}, P={P}")
    print(f"AP:PD (coordinates) = {ratio}")
    assert ratio == expect

    # Solution 1: mass points (weight x distance equal on each seesaw)
    k = lcm(int(BD), int(DC), int(EA))   # all three products equal k (BD, DC=CE, EA)
    mB, mC, mA = k // int(BD), k // int(DC), k // int(EA)
    assert mB * BD == mC * DC and mC * CE == mA * EA
    mD, mE = mB + mC, mA + mC
    print(f"mass points: product={k}, A={mA} B={mB} C={mC}, D={mD} E={mE} -> AP:PD = {mD}:{mA}")
    assert Fr(mD, mA) == ratio
    # BP:PE also matches the masses (balance on BE)
    u = intersect(B, E, A, D)
    assert u / (1 - u) == Fr(mE, mB)
    print(f"  check BP:PE = {u/(1-u)} = {mE}:{mB}")

    # Solution 2: line through D parallel to BE meets CA at G; CG:GE = CD:DB
    GE = CE * Fr(BD, BD + DC)
    CG = CE - GE
    G = (E[0] + (C[0] - E[0]) * GE / CE, E[1] + (C[1] - E[1]) * GE / CE)
    # DG really is parallel to BE
    assert (G[0] - D[0]) * (E[1] - B[1]) == (G[1] - D[1]) * (E[0] - B[0])
    print(f"parallel line: GE = {GE}, CG = {CG}, AE/EG = {EA}/{GE} = {EA / GE}")
    assert EA / GE == ratio

    # Traps
    tA, tB, tC = x, y, z                    # tangent lengths used as masses
    trap_masses = Fr(tB + tC, tA)
    print(f"trap: tangent lengths as masses -> D={tB+tC}, A={tA} -> {trap_masses}"
          f"  (BC balances? {tB}*{BD} vs {tC}*{DC})")
    return dict(ratio=ratio, trap_masses=trap_masses, GE_half=CE / 2, EA=EA,
                BC_DC=Fr(a, DC), CA_AE=Fr(b, EA), I=I, P=P)


# Main question: B=(0,0), C=(14,0), A=(5,12)   (5-12-13 and 9-12-15)
r = check("main", (Fr(5), Fr(12)), (Fr(0), Fr(0)), (Fr(14), Fr(0)), 14, 15, 13, Fr(49, 24))
choices = [Fr(24, 49), Fr(7, 4), Fr(2, 1), Fr(49, 24), Fr(15, 7)]
correct_index = 3
assert choices.index(r["ratio"]) == correct_index
assert Fr(1) / r["ratio"] == choices[0]                 # A: flipped
assert r["EA"] / r["GE_half"] == choices[1]             # B: G at midpoint of CE -> 7:4
assert r["trap_masses"] == choices[2]                   # C: tangent lengths as masses
assert r["CA_AE"] == choices[4]                         # E: CA:AE = 15:7
print("traps: A flipped 24:49, B 7/4 (GE=4), C 2:1 (14:7), E 15:7 (CA:AE)  OK")
print(f"note: P={tuple(float(v) for v in r['P'])} is close to I={tuple(float(v) for v in r['I'])}"
      " but not equal:", r["P"] != r["I"])

# SVG figure check: 16 px per unit, origin B at (20,222), y flipped
px = lambda p: (20 + 16 * float(p[0]), 222 - 16 * float(p[1]))
print("svg P ≈", px(r["P"]), " svg I =", px(r["I"]))

# Variant: AB=3, BC=4, CA=5 (right angle at B). B=(0,0), C=(4,0), A=(0,3)
v = check("variant 3-4-5", (Fr(0), Fr(3)), (Fr(0), Fr(0)), (Fr(4), Fr(0)), 4, 5, 3, Fr(8, 3))
print("variant answer AP:PD = 8:3  OK")
print("ANSWER: D  49:24")
