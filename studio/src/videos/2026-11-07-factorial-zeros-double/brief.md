# Builder brief: 2026-11-07-factorial-zeros-double

Question `amc_practice_amc10_number_theory_template:c1-666`. Answer **C = 26**. Variant answer **7**.
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.

Line numbers below are 0-indexed within each scene (L0 = first line).

Choices (letters fixed): A 20, B 24, C 26, D 30, E 50.

Global rules for this video
- No count, total, running tally or partial sum equal to a choice value (20, 24, 26, 30, 50) before `reveal` L0:
  no live survivor counter in `count`; the per-row counts 8 / 9 / 9 only on `count` L5, the sum only on `reveal` L0.
  The same digits as factorial arguments (`20!`), division rows or grid cells (cell "26") are fine.
  Never show the variant count 7 before `variant-answer` L3/L4.
- Notation: `(2n)!` ALWAYS with brackets (spoken "the factorial of two n"); never `2n!`. Same for `(3n)!`.
  Floor terms as `\left\lfloor \dfrac{n}{5} \right\rfloor` etc. with a small "rounded down" tag the first time.
- Use `\dfrac` for every fraction; digits ≥ 48 px (grid cell labels are the one exception, see `count`). Stage above y ≈ 860.
- Colours: fives / "rule one" = primary green `#0cc281`; twenty-fives / "rule two" = secondary purple `#7b61ff`;
  spill / extra five / crossed out = error red `#ef4343`; final survivors and answer = success `#21c45d`.
  Base-five digits: ones digit green, fives digit purple, twenty-fives digit dark text `#333`.
- Division with remainder is shown as `8 = 1\times5 + 3` style rows (or "8 ÷ 5 = 1 r 3"); pick one style and keep it.
- No decimals anywhere.

## intro (3 lines)
- L0: two rows: `10! = 3628800` with the 2 trailing zeros highlighted green and a "2 zeros" chip; `20! = 2432902008176640000`
  with its 4 trailing zeros highlighted, "4 zeros" chip; a "×2 ✓" tag between the chips.
- L1: `8! = 40320` (1 zero) and `16! = 20922789888000` (3 zeros, highlighted red); "3 > 2×1" tag in red. (Values are exact.)
- L2: title card "When does doubling work?"

## question (4 lines) — poster: about 1 s into L3 (full prompt + all choices visible)
- L0: card "Question" + prompt: "Here n! means 1 × 2 × ⋯ × n. For how many integers n from 1 to 100 does (2n)! end in exactly
  twice as many zeros as n!?" (KaTeX for the maths). Highlight `n! = 1\times2\times\cdots\times n` while L0 plays.
- L1: Mark-sweep "integers n from 1 to 100".
- L2: Mark-sweep "(2n)! end in exactly twice as many zeros as n!".
- L3: Choices row A–E: 20, 24, 26, 30, 50 (Tex). All on screen by the poster time.

## asked (3 lines)
- L0: two bins labelled "doubling works ✓" (green) and "doesn't ✗" (red).
- L1: chip "10" drops into ✓ (show `2 \to 4`), chip "8" into ✗ (show `1 \to 3`, "3 > 2×1"). Then a "?" rule card.
- L2: goal line: "Count the n in 1 … 100 that land in ✓". 

## try1 (pause, hold 10): PauseCard with the prompt + choices visible.

## fives — Solution 1: count the fives (6 lines)
- L1: `10 = 2\times5`; a trailing zero icon ↔ one (2, 5) pair.
- L2: two tallies (simple bars or dot rows) for, say, 20!: twos 18, fives 4 (these are true: v2(20!)=18, v5(20!)=4);
  tag "zeros = number of fives". If you'd rather avoid numbers, show the twos bar much longer, unlabelled.
- L3: row `\text{fives in } n! = \left\lfloor \dfrac{n}{5} \right\rfloor` + "rounded down" tag. Small example: multiples of five 5, 10, 15, 20, 25… each with one green dot.
- L4: row grows to `\left\lfloor \dfrac{n}{5} \right\rfloor + \left\lfloor \dfrac{n}{25} \right\rfloor` (purple second term); the 25 and 50 chips get a second, purple dot.
- L5: second row for `(2n)!`: `\left\lfloor \dfrac{2n}{5} \right\rfloor + \left\lfloor \dfrac{2n}{25} \right\rfloor + \left\lfloor \dfrac{2n}{125} \right\rfloor`
  (third term in red/dark, new). Side note: "n ≤ 100 ⇒ n! needs no 125 term; 2n ≤ 200".
  Keep both rows on screen into the next scene (shrink to the top) — they are what "each term" refers to.

## double (9 lines)
Keep the two term rows small at the top. Below, a remainder picture: groups of five dots.
- L1: 8 dots = 1 full green group of five + 3 leftover dots (leftover highlighted). Row `8 = 1\times5 + 3`.
- L2: double it: 16 dots. Row `16 = 3\times5 + 1`. Show "expected 2×1 = 2" struck through and "3" in red, on the word THREE.
- L3: the two copies of the 3 leftovers (3 + 3 = 6) slide together; 5 of them snap into a NEW red group (the spill), 1 dot left. Label "remainder 3 → 6 ≥ 5: spill!".
- L4: 7 = 1×5 + 2 → 14 = 2×5 + 4. Leftovers 2 + 2 = 4, no group forms; green "no spill" + `1 \to 2` ✓.
- L5: rule card 1 (green): `n \bmod 5 \in \{0,1,2\}` ⇒ `\left\lfloor \dfrac{2n}{5} \right\rfloor = 2\left\lfloor \dfrac{n}{5} \right\rfloor`. Show the five remainders 0 1 2 | 3 4 with 0–2 green, 3–4 red (3→6, 4→8 spill).
- L6: rule card 2 (purple): remainder by 25 is 0–12 ⇒ `\left\lfloor \dfrac{2n}{25} \right\rfloor = 2\left\lfloor \dfrac{n}{25} \right\rfloor`. Small "remainder 12 → 24 < 25 ✓, remainder 13 → 26 ≥ 25 ✗".
- L7: under the two top rows, `\ge` arrows term by term: each `(2n)!` term `\ge 2\times` its `n!` term; tag "never short ⇒ every term must be exact".
- L8: rule card 3 (red): `\left\lfloor \dfrac{2n}{125} \right\rfloor = 0 \iff 2n < 125 \iff n \le 62`.

## count (6 lines) — the key visual (grid)
Grid of the numbers 0–99 in 4 rows of 25 (rows 1–4 below are 1-indexed: row 1 = 0–24, row 2 = 25–49, row 3 = 50–74, row 4 = 75–99), plus a lone cell "100" at the end of row 4 (place it right after 99, or on its own line under the grid if it doesn't fit).
Cells grouped in blocks of 5 columns with a gap between blocks. Suggested: cell 62 px, gap between blocks 18 px → width 25·62 + 4·18 = 1622 px; rows 90 px apart; start x ≈ 150, y ≈ 230.
Cell labels may be 34–36 px (exception to the 48 px rule; they are a reference table, not the maths being spoken). Cell 0 is greyed from the start (n starts at 1) but still drawn.
- L0: grid builds row by row (fast stagger), all cells neutral.
- L1: rule one: in every block of 5 columns, the last two columns (remainders 3, 4) fade to light red with a thin strike; the first three stay green-outlined. Animate column by column, not cell by cell pop-ins.
- L2: rule two: in each row, columns 13–24 (remainder by 25 from 13 to 24) fade out red. Row survivors are now columns 0,1,2,5,6,7,10,11,12 (9 per row). Draw a purple vertical divider between column 12 and 13.
- L3: rule three: a red line after 62; everything after 62 (rest of row 3 from 63, all of row 4, and 100) gets crossed out. Note: in row 3 the survivors are 50–52, 55–57, 60–62, all ≤ 62, so nothing extra disappears there — the cut lands right at the rule-two divider. Make the cut obviously visible on rows 4 and the 100 cell.
- L4: pulse cells 1 and 2 (green); tag `2! = 2`, `4! = 24`: "no zeros", `0 = 2\times 0` ✓.
- L5: survivors turn success green. Row counts appear at the right of rows 1–3: "8", "9", "9" (row 1 says 8 because 0 is out). Row 4: "0". Do NOT show a total.

## reveal (1 line) — the strong motion beat
- L0: `8 + 9 + 9 = 26` big; answer badge "C · 26" + chime at the END of the line (after "Choice C").

## base5 — Solution 2: base five (8 lines). Three digit boxes: [25s] [5s] [1s].
- L0: three labelled boxes "twenty-fives | fives | ones", digits 0–4 hint under each.
- L1: `37 = 25 + 2\times5 + 2` and the boxes fill 1 | 2 | 2; `37 = 122_5`.
- L2: ones box green, `\le 2` ("rule one").
- L3: fives box purple, `\le 2`; side row `\text{remainder by }25 = 5\times(\text{fives digit}) + \text{ones} \le 12` with `3\times5 = 15 > 12` in red.
- L4: `62 = 222_5` (= 2×25 + 2×5 + 2), twenty-fives box `\le 2`. All three boxes now show "0, 1, 2". Tag "double each digit ≤ 4: no carries".
- L5: `3\times3\times3 = 27`.
- L6: `000_5` struck out → `27 - 1 = 26` (26 may show here — it's after the reveal).
- L7: tip card: "doubling + fives → base five, no carries".

## traps (6 lines). One red card per wrong choice, with its working:
- L1: A 20: "multiples of 5 up to 100: 5, 10, …, 100 → 20" — "not our rule".
- L2: B 24: "26 − 2" with 1 and 2 struck through, then un-struck with "0 = 2×0 ✓, they count".
- L3: D 30: "ends in 0, 1 or 2 (base ten): 10 + 10 + 10 = 30" — "wrong base".
- L4: E 50: "half of 100" — "rules are stricter".
- L5: habit card: "Doubling a rounded-down number? Check the remainder."

## variant — Your turn: triple it (3 lines)
- L1–L2: prompt card: "For how many integers n from 1 to 100 does (3n)! end in exactly three times as many zeros as n!?" No choices.

## try2 (pause, hold 12): PauseCard with the variant prompt visible.

## variant-answer (5 lines)
- L0: remainders by 5: `0,1` green, `2,3,4` red (`3\times2 = 6 \ge 5`). Row `3r < 5 \Rightarrow r \le 1`.
- L1: `3\times8 = 24 < 25` ✓, `3\times9 = 27` ✗ ⇒ remainder by 25 `\le 8`.
- L2: `3n < 125 \Rightarrow n \le 41`.
- L3: three digit boxes each "0, 1"; `2\times2\times2 = 8`.
- L4: `8 - 1 = 7`; the seven numbers as chips: 1, 5, 6, 25, 26, 30, 31 (with base five under each, small but ≥ 40 px: 1, 10, 11, 100, 101, 110, 111). Answer badge **7** + chime at line end.

## recap (3 lines)
- L0: `\text{zeros} = \left\lfloor \dfrac{n}{5} \right\rfloor + \left\lfloor \dfrac{n}{25} \right\rfloor + \cdots`
- L1: `\lfloor 2x \rfloor = 2\lfloor x \rfloor` when remainder < half the divisor; three mini chips: "5: r ≤ 2", "25: r ≤ 12", "125: n ≤ 62".
- L2: `<SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />`.
