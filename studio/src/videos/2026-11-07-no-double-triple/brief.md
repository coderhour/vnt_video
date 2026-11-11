# Builder brief: 2026-11-07-no-double-triple

Question `amc_practice_amc10_mixed_template:c2-022`. Answer **C = 61**. Variant (numbers 1 to 30) answer **18**.
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.

Line numbers below are 0-indexed within each scene (L0 = first line).

Choices (letters fixed): A 50, B 58, C 61, D 64, E 67.

Global rules for this video
- Never show 61 (or any running grand total) before `total` L2. No live counter. Per-family numbers (11, 5, 4, …) appear only on the line that says them.
- Never show 18 before `variant-answer` L3. Never show 59 anywhere (not scripted).
- "Core" = the number left after dividing out every 2 and every 3. On screen write it as a word ("core 5"), never as a letter m. No a, b, m letters on screen.
- **Grid convention (all grids):** the core sits in the bottom-left cell. One cell RIGHT = ×2, one cell UP = ×3. Row 0 (no threes) is the BOTTOM row; rows go upward. Draw small arrow labels once on `grid1` L0: "→ ×2" along the bottom, "↑ ×3" up the left side.
- **Chessboard colours:** a cell is GREEN (`#0cc281`, light fill ~25% + green border) when (number of twos + number of threes) is even, so the core cell is always green; otherwise PURPLE (`#7b61ff`, light fill). Same rule in every grid, never flip it.
- **Kept cells:** a bold dark outline + small white check badge (the `Check` from ui.tsx). Only add checks on the lines listed below.
- **Dominoes:** a rounded pill (stroke `#333`, 6 px, no fill or very light grey) drawn around the two cells, drawn in one at a time (stagger ~6 frames); leftover single cells get a dashed ring.
- Traps red `#ef4343`, correct answer success `#21c45d`. Numbers in cells ≥ 48 px (main grid) — gallery grids may use smaller cells but keep digits ≥ 40 px and the core label ≥ 48 px.
- Stage above y ≈ 860 (captions own the bottom). Use `\dfrac` if any fraction appears (none needed).

## Main grid geometry (core 1), used in grid1 / checker / dominoes
20 cells, cell size 104 px, gap 8 px. Left edge x = 140; bottom row's top y = 712 (so the grid spans y ≈ 152…816).
Row (bottom → top), columns from the left:
- row 0: 1, 2, 4, 8, 16, 32, 64 (7 cells)
- row 1: 3, 6, 12, 24, 48, 96 (6)
- row 2: 9, 18, 36, 72 (4)
- row 3: 27, 54 (2)
- row 4: 81 (1)
It's a staircase, left-aligned, longest row at the bottom. Right panel (x ≈ 1000…1860) is for rows of text/KaTeX.
Green cells (11): 1, 4, 16, 64 / 6, 24, 96 / 9, 36 / 54 / 81. Purple (9): 2, 8, 32 / 3, 12, 48 / 18, 72 / 27.
Dominoes (9, all horizontal): [1,2] [4,8] [16,32] / [3,6] [12,24] [48,96] / [9,18] [36,72] / [27,54]. Leftovers: 64, 81 (both green).
Check coordinates are not misleading: diagonal cells (e.g. 1 and 6) are NOT neighbours (×6). Don't draw any diagonal connectors.

## intro (3 lines)
- L0: a 10×10 board of the numbers 1–100 (small tiles), a few tiles light up as "picked" (seeded, deterministic).
- L1: two arrows pop between picked tiles: 5 → 10 labelled "×2" and 5 → 15 labelled "×3", both turn red with a ✗. Text "no doubles, no triples".
- L2: the 1–100 board morphs/fades into a small chessboard pattern (no numbers), hinting the idea. Don't show any count.

## question (4 lines) — poster: about 1 s into L3 (full prompt + all choices visible)
- L0: card "Question" + the prompt text (the bank prompt, KaTeX for `\{1,2,\dots,100\}`).
- L1: Mark-sweep "subset of {1, 2, …, 100}".
- L2: Mark-sweep "exactly 2 times" and "exactly 3 times".
- L3: Choices row A–E: 50, 58, 61, 64, 67.

## asked (3 lines)
- L0: two chips: `5 \;\&\; 10` with "10 = 2 × 5" red ✗ "clash"; then `5 \;\&\; 15` with "15 = 3 × 5" red ✗ "clash" (second chip appears on "Five and fifteen").
- L1: chip `5 \;\&\; 20`, "20 = 4 × 5", green ✓ "fine".
- L2: goal text: "Keep as MANY as possible. No clashing pair."

## try1 (pause, hold 10): PauseCard with the prompt + choices visible.

## families — Solution 1 (5 lines)
- L1: rule card: "divide out every 2 and every 3 → what's left is the **core**".
- L2: two worked rows: `72 = 8 \times 9 \times 1` → "core 1" (the 8 and 9 fade/strike, the 1 boxed green); `40 = 8 \times 5` → "core 5" (the 8 fades, 5 boxed).
- L3: a mini chain for core 5: `5 \xrightarrow{\times2} 10 \xrightarrow{\times2} 20` and `5 \xrightarrow{\times3} 15`, each with "core 5" under it. Caption-level text: "clashes stay inside a family".
- L4: a strip of the 33 cores as small chips: 1, 5, 7, 11, 13, 17, 19, 23, 25, 29, 31, 35, 37, 41, 43, 47, 49, 53, 55, 59, 61, 65, 67, 71, 73, 77, 79, 83, 85, 89, 91, 95, 97 (two rows if needed) with "33 cores". Then core 1 chip enlarges. NOTE: the chip "61" here is a core, not the answer; to avoid any hint, keep all chips the same neutral grey, no emphasis on 61.

## grid1 (4 lines)
- L0: cell "1" appears bottom-left; arrows "→ ×2" and "↑ ×3" (see geometry).
- L1: bottom row fills left to right as read: 1, 2, 4, 8, 16, 32, 64.
- L2: row 1 fills (3 … 96), then row 2 (9 … 72), then 27, 54, then 81 — timed to the words.
- L3: demo neighbours: highlight 6–12 (side by side, "×2") and 6–18 (one above, "×3") with red links, plus text "clash = neighbours (side by side, or one above the other)". No diagonal links.

## checker (4 lines)
- L0: cells flood with green/purple chessboard colours (diagonal wipe from the corner).
- L1: show two neighbour pairs, each one green + one purple, with a tag "always different colours"; then all purple cells dim to 30%.
- L2: count green row by row with small numbers at the right end of each row: 4 (row 0), 3, 2, 1, 1 → right-panel row `4+3+2+1+1 = 11`.
- L3: purple count "9" vs green "11"; green cells get their checks; label "core 1 keeps 11".

## dominoes — "Can we beat eleven?" (4 lines). The key "aha" visual.
- L0: checks fade; question tag "more than 11?" with a mix of a few green+purple cells blinking (no new number).
- L1: draw the first domino [1,2] slowly with "keeps at most 1" tag; then the rest stream in.
- L2: all 9 dominoes in place (see list), dashed rings on 64 and 81. Right panel: "9 dominoes + 2 leftovers".
- L3: row `9 + 2 = 11` → green box "at most 11". The green checks reappear: one per domino + both leftovers.

## others — "All thirty-three families" (6 lines)
Gallery layout, one shape group per line, the main grid shrunk to the top-left corner (keep "core 1: 11" label).
Every gallery grid uses the same convention (core bottom-left, ×2 right, ×3 up, parity colours).
- L0: core 5 grid: row0 5, 10, 20, 40, 80; row1 15, 30, 60; row2 45, 90. Dominoes: [5,10] [40,80] [20,60 vertical] [15,30] [45,90]. Checks on 5, 20, 80, 30, 45 (the green cells; exactly one per domino). Label "core 5: 5".
- L1: three small grids side by side, with dominoes and checks:
  - core 7: row0 7, 14, 28, 56; row1 21, 42, 84; row2 63. Dominoes [7,14] [28,56] [21,63 vertical] [42,84]. Keep (green) 7, 28, 42, 63 → "4".
  - core 11: row0 11, 22, 44, 88; row1 33, 66; row2 99. Dominoes [11,22] [44,88] [33,66]; leftover 99. Keep 11, 44, 66, 99 → "4".
  - core 13: row0 13, 26, 52; row1 39, 78. Dominoes [13,26] [39,78]; leftover 52. Keep 13, 52, 78 → "3".
- L2: four corner shapes of four, core 17, 19, 23, 25: row0 m, 2m, 4m; row1 3m (e.g. 17, 34, 68 / 51). Dominoes [2m,4m] and [m,3m] (vertical). Keep m and 4m (green) → "2 each". Draw one big (core 17) and three small.
- L3: core 29 (29, 58 / 87) and core 31 (31, 62 / 93). Colours: 29 green, 58 and 87 purple. Show "green 1, purple 2" then checks on 58, 87 (and 62, 93): "purple wins, 2 to 1". Domino [m, 2m], leftover 3m.
- L4: six pair chips: 35–70, 37–74, 41–82, 43–86, 47–94, 49–98 (the 49–98 chip highlighted as it's read), each a domino, check on the smaller one → "6 × 1".
- L5: sixteen loner chips: 53, 55, 59, 61, 65, 67, 71, 73, 77, 79, 83, 85, 89, 91, 95, 97, all checked → "16". Same neutral styling (61 is just a loner here, no emphasis).

## total (3 lines)
Right-panel rows, each appearing as said (Row helper, nowrap):
- L0: `11 + 5 + 4 + 4 + 3 = 27` (labels under: core 1, 5, 7, 11, 13).
- L1: `+\;8` (corners of four, 4 × 2), `+\;4` (corners of three, 2 × 2), `+\;6` (pairs), `+\;16` (loners).
- L2: `27 + 8 + 4 + 6 + 16 = 61`; the 61 appears only after the short pause; Answer badge "C · 61" + chime at the END of the line.

## sol2 — "Solution 2: count what you lose" (5 lines)
- L0: 1–100 board again (small tiles).
- L1: dominoes appear on the board as linked tile pairs, counter "dominoes: 39" (count up 0→39 is fine, it's not the answer); no overlaps.
- L2: one domino zooms: [1,2] → "lose at least 1".
- L3: row `100 - 39 = 61`; then the kept tiles (CHOSEN set from verify.py) glow green: exactly one per domino + all 22 leftovers.
- L4: tag "asked for the MOST → prove the ceiling".

## traps (6 lines). One red card per choice, with its working:
- L1: A 50: board with 51–100 shaded; "no clashes ✓, but 50 < 61".
- L2: E 67: 34–100 shaded; red link 34 ↔ 68 "34 × 2 = 68 ✗".
- L3: B 58: `58 < 61` "too small: we built 61".
- L4: D 64: `64 > 61` with a domino icon "ceiling is 61".
- L5: habit card: "Show it works AND show nobody can beat it."

## variant — "Your turn: one to thirty" (2 lines)
- L0: card: "Numbers 1 to 30" (KaTeX `\{1,2,\dots,30\}`). L1: "no doubles, no triples — the most you can pick?"
- No choices. Never show 18.

## try2 (pause, hold 12): PauseCard with the variant card visible.

## variant-answer (4 lines)
- L0: core 1 grid for 1–30: row0 1, 2, 4, 8, 16; row1 3, 6, 12, 24; row2 9, 18; row3 27. Dominoes [2,4] [8,16] [1,3 vertical] [12,24] [6,18 vertical] [9,27 vertical]. Show "green 6, purple 6" → "6".
- L1: small grids: core 5 (5, 10, 20 / 15, 30; dominoes [5,10] [15,30], leftover 20; keep 5, 20, 30 → 3), core 7 (7, 14, 28 / 21; dominoes [14,28] [7,21]; keep 7, 28 → 2), core 11 pair 11–22 → 1, core 13 pair 13–26 → 1.
- L2: loner chips 17, 19, 23, 25, 29 → 5.
- L3: row `6+3+2+1+1+5 = 18`; Answer badge **18** + chime at line end. Optional small check: `30 - 12 = 18` (12 dominoes).

## recap (3 lines)
- L0: three family grids (core 1, core 5, a pair) side by side with "can't clash across families".
- L1: core 1 grid with chessboard + dominoes; tags "bigger colour" and "dominoes check".
- L2: `<SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />`.
