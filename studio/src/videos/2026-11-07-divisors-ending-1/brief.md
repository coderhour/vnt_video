# Builder brief: 2026-11-07-divisors-ending-1

Question `amc_practice_amc10_number_theory_template:c2-020`. Answer **C = 26**. Variant answer **30**.
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.

Line numbers below are 0-indexed within each scene (L0 = first line).

Choices (letters fixed): A 24, B 25, C 26, D 27, E 28.

Global rules for this video
- The number: `N = 3^6\cdot 7^4\cdot 13^2` (always this KaTeX form; never show its decimal value).
- Never show 26 (as the answer, a running total or a highlighted count) before `reveal` L1. In `count`, the per-b
  counts may appear as they are spoken, but no running total until L6.
- Colours: powers of 3 / a = primary green `#0cc281`; powers of 7 / b = secondary purple `#7b61ff`;
  powers of 13 / c = a warm amber (e.g. `#f59e0b`) — keep these three consistent everywhere (exponent letters,
  axis labels, cycle rows). Boxes ending in 1 = success `#21c45d` fill. Traps = `#ef4343`.
- Exponent letters are lower-case a, b, c (spoken "three to the a"). Use `3^a`, `7^b`, `13^c`.
- "ends like" / "acts like" = same last digit. On screen write it as `\equiv` with a small tag "last digit", or as
  plain words "ends like". Do NOT introduce "mod" on screen.
- Digits ≥ 48 px. Stage above y ≈ 860. Use `\dfrac` if any fraction appears (none needed).

## The grid (used in `grid`, `match`, `reveal`, `count`, `variant-answer`)
7 columns a = 0..6 (left → right), 3 rows c = 0..2 (top → bottom). Column header row "a = 0 … 6" (green),
row header "c = 0, 1, 2" (amber). Cells ≥ 110 px square, digits ≥ 56 px. Contents in solution 1 = last digit of 3^a·13^c:
```
c=0:  1 3 9 7 1 3 9
c=1:  3 9 7 1 3 9 7
c=2:  9 7 1 3 9 7 1
```
Ones at (a,c) = (0,0),(4,0),(3,1),(2,2),(6,2): 2 top, 1 middle, 2 bottom = 5.
In solution 2 the same grid shows a + c instead:
```
c=0:  0 1 2 3 4 5 6
c=1:  1 2 3 4 5 6 7
c=2:  2 3 4 5 6 7 8
```
(Equal sums run along down-left diagonals.) The five "0, 4, 8" cells are exactly the five "1" cells above — a nice
consistency the builder can show by reusing the same green fill.

## intro (3 lines)
- L0: `3^6\cdot 7^4\cdot 13^2` big, centred; under it a tag "105 divisors"; then "end in 1?" with a big "…1" digit.
- L1: a column of a few sample divisors (e.g. 21, 63, 91, 169, 2401 — all real divisors) with ONLY their last digit
  highlighted (others greyed). Use any real divisors; don't count anything.
- L2: Vantee title card line (no own wordmark beyond the watermark).

## question (3 lines) — poster: ~1 s into L2 (prompt + all choices visible)
- L0: card "Question" + prompt: "How many positive divisors of `3^6\cdot 7^4\cdot 13^2` end in the digit 1?" The number highlights as read.
- L1: Mark-sweep "end in the digit 1".
- L2: Choices row A–E: 24, 25, 26, 27, 28 (Tex). All on screen by poster time.

## asked (4 lines)
- L0: `3^a\cdot 7^b\cdot 13^c` with a/b/c coloured.
- L1: three range chips: `0\le a\le 6`, `0\le b\le 4`, `0\le c\le 2`.
- L2: `7\times5\times3=105` divisors, tag "too many to list!".
- L3: worked example of last-digit multiplication: `2\mathbf{1}\times 6\mathbf{3}=1\,32\mathbf{3}`, with the last digits
  highlighted and `1\times3=3` beside it (21·63 = 1323 ✓).

## try1 (pause, hold 10): PauseCard with the prompt + choices visible.

## cycles — Solution 1: a last-digit grid (4 lines)
Three horizontal rows (one per prime), each a strip of last-digit chips.
- L0: green row label `3^k`.
- L1: chips appear as spoken: 1, 3, 9, 27, 81 (full numbers, last digit bold), then the last-digit row
  1 3 9 7 | 1 3 9 (k = 0..6) with a "repeat" bracket / loop arrow over 1 3 9 7.
- L2: purple row `7^b`, b = 0..4: 1 7 9 3 1 (actual values 1, 7, 49, 343, 2401; small, last digit bold).
- L3: amber row `13^c`, c = 0..2: 1 3 9 (values 1, 13, 169). Draw a link/arrow showing it matches the start of the 3-row; tag "acts like 3".

## grid (3 lines)
- L0: draw the empty 7×3 grid with headers (a across, c down).
- L1: fill the cells row by row (fast cascade, top row first) with the solution-1 digits; tag "21 boxes"
  next to the grid ONLY with the words "twenty-one boxes" (L1 says it).
- L2: the ones light up green: top row (2) as "two in the top row", middle (1), bottom (2); counter chip "5 ones".

## match (5 lines)
Keep the grid on the left (can shrink), the purple 7-row `b: 0 1 2 3 4 → 1 7 9 3 1` on the right.
- L0: purple 7-row slides in.
- L1: a green "1" cell links to the two purple "1" chips at b = 0 and b = 4; tag "×2 ways".
- L2: a "3" cell links to the purple "7" (b = 1); `3\times7=21`.
- L3: a "9" cell → "9" (b = 2), `9\times9=81`; a "7" cell → "3" (b = 3), `7\times3=21`.
- L4: in the 7-row, the chips 7, 9, 3 each circle once; tag "×1 way" on all non-1 cells (tint them lightly).
  Partner table summary (optional, right side): `1\to1\ (\times2)`, `3\to7`, `9\to9`, `7\to3`.

## reveal (2 lines) — strong motion beat
- L0: `5\times2=10` (green), `16\times1=16` (other cells), with "21 − 5 = 16" as a small working note.
- L1: `10+16=26` → Answer badge "C · 26" with chime at the END of the line.

## power3 — Solution 2: everything is a power of three (6 lines)
Equation rows, one idea per row:
- L0: `3^3=27` with the 7 highlighted.
- L1: `7 \to 3^3` and `13 \to 3^1` (tag "last digit", arrows meaning "ends like").
- L2: `7^b \to (3^3)^b = 3^{3b}`.
- L3: `3^a\cdot7^b\cdot13^c \to 3^{a}\cdot3^{3b}\cdot3^{c}=3^{\,a+3b+c}`. Colour a, 3b, c.
- L4: the green cycle strip again: exponent 0 1 2 3 4 5 6 7 8 → digit 1 3 9 7 1 3 9 7 1; the 1s at 0, 4, 8 glow.
- L5: boxed: `a+3b+c` = multiple of 4.

## count (8 lines)
Grid now shows a + c (see above). Right panel: a table with one row per b (b = 0..4):
`b | 3b | a+c must be | boxes`.
- L0: grid digits morph to the a+c values.
- L1: b = 0: `3b=0`, a+c ∈ {0, 4, 8}; highlight those cells (1 + 3 + 1 cells — the 4-diagonal has (4,0),(3,1),(2,2)); "1 + 3 + 1 = 5".
- L2: b = 1: `3b=3`, a+c ∈ {1, 5} (1: (1,0),(0,1); 5: (5,0),(4,1),(3,2)); "2 + 3 = 5".
- L3: b = 2: `3b=6`, a+c ∈ {2, 6} (3 cells each); "3 + 3 = 6".
- L4: b = 3: `3b=9`, a+c ∈ {3, 7} (3: three cells; 7: (6,1),(5,2)); "3 + 2 = 5".
- L5: b = 4: `3b=12`, tag "multiple of 4 → like b = 0", same cells as L1; "5".
  Each row: highlight that row's cells on the grid (clear the previous highlight) as the voice names the sums.
- L6: column total `5+5+6+5+5=26`.
- L7: tag "Pick this when every prime is a power of the same number (for last digits)".

## traps (7 lines). One red card per choice, with its working:
- L1: A 24: `26-2`, chips "1" and "N" (N's last digit: 9·1·9 = 81 → ends in 1; show `N` ends in 1) — "both count!".
- L2: B 25: purple `7^b \to 1` struck through as a wrong assumption; `5\times5=25` (5 green boxes × 5 values of b).
- L3–L4: D 27: amber `13^c \to 1` struck; `9\times3=27` ("9 pairs (a, b)", "3 values of c"). Show "9 pairs" on L4.
- L5: E 28: "28 > 26 — too many".
- L6: habit card: "Check every prime's last-digit cycle."

## variant — Your turn: a new number (3 lines)
- L1: `3^5\cdot 7^4\cdot 13^3`. L2: "How many divisors end in 1?" No choices. Never show 30 before `variant-answer` L4.

## try2 (pause, hold 12): PauseCard with the variant number + question visible.

## variant-answer (5 lines)
- L0: a 6×4 grid (a = 0..5 across, c = 0..3 down) filled with a + c; tag `6\times4=24` boxes.
  ```
  c=0: 0 1 2 3 4 5
  c=1: 1 2 3 4 5 6
  c=2: 2 3 4 5 6 7
  c=3: 3 4 5 6 7 8
  ```
- L1: cells with a+c ∈ {0, 4, 8} go green: 0 → (0,0); 4 → (4,0),(3,1),(2,2),(1,3); 8 → (5,3). "1 + 4 + 1 = 6".
- L2: `6\times2=12` (b = 0 or 4).
- L3: `18\times1=18` (24 − 6 = 18 others).
- L4: `12+18=30`, answer badge **30** + chime at line end.

## recap (3 lines)
- L0: the three cycle strips (3: 1 3 9 7; 7: 1 7 9 3; 13: 1 3 9) small, with a loop arrow — "cycles".
- L1: `3^a\cdot7^b\cdot13^c \to 3^{a+3b+c}`, and "a + 3b + c = multiple of 4".
- L2: Vantee sign-off: `<SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />`.
