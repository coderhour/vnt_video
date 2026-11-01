"""Check: five identical rectangles, big perimeter 66 (amc8 mock c2-833), every number the video shows."""
# Figure: two flat on top (width 2L), three upright below (width 3W). Height = W + L.
def solve(top, bottom, perim):
    out = []
    for W in range(1, 200):
        for L in range(W + 1, 300):
            if top * L == bottom * W and 2 * (top * L + W + L) == perim:
                out.append((W, L, W * L))
    return out

choices = [36, 45, 54, 72, 81]
assert solve(2, 3, 66) == [(6, 9, 54)] and choices[2] == 54     # bank correct_index 2

# Solution 1: blocks. Short = 2 blocks, long = 3 blocks (two longs = three shorts = 6 blocks).
k = 3
assert 2 * 3 == 3 * 2 == 6
assert 2 + 3 == 5                                    # height: one short + one long = 5 blocks
assert 2 * (6 + 5) == 22 and 66 // 22 == k and 22 * k == 66
assert (2 * k, 3 * k) == (6, 9) and 6 * 9 == 54
assert (6 * k, 5 * k) == (18, 15) and 2 * (18 + 15) == 66      # check: big is 18 by 15
assert 18 * 15 == 270 and 270 // 5 == 54                     # check: five equal pieces

# Solution 2: walk the edge. top 2 long, bottom 3 short, each side 1 short + 1 long -> 4 long + 5 short.
assert 2 + 1 + 1 == 4 and 3 + 1 + 1 == 5
# 4 long = 2 x (2 long) = 2 x (3 short) = 6 short -> 11 short = 66
assert 4 * 9 + 5 * 6 == 66 and 6 + 5 == 11 and 66 // 11 == 6 and 6 * 3 // 2 == 9

# Traps: A squares the short side, E squares the long side
assert 6 * 6 == 36 and 9 * 9 == 81

# Variant: seven rectangles, three flat on top, four upright below, perimeter 76.
assert solve(3, 4, 76) == [(6, 8, 48)]
# blocks: 3 long = 4 short -> short 3 blocks, long 4 blocks; big = 12 by 7 blocks; edge 38 blocks
assert 3 * 4 == 4 * 3 == 12 and 3 + 4 == 7 and 2 * (12 + 7) == 38 and 76 // 38 == 2
assert (3 * 2, 4 * 2) == (6, 8) and 6 * 8 == 48
assert (24, 14) == (12 * 2, 7 * 2) and 2 * (24 + 14) == 76 and 24 * 14 // 7 == 48
# Trap test used on screen: 3 short must equal 2 long.
assert 5 * 9 == 45 and 3 * 5 == 15 and 2 * 9 == 18          # B
assert 8 * 9 == 72 and 3 * 8 == 24                           # D
assert 3 * 6 == 18 == 2 * 9                                  # C
print("ok traps")
