---
name: math-explainer
description: Make a 16:9 English explainer video in which Vantee, a friendly math tutor, walks a kid through one hard AMC 8 / AMC 10-style question (difficulty 4–5) from the Vantee quiz bank, showing every solution, the common traps and a variant, with animated diagrams, Gemini TTS narration and Remotion via video-shotcraft. Use when the user asks for a math explainer, a math question video, or a video for a quiz-bank question.
---

# Math explainer video

One video = one hard question, explained so a 10–14 year old can follow it and then solve the
same kind of question alone. The tutor is **Vantee**: warm, patient, a little playful.

## Ground rules

- **Correctness is non-negotiable.** Bank questions were auto-reviewed by an LLM, not a human.
  Never script a solution you haven't verified (step 2). If your answer disagrees with
  `correct_index`, stop and report the bank bug to the user. Don't make the video.
- **Naming:** say "AMC 8-style" / "AMC 10-style". These are Vantee's own questions, so never present
  one as a real AMC problem (no year or problem number, no MAA logo). The tutor is "Vantee". Never
  use "Mila" (a retired name). "Vantee AI" is only a byline.
- **English, 1920×1080, 30 fps, about 4–7 minutes.**
- Paths: Vantee repo `/home/brad/code/vnt` (bank: `priv/quiz_banks/amc_practice_amc{8,10}_*.json`),
  scripts in `.claude/skills/math-explainer/scripts/` (run from the project root), video-shotcraft at `~/.claude/skills/video-shotcraft`.

## How to use video-shotcraft here

video-shotcraft is built for product promos. **Do not run its intake**: skip the Ink Press,
autonomous and co-creation mode question, the template route, page captures, the product brief,
the workbench step and its wrap-up (author shout-out, showcase, JianYing). Use only:

- `assets/lib/` components (Caption, helpers…): copy the ones you need into `studio/src/lib/`.
- `references/shots/` as motion vocabulary for the hook, chapter transitions and the answer reveal.
  Resolve card names via `gallery/api/library.json`, and read the card plus its exact demo TSX
  before adapting it (shotcraft core rule 6).
- `references/sound-design.md` + `references/sfx-sourcing.md` for light SFX (reveal, tick, pop).
  No background music for now (the user decided this). Voice and light SFX only.
- `references/aesthetic-rules.md` + `references/final-review.md` for QA.
- Deterministic rendering: no `Date.now()` / `Math.random()`, only seeded randomness.

## Project layout

```
studio/                         shared Remotion project for all explainers (already set up)
  src/lib/                      shared pieces, reuse before writing new ones:
    Explainer.tsx               the frame: scenes + voice audio + chapter pill + captions + static Vantee logo watermark;
                                `at(scene, i, t)` = frame where line i starts (t = fraction into the line)
    grid.tsx                    dot grids, self-drawing polygons, step arrows, boxSquare(), boxSpots()
    Tex.tsx                     KaTeX (verified: fonts render in headless renders)
    PauseCard.tsx               "Pause & try it" countdown ring (optional tick SFX per second)
    ui.tsx                      Text, Pill, Row, Answer (chime prop), Confetti, Mark (highlight sweep), Check, Choices (any nodes, e.g. <Tex>)
    anim.ts, theme.ts, fonts.ts easing helpers, Vantee colours, Nunito + Pacifico (wordmark only)
  src/videos/<slug>/            narration.json, verify.py, Composition.tsx (one component per scene id)
  src/Root.tsx                  auto-registers every videos/*/Composition.tsx (exports SLUG + Video)
  public/<slug>/                generated audio/*.wav + timeline.json, sfx/ (Freesound downloads + credits)
videos/<slug>/                  deliverable: video.mp4, poster.jpg, meta.json, script.md
```

`<slug>` = `YYYY-MM-DD-short-name`. References for how scenes are built: `2026-10-29-dot-grid-squares`
(counting on a grid) and `2026-10-29-triangle-in-square` (geometry + algebra: maths-coordinate plane
with y up, a live graph driven by the same formula as verify.py, equation rows on a right panel).
Copy the two sfx files and `FREESOUND-CREDITS.md` into each new `public/<slug>/sfx/`, since credits travel with the video.

## Model routing

The main session orchestrates and does the thinking. Spend Opus where mistakes are costly and Sonnet where the work is bulky:

- **Step 1**: no model needed beyond running `pick_question.py`.
- **Steps 2–3 (solve, verify, script)**: do these in the main session, which should be Opus. If the session
  runs on a smaller model, hand steps 2–3 to an Agent with `model: "opus"`.
- **Steps 4–7 (voice, scenes, render, package)**: spawn ONE Agent with `model: "sonnet"`. Give it the slug and
  tell it to read this SKILL.md and follow steps 4–7. `narration.json` and `verify.py` are the contract:
  the builder must not change any maths or narration meaning. It may reword a line only when TTS mishears it,
  and it must list every reworded line in its report. In the brief, list the key visuals for each scene: what must be
  drawn or highlighted on which line (angle marks, heights, matching sides, the sums on trap cards). The builder
  won't infer teaching visuals the script only implies. Check that any figure coordinates you give don't mislead
  (e.g. diagonals that happen to be perpendicular).
- **Step 8 (review)**: the reviewer Agent runs with `model: "opus"`. Send the fixes it finds back to the
  Sonnet builder (SendMessage), or do small ones yourself.

**Parallel builds without stalls** (a 10-video batch lost hours to agents that went idle):
- A subagent that ends its turn "waiting for" its own background job is never woken. Builders must not end a turn
  while their own work runs: run `tts.py --check` in the foreground (timeout 600000, re-run if it times out, because
  cached lines are skipped), and wait for renders with the blocking loop in step 7.
- What parallelises: TTS, scene writing and stills (cheap). What doesn't: full renders, which use about 4 cores each.
  `render.sh` queues them for 2 slots, so builders never `ps`-check or wait by hand.
- Orchestrator: when a builder's notice says "waiting on its own background work", check its `videos/<slug>/render.*` markers
  and whether `render.log` is still growing (`stat -c %y`). Don't trust `ps` from the orchestrator: its sandboxed shell can't see
  the builders' processes, so a busy queue looks dead. Never start a render for a builder's slug; nudge the builder instead.

## Workflow

### 1. Pick the question
If the user didn't name one, run `python3 .claude/skills/math-explainer/scripts/pick_question.py [--contest amc8|amc10] [--figure]`
(unused, difficulty ≥ 4, already-made videos excluded) and propose 3 candidates. For each, give
one line on why it teaches well: a visual idea, more than one approach, a classic trap. Let the
user choose. Read the full question with `--show <bank>:<id>`.

### 2. Solve and verify (before writing any script)
- Solve it yourself, independently of the bank's `explanation`.
- Verify in Python: brute force wherever possible (digit searches, counting, small grids,
  probabilities by enumeration), otherwise check numerically. Compare with `correct_index`.
- Find **every reasonably kid-friendly solution** (usually 2, sometimes 3). Order them: the most
  intuitive one first, then the clever or fast one.
- Design the **variant**: same `key_idea`, changed numbers or a small twist, so the kid reuses the
  method rather than the answer. Verify its answer the same way.
- Keep the verification code in `studio/src/videos/<slug>/verify.py` so the reviewer can re-run it.

### 3. Lesson script → `studio/src/videos/<slug>/narration.json`
Structure (each bullet is a scene, and **bold** = starts a YouTube chapter):
1. **Intro**: hook in under 10 s (a surprising fact, or "most kids get 26 here…"), then "I'm Vantee".
2. **The question**: show it in full with the figure. Read it aloud, plainly.
3. **What are we asked?**: highlight the key facts and the goal on screen. Restate them in kid words.
4. **Try it yourself**: pause card (`kind: "pause"`, `hold: 10`, countdown). "Pause the video
   and give it a go. I'll wait!"
5. **Solution 1**: the intuitive way, step by step, one idea per step.
6. **Solution 2** (and 3): the clever way. End with "when would you pick this one?"
7. **Common traps**: from the bank's `choice_notes`. Show why each wrong choice is tempting.
8. **Your turn: a variant**: state it, pause card, then a short worked answer.
9. **Recap**: the `key_idea` as one memorable sentence, plus a cheerful sign-off from Vantee.
   On screen the sign-off line is `<SignOff start={at(scene, <last line>, 0.1)} text="Keep exploring!" />` (`lib/Brand.tsx`):
   a full-screen Vantee.ai card, so don't lay out your own "Vantee" wordmark there.

Tutor voice:
- Short sentences, about 15 words max. Talk *to* the kid ("Let's…", "Notice that…", "What if…?").
- Never use "obviously", "clearly", "simply" or "it's easy". Name each strategy ("let's make a list",
  "work backwards"). Celebrate small wins. One gentle joke or analogy per section is plenty.
- **Write the spoken form.** TTS mangles LaTeX, so write "two to the tenth", not `2^{10}`, and
  "A B" for segment AB. Put the LaTeX on screen instead.
- Every number or expression the voice says must be on screen at that moment, and the reverse.
- Rules the kid will remember must be exactly true. "A 3-wide box hides 3 squares" is false, because it
  holds 14 upright ones. Say "holds 3 squares that fit it snugly". Re-read every recap or rule line as
  a skeptic.
- Direction words must match the screen. Screen y grows downward, so a side drawn going right and
  down is "one across, one down".
- Explain EVERY wrong choice, including ones the bank's `choice_notes` skip. Even a short "and 40 is
  just too many" closes the gap.

`narration.json` format (read by `.claude/skills/math-explainer/scripts/tts.py`):
```json
{"title": "...", "fps": 30,
 "scenes": [
  {"id": "intro", "chapter": "Intro", "lines": ["Here's a puzzle that tricks most kids.", "I'm Vantee..."]},
  {"id": "try1", "chapter": "Try it yourself", "kind": "pause", "lines": ["Pause the video and give it a go!"], "hold": 10},
  {"id": "sol1-step2", "lines": ["..."], "hold": 1.5}
 ]}
```
`hold` = extra seconds after the scene's last line (for an animation to finish or to let a
result breathe). Only the scenes that start a chapter carry `chapter`.

### 4. Voice
`python3 .claude/skills/math-explainer/scripts/tts.py <slug> --check` (needs `GOOGLE_API_KEY`; model `gemini-3.8-flash-tts`). This
creates one WAV per line (unchanged lines are cached), `studio/public/<slug>/timeline.json` and
`videos/<slug>/script.md`, and prints the chapter list. Fix any chapter warnings (YouTube needs
≥ 3 chapters, the first at 0:00, each ≥ 10 s).

**"Vantee" is always pronounced /ˈvæn.ti/ (VAN-tee).** Write plain "Vantee" in narration, never a respelling.
Gemini TTS has no IPA or SSML field, so `tts.py`'s `PRONOUNCE` map adds `Pronounce the name "Vantee" as
/ˈvæn.ti/ …` to the `speech_metadata.style` of every line that says the name. The hint is never spoken.
It was right in 4 of 4 takes, where the "Van-tee" spelling got 2 of 4 ("Vantech", "Ventay").
Add any other hard name to `PRONOUNCE` the same way.

Delivery style follows the official Gemini 3.8 TTS guidance
(https://ai.google.dev/gemini-api/docs/speech-generation): `tts.py` sends each line as a verbatim
transcript and puts the delivery in the `speech_metadata` `style` field. Default: voice `Achird`
("Friendly"), style "warm and encouraging, speaking at a relaxed pace, no laughing" ("playful" made it laugh;
the user doesn't want laughs). Override
`voice` / `style` in `narration.json`, but keep the style a few words long: long styles drift.
- Never put stage directions in the line text, because they get spoken.
- For a moment in the line, use an inline angle-bracket tag: `<short pause>` before a reveal,
  `<long pause>`. Use them sparingly. No `<laugh>`.
- CAPITALIZE a word for vocal emphasis ("the answer is NOT twenty-six").

### 4b. Verify the voice (required, after every generation)
The TTS is generative, not a word-by-word reader: it adds, drops and changes words. "If you got
fifty" came out as "fifty PERCENT", "Try" as "Tried", and some takes had laughs. So after **every**
`tts.py` run, before building or rendering:

1. Run `tts.py <slug> --check`. It transcribes every WAV (a flagged line is transcribed a second time and only counts if it fails again, because transcriber slips vary run to run) with `gemini-3.8-flash`, diffs it word by
   word against the script (digits vs words, `2x2`, `+`, `*`, `%`, punctuation and the spelling of
   "Vantee" are normalized away) and prints `MISMATCH: script -> heard` lines. A laugh shows as
   `- -> LAUGH`. It exits 1 if any line mismatches.
2. Treat every MISMATCH as a real error in the audio. **Never dismiss one as a transcriber quirk.**
   Reword the line so it is unambiguous: give a bare number its noun ("all fifty squares"), avoid
   words that blur ("Try" → "Use") and avoid a weak first word ("And one big…" → "Last, one big…").
   Then re-run. Only changed lines are regenerated.
3. Repeat until it prints `voice check: all lines match`. If the check flags a line that you are
   sure is right after re-transcribing it twice, list it for the user rather than skipping it silently.
4. Re-copy the chapter times into `meta.json` whenever a line changes, because timings shift.
5. Run `python3 .claude/skills/math-explainer/scripts/name_check.py <slug>`. `--check` normalizes the spelling of "Vantee"
   away, so it can't hear VON-tee or VEN-tee (4 of 10 videos in batch 3 had one). For a BAD line, delete its WAV and re-run
   `tts.py --check`, which regenerates only that line. Repeat until every line is ok.

### 5. Storyboard and animation
The visuals must *explain*, not decorate. Plan each scene's visual from the math:
- **Geometry:** the bank's `figure` is an inline SVG. Use it as the base, then highlight, draw
  auxiliary lines, shade regions and slide pieces to show equal areas.
- **Counting:** build the list or tree on screen as it's counted, grouping cases with color.
- **Algebra / number theory:** equations morph term by term (moved terms travel, cancelled
  terms fade). Use blocks or grids for divisibility and remainders.
- Counting many copies: slide ONE shape through its spots, leave faint ghosts and show a ×n
  counter (`Slide` + `slideCount` in the reference video). Never pop all the copies in at once, and
  never draw slightly inset copies: overlapping outlines turn into a mesh nobody can count.
- Never animate through invalid states. If corners must sit on dots, step from dot to dot. A smooth
  tween shows shapes that don't count.
- Pause card: big countdown ring, the question still visible, calm.
- The answer reveal and the "aha" moment get the one strong motion beat. Use shotcraft cards for
  these and for chapter transitions only.

Visual language follows Vantee (`/home/brad/code/vnt/DESIGN.md`):
- Font Nunito. Primary `#0cc281`, secondary `#7b61ff`, text `#333333`, light background.
- Error `#ef4343` for traps, success `#21c45d` for correct answers.
- Vantee leaf logo (`priv/static/images/logo.svg` → `studio/public/brand/logo.svg`) bottom-left as a static watermark. No motion. Not the mascot avatar.
- Burned-in captions from each timeline line's `caption` (the text without TTS tags), big and readable. Math at ≥ 48 px.

### 6. Build
In `studio/src/videos/<slug>/Composition.tsx`:
- Read `timeline.json` (`staticFile`) in `calculateMetadata` to set `durationInFrames`.
- Put each scene in a `<Sequence from durationInFrames>`, and each line's `<Audio>` at its `from`.
- Drive animation timing from line frames so the visuals land on the words.
- Export `SLUG` and `Video` from the Composition.tsx. `Root.tsx` registers every `videos/*/Composition.tsx` automatically; don't edit it.
- Check key frames with `npx remotion still --frame=N` while building. Don't render the whole
  video to look at one frame. Render a still near the end of every line (about 2 s each), tile 4 of
  them into one image with ffmpeg `xstack`, and look at every sheet.
- Layout traps found on the first video:
  - keep the stage above y ≈ 860, because the captions own the bottom;
  - give each piece of text its own slot so labels never overlap;
  - long totals must not wrap (the `Row` helper uses `nowrap`), so check that they fit the frame;
  - don't stack many semi-transparent shapes on one grid, because it reads as a tangle.
- Layout traps found on the second video:
  - KaTeX rows get wide fast: keep one idea per row, and check that the longest row ends before x ≈ 1880;
  - place answer badges and pills last, in empty space, and re-check them against every row of the scene;
  - labels on figures and answer choices are maths too, so keep them at 48 px or more;
  - in algebra, never skip a step the voice skips over: put the in-between row on screen
    (x² − 8x + 4 = 0 before (x − 4)² = 12), and show each "is the same" claim with its working;
  - claims in the narration must be exactly true: "no area formula" was wrong when the method still used ½ × base × height.
- For algebra lines, say "root three" consistently, and never speak a decimal. Say "about forty-six
  percent" and put 0.464 on screen. A single-letter variable (x, t) reads fine. `--check` maps √, ², ^2, °,
  −, /, =, +, ×, % and contractions, so a transcript like "x = 2 - √3" matches "x equals two minus root three".
- Lessons from the 10-video batch:
  - **Length:** about 4.5 s per line, so about 58 lines gives about 6:50. Over 60 lines goes past 7 min.
  - **TTS:** avoid plural letter names ("two X's" blurs). Say "the letter X four times".
    Say fractions as "one over two", not "one half of". When a line mishears, reword it rather than retrying it.
  - **KaTeX:** `\frac` shrinks inline. Use `\dfrac` and check that the digits stay ≥ 48 px, including in answer chips and side notes.
  - **Timing:** a small `cue(scene, line, offset)` helper that returns a line's frame keeps visuals on the words.
  - `ease()` / `interpolate` crash on `Infinity`. Clamp open-ended ranges.
  - **Contact sheets:** render at half scale (`--scale=0.5`) and tile with ffmpeg. It is much faster than full-size stills.
  - Never run `npx remotion bundle --help`, because it hangs.
  - **Kid jumps reviewers flagged:** every count needs its "where from" ("six choices for the first, five for the second").
    A rule needs its reason ("the other side, or the streak grows"). A repeated number needs showing, so it doesn't look like a coincidence.
- Lessons from batch 2:
  - Write numbers out in full ("one hundred ninety-five", not "one ninety-five"). Don't use S as a variable, because "21S" reads as a plural.
  - Don't start a line with a bare label ("Twos:"). Keep "Ann" away from the start of a line, where it is heard as "and".
  - Keep each caption to 2 lines (under about 100 characters). A 3-line caption grows up over the figure.
  - Wrong-choice stories the bank doesn't explain must be worded as "what you'd get if…", never stated as fact.
  - Never let an animation show the answer (or a choice value) before the reveal, e.g. a sliding readout passing through 18.
  - Full renders go through `scripts/render.sh` only (step 7). `rtk` hides Remotion's output, which led to duplicate renders.
- SFX: a soft chime on each answer reveal, timed to the END of the line so it never covers the spoken number, and a quiet tick per countdown second. That's it. No
  game-style sounds (shotcraft S1). Keep it at about 0.2–0.3 volume under the voice.

### 7. Render and package
- One command does the render, loudnorm and poster. Start it with `run_in_background`:
  `.claude/skills/math-explainer/scripts/render.sh <slug> <poster_seconds>`. It waits for one of 2 render slots, logs to
  `videos/<slug>/render.log`, and ends with `render.done` or `render.failed`. Then block in the foreground, repeating until a marker appears:
  `timeout 590 bash -c 'until [ -e videos/<slug>/render.done ] || [ -e videos/<slug>/render.failed ]; do sleep 15; done'`
- What the script does, for reference: normalise the loudness to YouTube's -14 LUFS (the raw render comes out around -19). One loudnorm pass overshoots the -1.5 dB true peak, so the limiter (0.8 ≈ -1.9 dB, headroom for AAC) caps it. Video is copied, not re-encoded:
  `ffmpeg -i video.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.8:level=false -ar 48000 -c:a aac -b:a 192k out.mp4`
- `poster.jpg`: a still of the question scene (`ffmpeg -ss <sec> -i video.mp4 -frames:v 1 poster.jpg`).
- `videos/<slug>/meta.json`:
  ```json
  {"title": "Can You Find All 30 Squares? | AMC 8-Style Level 5",
   "description": "<2–3 kid-friendly lines>\n\n<chapter lines from tts.py>",
   "created": "YYYY-MM-DD",
   "question_id": "amc_practice_amc8_geometry_template:c1-010",
   "posts": []}
  ```
  `question_id` = `<bank file name without .json>:<question id>`, the same key `pick_question.py`
  prints. It is **required**: it links the video to its quiz-bank question (ids repeat across banks,
  so the bank name is part of it), and `pick_question.py` uses it to skip used questions.

### 8. Independent review (required)
Send a fresh-context subagent (`model: "opus"`) the video, key frames, `narration.json`, the question JSON and
`verify.py`. Ask it to check:
1. **Math**: re-solve blind and re-run `verify.py`. Every step is valid and the variant's answer is right.
2. **Spoken vs shown**: the numbers and expressions match at the same moment, and nothing is misread.
3. **Kid test**: no unexplained jump, jargon or "obviously". The pacing leaves time to think.
4. **Visual and audio**: shotcraft's `final-review.md` and `aesthetic-rules.md` checklist, plus
   overlaps, clipped text, sync drift and loudness.

Fix the findings, then tell the user to preview at `./start.sh` → http://localhost:8000.
Leave `meta.json` without `status` (= draft). The user reviews it and clicks "Mark ready to publish" or "Needs fix" on the site.
When asked to fix a video, read its `fixes` list, fix it, then set `status` back to `draft`.
Publishing is manual. The user adds post links to `meta.json` → `posts`.
