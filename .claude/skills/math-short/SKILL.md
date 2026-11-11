---
name: math-short
description: Make a vertical 30–40 s YouTube Short / Reel / TikTok teaser for a finished math explainer video (made with math-explainer): trap-first hook, its strongest visual, comment bait, word captions, SFX, and a vantee.ai pill over the answer. Use when the user asks for a short, a Shorts/Reels/TikTok version, or a marketing clip for an explainer video.
---

# Math short

One short = one finished explainer (`videos/<slug>/` with `video.mp4`) cut down to a
**vertical 1080×1920, 30 fps, 30–40 s** teaser. Its only job: stop the scroll, give one satisfying "aha",
get a comment, and send the viewer to vantee.ai to practice more.

**Reference: `studio/src/videos/2026-10-30-geometric-triangle/short/`** (narration.json + Short.tsx). Read both
before building; copy its structure, not its drawings.
All rules from `.claude/skills/math-explainer/SKILL.md` still apply (correctness, naming, TTS spoken forms,
voice check, captions = speech, no early answer leaks, Vantee pronunciation, SFX volume). This file only adds what differs.

## Shape (5 scenes, ~10 lines, 30–40 s)

| scene | time | what |
|---|---|---|
| `hook` | ~3 s | One line: **"AMC eight challenge! Think it's <trap>? Nope!"** (AMC ten for AMC 10). The series opener; for variety (no two neighbours in `challenge` order alike) it may instead be "AMC eight challenge! Is it <trap>? Nope!" or "AMC eight challenge! <trap>? That's the trap!", with the same stamp on the last word. The on-screen title mirrors the spoken words ("Is it <trap>?", "<trap>?"), since captions = speech. `<trap>` = the most tempting WRONG choice, from the long video's trap/`choice_notes` (never the answer). On screen from frame 0, no fade-in: a violet chip **"AMC 8 · Challenge #N"** (`N` = `short.challenge` in meta.json) at y≈280, title "Think it's <trap>?" (or the variant's words, 96 px) at y≈385, the main figure under it in a `PushIn`. On "Nope!" a big red rotated **NOPE** stamp pops over the figure with `SFX.buzz` (0.35). Never invent a statistic ("most kids…"). |
| `question` | ~8 s | The question card (54 px, kid words), the figure, the choices as big chips (letter 44 px, `Tex` 68 px), wrapped to 2 rows inside x 60…920. `SFX.whoosh` at 0. Captions stay on here too: muted viewers need every spoken line, and the card is shorter than the speech. |
| `think` | ~2.5 s | One line: "Comment your letter, then watch!" Same question body with the choices pulsing (`choicePulse`) plus `<CommentBubble />` (it brings the whoosh and ticks). No `kind: "pause"`, no `hold`, no `Countdown`. |
| `aha` (named per video) | 12–15 s | The ONE key idea, the long video's best animation re-laid out big. This is the longest scene, so break it up: zoom (scale ~1.4, `transformOrigin` on the spot) onto the decisive moment and back out, a counter/readout chip that changes as things happen, `SFX.click` on sweeps/steps (every 2nd–3rd item, 0.22–0.3) and `SFX.whoosh` on zoom moves. Something changes every 2–3 s. |
| `reveal` | ~9 s | Three lines: the answer ("…That's seventeen triangles!"), the trap ("Forty-four was the trap."), then **"Did you get <answer>? Tell me below!"**. The answer chip pops ON the spoken answer word with `SFX.riser` starting 31 frames before it (0.3), chime + confetti at the end of the line; `SFX.buzz` (0.2) on the trap line; `<CtaPill start={at(scene, 2)} />` (Practice more at + Vantee.ai logo) on the last line. `hold: 0.8`. **The last frame must show the same figure, at the same place, as frame 0** (so the loop back to the hook is a clean cut). |

No `cta` scene and no `FullLessonCard`: the pill over the reveal replaces the end card. Never say "tap the link below"
(Shorts and TikTok links aren't clickable) or promise the full lesson on vantee.ai (it isn't public there).
Always reveal the answer: a short that withholds it feels like clickbait.

`narration.json` header (exactly):
```json
"style": "warm and upbeat, speaking at a brisk, energetic pace, no laughing",
"line_gap": 0.15, "scene_tail": 0.4, "caption_digits": true,
```
`caption_digits` writes numbers in captions as digits ("27", "2025", "k²", "45k") while the voice reads the words.
Read every caption in `timeline.json`; fix odd ones (clock times "1:59", dice "one two", coordinates, fractions,
"zero one" → "01") with `"captions": {"<line text>": "<caption>"}` in narration.json (captions must still equal the speech).

Frame: `<ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} />`.
From `lib/Short.tsx` import `ShortFrame, CtaPill, CommentBubble, PushIn, Sfx, SFX, MUSIC, choicePulse`.
Sizes: titles 80–104 px, readouts/chips 60+ px, maths ≥ 56 px, board/grid cells ≥ 80 px; use the full width
(x 30…1050 above y≈900, x 60…920 below it). Word captions own y 1330…1500.

## Parallel builds (many shorts at once)

Every `Short.tsx` is bundled into the one shared Remotion project, so a syntax error or a missing import in ANY
short breaks every other builder's stills and renders. Keep it safe:
- Write each file whole (Write, not partial shell edits) and right after every write run
  `cd studio && npx tsc --noEmit -p . 2>&1 | grep "videos/<slug>/"`. Fix any error before doing anything else.
- Only touch your own `studio/src/videos/<slug>/` (adding `export` to its `Composition.tsx` is fine) and
  `studio/public/<slug>/short/`, `videos/<slug>/`. Never edit `lib/`, `Root.tsx` or another video. Need a shared
  change? Report it instead.
- No new maths: every number and claim comes from the long video's verified `narration.json` / `verify.py`.
- A Chinese long video (`"lang": "zh"` in its narration) gets a Chinese short: same `lang`, digits written in the
  narration itself (no `caption_digits`), `captions="box"` (word captions split on spaces), zh chip/title text
  ("AMC 8 · 挑战 #N", "你觉得是 <trap>？", "错！"), "评论你的选项，然后接着看！", "你答对 <answer> 了吗？在评论里告诉我！",
  and `<CtaPill text="练习更多题，就在 vantee.ai" />` (the text must end with "vantee.ai": that part becomes the logo chip).

## Steps

1. **Pick the aha and the trap.** Read the long video's `narration.json`, `Composition.tsx` and `verify.py`
   (and the old short if there is one). The trap = the most tempting wrong choice. One idea, then the result.
2. **Narration** → `studio/src/videos/<slug>/short/narration.json`, shape and header above. Spoken forms as in
   math-explainer ("two thousand twenty-five", "k squared"); the captions get digits automatically.
   Don't put "Vantee" in a line (the pill shows it).
3. **Voice:** `python3 .claude/skills/math-explainer/scripts/tts.py <slug>/short --check`. Ignore its YouTube chapter
   warnings. Re-run until `voice check: all lines match`. Read every `heard:` line too: a filler ("uh", "um") or a
   homophone the check let through ("whole sides" → "hole sizes") means delete that line's WAV (path in
   `timeline.json`) and re-run, or reword. Then check the total: `durationInFrames / 30` must be 30–40 s. (Shorter, 20–28 s variants are a planned test,
   since third-party length studies conflict; don't change this spec until the channel's own swipe-away data agrees.)
4. **Build** `studio/src/videos/<slug>/short/Short.tsx` (export `SLUG` and `Short`), scenes `hook`, `question`,
   `think`, `<aha>`, `reveal`. Reuse the long video's drawing helpers (add `export` in its `Composition.tsx`).
   - **Safe zone:** platform UI covers the top ~200 px, the bottom ~340 px and the right ~160 px below y≈900.
   - Keep motion going, but never animate through invalid states.
5. **Check:** the answer chip pops ON the spoken answer word (estimate the word's position in the line), and any
   "Choice X" refers to choices the question showed. Render a half-scale preview
   (`npx remotion render src/index.ts <slug>-short <scratch>/p.mp4 --scale=0.5 --concurrency=2`, from `studio/`),
   tile ~14 frames (`tile=7x2`) including frame 0 and the last frame, and look at every one: overlaps, safe zone,
   text size, answer leaks, the loop match.
6. **Render:** `.claude/skills/math-explainer/scripts/render.sh <slug> - short` (run_in_background, wait on
   `videos/<slug>/short.render.done|failed`). It writes `videos/<slug>/short.mp4` at -14 LUFS.
7. **Meta** in `videos/<slug>/meta.json` (keep existing `posts`/`youtube_id`/`challenge`):
   ```json
   "short": {"title": "<hook-style title, ≤ 60 chars> #Shorts",
             "description": "<1–2 lines>\n\nFull lesson with two solutions and every trap: {full_video_url}\n\n#math #amc10 #mathpuzzle",
             "challenge": N, "tags": ["AMC 8", "Math Challenge", "MathTok", "Math Puzzle"], "posts": []}
   ```
   The **title** (≤ 60 chars before ` #Shorts`) puts the trap hook first, then the topic in search words
   ("Think it's 81? Triangle around a radius-4 circle #Shorts"), never the answer.
   `challenge` = the short's number in its own series: AMC 8 and AMC 10 are separate series; a zh short reuses the number of its English twin (`<slug>-zh` ↔ `<slug>`),
   numbered in planned posting order, so a new short gets its level's highest number + 1. `tags` are the TikTok hashtags.
   Keep the `{full_video_url}` token: publishing fills it with the full video's YouTube link. The API can't set a
   Short's **Related video** (the only tappable link from a short to its full lesson), so after publishing set it in
   YouTube Studio and click "Mark Related video set" on the site (saves `short.related_set`).
   "Publish video + short" schedules the short 24 h after the video, so the lesson is live when the short points at it.
   Use "Republish short" rarely: YouTube treats delete-and-repost of Shorts as possible spam, and views start at zero.
