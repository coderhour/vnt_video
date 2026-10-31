# Review: 2026-10-30-midpoint-chase

Reviewer: independent (SKILL step 8). Video 6:20, 1920×1080, 30 fps.

## Summary

- **Math:** correct. Blind re-solve: 0, 64, 32, 48, 40, 44, 42, 43, 42.5, 42.75, so P10 = 42.75 (C), matching
  `correct_index` 2. `verify.py` prints `ok`. Every trap story is exactly true: A = P9, B = P11 (= P10 if you
  call the first point P0), D = P8 (all jumps whole numbers up to there), E = P6. Variant: P9 = 85/4 = 21.25,
  8 jumps, pairs 16 + 4 + 1 + 1/4. "Each pair is a quarter of the pair before" and "nine jumps" are both right.
- **Answer leaks:** none. 42.75 / P10 is first labelled at `list` L5 (~158 s); during L4 the ¼ arrow ends on an
  unlabelled tick. 21.25 is first shown at `variant-answer` L6. The decimal key (0.75 = ¾) and the choice chips
  are not leaks.
- **Audio:** −14.3 LUFS integrated, true peak −1.2 dBFS. Line starts in `timeline.json` sit within ≤0.42 s of
  the detected voice onsets (TTS lead-in), with no drift. The reveal chime is audible. Chapter timestamps in
  `meta.json` match the timeline.
- **Must-fix: 2.** Should-fix: 9. Nits: 7.

## Must-fix

1. **Wrong point order on the variant number line: `cue()` substring bug.** `variant-answer` L1, 308–317 s
   (first visible at 310.5 s). `cue(scene, 1, 'two right')` matches inside "thirty-**two right**", so `tj[4]`
   equals `tj[0]`. P6 = 22, its value label and the "2" jump arc pop in with the very first jump, before P3, P4
   and P5. The screen then shows stacked labels that read as wrong numbers: "2224" (22 and 24), "212" (21 and
   22), "PP6", and "8 2 P6 P4" piled together. The `nxt > 0.3` older-label hiding also breaks because the
   cues are out of order.
   **Fix:** make `cue()` search after the previous cue, or use unique phrases such as
   `cue(scene, 1, ', two right')` or `cue(scene, 1, 'left, two right')`. Ideally, give `cue` a `from`
   index: `t.indexOf(phrase, fromIdx)`. Re-render and check that P3 → P8 appear one at a time, with only the
   newest label showing.
2. **Clipped maths in the pair boxes.** `pairs` L3–L8, ~184–224 s (about 40 s on screen).
   - `(16 − 8) = 8`: the final 8 touches or overlaps the orange right border.
   - `(1 − ½) = ½`: the ½ fractions cross the top and bottom borders.
   - The "+¼" circle cuts through both the 1 and the 4.

   **Fix:** size each box from the measured Tex width plus 24 px padding on each side. Make the fraction boxes
   taller (134 → ~160, top `ys − 34`), or use `\tfrac` in these chips. Widen the "+¼" circle to about
   200×160 and centre the Tex in it.

## Should-fix

3. **Variant start: P2 is missing.** `variant-answer` L0, 301.4–308.2 s. Only P1 = 0 is on the line while the
   voice says "the jumps start at thirty-two". P2 at 32 appears only at "thirty-two right" (P2's Dot uses
   `op={ease(f, tj[0], 8)}`).
   **Fix:** show P2 (and its "32" label) from the scene start, like P1 (`ease(f, 4, 10)`). Keep `tj[0]` only
   for the 0 → 32 arrow.
4. **P5–P8 are named on the wide 0–64 line, where they can't be read.** `list` L1, 131–140 s. The 40–44 range
   is only about 100 px wide. Each new label replaces the last, the 8/4/2/1 arcs are tiny, and P8/43 sits
   inside the dashed magnifier box. The kid hears "P five at forty, P six at forty-four…" but can't see the
   points side by side until the zoom at 140 s.
   **Fix:** run the magnifier transition at the start of L1 (or right after "P five at forty"). Pop P5–P8 on
   the zoomed 40–45 line so all four labels stay visible.
5. **The traps number line has almost no labels.** `traps` 224.7–256 s. The zoomed 40–45 line labels only 41
   and 45 (`labels={[41, 45]}`). The dots at 42, 42.5, 42.625, 42.75, 43 and 44 carry no values. P9, P11 and
   the green P10 marker overlap at the same spot, so the P11 label collides with P9 at 249–256 s.
   **Fix:** use `labels={[40,41,42,43,44,45]}`. Either nudge the P11 label up and to the right with a leader
   line, or zoom to 42–43 for the A/B cards.
6. **Trap card tags sit on the bottom border.** `traps` L1–L4, 230–271 s. "one point early", "one point late",
   "stopped early" and "far too early" overlap the red bottom border. The 5/8 denominator in card B touches
   its tag.
   **Fix:** raise the card height from 305 to about 340, or give the tag `bottom: 18px`.
7. **The recap card touches the caption.** `recap` L2, 365.5–380 s. The "List the points, watch the jumps…"
   card (`top: 740`) butts against the caption box.
   **Fix:** move it to `top: ~680` and move the diagram up about 40 px (`y = 480`).
8. **The ½ + ¼ = ¾ row and the pill overlap (the builder knew about this).** `pairs` L8, 217–224 s. The
   "many steps: pairs keep it tidy" pill touches the denominators of the ¾ row.
   **Fix:** move the pill to y ≈ 800 under the `P10 = 42¾ = 42.75` line, or lift the ½ + ¼ = ¾ row about
   30 px.
9. **Jump arcs run through point labels.** In the intro (L1), `question` L3 and `jumps` L1–L5 (82–122 s), the
   arcs start at the dot centre and slice through the P1, P2 and P3 labels (P1's subscript is crossed in every
   jumps frame).
   **Fix:** start and end each arc a few px outside the dot (`y − r`), and lift the P-labels to about y − 70.
   Alternatively, move the P-label to the side opposite the arc (above for left jumps, below for right jumps).
10. **Maths text under 48 px.** The question card, the asked row, and both pause cards render
    `P_1 = 0, P_2 = 64` and `P_{10}` at 46 px (Composition.tsx lines 180–183, 210, 253, 277, 597). The "÷ 4"
    chips are 44 px (line 451).
    **Fix:** raise them to ≥ 48 (the cards have room).
11. **The variant jump list runs ahead of the voice.** `variant-answer` L1, 308.2 s. The whole first row
    "32 right, 16 left, 8 right," appears at "thirty-two right".
    **Fix:** stagger each item on its own cue, like the dots (once must-fix 1 is fixed).

## Nits

12. **Captions break mid-word:** "forty-/eight" (question L3), "forty-/two" (list L3), "thirty-/two" (pairs L5),
    "P / two" (asked L2), and "The answer is / C." (list L5).
    **Fix:** in the Caption renderer, swap the hyphen inside number words for U+2011 and put a no-break space
    after "P" and before the final "C.".
13. **KaTeX spacing in the coloured sum** (`pairs` 162–224 s): "0+64 −32 +16" has uneven spacing because the
    sign sits inside `\color{}`.
    **Fix:** write `{}+{\color{…}64}` or wrap the signs with `\mathbin{}`.
14. **Mixed label styles on the 40–45 zoom** (`list` L2 and traps): the axis labels 41 and 45 are bold Nunito,
    while 40/42/43/44 are grey KaTeX serif, so it looks like two scales.
    **Fix:** use one style.
15. **The `list` L0 panel ignores the colour code:** "8 left, 4 right, 2 left, 1 right" is all black, while
    everywhere else right is green and left is purple.
    **Fix:** colour it to match.
16. **Top-heavy layouts:** `question` L5, `asked`, `pairs` and `traps` L6 leave the lower ~40% of the frame
    empty. Consider larger type or centring the content vertically.
17. **"forty-two and five over eight"** (`traps` L4) is a TTS workaround and sounds odd to a kid. Try "forty-two
    and five eighths" again if `--check` accepts it. Otherwise keep it.
18. **The reveal badge covers P8.** `list` hold, ~161–162 s: the green "C" badge sits on the P8 label at the
    right end of the zoomed line during the chime.
    **Fix:** move the badge to x ≈ 1600, or place it above the "¼ right" label.

`script.md` matches `narration.json` line for line (only the pause-card markers differ).

## Kid test

The flow is good. The "why" beat (`jumps` L5: "halfway along the last jump, so back half as far") is shown
clearly. Solution 2's pairing is one idea per line, and the traps are concrete. The only real comprehension
gaps are visual: items 4 and 5 (the kid can't see P5–P8 or the trap values on the line) and must-fix 1 (on the
variant answer, the board contradicts the voice). Pacing is fine (6:20, 10 s and 12 s pause cards).
