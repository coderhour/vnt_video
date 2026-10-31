# Build brief: 2026-10-30-sliding-triangle

Question `amc_practice_amc8_mixed_template:c1-716`. Answer 30 (choice E, correct_index 4).
`narration.json` and `verify.py` are the contract: do not change maths or meaning.

## Figure (maths coordinates, y up, 1 unit = same scale both axes)
The bank SVG is exactly this at 22 px/unit (screen y down); use it as the base.
- Original T (black outline): (0,0) (12,0) (0,9). Right angle bottom-left. 12 = bottom leg, 9 = left leg.
- Copy C (black outline): (4,0) (16,0) (4,9). Slid 4 right along the bottom line.
- Overlap O: (4,0) (12,0) (4,6). Right angle at (4,0); its slanted side lies on T's hypotenuse.
- Shaded part (copy minus overlap, gray #d0d0d0 in the bank): (12,0) (16,0) (4,9) (4,6).
- Left strip L (original minus overlap): (0,0) (4,0) (4,6) (0,9), a trapezoid with vertical sides 9 and 6.
- Labels: "12" under T's base (dimension bar 0..12), "9" left of T's left side, "4" under 0..4.
- Note: the two hypotenuses are parallel (true, not misleading). Don't let the strip and the shaded
  part look congruent: they are equal in AREA only (strip is a trapezoid, shaded is a quadrilateral).

## Scenes
- **intro**: L1 draw T, then C appears on top of it and slides 4 right (smooth slide is fine here: every position is valid).
  L2 shade the copy-only part, show a "?" in it. Don't show 24 or 30 as numbers yet (24 can be said but don't
  label the overlap with it). L3 Vantee title card.
- **question**: full prompt text (KaTeX for numbers) + bank figure + the five choices A 18, B 24, C 27, D 28, E 30 on L4.
- **asked**: L2 highlight the bottom leg "12" and left leg "9", draw the right-angle mark at (0,0).
  L3 arrow along the base from x=0 to x=4 labelled "4". L4 pulse the gray region; caption-side note
  "shaded = copy − overlap".
- **try1**: pause card with the question figure still visible.
- **whole**: L2 highlight C, row `\tfrac12 \times 12 \times 9`; L3 `= 54`, write "54" inside C.
- **overlap**: L1 fill O in primary #0cc281 (light). L2 right-angle mark at (4,0) and dot at x=4.
  L3 bar under O from 4 to 12, row `12 - 4 = 8`. L4 highlight T's hypotenuse segment that O shares, then show
  T and O side by side (O = shrunken T, same angles). L5 `\dfrac{8}{12} = \dfrac{2}{3}`.
  L6 O's vertical side (4,0)-(4,6) highlighted, row `\dfrac23 \times 9 = 6`. L7 `\tfrac12 \times 8 \times 6 = 24`, "24" in O.
- **total1**: L1 row `54 - 24 = 30`; L2 answer reveal (strong motion beat + chime at END of line), E 30 highlighted green.
- **strip**: L1 dim C, highlight T. L2 fill O again; note "T also = 54, also loses 24". L3 equals sign between
  L (secondary #7b61ff) and the gray shaded part: "same size". L4 fill L in purple, width bar "4".
  L5 label left side "9", "?" on right side (4,0)-(4,6). L6 step triangle on the hypotenuse: 12 across / 9 down,
  then scaled to 4 across / 3 down (`\dfrac{9}{12} = \dfrac34`). L7 `9 - 3 = 6`, replace "?" with "6".
- **strip-area**: L1 L rotated/marked as trapezoid: sides 9 and 6, width 4. L2 rows `9 + 6 = 15`,
  `15 \div 2 = 7.5`, `7.5 \times 4 = 30` (say "seven and a half", show 7.5 or 7\tfrac12). L3 "30" check mark.
- **traps** (red #ef4343 cards, one per choice, each with its sum):
  L2 card "24 = overlap" with O filled. L3 card `54 \div 2 = 27`, "✗ not half".
  L4 card `\tfrac12 \times 4 \times 9 = 18`: draw dashed red triangle (0,0) (4,0) (0,9) over L.
  L5 show L's right side 6 tall vs the triangle's point at (4,0) — the missing top piece.
  L6 card: dashed red line from (0,9) dropping to (4,5); L7 `\dfrac{9+5}{2}\times 4 = 28`, with true 6 vs wrong 5 marked.
  L8 habit pill: "What is shaded? Check every height."
- **variant**: new figure T' (0,0) (10,0) (0,5); copy (4,0) (14,0) (4,5); shaded = copy minus overlap.
  Labels 10, 5, 4. No answer shown.
- **try2**: pause card with the variant figure.
- **variant-answer**: L1 `\tfrac12 \times 10 \times 5 = 25`. L2 overlap (4,0) (10,0) (4,3) filled; `10-4=6`, `\dfrac{6}{10}=\dfrac35`.
  L3 `\dfrac35 \times 5 = 3`. L4 `\tfrac12\times6\times3 = 9`. L5 `25 - 9 = 16` (reveal + chime at end).
  L6 strip (0,0) (4,0) (4,3) (0,5): sides 5 and 3, width 4. L7 `\dfrac{5+3}{2}\times 4 = 16` check. L8 confetti.
- **recap**: key idea card: "Slide a triangle along its base → the overlap is a smaller copy. Whole − overlap = left over."
  Show T, C, O small with O highlighted.

## YouTube
Title: `Slide a Triangle, Find the Shaded Part | AMC 8-Style Level 4`
Description:
A triangle gets copied and slid 4 to the right. How much of the copy sticks out?
Vantee shows two ways to solve it: whole minus overlap, and a clever left-over strip.
Then try a new slide yourself!
