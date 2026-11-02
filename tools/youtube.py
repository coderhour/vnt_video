#!/usr/bin/env python3
"""Upload videos/<slug> to YouTube (stdlib only).

One-time setup: python3 tools/youtube.py auth   (needs YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET in the environment)
Over SSH: connect with `ssh -L 8765:localhost:8765 <server>`, run auth there, open the printed URL in your local browser.
Upload from the shell: python3 tools/youtube.py upload <slug>   (the preview site's button calls upload() too)
                       python3 tools/youtube.py upload-short <slug>   (needs the full video uploaded first; its URL
                       fills {full_video_url} in meta.json short.description)
                       python3 tools/youtube.py playlists   (add every published video to its AMC 8 / AMC 10 playlist;
                       uploads do this too. Needs the "youtube" scope: re-run auth if the token predates it)
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
SCOPE = "https://www.googleapis.com/auth/youtube"  # upload + playlists (youtube.upload alone can't manage playlists)
PLAYLISTS = ROOT / "videos" / "playlists.json"  # {"AMC 8": playlist id, "AMC 10": ...}, created on first use
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


def contest(meta):
    return "AMC 10" if "amc10" in meta.get("question_id", "") else "AMC 8"


def tags(meta):
    """meta.json "tags", else defaults from the contest in question_id (the site shows these too)."""
    return meta.get("tags") or [contest(meta), "math competition", "math olympiad", "problem solving", "Vantee", "math for kids"]


def api(path, body):
    """POST a JSON body to the Data API with a fresh token."""
    return call(f"https://www.googleapis.com/youtube/v3/{path}", json.dumps(body).encode(),
                {"Authorization": f"Bearer {access_token()}", "Content-Type": "application/json; charset=UTF-8"})[1]


def playlist_id(name):
    """The channel's playlist for "AMC 8" / "AMC 10", created on first use."""
    ids = json.loads(PLAYLISTS.read_text()) if PLAYLISTS.exists() else {}
    if name not in ids:
        ids[name] = api("playlists?part=snippet,status", {
            "snippet": {"title": f"{name}-Style Practice Problems, Explained", "defaultLanguage": "en",
                        "description": f"Hard {name}-style questions, solved step by step by Vantee: try it yourself, "
                                       f"see more than one way, learn the traps, then solve a variant." + footer("playlist", "playlist")},
            "status": {"privacyStatus": os.environ.get("YOUTUBE_PRIVACY", "public")}})["id"]
        PLAYLISTS.write_text(json.dumps(ids, indent=1) + "\n")
    return ids[name]


def add_to_playlist(slug):
    """Add the published full video to its contest playlist (once; saves playlist_id in meta.json). Returns True if added."""
    d = ROOT / "videos" / slug
    meta = json.loads((d / "meta.json").read_text())
    if not meta.get("youtube_id") or meta.get("playlist_id"):
        return False
    pid = playlist_id(contest(meta))
    api("playlistItems?part=snippet", {"snippet": {"playlistId": pid, "resourceId": {"kind": "youtube#video", "videoId": meta["youtube_id"]}}})
    meta = json.loads((d / "meta.json").read_text())
    meta["playlist_id"] = pid
    save(d, meta)
    return True


# Appended to every upload. Speaks to parents too (viewers are kids), and disclaims the MAA trademark.
FOOTER = """

Want full AMC 8 and AMC 10 practice? Vantee has many more questions like this one, with a tutor that helps step by step. Parents and students, try it at https://www.vantee.ai/?utm_source=youtube&utm_medium={medium}&utm_campaign={slug}

AMC 8 and AMC 10 are trademarks of the Mathematical Association of America (MAA). This is original practice material by Vantee, not affiliated with or endorsed by the MAA."""


def footer(slug, medium):
    return FOOTER.format(slug=slug, medium=medium)


def put(file, title, description, tags, thumb=None):
    """Upload one mp4 (+ optional thumbnail jpg). Returns the new video id."""
    video = file.read_bytes()  # ponytail: whole file in memory, fine for ~30 MB explainers
    auth_h = {"Authorization": f"Bearer {access_token()}"}
    body = {
        "snippet": {"title": title[:100], "description": description.replace("<", "‹").replace(">", "›"),
                    "tags": tags, "categoryId": "27", "defaultLanguage": "en", "defaultAudioLanguage": "en"},
        "status": {"privacyStatus": os.environ.get("YOUTUBE_PRIVACY", "public"),
                   "selfDeclaredMadeForKids": os.environ.get("YOUTUBE_MADE_FOR_KIDS") == "1"},
    }
    h, _ = call("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
                json.dumps(body).encode(), {**auth_h, "Content-Type": "application/json; charset=UTF-8",
                                            "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(len(video))})
    vid = call(h["Location"], video, {**auth_h, "Content-Type": "video/mp4"}, "PUT")[1]["id"]
    if thumb and thumb.exists():
        try:  # custom thumbnails need a phone-verified channel
            call(f"https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={vid}",
                 thumb.read_bytes(), {**auth_h, "Content-Type": "image/jpeg"})
        except RuntimeError as e:
            print(f"thumbnail not set: {e}", file=sys.stderr)
    return vid


def watch_url(vid):
    return f"https://www.youtube.com/watch?v={vid}"


def save(d, meta):
    (d / "meta.json").write_text(json.dumps(meta, indent=1, ensure_ascii=False) + "\n")


def upload(slug):
    """Upload video.mp4 (+ poster.jpg as thumbnail), then save youtube_id and a post in meta.json. Returns the id."""
    d = ROOT / "videos" / slug
    meta = json.loads((d / "meta.json").read_text())
    if meta.get("youtube_id"):
        raise RuntimeError(f"already on YouTube: {meta['youtube_id']}")
    vid = put(d / "video.mp4", meta["title"], meta.get("description", "") + footer(slug, "video"), tags(meta), d / "poster.jpg")
    meta = json.loads((d / "meta.json").read_text())  # re-read: the upload took a while
    meta["youtube_id"] = vid
    meta.setdefault("posts", []).append({"platform": "YouTube", "url": watch_url(vid)})
    save(d, meta)
    return vid


def short_description(meta):
    """The short's description with {full_video_url} filled in (appended if the token is missing)."""
    url = watch_url(meta["youtube_id"])
    desc = meta["short"].get("description", "")
    return desc.replace(FULL, url) if FULL in desc else f"{desc}\n\nFull lesson: {url}".strip()


FULL = "{full_video_url}"


def upload_short(slug):
    """Upload short.mp4 after the full video is on YouTube; saves short.youtube_id and short.posts. Returns the id."""
    d = ROOT / "videos" / slug
    meta = json.loads((d / "meta.json").read_text())
    if not meta.get("youtube_id"):
        raise RuntimeError("publish the full video first: the short links to it")
    short = meta.get("short")
    if not short or not (d / "short.mp4").exists():
        raise RuntimeError("no short.mp4 / meta.json short")
    if short.get("youtube_id"):
        raise RuntimeError(f"short already on YouTube: {short['youtube_id']}")
    title = short["title"] if "#shorts" in short["title"].lower() else f"{short['title']} #Shorts"
    vid = put(d / "short.mp4", title, short_description(meta) + footer(slug, "short"), tags(meta))
    meta = json.loads((d / "meta.json").read_text())
    meta["short"]["youtube_id"] = vid
    meta["short"].setdefault("posts", []).append({"platform": "YouTube Shorts", "url": f"https://www.youtube.com/shorts/{vid}"})
    save(d, meta)
    return vid


if __name__ == "__main__":
    if sys.argv[1:2] == ["auth"]:
        auth()
    elif sys.argv[1:2] == ["upload"] and len(sys.argv) == 3:
        print(upload(sys.argv[2]))
    elif sys.argv[1:2] == ["upload-short"] and len(sys.argv) == 3:
        print(upload_short(sys.argv[2]))
    elif sys.argv[1:2] == ["playlists"]:  # backfill: every published video into its contest playlist
        for m in sorted((ROOT / "videos").glob("*/meta.json")):
            if add_to_playlist(m.parent.name):
                print("added", m.parent.name)
    else:
        sys.exit(__doc__)
