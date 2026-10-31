# Review: 2026-10-30-multiples-of-4-6-9

Independent step-8 review. Inputs: video.mp4 (414.4 s, 1920x1080, 30 fps), narration.json, timeline.json, verify.py, brief.md, Composition.tsx, meta.json, script.md.
I looked at 58 end-of-line frames, plus dense frames around the two answer reveals.

**Summary: 1 must-fix, 5 should-fix, 6 nits.**

## 1. Maths: passes

- Blind solve: floor(1000/k) for k = 4, 6, 9, 12, 18, 36, 36 gives 250, 166, 111, 83, 55, 27, 27. Then 527 − 165 + 27 = **389 = C**, which matches `correct_index` 2.
- `verify.py` prints `answer 389 variant 110 ok`. The regions are 167/55/56/56/**0**/28/27, so the 4&9-only region is empty.
- Build-up method: 250 + 166 − 83 = 333. The even multiples of 9 are the multiples of 18 (55), so the odd ones number 111 − 55 = 56, and 333 + 56 = 389. ✓
- Trap stories, each recomputed:
  - E 527 = no subtraction. ✓
  - A 362 = forgot to add back. ✓
  - B 388: counting 1..999 gives 249 + 166 + 111 − 83 − 55 − 27 + 27 = 388, and 1000 is a multiple of 4 only. ✓
  - D 416 = 527 − 83 − 55 + 27. ✓
- Variant: 75 + 50 + 30 = 155. The pairs give lcm 12/20/30 → 25/15/10 = 50, and lcm 60 → 5. So 155 − 50 + 5 = **110**. ✓
- Venn labels: 12 sits in the 4&6 lens, 18 in the 6&9 lens, and 36/72 in the centre. Nothing is ever placed in the 4&9-only crescent. In `aha` that crescent is highlighted correctly and labelled "empty". In the variant, the labels 12/20/30/60 are placed correctly. ✓
- meta.json chapter timestamps match timeline.json. script.md contains every narration line.

## 2. Findings

### MUST-FIX

1. **traps L4 (≈ 298.4–304.8 s, card "D 416"): the equation shown is false as written.**
   The card shows `527 − 83 − 55 [−27] + 27 = 416`. A kid reads the red `[−27]` as a term, and 527 − 83 − 55 − 27 + 27 = 362, not 416. The brief asked for the missing −27 to be shown as a gap, but brackets read as "included".
   *Fix:* show `527 − 83 − 55 + 27 = 416`, then add a separate red tag "no − 27 for 4 & 9!". Alternatively, draw an empty dashed red box in the slot with "missing" under it, with no number inside. Also raise this Tex from size 46 to ≥ 52 (the only *maths* text under 48 px).

### SHOULD-FIX

2. **addback L3 (184.8 s): the answer 389 appears about 2.8 s before it is spoken, on screen and in the caption.**
   `Eq "362 + 27 = 389"` starts at `at(scene,3,0.1)` (≈ 185.5 s), but "is three hundred eighty-nine" is spoken from about 188.3 to 189.9 s (silencedetect on the line wav: 3.49–5.14 s into the line).
   The full-line caption also shows "three hundred eighty-nine. The answer is C!" from the line's first frame. So moving the equation alone doesn't fix it.
   *Fix:* split the narration line in two: "Three hundred sixty-two plus twenty-seven…" and "…is three hundred eighty-nine. The answer is C!". This needs a TTS regen of that line only. Show `362 + 27` on the first line and `= 389`, the pill and the chime on the second line.
   The same pattern appears, smaller, in two more places. Use the same split, or downgrade these to a nit if no regen is wanted:
   - **variant-answer L4** shows `= 110` at about 385.0 s, but "one hundred ten" starts at about 386.0 s, and the caption shows it from 380.2 s.
   - **subtract L2** shows `= 362` about 4 s early.
   For **buildup L6** (`= 389`, about 1 s early, a repeat of the known answer), it is enough to show `= 389` at about 0.5.

3. **traps L3 (≈ 292.3–298 s, card "B 388"): the card doesn't show where 388 comes from.**
   The maths cell shows `1000 = 4 × 250`, which is true but doesn't connect to 388. The "why" text wraps onto two lines inside the card ("left out 1000 (stopped at / 999)").
   *Fix:* change the maths cell to `389 − 1 = 388`. Shorten the why to "dropped 1000 (it's 4 × 250)" so it fits on one line.

4. **buildup L5 (≈ 251.9–259 s): "fifty-five are even" has no "where from".**
   The screen shows only `111 − 55 = 56`. The 55 is 1000 ÷ 18 from the subtract scene 2 minutes earlier, but nothing links it.
   *Fix:* show `1000 ÷ 18 → 55 even ones` above `111 − 55 = 56`. Or tag the 55 with a violet chip "multiples of 18", like the "83 multiples of 12" chip.

5. **The Venn diagram is undersized and the frame is unbalanced (singles → aha, traps L5–6, variant-answer).**
   `R = 190` gives a diagram about 640 px wide in the left third. The equations start at x ≈ 980, and the right 40% of the frame is mostly empty. The "multiples of 6" name almost touches the equation column (≈ 20 px gap at singles L1/L2). The brief asked for a diagram about 900 px wide.
   *Fix:* scale the Venn group by about 1.3 (R ≈ 250), keep it on the left about 900 px wide, and push the equation column to x ≈ 1050. Then the auxiliary labels (item 7) also get room to grow.

6. **buildup L1 (220.3–230.3 s): the caption runs to 3 lines.**
   "First, the multiples of four or six. Two hundred fifty plus one hundred sixty-six, minus eighty-three multiples of twelve." This is the only caption over 2 lines in the video.
   *Fix:* split it into two narration lines: "First, the multiples of four or six." and "Two hundred fifty plus one hundred sixty-six, minus eighty-three multiples of twelve." This needs a TTS regen of that line only.

### NITS

7. **Auxiliary labels at 44–46 px.** `Note` default 46 ("they first meet at 12", "no shared factor", "not counted at all!"…), trap `why` text, the "83 multiples of 12" and "×2" chips, "so far", and the recap "smallest number they all go into:".
    These are non-maths auxiliary labels and pass shotcraft Q11 (≥ 32 px). If the Venn is enlarged (item 5), raise `Note` to 50–52 to keep them in proportion.

8. **subtract L0:** `1000 ÷ 12 → 83` uses an arrow that isn't explained. The brief suggested "→ 83 whole twelves". *Fix:* add a small muted "whole twelves / eighteens / thirty-sixes" after each row, or use `= 83 R 4`, which matches the singles rows.
9. **buildup L3:** "even ones: ÷ 18 → ÷ 6 ✓ already counted" is symbol shorthand. *Fix:* use the words "even ones are multiples of 18, so multiples of 6: already counted ✓".
10. **aha L2:** the "empty" label sits on the green circle's stroke, half outside the slice. *Fix:* move it about 25 px up and right into the crescent's centroid, or shrink it slightly.
11. **traps L6:** the habit card title wraps ("Habit: find the FIRST meeting / number"). *Fix:* widen the card by about 120 px or shorten the title to "Habit: the FIRST meeting number".
12. **addback L3:** the brief asked for choice C to be highlighted in the choice row. The video uses an "Answer: C" pill instead. That's fine, but a mini choice row with C in green would tie the answer back to the question card.

## 3. Kid test

- LCM jargon is avoided well: "first meet", with listed multiples (4, 8, 12 / 6, 12 and 9, 18 / 6, 12, 18). The "24 misses 12 and 36" contrast is good.
- Every count has its division on screen, except the 55 in build-up (item 4).
- The +1 +1 +1 −1 −1 −1 = 0 tally for 36 is a clear way to motivate the add-back.
- Pacing: the 10 s and 12 s pause cards are fine. Line gaps are about 0.33 s, and no scene feels rushed. The build-up scene is the densest (8 lines). The caption fix in item 7 helps there.

## 4. Audio and sync

- Loudness: integrated **−14.0 LUFS**, true peak −1.2 dBFS, LRA 5.5 LU. ✓
- No drift. Late lines (variant-answer L4, recap L3) start in the mp4 at the timeline times, within about 0.1 s (checked via silence boundaries). The audio and video streams are 414.3 s and 414.4 s.
- The chime fires at the end of the answer lines (0.85), as specified. The SFX credits file is present.
- No overlaps or clipped text, apart from the near-touches in items 5 and 10. The stage stays above the caption band.
