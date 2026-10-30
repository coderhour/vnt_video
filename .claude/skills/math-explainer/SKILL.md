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
    Explainer.tsx               the frame: scenes + voice audio + chapter pill + captions + Vantee avatar;
                                `at(scene, i, t)` = frame where line i starts (t = fraction into the line)
    grid.tsx                    dot grids, self-drawing polygons, step arrows, boxSquare(), boxSpots()
    Tex.tsx                     KaTeX (verified: fonts render in headless renders)
    PauseCard.tsx               "Pause & try it" countdown ring (optional tick SFX per second)
    anim.ts, theme.ts, fonts.ts easing helpers, Vantee colours, Nunito + Pacifico (wordmark only)
  src/videos/<slug>/            narration.json, verify.py, Composition.tsx (one component per scene id)
  src/Root.tsx                  register each video: `calculateMetadata={fromTimeline(SLUG)}`
  public/<slug>/                generated audio/*.wav + timeline.json, sfx/ (Freesound downloads + credits)
videos/<slug>/                  deliverable: video.mp4, poster.jpg, meta.json, script.md
```

`<slug>` = `YYYY-MM-DD-short-name`. The first video, `2026-10-29-dot-grid-squares`, is the reference
for how the scenes are built.

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

`--check` transcribes every WAV back and prints it next to the script line. Go through every
pair. A dropped, added or wrong word (especially a number) means you reword that line and re-run.
Only the changed lines get regenerated. Ignore digits vs words ("26" vs "twenty-six") and the
transcriber's spelling of "Vantee". If the user says the TTS *mispronounces* Vantee, write it as
"Van-tee" in the narration lines, and have the caption component show "Vantee" in its place.

Delivery style follows the official Gemini 3.8 TTS guidance
(https://ai.google.dev/gemini-api/docs/speech-generation): `tts.py` sends each line as a verbatim
transcript and puts the delivery in the `speech_metadata` `style` field. Default: voice `Achird`
("Friendly"), style "warm, encouraging and playful, speaking at a relaxed pace". Override
`voice` / `style` in `narration.json`, but keep the style a few words long: long styles drift.
- Never put stage directions in the line text, because they get spoken.
- For a moment in the line, use an inline angle-bracket tag: `<short pause>` before a reveal,
  `<long pause>`, `<laugh>`. Use them sparingly.
- CAPITALIZE a word for vocal emphasis ("the answer is NOT twenty-six").

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
- Avatar `priv/static/images/Vantee_avatar_point2x.png` in the corner while Vantee talks.
- Burned-in captions from each timeline line's `caption` (the text without TTS tags), big and readable. Math at ≥ 48 px.

### 6. Build
In `studio/src/videos/<slug>/Composition.tsx`:
- Read `timeline.json` (`staticFile`) in `calculateMetadata` to set `durationInFrames`.
- Put each scene in a `<Sequence from durationInFrames>`, and each line's `<Audio>` at its `from`.
- Drive animation timing from line frames so the visuals land on the words.
- Register the composition in the studio's `Root.tsx`.
- Check key frames with `npx remotion still --frame=N` while building. Don't render the whole
  video to look at one frame. Render a still near the end of every line (about 2 s each), tile 4 of
  them into one image with ffmpeg `xstack`, and look at every sheet.
- Layout traps found on the first video:
  - keep the stage above y ≈ 860, because the captions own the bottom;
  - give each piece of text its own slot so labels never overlap;
  - long totals must not wrap (the `Row` helper uses `nowrap`), so check that they fit the frame;
  - don't stack many semi-transparent shapes on one grid, because it reads as a tangle.
- SFX: a soft chime on each answer reveal, timed to the END of the line so it never covers the spoken number, and a quiet tick per countdown second. That's it. No
  game-style sounds (shotcraft S1). Keep it at about 0.2–0.3 volume under the voice.

### 7. Render and package
- `npx remotion render ... ../videos/<slug>/video.mp4`
- Normalise the loudness to YouTube's -14 LUFS (the raw render comes out around -19). Video is copied, not re-encoded:
  `ffmpeg -i video.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k out.mp4`
- `poster.jpg`: a still of the question scene (`ffmpeg -ss <sec> -i video.mp4 -frames:v 1 poster.jpg`).
- `videos/<slug>/meta.json`:
  ```json
  {"title": "Can You Find All 30 Squares? | AMC 8-Style Level 5",
   "description": "<2–3 kid-friendly lines>\n\n<chapter lines from tts.py>",
   "created": "YYYY-MM-DD",
   "source": {"bank": "amc_practice_amc8_geometry_template", "id": "c1-010", "difficulty": 5},
   "posts": []}
  ```
  `source` is how `pick_question.py` knows the question is used, because ids repeat across banks.

### 8. Independent review (required)
Send a fresh-context subagent the video, key frames, `narration.json`, the question JSON and
`verify.py`. Ask it to check:
1. **Math**: re-solve blind and re-run `verify.py`. Every step is valid and the variant's answer is right.
2. **Spoken vs shown**: the numbers and expressions match at the same moment, and nothing is misread.
3. **Kid test**: no unexplained jump, jargon or "obviously". The pacing leaves time to think.
4. **Visual and audio**: shotcraft's `final-review.md` and `aesthetic-rules.md` checklist, plus
   overlaps, clipped text, sync drift and loudness.

Fix the findings, then tell the user to preview at `./start.sh` → http://localhost:8000.
Publishing is manual. The user adds post links to `meta.json` → `posts`.
