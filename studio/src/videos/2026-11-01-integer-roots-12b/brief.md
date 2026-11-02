# Build brief: 2026-11-01-integer-roots-12b

Question `amc_practice_amc10_algebra_template:c2-002`. Answer **C = 16** (choices A 8, B 15, C 16, D 30, E 32).
No figure in the bank. `verify.py` checks every number below (run `python3 verify.py` → `ok`). Do not change any maths
or narration meaning. Line indices below are 0-based (L0 = first line of the scene).

**YouTube title:** When Are Both Roots Integers? x² + bx + 12b | AMC 10-Style Level 4

## Global layout
Pure algebra video. Left ≈ 900 px: the "picture" for the scene (area grid, factor-pair table, number line, d-list).
Right panel: KaTeX equation rows, one idea per row, `\dfrac` for fractions, ≥ 48 px, end before x ≈ 1880, stage above y ≈ 860.
Colours: r-things primary `#0cc281`, s-things secondary `#7b61ff`, b amber. Traps `#ef4343`, correct `#21c45d`.
Never show 16 (or "16 values"/a count of 16 b's) before `count` L9. The b column in `count` may fill in (values only),
but no total/counter until L9.

## Scenes
- **intro** — L0: `x^2 + bx + 12b`, then `b = -1` drops in and the row morphs to `x^2 - x - 12 = (x-4)(x+3)`;
  dots at 4 and −3 on a small number line (−5…5). L1: green ticks on both dots, a big "?" on the b slot of
  `x^2 + bx + 12b`. L2: Vantee title card ("Both roots integers?"). No choice values.
- **question** — L1: prompt card in KaTeX: "For how many integers \(b\) are both roots of \(x^2+bx+12b=0\) integers?",
  highlight-read. L2: choices row A 8, B 15, C 16, D 30, E 32 (≥ 48 px). Poster: about 2 s into L2 (prompt + choices).
- **asked** — L0: number line … −2, −1, 0, 1, 2 … labelled "integers"; pills `b` ✓ integer, `both roots` ✓ integer.
  L1: goal pill "count values of b" with a small crossed-out "pairs of roots".
- **try1** — pause card, prompt + choices still visible.
- **sumprod** — right-panel rows: L0 `x^2+bx+12b=(x-r)(x-s)`. L1 `= x^2-(r+s)x+rs` (label "sum" under r+s, "product" under rs).
  L2 stack `x^2 + {\color{amber} b}x + {\color{amber}12b}` over `x^2 - (r+s)x + rs`, connector lines bx↔−(r+s)x and 12b↔rs.
  L3 `b = -(r+s) = -r-s`. L4 `12b = rs`. L5 `rs = 12b = -12r-12s` (show 12·(−r−s) expanding). L6 `rs + 12r + 12s = 0`
  (the two terms visibly travel to the left side).
- **trick** — the aha beat (strong motion). L0: a 2×2 area grid, top edge split "r | 12", side split "s | 12",
  outer labels `r+12` and `s+12`. NOTE: r, s can be negative; this is an algebra-tile picture, draw it schematic
  (don't make cell sizes look like real lengths: draw the rs cell and 144 cell the same size).
  L1: cells fill in `rs`, `12r`, `12s`, `12×12 = 144`. L2: row `rs + 12r + 12s + 144 = 0 + 144`; the 144 cell lights up.
  L3: big row `(r+12)(s+12) = 144`, grid outline glows.
- **count** — factor-pair table on the left, two columns "positive" | "negative", plus a third column "b" (empty).
  L0: `1 × 144`, `2 × 72`. L1: `3 × 48`, `4 × 36`, `6 × 24`. L2: `8 × 18`, `9 × 16`, `12 × 12`, then tag "8 pairs".
  L3: swap animation `9 × 16 ↔ 16 × 9`, "same b". L4: negative column fills `(−1)(−144)` … `(−12)(−12)`, tag "8 more".
  L5 right panel: `r = u - 12,\ s = v - 12`, `b = -(r+s) = 24 - (u+v)` (u, v = the pair).
  L6: highlight row 9×16: `9 + 16 = 25`, `b = 24 - 25 = -1`, roots −3, 4 ("our opening example", link back to intro row).
  L7: highlight 12×12: `b = 24 - 24 = 0`, `x^2 = 0`, roots 0, 0.
  L8: b column fills: positive −121, −50, −27, −16, −6, −2, −1, 0; negative 169, 98, 75, 64, 54, 50, 49, 48 (all different).
  No count shown yet. L9: `8 + 8 = 16`, answer reveal (shotcraft card), choice C green, chime at END of the line.
- **oneroot** — rows: L0 `r^2 + br + 12b = 0`. L1 `b(r+12) = -r^2`. L2 `d = r + 12,\ r = d - 12`.
  L3 `r^2 = d^2 - 24d + 144`. L4 `bd = -d^2 + 24d - 144` then `b = 24 - d - \dfrac{144}{d}`.
  L5: "d divides 144": divisor list 1, 2, 3, 4, 6, 8, 9, 12, 16, 18, 24, 36, 48, 72, 144 and their negatives; `15 + 15 = 30`.
  L6: `s = -b - r` ✓ integer. L7: `d = 16 \to r = 4`, `d = 9 \to r = -3`, both `b = -1` (the two roots of x² − x − 12).
  L8: arcs pairing d ↔ 144/d across the list (1↔144, 2↔72, …), 12 and −12 get self-loops. L9: `28 ÷ 2 = 14`, `14 + 2 = 16`.
  L10: tip card "Forgot sum & product? Chase one root."
- **traps** — five chips, wrong ones flash red one at a time (C stays as the green correct chip):
  L0 A 8: the factor table with the negative column greyed, "8 missing". L1 B 15: the 15 positive divisors as 15 separate b's;
  9 and 16 both arrow to `b = −1`, circled. L2 D 30: all 30 divisors, pairs bracketed "×2" (12, −12 single).
  L3 E 32: `2 × 16 = 32` with `r ↔ s` swap arrow struck out. L4: habit card "Count values of b, not orders of the roots."
- **variant** — new question card: "For how many integers \(b\) are both roots of \(x^2+bx+6b=0\) integers?" No choices.
  10 must NOT appear before variant-answer L4.
- **try2** — pause card with the variant question.
- **variant-answer** — L0 rows `r + s = -b,\ rs = 6b`, `rs + 6r + 6s = 0`. L1 `+36`: `(r+6)(s+6) = 36` (mini 2×2 grid with 6×6 = 36 cell).
  L2: pairs `1×36`, `2×18`, `3×12`. L3: `4×9`, `6×6`, "5 pairs", negative column `(−1)(−36)` … `(−6)(−6)` "5 more".
  L4: `5 + 5 = 10`, success reveal + chime at END of line. L5: `4 - 6 = -2`, `9 - 6 = 3`, `b = -(-2+3) = -1`,
  `x^2 - x - 6 = (x-3)(x+2)` ✓. L6: confetti-light celebration.
- **recap** — summary card, revealed one step per line: roots → `r+s=-b`, `rs=12b` → remove b → add 144 so it factors →
  `(r+12)(s+12)=144` → count factor pairs, `±` both! L3: sign-off.
