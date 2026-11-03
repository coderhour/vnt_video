#!/usr/bin/env python3
"""Post videos/<slug>/short.mp4 to TikTok via the Content Posting API (Direct Post, stdlib only).

One-time setup: create an app at developers.tiktok.com (Login Kit + Content Posting API with Direct Post,
scopes user.info.basic + video.publish, redirect URI https://local.coderhour.com:8765/callback/ or set TIKTOK_REDIRECT_URI), then put
TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET in the environment and run: python3 tools/tiktok.py auth
It prints a URL; after allowing access the browser lands on the redirect page: paste that page's full URL back.
A sandbox app works (add the channel account as a target user); its posts are private.
Post from the shell: python3 tools/tiktok.py upload-short <slug>   (the preview site's button calls upload_short() too)
Until TikTok audits the app, every post is forced private (SELF_ONLY): flip it to public in the TikTok app.
Optional env: TIKTOK_PRIVACY (PUBLIC_TO_EVERYONE | MUTUAL_FOLLOW_FRIENDS | FOLLOWER_OF_CREATOR | SELF_ONLY;
default public when the account allows it, else SELF_ONLY)."""
import hashlib
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
from pathlib import Path

from youtube import call, save, tags

ROOT = Path(__file__).resolve().parent.parent
TOKEN = ROOT / ".tiktok-token.json"  # refresh token (rotates on use), gitignored
TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
# must match a redirect URI registered in the app exactly; any https page works, only its URL (?code=...) is used
REDIRECT = os.environ.get("TIKTOK_REDIRECT_URI", "https://local.coderhour.com:8765/callback/")
API = "https://open.tiktokapis.com/v2/post/publish/"


def form(**fields):
    tok = call(TOKEN_URL, urllib.parse.urlencode(fields).encode(),
               {"Content-Type": "application/x-www-form-urlencoded"})[1]
    if "access_token" not in tok:  # TikTok answers 200 with an error body
        raise RuntimeError(f"TikTok token error: {tok}")
    TOKEN.write_text(json.dumps({"refresh_token": tok["refresh_token"]}))
    TOKEN.chmod(0o600)
    return tok["access_token"]


def auth():
    """Browser consent; TikTok needs an https redirect, so paste back the URL it lands on. Saves the refresh token."""
    key, secret = os.environ["TIKTOK_CLIENT_KEY"], os.environ["TIKTOK_CLIENT_SECRET"]
    verifier, state = secrets.token_urlsafe(48), secrets.token_urlsafe(16)
    # TikTok's PKCE wants the SHA256 hex digest, not base64url (their docs differ from RFC 7636)
    print("Open this URL, sign in with the TikTok account and allow access:\nhttps://www.tiktok.com/v2/auth/authorize/?"
          + urllib.parse.urlencode(dict(client_key=key, response_type="code", scope="user.info.basic,video.publish",
                                        redirect_uri=REDIRECT, state=state, code_challenge_method="S256",
                                        code_challenge=hashlib.sha256(verifier.encode()).hexdigest())))
    got = urllib.parse.parse_qs(urllib.parse.urlparse(input("Paste the full URL you were sent to: ").strip()).query)
    if "code" not in got or got.get("state") != [state]:
        sys.exit(f"denied: {got.get('error_description', got.get('error', ['no code / state mismatch']))[0]}")
    form(client_key=key, client_secret=secret, code=got["code"][0], grant_type="authorization_code",
         redirect_uri=REDIRECT, code_verifier=verifier)
    print(f"saved {TOKEN.name}")


def access_token():
    if not TOKEN.exists():
        raise RuntimeError("not authorized yet: run python3 tools/tiktok.py auth")
    return form(client_key=os.environ["TIKTOK_CLIENT_KEY"], client_secret=os.environ["TIKTOK_CLIENT_SECRET"],
                grant_type="refresh_token", refresh_token=json.loads(TOKEN.read_text())["refresh_token"])


def retry(what, fn, tries=3):
    """TikTok's hosts sometimes drop the connection (Errno 104); retry those, name the step if it still fails."""
    for i in range(tries):
        try:
            return fn()
        except (urllib.error.URLError, ConnectionError) as e:
            if isinstance(e, urllib.error.HTTPError) or i == tries - 1:
                raise RuntimeError(f"TikTok {what}: {getattr(e, 'reason', e)}") from None
            time.sleep(3 * (i + 1))


def api(token, path, body=None):
    r = retry(path, lambda: call(API + path, json.dumps(body or {}).encode(),
                                 {"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8"}))[1]
    if r.get("error", {}).get("code", "ok") != "ok":
        raise RuntimeError(f"TikTok {path}: {r['error']}")
    return r["data"]


def caption(meta):
    """Short title + hashtags from `short.tags` (3–5 targeted ones), else the publish tags (TikTok captions max 2200 chars; links aren't clickable)."""
    hashtags = " ".join("#" + "".join(w for w in t.title().split() if w.isalnum()) for t in meta["short"].get("tags") or tags(meta))
    return f"{meta['short']['title'].replace(' #Shorts', '')}\nPractice more at vantee.ai\n{hashtags}"[:2200]


def upload_short(slug):
    """Post short.mp4; saves short.tiktok_publish_id and a short.posts entry. Returns the publish id."""
    d = ROOT / "videos" / slug
    meta = json.loads((d / "meta.json").read_text())
    short = meta.get("short")
    if not short or not (d / "short.mp4").exists():
        raise RuntimeError("no short.mp4 / meta.json short")
    if short.get("tiktok_publish_id"):
        raise RuntimeError(f"short already on TikTok: {short['tiktok_publish_id']}")
    video = (d / "short.mp4").read_bytes()
    if len(video) > 64 << 20:  # ponytail: single-chunk upload; chunk it if shorts ever pass 64 MB
        raise RuntimeError("short.mp4 over 64 MB")
    token = access_token()
    creator = api(token, "creator_info/query/")  # required before every post; also says which privacy levels exist
    options = creator["privacy_level_options"]
    privacy = os.environ.get("TIKTOK_PRIVACY") or ("PUBLIC_TO_EVERYONE" if "PUBLIC_TO_EVERYONE" in options else "SELF_ONLY")
    if privacy not in options:
        raise RuntimeError(f"privacy {privacy} not allowed for this account; options: {options}")
    init = api(token, "video/init/", {
        "post_info": {"title": caption(meta), "privacy_level": privacy, "disable_comment": False,
                      "disable_duet": False, "disable_stitch": False,
                      "brand_organic_toggle": True},  # promotes our own brand (vantee.ai): "Promotional content" label
        "source_info": {"source": "FILE_UPLOAD", "video_size": len(video), "chunk_size": len(video), "total_chunk_count": 1}})
    retry("upload", lambda: call(init["upload_url"], video, {"Content-Type": "video/mp4",
                                 "Content-Range": f"bytes 0-{len(video) - 1}/{len(video)}"}, "PUT"))
    pid = init["publish_id"]
    url = f"https://www.tiktok.com/@{creator['creator_username']}"
    for _ in range(60):  # TikTok processes asynchronously; usually done well within a minute
        st = api(token, "status/fetch/", {"publish_id": pid})
        if st["status"] == "FAILED":
            raise RuntimeError(f"TikTok processing failed: {st.get('fail_reason')}")
        if st["status"] == "PUBLISH_COMPLETE":
            if st.get("publicaly_available_post_id"):  # sic; absent for private posts
                url += f"/video/{st['publicaly_available_post_id'][0]}"
            break
        time.sleep(5)
    meta = json.loads((d / "meta.json").read_text())  # re-read: the upload took a while
    meta["short"]["tiktok_publish_id"] = pid
    meta["short"].setdefault("posts", []).append({"platform": "TikTok", "url": url})
    save(d, meta)
    return pid


if __name__ == "__main__":
    if sys.argv[1:2] == ["auth"]:
        auth()
    elif sys.argv[1:2] == ["upload-short"] and len(sys.argv) == 3:
        print(upload_short(sys.argv[2]))
    else:
        sys.exit(__doc__)
