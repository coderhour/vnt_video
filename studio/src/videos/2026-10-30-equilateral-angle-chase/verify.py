"""Numeric check: equilateral ABC, D on BC, E on AC, AD = AE, angle BAD given -> x = angle EDC."""
from math import atan2, cos, degrees, hypot, isclose, radians, sin


def ang(p, v, q):
    """Angle p-v-q in degrees."""
    a = atan2(p[1] - v[1], p[0] - v[0]) - atan2(q[1] - v[1], q[0] - v[0])
    a = abs(degrees(a)) % 360
    return 360 - a if a > 180 else a


def build(bad, side=1.0):
    """Maths coords (y up): B=(0,0), C=(side,0), A on top. Returns points and all the angles we use."""
    B, C = (0.0, 0.0), (side, 0.0)
    A = (side / 2, side * 3 ** 0.5 / 2)
    # D on BC with angle BAD = bad: the ray from A turned 'bad' degrees from AB toward AC.
    # Law of sines in ABD: BD / sin(bad) = AB / sin(180 - 60 - bad).
    bd = side * sin(radians(bad)) / sin(radians(120 - bad))
    D = (bd, 0.0)
    ad = hypot(A[0] - D[0], A[1] - D[1])
    # E on AC with AE = AD.
    t = ad / side
    E = (A[0] + t * (C[0] - A[0]), A[1] + t * (C[1] - A[1]))
    assert 0 < bd < side and 0 < t < 1, "D must be inside BC and E inside AC"
    return dict(A=A, B=B, C=C, D=D, E=E,
                BAD=ang(B, A, D), DAE=ang(D, A, E), ADE=ang(A, D, E), AED=ang(A, E, D),
                ADC=ang(A, D, C), ADB=ang(A, D, B), DEC=ang(D, E, C), x=ang(E, D, C))


# --- Question: angle BAD = 20. Bank choices 10, 15, 20, 30, 40; correct_index 0 -> 10.
q = build(20)
for k, v in (("BAD", 20), ("DAE", 40), ("ADE", 70), ("AED", 70), ("ADC", 80),
             ("ADB", 100), ("DEC", 110), ("x", 10)):
    assert isclose(q[k], v, abs_tol=1e-9), (k, q[k])
choices = [10, 15, 20, 30, 40]
assert choices.index(round(q["x"])) == 0
print("question angles:", {k: round(v, 6) for k, v in q.items() if isinstance(v, float)})

# Solution 1: exterior angle of ABD, then subtract the isosceles base angle.
assert 60 - 20 == 40 and (180 - 40) / 2 == 70 and 60 + 20 == 80 and 80 - 70 == 10
# Solution 2: straight line at E, then triangle DEC.
assert 180 - 70 == 110 and 180 - 110 - 60 == 10
# Solution 3: the pattern. With angle BAD = a: DAE = 60 - a, base = 60 + a/2, ADC = 60 + a, x = a/2.
for a in (5, 12, 20, 33, 36, 45, 50, 55):
    r = build(a)
    assert isclose(r["ADE"], 60 + a / 2, abs_tol=1e-9) and isclose(r["ADC"], 60 + a, abs_tol=1e-9)
    assert isclose(r["x"], a / 2, abs_tol=1e-9), (a, r["x"])

# Traps (only 20 and 40 are explained by the bank; 15 and 30 are "what you'd get if...").
assert q["BAD"] == 20 or isclose(q["BAD"], 20)          # 20: gave angle BAD itself
assert isclose(q["DAE"], 40)                             # 40: gave angle DAE
assert isclose(q["ADB"] - q["ADE"], 30)                  # 30: used ADB (100) instead of ADC (80)
assert isclose(build(30)["x"], 15)                       # 15: as if AD cut the 60 in half (BAD = 30)
assert (180 - 30) / 2 == 75 and 90 - 75 == 15            #     that picture: DAE 30, base 75, ADC 90

# Variant: same figure, angle BAD = 36 -> x = 18 (not a question choice).
v = build(36)
for k, val in (("DAE", 24), ("ADE", 78), ("AED", 78), ("ADC", 96), ("DEC", 102), ("x", 18)):
    assert isclose(v[k], val, abs_tol=1e-9), (k, v[k])
assert 60 - 36 == 24 and (180 - 24) / 2 == 78 and 60 + 36 == 96 and 96 - 78 == 18
assert 180 - 78 == 102 and 180 - 102 - 60 == 18 and 36 / 2 == 18
assert 18 not in choices
print("variant angles:", {k: round(val, 6) for k, val in v.items() if isinstance(val, float)})

# Screen coords (y down) for the builder, side 230.9 like the bank SVG: B=(30,230), C=(260.9,230).
def screen(r, side=230.9, ox=30, oy=230):
    s = side
    return {k: (round(ox + r[k][0] * s, 1), round(oy - r[k][1] * s, 1)) for k in "ABCDE"}
print("question screen:", screen(q))
print("variant screen:", screen(v))
print("ok")
