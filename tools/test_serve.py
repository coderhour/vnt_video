import tempfile
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
    assert not serve.mark_tiktok("v1", "https://www.tiktok.com/@x/video/1")  # no short in meta
    (Path(d) / "v1" / "meta.json").write_text('{"title": "T", "short": {"title": "S", "posts": [{"platform": "YouTube Shorts", "url": "y"}]}}')
    assert not serve.mark_tiktok("v1", "https://evil.com/x") and not serve.mark_tiktok("../v1", "https://vm.tiktok.com/a")
    assert serve.mark_tiktok("v1", "https://vm.tiktok.com/a") and serve.mark_tiktok("v1", "https://www.tiktok.com/@x/video/1")
    assert json.loads((Path(d) / "v1" / "meta.json").read_text())["short"]["posts"] == [
        {"platform": "YouTube Shorts", "url": "y"}, {"platform": "TikTok", "url": "https://www.tiktok.com/@x/video/1"}]
print("ok")
import youtube
import tiktok
assert tiktok.caption({"short": {"title": "Hi", "tags": ["AMC 10", "MathTok"]}}).endswith("\n#Amc10 #Mathtok")
assert tiktok.caption({"short": {"title": "Hi #Shorts"}, "tags": ["AMC 8", "math for kids"]}) == "Hi\nPractice more at vantee.ai\n#Amc8 #MathForKids"
assert youtube.tags({"question_id": "amc_practice_amc10_algebra_template:c4-067"})[0] == "AMC 10"
assert youtube.tags({"tags": ["x"]}) == ["x"]
assert youtube.short_description({"youtube_id": "abc", "short": {"description": "Full: {full_video_url}"}}) == "Full: https://www.youtube.com/watch?v=abc"
assert youtube.short_description({"youtube_id": "abc", "short": {"description": "Hi"}}) == "Hi\n\nFull lesson: https://www.youtube.com/watch?v=abc"
with tempfile.TemporaryDirectory() as tmp:  # full video not on YouTube yet -> refused before any upload
    real_root, youtube.ROOT = youtube.ROOT, Path(tmp)
    (Path(tmp) / "videos/s").mkdir(parents=True)
    (Path(tmp) / "videos/s/meta.json").write_text('{"short": {"title": "t"}}')
    try:
        youtube.upload_short("s")
        raise AssertionError("short uploaded before the full video")
    except RuntimeError as e:
        assert "full video first" in str(e)
    assert youtube.add_to_playlist("s") is False  # not on YouTube yet -> nothing to add, no API call
    (Path(tmp) / "videos/s/meta.json").write_text('{"youtube_id": "v", "playlist_id": "p"}')
    assert youtube.add_to_playlist("s") is False  # already in its playlist
    youtube.ROOT = real_root
assert not serve.valid_slug("../videos") and not serve.valid_slug(None)
assert "utm_campaign=x-y" in youtube.footer("x-y", "video") and "{" not in youtube.footer("x-y", "short")
assert youtube.contest({"question_id": "amc_practice_amc8_x:c1"}) == "AMC 8"
print("ok youtube")
