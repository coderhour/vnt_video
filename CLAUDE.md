# vnt_video

This is the video generation project for Vantee. The Vantee code repo is located at `/home/brad/code/vnt`.

## Layout

- `videos/<YYYY-MM-DD-slug>/` — one folder per finished video:
  - `meta.json` — `{"title", "description", "created": "YYYY-MM-DD", "question_id", "posts": [{"platform", "url", "published_at"}]}`
    (`question_id` = `<quiz bank file name>:<question id>`, e.g. `amc_practice_amc8_geometry_template:c1-010`,
    linking the video to its question in `/home/brad/code/vnt/priv/quiz_banks/`)
    (`posts` is filled in by hand after manually publishing, or by the site's "Publish to YouTube" button, which also
    writes `"youtube_id"`; setup in `tools/youtube.py`)
    Optional: `"status"`: `draft` (default) / `ready` / `fix` (+ `"fixes": ["…"]`), set from the site buttons; `"tags": [...]` overrides the
    default publish tags; `"contest": "AMC 8"|"AMC 10"` for videos with no `question_id` (the contest guides). Having `posts` means published.
  - `script.md` — narration / shot script
  - `video.mp4` (gitignored), optional `poster.jpg`
  - optional `short.mp4` (vertical teaser, `.claude/skills/math-short/`) + `"short": {"title", "description", "posts"}` in meta.json
- `studio/` — shared Remotion project (created on first video): `src/videos/<slug>/`, generated `public/<slug>/`.
- `.claude/skills/math-explainer/` — skill for AMC-style math explainer videos.
- `site/index.html` — preview page (single file, no build).
- `./start.sh [port]` — starts `tools/serve.py`, listening on all interfaces (default port 8000).
  Test: `cd tools && python3 test_serve.py`.

Publishing: YouTube via the site buttons (`tools/youtube.py`): video, video + short, or the short once the video is up
(its description links the video via `{full_video_url}`). "Republish short" uploads the current `short.mp4` as a NEW short (YouTube can't swap a file) and sets the old one
private (kept under `short.replaced`); its confirm dialog lists the impact.
Scheduling: each YouTube publish button opens a "Publish now / Schedule" dialog (local time; or `youtube.py upload <slug> <ISO time>`) uploads as private with
`status.publishAt`; YouTube publishes it at that time. The post gets `published_at` = that time and `"scheduled_at"` = when it was scheduled. Republish can't be scheduled. Full videos also go into the channel's AMC 8 / AMC 10
playlist and shorts into the "AMC 10 Shorts"-style playlist in challenge-number order (ids in `videos/playlists.json`, `meta.json` / `short` gets `playlist_id`; backfill: `python3 tools/youtube.py playlists`).
YouTube quiz Posts: no API, so the site has a "YouTube quiz post" copy row (question, 4 of the 5 choices with ✓ on the answer, ≤350-char explanation, video link; LaTeX → plain text via `youtube.plain`) to paste into Create → Post → Quiz.
China (Xiaohongshu / WeChat Channels): no domain or link on screen or in the text (both platforms throttle off-platform links).
`.claude/skills/math-explainer/scripts/render.sh <slug> - video|short cn` renders `video-cn.mp4` / `short-cn.mp4` (a `*-zh` slug always renders this way into `video.mp4` / `short.mp4`) with
`--props='{"cn":true}'` (`CN` in `lib/Brand.tsx`: logo without ".ai", CTA pill = logo only). Post text without links is under `meta.json` `"cn"`
(`{"video": {title, description}, "short": {…}, "posts": []}`). Post by hand and tick the platform's "AI-generated content" declaration (AI voice).
TikTok: post `short.mp4` by hand (copy the "TikTok caption" row, tick "Your brand"), then "Mark short on TikTok" saves the link to `short.posts`. The API path (`tools/tiktok.py`, setup in its docstring) only posts to private accounts until TikTok audits the app. Other platforms are manual. No stats automation.
Vantee app delivery (quiz review player, vnt change `quiz-video-explainer`): `python3 tools/export_vnt.py /home/brad/code/vnt [--slug S] [--dry-run]`
writes each ready/published English video's offline Remotion Player bundle (`studio/export/`) to `vnt/priv/static/video_explainers/<slug>/`,
its `explainer.json` to `vnt/priv/video_explainers/<slug>/`, and mp3 audio to `vnt/tmp/video_explainers/` (then `mix vnt.video_explainers.upload`
in vnt with the public-bucket key). Test: `cd tools && python3 test_export_vnt.py`. vnt never depends on this repo at runtime.
