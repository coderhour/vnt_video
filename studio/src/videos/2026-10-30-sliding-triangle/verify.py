"""Numeric check: a right triangle slid along its base, and every number the video shows.

Figure (bank SVG, 22 px per unit, screen y down): original (30,228) (294,228) (30,30),
copy (118,228) (382,228) (118,30). So the 12-leg is the horizontal base, the right angle is
bottom-left, the 9-leg is the left side, the copy slides 4 right along the base, and the
shaded part is copy minus overlap. Below we use maths coordinates (y up), right angle at (0,0).
"""
from fractions import Fraction as F


def area(poly):
    s = 0
    for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]):
        s += x1 * y2 - x2 * y1
    return abs(s) / 2


def clip(subject, clipper):
    """Sutherland-Hodgman: subject polygon clipped by a convex CCW clipper."""
    def inside(p, a, b):
        return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= 0

    def meet(p, q, a, b):
        x1, y1, x2, y2 = *p, *q
        x3, y3, x4, y4 = *a, *b
        den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
        t = F((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
        return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))

    out = subject
    for a, b in zip(clipper, clipper[1:] + clipper[:1]):
        inp, out = out, []
        for i, p in enumerate(inp):
            q = inp[i - 1]
            if inside(p, a, b):
                if not inside(q, a, b):
                    out.append(meet(q, p, a, b))
                out.append(p)
            elif inside(q, a, b):
                out.append(meet(q, p, a, b))
    return out


def tri(base, height, dx=0):
    return [(F(dx), F(0)), (F(dx + base), F(0)), (F(dx), F(height))]  # CCW


def slide(base, height, d):
    T, C = tri(base, height), tri(base, height, d)
    overlap = clip(C, T)
    return dict(whole=area(C), overlap=area(overlap), shaded=area(C) - area(overlap),
                left_strip=area(T) - area(overlap), overlap_poly=overlap)


def sample(base, height, d, n=600):
    """Grid sampling of the shaded part (in copy, not in original)."""
    hit = 0
    for i in range(n):
        for j in range(n):
            x = (i + 0.5) / n * (base + d)
            y = (j + 0.5) / n * height
            in_c = x >= d and y <= height * (1 - (x - d) / base)
            in_t = y <= height * (1 - x / base)
            hit += in_c and not in_t
    return hit / n / n * (base + d) * height


# Question: base 12, height 9, slide 4. Bank correct_index 4 = 30.
q = slide(12, 9, 4)
choices = [18, 24, 27, 28, 30]
assert q["whole"] == 54 and q["overlap"] == 24 and q["shaded"] == 30, q
assert choices.index(q["shaded"]) == 4
assert abs(sample(12, 9, 4) - 30) < 0.1
# Overlap is the triangle (4,0) (12,0) (4,6): base 8, height 6.
assert sorted(q["overlap_poly"]) == [(4, 0), (4, 6), (12, 0)], q["overlap_poly"]

# Check against the bank SVG pixels: 22 px per unit, overlap top corner at (118, 96).
assert (294 - 30) / 12 == 22 and (228 - 30) / 9 == 22 and (118 - 30) / 22 == 4
assert (228 - 96) / 22 == 6

# Solution 1: similar copy. 12 - 4 = 8, scale 8/12 = 2/3, height 9 * 2/3 = 6, area 1/2*8*6 = 24.
assert F(8, 12) == F(2, 3) and 9 * F(2, 3) == 6 and F(1, 2) * 8 * 6 == 24
assert F(1, 2) * 12 * 9 == 54 and 54 - 24 == 30
# Also via area scale (2/3)^2 = 4/9: 54 * 4/9 = 24.
assert 54 * F(2, 3) ** 2 == 24
# Solution 2: the left strip of the original is a trapezoid, sides 9 and 6, width 4.
# Both triangles lose the same overlap, so copy-only = original-only.
assert q["left_strip"] == q["shaded"] == F(9 + 6, 2) * 4 == 30
# The hypotenuse drops 3 for every 4 across (9 over 12).
assert F(9, 12) == F(3, 4) and 9 - 3 == 6

# Traps.
assert q["overlap"] == 24                      # reported the overlap
assert q["whole"] / 2 == 27                    # halved the whole triangle
assert F(1, 2) * 4 * 9 == 18                   # treated the strip as a triangle, base 4 height 9
assert F(9 + 5, 2) * 4 == 28                   # height drop 4 instead of 3: sides 9 and 5

# Variant: base 10, height 5, slide 4 -> overlap base 6, height 3, area 9; whole 25; shaded 16.
v = slide(10, 5, 4)
assert v["whole"] == 25 and v["overlap"] == 9 and v["shaded"] == 16, v
assert abs(sample(10, 5, 4) - 16) < 0.1
assert 5 * F(6, 10) == 3 and F(5 + 3, 2) * 4 == 16 and v["left_strip"] == 16
print("question:", {k: (str(x) if not isinstance(x, list) else x) for k, x in q.items()})
print("variant:", {k: (str(x) if not isinstance(x, list) else x) for k, x in v.items()})
print("ok")
