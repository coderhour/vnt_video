# vnt_video

This is the video generation project for Vantee. The Vantee code repo is located at `/home/brad/code/vnt`.

## Layout

- `videos/<YYYY-MM-DD-slug>/` — one folder per finished video:
  - `meta.json` — `{"title", "description", "created": "YYYY-MM-DD", "question_id", "posts": [{"platform", "url"}]}`
    (`question_id` = `<quiz bank file name>:<question id>`, e.g. `amc_practice_amc8_geometry_template:c1-010`,
    linking the video to its question in `/home/brad/code/vnt/priv/quiz_banks/`)
    (`posts` is filled in by hand after manually publishing, or by the site's "Publish to YouTube" button, which also
    writes `"youtube_id"`; setup in `tools/youtube.py`)
    Optional: `"status"`: `draft` (default) / `ready` / `fix` (+ `"fixes": ["…"]`), set from the site buttons; `"tags": [...]` overrides the
    default publish tags. Having `posts` means published.
  - `script.md` — narration / shot script
  - `video.mp4` (gitignored), optional `poster.jpg`
  - optional `short.mp4` (vertical teaser, `.claude/skills/math-short/`) + `"short": {"title", "description", "posts"}` in meta.json
- `studio/` — shared Remotion project (created on first video): `src/videos/<slug>/`, generated `public/<slug>/`.
- `.claude/skills/math-explainer/` — skill for AMC-style math explainer videos.
- `site/index.html` — preview page (single file, no build).
- `./start.sh [port]` — starts `tools/serve.py`, listening on all interfaces (default port 8000).
  Test: `cd tools && python3 test_serve.py`.

Publishing: YouTube via the site buttons (`tools/youtube.py`): video, video + short, or the short once the video is up
(its description links the video via `{full_video_url}`). Full videos also go into the channel's AMC 8 / AMC 10
playlist (ids in `videos/playlists.json`, `meta.json` gets `playlist_id`; backfill: `python3 tools/youtube.py playlists`).
Other platforms are manual. No stats automation.
Vantee app delivery (quiz review player, vnt change `quiz-video-explainer`): `python3 tools/export_vnt.py /home/brad/code/vnt [--slug S] [--dry-run]`
writes each ready/published English video's offline Remotion Player bundle (`studio/export/`) to `vnt/priv/static/video_explainers/<slug>/`,
its `explainer.json` to `vnt/priv/video_explainers/<slug>/`, and mp3 audio to `vnt/tmp/video_explainers/` (then `mix vnt.video_explainers.upload`
in vnt with the public-bucket key). Test: `cd tools && python3 test_export_vnt.py`. vnt never depends on this repo at runtime.
