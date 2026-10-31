# Build brief: 2026-10-30-three-power-ends-01

Question `amc_practice_amc8_mixed_template:c1-339` (no figure). Answer **C = 20**. Variant: 9^n ends in 01 → **10**.
`narration.json` + `verify.py` are the contract. Number theory, so no geometry: use digit tiles,
a 4-step loop wheel and a "last two digits" table built row by row on the voice.

Visual conventions for the whole video
- Show every product in full with KaTeX (`81 \times 81 = 6561`), and highlight the last two digits
  (primary `#0cc281` box) while the leading digits fade to ~35% grey. The voice only says "ends in sixty-one".
- Write "01" as two digit tiles `0` `1`. Spoken "zero one".
- Powers as `3^{4}`, `3^{8}` … ≥ 56 px. Never show `01`/`20` as a result before the line that says it.

## Scenes

**intro**
- L0: the tiles `3`, `9`, `27`, `81` pop in one by one (labels `3^1 … 3^4` small underneath), growing in size.
- L1: a big `?? 01` style target: `\ldots 01` with the 01 in secondary `#7b61ff`, plus a question mark. Do NOT show 3^20.
- L2: title card / Vantee greeting.

**question**
- Prompt card: "What is the smallest positive integer n for which 3^n ends in the digits 01?" (KaTeX `3^n`, `01`).
- L2: choice chips A 4, B 10, C 20, D 40, E 100 (no highlight).

**asked**
- L1: a row `3 → 9 → 27 → 81 → \ldots` with "× 3" arrows; a box around the last two digits slot labelled "want: 0 1".
- L2: the word FIRST / "smallest n" highlighted (Mark sweep) on the prompt.

**try1** — pause card, question + choices visible, 10 s ring.

**sol1-digit** (chapter "Solution 1: last digit first")
- L1: rule card: "last digit of a product depends only on the last digits". Example small: `27 × 3 = 81` with the 7 and 3 and 1 highlighted.
- L2–L3: build a loop wheel with 4 nodes: `3 → 9 → 7 → 1 → (back to 3)`. Show the working beside each step:
  `9 × 3 = 27` (7 highlighted) on L2, `7 × 3 = 21` (1 highlighted) and `1 × 3 = 3` on L3.
- L4: the arrow from 1 back to 3 closes the loop; label "loop of 4".
- L5: a row of exponents 1…28 where 4, 8, 12, 16, 20, 24, 28 light up (the 1-node of the wheel). Label "multiples of 4". Run it past 20 so 20 is not singled out.

**sol1-test**
- L1: rule card: `\ldots ab \times \ldots cd`: only the last two digits matter; the rest are hundreds. Small example `181 × 3 = 543` vs `81 × 3 = 243` — both end in 43.
- L2: table starts. Row 1: `3^4 = 81` → last two `81`. Red-ish small "not 01 yet" note.
- L3: show "×81 = jump 4 powers" label on a curved arrow between rows (`3^{4+4} = 3^4 \times 81`).
- L4: row `3^8`: `81 \times 81 = 6561` → `61`.
- L5: row `3^{12}`: `61 \times 81 = 4941` → `41`.
- L6: row `3^{16}`: `41 \times 81 = 3321` → `21`.
- L7: on the last-two column, highlight tens digits 8, 6, 4, 2 with small "−2" arrows between them.
- L8: row `3^{20}`: `21 \times 81 = 1701` → `01` revealed AT the word "zero one" (strong beat, success green).
- Keep rows one idea each; the table must fit left of x ≈ 1880 and above y ≈ 860.

**sol1-answer** — answer reveal `n = 20`, chip C highlighted green, soft chime at the end of the line.

**sol2** (chapter "Solution 2: just add eighty")
- L0: `81 = 80 + 1`.
- L1: `N \times 81 = N \times 80 + N`.
- L2: examples: `21 \times 80 = 1680`, `61 \times 80 = 4880` — last two digits `80` highlighted. Caption-style note: "ends in 1 → ×80 ends in 80".
- L3: big rule: "×81 → add 80 to the last two digits" (only for numbers ending in 1; show "(ends in 1)" small).
- L4: a jump track: `1 → 81 → 161 → 241 → 321 → 401`, built hop by hop on L4–L6, each hop labelled "+80" and "4 powers".
  Under each value, its last two digits: 01(start) 81 61 41 21 01. Keep the final `401 → 01` hidden until L6's "four hundred".
  Draw an explicit "start: 1" tile and five "+80" hop arrows so the kid can count five hops. 161/241/321/401 are unspoken working values
  (same treatment as 6561: shown, last two digits highlighted; the voice names only the last two digits).
- L5: running total of eighties: `80k` must end in `00`.
- L6: `80, 160, 240, 320, 400` appear one by one on the voice; 400 boxed.
- L7: `400 = 5 \times 80`, `5 \times 4 = 20`, `3^{20}`.
- L8: tip pill "power ends in 1 → multiply becomes add".

**traps** (chapter "Common traps") — one red trap card per choice, in order:
- L1: card A **4**: `3^4 = 81` → tens digit 8, "ends in 1, not 01".
- L2–L3: card B **10**: `10` is not a multiple of 4 (show the loop wheel mini, 10 lands on 9);
  L3: `3^{10} = 59049` with `49` highlighted.
- L4: cards D **40** and E **100** appear amber (not red): "they DO end in 01".
- L5: `3^{40} = 3^{20} \times 3^{20}` → `\ldots01 \times \ldots01 = \ldots01`.
- L6: `3^{100} = 3^{20} \times 3^{20} \times 3^{20} \times 3^{20} \times 3^{20}` (or `(3^{20})^5`) → ends in 01.
- L7: list `20, 40, 60, 80, 100` with 20 circled green, "smallest".
- L8: habit pill "test in order, stop at the first one that works".

**variant** (chapter "Your turn: powers of nine")
- New card: "What is the smallest positive n for which 9^n ends in 01?" **Do NOT show the original choice chips** in any variant scene
  (10 was the original's wrong choice B; it is the right answer here).

**try2** — pause card with the variant question, 12 s.

**variant-answer**
- L0–L1: loop wheel with 2 nodes `9 → 1 → 9`; working `9 \times 9 = 81`. L1 label "loop of 2 → n even".
- L2: `9^2 = 81`; "+80 per jump of 2 powers".
- L3: "start: 1" tile, then five "+80" hops: `9^2`→81, `9^4`→61, `9^6`→41, `9^8`→21, `9^{10}`→01, built on the five spoken numbers; hops countable.
- L4: `5 \times 2 = 10`, answer `n = 10` (chime at line end).
- L5: `9^{10} = (3 \times 3)^{10} = 3^{20}` ✓.
- L6: confetti.

**recap**
- L1: mini loop wheel (3, 9, 7, 1) with "which powers to test".
- L2: mini table "keep the last two digits, test in order".
- L3: sign-off.

## YouTube
Title: `When Does 3^n End in 01? | AMC 8-Style Level 4` (already in narration.json)

Description:
Powers of three grow huge fast, so how can we ever tell when one ends in 01?
Vantee shows two tricks: follow the loop of the last digit, then watch the last two digits step down by twenty.
Then try a powers-of-nine challenge on your own!
