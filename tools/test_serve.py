from serve import parse_range

assert parse_range("bytes=0-", 100) == (0, 99)
assert parse_range("bytes=10-19", 100) == (10, 19)
assert parse_range("bytes=90-500", 100) == (90, 99)
assert parse_range("bytes=-10", 100) == (90, 99)
assert parse_range("bytes=100-", 100) is None
assert parse_range("bytes=-", 100) is None
assert parse_range("items=0-1", 100) is None
print("ok")
