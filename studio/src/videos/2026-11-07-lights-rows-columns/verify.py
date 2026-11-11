"""Verify 2026-11-07-lights-rows-columns (amc_practice_amc10_counting_template:c1-452)."""
from itertools import combinations, product


def lines(R, C):
    rows = [frozenset((r, c) for c in range(C)) for r in range(R)]
    cols = [frozenset((r, c) for r in range(R)) for c in range(C)]
    return rows, cols


def patterns(R, C):
    cells = [(r, c) for r in range(R) for c in range(C)]
    for bits in product([0, 1], repeat=len(cells)):
        yield frozenset(cell for cell, b in zip(cells, bits) if b)


def full(on, ls):
    return [l for l in ls if l <= on]


def winners(R, C):
    rows, cols = lines(R, C)
    return sum(1 for on in patterns(R, C) if full(on, rows) or full(on, cols))


def ie_terms(R, C):
    rows, cols = lines(R, C)
    ls = rows + cols
    n = R * C
    terms = []
    for k in range(1, len(ls) + 1):
        terms.append(sum(2 ** (n - len(frozenset().union(*S))) for S in combinations(ls, k)))
    return terms


# ---- main question: 3x3 ----
total = 2 ** 9
assert total == 512
ans = winners(3, 3)
assert ans == 247, ans
choices = [169, 247, 265, 338, 384]
correct_index = 1
assert choices[correct_index] == ans

rows, cols = lines(3, 3)
P = list(patterns(3, 3))

# Solution 1: complement (count losers)
assert 2 ** 3 == 8 and 8 - 1 == 7
no_full_row = sum(1 for on in P if not full(on, rows))
assert no_full_row == 7 ** 3 == 343
nr = [on for on in P if not full(on, rows)]
# column 1 full, no full row: 3 choices per row
col1_full_nr = [on for on in nr if cols[0] <= on]
assert len(col1_full_nr) == 3 ** 3 == 27
only_col1 = [on for on in col1_full_nr if len(full(on, cols)) == 1]
assert len(only_col1) == 25  # 27 - 2
exactly_one_col = sum(1 for on in nr if len(full(on, cols)) == 1)
assert exactly_one_col == 75
exactly_two_col = [on for on in nr if len(full(on, cols)) == 2]
assert len(exactly_two_col) == 3
for on in exactly_two_col:  # every row is two on, one off, off in same column
    offs = {c for c in range(3) if any((r, c) not in on for r in range(3))}
    assert len(offs) == 1 and len(on) == 6
assert sum(1 for on in nr if len(full(on, cols)) == 3) == 0
col_but_no_row = sum(1 for on in nr if full(on, cols))
assert col_but_no_row == 78 == 3 * 27 - 3  # each column 27, two-column patterns counted twice
losers = no_full_row - col_but_no_row
assert losers == 265 == total - ans
assert total - losers == 247

# Solution 2: inclusion-exclusion over the 6 lines
t = ie_terms(3, 3)
assert t == [384, 192, 74, 24, 6, 1], t
assert 6 * 64 == 384
# pairs: same-direction pairs leave 3 free; crosses (row+col) cover 5 lights, leave 4 free
assert 6 * 2 ** 3 == 48 and 9 * 2 ** 4 == 144 and 48 + 144 == 192
# triples: 2 rows + col (7 lit, 2 free) x9, row + 2 cols x9, all rows, all cols
assert 9 * 4 + 9 * 4 + 1 + 1 == 74
# quads: 2 rows + 2 cols (8 lit, 1 free) x9, plus 3R+1C (3) and 1R+3C (3)
assert 9 * 2 + 6 == 24
assert 384 - 192 + 74 - 24 + 6 - 1 == 247
assert 384 - 192 + 74 == 266

# Traps
only_rows = sum(1 for on in P if full(on, rows))
assert only_rows == 169 == 512 - 343             # A: forgot columns
assert 265 == losers                             # C: the losers
assert 2 * 169 == 338                            # D: rows + cols, double count
both = sum(1 for on in P if full(on, rows) and full(on, cols))
assert 338 - both == 247
assert 6 * 64 == 384                             # E: no overlaps removed

# ---- variant: 2 rows of 3 lights ----
vtotal = 2 ** 6
vans = winners(2, 3)
assert vans == 39, vans
vrows, vcols = lines(2, 3)
VP = list(patterns(2, 3))
vnr = [on for on in VP if not full(on, vrows)]
assert len(vnr) == 7 ** 2 == 49
vc1 = [on for on in vnr if vcols[0] <= on]
assert len(vc1) == 9
assert sum(1 for on in vc1 if len(full(on, vcols)) == 1) == 7  # 9 - 2
assert sum(1 for on in vnr if len(full(on, vcols)) == 1) == 21
assert sum(1 for on in vnr if len(full(on, vcols)) == 2) == 3
assert sum(1 for on in vnr if len(full(on, vcols)) == 3) == 0
vcnr = sum(1 for on in vnr if full(on, vcols))
assert vcnr == 24 == 3 * 7 + 3 == 3 * 9 - 3
assert 49 - 24 == 25 and 64 - 25 == 39
vt = ie_terms(2, 3)
assert vt == [64, 37, 16, 5, 1], vt
assert 64 - 37 + 16 - 5 + 1 == 39

print("answer:", ans, "(choice B)")
print("sol1: 512 total; no full row 7^3 =", no_full_row, "; col1 full 27 -> only col1 25; x3 = 75; two cols 3; 78")
print("      losers", losers, "; winners", total - losers)
print("sol2: IE terms", t, "->", ans)
print("traps: A 169 rows only; C 265 losers; D 338 = 2x169 (both counted twice:", both, "); E 384 = 6x64")
print("variant 2x3:", vans, "; no full row 49, col-no-row 24, losers 25; IE", vt)
