# vnt_video

This is the video generation project for Vantee. The Vantee code repo is located at `/home/brad/code/vnt`.

## Layout

- `videos/<YYYY-MM-DD-slug>/` — one folder per finished video:
  - `meta.json` — `{"title", "description", "created": "YYYY-MM-DD", "question_id", "posts": [{"platform", "url"}]}`
    (`question_id` = `<quiz bank file name>:<question id>`, e.g. `amc_practice_amc8_geometry_template:c1-010`,
    linking the video to its question in `/home/brad/code/vnt/priv/quiz_banks/`)
    (`posts` is filled in by hand after manually publishing)
    Optional: `"status"`: `draft` (default) / `ready` / `fix` (+ `"fixes": ["…"]`), set from the site buttons; `"tags": [...]` overrides the
    default publish tags. Having `posts` means published.
  - `script.md` — narration / shot script
  - `video.mp4` (gitignored), optional `poster.jpg`
- `studio/` — shared Remotion project (created on first video): `src/videos/<slug>/`, generated `public/<slug>/`.
- `.claude/skills/math-explainer/` — skill for AMC-style math explainer videos.
- `site/index.html` — preview page (single file, no build).
- `./start.sh [port]` — starts `tools/serve.py`, listening on all interfaces (default port 8000).
  Test: `cd tools && python3 test_serve.py`.

Publishing is manual for now; no publish/stats automation.
