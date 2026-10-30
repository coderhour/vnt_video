"""Exact check: two walkers bounce between towns A and B; where do they meet?

Question: amc_practice_amc8_mock_test_template:c2-092 (correct_index 3 = 23 km).
Run: python3 verify.py   (asserts everything the video says)
"""
from fractions import Fraction as F


def pos(start, speed, d, t):
    """Position (km from A) of a walker going back and forth on [0, d]."""
    s = (start + speed * t) % (2 * d)  # unfold: forward from A is +, so B->A walker starts at d, speed<0 handled by caller
    return s if s <= d else 2 * d - s


def meetings(d, va, vb, count=2):
    """Exact meeting times/places. Ann starts at A (0) heading to B; Bo at B heading to A.
    Bo's unfolded coordinate starts at d (i.e. going 'past B and back' = walking toward A)."""
    # Breakpoints: every time either walker reaches a town.
    ta, tb = d / va, d / vb
    events = sorted({k * ta for k in range(1, 20)} | {k * tb for k in range(1, 20)} | {F(0)})
    ann = lambda t: pos(F(0), va, d, t)
    bo = lambda t: pos(F(d), vb, d, t)  # starts at B, moving toward A
    out = []
    for t0, t1 in zip(events, events[1:]):
        g0, g1 = ann(t0) - bo(t0), ann(t1) - bo(t1)
        if g0 == 0 and t0 != 0 and (not out or out[-1][0] != t0):
            out.append((t0, ann(t0)))
        if g0 * g1 < 0:  # linear in between
            t = t0 + (t1 - t0) * g0 / (g0 - g1)
            out.append((t, ann(t)))
        if len(out) >= count:
            break
    return out[:count]


def second_meet(d, first):
    """Speeds 'first' : 'd - first' (they meet first at `first` km from A after 1 hour)."""
    return meetings(F(d), F(first), F(d - first))


# ---- the question: first meeting 12 km from A, second 10 km from A ----
first, second = 12, 10
ok = [d for d in range(first + 1, 200) if second_meet(d, first)[1][1] == second]
# d = 15 also fits on paper: speeds 12 and 3, so Ann reaches B, turns and CATCHES UP with Bo
# (10 km from A at t = 5/3) before Bo ever reaches A. The question says each walker reaches the
# other town and turns around before they meet again, so that catch-up does not count (and 15 is
# not a choice). Requiring both turns first leaves only 23.
assert ok == [15, 23], ok
t15, p15 = second_meet(15, first)[1]
assert (t15, p15) == (F(5, 3), 10) and t15 < F(15, 3)  # Bo would reach A only at t = 5
both_turned = [d for d in ok if second_meet(d, first)[1][0] >= max(F(d, first), F(d, d - first))]
assert both_turned == [23], both_turned
(t1, p1), (t2, p2) = second_meet(23, first)
assert (t1, p1) == (1, 12) and (t2, p2) == (3, 10)  # second meeting at 3x the time
# Ann: 12 per "road", 36 total = 23 + 13; 13 back from B = 10 from A
assert 3 * 12 == 36 == 23 + (23 - 10)
# Bo: 11 per road, 33 total = 23 + 10
assert 3 * 11 == 33 == 23 + 10
# Solution 2 (Bo): 3(d - 12) = d + 10  -> d = 23
assert [d for d in range(13, 200) if 3 * (d - 12) == d + 10] == [23]
# Solution 1 (Ann): 36 = 2d - 10
assert [d for d in range(13, 200) if 36 == 2 * d - 10] == [23]
# who turns first: Ann reaches B at 23/12 h, Bo reaches A at 23/11 h, both before t = 3
assert F(23, 12) < 3 and F(23, 11) < 3
# no meeting between the two (no overtaking): checked by meetings() order above

# ---- each choice, tested by the "check" method: where would the second meeting be? ----
for d, expect in [(18, 0), (21, 6), (22, 8), (23, 10), (26, 16)]:
    p = second_meet(d, first)[1][1]
    assert p == expect, (d, p)
    assert p == d - (36 - d)  # Ann walks 36: d to B, then 36 - d back
print("choices -> second meeting km from A:", {d: int(second_meet(d, first)[1][1]) for d in (18, 21, 22, 23, 26)})
# trap arithmetic
assert 36 / 2 == 18          # A: halved 36
assert 12 + 10 == 22         # C: added the spots
assert 36 - 10 == 26         # E: 36 = d + 10 (back walk taken as only 10)

# ---- variant: first meeting 7 km from A, second meeting 5 km from B ----
vf = 7
okv = [d for d in range(vf + 1, 200) if second_meet(d, vf)[1][1] == d - 5]
okv = [d for d in okv if second_meet(d, vf)[1][0] >= max(F(d, vf), F(d, d - vf))]
assert okv == [16], okv
(t1, p1), (t2, p2) = second_meet(16, vf)
assert (t1, p1) == (1, 7) and (t2, p2) == (3, 11)  # 11 from A = 5 from B
assert 3 * 7 == 21 == 16 + 5   # Ann: d to B, then 5 back
assert 3 * 9 == 27 == 16 + 11  # Bo: d to A, then d - 5 back
# a kid who treats 5 as "from A" gets 21 - ... : 21 = 2d - 5 -> d = 13
assert [d for d in range(8, 100) if 21 == 2 * d - 5] == [13]
print("all checks pass: answer 23 km (D); variant 16 km")
