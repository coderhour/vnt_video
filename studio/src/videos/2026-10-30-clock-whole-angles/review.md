# Review: 2026-10-30-clock-whole-angles

Reviewer: independent (step 8). Inputs checked: video.mp4 (403.9 s, 1920x1080, 30 fps), meta.json, script.md,
narration.json, verify.py, brief.md, Composition.tsx, timeline.json. 58 end-of-line frames in 15 contact sheets, plus
16 mid-line frames for the moving clocks (hands L1–L2, traps L3, test L2, formula L2).

**Must-fix: 1 · Should-fix: 4 · Nits: 6**

## 1. Math

- Blind solve: at 1:m the hour hand is at 30 + 0.5m and the minute hand at 6m, so the signed gap is 30 − 5.5m. The smaller
  angle is |gap|, or 360 − |gap| when that is over 180. Both forms are whole exactly when 5.5m is whole, which means m is even.
  That gives m = 0, 2, …, 58, so **30 (D)**. Matches the bank (correct_index 3).
- `verify.py` re-run: passes (`ok`). The hits are the even m. The formula/abs/360 rule matches brute force for all 60 minutes.
  The variant hits are m = 0, 10, …, 50 with angles 60, 5, 50, 105, 160, 145.
- Variant re-solved by hand: 60 − 11k (m = 2k) is a multiple of 5 ⇔ 5 | k ⇔ m ∈ {0, 10, …, 50}, so **6**. That is correct, and
  "360 − multiple of 5" keeps it a multiple of 5 for 2:50 (215 → 145).
- Traps, checked by hand. Each one is exactly true:
  - 60 = every minute.
  - 29 = even minutes 2..58.
  - 12 = m ∈ {0, 5, …, 55}, which is literally 12 times, and the wording is "what you would get if…" ✓.
  - 15 = even angles only. 30 − 11k is even ⇔ k even ⇔ m ≡ 0 mod 4, which gives 15. "360 − even" stays even. "Nineteen" (1:02) is a
    real odd whole angle ✓. The wording is "what you'd get if…" ✓.
- Worked examples: 1:01 → 24.5 ✓, 1:20 → −80 → 80 ✓, 1:40 → 190 → 170 ✓, 5.5×2 = 11 ✓, 5.5×3 = 16.5 ✓, 2:10 → 5 ✓.

### MUST-FIX
1. **Recap L0 (≈383.7–392 s, frame 391.8): the on-screen formula `angle at 1:m = 30 − 5.5m` and the line "Write the angle as a
   formula in the minutes: thirty minus five and a half m" are false for most m.** At 1:20 that "angle" is −80, and at 1:40 it is
   −190 (the real angles are 80° and 170°). The body of the video carefully calls it the **gap** and then fixes the sign and the
   over-180 case. The recap undoes that.
   *Fix:* show `\text{gap} = 30 - 5.5m` (optionally with a small muted sub-line "drop the minus · over 180° → 360 minus"). Reword
   the line to "Here's the big idea. Write the gap between the hands as a formula in the minutes: thirty minus five and a half m."
   Then re-generate the TTS for this one line.

## 2. Spoken vs shown

Clock hands are correct at every sampled moment. The hour hand always sits between the numbers by 0.5°/min:
1:01, 1:10, 1:20 (≈40°), 1:40 (≈50°), the 1:00→1:55 trap-12 sweep, 1:02 (19°), 2:00 (at the 2) and 2:10 (just past the 2).
The arcs are on the smaller side, except where the 190° big side is shown on purpose (test L2), and it then flips to 170° ✓.
On-screen numbers match the speech in every line. The answer is first shown at count L2 ("60 ÷ 2 = 30 pairs"), which is the
same moment the voice says "thirty pairs". The answer badge comes at L3. No counter passes 12/15/29/30 early ✓. The variant's
6 is not shown as a count before "That's six times" ✓.

### SHOULD-FIX
2. **Traps L3 (≈273.7–279.6 s): the grid runs ahead of the clock.** The chips light at `l(3) + m*2` frames, so 1:55 lights
   about 3.7 s in. The clock steps at `l(3, 0.08 + 0.075k)`, so it reaches 1:55 about 4.9 s in. At 277.0 s the grid has lit
   through 1:45 while the clock still shows about 1:35.
   *Fix:* drive both from the same schedule, i.e. light chip 5(k+1) when the clock lands on it
   (`RED_ON(ease(f, l(3, 0.08 + 0.075*(m/5 - 1)) + 8, 8))`, with 1:00 lit at the start).

## 3. Kid test

3. **should-fix — variant-answer L3→L4 (≈348–363 s):** "a multiple of eleven that is ALSO a multiple of five. That's zero, then
   fifty-five, then one hundred ten… They come every ten minutes." This jumps over two steps: why 55 (11 × 5), and why "every
   ten minutes" (5.5 × 10 = 55).
   *Fix:* add a small row `11 \times 5 = 55 = 5.5 \times 10`, or reword L4 to "Those are multiples of fifty-five: zero,
   fifty-five, one hundred ten… And five and a half times ten is fifty-five, so they come every ten minutes." Re-TTS if reworded.
4. **should-fix — hands L4 (≈236–243 s): the notation `whole − (….5) = not whole` renders as "( . . . .5)"**, which a kid can't
   read. *Fix:* use `\text{whole} - \text{(something)}.5 = \text{not whole}`, or `\text{whole} - 30.5 = \ldots .5`, to match
   the spoken "something and a half".
- nit — speeds L2: "moves one number, thirty degrees". Where the 30 comes from is not said.
  *Fix:* a muted sub-line `360° ÷ 12 = 30°` under the wedge (no new narration needed).
- nit — formula L2 (≈101–109 s): the voice says "After m minutes, it has moved half a degree for each minute", but the clock
  stays frozen at 1:00 until L3 jumps to 1:10.
  *Fix:* creep both hands from 1:00 to 1:10 during L2 (hour hand 30° → 35°) so the movement is seen.
- Pacing is fine (about 7 s per line, two pause cards of 10 s and 12 s). No jargon. "smaller angle", "whole" and "gap" are all
  shown before they are used.

## 4. Visual / audio

5. **should-fix — time-chip labels are under 48 px.** The TimeGrid default `font = 36`, and the traps grid uses `font = 32`.
   These are the main figure in asked, count, hands, traps, variant-answer and recap, and the skill counts figure labels as maths
   (≥ 48 px). *Fix:* use `font = 46–48` with `ch ≈ 70`. The default `cw = 145` fits "1:00" at 48 px. The traps grid
   (`cw = 108`) needs `cw ≈ 120, colw ≈ 128`, and the trap clock moves to about cx 1660 / R 170. Re-check that it stays clear
   of the "1:02 is whole too" pill.
- nit — variant-answer L0–L4 (326–363 s): every row hugs the top-left and the right half is empty for about 35 s, with no clock.
  *Fix:* keep the 2:00 clock on the right (as in the variant scene), or centre the column.
- nit — the try-card prompt (42 px) and the "degrees gained per minute" helper (38 px) are under 48. They are readable, but
  could go up to 48 / 44.
- nit — count L3: the confetti flies over the answer chips. It is acceptable as the one strong beat, but it could be masked
  away from the chips.
- Captions: all ≤ 2 lines. No clipping or overlaps found in the 58 end-of-line frames. The watermark is static ✓.
- Sync: the speech onset of every line is 0.09–0.45 s after its timeline `from`, which is the constant TTS lead-in. There is no
  drift from start to end ✓.
- Loudness: ebur128 gives I = **−14.7 LUFS** (target ≈ −14, OK) and LRA 5.9 LU.
- nit: true peak is **−1.2 dBFS**, slightly over the −1.5 ceiling. *Fix:* re-run loudnorm with `TP=-2`, or `I=-14` in two-pass
  mode, if it is re-rendered anyway.

## 5. Voice (`tts.py --check`, re-run after the "1:00" normalizer change)

The first run crashed on the traps L5 line with `KeyError: 'candidates'` (the transcription API returned no candidates, which is
transient). The second run finished: 58 lines and 2 MISMATCH flags. The "1:00" → "one o'clock" lines are now all clean ✓.

- **formula L4 — flag `and -> -`.** Heard (twice): "gains 6 - 1/2. That's 5 1/2° per minute." Both listens are identical and
  say the same words in digits: "six minus a half", "five and a half". The normalizer doesn't map the mixed number "5 1/2" to
  "five and a half", and it reads "-" between numbers as a minus sign it can't match to "minus a". **Verdict: false positive.
  No audio change.** *Fix (tool):* teach the normalizer `N 1/2` → "N and a half" and `- 1/2` → "minus a half".
- **variant-answer L3 — flag `alsoa -> also a`.** Heard (twice): "…a multiple of 11 that is also a multiple of 5." The audio is
  correct. The script side normalized "ALSO a" to "alsoa", so the caps-emphasis handling eats the space after an all-caps word.
  **Verdict: false positive, a tts.py normalizer bug.** *Fix (tool):* lowercase the caps words without stripping the space that
  follows them. The same pattern on traps L5 ("AND an odd minute") passed, so the bug may be specific to a word followed by a
  one-letter word.
- Info, not flagged: test L0 had "minus" → "-" transcriber noise, clean on the 2nd listen. "Vantee" is heard as
  "Avanti"/"Vanti" at intro L2 and recap L2. That is a known proper-noun transcription issue, and the line was not flagged.
