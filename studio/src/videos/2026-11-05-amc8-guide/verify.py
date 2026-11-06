"""Every number the AMC 8 guide says. Rules (Wikipedia, American_Mathematics_Competitions, 2026-11-05):
25 questions, 40 minutes, 1 point per right answer, 0 for wrong or blank, grade 8 and below, no calculators,
held in January, Honor Roll top 5%, Distinguished Honor Roll top 1%."""
from fractions import Fraction as F

Q, MIN = 25, 40
assert MIN * 60 / Q == 96  # "about ninety-six seconds per question"
assert Q * 1 == 25  # top score
# no penalty: a guess never scores below a blank
for left in range(1, 6):
    assert F(1, left) > 0
assert F(1, 5 - 2) == F(1, 3)  # cross out two -> one in three
# pacing advice: first 10 in ~10 min leaves 30 for the last 15
assert MIN - 10 == 30 and Q - 10 == 15

# Try one: 198 x 202
choices = {"A": 39996, "B": 40004, "C": 39204, "D": 40000, "E": 4000}
ans = 198 * 202
assert ans == 39996 == 200**2 - 2**2
assert 200 * 200 == 40000
assert (8 * 2) % 10 == 6
assert [k for k, v in choices.items() if v % 10 == 6] == ["A"]  # only one choice ends in 6
assert abs(choices["E"] - 40000) > 30000  # way off the estimate
print("amc8 guide: ok")
