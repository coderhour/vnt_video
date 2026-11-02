# Build brief: 2026-11-01-lattice-triangle-10

Question `amc_practice_amc10_mock_test_template:c1-316` (difficulty 4). Answer **D = 11** (bank correct_index 3).
`narration.json` + `verify.py` are the contract: do not change any maths or narration meaning.
Choices: (A) 5 (B) 6 (C) 10 (D) 11 (E) 12.

## Conventions (read first)

- **Maths plane, y up.** Every figure is a dot grid with the origin bottom-left, x right, y up (like
  `2026-10-29-triangle-in-square`). The triangle is (0,0), (p,0), (0,q): legs on the bottom and left edges,
  the slanted side (hypotenuse) going from bottom-right up to top-left. "Up the slant" = from (p,0) to (0,q).
- Dot colours: interior dots primary `#0cc281`; dots ON the slanted side secondary `#7b61ff` (bigger, ringed);
  edge/leg dots grey; uncounted grid dots light grey. Keep this scheme everywhere so "slant dots" read at a glance.
- Screen notation: `p`, `q`, `g = \gcd(p,q)` (also write "greatest common factor" in words once, in `formula`).
  Voice says "p minus one, times q minus one" ↔ screen `(p-1)(q-1)`.
- Never show a dot count of exactly 10 for a specific (p,q) before `count` L1, and never show the number 11
  before `count` L1 ("…eleven. That's Choice D!"). Chime at the END of `count` L1.
- Variant answer 9: never shown before `variant-answer` L6.
- Line numbers below are 0-indexed (L0 = first line, matching `at(scene, i, t)` / `cue()`).

## Scenes

### intro (3 lines)
- L0: dot grid ~10×8. A right triangle with legs on the axes; its corner on the x-axis and y-axis step dot to dot
  (never a smooth tween): (4,3) → (6,4) → (8,5). Interior dots light up with a live count: 3, 7, 14
  (verify: `inside()` in verify.py). Do not use any size whose count is 10.
- L1: big "EXACTLY 10 inside?" chip; then the slant of the (6,4) triangle glows purple, its one slant dot (3,2) pulses
  ("the sneaky part").
- L2: Vantee title card "10 Dots Inside".

### question (4 lines) — poster: about 3 s into L2 (full question + figure visible)
- Left: question text (KaTeX): "A right triangle has vertices (0,0), (p,0), (0,q), where p and q are positive integers.
  Exactly 10 points with integer coordinates lie strictly inside it. How many ordered pairs (p,q) are possible?"
- Right: schematic figure: axes, a triangle drawn about 8 wide × 5 tall, corners labelled `(0,0)`, `(p,0)`, `(0,q)`,
  legs labelled `p` and `q`. No interior dots highlighted, no counts (it's schematic, not an answer).
- L0: highlight the three corners. L1: highlight "positive integers". L2: highlight "exactly 10 … strictly inside".
- L3: highlight "ordered pairs (p,q)", then choice chips (A) 5 (B) 6 (C) 10 (D) 11 (E) 12. No highlight.

### asked (3 lines)
- L0: figure: leg arrows `p` across (bottom), `q` up (left side).
- L1: example triangle 6×4 on a dot grid: edge dots (legs + slant) get a red ✗ "doesn't count", interior dots green.
  (Don't show a count here.)
- L2: two chips `(2, 21)` ≠ `(21, 2)`, with a tiny tall-thin and a wide-flat triangle sketch.

### try1 (pause, hold 10)
- PauseCard; question text + choices visible.

### rect (4 lines) — chapter "Solution 1: cut a rectangle in half"
- Dot grid, rectangle 6 wide × 4 tall with corners (0,0), (6,0), (6,4), (0,4).
- L0: our triangle (0,0),(6,0),(0,4) in green; a twin triangle (6,0),(6,4),(0,4) (rotated copy) slides/rotates in to
  complete the rectangle.
- L1: interior grid of the rectangle lights up: 5 across × 3 up; row `5 \times 3 = 15`.
- L2: slanted side from (6,0) to (0,4) draws; the dot (3,2) on it turns purple and pulses.
- L3: the rectangle rotates 180° about its centre (3,2): the two triangles swap places (show it). Then dots split:
  7 green in our triangle, 7 in the twin. Rows `15 - 1 = 14`, `14 \div 2 = 7`.

### formula (5 lines)
- General p×q rectangle (schematic, labels p and q; can keep a light grid). Right panel equation rows.
- L0: row `(p-1)(q-1)` dots inside the rectangle, with braces "p − 1" across and "q − 1" up.
- L1: definition card `g = \gcd(p,q)` "greatest common factor".
- L2: show on a concrete slant, e.g. the 6×4 one: 2 equal hops (6,0)→(3,2)→(0,4), each hop "3 across, 2 up";
  then generic row `g` hops → `g - 1` dots strictly between the ends.
- L3: row `\dfrac{(p-1)(q-1) - (g-1)}{2} = 10`, then `(p-1)(q-1) - (g-1) = 20`.
- L4: row `(p-1)(q-1) = 19 + g` — boxed, it's the key equation. Keep it visible (small, top corner) through
  `bound` and `cases`.

### bound (4 lines)
- L0: chip `p \le q` "flip later".
- L1: 7×7 triangle (0,0),(7,0),(0,7) on a dot grid, with a bigger triangle (e.g. 9×10) drawn around it, covering it.
- L2: 7×7 rectangle interior `6 \times 6 = 36`, 6 purple dots on its slant (1,6)…(6,1): `36 - 6 = 30`,
  `30 \div 2 = 15` with a red "too many!" (15 > 10).
- L3: rows `p \le 6`, and `p = 1`: a 1-wide triangle has no dot strictly inside (show the empty strip) → `2 \le p \le 6`.

### cases (9 lines)
- A table that fills row by row, columns: `p` | `p-1` | `(p-1)(q-1) = 19 + g` options | `q` | check `\gcd(p,q) = g?`.
  Valid rows get a green ✓, failures a red ✗. Each row appears on its own line; the rows must fit (≤ x 1880, above y 860).
- L0: header + note "g divides p".
- L1: p = 2, g ∈ {1, 2}: `q - 1 = 20` or `21` → q = 21 (gcd 1 ✓), q = 22 (gcd 2 ✓).
- L2: p = 3, g ∈ {1, 3}: `2(q-1) = 20` or `22` → q = 11 (gcd 1 ✓), q = 12 (gcd 3 ✓).
- L3: p = 4, g ∈ {1, 2, 4}: `3(q-1) = 20, 21, 23`.
- L4: 20 and 23 struck out (not multiples of 3); 21 → q = 8, g = 2, but `\gcd(4,8) = 4` ✗.
- L5: p = 5, g ∈ {1, 5}: `4(q-1) = 20, 24`.
- L6: 20 → q = 6 (gcd 1 ✓); 24 → q = 7, `\gcd(5,7) = 1 \ne 5` ✗.
- L7: p = 6, g ∈ {1, 2, 3, 6}: `5(q-1) = 20, 21, 22, 25`.
- L8: 21, 22 struck; 20 → q = 5 grey "(5, 6) flipped"; 25 → q = 6, `\gcd(6,6) = 6` ✓.

### count (2 lines)
- L0: list of six chips `(2,21) (2,22) (3,11) (3,12) (5,6) (6,6)`; the first five each spawn a flipped twin
  (`(21,2)` …): `5 \times 2 = 10`.
- L1: `(6,6)` gets a "flips to itself" loop; row `10 + 1 = 11`. Answer reveal: big `11` badge + choice D highlight,
  the one strong motion beat; chime at end of line. Optional: tiny 6×6 triangle with its 5 purple slant dots
  and 10 green inside (allowed now, after the reveal starts).

### pick (6 lines) — chapter "Solution 2: Pick's theorem"
- L1: formula card `A = I + \dfrac{B}{2} - 1` (I = inside dots, B = edge dots).
- L2: on the 6×4 example triangle, a marker walks the edge: along the bottom (6 steps, label "p steps"),
  up the slant (2 hops, "g hops"), down the left side (4 steps, "q steps"); each landing dot pops.
  Row `B = p + q + g`.
- L3: rows `A = \dfrac{pq}{2}`, `\dfrac{pq}{2} = 10 + \dfrac{p+q+g}{2} - 1`.
- L4: rows `pq = 18 + p + q + g`, `pq - p - q + 1 = 19 + g`, `(p-1)(q-1) = 19 + g` with "same!" check.
  (Show all three rows; the voice skips the middle ones.)
- L5: two small cards "Pick: fast" vs "rectangle: no formula to remember".

### traps (5 lines) — chapter "Common traps"
- Choice chips; each wrong one turns red with its card on its line.
- L1: E 12: six chips, all six flipped including `(6,6)\to(6,6)` shown twice; `6 \times 2 = 12`, red ✗ on the duplicate.
- L2: C 10: list with `(6,6)` missing; mini 6×6 triangle with its 5 purple slant dots.
- L3: B 6: (a) the six unflipped chips; (b) "forgot the slant": `(p-1)(q-1) = 20` → `(2,21) (3,11) (5,6)`
  + flips = 6.
- L4: A 5: five chips with p < q, no `(6,6)`, no flips.

### variant (2 lines) — chapter "Your turn: six dots inside"
- Same schematic triangle; text "exactly **6** points strictly inside. How many ordered pairs (p, q)?"

### try2 (pause, hold 12)

### variant-answer (8 lines) — chapter "Six dots: the answer"
- L0: rows `2 \times 6 = 12`, `(p-1)(q-1) - (g-1) = 12`, `(p-1)(q-1) = 11 + g`.
- L1: 6×6 triangle: `25 - 5 = 20`, `20 \div 2 = 10 > 6` → `p \le 5`.
- L2: table row p = 2: q = 13 (gcd 1 ✓), q = 14 (gcd 2 ✓).
- L3: p = 3: `2(q-1) = 12, 14` → q = 7 ✓; q = 8 ✗ (`\gcd(3,8) = 1 \ne 3`).
- L4: p = 4: `3(q-1) = 12, 13, 15` → q = 5 ✓; q = 6 ✗ (`\gcd(4,6) = 2 \ne 4`).
- L5: p = 5: `4(q-1) = 16` → q = 5 ✓ (`\gcd(5,5) = 5`). (Don't show q = 4; the voice doesn't mention it.)
- L6: `(2,13) (2,14) (3,7) (4,5)` flip → 8, plus `(5,5)`: `8 + 1 = 9` badge, chime at end of line.
- L7: small celebration (Confetti).

### recap (3 lines)
- L0: three-step card: rectangle `(p-1)(q-1)` → minus slant `g - 1` → split in half.
- L1: "short leg small → check each case".
- L2: sign-off.
