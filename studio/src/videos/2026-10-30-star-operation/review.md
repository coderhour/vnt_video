# Review: 2026-10-30-star-operation

Question: `amc_practice_amc8_arithmetic_template:c1-095`. Answer C = 7/8.
Reviewed: video.mp4 (404.2 s), narration/script, brief, Composition.tsx, timeline.json. I pulled 60 frames, one near the end of each line plus one in each pause, and looked at them as contact sheets. I also pulled full-res frames at 80.8, 100.0, 197.0, 215.7 and 355.6 s.

## Math

- I solved it blind first: 1/2★1/3 = 5/7, 5/7★1/4 = 27/33 = 9/11, 9/11★1/5 = 56/64 = 7/8. That is C.
- Variant: 7/13, then 2/3, then 3/4. The scores 2 · 5/3 · 3/2 · 7/5 multiply to 7, and 1+x = 7(1−x) gives x = 3/4. Correct.
- `verify.py` prints `ok`.
- Score identity: 1 + a★b = (1+a)(1+b)/(1+ab) and 1 − a★b = (1−a)(1−b)/(1+ab). Both are exact.
- Trap claims are exact. The 77/60 claim holds because for 0<a,b<1 we have 1+ab−a−b = (1−a)(1−b) > 0. 14/15 = 1 − 1/15 is also correct.

## Findings

### must-fix

1. **must-fix · why L1 (≈207.7–216.0 s): the spoken claim is false as said.** The voice says "Take one away instead, and you get one minus a, times one minus b." Taking one away from a★b gives a★b − 1 = −(1−a)(1−b)/(1+ab), which has the opposite sign. The screen correctly shows `1 − a★b`, so voice and screen disagree.
   **Fix:** reword to "Now take a star b away from one, and the top becomes one minus a, times one minus b." Re-TTS this one line.

2. **must-fix · step1 L4 (≈93.0–100.3 s): the division row is broken.** The `5/6 ÷ 7/6` piece (cancelled 6s) floats about 60 px above the row's baseline and reaches up toward the tracker. The `= 5/7` sits detached about 170 px to the right. It does not read as one equation (frame at 100.0 s).
   **Cause:** the `group` slot has `w: 300` and holds the tall nested template, and its swap pieces are not vertically centred on the row.
   **Fix:** centre the group pieces vertically (`alignItems: center` / same baseline as the other pieces). Size the group width to the `÷` row, or end the template piece before the swap and re-flow the row. Then check that `= 5/7` follows straight after the cancelled row.

### should-fix

3. **should-fix · why L0 (≈199.2–207.3 s): unexplained factoring jump.** It goes from `1+ab+a+b` to `(1+a)(1+b)` with no "where from". A kid will not spot the factoring.
   **Fix:** add a small note `(1+a)(1+b) = 1 + a + b + ab ✓` (multiply it out to check). In the voice: "and that's exactly one plus a, times one plus b. Multiply it out and see!"

4. **should-fix · score-chain L3 (≈241.4–247.8 s), and variant-answer L4: "Fifteen parts plus one part make two" is not explained.** Why two? The "2" under the bar comes from nowhere.
   **Fix:** say "One plus the answer, plus one minus the answer, is always two. That's fifteen parts plus one part, so sixteen parts make two." Optionally label the bar `(1+x)+(1−x)=2`.

5. **should-fix · score-chain L0/L1 (≈217.8–234.5 s): the jump from two scores to four is never stated.** The rule was shown for one star, a★b. Using it for the whole chain needs one sentence.
   **Fix:** add "Each star multiplies the scores, so the final answer's score is all four scores multiplied together." Put it before "Now our four scores…".

6. **should-fix · step1 L1–L4 (≈75–100 s): the main row is rendered at `size={42}`.** That is below the 48 px floor and the brief's 56 px for main rows (Composition.tsx, Step1 `Expr x={80} y={258} size={42}`). Its nested template makes the inner fractions look even smaller next to the 52 px boxes.
   **Fix:** use ≥ 52, matching Step2/Step3. This depends on fix 2.

7. **should-fix · all scenes: some maths is under 48 px.**
   - The tracker `left` expression and the `Rule` card are at `size={46}`.
   - The step1/2/3 BOTTOM notes (`½·⅓=⅙` etc.) are at 46.
   - The try1 pause choice chips are at 44.

   **Fix:** set all of these to ≥ 48.

8. **should-fix · tracker (step1–3, variant-answer, recap): results and "?" sit too high.** The result fraction's numerator touches or overlaps the slot's top border (e.g. `5/7`, `7/13` numerator at y≈118 against a box top of 115, frames 100.0 and 355.6 s). The "?" sits raised like a superscript.
   **Fix:** in `Tracker`, centre the grid cell vertically (`alignItems: 'center'` on the value grid, `alignSelf: 'center'`), or raise the box height to about 150.

9. **should-fix · step1/2/3 BOTTOM box: the rows touch.** The muted note row (`½·⅓=⅙`, `5/7·1/4=5/28`, `9/11·1/5=9/55`) ends right where the `1 + …` row begins. The note's denominator meets the next row's numerator (frame 100.0 s).
   **Fix:** move the note to y≈20 and the main row to y≈185, or shrink the box's main row.

10. **should-fix · variant-answer L0–L2 (≈337.6–355.9 s): the three working rows are crammed together.** They sit at about 140 px pitch, so each row's denominators nearly touch the next row's numerators. Meanwhile the right ~55 % of the stage is empty (frame 355.6 s).
    **Fix:** increase the row pitch to ≥ 170 px, or lay the rows out with more spacing/left margin. The empty space allows it.

### nit

11. **nit · score L2–L3 (≈163.6–176.1 s): the score working skips its first step.** `score(½) = 3/2 ÷ 1/2` does not show where 3/2 and 1/2 come from.
    **Fix:** say "one plus a half is three halves; one minus a half is one half", or show `1+½ = 3/2`, `1−½ = ½` as a small note.
12. **nit · score L3: the rule "scores multiply" has an unstated condition.** It holds for numbers that aren't 1, because score(1) is undefined. Every number in this video is between 0 and 1, so nothing on screen is false.
    **Fix (optional):** say "for numbers between zero and one".
13. **nit · why (≈199–216 s): `1+a\star b` reads ambiguously.** It could be read as (1+a)★b.
    **Fix:** write `1+(a\star b)` and `1-(a\star b)`.
14. **nit · why L1: the final fraction `(1+a)(1+b)/((1−a)(1−b))` is all purple.** The top/bottom colour code used everywhere else is lost here.
    **Fix:** tint the top green.
15. **nit · variant-answer L3 (≈367 s): `1+x = 7(1−x)` appears but the voice never says it.**
    **Fix:** add "So one plus the answer is seven times one minus the answer" to L3, or fade the row in on L4.
16. **nit · variant-answer L2: `5/6 ÷ 10/9 = 45/60` skips flip-and-multiply.**
    **Fix:** add a tiny `= 5/6 × 9/10` step.
17. **nit · step scenes: the chapter pill and tracker boxes touch.** The "Solution 1: step by step" pill's bottom (y≈112) touches the tracker boxes' top (y=112).
    **Fix:** move the tracker to y≈124.

## Spoken vs shown

Apart from #1 and #15, every number on screen matches the voice at the end of its line. No answer appears before it is spoken:
- 5/7 shows at step1 L4, 9/11 at step2 L3 and 7/8 at step3 L4. The C chip turns green at the reveal.
- In the score section, 7/8 first appears at score-chain L4.
- 3/4 appears only at variant-answer L2.

The pause cards show no answer.

## Audio / captions

- Integrated loudness is −14.2 LUFS (target ≈ −14), true peak −1.0 dBFS, LRA 5.9 LU. OK.
- The voice starts about 0.15–0.3 s after each line's timeline start (the wav's leading silence). There is no drift across the video.
- Captions are at most 2 lines everywhere and nothing is clipped.
- The Vantee wordmark is held for more than 3 s at the end.

**Totals:** 2 must-fix, 8 should-fix, 7 nit.
