"""Numeric check: a ring of radius 2 rolling without slipping around the inside of a hoop of radius 10.

The ring is simulated as a rigid body: at each small step of the centre around the hoop, the spin step is
solved numerically (bisection) so that the material point touching the hoop does not slide. Nothing below
assumes the (R - r) / r formula; the formula is only compared at the end. Run: python3 verify.py
"""
from math import atan2, cos, hypot, isclose, pi, sin, tau


def roll(R, r, inside=True, steps=20_000):
    """Roll a ring (radius r) once around a hoop (radius R). Returns (total spin in turns, spoke history, dot history).

    The ring starts at the bottom of the hoop. A dot sits on the ring's rim, at the contact point, and a spoke
    joins the ring's centre to the dot. Positive angles are counterclockwise (maths style, y up)."""
    d = R - r if inside else R + r  # distance from hoop centre to ring centre (the ring stays touching)
    phi0 = -pi / 2  # ring centre direction: straight down
    centre = lambda ph: (d * cos(ph), d * sin(ph))
    # Body angle a of a rim point: its world angle (around the ring centre) is theta + a.
    theta = phi0 if inside else phi0 + pi  # spoke points at the contact point at the start
    spin, spokes, dots = 0.0, [theta], []
    dphi = tau / steps
    for i in range(steps):
        ph = phi0 + i * dphi
        cx, cy = centre(ph)
        contact = ph if inside else ph + pi  # world angle of the contact point, seen from the ring centre
        a = contact - theta  # body angle of the material point now touching the hoop

        def slip(dth):  # tangential velocity of that material point over the step (should be 0)
            nx, ny = centre(ph + dphi)
            px0, py0 = cx + r * cos(theta + a), cy + r * sin(theta + a)
            px1, py1 = nx + r * cos(theta + dth + a), ny + r * sin(theta + dth + a)
            tx, ty = -sin(ph + dphi / 2), cos(ph + dphi / 2)  # direction along the hoop
            return (px1 - px0) * tx + (py1 - py0) * ty

        lo, hi = -1.0, 1.0  # bisection on the spin step
        assert slip(lo) * slip(hi) < 0
        for _ in range(80):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if slip(lo) * slip(mid) > 0 else (lo, mid)
        dth = (lo + hi) / 2
        theta += dth
        spin += dth
        spokes.append(theta)
        nx, ny = centre(ph + dphi)
        dots.append((nx + r * cos(theta), ny + r * sin(theta)))
    return spin / tau, spokes, dots


def times_spoke_back(spokes):
    """Count full turns as the kid would: how many times the spoke comes back to its starting direction."""
    u = [(s - spokes[0]) / tau for s in spokes]  # turns so far (signed)
    lo, hi = min(u) - 1e-4, max(u) + 1e-4
    return sum(1 for k in range(-20, 21) if k != 0 and lo <= k <= hi)


def dot_touches(dots, R, tol=1e-3):
    """How many times the dot touches the hoop (counted once per visit, the last step being the start again)."""
    on = [abs(hypot(x, y) - R) < tol for x, y in dots]
    return sum(1 for i in range(len(on)) if on[i] and not on[i - 1])


# ---- The question: r = 2 inside R = 10. Bank answer index 1 = 4.
turns, spokes, dots = roll(10, 2, inside=True)
print(f"inside, r=2, R=10: ring spins {turns:+.6f} turns (negative = clockwise)")
assert isclose(abs(turns), 4, abs_tol=1e-5)
assert turns < 0  # centre goes counterclockwise, ring spins clockwise
assert times_spoke_back(spokes) == 4
assert dot_touches(dots, 10) == 5  # the dot touches the hoop 5 times, yet the ring turns only 4 times
choices = [3, 4, 5, 6, 8]
assert choices[1] == round(abs(turns))

# Solution 1: follow the centre. Centre path radius 10 - 2 = 8, length 16 pi; one turn moves the centre 4 pi.
assert isclose(2 * pi * 8 / (2 * pi * 2), 4)
# The rule behind it: rolling on a straight floor, one full turn moves the centre one circumference.
# For a curved track the same holds with the centre path (centre speed = r * spin rate): check that numerically.
d_centre = 2 * pi * 8
assert isclose(d_centre / (2 * pi * 2), abs(turns), abs_tol=1e-5)

# Solution 2: the hoop's rim is 20 pi = 5 ring rims, but going once around the loop turns the ring
# once the other way: 5 - 1 = 4. Check the "-1": a ring that slides around (no rolling, the same point
# always touching) turns exactly once, counterclockwise.
# Its spoke always points from its centre to the contact point; unwrap that direction over one loop.
slide_dirs = [atan2(sin(-pi / 2 + k * tau / 3600), cos(-pi / 2 + k * tau / 3600)) for k in range(3601)]
unwrapped = sum(((b - a + pi) % tau) - pi for a, b in zip(slide_dirs, slide_dirs[1:]))
slide_turns = unwrapped / tau
assert isclose(slide_turns, 1)  # once, counterclockwise: the same way the centre travels
assert isclose(20 * pi / (4 * pi) - slide_turns, abs(turns), abs_tol=1e-5)

# ---- Traps
assert 2 * pi * 10 / (2 * pi * 2) == 5          # C: used the hoop's rim (forgot the ring's own turn back)
assert isclose(2 * pi * 8 / (2 * pi * 1) / 1, 8) and isclose(16 * pi / (2 * pi), 8)  # E: ring rim as 2 pi
assert isclose(2 * pi * (10 - 4) / (4 * pi), 3)  # A: took the diameter off: centre radius 6
out, _, _ = roll(10, 2, inside=False)
print(f"outside, r=2, R=10: {out:+.6f} turns")
assert isclose(out, 6, abs_tol=1e-5)            # D: 6 is the answer for rolling round the OUTSIDE
print("traps: A 3 (radius 6 path), C 5 (hoop rim), D 6 (outside), E 8 (2 pi rim)")

# ---- Variant: a coin of radius 3 rolls around the OUTSIDE of a plate of radius 12.
# Centre path radius 15, length 30 pi; one turn = 6 pi; 30 pi / 6 pi = 5. Check: 12 / 3 = 4, plus 1 = 5.
v, vs, vd = roll(12, 3, inside=False)
print(f"variant outside, r=3, R=12: {v:+.6f} turns")
assert isclose(v, 5, abs_tol=1e-5) and v > 0  # spins the same way as it travels
assert isclose(2 * pi * 15 / (2 * pi * 3), 5) and 12 / 3 + 1 == 5
assert times_spoke_back(vs) == 5
assert dot_touches(vd, 12) == 4  # the dot touches the plate 4 times but the coin turns 5 times

# ---- The animation formula used in Composition.tsx: spin = -(R - r) / r * (phi - phi0) inside,
# +(R + r) / r * (phi - phi0) outside. Compare with the simulation at many points.
for k in range(0, 20_001, 997):
    ph = k / 20_000 * tau
    assert isclose(spokes[k] - spokes[0], -(10 - 2) / 2 * ph, abs_tol=1e-5)
    assert isclose(vs[k] - vs[0], (12 + 3) / 3 * ph, abs_tol=1e-5)
print("ok")
