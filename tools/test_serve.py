from serve import parse_range

assert parse_range("bytes=0-", 100) == (0, 99)
assert parse_range("bytes=10-19", 100) == (10, 19)
assert parse_range("bytes=90-500", 100) == (90, 99)
assert parse_range("bytes=-10", 100) == (90, 99)
assert parse_range("bytes=100-", 100) is None
assert parse_range("bytes=-", 100) is None
assert parse_range("items=0-1", 100) is None
import json, tempfile, serve
from pathlib import Path
with tempfile.TemporaryDirectory() as d:
    serve.VIDEOS = Path(d)
    (Path(d) / "v1").mkdir()
    (Path(d) / "v1" / "meta.json").write_text('{"title": "T", "posts": []}')
    assert serve.set_status("v1", "fix", ["caption overlaps"])
    assert json.loads((Path(d) / "v1" / "meta.json").read_text())["fixes"] == ["caption overlaps"]
    assert serve.set_status("v1", "ready")
    m = json.loads((Path(d) / "v1" / "meta.json").read_text())
    assert m["status"] == "ready" and "fixes" not in m and m["title"] == "T"
    assert not serve.set_status("v1", "published")
    assert not serve.set_status("../v1", "ready")
    assert not serve.set_status("nope", "ready")
print("ok")
