#!/usr/bin/env python3
"""Local preview server for videos/. Usage: python3 tools/serve.py [port]"""
import json
import posixpath
import re
import sys
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

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
            publish_tags=youtube.tags(v),
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
        if self.path == "/api/youtube":
            return self.post_youtube()
        if self.path != "/api/status":
            return self.send_error(404)
        try:
            d = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            ok = set_status(d.get("slug"), d.get("status"), d.get("fixes"))
        except (ValueError, AttributeError):
            ok = False
        self.send_response(204 if ok else 400)
        self.end_headers()

    def post_youtube(self):
        # Blocks until the upload finishes (a minute or so); ThreadingHTTPServer keeps the site responsive.
        try:
            slug = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))["slug"]
            if not valid_slug(slug):
                raise RuntimeError("bad slug")
            body, code = {"id": youtube.upload(slug)}, 200
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
