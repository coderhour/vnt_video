# Review: 2026-10-30-equilateral-angle-chase

Reviewer: independent review (step 8). Question `amc_practice_amc8_geometry_template:c1-082`. Video is 369.1 s (11070 frames).
Method: solved it blind, then re-ran `verify.py` (prints `ok`). Pulled 114 frames, one at the middle and one at the end of
each of the 57 lines, and looked at them as 6-up contact sheets, with full-res crops where needed. Ran ebur128 for loudness
and silencedetect for speech onset against `timeline.json`.

## Summary
- Math: **all correct.** Blind solve: ∠DAE = 40, base angles 70, ∠ADC = 60 + 20 = 80, x = 10 (choice A, correct_index 0).
  Variant (∠BAD = 36): 24, 78, 96, x = 18. Pattern: with ∠BAD = a, base angle = 60 + a/2 and ∠ADC = 60 + a, so x = a/2.
  That is exactly true for any D strictly inside BC (0 < a < 60), and "in this picture" scopes it correctly. Both trap
  stories are exactly true and worded as "what you'd get if…": 30 = 100 − 70 using ∠ADB, and 15 = half of 30 if ∠BAD were 30.
- Sync: speech starts a steady +0.28 s after each line's timeline start, the same on every line from 0:39 to 6:02, so
  there is no drift. That offset is the TTS lead-in silence.
- Loudness: −14.5 LUFS integrated, true peak −0.8 dBFS, LRA 5 LU. OK.
- Captions: never more than 2 lines. The 10 is first shown on subtract l2 and the 18 on variant-answer l3, so the answer
  never appears in an earlier line (see the should-fix on the 18 below).
- **Must-fix: 1. Should-fix: 7. Nits: 6.**

## Must-fix

1. **must-fix | pattern l4, about 3:48–3:52 (frame ≈ 6960) | clipped maths in the key result box.**
   The boxed `x = a − a/2 = a/2` has both denominators "2" sitting on, or poking through, the bottom border of the green
   box. This is the payoff line of the "hidden pattern" chapter.
   *Fix:* give the box more vertical padding, at least about 24 px below the fraction, or let it size to KaTeX's real
   height. It could also show only the boxed `x = \dfrac{a}{2}` the brief asked for (the `a − a/2` step is already implied
   by the line above).

## Should-fix

2. **should-fix | variant-answer l3, 5:32–5:38 | the answer 18 appears about 2.5 s before it is spoken.**
   The row `x = 96° − 78° = 18°` fades in at `at(scene,3,0.2)`, but "eighteen" is said at roughly 65–75 % of the line
   (frame 50m at 336.8 s already shows "= 18°"). The kid reads the answer before Vantee reveals it.
   *Fix:* split the row. Show `x = 96° − 78°` at 0.2, then append `= 18°` at about 0.7 together with the badge, or simply
   move the row's start to ≈ 0.68.

3. **should-fix | outside l2 (2:14) | the exterior-angle rule is stated but never justified.**
   "An outside angle equals the two far inside angles added together" is the "clever step" of Solution 1, and it is given
   as a bare rule. A kid who hasn't met it has no reason to trust it.
   *Fix:* add one line plus a visual after l2. For example: "Why? Triangle A B D's angles make one hundred eighty, and so
   does the straight line at D. Both share angle A D B, so what's left over must match." On screen:
   `60° + 20° + ∠ADB = 180°` and `∠ADB + ∠ADC = 180°`, with ∠ADB (100°) flashing in both. This also sets up the 100° that
   comes back in the 30-trap.

4. **should-fix | isos l0 (1:41) and recap l2 | "base angles" and "isosceles" are used without being introduced.**
   "Two equal sides means two equal base angles" never says which angles are the base angles. The arcs help, but the
   words don't. "Isosceles" first appears in the recap and is never defined.
   *Fix:* reword isos l0, e.g. "A D E is isosceles: two equal sides. So the angles at D and E, across from those sides,
   are equal too." Show the chip `isosceles: AD = AE ⇒ ∠ADE = ∠AED`.

5. **should-fix | variant-answer l2–l3 (5:26–5:38) | the 96° arc is too big and collides with other marks.**
   (This confirms the builder's flag.) The green ∠ADC arc crosses side AE just above E, runs across the E vertex and its
   78° arc, and ends near C. It also passes straight through the "24°" label (full-res crop at 333.3 s).
   *Fix:* cut the ADC arc radius to about 0.6–0.7 × |DE| so it stays below E. Put the "96°" label just outside that smaller
   arc, along the ADC bisector and right of the 78° label at D, and nudge the 24° label up toward A, clear of every arc.
   The same advice applies to the 80° ADC arc in the question figure (outside l1–l3, traps l4/l6, recap), which reaches
   almost to E.

6. **should-fix | outside l1–l3 (2:08–2:24), traps l6 (4:34), recap | the 80° / "?" label for ∠ADC is far from D.**
   It sits at the top-right of the big arc, next to side AE. In the "habit" frame (traps l6) it lands right beside E's
   "70°", so it reads like an angle at E. The 20° and 40° labels are also about 350 px below their arcs at A in that frame.
   *Fix:* with the smaller arc from #5, put "80°" on the ADC bisector just outside the arc, near D. Move the 20°/40° labels
   in close under the A arcs (for example 40–60 px inside each arc's midpoint).

7. **should-fix | sol2 l1–l3 (2:49–3:09) | small triangle DEC is crowded.**
   The 110° arc at E and the 60° arc at C overlap each other and the E vertex dot. The "110°", "10°" and "60°" labels are
   jammed into the bottom-right corner, and "60°" sits about 30 px from the "Double-check" pill on l4.
   *Fix:* shrink both arcs (r ≈ 25–30 units in bank-SVG scale), or zoom or scale up the figure around E–C for this
   chapter. Move the pill to its own row under the equations.

8. **should-fix | several scenes | supporting text under the 48 px brief / ≥ 32 px rule.**
   Measured on full-res frames:
   - recap card subtitles ("outside angle = sum of the two far angles", "of the isosceles triangle inside it"): ≈ 30 px
   - "Bonus:": ≈ 28 px
   - trap-card notes "but x sits on the C side" and "only IF the given angle were 30°:": ≈ 32 px
   - choice letters A–E in the choices row (question l5, subtract l2): ≈ 20 px
   - pause-card header "Find x, the angle EDC.": ≈ 34 px

   *Fix:* raise them to ≥ 40–48 px, or drop the subtitles where the bold line already says it.

## Nits

9. **nit | traps l3–l4 (4:14–4:23) | the 30-trap doesn't say how a kid ends up with 100 or why it's wrong.**
   The kid gets 100 naturally, from the triangle sum in ABD (180 − 60 − 20), and "x sits on the C side" is vague.
   *Fix:* "Angle A D B is on the B side of A D. Our x is inside angle A D C, on the C side." If #3 is done, the 100 is
   already on screen.

10. **nit | traps l5 (4:27) | the 15-trap is true but has no motivation.**
    *Fix:* tie it to a plausible picture-reading error, e.g. "Fifteen is what you'd get if A D cut angle A exactly in
    half, so B A D were thirty." That is exactly true: x = 30/2 = 15, and verify.py already asserts it.

11. **nit | sol2 l4 (3:12) | "using just the triangle sum" isn't quite right.**
    Solution 2 also uses the straight line at E (180 − 70). *Fix:* "using just one-eighties: a straight line and a
    triangle." Change the pill to "Double-check: straight line + triangle sum".

12. **nit | traps l3–l6 (4:14–4:37) | the red "100°" label sits on side AB.** The "1" overlaps the line.
    *Fix:* move it about 20 px right and down, into the gap between the 100° arc and AB.

13. **nit | variant-answer l1–l5 | the outside "78°" label at E has a leader line crossing side AC.**
    It reads fine, but it is the only outside label. *Fix:* if the arc radius at E is cut, place it inside, just above DE
    near E. Otherwise keep it as is.

14. **nit | top l0 (1:22) | "Let's start at the top corner, A" has nothing on screen.**
    The figure goes bare: 20° and x° vanish and come back on l1. *Fix:* pulse vertex A, or keep the 20° arc visible
    through l0.

## Checked and OK
- Every arc tested sits at the correct vertex: BAD and DAE at A; ADE, ADC, ADB and x at D; AED and DEC at E; 60° at B
  and C. The x arc is between DE and DC.
- Spoken numbers match what is on screen in every line checked (mid and end frames of all 57 lines).
- The variant figure has D right of the midpoint of BC (correct for 36 > 30). Its ticks and 36° arc match the narration,
  and 18 is not shown during try2.
- The pattern derivation shows the in-between step `(120°+a)/2`, the two 60°s are struck out, and no slider leaks the
  variant answer.
- The chimes come at the end of subtract l2 and variant-answer l3, not over speech. Confetti is light.
