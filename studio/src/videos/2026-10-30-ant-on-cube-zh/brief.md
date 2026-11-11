# Build brief: 2026-10-30-ant-on-cube

Question `amc_practice_amc8_mock_test_template:c2-630`. Answer **2/9 = choice C** (correct_index 2).
`narration.json` + `verify.py` are the contract: don't change the maths or the meaning.

## YouTube

- Title: `An Ant's Random Walk on a Cube | AMC 8-Style Level 4`
- Description (before the chapter lines):
  > An ant takes three random steps along the edges of a cube. What's the chance it ends up at the far corner?
  > Vantee solves it two ways, step by step and by counting all 27 walks, then shows the traps and gives you a sleepy-ant challenge to try.

## The cube (used in almost every scene)

Wireframe cube, cavalier projection, screen y grows downward. Coordinates for a figure box whose origin is
the top-left of the left stage area (shift/scale the whole set together as needed; keep it above y ≈ 860):

| corner | (x, y) | 3D (across, up, back) | edges away from A |
|---|---|---|---|
| A | (260, 720) | (0,0,0) | 0 (start) |
| B | (580, 720) | (1,0,0) | 1 |
| D | (260, 400) | (0,1,0) | 1 |
| E | (420, 590) | (0,0,1) | 1 |
| C | (580, 400) | (1,1,0) | 2 |
| F | (740, 590) | (1,0,1) | 2 |
| H | (420, 270) | (0,1,1) | 2 |
| G | (740, 270) | (1,1,1) | 3 (far corner) |

12 edges: front A-B, B-C, C-D, D-A; back E-F, F-G, G-H, H-E; connecting A-E, B-F, C-G, D-H.
The three edges at E (A-E, E-F, E-H) are the hidden ones: draw them dashed but the same weight and colour, because the
ant walks on them too (route A-E-F-G must be clearly visible). E-F crosses B-C at (580, 590) and H-E crosses D-C at
(420, 400): these are just drawing crossings, not corners, so no dot there. Corner dots r ≈ 12, letter labels ≥ 48 px,
placed outside the cube (A below-left, B below-right, C right of C but clear of the G-C edge, D left, E just below-right of its
dot inside the front face, F right, G above-right, H above-left). Check that the E label doesn't sit on edge E-F or A-E.

Directions (Solution 2 / variant): **across** = A→B (right arrow), **up** = A→D (up arrow), **back** = A→E (diagonal
arrow up-right, "into the page"). Show a small 3-arrow legend near A, labelled across / up / back.

Ant: a small simple ant glyph (or a dark dot with a tiny face) sitting on a corner. When it moves, it slides
along the edge from corner to corner (that is a valid state, it's walking the edge), never cutting across a face.

Colours: start A grey `#333333` ring; distance-1 corners primary `#0cc281`; distance-2 corners secondary `#7b61ff`;
G gets a flag or star marker (not the success green before the reveal). Good edges = green, a "step back" edge = red `#ef4343`.

## Scenes

**intro** — cube drawn self-drawing (edges stroke in), ant at A. Line 1: ant walks 3 random edges (use a walk that does
NOT reach G, e.g. A→B→A→D, so nothing hints the answer), with a 1-2-3 step counter. Line 2: G pulses with its flag, a "?" next to it.
Line 3: Vantee hello title card (shotcraft hook motion).

**question** — full question text on the right panel, cube with A (start) and G (far) on the left. Line 3: the three edges
out of A flash in turn. Line 4: "1/3" tags appear on those three edges (`\dfrac{1}{3}`). Line 5: highlight "after 3 minutes" and
"farthest". Line 6: five choice chips `\dfrac{1}{27}`, `\dfrac{1}{9}`, `\dfrac{2}{9}`, `\dfrac{1}{3}`, `\dfrac{4}{9}` labelled A–E.
Note: choice letters A–E collide with corner letters. Always show chips with the word "choice" or in a distinct chip style
(e.g. circled letters), and keep the cube corner labels a different style (plain bold letters next to dots).

**asked** — Line 1: all 8 labels pop in A..H (A highlighted). Line 2: a dashed purple space-diagonal A→G through the cube
(the "opposite end"), G flag. Line 3: right panel: "3 steps" with three empty step slots ① ② ③ and goal "end at G".

**try1** — PauseCard, question + cube still visible, 10 s countdown.

**layers** (Solution 1) — Line 1: right panel title "edges away from A". Line 2: B, D, E turn green, a label "1" by each and
a row "1 away: B, D, E". Line 3: C, F, H turn purple, row "2 away: C, F, H"; then G row "3 away: G". (Optional: a small
layered diagram on the right, A → {B,D,E} → {C,F,H} → G, four columns.) Line 4: "3 steps" vs "3 edges" side by side.
Line 5: ant steps A→B then back to A along a red edge, a red ✗ and "out of steps!", then reset.

**steps** — the product builds on the right panel, one factor per step, under the step slots:
- Line 1: from A, all 3 edges green, slot ① = `\dfrac{3}{3} = 1`.
- Line 2: ant walks A→B. Small ghost note that D and E look the same (briefly pulse D and E).
- Line 3: from B: edge B-A red, edges B-C and B-F green. Slot ② = `\dfrac{2}{3}`.
- Line 4: ant walks B→C. From C: edges C-B and C-D red, C-G green. Slot ③ = `\dfrac{1}{3}`.
- Line 5: × signs appear between slots.
- Line 6: `1 \times \dfrac{2}{3} \times \dfrac{1}{3} = \dfrac{2}{9}`; answer reveal: chip C (`\dfrac{2}{9}`) highlighted success
  green with chime at END of line (the one strong motion beat). Don't show 2/9 before this line.

**count** (Solution 2) — Line 1: right panel title "count the walks". Line 2: a 3-level move tree from A (3, then 9, then
27 small leaves; or just `3 \times 3 \times 3 = 27`, shown with the tree fanning out level by level). Line 3: "27 equally likely",
"how many end at G?". Line 4: direction legend (across / up / back arrows) on the cube at A. Line 5: three chips "across ×1",
"up ×1", "back ×1". Line 6: three empty slots _ _ _ to fill with direction chips. Line 7: `3 \times 2 \times 1 = 6`, slots
fill showing one example order. Line 8: the six routes drawn one at a time on the cube in green (slide one route, leave faint
ghosts, counter ×1…×6, never all at once), and a list on the right:
`A→B→C→G`, `A→B→F→G`, `A→D→C→G`, `A→D→H→G`, `A→E→F→G`, `A→E→H→G`.

**total2** — Line 1: `\dfrac{6}{27} = \dfrac{2}{9}` with a check mark. Line 2: put the two working rows side by side:
`\dfrac{3}{3}\times\dfrac{2}{3}\times\dfrac{1}{3}` and `\dfrac{3\times2\times1}{3\times3\times3}`, highlight tops 3,2,1 and
bottoms 3,3,3 with `Mark`. Line 3: two small tags "step by step" / "count the walks".

**traps** — one red trap card per wrong choice, each with its sum:
- Line 2: `\dfrac{1}{27} = \dfrac{1}{3}\times\dfrac{1}{3}\times\dfrac{1}{3}`. Line 3: the same card corrected:
  step ① `1`, step ② `\dfrac{2}{3}` (green), "6 routes, not 1".
- Line 4: `\dfrac{1}{9} = 1 \times \dfrac{1}{3} \times \dfrac{1}{3}` ✗, step ② should be `\dfrac{2}{3}`.
- Line 5: `\dfrac{1}{3}` = "only step ③" ✗.
- Line 6: `\dfrac{4}{9} = 1 \times \dfrac{2}{3} \times \dfrac{2}{3}` ✗, step ③ should be `\dfrac{1}{3}` (show from C only C-G reaches G).
- Line 7: habit card: "count only the edges that keep you on track".

**variant** — same cube, ant with a little "zzz". Line 2: four option chips at the ant's corner: across, up, back, nap (stay).
Line 3: each chip `\dfrac{1}{4}`, goal "at G after 3 minutes?". Don't show 3/32.

**try2** — PauseCard, 12 s, variant still visible.

**variant-answer** — Line 1: "3 edges away, 3 minutes". Line 2: nap chip crossed out red. Line 3: "4 choices each minute".
Line 4: slots `\dfrac{3}{4}`, `\dfrac{2}{4}`, `\dfrac{1}{4}`. Line 5: `\dfrac{3}{4}\times\dfrac{2}{4}\times\dfrac{1}{4} = \dfrac{6}{64} = \dfrac{3}{32}`
(chime at end of line). Line 6: `4 \times 4 \times 4 = 64`, the same 6 green routes flash on the cube, `\dfrac{6}{64}` ✓.
Line 7: confetti.

**recap** — Line 2: the step slots with "good edges / all edges" per step. Line 3: `\times` joining them. Line 4: sign-off.

## Notes

- Use `\dfrac` everywhere so digits stay ≥ 48 px, including choice chips and the trap cards.
- The voice says "two over nine" etc.; every fraction spoken must be on screen on that line.
- Copy the two sfx files + `FREESOUND-CREDITS.md` into `public/2026-10-30-ant-on-cube/sfx/`.
