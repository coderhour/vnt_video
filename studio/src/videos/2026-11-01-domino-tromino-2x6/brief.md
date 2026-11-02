# Build brief: 2026-11-01-domino-tromino-2x6

Question `amc_practice_amc10_counting_template:c2-017` (no figure in the bank). Answer **C = 53**.
Variant: 2×5 board with dominoes, L-trominoes AND 2×2 squares → **41**.
`narration.json` + `verify.py` are the contract (59 lines). Counting, so: draw boards and tiles, build tables row by row on the voice.

## Visual conventions (whole video)
- **Board**: 2 rows × n columns of square cells, light grey grid lines, cell ≈ 100–110 px for the main 2×6 board
  (smaller, ≈ 50–60 px, for mini boards in case lists). Row 0 = TOP row on screen, column 0 = LEFT. "Top-left square" = (row 0, col 0).
  "Standing" = vertical domino (one column, both rows). "Lying" = horizontal domino (one row, two columns).
- **Tile colours** (consistent everywhere): dominoes primary `#0cc281` (fill at ~70%, solid dark outline), L-trominoes secondary `#7b61ff`,
  2×2 squares (variant only) amber `#f5a524`. Each tile is ONE shape with a thick outline and a small inset gap, so tiles are countable.
  Never stack semi-transparent copies on the same board. Tiles drop/snap into place cell-aligned — never tween through half-cell positions.
- **Leftover board**: after a first tile, the remaining empty cells get a soft outline + a label pill ("2 × 5 left", "bumpy, 2 × 4 + 1", "nothing left").
- **Table** (sol1, sol2, variant): a horizontal table, one column per length n = 0…6, header row "length" and value row "ways".
  Each new cell fills on its own line with the working shown above or beside it in KaTeX, e.g. `2 + 1 + 2\times 1 = 5`.
  Colour the parts of each sum by where they come from: "one shorter" + "two shorter" in primary, the zigzag part `2\times(\ldots)` in secondary.
  Use arrows/brackets from the table cells being used to the working, so the kid sees which earlier counts are added.
- **Never show 53 (or 50, 59, 117) as a result before its line.** The table cell for length 6 stays "?" until sol1-table L7.
  Don't show the length-7 column anywhere before the traps scene.
- Math ≥ 48 px, `\dfrac` not needed (no fractions). Keep everything above y ≈ 860 (captions) and left of x ≈ 1880.

## Scenes

**intro**
- L0: empty 2×6 board; dominoes snap in one at a time to show ONE domino-only cover: standing, lying pair, lying pair, standing (1 + 2 + 2 + 1 = 6 columns). Then a counter pill "dominoes only: 13 ways" on "thirteen".
- L1: the dominoes fade, a purple L-tromino drops in at the top-left; a big "?" pill "with L's: ? ways". Do NOT show 53.
- L2: title card / Vantee greeting.

**question** (poster: about 2 s into L1, question text + board fully visible)
- Prompt card (left/top): "In how many ways can a 2 × 6 board be covered, with no gaps or overlaps, using 1 × 2 dominoes and L-shaped
  trominoes made of three squares? Pieces may be turned." (`2\times 6`, `1\times 2` in KaTeX).
- Right: empty 2×6 board, plus a sample domino and a sample L tile beside it.
- L3: choice chips A 13, B 50, C 53, D 59, E 117 (no highlight).

**asked**
- L0: board with dimension labels "2" (height) and "6" (length); "12 squares" pill.
- L1: domino in its 2 orientations (standing, lying); the L in its 4 turns (each a 2×2 box missing one corner: missing bottom-right,
  bottom-left, top-left, top-right) with label "4 turns".
- L2: "each square covered exactly once" and a small domino-only board with a green check + "dominoes only counts too ✓".

**try1** — pause card, question + board + chips visible, 10 s ring.

**sol1-cases** (chapter "Solution 1: the top-left square"). Main board 2×6 on the left half; case strip on the right.
- L0: top-left cell (0,0) pulses/highlighted (Mark). Label "who covers this square?".
- L1: case 1 — standing domino on col 0; remaining cols 1–5 outlined, label "2 × 5 left".
- L2: case 2 — lying domino on (0,0)-(0,1). On "Nothing else fits": a ghost standing domino and a ghost L try to cover (1,0) and each gets a red ✗
  (both would need (0,0) or (0,1), already taken). Then the second lying domino snaps in at (1,0)-(1,1). Label "2 × 4 left".
- L3: case 3 — L-trominoes containing (0,0), drawn in the 2×2 box of columns 0–1:
  - good L #1: (0,0),(1,0),(0,1) [whole first column + top of col 1]
  - good L #2: (0,0),(1,0),(1,1) [whole first column + bottom of col 1]
  - dead L: (0,0),(0,1),(1,1) — (1,0) is left isolated: flash that cell red `#ef4343`, red ✗ over the tile.
- L4: take good L #1: (0,0),(1,0),(0,1). The empty cell (1,1) sticks out (the bump). A lying domino (1,1)-(1,2) fills it; now (0,2)
  sticks out — arrow from (1,1) to (0,2): "the bump moves along" (one domino step only).
- L5: a second L closes it from the CURRENT bump: L {(0,2),(0,3),(1,3)} → a 4-long zigzag (cols 0–3). Outline the block.
- L6: row of the four zigzag lengths as mini boards, ONE representative each (lengths 3, 4, 5, 6): L, then 0/1/2/3 lying dominoes
  alternating rows, then the closing L. Label each "3", "4", "5", "6".
- L7: each mini zigzag flips top-to-bottom into its mirror twin next to it (one flip animation), then a "× 2" badge on each length.
  Never show four separate orientations; it's always a pair.
  Summary strip (stays for the next scene): "standing → 1 shorter", "lying pair → 2 shorter", "zigzag (×2) → 3, 2, 1 or 0 left".

**sol1-table**
- L0: the table appears empty: columns 0…6, values "?" (length 6 is the goal, highlighted outline).
- L1: a zigzag mini-board exactly filling a 2×3 board + "nothing left = 1 way" card; then column 0 fills with **1**.
- L2: column 1 → 1 (mini: one standing domino). Column 2 → `1 + 1 = 2` (mini: two standing / lying pair).
- L3: rule card (stays): `\text{ways}(n) = \text{ways}(n-1) + \text{ways}(n-2) + 2\times(\text{all ways the zigzags leave})`.
  Words fine: "one shorter + two shorter + 2 × (zigzag leftovers)".
- L4: length 3: `2 + 1 + 2\times 1 = 5` with arrows from cells 2, 1, and 0.
- L5: length 4: `5 + 2 + 2\times(1+1) = 11`, arrows from cells 3, 2, and {1, 0}.
- L6: length 5: `11 + 5 + 2\times(2+1+1) = 24`, arrows from 4, 3, {2, 1, 0}.
- L7: length 6: `24 + 11 + 2\times(5+2+1+1)` written out, cell still "?".
- L8: `= 24 + 11 + 18 = 53`; the "?" becomes **53**; answer badge "53" + chip C green, chime at the END of the line.
  Final table: 1, 1, 2, 5, 11, 24, 53.

**sol2** (chapter "Solution 2: flat and bumpy boards")
- L0: two small boards side by side labelled "flat" (2×4) and "bumpy" (2×4 with one extra cell sticking out to the LEFT of the top row).
- L1: highlight the bump cell. Label "bumpy m = flat 2 × m + 1 square on the left" and small "(top or bottom: same count)".
- L2: flat board: standing / lying pair → flat; then good L #2 on (0,0),(1,0),(1,1) → leftover is (0,1) (top-row bump) + cols 2…: label "bumpy, 2 shorter".
- L3: "× 2" (good L #2 gives the mirror bumpy board). Rule row: `\text{flat}(n) = \text{flat}(n-1) + \text{flat}(n-2) + 2\times\text{bumpy}(n-2)`.
- L4: bumpy board with the lonely square highlighted: lying domino covers it → new bump one column right on the other row, "bumpy, 1 shorter".
- L5: an L covers the lonely square + the whole next column → "flat, 1 shorter". Rule row: `\text{bumpy}(m) = \text{bumpy}(m-1) + \text{flat}(m-1)`.
- L6–L7: two-row table: "flat" row 1, 1, 2, 5, 11, 24, ? (copied from sol1, faded slightly) and "bumpy" row for m = 1…4 filling on the voice:
  L6: bumpy1 = 1 (mini L-shape board), bumpy2 = `1 + 1 = 2`. L7: bumpy3 = `2 + 2 = 4`, bumpy4 = `4 + 5 = 9`
  (arrows from the bumpy cell to the left and the flat cell diagonally above-left).
- L8: `\text{flat}(6) = 24 + 11 + 2\times 9 = 53`, cell fills 53, green check "same answer".
- L9: pill "long boards → two short rules".

**traps** (chapter "Common traps") — choice chips across the top, each turns red on its line.
- L1: chip A 13 red. Domino-only mini board. L2: a dominoes-only table row `1, 2, 3, 5, 8, 13` for lengths 1…6, filling on the six spoken numbers,
  small "each = the two before added" note.
- L3: chip E 117 red. Extend the sol1 table by a length-7 column (only now).
- L4: `53 + 24 + 2\times(11+5+2+1+1) = 53 + 24 + 2\times 20 = 117` (the "20" must be visible when "double twenty" is spoken).
- L5: chips B 50 and D 59 red together, label "near misses"; beside them a green "53 ✓ ✓" (both methods).
- L6: habit pill "list every first tile → count each case once".

**variant** (chapter "Your turn: add a square") — **do NOT show the original choice chips** in any variant scene.
- L0: tile tray: domino, L, and NEW amber 2×2 square ("new!").
- L1: empty 2×5 board, question card: "Cover a 2 × 5 board with dominoes, L-trominoes and 2 × 2 squares. How many ways?"

**try2** — pause card with the variant board + tray, 12 s.

**variant-answer** (chapter "Add a square: the answer")
- L0: top-left case strip now has a square on columns 0–1 → "2 shorter" next to the lying pair: "two-wide starts: 2".
- L1: a zigzag with a bump cell; an amber square hovers over the bump and gets a red ✗ (it would overlap the tile already there). "zigzags: same, × 2".
- L2: rule card: `\text{one shorter} + 2\times\text{two shorter} + 2\times(\text{zigzag leftovers})` with "TWO" emphasised.
- L3: new table, lengths 0…5. 0 → 1, 1 → 1, 2 → `1 + 2\times 1 = 3`, 3 → `3 + 2\times 1 + 2\times 1 = 7`.
  (Voice says "one plus two" and "three plus two plus two"; show `2\times1` with its value 2 underneath.)
- L4: 4 → `7 + 2\times 3 + 2\times(1+1) = 17`.
- L5: 5 → `17 + 2\times 7 + 2\times(3+1+1) = 41`; answer badge **41**, chime at the end of the line.
- L6: confetti.

**recap**
- L1: mini board with the top-left square highlighted and three arrows: standing / lying pair / zigzag ×2.
- L2: the table 1, 1, 2, 5, 11, 24, 53 sliding in, "build up from short boards".
- L3: sign-off.

## YouTube
Title: `Dominoes and L-Trominoes on a 2×6 Board | AMC 10-Style Level 4` (in narration.json and meta.json).
