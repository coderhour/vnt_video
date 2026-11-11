# Builder brief: 2026-11-07-broken-stick

Question `amc_practice_amc10_counting_template:c1-981`. Answer **C = 1/10**. Variant answer **8/35**.
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.
`narration.json` uses `caption_digits` plus a `captions` override map (fractions as 1/10 etc.). If you reword a line,
update its `captions` key too (the key is the exact line text).

Line numbers below are 0-indexed within each scene (L0 = first line). 59 lines.

Choices (letters fixed): A `\dfrac1{20}`, B `\dfrac1{12}`, C `\dfrac1{10}`, D `\dfrac16`, E `\dfrac14`.

Global rules for this video
- Never show `\dfrac1{10}`, the number 180, or the whole hexagon before the `reveal` scene. The `area` scene ends at "30" only (no "30/300", no "1/10 of the slice").
- Never show `\dfrac14` as a probability before the `traps` scene (it appears in `walk` only as "1/4 of the way", which is fine).
- Never show 8/35 before `variant-answer` L5.
- **The map** (Solution 1): maths coordinates, y UP, origin bottom-left. x = first cut, y = second cut, both 0…60. Draw a 60×60 square, ticks every 10 (labels 0, 20, 40, 60 on the axes are enough; add 12, 15, 30, 36 ticks only where listed). "Top half" = above the diagonal y = x = the upper-left triangle with corners (0,0), (0,60), (60,60). Here the second cut is further right on the stick, and the pieces are left = x, middle = y − x, right = 60 − y.
- **The stick**: a horizontal bar 60 units long above or beside the map, with two cut marks. Piece colours, used everywhere (stick pieces, labels, "left/middle/right" words):
  left `#0cc281` (primary green), middle `#7b61ff` (purple), right `#f59e0b` (amber). Win region fill = success `#21c45d` (~35% alpha) with solid outline; traps = `#ef4343`.
- Piece triples are written as stick labels "15 | 15 | 30" (left | middle | right), each number in its piece colour. Prefer these over coordinates.
- The six ordering slices have **equal area but different shapes**, and the hexagon is **not regular**. Never draw or call them congruent; draw them exactly from the coordinates below.
- Spoken vs shown: example dots (intro, asked L0, map L1/L3, good L3) show their stick cuts and a ✓/✗ only, with NO numeric readouts or coordinates (those numbers aren't spoken).
- Use `\dfrac` for every fraction; digits ≥ 48 px. Keep the stage above y ≈ 860.

Exact geometry (all verified in verify.py)
- Centre (equal point) P = (20, 40), pieces 20 | 20 | 20. Top-half corners V1 = (0,0), V2 = (0,60), V3 = (60,60). Edge midpoints M12 = (0,30), M23 = (30,60), M13 = (30,30).
- The three "two pieces equal" lines (they are the triangle's medians, all through P):
  left = middle: y = 2x, from V1 (0,0) to M23 (30,60);
  middle = right: 2y − x = 60, from M12 (0,30) to V3 (60,60);
  left = right: x + y = 60, from V2 (0,60) to M13 (30,30).
- Six slices (each area 300): P-V1-M12 = left<middle<right (**our slice**); P-M12-V2 = left<right<middle; P-V2-M23 = right<left<middle; P-M23-V3 = right<middle<left; P-V3-M13 = middle<right<left; P-M13-V1 = middle<left<right.
- Our slice: O = V1 (0,0) pieces 0|0|60, Q = M12 (0,30) pieces 0|30|30, P (20,40). Base OQ = 30 along the left edge (x = 0), height 20 (horizontal distance to P).
- Winning triangle in our slice: P (20,40), A = (15,30) pieces 15|15|30 (on P–O), B = (12,36) pieces 12|24|24 (on P–Q). Area 30.
- Box around it: x 12…20, y 30…40 (8 wide, 10 tall, area 80). Three cut-off right triangles:
  T1 = A(15,30), (20,30), P(20,40): legs 5 (bottom) and 10 (right side) → 25;
  T2 = B(12,36), (12,40), P(20,40): legs 4 (left side) and 8 (top) → 16;
  T3 = (12,30), A(15,30), B(12,36): legs 3 (bottom) and 6 (left side) → 9.
- Hexagon (top half, in order): (15,30) 15|15|30, (12,36) 12|24|24, (15,45) 15|30|15, (24,48) 24|24|12, (30,45) 30|15|15, (24,36) 24|12|24. Area 180. Mirror copy below the diagonal = reflect over y = x.

## intro (3 lines)
- L0: a stick snaps at two spots (seeded positions, e.g. 14 and 41 of 60) into three coloured pieces that drift apart slightly.
- L1: the longest and shortest pieces highlight; a "longest < 2 × shortest ?" tag. No numbers, no fractions.
- L2: the stick shrinks to a corner while a faint empty square fades in (teaser of the map). No regions shaded.

## question (4 lines) — poster: about 1 s into L3 (full prompt + all choices visible)
- L0: card "Question" + the prompt text.
- L1: the stick with two cut marks, three pieces.
- L2: Mark-sweep "longest piece is less than twice as long as the shortest piece".
- L3: Choices row A–E (Tex, as above).

## asked (4 lines)
- L0: stick with two cut marks sliding to a few seeded spots (stepwise, not a smooth sweep) — "each spot equally likely".
- L1: the stick gets a ruler 0…60 underneath; tag "length doesn't matter".
- L2: stick split 16 | 20 | 24 with a green check; row `24 < 2\times 16 = 32` ✓.
- L3: stick split 10 | 20 | 30 with a red cross; row `30 > 2\times 10 = 20` ✗.

## try1 (pause, hold 10): PauseCard with the prompt + choices visible.

## map — Solution 1 (5 lines). Map on the left (~600 px square), stick + rows on the right.
- L0: stick with cuts at x and y; a dot appears on the empty square.
- L1: axes labelled "first cut x" (horizontal) and "second cut y" (vertical), 0…60. Step a dot through 3 seeded examples, each time the stick above shows the matching cuts: e.g. (14,41), (45,20), (30,52). No coordinate readout.
- L2: the square fills lightly; label "area 3600" (`60\times60=3600`).
- L3: draw the diagonal y = x; shade the top half lightly. Stick labels: left `x`, middle `y-x`, right `60-y` in piece colours. A dot at (14,41) with its stick drawn to scale as an example (no numbers).
- L4: the bottom half flashes as a mirror (reflect animation over the diagonal), then dims; top half labelled "1800".

## orders (5 lines)
- L0: draw the three median lines one by one (each labelled "left = middle", "middle = right", "left = right" in small text along it); the top half now shows six slices.
- L1: dot at P (20,40), stick 20 | 20 | 20.
- L2: highlight our slice P-V1-M12, tag "left < middle < right". Mark base OQ (0,0)–(0,30) "30" and height from P across to x = 0 "20" (dashed horizontal).
- L3: row `\dfrac12\times30\times20=300`; "300" inside the slice.
- L4: "300" appears in each of the other five slices one by one; row `6\times300=1800` ✓.

## good (4 lines) — zoom into our slice (scale it up so the small triangle is readable)
- L0: row `\text{right} < 2\times\text{left}` (piece colours).
- L1: point A (15,30) on edge P–O pops in, stick label 15 | 15 | 30 (30 = 2 × 15, border).
- L2: point B (12,36) on edge P–Q pops in, stick label 12 | 24 | 24 (24 = 2 × 12).
- L3: draw the border A–B and shade triangle P-A-B green. A sample dot inside it, e.g. (17,36), with its stick drawn to scale and a ✓ (no numbers). Do NOT show its area.

## area (4 lines)
- L0: box x 12…20, y 30…40 around P-A-B with ticks 12, 15, 20 on x and 30, 36, 40 on y; dimension labels "8" and "10"; row `8\times10=80`.
- L1: T1 shades light grey, legs labelled 5 and 10; row `\tfrac12\times5\times10=25` (use `\dfrac12`).
- L2: T2 (legs 4, 8) → `16`; T3 (legs 3, 6) → `9`.
- L3: row `25+16+9=50`, then `80-50=30`; "30" inside the green triangle. Nothing else.

## reveal (3 lines) — the strong motion beat
- L0: zoom back out to the top half; the winning triangle copies into the other five slices (one by one, each "30"), forming the hexagon (corners above); row `6\times30=180`.
- L1: the hexagon mirrors into the bottom half; row `\dfrac{180}{1800}`.
- L2: `=\dfrac1{10}`; Answer badge "C · 1/10" with chime at the END of the line.

## walk — Solution 2 (6 lines). Our slice drawn large (no axes needed, keep the true shape O, Q, P), stick readout on the right.
- L0: slice outline, dot at P with stick 20 | 20 | 20.
- L1: the dot walks P → O (smoothly is fine here: every point on this edge is valid), a "shortest" bar shrinking 20 → 0 next to it; reset; walk P → Q the same way.
- L2: edge P–O labelled "short pieces match"; stick ratio bar 1 : 1 : 2 then 15 | 15 | 30; the dot stops at A.
- L3: row `\text{shrank } 5 \text{ of } 20 = \dfrac14 \text{ of the way}`; tick mark on P–O at 1/4 of the way from P.
- L4: edge P–Q labelled "long pieces match"; ratio 1 : 2 : 2 then 12 | 24 | 24; dot stops at B.
- L5: row `8 \text{ of } 20 = \dfrac25 \text{ of the way}`.

## walk2 (3 lines)
- L0: two-step shrink, area tags only as multipliers (no area numbers): triangle P-O-Q shades; corner Q slides along the edge to B → tag `\times\dfrac25`; then corner O slides along its edge to A → tag `\times\dfrac14`. Result: triangle P-A-B.
- L1: row `\dfrac14\times\dfrac25=\dfrac1{10}` ✓ (green).
- L2: tag "winning part in a corner → walk!".

## traps (5 lines). One red card per choice, each with a small map thumbnail:
- L1: A `\dfrac1{20}`: square with the hexagon shaded in the top half only, bottom half empty — "forgot the mirror half".
- L2: B `\dfrac1{12}`: one whole slice shaded red — "a whole slice isn't a win".
- L3: D `\dfrac16`: six slice icons, one highlighted — "one ordering, no rule".
- L4: E `\dfrac14`: three pieces forming a triangle — "makes a triangle ≠ our test"; small row `\text{longest}<2\times\text{shortest}\le\text{shortest}+\text{middle}` with tag "stricter".

## variant — Your turn: three times (2 lines)
- L0: stick again. L1: `\text{longest} < 3\times\text{shortest}\,?` with Mark on THREE. No choices.

## try2 (pause, hold 12): PauseCard with the variant question visible.

## variant-answer (6 lines). Same slice shape as `walk` (schematic, no coordinates), stick 0…105.
- L0: stick ruler 0…105 (no piece labels yet).
- L1: dot at P with 35 | 35 | 35, then edge one: ratio 1 : 1 : 3 → 21 | 21 | 63; stop point at 2/5 of the way from P to O.
- L2: row `35-21=14`, `\dfrac{14}{35}=\dfrac25`.
- L3: edge two: ratio 1 : 3 : 3 → 15 | 45 | 45; stop point at 4/7 of the way from P to Q.
- L4: row `35-15=20`, `\dfrac{20}{35}=\dfrac47`.
- L5: shade triangle; row `\dfrac25\times\dfrac47=\dfrac{8}{35}`; answer badge **8/35** + chime at line end. Never show decimals (no 8.57 etc.).

## recap (3 lines)
- L0: cuts → dot in square (small stick + map).
- L1: six slices, one highlighted with its winning corner triangle; "find the share of ONE slice".
- L2: `<SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />`.
