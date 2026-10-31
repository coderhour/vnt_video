# Review: 2026-10-30-three-power-ends-01 (amc_practice_amc8_mixed_template:c1-339)

Reviewer: independent step-8 review, 2026-10-30. Video 6:31.8 (11752 frames @ 30 fps), 1920x1080.

## Summary

- **Math:** correct. I solved it blind first: 3^n ≡ 1 (mod 100). The last digit cycles with period 4, so n ≡ 0 (mod 4). 81^k ≡ 1 + 80k (mod 100) gives k = 5, so n = 20 = C. The variant is 9^n with order 10 (mod 100). `verify.py` re-run: `answer: 20 = choice C`, `variant: 10`, `ok`.
  Every spoken rule line was checked against the exact wording and holds. "Times eighty-one adds eighty to the last two digits" is true for numbers ending in 1, and that condition is stated just before it and shown as "(ends in 1)". "The tens digit drops by two every time" holds. "Anything ending in one, times eighty, ends in eighty" holds. "Last digit depends only on the last digits you multiply" holds. 3^10 = 59049 is correct.
- **Answer leaks:** none before the reveals. No original choice chips appear in variant / try2 / variant-answer. Intro never shows 3^20, and in the sol1-digit grid 20 is lit only as one of 4, 8, …, 28.
- **Loudness:** integrated -14.1 LUFS, true peak -1.2 dBFS, LRA 5.1 LU. OK.
- **Captions:** none longer than 2 lines.
- **Counts:** must-fix 2 · should-fix 7 · nit 6.

## Must-fix

1. **sol1-test L3, 2:15.9 (frame 3958 to 4085). The first `×81` label appears one line late. Known issue, confirmed.**
   The voice says "we multiply by eighty-one", but the screen shows only "jump 4 powers each", floating alone at the bottom right far from the table. The first `×81` appears only at L4 ("Eighty-one times eighty-one…", 2:17.2).
   Cause: `Composition.tsx:357`. The `×81` labels use `start={rs[i + 1]}`, so the first one is tied to L4.
   Fix: give the first label its own start of `at(scene, 3, 0.55)` (the word "eighty-one" ends L3). Keep the others on `rs[i+1]`, for example `start={i === 0 ? at(scene, 3, 0.55) : rs[i + 1]}`. Also place "jump 4 powers each" (`:359`) next to that first `×81`, at about `y = RY(0) + 60`, instead of at `RY(4) + 40`. There it is orphaned until row 5 exists.

2. **variant-answer L3, 5:44.3 to 5:52.9. The hop tiles lag the voice by one number.**
   Measured from the line WAV `764718a20c24bdab.wav`, the voice says 81 at 0.32 s, 61 at 1.46 s, 41 at 2.85 s, 21 at 4.29 s and "zero one" at 5.76 s.
   The tiles appear at about 1.0, 2.75, 4.5, 6.0 and 7.3 s. So 41 is still building while the voice says "twenty-one", and `9^{10} → 01` lands during "Five jumps again!". That breaks the rule that what is shown must match what is said, and it undercuts the variant's payoff.
   Fix: `Composition.tsx:519`, change to
   `const ta = [at(scene, 3, 0.0), at(scene, 3, 0.04), at(scene, 3, 0.17), at(scene, 3, 0.33), at(scene, 3, 0.50), at(scene, 3, 0.675)];`
   and drop the `ta[0] =` override. The arrows and "+80" labels follow from `ta[i+1] - 6`.

## Should-fix

3. **sol1-test L8, about 2:44.3. The `01` is revealed about 0.6 s before the word "zero one".**
   The line has a deliberate 1.8 s `<short pause>` (WAV 3.43 to 5.21 s), and "zero one" starts at 5.215 s, which is 0.64 of the line. `reveal = at(scene, 8, 0.55)` (`:300`) fires during the pause, so the screen gives away the beat the pause builds up.
   Fix: `reveal = at(scene, 8, 0.64)`.

4. **variant-answer L4, 5:53.4. `5 × 2 = 10` appears about 2.9 s before "Five times two is ten".**
   It appears while the voice is still on "Five jumps, and each jump covers two powers". The answer 10 is on screen before it is said.
   Fix: `:552`, change `start={at(scene, 4, 0.1)}` to `at(scene, 4, 0.54)`. In the WAV, "Five times two" starts at 3.60 s of 6.67 s. Optionally, show "5 jumps × 2 powers" at 0.1 instead.

5. **sol2 L4 to L6: "Start at one" is never explained, and the chain values read as real powers.**
   The track goes `1 → 81 → 161 → 241 → 321 → 401`, with "4 powers" under each arrow. A kid will read "161" as 3^8, but 3^8 is 6561. The "1" start is also really 3^0, which is never said.
   Fix: either label the start tile `3^0 = 1` and change the line to "Start at three to the zero, which is one", or show only the last two digits in the hop tiles (`…61`, `…41`, …). Keep the full 1 + 80k running sum only in the "eighties so far" row.

6. **sol2, all of L4 onwards, 3:23 onwards. "start: 1" is clipped against the left safe margin.**
   It renders at x ≈ 28 px, outside the 80 px gutter, and is jammed under the green rule pill.
   Fix: `:414` (`Text x={TX(0) - 30} y={250}`). Shift the whole track right by about 60 px, or put the "start" label inside the tile the way variant-answer does.

7. **traps, 4:01 onwards. Overlaps inside the trap cards.**
   (a) The "A 4" chip sits on top of the exponent of `3^4` in card A, and likewise "B 10" crowds the mini wheel.
   (b) In card D, the bottom line `…01 × …01 = …01` touches the card's bottom border, and "D 40" overlaps the top edge.
   (c) In card E, the superscript 5 of `(…01)^5` collides with the closing paren of the line above.
   (d) At L7 and L8 (4:44 onwards), the row `20, 40, 60, 80, 100` and the "Test in order" pill sit flush against the caption box.
   Fix: put the chip in a header row of about 70 px above the card content. Raise D and E card heights by about 40 px. Use about 1.4× line spacing between the two KaTeX lines. Move the `20, 40…` row up, or shrink rows A/B so 24 px or more clear the caption.

8. **sol1-test, the whole scene from 1:53 to 2:49. The table is crammed into the top 40% and the arrows are illegible.**
   The power-to-power "arrows" next to `3^4 … 3^20` render as tiny purple squiggles that look like glitches. The `=` in row 1 (`3^4 = 81`) is not aligned with rows 2 to 5 (`81 × 81 =`). The bottom half of the frame stays empty for about 50 s.
   Fix: centre the table vertically, with rows at about 1.3× the current pitch. Draw real curved arrows of 40 px or more between exponents, or drop them, since the `×81` column already carries the step. Right-align the `=` column.

9. **sol1-digit L1, 1:12.9. The example `27 × 3 = 81` highlights only the 1.**
   The brief asks for the 7, the 3 and the 1 to be highlighted, which is the whole point of the rule "the last digit depends only on the last digits".
   Fix: highlight the 7 in 27, the 3, and the 1 of 81 in the same colour.

## Nits

10. **sol2 L6, 3:33.** The `160` appears about 0.3 s after "one hundred sixty" has finished, while 240 and 320 land on their words. Fix: `sumAt[1]` to about `at(scene, 6, 0.06)` and re-tune.
11. **sol1-test L3 and traps L1.** The caption breaks "eighty-/one" across lines. Use a non-breaking hyphen (U+2011) in the captions for "eighty-one" and "twenty-one".
12. **Sub-48 px maths-ish labels.** These are "+80" at 46 px (variant-answer `:550`), the muted `9^{2}` exponent labels at 48 px, and "not 01 yet" at 38 px. Bump "+80" and "not 01 yet" to 48 px or more.
13. **traps L3.** `3^{10} = 59049` renders as "590 49" with a visible gap from the highlight box, and reads like two numbers. Shrink the colorbox padding, or highlight using colour only.
14. **sol2 rule line L3.** "We just ADD eighty to the last two digits" is fine with the "(ends in 1)" tag. Optionally say "add eighty, then keep the last two digits", since 61 + 80 = 141 → 41, so the wrap-around is explicit for a kid.
15. **Question scene, 0:17 to 0:37.** The prompt card plus chips fill only the top third, leaving a large empty band. Increase the prompt size to about 64 px, or move the chips down to about y 700.

## Checked and OK

- Intro hook under 10 s, and "Vantee" is introduced at 0:12.7.
- The try1 (10 s) and try2 (12 s) pause cards count down properly. try2 shows only the 9^n question.
- The sol2 `400` box and `→ 01` under `401` land exactly on "four hundred" (WAV 6.29 s).
- The variant `10` badge lands on "So n is ten!".
- The direction of the wheel arrows matches the 3→9→7→1 order. Trap B's mini-wheel lands on 9 for n = 10 (10 mod 4 = 2), which is correct.
- Every wrong choice is explained: A 4, B 10, D 40 and E 100.
- Recap rules are exactly true, and the end card holds 2 s.
