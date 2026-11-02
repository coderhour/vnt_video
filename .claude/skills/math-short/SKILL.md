---
name: math-short
description: Make a vertical 30–60 s YouTube Short / Reel / TikTok teaser for a finished math explainer video (made with math-explainer), built from its question and its strongest visual, ending with a card that sends viewers to the full lesson. Use when the user asks for a short, a Shorts/Reels/TikTok version, or a marketing clip for an explainer video.
---

# Math short

One short = one finished explainer (`videos/<slug>/` with `video.mp4` and `poster.jpg`) cut down to a
**vertical 1080×1920, 30 fps, 35–55 s** teaser. Its only job: stop the scroll, give one satisfying "aha",
and make the viewer want the full lesson (second method, traps, variant).

Reference: `studio/src/videos/2026-10-29-triangle-in-square/short/` (narration.json + Short.tsx).
All rules from `.claude/skills/math-explainer/SKILL.md` still apply (correctness, naming, TTS spoken forms,
voice check, captions = speech, no early answer leaks, Vantee pronunciation, SFX volume). This file only adds what differs.

## Shape (6 scenes, ~10 lines)

| scene | time | what |
|---|---|---|
| `hook` | 0–6 s | The figure is on screen **from frame 0** (no fade-in from blank). A bold claim: "Most kids get THIS wrong", a wrong-looking answer crossed out, a surprising number. Big title at the top. |
| `question` | ~8 s | The question in one card, kid words, plus the figure and the choices (wrap to 2 rows). |
| `think` | 4 s | `kind: "pause"`, `hold: 3`, line "Pause and try it!", `Countdown` with ticks over the dimmed question. |
| `aha` (named per video) | 12–15 s | The ONE key idea of Solution 1, using the long video's best animation re-laid out vertically. 2–3 lines. |
| `reveal` | ~8 s | The answer pops (chime at the END of the answer line, confetti), plus one line of "why it's surprising". |
| `cta` | ~8 s | `FullLessonCard`: the long video's poster with a play button and its real length, 3 bullets of what the full lesson adds (only things it really contains), an arrow down to the link. Lines like "Why exactly that? The full lesson shows two neat ways, plus every trap." / "Tap the link below to watch it!" |

Always reveal the answer: a short that withholds it feels like clickbait. The pull to the full video is the
*why*: the exact working, the second method, the traps and the variant.

## Parallel builds (many shorts at once)

Every `Short.tsx` is bundled into the one shared Remotion project, so a syntax error or a missing import in ANY
short breaks every other builder's stills and renders. Keep it safe:
- Write each file whole (Write, not partial shell edits) and right after every write run
  `cd studio && npx tsc --noEmit -p . 2>&1 | grep "videos/<slug>/"`. Fix any error before doing anything else.
- Only touch your own `studio/src/videos/<slug>/` (adding `export` to its `Composition.tsx` is fine) and
  `studio/public/<slug>/short/`, `videos/<slug>/`. Never edit `lib/`, `Root.tsx` or another video. Need a shared
  change? Report it instead.
- No new maths: every number and claim comes from the long video's verified `narration.json` / `verify.py`.
- A Chinese long video (`"lang": "zh"` in its narration) gets a Chinese short: same `lang`, captions with digits.

## Steps

1. **Pick the aha.** Read the long video's `narration.json` and `Composition.tsx`. Choose the single visual that
   carries the solution. No full working in a short: one idea, then the result.
2. **Narration** → `studio/src/videos/<slug>/short/narration.json` (same format as the long one, no `chapter`s).
   Add `"style": "warm and upbeat, speaking at a lively pace, no laughing"`. ~10 lines, each short.
   Don't put "Vantee" mid-sentence (it was heard as "then he"). The brand is on screen anyway.
3. **Voice:** `python3 .claude/skills/math-explainer/scripts/tts.py <slug>/short --check` (the `<slug>/short` path
   works as is: audio + `timeline.json` go to `studio/public/<slug>/short/`, the script to `videos/<slug>/short/script.md`).
   Ignore its YouTube chapter warnings. Re-run until `voice check: all lines match`, then `name_check.py <slug>/short` if a line says Vantee.
4. **End-card poster:** `cp videos/<slug>/poster.jpg studio/public/<slug>/short/full.jpg`. Get the real length with
   `ffprobe -v error -show_entries format=duration -of csv=p=0 videos/<slug>/video.mp4` (m:ss on the card).
5. **Build** `studio/src/videos/<slug>/short/Short.tsx`, exporting `SLUG` and `Short`. `Root.tsx` registers it as
   `<slug>-short` at 1080×1920; don't edit Root.
   - Frame: `ShortFrame` from `lib/Short.tsx` (voice, captions, the Vantee.ai logo badge from `lib/Brand.tsx`). Inside it, `Stage` is 1080×1920.
   - Reuse the long video's drawing helpers: add `export` to the consts you need in its `Composition.tsx`
     (geometry, `Square`, `Label`, `CHOICES`, `CHIME`, `TICK`…) and import them. Don't copy-paste.
   - **Safe zone:** the platform UI covers the top ~200 px, the bottom ~340 px and the right ~160 px below y≈900.
     Keep the title at y≈300, the stage in y 300…1300, centred in x 60…920. Captions own y 1330…1580.
   - Text bigger than in the long video: titles 70–80 px, readouts 60+, maths ≥ 48 px. One focal point per scene.
   - Keep motion going: something moves or appears every 1–2 s, but never animate through invalid states.
6. **Check:** before rendering, confirm from `timeline.json` that the answer chip appears ON the spoken answer word
   (not after the line) and that any "Choice X" label refers to choices the question scene actually showed.
   Then  render a half-scale preview to the scratchpad
   (`npx remotion render src/index.ts <slug>-short <scratch>/p.mp4 --scale=0.5 --concurrency=2`, from `studio/`),
   grab ~14 frames with ffmpeg, tile them (`tile=7x2`) and look at every one: overlaps, safe zone, leaks of the answer.
7. **Render:** `.claude/skills/math-explainer/scripts/render.sh <slug> - short` (run_in_background, then wait on
   `videos/<slug>/short.render.done|failed`). It writes `videos/<slug>/short.mp4` at -14 LUFS.
8. **Meta:** add to `videos/<slug>/meta.json`:
   ```json
   "short": {"title": "<hook-style title, ≤ 60 chars> #Shorts",
             "description": "<1–2 lines>\n\nFull lesson with two solutions and every trap: {full_video_url}\n\n#math #amc10 #mathpuzzle",
             "posts": []}
   ```
   Keep the `{full_video_url}` token: publishing fills it with the full video's YouTube link. The site shows the
   short under the main video, with "Publish video + short" (full video first, then the short) and, once the full video
   is up, "Publish short". Both save `short.youtube_id` and `short.posts`. The API can't set a Short's
   **Related video** (the tappable link in the Shorts player), so set it to the full lesson in YouTube Studio after publishing.
