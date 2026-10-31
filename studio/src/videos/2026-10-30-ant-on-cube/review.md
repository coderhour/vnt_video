# Review: 2026-10-30-ant-on-cube

Independent step-8 review of `videos/2026-10-30-ant-on-cube/video.mp4` (6:14, 1920×1080, 30 fps).
Frame numbers are absolute (timeline.json `scene.from + line.from`).

**Summary: 1 must-fix, 9 should-fix, 7 nits.** The maths is correct throughout.

## 1. Math

- Blind re-solve: G is 3 edges away and there are only 3 moves, so every move must go farther from A.
  The chances are 3/3, then 2/3, then 1/3, giving 2/9 (choice C, `correct_index` 2). The count check is 3! = 6 good walks out of 27, which is also 2/9.
- `verify.py` re-run: `question: 2/9 [ABCG, ABFG, ADCG, ADHG, AEFG, AEHG]`, `variant: 3/32`, `ok`.
- Sleepy-ant variant: a nap uses up a minute, so all 3 minutes must be moves away. That gives 3/4 · 2/4 · 1/4 = 6/64 = 3/32. The 6 routes out of 64 also give 3/32. Correct.
- Trap stories, each checked:
  - 1/27 = (1/3)³ ("every step like step three"): true.
  - 1/9 = 1 · 1/3 · 1/3 ("if step two had only one good edge"): true.
  - 1/3 ("if you only looked at the last step"): true.
  - 4/9 = 1 · 2/3 · 2/3 ("if the last step had two good edges"): true.

  The 1/9, 1/3 and 4/9 stories are all worded "what you'd get if…". No issues.
- Meta chapter timestamps all match the timeline. The answer is never revealed on screen before line `steps`·6 (only the caption reveals it early, see S4).

## Must-fix

**M1. The A→G space diagonal runs straight through the C and E dots.** Scene `asked`, line 1 to the end of the scene (frames ~1450–1809). (It is gone by `try1`.)
- *What's wrong:* With this cavalier projection, A, E, C and G are almost collinear on screen. The dotted purple diagonal passes ~20 px from the E and C dot centres, so with dot r≈12 and a 9 px stroke it touches both dots (full-res crop at frame 1580), so it reads as an edge path A→E→C→G. That route is not a walk on the cube: E–C is not an edge, and this is exactly the "cutting across" a kid must not learn. It also visually "passes through" C, the answer letter.
- *Fix (pick one):*
  - (a) Drop the diagonal. Show "opposite end" by pulsing G and adding a "3 edges away" tag, or a curved arrow drawn *outside* the cube from A to G.
  - (b) Change the projection so the back offset is shallower, e.g. back vector (+150, −80) at full res instead of the current ~(+160, −130). Re-check that the diagonal stays ≥ 40 px from every dot, then keep all P.* coordinates consistent across scenes.

## Should-fix

**S1. The "1/3" edge tags in `question` are ambiguous and one is clipped.** Lines 4–6, frames ~920–1293.
- *What's wrong:*
  - The A–B tag sits below the edge at y≈790–870. During line 5 the 2-line caption box covers its denominator "3" (frame 1114).
  - The A–E tag is placed inside the front face, just above the A–B tag. The two tags stack vertically, so it isn't clear which tag belongs to A–E. It reads as two tags on A–B, and the dashed A–E edge passes beside its fraction bar.
- *Fix:* Put the A–B tag above the edge, inside the face near its midpoint (≈ (420, 650)). Put the A–E tag clearly beside the A–E midpoint on the upper-left side (≈ (300, 600)), or draw a short leader line from each tag to its edge midpoint. Keep everything above y≈830.

**S2. "count the walks" title collides with the up arrow of the direction legend.** Scene `count`, lines 4–7, frames ~5300–6118.
- *What's wrong:* The arrowhead of "up" (≈ x 1030, y 180–200) overlaps the "count" text of the panel title.
- *Fix:* Move the legend down ~70 px (or hide the title once the legend appears).

**S3. The six routes flash by too fast to follow.** Scene `count`, line 7 (frames 6014–6118, plus a 1.2 s hold).
- *What's wrong:* All six routes plus the list are drawn in ~4.5 s (≈0.7 s per route). The 6th route lands only during the silent hold, and `total2` then cuts away. A kid can't trace each path. This is the visual payoff of Solution 2.
- *Fix:* Give each route ≥ 1.2 s (ant slides the path, ghost stays), e.g. raise `count.hold` to ~4 s. Alternatively split line 7 into two lines: "Here are all six routes, drawn on the cube." / "Three start across, … each one uses every direction once."

**S4. The caption gives away "two over nine. That's choice C!" ~4 s before the voice.** Scene `steps`, line 6 (starts frame 4429).
- *What's wrong:* The caption shows the whole line at line start. The on-screen maths correctly waits for "= 2/9" near the end, but the caption already reads "…is two over nine. That's choice C!" at frame 4440.
- *Fix:* Split the line in `narration.json` into "One, times two over three, times one over three…" and "…is two over nine. That's choice C!". This keeps the meaning and fixes the caption leak. Do the same for `variant-answer` line 5 if you want "three over thirty-two" to land with the ✓.

**S5. Why "across once, up once, back once" is not explained.** Scene `count`, line 5.
- *What's wrong:* This is the key jump of Solution 2. A kid doesn't know why a good walk can't go across twice.
- *Fix:* Add one short line after line 5, e.g. "G is across, up and back from A. Going the same way twice just undoes the move, and then there's no step left." On screen, show A→B→A greyed out with ✗.

**S6. The direction name "back" clashes with "step back" in Solution 1.** Scenes `count`, `variant`, `variant-answer`.
- *What's wrong:* Solution 1 says "If it ever steps back…" and "Two edges go back", meaning toward A. Solution 2 then names the into-the-page direction "back". For "go back once", a kid can hear "return to A once".
- *Fix:* Rename the direction to "in" (or "deep"/"away") in narration lines `count`·3–4, the legend, chips and the variant chips. Re-run TTS for those lines.

**S7. Trap-card working maths is below 48 px.** Scene `traps`, lines 1–5 (Composition.tsx l.578 `size={46}`, l.581 `size={42}`).
- *What's wrong:* The factor rows (1/3 × 1/3 × 1/3 …) are 46 px. The "step 1: 1 / step 2: 2/3" fix rows are 42 px, and their fractions render visibly tiny (~30 px glyphs), cramped against the row above.
- *Fix:* Raise factors to ≥ 52 and fix rows to ≥ 50. If it doesn't fit, widen the cards (4 cards × ~420 px fits 1920) or drop the "step 1: 1" row from card A, since card B already teaches step 2.

**S8. Trap card E note "only C to G reaches G" mixes corner C with choice letters.** Scene `traps`, line 6 (frame ~8047).
- *What's wrong:* The card is headed by the circled choice "E", and there's no cube on screen. "C" here reads as choice C, the correct answer, rather than corner C. This is exactly the confusion the brief warned about.
- *Fix:* Change the note to "from corner C, only 1 edge reaches G", or show a small cube thumbnail with edge C–G green.

**S9. "Out of steps!" is not literally true, and the reason a step back is fatal is never shown.** Scene `layers`, line 5 (frame ~3216).
- *What's wrong:* The demo walks A→B→A. That uses 2 moves and leaves 1, so the banner "Out of steps!" contradicts what the kid sees. The narration's logic ("3 steps, 3 edges away, so one step back is fatal") is asserted, never counted. This is the key idea of Solution 1.
- *Fix:* Next to the ✗, show a counter: "1 step left, 3 edges to go ✗". Or reword the banner to "Can't reach G now!". Optionally reword the narration to "…If it ever steps back, it can't get to G in time." (only a TTS re-run of that one line).

## Nits

- **N1.** `asked` line 1 (frame ~1415): the highlight ring around A covers the "A" label, together with the ant. Offset the label further down-left or shrink the ring.
- **N2.** `variant-answer` line 6 (frame ~10438): "the same six routes" is shown by colouring the whole cube green. The six routes use all 12 edges, so this carries no information. Replay the six routes quickly in sequence instead.
- **N3.** `variant-answer` lines 6–7: the "✓ 6/64" sits cramped between "4×4×4 = 64" and the product row. The big ✓ disc almost touches the right frame edge at line 6 (x≈1905). Add 20 px spacing and keep the disc ≥ 60 px from the edge.
- **N4.** `traps` line 7 (frame ~8259): the green habit banner sits flush on top of the caption box (no gap). Move it up ~30 px.
- **N5.** `intro` line 1 and `question` line 5: captions break with an orphan word ("cube." / "out!"). Consider shortening or balancing line breaks.
- **N7.** aesthetic-rules Q11 (auxiliary text ≥ 32 px glyph height): the trap-card notes ("step 2 has two good edges", "you skipped steps 1 and 2", "6 routes, not 1") are 34 px font, about 24 px glyphs, too small on a phone. Raise them to ≥ 42 px.
- **N6.** `steps` line 2: the brief's D/E pulse is there but faint/brief (PulseRing in muted grey). Use the primary colour so "From D or E, the picture is just the same" lands visually.

## Checked, OK

- Spoken vs shown: every spoken fraction is on screen during its line: 3/3 = 1, 2/3, 1/3, 2/9, 6/27, 1/27, 1/9, 1/3, 4/9, 1/4 ×4, 3/4, 2/4, 6/64, 3/32, 64.
- Highlighted edges match narration:
  - Step 1: all 3 edges at A are green.
  - Step 2: B–A is red; B–C and B–F are green.
  - Step 3: C–B and C–D are red; C–G is green.
  - The "out of steps" demo shows A→B→A on a red edge.
- The intro walk (A→B→A→D) never reaches G. The choice chips use circled violet letters, distinct from the plain bold corner labels. The chip C highlight only appears at the end of `steps`·6.
- Pause cards: 10 s and 12 s, with the question or variant still visible.
- Captions: never more than 2 lines.
- Loudness: −14.3 LUFS integrated, true peak −1.0 dBFS, LRA 5.7 LU. Fine.
- Sync: the voice starts a constant ~0.2–0.3 s after each line start (TTS lead-in silence) at both the start and the end of the video, with no drift. The chime is on the reveal (`steps`·6 end, `variant-answer`·5 end).
- shotcraft `final-review.md` (A/Q sections; P/F/S/D are product-promo items, n/a here) and `aesthetic-rules.md` R1–R3, Q3, Q4, Q11, S1–S4, C1, P1 applied. R1 (≥1 s hold on key info) fails only at the six-route list (S3). Text is crisp, there's no camera shake, glints are limited to the answer reveal, there's no silent animation stretch > 3 s outside the pause cards, and the SFX are real chime/tick only.
- Length: 6:14 (within 4–7 min). The meta chapter times match the timeline.
