"""Verify c2-070: two-piece fence of total length 12 in a right-angle corner, max enclosed area.
Walls = positive x and y axes, corner O = (0,0). Fence A=(a,0) -> P -> B=(0,b), |AP|+|PB| = 12.
Region = polygon O, A, P, B (shoelace)."""
import math, random

L = 12.0
S2 = math.sqrt(2)

def shoelace(pts):
    s = 0.0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        s += x1 * y2 - x2 * y1
    return s / 2

def area(a, p, th):
    """A=(a,0); P = A + p*(cos th, sin th); B on the y-axis with |PB| = L - p (upper solution)."""
    px, py = a + p * math.cos(th), p * math.sin(th)
    q = L - p
    if px < 0 or py < 0 or q * q < px * px:
        return None
    b = py + math.sqrt(q * q - px * px)
    return shoelace([(0, 0), (a, 0), (px, py), (0, b)])

# 1) brute force: coarse grid + random local refinement
best = (-1, None)
for i in range(1, 121):
    a = i * 0.1
    for j in range(1, 120):
        p = j * 0.1
        for k in range(0, 181):
            th = math.radians(k)
            v = area(a, p, th)
            if v is not None and v > best[0]:
                best = (v, (a, p, th))
random.seed(1)
v, (a, p, th) = best
step = 0.1
for _ in range(200000):
    na, np_, nth = a + random.gauss(0, step), p + random.gauss(0, step), th + random.gauss(0, step / 5)
    nv = area(na, np_, nth)
    if nv is not None and nv > v:
        v, a, p, th = nv, na, np_, nth
    if _ % 20000 == 19999:
        step /= 3
exact = 18 + 18 * S2
print(f"numeric max area   = {v:.6f}  at a={a:.4f}, AP={p:.4f}, PB={L-p:.4f}")
print(f"18 + 18*sqrt2      = {exact:.6f}")
assert abs(v - exact) < 1e-4

# optimum shape: AP = PB = 6, OA = OB = OP = R, bend angle 135 deg
R = math.sqrt(36 / (2 - S2))
print(f"OA (=R)            = {a:.4f}  expected R = {R:.4f};  R^2 = {R*R:.4f} = 36+18sqrt2 = {36+18*S2:.4f}")
assert abs(a - R) < 1e-2 and abs(p - 6) < 1e-2
px, py = a + p * math.cos(th), p * math.sin(th)
ang = math.degrees(math.acos(((a - px) * (0 - px) + (0 - py) * (math.sqrt((L-p)**2 - px**2))) / (p * (L - p))))
print(f"bend angle APB     = {ang:.3f} deg (expected 135)")
print(f"OP                 = {math.hypot(px, py):.4f} (= R, so P is on the circle through A and B)")

# 2) solution 1: regular octagon side 6 = square 6+6sqrt2 minus 4 corner triangles with legs 3sqrt2
big = (6 + 6 * S2) ** 2
corners = 4 * 0.5 * (3 * S2) ** 2
oct_area = big - corners
print(f"octagon: {big:.4f} - {corners:.4f} = {oct_area:.4f}  (72+72sqrt2 = {72+72*S2:.4f})")
assert abs(oct_area - (72 + 72 * S2)) < 1e-9
assert abs(oct_area / 4 - exact) < 1e-9

# 3) solution 2: two isosceles triangles OAP, OPB with legs R and apex 45 deg; height of P = R/sqrt2
tri = 0.5 * R * (R / S2)
print(f"triangle OAP = R^2/(2sqrt2) = {tri:.6f}  (9+9sqrt2 = {9+9*S2:.6f}); two of them = {2*tri:.6f}")
assert abs(tri - (9 + 9 * S2)) < 1e-9
# Pythagoras for AP^2 with P=(R/sqrt2, R/sqrt2), A=(R,0)
assert abs((R - R / S2) ** 2 + (R / S2) ** 2 - 36) < 1e-9

# special shapes from the traps
print("square bend (a=b=6, P=(6,6)):", shoelace([(0, 0), (6, 0), (6, 6), (0, 6)]))
print("straight fence, legs 6sqrt2:", 0.5 * (6 * S2) ** 2)

# 4) the choices
choices = {"A": 36, "B": 18 + 18 * S2, "C": 36 * S2, "D": 36 + 18 * S2, "E": 72 + 72 * S2}
for k, c in choices.items():
    print(f"  {k}: {c:.4f}  {'<= max' if c <= exact + 1e-9 else 'TOO BIG (impossible)'}")
match = [k for k, c in choices.items() if abs(c - v) < 1e-4]
print("matching choice:", match, "(bank correct_index 1 = B)")
assert match == ["B"]

# 5) variant: ONE straight fence of length 10 in the same corner. Answer 25.
best_v = max(0.5 * a2 * math.sqrt(100 - a2 * a2) for a2 in [i / 10000 for i in range(1, 100000)])
print(f"variant numeric max = {best_v:.6f}; mirror trick: square side 10 area 100, quarter = 25")
assert abs(best_v - 25) < 1e-6
print("ALL CHECKS PASSED")
