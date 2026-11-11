#!/usr/bin/env python3
"""Local preview server for videos/. Usage: python3 tools/serve.py [port]"""
import json
import posixpath
import re
import sys
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import tiktok
import youtube

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "videos"


def list_videos():
    out = []
    for meta in VIDEOS.glob("*/meta.json"):
        d = meta.parent
        try:
            v = json.loads(meta.read_text())
        except json.JSONDecodeError as e:
            v = {"title": f"{d.name} (bad meta.json: {e})"}
        script = d / "script.md"
        v.update(
            slug=d.name,
            script=script.read_text() if script.exists() else "",
            video=f"/videos/{d.name}/video.mp4" if (d / "video.mp4").exists() else None,
            poster=f"/videos/{d.name}/poster.jpg" if (d / "poster.jpg").exists() else None,
            short_video=f"/videos/{d.name}/short.mp4" if (d / "short.mp4").exists() else None,
            # *-zh videos are rendered without the domain, so they are their own China cut
            video_cn=next((f"/videos/{d.name}/{f}" for f in ["video-cn.mp4", *(["video.mp4"] if d.name.endswith("-zh") else [])] if (d / f).exists()), None),
            short_video_cn=next((f"/videos/{d.name}/{f}" for f in ["short-cn.mp4", *(["short.mp4"] if d.name.endswith("-zh") else [])] if (d / f).exists()), None),
            covers=[f"/videos/{d.name}/{f}" for f in ("cover-3x4.jpg", "cover-4x3.jpg") if (d / f).exists()],  # WeChat Channels
            publish_tags=youtube.tags(v),
            publish_description=v.get("description", "") + youtube.footer(d.name, "video"),
            tiktok_caption=tiktok.caption(v) if v.get("short") else None,
            youtube_quiz=youtube.quiz_post(v),
        )
        out.append(v)
    return sorted(out, key=lambda v: str(v.get("created", "")), reverse=True)


STATUSES = ("draft", "ready", "fix")  # "published" is implied by meta.json posts


def valid_slug(slug):
    return isinstance(slug, str) and "/" not in slug and not slug.startswith(".") and (VIDEOS / slug / "meta.json").is_file()


def set_status(slug, status, fixes=None):
    """Write status (and fix notes) into videos/<slug>/meta.json. Returns False on bad input."""
    if status not in STATUSES or not valid_slug(slug):
        return False
    meta = VIDEOS / slug / "meta.json"
    v = json.loads(meta.read_text())
    v["status"] = status
    if status == "fix":
        v["fixes"] = [str(f) for f in (fixes or [])]
    else:
        v.pop("fixes", None)
    meta.write_text(json.dumps(v, indent=1, ensure_ascii=False) + "\n")
    return True


def mark_tiktok(slug, url):
    """Record a hand-made TikTok post of the short (the API can't post publicly until the app is audited)."""
    if not valid_slug(slug) or not re.fullmatch(r"https://(www\.|vm\.)?tiktok\.com/\S+", url or ""):
        return False
    d = VIDEOS / slug
    meta = json.loads((d / "meta.json").read_text())
    if "short" not in meta:
        return False
    posts = meta["short"].setdefault("posts", [])
    posts[:] = [p for p in posts if p.get("platform") != "TikTok"] + [{"platform": "TikTok", "url": url, "published_at": youtube.now()}]  # ponytail: time of marking, ~ the hand post
    youtube.save(d, meta)
    return True


def mark_quiz(slug, url):
    """Record a hand-made YouTube quiz Post (the Data API can't create Posts). Needs the video on YouTube first."""
    if not valid_slug(slug) or not re.fullmatch(r"https://(www\.)?youtube\.com/\S+", url or ""):
        return False
    d = VIDEOS / slug
    meta = json.loads((d / "meta.json").read_text())
    if not meta.get("youtube_id"):
        return False
    posts = meta.setdefault("posts", [])
    posts[:] = [p for p in posts if p.get("platform") != "YouTube quiz post"] + [{"platform": "YouTube quiz post", "url": url}]
    youtube.save(d, meta)
    return True


def mark_related(slug):
    """Record that the short's Related video (the full lesson) was set by hand in YouTube Studio (the API can't)."""
    if not valid_slug(slug):
        return False
    d = VIDEOS / slug
    meta = json.loads((d / "meta.json").read_text())
    if not meta.get("short", {}).get("youtube_id"):
        return False
    meta["short"]["related_set"] = True
    youtube.save(d, meta)
    return True


def mark_wechat(slug, kind):
    """Record a hand-made WeChat Channels post of the China cut (no public web link, so just kind + time)."""
    if not valid_slug(slug) or kind not in ("video", "short"):
        return False
    d = VIDEOS / slug
    meta = json.loads((d / "meta.json").read_text())
    posts = meta.setdefault("cn", {}).setdefault("posts", [])
    posts[:] = [p for p in posts if (p.get("platform"), p.get("kind")) != ("WeChat Channels", kind)] + [
        {"platform": "WeChat Channels", "kind": kind, "published_at": youtube.now()}]  # ponytail: time of marking
    youtube.save(d, meta)
    return True


def parse_range(header, size):
    """'bytes=a-b' -> (start, end) inclusive, or None if unsatisfiable."""
    m = re.fullmatch(r"bytes=(\d*)-(\d*)", header.strip())
    if not m or m.groups() == ("", ""):
        return None
    a, b = m.groups()
    if a == "":  # suffix range: last b bytes
        start, end = max(0, size - int(b)), size - 1
    else:
        start, end = int(a), min(int(b) if b else size - 1, size - 1)
    return (start, end) if start <= end else None


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        if self.path.startswith("/site/"):  # the page changes often: always revalidate (304 when unchanged)
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        path = posixpath.normpath(urllib.parse.unquote(self.path.split("?")[0]))
        if path == "/api/videos":
            body = json.dumps(list_videos()).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/":
            self.path = "/site/index.html"
        elif not path.startswith(("/site/", "/videos/")):  # keep .env etc. unreachable
            return self.send_error(404)
        if "Range" in self.headers:
            return self.send_range()
        super().do_GET()

    def do_POST(self):
        if self.path in ("/api/youtube", "/api/tiktok"):
            return self.post_youtube()
        if self.path not in ("/api/status", "/api/tiktok-posted", "/api/quiz-posted", "/api/wechat-posted", "/api/related-set"):
            return self.send_error(404)
        try:
            d = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            mark = {"/api/tiktok-posted": mark_tiktok, "/api/quiz-posted": mark_quiz}.get(self.path)
            ok = mark_related(d.get("slug")) if self.path == "/api/related-set" else \
                mark_wechat(d.get("slug"), d.get("kind")) if self.path == "/api/wechat-posted" else \
                mark(d.get("slug"), d.get("url")) if mark else set_status(d.get("slug"), d.get("status"), d.get("fixes"))
        except (ValueError, AttributeError):
            ok = False
        self.send_response(204 if ok else 400)
        self.end_headers()

    def post_youtube(self):
        # Blocks until the upload finishes (a minute or so); ThreadingHTTPServer keeps the site responsive.
        try:
            d = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            slug, kind = d["slug"], d.get("kind", "video")  # video | short | both
            if not valid_slug(slug) or kind not in ("video", "short", "both", "republish"):
                raise RuntimeError("bad slug or kind")
            at = youtube.schedule(d.get("publish_at")) if self.path == "/api/youtube" else None  # None = publish now
            body = {"scheduled": at} if at else {}  # the page checks this: a stale server would publish right away
            if self.path == "/api/tiktok":  # ponytail: shorts only; the 16:9 videos don't suit TikTok
                body["short_id"] = tiktok.upload_short(slug)
            elif kind in ("video", "both"):
                body["id"] = youtube.upload(slug, at)
            if self.path == "/api/youtube" and kind in ("short", "both"):  # after the video, so the short can link to it
                sat = youtube.later(at) if kind == "both" else at  # with its video: the short goes public a day later
                body["short_id"] = youtube.upload_short(slug, publish_at=sat)
                if kind == "both":
                    body["short_scheduled"] = sat
            if self.path == "/api/youtube" and kind == "republish":  # new short; the old one goes private
                body["short_id"] = youtube.upload_short(slug, replace=True, publish_at=at)
                gone = json.loads((VIDEOS / slug / "meta.json").read_text())["short"]["replaced"][-1]
                if gone["status"] != "private":
                    body["warning"] = f"New short is up, but the old one ({gone['url']}) is {gone['status']}"
            if self.path == "/api/youtube":
                for short in (False, True):
                    try:
                        youtube.add_to_playlist(slug, short)  # no-op unless that one is up and not yet listed
                    except Exception as e:  # the upload worked; just report the playlist step
                        body["warning"] = f"uploaded, but not added to the playlist: {e}"
            code = 200
        except Exception as e:  # report every failure (auth, quota, network) to the page
            body, code = {"error": str(e)}, 500
        body = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_range(self):
        # http.server has no Range support; browsers need it to seek in <video>.
        f = Path(self.translate_path(self.path))
        if not f.is_file():
            return self.send_error(404)
        size = f.stat().st_size
        rng = parse_range(self.headers["Range"], size)
        if rng is None:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.end_headers()
            return
        start, end = rng
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(str(f)))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        try:
            with f.open("rb") as fh:
                fh.seek(start)
                left = end - start + 1
                while left > 0:
                    chunk = fh.read(min(left, 1 << 20))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)
        except ConnectionError:  # browser cancels range requests while seeking
            pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"http://localhost:{port}")
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
