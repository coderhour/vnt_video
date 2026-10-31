# Review: 2026-10-30-ladder-over-box

Reviewer: independent (step 8). Inputs checked: video.mp4 (359.4 s, 1920x1080@30), meta.json, script.md,
narration.json, verify.py, brief.md, Composition.tsx, timeline.json. I took contact sheets at the end of
each line and 0.4 s after each line starts (solution, traps and variant scenes).

**Must-fix: 0 · Should-fix: 5 · Nits: 7**

## Checks that passed

- **Maths**: solved blind first. Foot at (0,0), corner (9,12), slope 4/3, wall at x = 21 gives height 28,
  and √(21² + 28²) = 35, which is choice D (index 3), as the bank says. The pieces 9-12-15 and 12-16-20
  give 15 + 20 = 35. Variant: slope 8/6 = 4/3, wall at 15, height 20, length 25, pieces 10 + 15. `verify.py`
  reruns clean ("ok"). Every step in the narration is valid.
- **Answer timing**: 35 shows only as a choice chip until pythag L5 ("35 × 35 = 1225"). The badge comes at
  L6. 20 and 25 are not shown in the variant question or on the try2 card.
- **Spoken vs shown**: on every sheet, the numbers on screen match the line being spoken. Captions never
  go past 2 lines.
- **Loudness**: integrated −14.5 LUFS, true peak −0.9 dBFS, LRA 4.8 LU. On target.
- **Sync**: speech starts 0.06–0.48 s after each timeline line start (median about 0.3 s, all 58 lines). That
  is the TTS lead-in silence. It stays the same through the video, so there is no drift.
- **Chapters**: the meta.json chapter times match timeline.json scene starts.
- **Voice check (item 5)**: I transcribed every line containing "feet" or "three, four, five" twice more
  with `tts.transcribe` (gemini-3.8-flash) and ran `tts.diff`. There were 0 mismatches in 38 transcriptions.
  The transcriber writes "ft"/"feet" and "3-4-5"/"three-four-five" inconsistently, and the current
  `MATH_WORDS` normalises both. Example: "That's the 3-4-5 triangle, times 4." gives diff []. Both flags
  are **confirmed transcriber noise**. The audio says "feet" and "three, four, five" correctly.

## Findings

1. **should-fix · traps L5–L6 (229.6–242.4 s) · trap E visual contradicts its number.**
   L5 says 37 = 9 across + 28 up. L6 then draws a dashed L-path along the whole ground (21) and up the wall
   (28), which is 49, not 37. Nothing in the figure shows the "9" that the trap uses, so a kid sees "37"
   next to a path that isn't 37.
   *Fix*: in L5, highlight the 9 ground segment (foot to box) and the 28 wall segment in red on the
   figure, matching the `9 + 28 = 37` on the card. In L6, either drop the full-width L-path or label it
   generically ("across + up") with no number. Optionally change the L5 card wording to "used only the 9 ft
   to the box, then added 28 up".

2. **should-fix · pieces L2 (161–167 s) · the "3-4-5 triangle" is never explained.**
   It first appears here as a known fact ("That's the three, four, five triangle, times three"). Many AMC 8
   kids don't know it.
   *Fix (screen only, no narration change)*: under the `3-4-5 × 3` chip, add a small row
   `3^2 + 4^2 = 5^2` (or a mini 3/4/5 right triangle).

3. **should-fix · pythag L2 (124.5–128.2 s) · Pythagoras is named but its rule is never shown.**
   `L^2 = 21^2 + 28^2` appears with no reminder of the general rule.
   *Fix*: add a small muted line above it at L2, `\text{short}^2 + \text{short}^2 = \text{long}^2`
   (≥48 px), or `a^2 + b^2 = c^2`.

4. **should-fix · slope L6 (107.9–113.3 s) · the 7 steps disappear while being counted.**
   The 3-across/4-up staircase is still there at the start of L6 but gone by its end. The line is
   "So the ladder rises seven groups of four", which is exactly when the kid should be counting the 4-ups.
   *Fix*: keep the staircase through L6, and ideally pulse the seven vertical "4" risers one by one. Fade
   it at L7, when the 28 wall label comes in. Also keep the `21` bracket visible through L6. It vanishes
   along with the steps.

5. **should-fix · pythag L6 (from about 148 s to the end of the scene) · answer chip touches the frame edge.**
   The "L = 35 → choice D" pill ends at x ≈ 1915 of 1920, a 5 px margin. Everything else respects about
   60 px of margin. It risks clipping on TV overscan and some players' crop.
   *Fix*: right-align the badge and pill to x ≤ 1860, for example by moving both left about 60 px or
   centring the pill under the circle with a max width.

6. **nit · variant-answer L4 (307.9–315.9 s) · skipped addition.**
   "Fifteen squared plus twenty squared is six hundred twenty-five" shows only `15^2 + 20^2 = 625`. The
   main problem showed the squares separately.
   *Fix*: show `225 + 400 = 625` as the expression (screen only).

7. **nit · variant-answer L6 (323–331 s) · unexplained piece lengths and a duplicate "15".**
   "Ten below the corner, fifteen above" has no reason on screen. Also, the base bracket "15" (across) and
   the upper-piece "15" are on screen at once with different meanings.
   *Fix*: hide the base `15` bracket during L6. Optionally add tiny `6, 8, 10` / `9, 12, 15` side tags.
   The brief says "no triples on screen", so if you keep that rule, at least remove the duplicate 15.

8. **nit · slope L6–L7, variant-answer L3 · correct results drawn in trap red.**
   `7 × 4 = 28`, the 28 wall label, the "meets the wall 28 ft up" pill and `5 × 4 = 20` are all `#ef4343`.
   The brief keeps red for traps, so a correct key result in red reads as "wrong".
   *Fix*: use the violet or amber accent for the wall height.

9. **nit · pieces L5 (175.6–182.9 s) · method switches from "groups" to a fraction.**
   Solution 1 taught "groups of three → groups of four". Here it's `12 × \dfrac{4}{3} = 16`.
   *Fix*: show `12 = 4 × 3 → 4 × 4 = 16` to reuse the same idea.

10. **nit · font sizes under 48 px for maths-bearing text.**
    These are the `3-4-5 × 3` chip (44 px KaTeX), the question/variant prompt cards (44 px, with "12 ft",
    "9 ft"), "Nice triangle pieces → small numbers" (34 px), "Amazing work!" (36 px) and the
    "4 up for every 3 across" side notes (42 px). All are readable at 1080p.
    *Fix*: raise the chip to 48, and the prompt cards to 46–48 if the layout allows.

11. **nit · recap L1 (337.0–339.8 s) · empty card.**
    The "The big idea" card sits empty for about 3 s.
    *Fix*: start drawing the staircase line at L1, or fade the card in at L2.

12. **nit · figure scale.**
    The main figure fills only about 500×650 px in the top-left, and the space below it (y 720–900) stays
    empty in every scene. It's fine as is, but a 10–15 % larger figure would help phone viewers.
