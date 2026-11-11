# Builder brief: 2026-11-07-frog-hexagon-cover

Question `amc_practice_amc10_counting_template:c2-015`. Answer **C = 15**. Variant (octagon) answer **28**.
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.

Line numbers below are 0-indexed within each scene (L0 = first line). 59 lines.
TTS watch: the letters W, M, P are spoken alone ("W over two"); if --check mishears one, reword (e.g. "the wait W"), don't change the letter on screen without changing it everywhere.

Choices (letters fixed): A 10, B 12, C 15, D 18, E 21.

Global rules for this video
- **Never show 15 before `reveal` L1.** No running total and no jump counter anywhere: partial sums 1, 3, 6, 10 pass through choice A.
  Show stage waits as separate chips ("stage 1: 1", "stage 2: 2", …) that collect in a row at the top of the stage scenes; add them only in `reveal`.
- Never show 28 before `variant-answer` L2.
- **No letters on hexagon corners** (A–F would clash with choice letters). Only W, M, P are letters, and only on the straightened line.
  W = wait at an END of the green block, M = wait at the exact middle spot, P = wait at the spot next to an end ("twin spots").
- Fractions as `\dfrac{W}{2}`, `\dfrac32`; digits ≥ 48 px. Keep the stage above y ≈ 860.
- Colours: visited corners / green block = primary `#0cc281`; exits and new corners = secondary `#7b61ff` (dashed ring outline, label "exit");
  traps `#ef4343`; success `#21c45d`. Unvisited corners: light grey ring.
- Frog: a small simple drawn frog shape (green-darker body circle + two eye bumps), NOT the Vantee mascot. Moves dot-to-dot only:
  each jump is a short hop arc from one corner to a neighbour, never a slide through the middle of the hexagon.
- Direction words: the narration never says left/right/up/down for the hexagon. Fine.

Hexagon figure (screen px, use in intro, question, block, variant with 8 corners):
centre (560, 470), radius 260, corners at angles −90° + 60°·i, i.e.
top (560,210), upper-right (785,340), lower-right (785,600), bottom (560,730), lower-left (335,600), upper-left (335,340).
Corner dots r = 26. Frog starts on the top corner.

Straightened line (stage scenes): stage k has **k + 2 slots** in a horizontal row: slot 0 = exit, slots 1…k = green block, slot k+1 = exit.
Slot spacing 170 px, y ≈ 420. Stages 1–4 (≤ 6 slots): line in the left part (x 120–1100), equations in a right panel (x ≥ 1150).
Stage 5 and the hill (7 slots, spans ~450–1470 when centred at 960): centre the line and put equations BELOW it (y 560–820). The frog sits on **slot 1**
(left end of the block): 1 step from the left exit, k steps from the right exit. Equations go in a right panel (x ≥ 1150) or below the line (y 560–820),
one row per idea, each row appearing on the line that speaks it.

## intro (3 lines)
- L0: hexagon with frog on top corner; frog hops a few corners (seeded, deterministic). Corners it visits turn green. Question mark tag "every corner?".
- L1: keep hopping; a faint green trail. No numbers.
- L2: frog pauses; title tag "find the pattern".

## question (4 lines) — poster: ~1 s into L3 (full prompt + choices visible)
- L0: card "Question" + prompt text (as in the bank, "vertex" wording). Hexagon figure on the side, frog on top corner.
- L2: two small purple arrows from the frog's corner to both neighbours, each labelled `\dfrac12`.
- L3: Mark-sweep "has been on all six vertices"; the choices row A–E: 10, 12, 15, 18, 21 appears at the start of L3 and stays through `asked`.

## asked (2 lines)
- L0: tag "expected = average over a million tries"; three tiny ghost hexagons with different walks (no counts shown).
- L1: start corner turns green with tag "already visited"; the five other corners get small purple "new" tags → "5 new corners".

## try1 (pause, hold 10): PauseCard with prompt + hexagon + choices.

## block — Solution 1: one stage at a time (5 lines)
Use this fixed walk (corner index i = clockwise from top, 0 = top): 0→1→0→5→0→1→2→1→2→3→4.
- L0: frog on corner 0, it turns green. Begin the walk; each newly reached corner turns green with a pop.
- L1: as the walk runs (pace it across L1–L2), the green corners form one connected arc; highlight the arc with a thick green band along the hexagon edges joining them.
  Tag "always one unbroken block".
- L2: freeze at the moment corner 2 turns green (walk 0→1→0→5→0→1→2): block {5,0,1,2}, frog on corner 2 = an END. Ring the frog; tag "frog at an end".
- L3: the two corners just outside the block (3 and 4) get purple dashed rings "exit" with arrows from both block ends. Then finish the walk 2→1→2→3 (3 green) …→4 (all green) quickly.
- L4: a 5-chip strip "stage 1 … stage 5" with a small hexagon icon for each showing 1,2,3,4,5 green corners in a block. No wait numbers yet.

## stage12 (6 lines)
- L0: stage-1 icon: one green corner, both neighbours purple "exit". Chip "stage 1: 1 jump" (first chip in the top row).
- L1: animate the hexagon "straightening": the stage-2 picture becomes the line of 4 slots: exit · green · green · exit. Frog on slot 1.
- L2: label `W` above slot 1. Row: `W = 1 + \dfrac{\text{wait at left} + \text{wait at right}}{2}` (the one-step rule, text form OK). Exits labelled `0`.
- L3: two hop arrows from the frog: left to the exit (green check "done!"), right to slot 2, each `\dfrac12`.
- L4: slot 2 mirrors slot 1 (a small mirror line between slots 1 and 2, slot 2 labelled `W`). Row: `W = 1 + \dfrac{0 + W}{2} = 1 + \dfrac{W}{2}`.
- L5: rows `\dfrac{W}{2} = 1`, then boxed `W = 2`. Chip "stage 2: 2 jumps".

## stage3 (5 lines)
- L0: line of 5 slots: exit · end · middle · end · exit. Labels W, M, W over the green slots.
- L1: arrows from the middle to both ends. Row `M = 1 + W`.
- L2: arrows from slot 1: left to exit ("done"), right to middle, each `\dfrac12`.
- L3: row `W = 1 + \dfrac{M}{2}`, then `W = 1 + \dfrac{1 + W}{2}` (the M visibly swaps for `1+W`).
- L4: rows `W = \dfrac32 + \dfrac{W}{2}`, `\dfrac{W}{2} = \dfrac32`, boxed `W = 3`. Chip "stage 3: 3 jumps".

## stage45 (5 lines)
- L0: line of 6 slots: exit · W · P · P · W · exit. The two P slots ("twins") get matching outlines.
- L1: arrows from the left P to slot 1 and to its twin. Row `P = 1 + \dfrac{W}{2} + \dfrac{P}{2}` (twin waits P).
- L2: rows `\dfrac{P}{2} = 1 + \dfrac{W}{2}` → `P = 2 + W`; `W = 1 + \dfrac{P}{2} = 1 + \dfrac{2+W}{2}` → `\dfrac{W}{2} = 2` → boxed `W = 4`. Chip "stage 4: 4 jumps".
- L3: back to the hexagon briefly: 5 green corners, the one missing corner (corner 4 in the walk above) purple, with arrows from BOTH block ends to it.
  Then the line of 7 slots: both exit slots coloured purple and labelled "same last corner", joined by a thin dashed arc over the top.
- L4: labels W P M P W; rows (still ≥ 48 px, below the line): `M = 1 + P`, `P = 1 + \dfrac{W}{2} + \dfrac{M}{2}` → `P = 3 + W`, `W = 1 + \dfrac{P}{2}` → boxed `W = 5`. Chip "stage 5: 5 jumps".
  (Spot waits for the record: W = 5, P = 8, M = 9 — these become the hill bars. Don't show P/M values here.)

## reveal (3 lines) — the strong motion beat
- L0: the five chips slide into one row: `1 + 2 + 3 + 4 + 5` (no "=" yet).
- L1: `= 15` lands; Answer badge "C · 15" with chime at the END of the line (after "fifteen").
- L2: small tag "exact computer check: 15" with a tiny checkmark (no other numbers).

## hill — Solution 2: the hill trick (10 lines)
Line of 7 slots for stage five (same as stage45 L3–L4), spots labelled 0…6 underneath only on L5–L6.
- L0: chips "1, 2, 3, 4, 5" with a "?" ; then the 7-slot line, empty bars above each slot.
- L1: exit bars height 0 labelled `0`. Row: "wait = 1 + average of neighbours".
- L2: bars rise to heights 0, 5, 8, 9, 8, 5, 0 (scale ~22 px per unit; tallest 9 → ~200 px) with numbers on top, left to right in sync with speech.
  Check row: `8 = 1 + \dfrac{5 + 9}{2} = 1 + 7`, with slot 2's bar and its two neighbours highlighted.
- L3: arrows between neighbouring bar tops labelled `+5, +3, +1, -1, -3, -5` (green up, purple down), appearing as spoken.
- L4: reason row under the check: `8 - 5 = 3` and `9 - 8 = 1`, so `3 - 1 = 2` ("climb in − climb out = 2"). Then all differences tag "−2 each time".
- L5: under each green slot, products appear: `1\times5`, `2\times4`, `3\times3`, `4\times2`, `5\times1` (matching bars 5, 8, 9, 8, 5).
- L6: for slot 2: a bracket "2 steps" to the left exit and "4 steps" to the right exit → boxed rule "wait = (steps to one exit) × (steps to other exit)".
- L7: first the stage-5 instance: tag "6 climbs, each 2 less: +5 … −5 (mirror)". Then generic stage k: a line of slots with "…", tag "k + 1 climbs",
  climbs `+k, +(k-2), …, -(k-2), -k` mirrored. Keep the generic one schematic (no specific k value).
- L8: frog on slot 1 of the generic line: bracket "1 step" left, "k steps" right → boxed `1 \times k = k`.
- L9: tag "big shapes: use the hill".

## traps (5 lines). One red card per choice, with its working:
- L0: A 10: `1+2+3+4 = 10` — "forgot stage 5".
- L1: B 12: `6 \times 2 = 12` — "every corner = 2 jumps?".
- L2: D 18: `6 \times 3 = 18` — "every corner = 3 jumps?" then "stages aren't equal".
- L3: the straightened line: frog steps back from slot 1 into the block, arrow "farther from new corners"; stage chips 1, 2, 3, 4, 5 growing.
- L4: E 21: `1+2+3+4+5+6 = 21` — "no stage 6: all green = done".

## variant — Your turn: an octagon (3 lines)
- L0: regular octagon (centre (560,470), radius 260, corners at −90° + 45°·i), frog on top corner.
- L1: two `\dfrac12` arrows to the neighbours. L2: text "expected jumps until all 8 corners?". No choices.
- Never show 28, 7 stages' sum, or stage chips 6/7 before `variant-answer`.

## try2 (pause, hold 12): PauseCard with the octagon + question text.

## variant-answer (3 lines)
- L0: octagon with a green block of corners, frog at an end, two purple exits.
- L1: line of slots, bracket "1 step" / "k steps" → `1 \times k = k`.
- L2: `1 + 2 + 3 + 4 + 5 + 6 + 7 = 28`; answer badge **28** + chime at line end.

## recap (3 lines)
- L0: a line with an exit at each end, a walker dot in the middle.
- L1: brackets "a steps" / "b steps" → boxed `\text{average wait} = a \times b`.
- L2: `<SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />`.
