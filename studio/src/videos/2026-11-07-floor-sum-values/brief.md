# Builder brief: 2026-11-07-floor-sum-values

Question `amc_practice_amc10_algebra_template:c3-004`. Answer **A = 667**. Variant answer **57**.
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.

Line numbers below are 0-indexed within each scene (L0 = first line).

Choices (letters fixed): A 667, B 668, C 670, D 750, E 834.

Notation: `f(x)=\lfloor x\rfloor+\lfloor 2x\rfloor+\lfloor 3x\rfloor`. Spoken "floor of two x" = `\lfloor 2x\rfloor`.
Spoken "one over three" = `\dfrac13` etc.

Global rules for this video
- Never show 667 before the `reveal` scene. No live "count so far" / "hits so far" counter anywhere (it would pass through
  the choice values). Staircase value readouts (0…3, 6…9, 12, 996…999, 1002) are fine: none is a choice.
- Never show 57 before `variant-answer` L6.
- Use `\dfrac` for every fraction; digits ≥ 48 px (including axis tick labels). Keep stage above y ≈ 860.
- Colours: `\lfloor x\rfloor` = neutral grey `#8a8a8a`; `\lfloor 2x\rfloor` = secondary purple `#7b61ff`;
  `\lfloor 3x\rfloor` = primary green `#0cc281`; the total f(x) = dark `#333333` (thick); skipped values / traps = red `#ef4343`;
  makeable values / correct = success `#21c45d`.
- Staircase graphs are in maths coordinates (y up). Each step is a horizontal segment with a **filled dot at its left end and a
  hollow dot at its right end** (f(1/3)=1: the value at a jump point belongs to the higher step). Draw jumps as faint dashed
  verticals only, never as solid risers (the graph does not pass through the skipped values).
- Every number the voice says must be on screen during that line (listed per line below).

## intro (3 lines)
- L0: three boxes in a row: "number", "double", "triple", each with a ⌊ ⌋ "round down" arrow, then a "+" sum box. Generic, no specific x yet.
- L1: big `1000` with a red "can't make" stamp (a strong-ish beat, but no answer choices visible).
- L2: plain title card "Which numbers CAN you make?".

## question (4 lines) — poster: about 1 s into L3 (full prompt + formula + all five choices visible)
- L0: card "Question" + the prompt text.
- L1: highlight "1 ≤ n ≤ 1000".
- L2: big KaTeX `n=\lfloor x\rfloor+\lfloor 2x\rfloor+\lfloor 3x\rfloor`, terms highlight left to right as read (colours above).
- L3: Choices row A–E: 667, 668, 670, 750, 834.

## asked (4 lines)
- L0: definition card: "floor ⌊ ⌋ = round DOWN to a whole number".
- L1: two rows: `\left\lfloor \dfrac72 \right\rfloor = 3` (show `\dfrac72` on a small number line between 3 and 4 with an arrow down to 3), and `\lfloor 5\rfloor=5`.
- L2: goal row: "pick x → round down x, 2x, 3x → add. Which totals from 1 to 1000?"
- L3: small note row: "x < 0 → total < 0", so the graph will start at x = 0.

## try1 (pause, hold 10): PauseCard with the formula, range 1 ≤ n ≤ 1000 and the choices visible.

## steps — Solution 1: the staircase (5 lines). Key visual.
Graph: x axis from 0 to 1 only in this scene, wide: about 1100 px for 1 unit (x=0 at screen x≈250). Ticks at 0, 1/3, 1/2, 2/3, 1
(1/3, 1/2, 2/3 are 1/6 apart ≈ 183 px: labels `\dfrac13 \dfrac12 \dfrac23` at ≥ 48 px fit; put them below the axis on one row).
y axis 0…3 for the total; the three part-graphs can be small strips stacked above (or drawn in sequence, then merged).
- L0: empty axes appear, x from 0 to 1.
- L1: `\lfloor x\rfloor` (grey): flat line at 0 for 0 ≤ x < 1 (hollow dot at x = 1). Then `\lfloor 2x\rfloor` (purple): 0 on [0, 1/2), 1 on [1/2, 1). Highlight the tick `\dfrac12`.
- L2: `\lfloor 3x\rfloor` (green): 0 on [0,1/3), 1 on [1/3,2/3), 2 on [2/3,1). Highlight ticks `\dfrac13`, `\dfrac23`.
- L3: the three add into the total f(x) (dark, thick): 0 on [0,1/3), 1 on [1/3,1/2), 2 on [1/2,2/3), 3 on [2/3,1). Value labels 0, 1, 2, 3 on the steps, each popping as its step draws (left to right).
- L4: small "+1" tags on each of the three jumps (at 1/3, 1/2, 2/3). Green check "nothing skipped… yet".
  Note: there is NO jump at 1/6 or 5/6. Do not put ticks there.

## jump (6 lines) — the "aha" beat
Extend the x axis to 2 (rescale so 0…2 fits; ticks at the integers and the thirds/halves, labels may shrink to only 1 and 2 plus the
1/3, 1/2, 2/3 group of the first unit if space is tight, still ≥ 48 px). y axis 0…12.
- L0: a marker slides along x toward 1 (on the 3-step); at x = 1 all three part-floors flash at once.
- L1: tag "at x = 1", rows: `\lfloor x\rfloor=1,\ \lfloor 2x\rfloor=2,\ \lfloor 3x\rfloor=3`, total `=6`. The step at height 6 starts at x = 1 (filled dot).
- L2: on the y axis, the levels 4 and 5 shown red with a strike / "skipped" tag; a dashed gap from 3 up to 6 labelled "+3".
- L3: row `f(x+1)=f(x)+6` (with a small `+1,+2,+3` under the three floors). The 0…1 staircase copies itself up-and-right onto 1…2 (ghost then solid).
- L4: second unit's step labels 6, 7, 8, 9 appear in sequence, then the leap to 12 at x = 2 (show the start of the 12 step only); 10 and 11 red on the y axis.
- L5: a remainder strip "÷ 6": cells 0 1 2 3 green, 4 5 red. Keep this strip on screen into `count`.

## count — Solution 1: count the skips (5 lines)
- L0: row `1000 = 6\times166+4`.
- L1: blocks of six drawn as a compact strip: `1\!-\!6,\ 7\!-\!12,\ \dots,\ 991\!-\!996` with brace "166 blocks"; in each block the remainder-4 cell is red. Example numbers 4, 10, …, 994. Count tag `166`.
- L2: `1000` appears after the last block (remainder 4, red); tag `166 + 1 = 167`.
- L3: remainder-5 cells go red too (5, 11, …, 995); tag `166`.
- L4: row `167+166=333` "can't make".

## reveal (1 line) — the strong motion beat
- L0: row `1000-333=` then `667` lands (shotcraft reveal) with Answer badge "A · 667" and chime at the END of the line (after "Choice A").

## rows — Solution 2: rows of six (8 lines)
- L0: title "count what we CAN make".
- L1: a grid with 6 columns, first 4 rows: 1–6, 7–12, 13–18, 19–24. Columns 1, 2, 3, 6 green; columns 4, 5 red (struck). Tag "4 ✓  2 ✗ per row".
  (These are the remainders 1,2,3,0 and 4,5. Check: 1,2,3,6 makeable; 4,5 not.)
- L2: a "⋮" gap, then the row 991–996 at the bottom; tag `6\times166=996`, brace "166 rows".
- L3: row `166\times4=664`.
- L4: a short last row: 997, 998, 999, 1000 (all neutral at first).
- L5: 997, 998, 999 turn green (small remainder tags 1, 2, 3); 1000 turns red (remainder 4, struck).
- L6: row `664+3=667` + "same answer!" (667 may now be shown).
- L7: tag "use when: the end of the list is tricky".

## traps (6 lines). One red card per wrong choice, with its working:
- L1: B 668: `1000-2\times166=668` — "forgot 1000 is skipped".
- L2: C 670: `1000-2\times165=670` — "only 165 pairs".
- L3: D 750: `\dfrac34\times1000=750` — "1 in 4 skipped? no: 2 in 6".
- L4: E 834: `1000-166=834` — "only 1 per block".
- L5: habit card: "Watch for big jumps. Check the last number."

## variant — Your turn: floor of four x (3 lines)
- L1: `n=\lfloor x\rfloor+\lfloor 2x\rfloor+\lfloor 4x\rfloor` with the `4x` highlighted. L2: `1\le n\le 100`, "how many?".
- No choices for the variant. Never show 57 (or 56) before variant-answer.

## try2 (pause, hold 12): PauseCard with the variant formula and range visible.

## variant-answer (7 lines)
Staircase, x from 0 to 1 again, ticks 0, 1/4, 1/2, 3/4, 1 (evenly spaced). y 0…7.
- L0: step 0 on [0,1/4), step 1 on [1/4,1/2). Labels 0, 1.
- L1: at 1/2 a "+2" tag (two floors flash: `\lfloor 2x\rfloor` and `\lfloor 4x\rfloor`); step 3 on [1/2,3/4); the y-level 2 red "skipped". This is the twist.
- L2: step 4 on [3/4,1); at x = 1, leap to 7 (start of the 7 step); levels 5, 6 red.
- L3: remainder strip "÷ 7": 0 1 3 4 green, 2 5 6 red.
- L4: rows `100=7\times14+2` and `14\times4=56`.
- L5: 99 green (remainder 1), 100 red (remainder 2).
- L6: `56+1=57`, Answer badge **57** + chime at line end.

## recap (3 lines)
- L0: mini staircase with the big +3 jump highlighted; text "a jump bigger than 1 skips numbers".
- L1: the ÷ 6 strip again: 0 1 2 3 green, 4 5 red, "repeats every 6".
- L2: `<SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />`.
