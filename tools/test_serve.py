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
from datetime import datetime, timedelta, timezone
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
    posts = json.loads((Path(d) / "v1" / "meta.json").read_text())["short"]["posts"]
    assert posts[1].pop("published_at")[:4] == serve.youtube.now()[:4]  # timestamped
    assert posts == [{"platform": "YouTube Shorts", "url": "y"}, {"platform": "TikTok", "url": "https://www.tiktok.com/@x/video/1"}]
    assert not serve.mark_quiz("v1", "https://www.youtube.com/post/Ug")  # video not on YouTube yet
    (Path(d) / "v1" / "meta.json").write_text('{"youtube_id": "v", "posts": [{"platform": "YouTube", "url": "w"}]}')
    assert not serve.mark_quiz("v1", "https://evil.com/post") and not serve.mark_quiz("../v1", "https://www.youtube.com/post/Ug")
    assert serve.mark_quiz("v1", "https://www.youtube.com/post/A") and serve.mark_quiz("v1", "https://youtube.com/post/B")
    assert json.loads((Path(d) / "v1" / "meta.json").read_text())["posts"] == [
        {"platform": "YouTube", "url": "w"}, {"platform": "YouTube quiz post", "url": "https://youtube.com/post/B"}]
    assert not serve.mark_wechat("v1", "both") and not serve.mark_wechat("../v1", "video")
    assert serve.mark_wechat("v1", "video") and serve.mark_wechat("v1", "short") and serve.mark_wechat("v1", "video")
    assert [p["kind"] for p in json.loads((Path(d) / "v1" / "meta.json").read_text())["cn"]["posts"]] == ["short", "video"]
    assert not serve.mark_related("v1") and not serve.mark_related("../v1")  # no short on YouTube
    (Path(d) / "v1" / "meta.json").write_text('{"short": {"youtube_id": "s"}}')
    assert serve.mark_related("v1") and json.loads((Path(d) / "v1" / "meta.json").read_text())["short"]["related_set"] is True
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
    assert youtube.add_to_playlist("s", short=True) is False  # no short on YouTube yet
    (Path(tmp) / "videos/s/meta.json").write_text('{"youtube_id": "v", "short": {"youtube_id": "s1", "playlist_id": "p"}}')
    assert youtube.add_to_playlist("s", short=True) is False  # short already in its playlist
    real_pl = youtube.PLAYLISTS
    youtube.PLAYLISTS = Path(tmp) / "playlists.json"
    youtube.PLAYLISTS.write_text('{"AMC 10": "full", "AMC 10 Shorts": "shorts"}')
    assert youtube.playlist_id("AMC 10") == "full" and youtube.playlist_id("AMC 10", short=True) == "shorts"
    youtube.PLAYLISTS = real_pl
    youtube.ROOT = real_root
assert not serve.valid_slug("../videos") and not serve.valid_slug(None)
assert "utm_campaign=x-y" in youtube.footer("x-y", "video") and "{" not in youtube.footer("x-y", "short")
assert youtube.contest({"question_id": "amc_practice_amc8_x:c1"}) == "AMC 8"
assert youtube.contest({"contest": "AMC 10"}) == "AMC 10"
print("ok youtube")

with tempfile.TemporaryDirectory() as tmp:  # republish: new short saved, old one private and kept under short.replaced
    real = youtube.ROOT, youtube.put, youtube.set_private
    youtube.ROOT = Path(tmp)
    d = Path(tmp) / "videos/s"; d.mkdir(parents=True); (d / "short.mp4").write_bytes(b"x")
    m = d / "meta.json"
    m.write_text('{"youtube_id": "v", "short": {"title": "t", "posts": [{"platform": "TikTok", "url": "tt"}]}}')
    youtube.put = lambda *a, **k: "new1"
    try:
        youtube.upload_short("s", replace=True); raise AssertionError("replaced a short that was never up")
    except RuntimeError as e:
        assert "Publish short" in str(e)
    m.write_text('{"youtube_id": "v", "short": {"title": "t", "youtube_id": "old", "posts": [{"platform": "YouTube Shorts", "url": "u"}, {"platform": "TikTok", "url": "tt"}]}}')
    hidden = []
    youtube.set_private = hidden.append
    assert youtube.upload_short("s", replace=True) == "new1" and hidden == ["old"]
    sh = json.loads(m.read_text())["short"]
    assert sh["youtube_id"] == "new1" and sh["replaced"] == [{"youtube_id": "old", "url": "https://www.youtube.com/shorts/old", "status": "private"}]
    assert sh["posts"][1].pop("published_at") and sh["posts"] == [{"platform": "TikTok", "url": "tt"}, {"platform": "YouTube Shorts", "url": "https://www.youtube.com/shorts/new1"}]
    def fail(vid): raise RuntimeError("403 insufficient scope")
    youtube.set_private, youtube.put = fail, (lambda *a, **k: "new2")
    assert youtube.upload_short("s", replace=True) == "new2"  # the upload is kept even if hiding the old one fails
    sh = json.loads(m.read_text())["short"]
    assert sh["youtube_id"] == "new2" and sh["replaced"][-1]["youtube_id"] == "new1" and sh["replaced"][-1]["status"].startswith("still public")
    youtube.ROOT, youtube.put, youtube.set_private = real
print("ok republish")

# scheduled publish: validated time, private upload with publishAt in UTC, post marked scheduled
for bad in ("2020-01-01T00:00+00:00", "2099-01-01T10:00"):
    try:
        youtube.schedule(bad); raise AssertionError(f"accepted {bad}")
    except ValueError:
        pass
at = youtube.schedule("2099-01-02T16:00:00Z")
assert youtube.schedule("") is None and datetime.fromisoformat(at) == datetime(2099, 1, 2, 16, tzinfo=timezone.utc)
assert youtube.post("YouTube", "u", at)["scheduled_at"] and "scheduled_at" not in youtube.post("YouTube", "u")
with tempfile.TemporaryDirectory() as tmp:
    sent = []
    real = youtube.call, youtube.access_token
    youtube.access_token = lambda: "tok"
    youtube.call = lambda url, data=None, *a: sent.append(data) or ({"Location": "up"}, {"id": "v1"})
    f = Path(tmp) / "v.mp4"; f.write_bytes(b"x")
    assert youtube.put(f, "t", "d", [], publish_at=at) == "v1"
    st = json.loads(sent[0])["status"]
    assert st["privacyStatus"] == "private" and st["publishAt"] == "2099-01-02T16:00:00Z", st
    sent.clear(); youtube.put(f, "t", "d", [])
    assert "publishAt" not in json.loads(sent[0])["status"]
    # thumbnail: result saved, never raised; a failure is reported, not lost
    youtube.call = lambda *a, **k: (_ for _ in ()).throw(RuntimeError("403 not verified"))
    assert youtube.set_thumbnail("v1", f) == "failed: 403 not verified" and youtube.set_thumbnail("v1", Path(tmp) / "no.jpg") == "missing poster.jpg"
    youtube.call = lambda *a, **k: ({}, {})
    assert youtube.set_thumbnail("v1", f) == "set"
    # sync_meta: keeps tags/category, swaps title + description
    vd = Path(tmp) / "videos" / "s1"; vd.mkdir(parents=True)
    (vd / "meta.json").write_text(json.dumps({"title": "New", "description": "D", "youtube_id": "y"}))
    old_root, youtube.ROOT, sent = youtube.ROOT, Path(tmp), []
    youtube.call = lambda url, data=None, headers=None, method=None: sent.append(data) or ({}, {"items": [{"snippet": {"title": "Old", "tags": ["t"], "categoryId": "27", "thumbnails": {}}}]})
    assert youtube.sync_meta("s1") == "New"
    sn = json.loads(sent[-1])["snippet"]
    assert sn["tags"] == ["t"] and sn["categoryId"] == "27" and sn["description"].startswith("D") and "thumbnails" not in sn
    youtube.ROOT = old_root
    youtube.call, youtube.access_token = real
# a short published with its video goes public a day later
assert datetime.fromisoformat(youtube.later(at)) - datetime.fromisoformat(at) == timedelta(hours=24)
assert datetime.fromisoformat(youtube.later(None)) > datetime.now().astimezone() + timedelta(hours=23)
print("ok schedule")

with tempfile.TemporaryDirectory() as t:
    (Path(t) / "b.json").write_text(json.dumps({"questions": [{"id": "q", "prompt": r"Find \(x^2\) if \(x \le 3\)", "correct_index": 4,
        "choices": ["1", "2", "3", "4", r"\(\frac{9}{2}\)"], "explanation": "x" * 400}]}))
    p = youtube.quiz_post({"question_id": "b:q", "youtube_id": "v"}, Path(t))
    assert "Find x² if x ≤ 3" in p and "✓ 9/2" in p and "• 4" not in p and "• 3" in p, p
    assert len(p.split("Explanation: ")[1]) == 350 and "watch?v=v" in p
    assert youtube.quiz_post({"question_id": "b:missing"}, Path(t)) is None
print("ok quiz post")
