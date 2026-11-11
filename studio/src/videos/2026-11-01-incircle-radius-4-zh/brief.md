# Build brief: 2026-11-01-incircle-radius-4

Question `amc_practice_amc10_geometry_template:c1-301`. Answer 162 (choice E, correct_index 4).
`narration.json` and `verify.py` are the contract: do not change maths or meaning. 60 lines.
The bank has NO figure for this question: draw it from the coordinates below.

## Figure (maths coordinates, y up, same scale on both axes)
A at the origin, side AC along +x, side AB along direction (5/13, 12/13), so angle A ≈ 67.4° (NOT 60 or 90).
Incircle centre I = (6, 4), radius 4. Touch point on AC = (6, 0); on AB = (30/13, 72/13) ≈ (2.31, 5.54).
Tangent pieces: 6 and 6 at A, y and y at B, z and z at C.

The three integer solutions share A, both rays and the SAME circle; only line BC changes (a different tangent line):
| y, z | B | C | touch on BC | sides AB, AC, BC | s | perimeter |
|---|---|---|---|---|---|---|
| 7, 8 | (5, 12) | (14, 0) | (9.2, 6.4) | 13, 14, 15 | 21 | 42 |
| 4, 20 | (3.846, 9.231) | (26, 0) | (7.538, 7.692) | 10, 26, 24 (right angle at B) | 30 | 60 |
| 3, 72 | (3.462, 8.308) | (78, 0) | (6.443, 7.976) | 9, 78, 75 | 81 | 162 |

- **Compact figure** (question, asked, try1, setup, area, intro): the y=7, z=8 triangle at ~40 px/unit (≈560×480 px).
  On the question figure label ONLY "4" (radius, drawn from I to the AC touch point), "6", "6" (the two pieces at A)
  and the vertex letters. No side lengths: they would leak choice A.
- **Three-triangle figure** (traps line 1, and the table reveal): all three drawn at ONE common scale so the circle
  is identical: ~21 px/unit (78 units ≈ 1640 px wide, height ≈ 260 px incl. the 13-14-15 apex at y=12). Do not
  normalise each triangle to its own box: the point is that the same circle fits a long, skinny triangle.
  Never step through BC positions between them with a smooth tween showing numbers; crossfade/step between the three.
- Do NOT show the 3-72 skinny triangle, 162 or 78 before they are spoken: 162 first appears on table line 10 (the 2s column); the sliver and 78 wait for line 11 (reveal).

## Scenes
- **intro**: L1 compact figure draws (triangle, then circle, radius "4"). L2 a small red card "÷ 2 slip" wobbles,
  no numbers. L3 Vantee title card.
- **question**: prompt text left (KaTeX for 4, 6, \overline{AB}, \overline{AC}); compact figure right with radius 4
  and the two 6s. L4 choice chips A 42, B 60, C 81, D 150, E 162. Poster: last second of this scene (all visible).
- **asked**: L1 the three touch points pulse, radius "4" highlighted. L2 the two 6-pieces at A glow (primary),
  then pill "BIGGEST perimeter · whole-number sides".
- **try1**: pause card, compact figure visible.
- **setup**: L1 side mini-diagram: point P outside a small circle, two tangent segments with equal tick marks
  ("equal"). L2 back to the main figure: pieces at A labelled 6, 6; then pieces at B labelled y, y (secondary
  colour, same tick mark style). L3 pieces at C labelled z, z (a third colour). Each piece must be the segment
  from the vertex to the touch point. L4 rows `AB = 6 + y`, `AC = 6 + z`, `BC = y + z`, each side flashing as read.
  L5 row `AB \text{ whole} \Rightarrow y \text{ whole}` (and z). L6 row `s = 6 + y + z` labelled "half the perimeter";
  show one piece from each corner (6, y, z) lifting out and lining up.
- **area**: L1 draw IA, IB, IC; tint the three small triangles (IAB, IBC, ICA) three soft colours.
  L2 in each small triangle draw the radius to the touch point with a right-angle mark and "4"; its base side flashes.
  L3 rows `\text{Area} = \tfrac12 \cdot 4 \cdot (AB + BC + CA)` then `= \tfrac12 \cdot 4 \cdot 2s = 4s`.
  L4 row `\text{Area} = \sqrt{s(s-a)(s-b)(s-c)}` with a small key a = BC, b = CA, c = AB.
  L5 rows `s - BC = 6`, `s - CA = y`, `s - AB = z` (show e.g. (6+y+z) − (y+z) = 6 briefly for the first one).
  L6 `\text{Area} = \sqrt{s \cdot 6 \cdot y \cdot z}`.
  L7 rows `4s = \sqrt{s \cdot 6yz}` (set equal), `(4s)^2 = s \cdot 6yz` then `16s^2 = 6yz \cdot s`. L8 `16s = 6yz` then `8s = 3yz`.
  L9 `8(6 + y + z) = 3yz` then `3yz = 48 + 8y + 8z` (write it in THIS order, 3yz on the left) — keep it boxed; it carries into the next two scenes.
- **table** (Solution 1): L2 the 8z term travels from the right to the left side: `3yz - 8z = 8y + 48`. L3 `z(3y - 8) = 8y + 48` then `z = \dfrac{8y + 48}{3y - 8}` (keep visible).
  L4 note `3y - 8 > 0`, `3y > 8`, `y \ge 3`. L5–L9 table rows y | z appear on their lines:
  3 | 72/1 = 72 ✓, 4 | 80/4 = 20 ✓, 5 | 88/7 ✗ and 6 | 96/10 ✗ (both on L7), 7 | 104/13 = 8 ✓, 8 | 112/16 = 7 (grey, "flip of 7, 8").
  L10 add columns s and 2s for the three ✓ rows: 81 → 162, 30 → 60, 21 → 42.
  L11 ANSWER REVEAL (the strong motion beat): 162 row highlighted, answer badge "162", chip E green, chime at END of line.
  Then the three-triangle figure: 13-14-15, 10-24-26, and the long 9-75-78 sliver, same circle (fine to keep
  the sliver on screen through the hold; sides unlabelled since the narration doesn't say them).
- **factor** (Solution 2): start from the boxed `3yz = 48 + 8y + 8z`, rearranged to `3yz - 8y - 8z = 48` (show it). Reveal each new right-hand side (144, 208) on the line that SAYS it, not before.
  L1 `\times 3`: `9yz - 24y - 24z = 144`. L2 `+64`: `9yz - 24y - 24z + 64 = 208`.
  L3 `(3y - 8)(3z - 8) = 208`, with a small check row that expanding gives 9yz − 24y − 24z + 64.
  L4 list the pairs 1×208, 2×104, 4×52, 8×26, 13×16 and the rule `(3y - 8) + 8 = 3y`: "+8 must divide by 3".
  L5 cross out 2×104 and 8×26 (2+8=10, 8+8=16) in red; tick 1×208, 4×52, 13×16 (9, 12, 21 and 216, 60, 24 → all ÷3).
  L6 each ✓ pair → (y, z): (3, 72), (4, 20), (7, 8); highlight (3, 72).
  L7 small pill "every answer, no stopping rule needed".
- **traps**: chips; wrong ones go red with their card. L1 A 42 and B 60: the three-triangle figure with the
  13-14-15 and 10-24-26 triangles highlighted (labels "42" and "60", sides may show here: 13,14,15 / 10,24,26 —
  narration does not say them, so keep them small or omit). L2 C 81: `s = 81`, "× 2 forgotten" (this is the
  "half" slip from the intro). L3 D 150: `2(3 + 72) = 150` vs `2(6 + 3 + 72) = 162`, the two 6-pieces at A
  flashing red. L4 habit pill: "Largest? Find EVERY case, then pick."
- **variant**: new figure, same layout: A (0,0), AC along +x, AB direction (7/25, 24/25) (angle A ≈ 73.7°),
  I = (4, 3), r = 3. Draw the y = z = 6 triangle: B (2.8, 9.6), C (10, 0). Label only "3" (radius) and "4", "4"
  at A. No answer shown.
- **try2**: pause card with the variant figure.
- **variant-answer**: L1 `\text{Area} = 3s = \sqrt{s \cdot 4 \cdot y \cdot z}`. L2 `9s = 4yz`, `9(4 + y + z) = 4yz`.
  L3 `36 + 9y + 9z = 4yz`, `z = \dfrac{9y + 36}{4y - 9}`. L4 table: 3 | 63/3 = 21 ✓.
  L5 4 | 72/7 ✗, 5 | 81/11 ✗, 6 | 90/15 = 6 ✓, "then z < y".
  L6 s = 4+3+21 = 28 → 56, s = 4+6+6 = 16 → 32; reveal badge 56, chime at END of line.
  L7 draw the 3, 21 triangle: B (1.96, 6.72), C (25, 0); label sides 7, 24, 25 and the right-angle mark at B.
  Confetti.
- **recap**: key idea card: figure with pieces 6, 6 / y, y / z, z, then `\text{Area} = r \cdot s = \sqrt{s(s-a)(s-b)(s-c)}`.

## Spoken-form notes
- "three y z" = 3yz. If TTS mishears "y" as "why" in a way --check flags, reword with "the letter y" sparingly; list rewordings.
- Never show a choice number (42, 60, 81, 150, 162) except on chips, until the line that says it.

## YouTube
Title: `A Circle of Radius 4: How Big Can the Triangle Get? | AMC 10-Style Level 4`
