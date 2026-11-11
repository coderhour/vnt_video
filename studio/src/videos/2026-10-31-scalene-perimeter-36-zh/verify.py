"""Check: whole-number triangles with perimeter 36 and three different sides (amc8 geometry c1-578)."""
def tris(p):
    return [(a, b, p - a - b) for a in range(1, p) for b in range(a, p) if p - a - b >= b and a + b > p - a - b]


T = tris(36)
scal = [t for t in T if len(set(t)) == 3]
assert len(T) == 27 and len(scal) == 19
choices = [17, 19, 20, 27, 35]
assert choices[1] == 19                                  # bank correct_index 1

# Longest side c: c < 18 (the other two must beat it: 36 - c > c) and c >= 12 (largest is at least a third)
assert max(t[2] for t in T) == 17 and min(t[2] for t in T) == 12

# Solution 1: list scalene a < b < c by longest side
by_c = {c: [t for t in scal if t[2] == c] for c in range(12, 18)}
assert {c: len(v) for c, v in by_c.items()} == {17: 7, 16: 5, 15: 4, 14: 2, 13: 1, 12: 0}
assert [t[:2] for t in by_c[17]] == [(3, 16), (4, 15), (5, 14), (6, 13), (7, 12), (8, 11), (9, 10)]
assert [t[:2] for t in by_c[16]] == [(5, 15), (6, 14), (7, 13), (8, 12), (9, 11)]
assert [t[:2] for t in by_c[15]] == [(7, 14), (8, 13), (9, 12), (10, 11)]
assert [t[:2] for t in by_c[14]] == [(9, 13), (10, 12)]
assert [t[:2] for t in by_c[13]] == [(11, 12)]
assert 7 + 5 + 4 + 2 + 1 == 19
assert 36 - 17 == 19 and 36 - 16 == 20 and 36 - 12 == 24

# Solution 2: all 27, minus those with two equal sides x, x, 36 - 2x: need 0 < 36 - 2x < 2x -> 9 < x < 18
alls = {c: len([t for t in T if t[2] == c]) for c in range(12, 18)}
assert alls == {17: 8, 16: 7, 15: 5, 14: 4, 13: 2, 12: 1} and sum(alls.values()) == 27
iso = [(x, 36 - 2 * x) for x in range(1, 18) if 0 < 36 - 2 * x < 2 * x]
assert [x for x, _ in iso] == list(range(10, 18)) and len(iso) == 8
assert sorted(tuple(sorted((x, x, y))) for x, y in iso) == sorted(t for t in T if len(set(t)) < 3)
assert (9, 9, 18) not in T                               # flat: 9 + 9 = 18
assert 27 - 8 == 19

# Traps
assert 27 - 7 == 20                                     # C: removing only the 7 with exactly two equal sides
assert len(T) == 27                                     # D: every triangle
assert 19 - 2 == 17                                     # A: what you'd get missing a row, like longest side 14

# Variant: perimeter 24
V = tris(24)
vs = [t for t in V if len(set(t)) == 3]
assert len(V) == 12 and len(vs) == 7
assert {c: len([t for t in vs if t[2] == c]) for c in range(8, 12)} == {11: 4, 10: 2, 9: 1, 8: 0}
assert [x for x in range(1, 12) if 0 < 24 - 2 * x < 2 * x] == [7, 8, 9, 10, 11] and 12 - 5 == 7
print("ok")
