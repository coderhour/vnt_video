"""Brute-force check: triangular numbers 1, 3, 6, 10, ... and multiples of 3, plus every number the video shows."""

T = lambda n: n * (n + 1) // 2

# The list as the question builds it: start at 1, then add 2, 3, 4, ...
lst, cur = [], 0
for k in range(1, 101):
    cur += k
    lst.append(cur)
assert lst[:5] == [1, 3, 6, 10, 15] and lst == [T(n) for n in range(1, 101)]
assert lst[99] == 5050 > 5000                      # "the last number is over five thousand"

ans = sum(x % 3 == 0 for x in lst)
choices = [33, 34, 50, 66, 67]
assert ans == 66 and choices.index(ans) == 3       # bank correct_index = 3
print("answer:", ans)

# Solution 1: remainders 1, 0, 0 repeating; add remainders step by step.
rems = [x % 3 for x in lst]
assert rems[:6] == [1, 0, 0, 1, 0, 0]
assert all(rems[i] == [1, 0, 0][i % 3] for i in range(100))
assert (3 + 3, 6 + 4, 10 + 5, 15 + 6) == (6, 10, 15, 21)
assert 4 % 3 == 1 and 5 % 3 == 2 and (1 + 2) % 3 == 0
assert 4 + 5 + 6 == 15 == 5 * 3
assert all((n + (n + 1) + (n + 2)) % 3 == 0 for n in range(1, 1000))   # three in a row
assert divmod(100, 3) == (33, 1) and 33 * 2 == 66
assert rems[99] == 1                                # spot 100 starts a new group, leaves 1

# Solution 2: staircase doubling, formula, n or n+1 a multiple of 3.
assert 1 + 2 + 3 + 4 == 10 == 4 * 5 // 2
assert all((T(n) % 3 == 0) == (n % 3 in (0, 2)) for n in range(1, 10000))
assert all(((2 * m) % 3 == 0) == (m % 3 == 0) for m in range(1000))
a = [n for n in range(1, 101) if n % 3 == 0]
b = [n for n in range(1, 101) if (n + 1) % 3 == 0]
assert (len(a), a[0], a[1], a[-1]) == (33, 3, 6, 99)
assert (len(b), b[0], b[1], b[-1]) == (33, 2, 5, 98)
assert not set(a) & set(b) and len(a) + len(b) == 66

# Traps.
assert len([n for n in range(1, 101) if n % 3 == 0]) == 33            # only spots 3, 6, 9...
assert all(T(n) % 3 == 0 for n in (2, 5, 8))                           # ...misses spots 2, 5, 8
c = [n for n in range(1, 101) if n % 3 == 1]
assert (len(c), c[:3], c[-1]) == (34, [1, 4, 7], 100) and all(rems[n - 1] == 1 for n in c)
assert 100 // 2 == 50                                                  # every other number
assert 66 + 1 == 67                                                    # counted spot 100 too

# Variant: first 80 numbers -> 53.
v = sum(T(n) % 3 == 0 for n in range(1, 81))
assert v == 53 and v not in choices
assert divmod(80, 3) == (26, 2) and 26 * 2 == 52
assert (T(79) % 3, T(80) % 3) == (1, 0) and 52 + 1 == 53
va = [n for n in range(1, 81) if n % 3 == 0]
vb = [n for n in range(1, 81) if (n + 1) % 3 == 0]
assert (len(va), len(vb), vb[-1]) == (26, 27, 80) and 26 + 27 == 53
print("variant:", v)
print("ok")
