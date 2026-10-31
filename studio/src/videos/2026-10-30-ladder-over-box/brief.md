# Build brief: 2026-10-30-ladder-over-box

Question: `amc_practice_amc8_geometry_template:c1-490`. Answer D = 35 (correct_index 3). `verify.py` and
`narration.json` are the contract: do not change any maths or narration meaning (reword only for TTS
mishears, and list every reworded line).

YouTube title: **The Ladder Over the Box | AMC 8-Style Level 5**

Description (2–3 lines, then tts.py chapter lines):
> A ladder leans over a big box and touches the wall. How long is it?
> Vantee shows how a ladder's steepness stays the same, how to find its height with rise over run,
> and how Pythagoras (and two friendly 3-4-5 triangles) gives the length.

## The figure (side view, maths plane, y up, feet)

- Ground: y = 0 from x = −1 to 22. Wall: x = 21, from y = 0 up to y ≈ 31 (label "wall").
- Box: rectangle (9,0)–(21,0)–(21,12)–(9,12), light grey fill, flush against the wall.
- Foot F = (0,0) (dot). Box's top OUTER corner P = (9,12) (dot; the corner away from the wall).
  Wall point W = (21,28) (dot). Ladder = segment F→W, passing exactly through P.
  Inner top corner (21,12) sits ON the wall: never put the ladder there.
- Use a uniform scale (same px per foot on both axes, e.g. 22 px/ft) so the 4:3 slope looks true.
  The figure is ~22 × 31 ft, so it fits the left/centre of the stage at that scale.
- Labels (≥ 48 px): "9" under F→(9,0), "12" under the box base, "12" on the box's left side.
  The wall height "28" and the ladder length appear only when the script reaches them.
- The bank's SVG uses this same geometry (6 px/ft): use it as the base if convenient.

Colours: small triangle F–(9,0)–P = primary `#0cc281`; big triangle F–(21,0)–W = secondary `#7b61ff`;
upper small triangle P–(21,12)–W = a third tint (e.g. amber) in Solution 2. Traps in `#ef4343`.

## Scenes

- **intro**: figure draws itself (ground, wall, box, then ladder sweeps up). L2: flash a "?" on the ladder. No numbers that are choices.
- **question**: full prompt text + figure. L2 highlight box sides 12 / 12; L3 "9"; L4 pulse P ("top outer edge"); L6 choices
  `15, 20, 28, 35, 37` as A–E (KaTeX chips).
- **asked**: L2 bracket under the ground from F to the wall labelled `9 + 12 = 21` (show the sum). L3 pulse P with "12 ft up".
  L4 trace the full ladder F→W in a bold colour, label "?".
- **try1**: pause card, figure visible.
- **slope**: L1 shade the small green triangle F,(9,0),P. L2 run label "9 across", rise label "12 up" on that triangle.
  L3 show the ladder as one straight line (subtle arrow along it). L4 right panel: `\dfrac{12}{9} = \dfrac{4}{3}`, and draw
  a tiny 3-across / 4-up step on the ladder. L5 `21 = 7 \times 3`; show the 7 steps of 3-across, 4-up along the ladder
  (step through them one at a time, no smooth tween). L6 `7 \times 4 = 28`. L7 dot W, label "28" on the wall side.
- **pythag**: L1 shade the big purple triangle F,(21,0),W; legs "21" and "28". L2 `L^2 = 21^2 + 28^2`.
  L3 `21^2 = 441`, `28^2 = 784` (separate rows). L4 `441 + 784 = 1225`. L5 `35 \times 35 = 1225`. L6 Answer badge
  `L = 35` → choice D (one strong motion beat, chime at line end).
- **pieces**: L1 split the ladder at P into two coloured pieces. L2 green triangle again, legs 9 and 12,
  chip "3-4-5 × 3". L3 label lower piece "15" and show `9,12,15 = 3 \times (3,4,5)`. L4 shade the upper triangle P,(21,12),W, run "12" along the box top.
  L5 `12 \times \dfrac{4}{3} = 16`, rise label "16" on the wall from y = 12 to 28. L6 `12,16,20 = 4 \times (3,4,5)`.
  L7 label upper piece "20", then `15 + 20 = 35`, check mark. L8 no new maths.
- **traps**: one red card per wrong choice, each with the figure piece highlighted:
  15 = lower piece only (F→P); 20 = "what you'd get if…" upper piece only (P→W); 28 = the wall height (vertical segment (21,0)→W),
  "height ≠ length"; 37 = `9 + 28 = 37` with "what you'd get if…" wording on screen, then L6 an "across + up" L-path vs the
  straight ladder (the ladder cuts the corner). L7 habit card: "The ladder goes all the way to the wall."
- **variant**: new figure, same layout: box (6,0)–(15,0)–(15,8)–(6,8), wall x = 15, foot (0,0), corner P = (6,8).
  Labels "6", "9", "8". Draw the ladder to the wall but show no height and no length (no 20, no 25).
- **try2**: pause card, variant figure visible.
- **variant-answer**: L1 `\dfrac{8}{6} = \dfrac{4}{3}`. L2 `6 + 9 = 15 = 5 \times 3`. L3 `5 \times 4 = 20`, label wall point (15,20).
  L4 `15^2 + 20^2 = 625`. L5 `25 \times 25 = 625`, Answer `L = 25`. L6 labels "10" (lower piece) and "15" (upper piece)
  on the ladder, and `10 + 15 = 25`. No triples on screen. L7 confetti.
- **recap**: L2 the line with repeating 3-across / 4-up steps. L3 two-step summary: "small triangle → height",
  "Pythagoras → length". L4 sign-off.

Figure-check notes: the ladder passes through P exactly (12/9 × 9 = 12) and stays above the box top between x = 9 and 21,
so it never cuts through the box. In the variant it passes through (6,8) and reaches (15,20).
