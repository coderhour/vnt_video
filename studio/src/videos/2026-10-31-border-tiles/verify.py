"""Check: 40 blue edge tiles, 80 white inside (amc8 mixed c1-861), every number the video shows."""
def floors(edge, white):
    return [(L, W) for W in range(1, 300) for L in range(W, 300)
            if L * W == edge + white and (L - 2) * (W - 2) == white]


assert floors(40, 80) == [(12, 10)]
choices = [1, 2, 3, 4, 6]
assert choices[1] == 12 - 10                         # bank correct_index 1
assert 40 + 80 == 120

# Solution 1: list factor pairs of 120, edge tiles = everything minus the inside rectangle
pairs = [(120 // w, w) for w in range(1, 11) if 120 % w == 0]
assert pairs == [(120, 1), (60, 2), (40, 3), (30, 4), (24, 5), (20, 6), (15, 8), (12, 10)]
edge = {p: (2 * p[0] + 2 * p[1] - 4 if p[1] > 1 else 120) for p in pairs}
assert edge[(20, 6)] == 48 and edge[(15, 8)] == 42 and edge[(12, 10)] == 40 and edge[(24, 5)] == 54
assert [p for p in pairs if edge[p] == 40] == [(12, 10)]
assert 10 * 8 == 80                                  # inside is 10 by 8

# Solution 2: walk the edge. top L + bottom L + two sides of W - 2 each
L, W = 12, 10
assert L + L + (W - 2) + (W - 2) == 40 == 2 * (L + W) - 4
assert (40 + 4) // 2 == 22 and 12 + 10 == 22 and 12 * 10 == 120
assert [(a, 22 - a) for a in range(11, 22) if a * (22 - a) == 120] == [(12, 10)]
assert 11 * 11 == 121                                 # a hint: 22 split evenly is 11 x 11 = 121, just 1 over

# Traps: if the floor is d longer and L + W = 22
for d in choices:
    if (22 - d) % 2:
        assert d in (1, 3)                            # half tiles: 10.5 and 9.5 widths
        assert (22 - d) / 2 in (10.5, 9.5)
    else:
        w = (22 - d) // 2
        assert (d, w, w + d, w * (w + d)) in [(2, 10, 12, 120), (4, 9, 13, 117), (6, 8, 14, 112)]

# Variant: 36 blue edge tiles, 60 white
assert floors(36, 60) == [(12, 8)]
assert 36 + 60 == 96 and (36 + 4) // 2 == 20 and 12 + 8 == 20 and 12 * 8 == 96 and 12 - 8 == 4
assert 10 * 6 == 60

# Edge counts on the list screen: two long rows of L, plus two short columns of W - 2
for (l, w), e in {(60, 2): 120, (40, 3): 82, (30, 4): 64, (24, 5): 54, (20, 6): 48, (15, 8): 42, (12, 10): 40}.items():
    assert 2 * l + 2 * (w - 2) == e == l * w - max(l - 2, 0) * max(w - 2, 0)
print("ok")
