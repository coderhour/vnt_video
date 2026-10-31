# Review: 2026-10-30-cevian-area-ratio

Reviewer: independent (step 8). Video 7:04 (424.2 s), 1920×1080, 30 fps, AAC 48 kHz.
I checked 116 frames (middle and end of every line, half-scale contact sheets), plus full-res crops around the reveals and the tight spots.

**Must-fix: 4 · Should-fix: 6 · Nit: 8**

## 1. Math: OK

- **Blind solve:** mass points B=C=1, D=2. AE:EC = 2:1 gives A = ½, so AP:PD = 2 : ½ = 4:1 and [ABP] = ⅘·30 = **24** (C). Cross-check: BP:PE = (3/2):1, so [ABP] = ⅗·[ABE] = ⅗·40 = 24. This agrees with the bank (`correct_index` 2).
- **Variant:** AE:EC = 3:1 gives A = ⅓, so AP:PD = 6:1 and the answer is 6/7·42 = **36**.
- `verify.py` re-run: 24 with pieces 24/6/6/8/16, and 36 with pieces 36/6/6/9/27. "ok".
- Every narrated step is valid:
  - ADC = x+y+2y.
  - BEC = ⅓·60 = x+x+y. This uses corner B with its base on AC.
  - Subtracting gives 5y = 40, so y = 8 and x = 6.
  - The midline argument puts F at the midpoint of EC. The step counts (4,1,1 and 6,1,1) are right.
- Trap stories are exactly true: 30 = [ABD], 40 = [ABE], 20 = ⅔·30 (2:1 copied onto AD), 15 = ½·30 (P as the midpoint of AD).

## 2. Must-fix

1. **solve L4 (195.7–206.6 s): the answer 24 shows ~6.7 s before it is spoken.**
   - `Eq '[ABP] = 30 - 6 = 24'` starts at `at(scene,3,0.2)`, so it is on screen at about 197.9 s.
   - "twenty-four" is spoken at about 204.6 s, right after the `<short pause>` (silencedetect 8.14–8.91 s into the line).
   - The kid sees 24 during "A B D is thirty…".
   - **Fix:** show `[ABP] = 30 - 6` at 0.45. Fade in `= 24` as a separate piece at about 0.82, together with the "?"→"24" label swap (already at 0.8).

2. **solve L4→L5 (206.3–207.3 s): the answer badge and "Choice C" are on screen for under 1 s, and the badge covers the equation.**
   - `fin = at(scene,3,0.97)`. Then `rows = fadeTo(f, at(scene,4,0))` fades the badge, confetti and "Choice C" pill out about 0.7 s later.
   - The climax is a flash. This breaks aesthetic-rules R1: a key result must hold at least 1 s.
   - The badge at x=1730, y=640 also sits on top of `= 24` in the y=680 row (visible at 206.8 s).
   - "Choice C" (y=780) nearly touches the caption box (≈10 px gap).
   - **Fix:** keep the badge and pill until about `at(scene,4,0.3)`, or add about 1.5 s of hold after L4. Move the badge right or up so it clears the equation, e.g. x≈1780, y≈470, beside the y=8 row. Move "Choice C" up to about y≤740.

3. **traps (289–330 s): the trap fraction rows collide.**
   - Rows sit at y=115/250/385 with a size-54 `\dfrac`. The ½ denominator touches the ⅔ numerator, so the column reads "1 / 2 2 / 3 2 / 3" (full-res crop at 300 s).
   - **Fix:** use `\tfrac` or `size={46}`, or space the rows ≥150 px apart. The panel has room if the habit card moves (see 4).

4. **Clipped text under the caption box: the "Best for" pill (parallel L8, 276–282 s) and the habit card (traps L7, 323.8–330 s).**
   - "Best for: a ratio along a line" (Pill y=800): the descenders of "along" are cut by the 2-line caption.
   - "Every line gets its own ratio." (top 775): the bottom border is hidden.
   - **Fix:** keep every panel element's bottom ≤ ~830 px:
     - Pill: y ≈ 740.
     - Habit card: top ≈ 700, after tightening the rows in item 3. Or put it in place of the green "on AD" row.

## 3. Should-fix

5. **variant-answer L4 (390.5–394.1 s): 36 shows ~2 s early.**
   - `\dfrac67 \times 42 = 36` appears at 0.1 (about 390.8 s). "thirty-six" is spoken at about 392.9 s.
   - **Fix:** split it. Show `\frac67\times42` at 0.1 and `= 36` at about 0.65, with the chime still at the end.
   - (parallel L7 shows 24 about 1 s early too, at 270.9 s against about 272.0 s spoken. That is a nit, since the answer is already known by then.)

6. **solve L1 (174.9–180.4 s): "Let's double the first equation" while the first equation has just been wiped.**
   - The equations scene ends with `x+3y=30`, but solve opens on `2x+6y=60` alone.
   - **Fix:** show `x + 3y = 30` briefly, then morph it or put "×2" next to it (the brief asked for "moved from row 1 ×2"). Show a subtraction bar or a "−" before `5y = 40` in L2.

7. **parallel L3 and L5 (231–262 s): an unexplained jump for a kid.**
   - "So the parallel line lands halfway along CE" and "PE is parallel to DF, so AP:PD matches AE:EF" both use the parallel-lines-cut-proportionally fact without ever stating it.
   - Solution 1 got a "handy rule" scene; this one gets nothing.
   - **Fix:** add one short line plus a tiny side demo before L3, for example "A line parallel to one side splits the other two sides in the same ratio."
   - **Cost:** this is a new narration line, so it needs TTS, a timeline rebuild and a re-render, and it adds about 4 s. Pair it with the trim in section 6.

8. **traps L6 (317–323 s): the "middle?" ghost label sits across edge AB, and its "?" touches the dashed ring.**
   - The builder flagged this. It is confirmed at full res: the AB stroke runs through "middle".
   - **Fix:** put the label to the right of AD, inside triangle ADC (e.g. `add(p, +120, -6)`), or move it up and left out of the triangle with a leader. The "2 : 1?" ghost uses the same `-112` offset and only just clears AB, so move it the same way.

9. **parallel L4–L7 and variant-answer L1–L5: the E/F step labels are crowded.**
   - The "1" for EF is placed right next to the "E" letter, so it reads "E 1".
   - The "F" label sits on the FC double-tick (crop at 250 s).
   - In the variant, E, "1", "1", F and four tick marks fit in about 80 px.
   - **Fix:**
     - Push the step labels further out with `AcLab(...,120)`.
     - Move "F" to the inner side of AC, e.g. `add(g.F, -10, 48)` below and left of the line.
     - Or drop the EF/FC double ticks once the step labels appear, since the steps already say they are equal.

10. **equations L3 (151.6–160.4 s): an unexplained dashed line from B to AC.**
    - It is the height from B, but it has no right-angle mark and the narration never says "height".
    - It also crosses the "2y" label.
    - **Fix:** add a small right-angle square and an "h" label (matching the rule demo), and nudge "2y" right by about 20 px. Or say "same height from B".

## 4. Nits

11. **asked L2 (45.3–54.8 s): "E cuts A C into three equal parts" is loose wording**, since one point makes two parts. Kids will follow it. Change it only if asked L2 is re-recorded anyway, e.g. to "Think of A C as three equal steps: two from A to E, one from E to C."
12. **Small pill text.** Pills use 36–38 px ("Choice C", "Best for…", "Amazing work!"). The text-label guideline is ≥48 px, so raise them to 44 or more. The grey sub-headings at 40 px are fine as prose.
13. **question card.** "AE :" wraps away from "EC = 2 : 1". Use a non-breaking space or `white-space: nowrap` on the ratio.
14. **recap L1 (400.6–403.1 s).** The "big idea" card is empty for about 2.5 s. Fade in the key-idea text at L1 0.6 instead of L2.
15. **try2.** The countdown runs 12 s while try1 runs 10 s. Use 10 for consistency (this also saves 2 s).
16. **Voice: "Vantee" is heard as "Vanti"** (recap L4, intro L3). The check does not flag it. It is the usual Gemini reading and acceptable, but if the other videos say "Van-TEE", add a pronunciation hint.
17. **question L4 (about 36.5 s): the question card reflows from 4 to 5 lines** when the "What is the area…" highlight lands, so "ABP?" jumps onto a new line mid-read. Pre-reserve the Mark padding (e.g. the same padding when it is off) or give the card a fixed height.
18. **rule L2.** The "h" label touches the orange edge of the demo triangle. Shift it about 12 px left.

## 5. Visual / audio checks

- **Loudness:** −14.2 LUFS integrated, LRA 5.5 LU, true peak −1.3 dBFS. On target.
- **Sync:** the captions matched the narrated line in all 116 sampled frames. The video is 424.2 s against 424.07 s in the timeline, so there is no drift.
- **Captions:** never more than 2 lines.
- **Labels:** figure labels are 52–64 px. `x`/`y` are 56 px, so they are OK.
- **Chapters:** the chapter times in `meta.json` match the timeline. Solution 2 starts at 219.8 s, shown as 3:39.

## 6. Length (7:04): where to trim

The easiest cut is **solve L5, the "Check: 24 + 16 = 40 = ⅔ of 60" line** (about 10.8 s with the gap).
- It repeats the ⅔·60 = 40 that the trap-40 card shows again 80 s later.
- Cutting it brings the video to about **6:53**.
- It also removes the need for the rows fade, which makes fix 2 simpler.

Other options:
- Shorten try2 to 10 s (−2 s).
- Drop variant-answer L5 "If you found thirty-six, amazing work!" (−4 s) and move the "Amazing work!" pill onto L4's end.

Trade-offs of cutting solve L5:
- It removes Solution 1's only self-check.
- Every later chapter time in `meta.json` moves by about −11 s.

To keep the check, use the two no-narration-loss options instead (about −6 s, giving ≈6:58).

If fix 7 adds about 4 s, the solve L5 cut still keeps the video under 7:00.

## 7. Voice check (`tts.py --check`, re-run): 4 flags, all false positives

Each flag comes from the checker joining spelled-out letters across punctuation. I confirmed this in `tts.py` `words()`: it drops punctuation, then joins runs of single letters, so the script's "C P E y" becomes `cpey`, while the heard "CPE y" stays as `cpe` and `y`. Both listens ("heard" and "heard2") match the script word for word:

| Line | Flag | Script | Heard (both listens) | Verdict |
|---|---|---|---|---|
| pieces L4 | `cpey -> cpe y` | "Call C P E y, and A P E two y." | "Call CPE y, and APE 2y." | Correct audio. The checker merged "C P E y". |
| parallel L3 | `cef -> ce f` | "…halfway along C E. F is the midpoint…" | "…halfway along CE. F is the midpoint of EC." | Correct. It merged across a full stop. |
| parallel L4 | `acec -> ac ec` | "…along A C. E C is two steps…" | "…along AC. EC is two steps…" | Correct. It merged across a full stop. |
| parallel L5 | `adfpe -> adf pe` | "In triangle A D F, P E is parallel…" | "In triangle ADF, PE is parallel…" | Correct. It merged across a comma. |

The other differences (digits vs words, "mid-point", "2:1") are transcriber normalisation and were not flagged. No re-generation is needed.

Tooling suggestion, outside this video: the letter-joining step in `tts.py` should split on punctuation before merging single letters.
