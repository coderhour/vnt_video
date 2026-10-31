# Build brief: 2026-10-30-equilateral-angle-chase

Question `amc_practice_amc8_geometry_template:c1-082`. Answer **10** (choice A, correct_index 0).
`narration.json` + `verify.py` are the contract: no maths or meaning changes. Reword only for TTS
mishears, and list every reworded line in your report. 57 lines (about 6:30).

## YouTube
- Title: **The Tiny Angle Inside a Triangle | AMC 8-Style Level 4**
- Description (before the chapter lines):
  > An equilateral triangle, two equal lengths and just one angle: twenty degrees. Can you chase it to the tiny angle x?
  > Vantee shows two ways to solve it, a hidden "half" pattern, the traps behind each wrong answer, and a new one for you to try.

## Figure (accurate, use it)
The bank SVG (viewBox 291×260, y down) is exact; `verify.py` reproduces it. Scale it up uniformly.
- A (145.5, 30), B (30, 230), C (260.9, 230), D (110.2, 230), E (247, 205.9).
- Segments: triangle ABC, AD, DE. Tick marks (double ticks) on AD and AE (equal). D is between B and C, E between A and C.
- True angles: BAD 20, DAE 40, ADE = AED 70, ADB 100, ADC 80, DEC 110, C 60, x = EDC 10.
- x is a thin 10° wedge at D between DE and DC: draw its arc small and put the "x°" label outside the wedge
  (to the right, below DE) so it's readable at 48 px. The 20° arc at A sits between AB and AD.
- Angle labels: `20°`, `40°`, `70°`, `80°`, `100°`, `110°`, `60°` at ≥ 48 px, each in its own slot (no overlaps;
  the 70° at D and the x at D are close: place 70° above DE inside triangle ADE, x° below/right).
- Colours: given facts primary `#0cc281`; derived angles secondary `#7b61ff`; x / answer success `#21c45d`; traps `#ef4343`.

## Scenes (key visuals per line; line numbers are 0-based)
- **intro**: figure, x wedge pulses on l0; the 20° mark glows on l1, a dotted "chase" path from A to D on l1. No answer shown.
- **question**: full prompt text (KaTeX) + figure. l0 triangle ABC highlight; l1 dots D and E; l2 tick marks on AD, AE flash;
  l3 20° arc; l4 x arc; l5 choices row `10 15 20 30 40` (A–E), `<Choices>` with Tex, ≥ 48 px.
- **asked**: fact chips: l0 `60°` in all three corners of ABC; l1 shade triangle ADE + ticks, chip "AD = AE";
  l2 goal chip `x = \angle EDC = ?` with the x wedge highlighted.
- **try1**: pause card, question + figure visible.
- **top** (Solution 1): l1 split angle A: 20° (between AB, AD) and the rest (between AD, AE); row `60° − 20° = 40°` on l2,
  40° arc lands on angle DAE.
- **isos**: triangle ADE shaded; l0 base angles at D (ADE) and E (AED) marked with matching single arcs, "?" labels;
  l1 rows `180° − 40° = 140°`; l2 `140° ÷ 2 = 70°`, both base angles become 70°.
- **outside**: l0 shade triangle ABD (left one); l1 draw angle ADC (between DA and DC, 80°) with a "?";
  l2 show the rule: the two far angles B (60°) and BAD (20°) glow while ADC glows; l3 row `60° + 20° = 80°`, label ADC 80°.
- **subtract**: l0 ADC splits into ADE 70° (upper) + x (lower); l1 row `x = 80° − 70°`; l2 `x = 10°` answer reveal
  (Answer component, chime at END of l2), choice A highlighted. Strong motion beat here only.
- **sol2**: l0 straight line AEC highlighted at E, 70° (AED) marked; l1 row `180° − 70° = 110°`, 110° on angle DEC
  (between ED and EC); l2 shade small triangle DEC, 60° at C; l3 row `180° − 110° − 60° = 10°`; l4 small "when to pick" note.
- **pattern**: l0 side-by-side chips `20° → 10°`, "half!"; l1 replace 20° with `a` on the figure;
  l2 rows `\angle DAE = 60° − a`, then `\dfrac{180° − (60° − a)}{2} = \dfrac{120° + a}{2} = 60° + \dfrac{a}{2}`
  (show the in-between step, the voice says "works out to"); l3 `\angle ADC = 60° + a`, then
  `x = (60° + a) − (60° + \dfrac{a}{2})` with the two 60°s cancelling; l4 boxed `x = \dfrac{a}{2}`.
  Do NOT animate a slider through values of a (would show the variant answer early). Keep `a` symbolic.
- **traps**: one red trap card per wrong choice, each pointing to where that number lives on the figure:
  l1 `20` → arc BAD; l2 `40` → arc DAE; l3–l4 `30` → angle ADB (between DA and DB, 100°), row `100° − 70° = 30°`,
  then show x is on the C side (next to ADC); l5 `15` → card `if \angle BAD = 30°: \; 30° ÷ 2 = 15°` (hypothetical, label it "if…");
  l6 habit line: all found angles appear on the figure at once.
- **variant**: new figure with BAD = 36. Screen coords (same scale as bank SVG, y down):
  A (145.5, 30), B (30, 230), C (260.9, 230), **D (166.5, 230)**, **E (246, 204.2)**. D is now right of the midpoint of BC — correct, since 36 > 30.
  Show `36°` arc at A, ticks on AD and AE, x arc at D. Text "∠BAD = 36°, x = ?".
- **try2**: pause card, variant figure visible.
- **variant-answer**: true angles DAE 24, ADE = AED 78, ADC 96, ADB 84, x 18.
  l0 `60° − 36° = 24°`; l1 `180° − 24° = 156°`, `156° ÷ 2 = 78°` (both base angles 78°);
  l2 `60° + 36° = 96°` on ADC; l3 `x = 96° − 78° = 18°` (answer chime at end of l3);
  l4 `36° ÷ 2 = 18°` check mark; l5 celebrate (light confetti ok).
- **recap**: two-step card: "1. Angle at D: outside angle = sum of the two far angles" and
  "2. Subtract the isosceles base angle" plus `x = \dfrac{\angle BAD}{2}` as a small bonus note; sign-off.

## Watch-outs
- Every number spoken is on screen at that moment; spoken "A D" etc. matches labels.
- Never show 10 before `subtract` l2, and never show 18 before `variant-answer` l3.
- Captions < 100 chars already; keep the stage above y ≈ 860.
