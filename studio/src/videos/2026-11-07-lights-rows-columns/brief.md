# Builder brief: 2026-11-07-lights-rows-columns

Question `amc_practice_amc10_counting_template:c1-452`. Answer **B = 247**. Variant answer **39**.
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.

Line numbers below are 0-indexed within each scene (L0 = first line). 58 lines.

Choices (letters fixed): A 169, B 247, C 265, D 338, E 384.

Global rules for this video
- The figure is a 3×3 grid of round lamps. Row 1 = top, row 3 = bottom; column 1 = LEFT, column 3 = right.
  "Its first light" = the leftmost lamp of a row. Keep this orientation everywhere.
- Lamp colours: ON = warm amber/yellow (e.g. `#ffc53d` fill with a soft glow), OFF = light grey fill with grey outline.
  A "full" row/column highlight = rounded band behind the three lamps in secondary purple `#7b61ff` (translucent).
  Never use success green `#21c45d` for anything but the 247 badge (reveal L3), the "same answer" check on 247 (ie-sum L1) and the variant 39 badge.
  Primary `#0cc281` is fine for UI accents (pills, "loser" counters can be neutral grey/ink). Trap cards `#ef4343`.
- Never show 247 before `reveal` L3 (chime at the END of that line). Never show 39 before `variant-answer` L4.
- 265 and 384 are choice values that appear mid-method by design. Show them in neutral ink only, never green,
  never as an answer badge. 265 gets a small grey tag "losers — not the answer" on `reveal` L1.
- No running counter that ticks through numbers. Totals appear as finished values when spoken.
- Every number spoken is on screen at that moment; don't put extra numbers on screen that the voice doesn't say
  (exception: the small multiplicities like "×3", "×9" that are the visible where-from of a spoken product).
- KaTeX ≥ 48 px, `\dfrac` not needed (no fractions). Stage above y ≈ 860. Rows of maths end before x ≈ 1880.
- When showing "a pattern", draw a mini 3×3 lamp grid (≈ 150 px) rather than text. Example patterns must actually
  satisfy what the line says (verify.py's enumeration is the truth; check each example by hand).

## intro (3 lines)
- L0: big 3×3 lamp grid centred; lamps flicker into a random-looking (seeded) on/off pattern, then settle all OFF.
- L1: six purple bands sweep in one after another (3 rows, 3 columns), each with tag "64"; a tally "6 × 64 = 384" appears,
  then a red stamp "too many!" on 384. (384 neutral/red, never green.)
- L2: bands fade; small tagline "count overlaps once".

## question (4 lines) — poster: about 1 s into L3 (full prompt + grid + all choices visible)
- L0: card "Question" + prompt text (left), lamp grid (right, ~360 px).
- L1: Mark-sweep "3 × 3 grid of 9 lights" and "on or off".
- L2: Mark-sweep "at least one full row" and "at least one full column". On the grid, the top row lights up (purple band), resets,
  then the left column lights up (band), resets.
- L3: Choices row A–E: 169, 247, 265, 338, 384 (Tex).

## asked (3 lines)
- L0: "Goal: count whole patterns of all 9 lights."
- L1: three mini grids side by side, each tagged "wins": (a) row 2 full + some others on (e.g. also lamp r1c3),
  (b) column 3 full, (c) row 1 AND column 1 full (a cross-ish L, 5 lamps on). One loser mini grid with a red ✗
  (e.g. diagonal r1c1, r2c2, r3c3 on).
- L2: each lamp shows a tiny "×2"; row: `2\times2\times\cdots\times2 = 2^9 = 512`. "512 patterns in all".

## try1 (pause, hold 10): PauseCard with the prompt, grid and choices visible.

## rows — Solution 1: count the losers (5 lines)
- L0: title tag "Losers = no full row AND no full column". Grid with every row and column marked with a small grey ✗ end-cap.
- L1: isolate ONE row (row 1, 3 lamps). Show all 8 on/off strings for that row as a neat 2×4 or 1×8 strip of mini rows
  (000…111). Row: `2\times2\times2=8`.
- L2: the all-on strip (111) gets crossed out in red; the remaining 7 keep a neutral ink outline; tag "7 safe choices".
- L3: three rows each labelled "7"; row `7\times7\times7=343`; tag "no full row".
- L4: one example from the 343 with a full column: column 1 all on, rows 100, 110, 101 (row1 = on,off,off; row2 = on,on,off;
  row3 = on,off,on) — no row full, column 1 full. Purple band on column 1, "?" tag.

## cols (5 lines)
- L0: column 1 lamps locked ON (purple band, small lock icon). The other 6 lamps grey.
- L1: for one row, show its remaining two lamps' 4 options: off-off, on-off, off-on, on-on; on-on crossed out in red
  ("row full!"). Tag "3 choices per row".
- L2: row `3\times3\times3 = 27`. Then three small "column 1 / 2 / 3" mini grids, each with its column band, tagged 27;
  row `27+27+27=81` (or `3\times27=81`).
- L3: the double-counted pattern: columns 1 and 2 full, column 3 all off (every row = on,on,off). Show it appearing in BOTH the
  "column 1" and "column 2" piles (two copies with a red "counted twice" link). Then the three such patterns as mini grids:
  {cols 1,2}, {cols 1,3}, {cols 2,3} (the other column all off). Tag "3".
- L4: a struck-out mini grid with all 3 columns full (= all 9 on) tagged "full rows → not here". Row `81-3=78`;
  tag "full column, no full row".

## reveal (4 lines) — the strong motion beat at L3
- L0: row `343-78=265`. (neutral ink)
- L1: grey tag on 265: "losers: NO full row or column — not the answer". A loser example mini grid (e.g. r1c1, r1c2, r2c3, r3c1 on).
- L2: big bar or block "512 all patterns" split into "265 losers" (grey) and "? winners" (amber outline). No 247 yet.
- L3: row `512-265=247`; Answer badge "B · 247" (green) with chime at the END of the line (after "Choice B").

## ie-pairs — Solution 2: inclusion and exclusion (6 lines)
Layout: lamp grid left (~360 px); a running signed ledger on the right that grows one row per level:
`+384`, `-192`, `+74`, `-24`, `+6`, `-1` (neutral ink; signs in purple/red as you like, NOT green).
- L0: six purple bands appear, each becoming a labelled bubble: R1, R2, R3, C1, C2, C3.
- L1: row 1 band locked ON; the other 6 lamps each "×2"; `2^6=64`.
- L2: ledger row `6\times64=384`. A two-band example (row 1 + column 1 both on) flashes "counted twice!".
- L3: two rows locked (rows 1 and 2): 3 free lamps (row 3) "×2" each → `2^3=8`. Then two columns (cols 1, 2) → 8.
- L4: row 2 + column 2 locked: the cross (5 lamps r2c1,r2c2,r2c3,r1c2,r3c2) glows; 4 corner lamps free → `2^4=16`. Label "cross: 5 lights".
- L5: rows `6\times8=48` ("3 row pairs + 3 column pairs") and `3\times3\times16=144` ("3 rows × 3 columns").

## ie-more (6 lines)
- L0: ledger row `-\,(48+144) = -192`. Tag "took away too much → add back triples".
- L1: rows 1, 2 + column 1 locked: 7 lamps on (rows 1–2 fully, plus r3c1); free r3c2, r3c3 → `2^2=4`; `9\times4=36`
  with where-from "3 row pairs × 3 columns = 9".
- L2: row + two columns (example row 1 + cols 1, 2): `9\times4=36`; all three rows → 1 (all on); all three columns → 1.
  Ledger row `+(36+36+1+1)=+74`.
- L3: two rows + two columns (rows 1,2 + cols 1,2): 8 lamps on, only r3c3 free → 2; `9\times2=18` ("3 row pairs × 3 column pairs = 9").
- L4: "3 rows + 1 column" ×3 and "1 row + 3 columns" ×3 = 6, each = all on (full grid flash); ledger `-(18+6)=-24`.
- L5: ledger `+6` ("any 5 lines → all on, 6 ways") and `-1` ("all 6"). Full grid lit.

## ie-sum (3 lines)
- L0: one row: `384-192+74` (appear term by term).
- L1: continues `-24+6-1=247`. Small green check "same answer" next to 247 (247 is already revealed, green ok here). No chime.
- L2: two small cards: "Count losers — shorter here" and "Inclusion–exclusion — works for any overlaps".

## traps (7 lines). One red card per choice, with its working:
- L0: header only.
- L1: A 169: `512-343=169`; mini grid with a row band only; "rows only"; columns forgotten (column bands greyed with "?").
- L2: C 265: "the losers" with `343-78=265`; "forgot `512-265`".
- L3: D 338: `169+169=338` ("rows" + "columns").
- L4: on the D card, the row-1 + column-1 cross mini grid with "counted twice" tag. (Do NOT show how many such patterns there are.)
- L5: E 384: `6\times64=384`, "no overlaps taken away".
- L6: habit card: "Overlaps? Did I count anything twice?"

## variant — Your turn: two rows of three (2 lines)
- L0: a NEW 2×3 lamp grid (2 rows, 3 columns), all off. Row 1 = top, column 1 = left.
- L1: text "at least one full row or full column?" with purple bands flashing once on row 1, then column 3. No choices.
- Never show 39, 49, 24, 25 or 64 before the variant-answer scene.

## try2 (pause, hold 12): PauseCard with the 2×3 grid and the question text.

## variant-answer (5 lines)
- L0: each row "7"; `7\times7=49` "no full row".
- L1: column 1 locked on; each row has 3 choices for its other two lamps (on-on crossed out); `3\times3=9`.
- L2: `3\times9=27`; the three two-full-column patterns as mini 2×3 grids (third column off); `27-3=24`.
- L3: `49-24=25` "losers".
- L4: `2^6=64`; `64-25=39`; answer badge "39" (green) with chime at the END of the line.

## recap (3 lines)
- L0: ledger summary `+\text{singles}\ -\ \text{pairs}\ +\ \text{triples}\ -\cdots` with alternating sign chips.
- L1: "every pattern counted exactly once" + small second card "or: total − losers".
- L2: `<SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />`.
