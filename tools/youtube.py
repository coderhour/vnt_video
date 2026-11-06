#!/usr/bin/env python3
"""Upload videos/<slug> to YouTube (stdlib only).

One-time setup: python3 tools/youtube.py auth   (needs YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET in the environment)
Over SSH: connect with `ssh -L 8765:localhost:8765 <server>`, run auth there, open the printed URL in your local browser.
Upload from the shell: python3 tools/youtube.py upload <slug>   (the preview site's button calls upload() too)
                       python3 tools/youtube.py upload-short <slug>   (needs the full video uploaded first; its URL
                       fills {full_video_url} in meta.json short.description)
                       python3 tools/youtube.py republish-short <slug>   (upload the current short.mp4 as a NEW short,
                       set the old one private; YouTube can't replace a video's file)
                       python3 tools/youtube.py playlists   (add every published video / short to its AMC 8 / AMC 10 (Shorts) playlist;
                       uploads do this too. Needs the "youtube" scope: re-run auth if the token predates it)
Schedule: append an ISO time with offset, e.g. upload <slug> 2026-11-08T16:00-08:00 (also upload-short; the site has a
date box). YouTube holds the video private and makes it public at that time (status.publishAt), nothing runs here.
Optional env: YOUTUBE_PRIVACY (public | unlisted | private, default public), YOUTUBE_MADE_FOR_KIDS=1."""
import http.server
import json
from datetime import datetime, timezone
import os
import re
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


def now():
    """Local time with UTC offset, e.g. 2026-11-04T18:05:00-08:00: kept on each post to find the best time to publish."""
    return datetime.now().astimezone().isoformat(timespec="seconds")


def schedule(at):
    """Validate a publish time ("2026-11-08T16:00-08:00" or ...Z) -> local ISO with offset, or None for "now".
    YouTube needs a future time; it publishes the private upload then."""
    if not at:
        return None
    t = datetime.fromisoformat(at)
    if t.tzinfo is None:
        raise ValueError("publish time needs a UTC offset")
    if t <= datetime.now(timezone.utc):
        raise ValueError(f"publish time is in the past: {at}")
    return t.astimezone().isoformat(timespec="seconds")


def post(platform, url, publish_at=None):
    """A meta.json post; a scheduled one has its future publish time and "scheduled_at" = when it was scheduled (uploaded)."""
    return {"platform": platform, "url": url, "published_at": publish_at or now(), **({"scheduled_at": now()} if publish_at else {})}


def contest(meta):
    """meta.json "contest" (videos without a quiz question, e.g. the contest guides), else from question_id."""
    return meta.get("contest") or ("AMC 10" if "amc10" in meta.get("question_id", "") else "AMC 8")


def tags(meta):
    """meta.json "tags", else defaults from the contest in question_id (the site shows these too)."""
    return meta.get("tags") or [contest(meta), "math competition", "math olympiad", "problem solving", "Vantee", "math for kids"]


def api(path, body):
    """POST a JSON body to the Data API with a fresh token."""
    return call(f"https://www.googleapis.com/youtube/v3/{path}", json.dumps(body).encode(),
                {"Authorization": f"Bearer {access_token()}", "Content-Type": "application/json; charset=UTF-8"})[1]


def playlist_id(name, short=False):
    """The channel's playlist for "AMC 8" / "AMC 10" (or its numbered shorts, key "AMC 10 Shorts"), created on first use."""
    ids = json.loads(PLAYLISTS.read_text()) if PLAYLISTS.exists() else {}
    key = f"{name} Shorts" if short else name
    if key not in ids:
        title, desc = (f"{name} Math Challenges", f"Numbered {name}-style challenges in under a minute: spot the trap, "
                       f"guess in the comments, then watch the full lesson.") if short else (
                       f"{name}-Style Practice Problems, Explained", f"Hard {name}-style questions, solved step by step by "
                       f"Vantee: try it yourself, see more than one way, learn the traps, then solve a variant.")
        ids[key] = api("playlists?part=snippet,status", {
            "snippet": {"title": title, "defaultLanguage": "en", "description": desc + footer("playlist", "playlist")},
            "status": {"privacyStatus": os.environ.get("YOUTUBE_PRIVACY", "public")}})["id"]
        PLAYLISTS.write_text(json.dumps(ids, indent=1) + "\n")
    return ids[key]


def add_to_playlist(slug, short=False):
    """Add the published full video (or its short) to its contest playlist, once: saves playlist_id in meta.json
    (or meta.json short). Returns True if added."""
    d = ROOT / "videos" / slug
    meta = json.loads((d / "meta.json").read_text())
    item = meta.get("short", {}) if short else meta
    if not item.get("youtube_id") or item.get("playlist_id"):
        return False
    pid = playlist_id(contest(meta), short)
    snippet = {"playlistId": pid, "resourceId": {"kind": "youtube#video", "videoId": item["youtube_id"]}}
    if short and item.get("challenge"):  # numbered series: slot in after the lower-numbered shorts already listed
        snippet["position"] = sum(1 for m in (ROOT / "videos").glob("*/meta.json")
                                  if (o := json.loads(m.read_text()).get("short", {})).get("playlist_id") == pid
                                  and o.get("challenge", 0) < item["challenge"])
    api("playlistItems?part=snippet", {"snippet": snippet})
    meta = json.loads((d / "meta.json").read_text())
    (meta["short"] if short else meta)["playlist_id"] = pid
    save(d, meta)
    return True


# Appended to every upload. Speaks to parents too (viewers are kids), and disclaims the MAA trademark.
FOOTER = """

Want full AMC 8 and AMC 10 practice? Vantee has many more questions like this one, with a tutor that helps step by step. Parents and students, try it at https://www.vantee.ai/?utm_source=youtube&utm_medium={medium}&utm_campaign={slug}

AMC 8 and AMC 10 are trademarks of the Mathematical Association of America (MAA). This is original practice material by Vantee, not affiliated with or endorsed by the MAA."""


def footer(slug, medium):
    return FOOTER.format(slug=slug, medium=medium)


def put(file, title, description, tags, thumb=None, publish_at=None):
    """Upload one mp4 (+ optional thumbnail jpg). publish_at (from schedule()): upload private, YouTube publishes it then.
    Returns the new video id."""
    video = file.read_bytes()  # ponytail: whole file in memory, fine for ~30 MB explainers
    auth_h = {"Authorization": f"Bearer {access_token()}"}
    body = {
        "snippet": {"title": title[:100], "description": description.replace("<", "‹").replace(">", "›"),
                    "tags": tags, "categoryId": "27", "defaultLanguage": "en", "defaultAudioLanguage": "en"},
        "status": {"privacyStatus": os.environ.get("YOUTUBE_PRIVACY", "public"),
                   "selfDeclaredMadeForKids": os.environ.get("YOUTUBE_MADE_FOR_KIDS") == "1"},
    }
    if publish_at:  # publishAt only works on a private video
        utc = datetime.fromisoformat(publish_at).astimezone(timezone.utc)
        body["status"] |= {"privacyStatus": "private", "publishAt": utc.strftime("%Y-%m-%dT%H:%M:%SZ")}
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


SUP = str.maketrans("0123456789+-n", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ")
SYM = {"le": "≤", "leq": "≤", "ge": "≥", "geq": "≥", "ne": "≠", "neq": "≠", "times": "×", "cdot": "·", "div": "÷",
       "mid": "|", "pi": "π", "in": "∈", "ldots": "…", "cdots": "…", "dots": "…", "angle": "∠", "triangle": "△",
       "star": "⋆", "circ": "°", "quad": " ", "left": "", "right": "", "displaystyle": "", "gcd": "gcd", "infty": "∞"}
ARG = r"(?:\{([^{}]*)\}|(\\[A-Za-z]+|[A-Za-z0-9]))"  # {group} or one token


def _arg(m, i):
    return m.group(i) if m.group(i) is not None else m.group(i + 1)


def _wrap(x):
    return x if re.fullmatch(r"[\w√.]+|C\(\w+,\w+\)", x) else f"({x})"


def _sup(x):
    return x.translate(SUP) if re.fullmatch(r"[0-9+\-n]+", x) else f"^{_wrap(x)}"


def plain(tex):
    """Quiz-bank LaTeX → plain text for YouTube (no math rendering). ponytail: covers the bank's macros;
    unknown ones lose their backslash, add them to SYM if one reads badly."""
    t = re.sub(r"\\[()\[\]]", "", tex).replace(r"\{", "\x01").replace(r"\}", "\x02").replace(r"\%", "%")
    t = re.sub(r"\\[,;:! ]", " ", t)
    t = re.sub(r"\^\{?\\circ\}?", "°", t)
    t = re.sub(r"\\(?:text|textbf|mathrm|operatorname|overline|mathbf)\s*\{([^{}]*)\}", r"\1", t)
    rules = [
        (r"\\sqrt\s*" + ARG, lambda m: "√" + _wrap(_arg(m, 1))),
        (r"\^" + ARG, lambda m: _sup(_arg(m, 1))),
        (r"\\[dt]?frac\s*" + ARG + r"\s*" + ARG, lambda m: f"{_wrap(_arg(m, 1))}/{_wrap(_arg(m, 3))}"),
        (r"\\binom\s*" + ARG + r"\s*" + ARG, lambda m: f"C({_arg(m, 1)},{_arg(m, 3)})"),
    ]
    while True:  # innermost brace groups first, until nothing changes
        old = t
        for pat, f in rules:
            t = re.sub(pat, f, t)
        t = re.sub(r"\{([^{}]*)\}(?![{^])", r"\1", t) if t == old else t
        if t == old:
            break
    t = re.sub(r"\\([A-Za-z]+)", lambda m: SYM.get(m.group(1), m.group(1)), t)
    return re.sub(r" {2,}", " ", t.replace("\x01", "{").replace("\x02", "}")).strip()


def quiz_post(meta, bank_dir=Path(os.environ.get("VNT", "/home/brad/code/vnt")) / "priv/quiz_banks"):
    """Copy-paste text for a YouTube quiz Post (the Data API can't create Posts). Limits: 4 answers × 80 chars,
    explanation 350 chars, one correct answer. AMC has 5 choices, so the last wrong one is dropped."""
    from export_vnt import find_question
    q = find_question(bank_dir, meta.get("question_id", ""))
    if not q or "correct_index" not in q:
        return None
    choices = q["choices"][:]
    drop = max(i for i in range(len(choices)) if i != q["correct_index"])  # ponytail: drop the last distractor
    correct = choices[q["correct_index"]]
    if len(choices) > 4:
        del choices[drop]
    link = f"\n\nFull solution, every trap: {watch_url(meta['youtube_id'])}" if meta.get("youtube_id") else ""
    lines = [f"{contest(meta)} challenge: {plain(q['prompt'])}{link}", ""]
    lines += [f"{'✓' if c == correct else '•'} {plain(c)[:80]}" for c in choices]
    expl = plain(q.get("explanation", ""))
    lines += ["", "Explanation: " + (expl if len(expl) <= 350 else expl[:349] + "…")]
    return "\n".join(lines)


def save(d, meta):
    (d / "meta.json").write_text(json.dumps(meta, indent=1, ensure_ascii=False) + "\n")


def upload(slug, publish_at=None):
    """Upload video.mp4 (+ poster.jpg as thumbnail), then save youtube_id and a post in meta.json. Returns the id."""
    d = ROOT / "videos" / slug
    meta = json.loads((d / "meta.json").read_text())
    if meta.get("youtube_id"):
        raise RuntimeError(f"already on YouTube: {meta['youtube_id']}")
    vid = put(d / "video.mp4", meta["title"], meta.get("description", "") + footer(slug, "video"), tags(meta), d / "poster.jpg", publish_at)
    meta = json.loads((d / "meta.json").read_text())  # re-read: the upload took a while
    meta["youtube_id"] = vid
    meta.setdefault("posts", []).append(post("YouTube", watch_url(vid), publish_at))
    save(d, meta)
    return vid


def short_description(meta):
    """The short's description with {full_video_url} filled in (appended if the token is missing)."""
    url = watch_url(meta["youtube_id"])
    desc = meta["short"].get("description", "")
    return desc.replace(FULL, url) if FULL in desc else f"{desc}\n\nFull lesson: {url}".strip()


FULL = "{full_video_url}"


def shorts_url(vid):
    return f"https://www.youtube.com/shorts/{vid}"


def upload_short(slug, replace=False, publish_at=None):
    """Upload short.mp4 after the full video is on YouTube; saves short.youtube_id and short.posts. Returns the id.
    replace=True re-uploads a short that is already up (YouTube can't swap a video's file): the new one gets the
    current short.mp4/title/description, the old one is set to private (kept, not deleted) and moves to short.replaced."""
    d = ROOT / "videos" / slug
    meta = json.loads((d / "meta.json").read_text())
    if not meta.get("youtube_id"):
        raise RuntimeError("publish the full video first: the short links to it")
    short = meta.get("short")
    if not short or not (d / "short.mp4").exists():
        raise RuntimeError("no short.mp4 / meta.json short")
    old = short.get("youtube_id")
    if old and not replace:
        raise RuntimeError(f"short already on YouTube: {old}")
    if replace and not old:
        raise RuntimeError("no short on YouTube to replace: use Publish short")
    if replace and publish_at:  # the old short goes private now, so a scheduled new one would leave a gap
        raise RuntimeError("Republish short can't be scheduled")
    title = short["title"] if "#shorts" in short["title"].lower() else f"{short['title']} #Shorts"
    vid = put(d / "short.mp4", title, short_description(meta) + footer(slug, "short"), tags(meta), publish_at=publish_at)
    meta = json.loads((d / "meta.json").read_text())
    s = meta["short"]
    s["youtube_id"] = vid
    s.pop("playlist_id", None)  # the new short still needs adding to the shorts playlist
    s["posts"] = [p for p in s.get("posts", []) if p.get("platform") != "YouTube Shorts"] + [post("YouTube Shorts", shorts_url(vid), publish_at)]
    if old:  # the new short is saved first, so a failure below never loses it
        try:
            set_private(old)
            hidden = "private"
        except RuntimeError as e:
            hidden = f"still public, set it private in YouTube Studio ({e})"
        s.setdefault("replaced", []).append({"youtube_id": old, "url": shorts_url(old), "status": hidden})
    save(d, meta)
    return vid


def set_private(vid):
    """Make a video private, keeping its other status settings (videos.update replaces the whole status part)."""
    auth_h = {"Authorization": f"Bearer {access_token()}"}
    items = call(f"https://www.googleapis.com/youtube/v3/videos?part=status&id={vid}", headers=auth_h)[1].get("items")
    if not items:
        raise RuntimeError(f"video {vid} not found")
    keep = ("embeddable", "license", "publicStatsViewable", "selfDeclaredMadeForKids")
    status = {k: v for k, v in items[0]["status"].items() if k in keep} | {"privacyStatus": "private"}
    call("https://www.googleapis.com/youtube/v3/videos?part=status", json.dumps({"id": vid, "status": status}).encode(),
         {**auth_h, "Content-Type": "application/json"}, "PUT")


if __name__ == "__main__":
    if sys.argv[1:2] == ["auth"]:
        auth()
    elif sys.argv[1:2] == ["upload"] and len(sys.argv) in (3, 4):
        print(upload(sys.argv[2], schedule(sys.argv[3] if len(sys.argv) == 4 else None)))
    elif sys.argv[1:2] == ["upload-short"] and len(sys.argv) in (3, 4):
        print(upload_short(sys.argv[2], publish_at=schedule(sys.argv[3] if len(sys.argv) == 4 else None)))
    elif sys.argv[1:2] == ["republish-short"] and len(sys.argv) == 3:
        print(upload_short(sys.argv[2], replace=True))
    elif sys.argv[1:2] == ["playlists"]:  # backfill: every published video into its contest playlist
        for m in sorted((ROOT / "videos").glob("*/meta.json")):
            for short in (False, True):
                if add_to_playlist(m.parent.name, short):
                    print("added", m.parent.name, "short" if short else "video")
    else:
        sys.exit(__doc__)
