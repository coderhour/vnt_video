#!/usr/bin/env python3
"""Upload videos/<slug> to YouTube (stdlib only).

One-time setup: python3 tools/youtube.py auth   (needs YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET in the environment)
Over SSH: connect with `ssh -L 8765:localhost:8765 <server>`, run auth there, open the printed URL in your local browser.
Upload from the shell: python3 tools/youtube.py upload <slug>   (the preview site's button calls upload() too)
Optional env: YOUTUBE_PRIVACY (public | unlisted | private, default public), YOUTUBE_MADE_FOR_KIDS=1."""
import http.server
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKEN = ROOT / ".youtube-token.json"  # refresh token, gitignored
SCOPE = "https://www.googleapis.com/auth/youtube.upload"
TOKEN_URL = "https://oauth2.googleapis.com/token"
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"


def call(url, data=None, headers=None, method=None):
    """HTTP request -> (response headers, parsed JSON body). Raises RuntimeError with Google's error text."""
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            body = r.read()
            return r.headers, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{e.code} {e.read().decode(errors='replace')[:500]}") from None


def form(url, **fields):
    return call(url, urllib.parse.urlencode(fields).encode())[1]


def auth():
    """Browser consent on a loopback redirect; saves the refresh token."""
    cid, secret = os.environ["YOUTUBE_CLIENT_ID"], os.environ["YOUTUBE_CLIENT_SECRET"]
    got = {}

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            got.update(urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query))
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Done, you can close this tab.")

    srv = http.server.HTTPServer(("127.0.0.1", 8765), H)  # fixed so `ssh -L 8765:localhost:8765` can reach it
    redirect = f"http://127.0.0.1:{srv.server_port}"
    print("Open this URL, sign in with the channel's Google account and allow access:\n" + AUTH_URL + "?" + urllib.parse.urlencode(dict(
            client_id=cid, redirect_uri=redirect, response_type="code", scope=SCOPE,
            access_type="offline", prompt="consent")))
    while "code" not in got and "error" not in got:
        srv.handle_request()
    if "error" in got:
        sys.exit(f"denied: {got['error'][0]}")
    tok = form(TOKEN_URL, code=got["code"][0], client_id=cid, client_secret=secret,
               redirect_uri=redirect, grant_type="authorization_code")
    TOKEN.write_text(json.dumps({"refresh_token": tok["refresh_token"]}))
    TOKEN.chmod(0o600)
    print(f"saved {TOKEN.name}")


def access_token():
    if not TOKEN.exists():
        raise RuntimeError("not authorized yet: run python3 tools/youtube.py auth")
    return form(TOKEN_URL, refresh_token=json.loads(TOKEN.read_text())["refresh_token"],
                client_id=os.environ["YOUTUBE_CLIENT_ID"], client_secret=os.environ["YOUTUBE_CLIENT_SECRET"],
                grant_type="refresh_token")["access_token"]


def tags(meta):
    """meta.json "tags", else defaults from the contest in question_id (the site shows these too)."""
    contest = "AMC 10" if "amc10" in meta.get("question_id", "") else "AMC 8"
    return meta.get("tags") or [contest, "math competition", "math olympiad", "problem solving", "Vantee", "math for kids"]


def upload(slug):
    """Upload video.mp4 (+ poster.jpg as thumbnail), then save youtube_id and a post in meta.json. Returns the id."""
    d = ROOT / "videos" / slug
    meta = json.loads((d / "meta.json").read_text())
    if meta.get("youtube_id"):
        raise RuntimeError(f"already on YouTube: {meta['youtube_id']}")
    video = (d / "video.mp4").read_bytes()  # ponytail: whole file in memory, fine for ~30 MB explainers
    auth_h = {"Authorization": f"Bearer {access_token()}"}
    body = {
        "snippet": {"title": meta["title"][:100], "description": meta.get("description", "").replace("<", "‹").replace(">", "›"),
                    "tags": tags(meta), "categoryId": "27", "defaultLanguage": "en", "defaultAudioLanguage": "en"},
        "status": {"privacyStatus": os.environ.get("YOUTUBE_PRIVACY", "public"),
                   "selfDeclaredMadeForKids": os.environ.get("YOUTUBE_MADE_FOR_KIDS") == "1"},
    }
    h, _ = call("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
                json.dumps(body).encode(), {**auth_h, "Content-Type": "application/json; charset=UTF-8",
                                            "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(len(video))})
    vid = call(h["Location"], video, {**auth_h, "Content-Type": "video/mp4"}, "PUT")[1]["id"]
    # Save first: the upload already happened, so a thumbnail failure must not lose the id.
    meta["youtube_id"] = vid
    meta.setdefault("posts", []).append({"platform": "YouTube", "url": f"https://www.youtube.com/watch?v={vid}"})
    (d / "meta.json").write_text(json.dumps(meta, indent=1, ensure_ascii=False) + "\n")
    if (d / "poster.jpg").exists():
        try:  # custom thumbnails need a phone-verified channel
            call(f"https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={vid}",
                 (d / "poster.jpg").read_bytes(), {**auth_h, "Content-Type": "image/jpeg"})
        except RuntimeError as e:
            print(f"thumbnail not set: {e}", file=sys.stderr)
    return vid


if __name__ == "__main__":
    if sys.argv[1:2] == ["auth"]:
        auth()
    elif sys.argv[1:2] == ["upload"] and len(sys.argv) == 3:
        print(upload(sys.argv[2]))
    else:
        sys.exit(__doc__)
