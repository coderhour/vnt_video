"""Check: fewest kids who like all three (amc8 counting c1-443), every number the video shows."""
from itertools import combinations

N = 24
# Bound: kids who miss pizza 4, pasta 6, soup 8. At most 4 + 6 + 8 = 18 miss something.
assert (N - 20, N - 18, N - 16) == (4, 6, 8) and 4 + 6 + 8 == 18 and N - 18 == 6

# Any assignment: |all three| >= N - sum(misses). Arrangement hitting 6: kids 1-4 skip pizza, 5-10 pasta, 11-18 soup.
kids = range(1, 25)
pizza = {k for k in kids if not 1 <= k <= 4}
pasta = {k for k in kids if not 5 <= k <= 10}
soup = {k for k in kids if not 11 <= k <= 18}
assert (len(pizza), len(pasta), len(soup)) == (20, 18, 16)
assert len(pizza & pasta & soup) == 6 and pizza & pasta & soup == set(range(19, 25))

# Brute force on "who misses what" (each kid misses a subset): minimum all-three over exact counts.
# Small check of the formula over random-free exhaustive search on a scaled-down class (6 kids, 5/4/4 like).
def min_all(n, a, b, c):
    best = n
    for A in combinations(range(n), a):
        for B in combinations(range(n), b):
            for C in combinations(range(n), c):
                best = min(best, len(set(A) & set(B) & set(C)))
    return best
assert min_all(6, 5, 4, 4) == max(0, 6 - (1 + 2 + 2))
assert min_all(7, 5, 5, 4) == max(0, 7 - (2 + 2 + 3))

# Solution 2: two at a time. Pizza & pasta >= 20 + 18 - 24 = 14. Then with soup: >= 14 + 16 - 24 = 6.
assert 20 + 18 - 24 == 14 and 14 + 16 - 24 == 6 and 38 - 24 == 14 and 30 - 24 == 6
assert len(pizza & pasta) == 14                 # the same arrangement hits 14 too

# Traps: 0 (nobody must), 4 (miss pizza), 14 (stopped after two), 16 (soup group).
choices = [0, 4, 6, 14, 16]
assert choices[2] == 6

# Variant: 30 kids; 25 cats, 22 dogs, 20 fish, 27 birds. Misses 5 + 8 + 10 + 3 = 26 -> at least 4.
assert (30 - 25, 30 - 22, 30 - 20, 30 - 27) == (5, 8, 10, 3) and 5 + 8 + 10 + 3 == 26 and 30 - 26 == 4
kids = range(30)
miss = [range(0, 5), range(5, 13), range(13, 23), range(23, 26)]
likes = [set(kids) - set(m) for m in miss]
assert [len(l) for l in likes] == [25, 22, 20, 27] and len(set.intersection(*likes)) == 4
print("ok")
