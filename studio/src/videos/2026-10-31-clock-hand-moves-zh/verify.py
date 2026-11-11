"""Check: hour hand at 3 moves 1, 2, ..., 20 hours (amc8 arithmetic c1-920), every number the video shows."""
def end(start, n):
    h = start
    for k in range(1, n + 1):
        for _ in range(k):          # move one hour at a time
            h = h % 12 + 1
    return h


assert end(3, 20) == 9
choices = [3, 6, 7, 9, 10]
assert choices[3] == 9                                   # bank correct_index 3

# Solution 1: add the moves by pairing, drop full turns
assert sum(range(1, 21)) == 210 and 1 + 20 == 21 and 2 + 19 == 21 and 10 * 21 == 210
assert divmod(210, 12) == (17, 6) and 17 * 12 == 204 and 210 - 204 == 6
assert 3 + 6 == 9

# Solution 2: throw away full turns as you go
assert [a + b for a, b in [(1, 11), (2, 10), (3, 9), (4, 8), (5, 7)]] == [12] * 5
assert sum(range(1, 13)) == 5 * 12 + 6 + 12              # 1..11 pairs to 5 turns, 6 left over, 12 is a turn
assert [k - 12 for k in range(13, 21)] == list(range(1, 9)) and sum(range(1, 9)) == 36 == 3 * 12
assert end(3, 12) == 9                                   # after the first twelve moves, already at 9
# steps 13..20 add 36 = 3 full turns, so still 9

# Traps
assert 210 % 12 != 0                                     # A: 3 would need whole turns only
# B: 6 is the leftover counted from 12 instead of from 3
# C, D: 7 and 10 would need leftovers 4 and 7, but it is 6
assert 7 - 3 == 4 and 10 - 3 == 7

# Variant: start at 8, moves 1..16
assert sum(range(1, 17)) == 136 and 8 * 17 == 136 and divmod(136, 12) == (11, 4) and 8 + 4 == 12
assert end(8, 16) == 12
print("ok")
