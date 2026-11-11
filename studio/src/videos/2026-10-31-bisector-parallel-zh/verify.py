"""Check: bisector meets the parallel through A (amc8 geometry c1-086), every number the video shows."""
from math import acos, dist, isclose, sqrt


def solve(B, C, A):
    """F = where the bisector of angle ABC meets the line through A parallel to BC (BC on the x-axis)."""
    ux, uy = (A[0] - B[0]) / dist(A, B), (A[1] - B[1]) / dist(A, B)
    vx, vy = (C[0] - B[0]) / dist(C, B), (C[1] - B[1]) / dist(C, B)
    dx, dy = ux + vx, uy + vy                      # bisector direction
    t = (A[1] - B[1]) / dy                         # reach height of A
    return (B[0] + t * dx, B[1] + t * dy)


# Question: AB = AC = 10, BC = 12. B(0,0), C(12,0), A(6,8) (half of 12 is 6, and 6-8-10).
B, C, A = (0, 0), (12, 0), (6, 8)
assert dist(A, B) == 10 and dist(A, C) == 10 and dist(B, C) == 12
F = solve(B, C, A)
assert isclose(F[0], 16) and isclose(F[1], 8)
AF = dist(A, F)
assert isclose(AF, 10)
choices = [5, 6, 8, 10, 12]
assert choices[3] == 10                            # bank correct_index 3

# Solution 1: angle ABF = angle FBC (bisector) = angle AFB (alternate angles), so ABF is isosceles.
def ang(P, Q, R):
    a, b = (P[0] - Q[0], P[1] - Q[1]), (R[0] - Q[0], R[1] - Q[1])
    return acos((a[0] * b[0] + a[1] * b[1]) / (dist(P, Q) * dist(R, Q)))


assert isclose(ang(A, B, F), ang(F, B, C)) and isclose(ang(A, F, B), ang(F, B, C))

# Solution 2: rhombus ABGF. G on BC with BG = 10; AF parallel and equal to BG; all four sides 10.
G = (10, 0)
assert isclose(dist(A, B), 10) and isclose(dist(B, G), 10) and isclose(dist(G, F), 10) and isclose(dist(F, A), 10)
assert isclose(ang(A, B, F), ang(F, B, G))         # diagonal BF splits the corner at B in half

# Traps: 6 = half of 12, 12 = BC, 8 = height of the triangle, 5 = half of AB.
assert 12 / 2 == 6 and sqrt(10**2 - 6**2) == 8 and A[1] == 8 and 10 / 2 == 5

# Variant: AB = 7, AC = 9, BC = 10 (not isosceles). Same pattern: AF = AB = 7.
Bv, Cv = (0, 0), (10, 0)
x = (7**2 - 9**2 + 10**2) / 20                     # A = (x, h) with AB = 7, AC = 9
Av = (x, sqrt(49 - x * x))
assert isclose(dist(Av, Bv), 7) and isclose(dist(Av, Cv), 9)
Fv = solve(Bv, Cv, Av)
assert isclose(dist(Av, Fv), 7) and Fv[0] > Av[0]  # F lies on the C side of A
print("ok")
