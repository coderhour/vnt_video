# Brief: 2026-11-01-fence-corner (c2-070, answer B = 18 + 18√2 ≈ 43.46)

Maths plane, y UP, corner O at the origin. Walls = positive x-axis ("bottom wall") and positive y-axis
("side wall"), drawn as thick grey wall bands (hatching outside the region). Fence = primary green #0cc281,
thick. Region fill = light green. Labels O, A (end on bottom wall), P (bend), B (end on side wall), ≥ 48 px.
All numbers below are verified in verify.py. Never show 18+18√2 / ≈43.5 outside the choice list before
area1 L6 (the reveal). Line numbers L0, L1… are 0-based within each scene. Any "live area readout" must not pass through a choice value before the reveal.

Reference shapes (fence units):
- Lopsided example (intro, tallest): A=(9,0), P=(7.5,3.708), B=(0,6.490). AP=4, PB=8.
- Square bend: A=(6,0), P=(6,6), B=(0,6). Area 36.
- Straight fence: A=(6√2,0)=(8.485,0), B=(0,8.485). Area ½(6√2)² = 36.
- BEST: R = 7.839 (R² = 36+18√2, don't show R's value). A=(7.839,0), P=(5.543,5.543), B=(0,7.839).
  AP = PB = 6, bend angle 135°, OA = OP = OB.

## intro
- L0: walls + lopsided fence, region fills in. L1: fence morphs to the square bend (6×6), then a red-ish
  "NOT the best" stamp/strike (do not show the best shape or 43.5). L2: Vantee name card; tease a mirror icon.

## question (poster: ~ end of line 3, choices on screen)
- Left: figure with lopsided example (unlabelled lengths). Right: question text (KaTeX for 12).
- L2: highlight "total length 12". L3: five choices A–E with KaTeX: 36, 18+18√2, 36√2, 36+18√2, 72+72√2.

## asked
- L0: labels O, A, B, P appear one by one on the figure.
- L1: walls glow "free"; fence end points A and B slide along their walls, P moves (stay valid: AP+PB=12 always).
- L2: square bend; write "6 × 6 = 36". L3: straight fence with equal legs; write
  \tfrac12(6\sqrt2)^2 = 36 (use \dfrac), legs labelled 6√2. Then "?" for "can a bend do better".

## try1 — pause card with the question figure and choices.

## mirror (Solution 1)
- L1: reflect the region in the x-axis (flip animation, mirrored copy lighter); fence now 4 pieces.
- L2: reflect both in the y-axis; walls fade out → one closed 8-sided outline (use the lopsided example,
  so it is a non-regular octagon). L3: count the 8 pieces 1..8; "perimeter = 4 × 12 = 48".
- L4: "area = 4 × region"; goal card: "biggest octagon, perimeter 48".

## regular
- L0: small inset: a loop of string → circle ("fixed perimeter → circle holds most").
- L1: morph the irregular octagon into a REGULAR octagon centred at O, vertices at angles 0°,45°,…,315°,
  circumradius R (so A=(R,0), P at 45°, B=(0,R)). Tick marks: equal sides, equal angles.
- L2–L3: walls reappear on the axes with a right-angle mark and "90°" written at O; draw 45° angle marks between consecutive vertex rays from O;
  the 90° quarter holds exactly two sides, highlighted green = our fence A→P→B.
- L4: "48 ÷ 8 = 6" and label both pieces 6.

## area1
- L0: rotate the octagon 22.5° so a side sits flat; draw the bounding square (dashed) around it.
- L1: highlight one corner triangle (right isosceles, hypotenuse 6); write leg = \dfrac{6}{\sqrt2} = 3\sqrt2.
- L2: square side = 3√2 + 6 + 3√2 = 6 + 6√2 (brace along the top edge).
- L3: rows: (6+6\sqrt2)^2 = 36 + 72\sqrt2 + 72 = 108 + 72\sqrt2 (show the middle row).
- L4: corner triangle = \tfrac12(3\sqrt2)^2 = 9, four corners = 36 (shade them red-ish then cut away).
- L5: octagon = 108 + 72√2 − 36 = 72 + 72√2.
- L6: REVEAL. Quarter of the octagon re-shaded as our region; \dfrac{72+72\sqrt2}{4} = 18 + 18\sqrt2;
  answer badge "B". Chime at END of the line. L7: ≈ 43.5 vs 36 (square bend) side by side.

## tallest (Solution 2)
- Start from the lopsided example. L1: dashed segment AB; two triangles OAB (corner) and APB (bend) tinted differently.
- L2: semicircle on diameter AB on O's side; O slides along it to the midpoint (OA = OB); height to AB grows.
  Keep A, B fixed while O moves (walls hide or move with O; it's fine to show this as a free triangle).
- L3: ellipse (foci A, B, AP+PB = 12) on P's side; P slides to the top (AP = PB). Show "AP + PB = 12" label.
- L4: both heights marked, max at the middle. L5: resulting kite: tick marks OA = OB, AP = PB = 6.
  (Note: this intermediate kite need not be the final best shape; draw it with the BEST coordinates is OK
  since the next scene ends there anyway.)

## arc
- L0: dashed OP; two congruent triangles; 45° arc marks at O on both sides.
- L1: inset: triangle OAP rotated so AP (= 6) is a horizontal base; the 45°-arc above it: circle through A, P
  with radius 6/√2 ≈ 4.243, centre 3 above the midpoint of AP. Apex O slides along the arc.
- L2: apex at top of arc (height 3 + 4.243 ≈ 7.243, don't print it); tick marks OA = OP.
- L3: back to the main figure: circle centred O through A, P, B; 45° marks for both pieces.
- L4: continue chords of 6 around the circle → full regular octagon (ghost); "same answer: 18 + 18√2".
- L5: small comparison card: Solution 1 "mirror + regular wins", Solution 2 "tallest in the middle".

## traps — trap cards, red #ef4343 for wrong
- L1: A = 36 card with the square-bend thumbnail. L2: E = 72 + 72√2 card with the whole octagon, "÷ 4 forgotten".
- L3: C = 36√2 ≈ 51 and D = 36 + 18√2 ≈ 61 vs a ceiling line "best ≈ 43.5"; both above it, crossed out.
- L4: habit card "estimate each choice, cross out impossible ones".

## variant
- L0: same walls, ONE straight fence of length 10 (A=(7,0), B=(0,7.14) unequal example), label 10.
- L1: question text "largest area?" + mirror icon. try2: pause card with the variant figure.

## variant-answer
- L0: reflect in both walls → rhombus with 4 sides of 10; "perimeter 40".
- L1: morph to a square of side 10 with diagonals on the axes (vertices (±5√2,0),(0,±5√2)); "10 × 10 = 100".
- L2: quarter shaded; \dfrac{100}{4} = 25 (chime at end of line).
- L3: legs 5√2 and 5√2; \tfrac12 \cdot 5\sqrt2 \cdot 5\sqrt2 = 25.

## recap
- L1: mirror picture (region → closed shape). L2: "same perimeter + same number of sides → regular wins"
  with octagon and square icons. L3: sign-off.
