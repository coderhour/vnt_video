"""Check: rectangle ABCD 12 by 8, M midpoint of CD, AC meets BM at P. Area of APMD, plus every number in the video.

Coordinates: A = (0, 0), B = (12, 0), C = (12, 8), D = (0, 8)  (maths style, y up, AB along the bottom).
Exact arithmetic with Fractions, plus a brute-force grid count of the shaded area as an independent check.
"""
from fractions import Fraction as F


def meet(p1, p2, p3, p4):
    """Intersection of line p1p2 with line p3p4 (exact)."""
    (x1, y1), (x2, y2), (x3, y3), (x4, y4) = p1, p2, p3, p4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    a, b = x1 * y2 - y1 * x2, x3 * y4 - y3 * x4
    return (F(a * (x3 - x4) - (x1 - x2) * b, den), F(a * (y3 - y4) - (y1 - y2) * b, den))


def shoelace(pts):
    return abs(sum(F(x1) * y2 - F(x2) * y1 for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]))) / 2


def inside(pt, poly):
    """Point in convex-or-not polygon by ray casting."""
    x, y = pt
    c = False
    for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
            c = not c
    return c


def grid_area(poly, w, h, n=600):
    """Brute force: count cell centres of an n-per-unit grid inside the polygon."""
    step = 1 / n
    cnt = sum(inside(((i + 0.5) * step, (j + 0.5) * step), poly) for i in range(w * n) for j in range(h * n))
    return cnt * step * step


def solve(w, h, cm):
    """Rectangle w by h, M on CD with CM = cm. Returns P and the area of APMD, checked three ways."""
    A, B, C, D = (0, 0), (w, 0), (w, h), (0, h)
    M = (w - cm, h)
    P = meet(A, C, B, M)
    area = shoelace([A, P, M, D])
    # Way 1: similar triangles PCM ~ PAB (CM parallel to AB), ratio cm : w; subtract PCM from ACD.
    below = F(h * cm, cm + w)                 # P's distance below CD
    assert P[1] == h - below
    pcm = F(cm) * below / 2
    acd = F(w * h, 2)
    assert acd - pcm == area
    # Way 2: split along AM. ADM + (AP/AC) * AMC.
    ap_ac = F(w, w + cm)
    adm, amc = F(w - cm) * h / 2, F(cm) * h / 2
    assert adm + ap_ac * amc == area
    assert P[0] == ap_ac * w and P[1] == ap_ac * h  # P really is that fraction along AC
    return A, B, C, D, M, P, area, below, pcm, acd, adm, amc, ap_ac


# ---------- the question ----------
A, B, C, D, M, P, area, below, pcm, acd, adm, amc, ap_ac = solve(12, 8, 6)
print("P =", P, " area APMD =", area)
assert M == (6, 8) and P == (8, F(16, 3)) and area == 40
choices = [40, 44, 48, 52, 56]
assert choices.index(area) == 0  # bank correct_index = 0
g = grid_area([A, P, M, D], 12, 8, n=80)
print(f"brute-force grid area = {g:.4f}")
assert abs(g - 40) < 0.05

# Numbers shown / spoken
assert below == F(8, 3) and 8 - below == F(16, 3)      # 8 split 1 : 2 -> 8/3 and 16/3
assert F(6, 12) == F(1, 2)                              # CM : AB = 1 : 2
assert pcm == 8 and acd == 48 and acd - pcm == 40       # solution 1
assert F(6) * F(8, 3) == 16 and 16 / 2 == 8
assert adm == 24 and amc == 24 and ap_ac == F(2, 3)     # solution 2
assert ap_ac * amc == 16 and adm + 16 == 40
# AP : PC = 2 : 1 because PAB is twice PCM
assert (P[0] - 0) / (12 - P[0]) == 2
# rest of the rectangle (for the 56 trap and the full picture)
abp = shoelace([A, B, P]); pbc = shoelace([P, B, C])
assert abp == 32 and pbc == 16 and pcm == 8 and abp + pbc + pcm + area == 96
print("pieces: ABP", abp, "PBC", pbc, "PCM", pcm, "APMD", area)

# ---------- traps ----------
assert acd == 48                    # C 48: stopped at the big triangle, kept PCM
assert 96 - area == 56              # E 56: the unshaded part of the rectangle
assert acd - pcm / 2 == 44          # B 44: took off only 4 (halved the small triangle twice)
assert 52 > acd and 56 > acd        # D 52 (and E): bigger than triangle ACD, which contains APMD
assert inside((1, 7), [A, C, D]) and all(inside(q, [A, C, D]) or q in (A, C, D) for q in [(1, 7)])
# APMD lies inside triangle ACD: P is on AC and M is on CD
assert P[1] * 12 == 8 * P[0] and M[1] == 8 and 0 <= M[0] <= 12
# P halfway down (a common guess) would give 36, not a choice -> no trap relies on it
assert acd - F(6) * 4 / 2 == 36

# ---------- variant: 15 by 8, CM = 5 ----------
A, B, C, D, M, P, area, below, pcm, acd, adm, amc, ap_ac = solve(15, 8, 5)
print("variant: M =", M, " P =", P, " area =", area)
assert M == (10, 8) and P == (F(45, 4), 6) and area == 55
assert F(5, 15) == F(1, 3) and below == 2 and 8 - below == 6     # 8 split 1 : 3 -> 2 and 6
assert pcm == 5 and acd == 60 and acd - pcm == 55
assert adm == 40 and amc == 20 and ap_ac == F(3, 4) and ap_ac * amc == 15 and adm + 15 == 55
g = grid_area([A, P, M, D], 15, 8, n=80)
print(f"variant brute-force grid area = {g:.4f}")
assert abs(g - 55) < 0.05
print("ok")
