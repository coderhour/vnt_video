# Build brief: 2026-11-01-ant-on-prism

Question `amc_practice_amc10_counting_template:c3-017`. Answer **4/11** (correct_index 1). Variant answer **5/11**.
`narration.json` + `verify.py` are the contract: don't change the maths or the meaning.
The scene-level `visual` fields in narration.json are a summary; this file is the detail.

## Global rules for this video

- **Never letter the answer choices A-E.** The vertices are A-F, so "choice B" would clash. Chips show values only
  (1/3, 4/11, 5/11, 6/11, 7/11 as `\dfrac`), and the narration only ever names choices by value.
- Variables are lowercase italic letters for the winning chance at a vertex: c (at C), b (at B), d (at D), f (at F), e (variant).
  Give each one a fixed colour chip that sits next to its vertex label whenever it is in play. E = `1` (green #21c45d), A = `0` (red #ef4343).
- Different from the ant-on-cube video: no "multiply along the path", no layers. The visual idea here is **values on corners + one half-turn**.
- TTS risk: single letters "c", "b", "d" can blur ("see", "be", "dee"). If `--check` flags them, give the letter its noun
  ("the chance c") rather than changing any maths; list every reworded line.

## The prism (all scenes)

3D coordinates (x across, y up, z depth): A(0,0,0) B(2,0,0) C(1,0,√3) D(0,2,0) E(2,2,0) F(1,2,√3).
Oblique projection, screen y down: `screen = O + (210·x + 60·z, −210·y − 55·z)`. Offsets from O (= A's screen point):

| vertex | offset (px) |
|---|---|
| A | (0, 0) |
| B | (420, 0) |
| C | (314, −95) |
| D | (0, −420) |
| E | (420, −420) |
| F | (314, −515) |

- 9 edges: AB, BC, CA, DE, EF, FD, AD, BE, CF. Hidden (dashed, same colour/weight): **AC, BC, CF**. All others solid.
- C lands inside the front rectangle (textbook look). Put C's label/chip down-right of the dot so it doesn't sit on the face centre.
- Placement: question scene O ≈ (1180, 800) (prism on the right, text left). Solution scenes O ≈ (170, 790) (prism left,
  equation panel from x ≈ 760 to ≤ 1880). Keep everything above y ≈ 860.
- Front face ABED = rectangle A-B-E-D; its centre is offset (210, −210). Midpoint of CF is offset (314, −305).
- Ant = small dark dot that hops vertex to vertex along edges (ease along the edge, never off it).

### The half-turn (scene `spin`, line 3)
The axis passes through the centre of face ABED and the midpoint of CF (it's the z-direction). In this projection a 180°
turn about it is a pure 2D rotation: rotate the front vertices (A, B, D, E) about offset (210, −210) and the back vertices
(C, F) about offset (314, −305), by the same angle θ: 0 → 180° over ~2 s. Labels and chips ride with their vertex
(keep text upright). Draw the skewer as a thin purple (#7b61ff) line through both centre points, extended ~80 px beyond each.
At 180° every vertex sits where its partner was: A on E's spot, B on D's, C on F's (check: same picture). During the spin draw all
edges solid; after it, dash the edges in the AC/BC/CF screen positions again.

## Scenes

### intro
- L1: ant hops C→B→C→F (one hop ≈ 0.6 s). Must NOT touch A or E.
- L2: E glows green with a small flag "finish"; A glows red "trap"; a "?" between them.
- L3: Vantee title card.

### question (poster: about 1.5 s into line 6, choices visible)
- Text left (prompt in short lines). L2: draw ABC, then DEF. L3: AD, BE, CF highlight in turn. L4: ant at C, its 3 edges (CA, CB, CF)
  pulse. L5: E green, A red. L6: five value chips.

### asked
- L1: tags "finish" (E), "trap" (A). L2: sample walk C→F→D→A, red X at A, ant stops; then fade the walk.
- L3: goal card: `P(\text{E before A}),\ \text{start at } C`.

### try1 — pause card, prism with green E / red A.

### rules (Solution 1)
- L2: chips c, b, d, f appear at C, B, D, F; `1` at E, `0` at A.
- L3: three arrows out of B to A, C, E, each labelled `\tfrac13` (≥ 48 px, so use `\dfrac{1}{3}`).
- L4: rule card: "chance = average of its 3 neighbours".
- L5–L8: for each, highlight the vertex (ring) and its three neighbours, then write the row:
  - L5 `b = \dfrac{0 + c + 1}{3}` (neighbours A, C, E)
  - L6 `d = \dfrac{0 + 1 + f}{3}` (neighbours A, E, F)
  - L7 `c = \dfrac{0 + b + f}{3}` (neighbours A, B, F)
  - L8 `f = \dfrac{c + d + 1}{3}` (neighbours C, D, E)
  Show the neighbour values in the row in the same colours as the chips.

### solve
Too many rows for one panel: phase 1 = two columns (c work left, f work right), phase 2 replaces them.
- L1: `3c = b + f`
- L2: `3c = \dfrac{1 + c}{3} + f` then `9c = 1 + c + 3f`
- L3: `8c = 1 + 3f` (box it)
- L4: right column, quick: `3f = c + d + 1`, `3f = c + \dfrac{1+f}{3} + 1`, `9f = 3c + 1 + f + 3`, `8f = 4 + 3c` (box it)
- L5: the two boxes slide together: `8c + 8f = 5 + 3c + 3f`
- L6: `5c + 5f = 5` then `c + f = 1` (Mark highlight; keep this card, it is reused in `spin` L1)
- L7: `f = 1 - c`, `8c = 1 + 3 - 3c`, `11c = 4`
- L8: answer badge `c = \dfrac{4}{11}`; chip 4/11 turns green; chime at the END of the line.

### spin (Solution 2)
- L1: `c + f = 1` card.
- L2: tint face ABED (primary green, low alpha); circle A and E; dashed diagonal A–E.
- L3: skewer + 180° spin (see above).
- L4: pair arrows A↔E, B↔D, C↔F in three colours; text "same prism".
- L5: two mini cards side by side: "start F → reach E first" `=` "start C → reach A first".
- L6: rows `f = 1 - c`, `d = 1 - b`.

### spin-solve
- L1: `b = \dfrac{1 + c}{3}`
- L2: `c = \dfrac{0 + b + (1 - c)}{3}`, `3c = b + 1 - c`, `4c = b + 1`
- L3: `4c = \dfrac{1 + c}{3} + 1`, `12c = 1 + c + 3`, `11c = 4`
- L4: badge `\dfrac{4}{11}` again, chime at end.
- L5: on the prism, C's edge to A turns red; label "no edge to E". Small `\dfrac{4}{11} < \dfrac{1}{2}`.
- L6: card "Look for a spin that swaps win and loss".

### traps
Value chips; prism small at the side showing all solved chances: A 0, B 5/11, C 4/11, D 6/11, E 1, F 7/11
(reveal each chance only on its trap line, plus C's at the start, so nothing is spoken that isn't shown).
- L2: 1/3 red; working `\dfrac{0 + \frac12 + \frac12}{3} = \dfrac{1}{3}` with b and f crossed out as "½"; beside it the real `b = \dfrac{5}{11}`, `f = \dfrac{7}{11}`.
- L3: 5/11 red; B's chip glows `b = \dfrac{5}{11}`.
- L4: 6/11 red; D's chip glows `d = \dfrac{6}{11}`.
- L5: 7/11 red; `1 - \dfrac{4}{11} = \dfrac{7}{11}` = P(A first from C).
- L6: habit card: "circle the start and the finish line".

### variant
- L1: same prism, ant at C. L2: E loses its green; F turns green "finish"; A stays red "trap"; question card
  `P(\text{F before A}),\ \text{start at } C`.

### try2 — pause card; green F, red A, ant at C.

### variant-answer
- L1: tint face ACFD (side face A-C-F-D); circle A and F; skewer from the centre of ACFD through the midpoint of BE.
  No 3D spin needed: show the swap by flying the labels pairwise along arcs (A↔F, C↔D, B↔E), then back.
- L2: pair arrows A↔F, C↔D, B↔E; row `e = 1 - b`.
- L3: `c = \dfrac{0 + b + 1}{3}` (neighbours A, B, F highlighted)
- L4: `b = \dfrac{0 + c + (1 - b)}{3}`, `3b = c + 1 - b`, `4b = c + 1` (neighbours A, C, E)
- L5: `b = 3c - 1`, `4(3c - 1) = c + 1`, `12c - 4 = c + 1`
- L6: `11c = 5`, badge `c = \dfrac{5}{11}`, chime at end.

### recap
Two-row card with a small prism: "① chance = average of its neighbours" / "② a spin swaps win and loss → paired chances add to 1".
