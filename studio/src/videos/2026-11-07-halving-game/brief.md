# Builder brief: 2026-11-07-halving-game

Question `amc_practice_amc10_mock_test_template:c2-100`. Answer **C = 33**. Variant answer **67**.
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.

Line numbers below are 0-indexed within each scene (L0 = first line).

Choices (letters fixed): A 25, B 31, C 33, D 34, E 50.

Global rules for this video
- Never show 33 (or a running count reaching it) before `count` L4. Never show 67 before `variant-answer` L2.
- The central object is a **row of number tiles** (rounded squares, number ≥ 56 px inside). Tile states:
  unknown = light grey outline; **red `#ef4343` = losing** ("player to move loses"); **green `#21c45d` = winning**.
  Use solid-ish fills (e.g. 85% tint + white number) so red/green read instantly. Zero is a tile too, and it is red.
  NOTE: red here is NOT "trap" colour semantics; in the `traps` scene, mark trap cards with a red border + ✗ icon
  and keep the red/green tiles inside them small, so the two meanings don't blur.
- Moves are drawn as curved arrows from a tile to the tile(s) it can reach: the `-1` arrow arcs ABOVE the row to the left
  neighbour, the halving arrow (label "½") arcs BELOW the row. Draw them in neutral dark `#333333` at 70% opacity, never red/green.
- "Twos" = the number of factors of 2. Show it as small purple `#7b61ff` dots (or "×2" chips) under each tile, one dot per two
  (8 → 3 dots, 12 → 2 dots, odd → none). Purple is the "twos" colour everywhere.
- Halving rounds down: `\lfloor 13/2\rfloor = 6`. Spoken "halve it" = `\lfloor k/2\rfloor` on screen at least once (question scene).
- Stage above y ≈ 860; numbers/maths ≥ 48 px. Use `\dfrac` if any fraction appears. No live counter that sweeps through choice values.

Tile row layout (reuse in table, pattern, prove): 17 tiles 0…16 in one row, centred, tile 96 px, gap 12 px
(17·96 + 16·12 = 1824 px → x from 48 to 1872; if too tight with arrows, use 88 px tiles, gap 10). Row centre y ≈ 430,
arrows above and below need ~140 px each. Twos-dots sit just under each tile (y ≈ 500) in the `pattern` scene only.

## intro (3 lines)
- L0: a single big tile "n" in the centre, two small player chips "Player 1" / "Player 2" on either side; a "0" tile at far left
  with a small trophy/star. Arrows hop the "n" tile leftwards a couple of times (deterministic, e.g. 9 → 8 → 4) to suggest the race.
- L1: "Player 2" chip pulses with "can ALWAYS win" tag.
- L2: Vantee intro text; the tiles 0…6 fade in as a teaser row, all grey (unknown). No colours yet.

## question (4 lines) — poster: about 1 s into L3 (full prompt + rules + all choices visible)
- L0: card "Question" + the prompt text (plain wording of the bank prompt).
- L1: two move chips: `k \to k-1` and `k \to \lfloor k/2 \rfloor`, with an example under it: `13 \to 12` or `13 \to 6`.
- L2: Mark-sweep "The player who writes 0 wins".
- L3: Mark-sweep "second player always win" + "n from 1 to 100"; Choices row A–E: 25, 31, 33, 34, 50 (all on screen by poster time).

## asked (3 lines)
- L0: "Goal: starting numbers where Player 1 is stuck." Small tree: n → two arrows → both lead to "Player 2 wins".
- L1: Define tag **losing number** = red tile mini-legend "player to move loses (if the other plays well)".
- L2: "Count losing numbers from 1 to 100" — show `1, 2, 3, …, 100` with a "?" count badge.

## try1 (pause, hold 10): PauseCard with the prompt + choices visible.

## table — Solution 1: build a table (8 lines). Key visual: tiles 0…16 colouring up from the left.
- L0: the row of 17 grey tiles appears (left to right).
- L1: legend top-right: red tile "player to move LOSES", green tile "player to move WINS".
- L2: tile 0 turns red (label under it "game over").
- L3: arrow 1 → 0 (−1); tile 1 turns green.
- L4: from 2: both arrows (−1 and ½) land on tile 1 (draw both, two arcs to the same tile); tile 2 turns red.
- L5: rule box (two rows): "green ⇐ SOME move → red" / "red ⇐ EVERY move → green". Keep it on screen for L6–L7 (top-left, compact).
- L6: 3 → 2 (−1) green; 4 → 2 (½) green; 5 → 2 (½, `\lfloor 5/2\rfloor=2`) green; then 6 → 5 and 6 → 3, both green → 6 red.
  Time the four colourings on the words "Three", "four", "five", "Six…Red!".
- L7: tiles 7…16 colour one by one (~0.2 s each, left to right) with their decisive arrow briefly shown:
  7→6 G, 8→7,4 R, 9→8 G, 10→9,5 R, 11→10 G, 12→6 G, 13→6 G, 14→13,7 R, 15→14 G, 16→8 G.
  Then a summary chip: "red: 2, 6, 8, 10, 14".

## pattern (4 lines)
- L0: outline-highlight (purple ring) the even GREEN tiles 4, 12, 16 with a "?" over them; red tiles 2, 6, 8, 10, 14 get a soft glow.
- L1: show `6 = 2\times 3` above tile 6 and one purple dot under it.
- L2: `8 = 2\times2\times2` (3 dots), `4 = 2\times 2` (2 dots), `12 = 2\times2\times3` (2 dots), `16 = 2\times2\times2\times2` (4 dots).
  Fill in dots for ALL tiles 1…16 here (odd tiles: 0 dots; 2, 10, 14: 1 dot; 6: 1; 4, 12: 2; 8: 3; 16: 4).
  Factorisations only for 4, 8, 12, 16 (and 6 from L1), stacked so they don't overlap.
- L3: big rule card (strong motion beat #1): "**red ⇔ odd number of 2s**" (purple "2s"), and dot counts under red tiles
  flash 1, 1, 3, 1, 1.

## prove — Solution 1: why it works (7 lines)
Work with three example tiles drawn large (tile ~140 px): focus row 4, 6, 7, 8 then 12, 13.
- L0: tag "pattern ≠ proof".
- L1: big tile 8 (red, 3 dots). Arrow −1 → tile 7: "odd, 0 twos".
- L2: tile 7 turns green ("0 is even"). Arrow ½ → tile 4: dots go 3 → 2 (one dot pops off), tile 4 turns green.
- L3: summary row: "from red: every move → green" with a green check.
- L4: tile 12 (green, 2 dots), arrow ½ → 6: dots 2 → 1, tile 6 turns red. "even → odd".
- L5: tile 13 (green, 0 dots). Two arrows: −1 → 12 and ½ → 6 (`\lfloor 13/2\rfloor = 6`, note "= half of 12").
- L6: dots under 12 (2) and 6 (1): "differ by one 2"; 6's count is odd → 6 glows red, arrow 13 → 6 thickens: "hand over the red".
  Then small chip at the side: `1 \to 0` "write 0, win".
  Summary row: "from green: some move → red".

## count — Solution 1: count them (5 lines)
Three group rows on the left, each with its count chip on the right (counts appear only on their line):
- L1: row "one 2": `2, 6, 10, \dots, 98` and working `50 - 25 = 25` with labels "even" / "multiples of 4". Chip **25**.
- L2: row "three 2s": `8, 24, 40, 56, 72, 88`. Chip **6**.
- L3: row "five 2s": `32, 96`. Chip **2**. Grey note: "seven 2s: 128 > 100".
- L4: `25 + 6 + 2 = 33`, then answer badge **C · 33** with chime at the END of the line (after "thirty-three… Choice C").
  Strong motion beat #2. Don't show the sum's result before the word "thirty-three".

## double — Solution 2: the doubling trick (8 lines)
- L0: tile 6 → "×2" arrow → tile 12.
- L1: dots: 6 has 1, 12 has 2 (one dot added). Second example 3 (0 dots, green) → 6 (1 dot, red). Text "×2 adds one 2: flips odd ↔ even".
  Also show green → red and red → green tile colours flipping.
- L2: row: `\text{reds}(1..100) = \text{doubles of greens}(1..50)`. (Write as `R(100) = G(50)` with a small key: R(N) = reds from 1 to N, G = greens.)
- L3: `G(50) = 50 - R(50)` → so `R(100) = 50 - R(50)`.
- L4: `R(50) = 25 - R(25)`, then rows appear for `R(25) = 12 - R(12)`, `R(12) = 6 - R(6)`, `R(6) = 3 - R(3)`, `R(3) = 1 - R(1)`, `R(1) = 0`.
  Keep this compact (right panel, rows ≥ 48 px; if they don't fit, show only the first two rows and "…").
- L5: halving chain chips: 50 → 25 → 12 → 6 → 3 → 1 with alternating sign badges (−, +, −, +, −) appearing between them.
- L6: `50 - 25 + 12 - 6 + 3 - 1 = 33` (the "= 33" appears on "Thirty-three again!"; it's after the reveal, so fine).
- L7: tag "huge ranges (1 to 1,000,000)".

## traps (6 lines). One red-bordered card per choice, with its working:
- L1: A 25: only `2, 6, 10, \dots, 98` (one 2) — "forgot 8, 24, … and 32, 96".
- L2: B 31: `33 - 2`: "missed 32, 96" — show `32 = 2^5` with 5 purple dots, "5 is odd!".
- L3: D 34: `33 + 1` — small tiles 1 → 0 with tile 1 green: "1 is a WIN".
- L4: E 50: "all evens" — small tiles 4 → 2 (½), tile 4 green.
- L5: habit card: "Table → pattern → PROOF".

## variant — Your turn: one to two hundred (2 lines)
- L1: prompt card: same rules, "n from 1 to 200: how many second-player wins?". No choices. No 67.

## try2 (pause, hold 12): PauseCard with the variant prompt visible.

## variant-answer (4 lines)
- L0: halving chain chips: 200 → 100 → 50 → 25 → 12 → 6 → 3 → 1.
- L1: `100 - 50 + 25 - 12` (signs appear in turn).
- L2: `\dots + 6 - 3 + 1 = 67`; answer badge **67** + chime at the END of the line.
- L3: check row by groups: `50` (one 2) `+ 13` (three 2s) `+ 3` (five 2s) `+ 1` (128: seven 2s) `= 67`.

## recap (3 lines)
- L0: mini tile row 0…10 coloured, with "small cases → pattern".
- L1: two rows: "red: every move → green", "green: some move → red" (red/green tiles as icons).
- L2: `<SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />`.
