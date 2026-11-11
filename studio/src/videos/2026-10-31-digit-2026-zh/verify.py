"""Check: the 2026th digit of 123456789101112... (amc8 mock c2-140), every number the video shows."""
s = "".join(map(str, range(1, 5000)))
assert s[2026 - 1] == "7"
choices = [1, 2, 6, 7, 8]
assert choices[3] == 7                                   # bank correct_index 3

# Solution 1: blocks of digits
assert 9 * 1 == 9 and 90 * 2 == 180 and 9 + 180 == 189
assert 99 - 10 + 1 == 90
assert 2026 - 189 == 1837 and divmod(1837, 3) == (612, 1)
assert 100 + 612 - 1 == 711                              # 612 full numbers: 100 ... 711
assert 3 * 612 == 1836 and 189 + 1836 == 2025            # digit 2025 is the last digit of 711
assert s[2025 - 1] == "1" and s[2022:2025] == "711"
assert s[2026 - 1:2026 + 2] == "712"                     # digit 2026 starts 712

# Solution 2: jump by hundreds
assert 100 * 3 == 300
assert 189 + 600 * 3 == 1989 and 189 + 700 * 3 == 2289   # through 699 and through 799
assert 1989 < 2026 < 2289
assert 2026 - 1989 == 37 and divmod(37, 3) == (12, 1)    # 12 full numbers 700..711, then 712
assert 700 + 12 == 712

# Traps: middle digit 1, last digit 2; 6 from 612/613 (forgetting the 3-digit numbers start at 100)
assert "712"[1] == "1" and "712"[2] == "2" and str(612)[0] == "6" and str(613)[0] == "6"

# Variant: 1000th digit
assert 1000 - 189 == 811 and divmod(811, 3) == (270, 1) and 100 + 270 == 370
assert s[1000 - 1] == "3" and s[999:1002] == "370"
assert 189 + 200 * 3 == 789 and 189 + 300 * 3 == 1089 and 1000 - 789 == 211 and divmod(211, 3) == (70, 1)
print("ok")
