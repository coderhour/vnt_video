"""Brute-force check: strings of X's and O's where, reading left to right, #X so far >= #O so far."""
from itertools import combinations
from math import comb


def strings(nx, no):
    n = nx + no
    for c in combinations(range(n), nx):
        yield ''.join('X' if i in c else 'O' for i in range(n))


def lead(s):
    """Running score: X's so far minus O's so far."""
    out, l = [], 0
    for ch in s:
        l += 1 if ch == 'X' else -1
        out.append(l)
    return out


def good(nx, no):
    return [s for s in strings(nx, no) if min(lead(s)) >= 0]


def table(nx, no):
    """Solution 2: f[x][o] = ways to reach (x X's, o O's) without crossing the wall o <= x."""
    f = {}
    for o in range(no + 1):
        for x in range(nx + 1):
            if o > x:
                f[x, o] = 0  # behind the wall
            elif x == 0 and o == 0:
                f[x, o] = 1
            else:
                f[x, o] = f.get((x - 1, o), 0) + f.get((x, o - 1), 0)
    return f


# ---- the question: 4 X's and 4 O's ----
G = good(4, 4)
assert len(list(strings(4, 4))) == comb(8, 4) == 70
assert len(G) == 14
f = table(4, 4)
assert f[4, 4] == 14
# rows of the table, as shown on screen (row = O's so far, column = X's so far)
rows = [[f[x, o] for x in range(o, 5)] for o in range(5)]
assert rows == [[1, 1, 1, 1, 1], [1, 2, 3, 4], [2, 5, 9], [5, 14], [14]], rows
print('table rows:', rows)

# Solution 1 facts: first letter X, last letter O, and groups by X's before the first O.
assert all(s[0] == 'X' and s[-1] == 'O' for s in G)
groups = {k: sorted((s for s in G if s.index('O') == k), reverse=True) for k in (4, 3, 2, 1)}
assert [len(groups[k]) for k in (4, 3, 2, 1)] == [1, 3, 5, 5]
for k in (4, 3, 2, 1):
    print(k, "X's first:", groups[k])
# "three X's first: the last X can go in three spots (any spot but the very end)"
assert groups[3] == ['XXXOXOOO', 'XXXOOXOO', 'XXXOOOXO']
# "one X, then an O: a tie, so it's like starting over with three of each" -> 5
assert len(good(3, 3)) == 5

# On-screen examples in "What are we asked?"
assert min(lead('XXOXOOXO')) >= 0
assert lead('XOOXXXOO')[2] == -1  # after 3 letters: 1 X, 2 O's

# ---- traps (choices 8, 14, 16, 20, 35; correct_index 1 -> 14) ----
choices = [8, 14, 16, 20, 35]
assert choices[1] == 14
assert 70 // 2 == 35                                            # half of all strings
assert sum(s[0] == 'X' for s in strings(4, 4)) == 35            # ...also = just "starts with X"
assert sum(s[0] == 'X' and s[-1] == 'O' for s in strings(4, 4)) == comb(6, 3) == 20  # middle unchecked
assert 1 + 3 + 5 + 7 == 16                                      # guessing the 1, 3, 5, ... pattern
assert len(G) > 8                                               # 8: the list missed strings
print('traps ok: 35 = 70/2, 20 = X first + O last, 16 = 1+3+5+7, 8 < 14')

# ---- variant: 5 X's and 3 O's ----
V = good(5, 3)
fv = table(5, 3)
assert len(V) == fv[5, 3] == comb(8, 3) - comb(8, 2) == 28
# the new column (5 X's): 1, 1+4 = 5, 5+9 = 14, 14+14 = 28
assert [fv[5, o] for o in range(4)] == [1, 5, 14, 28]
assert all(fv[x, o] == f[x, o] for x in range(5) for o in range(4))  # first columns unchanged
print('variant (5 X, 3 O):', len(V))
print('ok')
