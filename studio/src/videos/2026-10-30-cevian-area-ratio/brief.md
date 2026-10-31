# Build brief: 2026-10-30-cevian-area-ratio

Question `amc_practice_amc8_geometry_template:c1-305`. Answer **C, 24** (bank correct_index 2).
`narration.json` and `verify.py` are the contract: do not change any maths or narration meaning.

**YouTube title:** Where Do the Lines Cross? | AMC 8-Style Level 4
**Description:**
Two lines cross inside a triangle of area 60. How big is the shaded piece?
Vantee shows two kid-friendly ways: same-height triangles and one clever parallel line, plus the traps and a new triangle to try.

## Figure (use the bank SVG coordinates, scaled uniformly; screen y down)
Bank viewBox 0 0 284 240. These are drawn TRUE to the ratios (AD and BE are not perpendicular, the triangle is scalene), so keep them exactly:
- A (98, 32), B (32, 208), C (252, 208)
- D (142, 208) midpoint of BC — equal tick marks on BD and DC (bank ticks at x=87 and x=197)
- E (200.667, 149.333) on AC with AE:EC = 2:1
- P (133.2, 172.8) = AD ∩ BE (AP:PD = 4:1)
- F (226.333, 178.667) midpoint of EC (solution 2 only)
Labels ≥ 48 px. Shaded ABP in light primary green, not grey. Never show "24" or AP:PD = 4:1 before its line.

Five-piece areas (solution 1; question): ABP 24, BPD 6, CPD 6, CPE 8, APE 16 (sum 60).

## Scenes
- **intro**: figure draws itself (AD, BE), ABP shades. L2 "half the triangle": briefly flash triangle ABD outline (half), then fade — don't label 30 yet.
- **question**: full prompt (KaTeX) + figure. L2 `[ABC]=60`; L3 tick marks on BD, DC; L4 AE:EC = 2:1 marks on AC (3 equal step ticks, 2 on AE, 1 on EC); L5 P appears, ABP pulses. L6 choices (A) 15 (B) 20 (C) 24 (D) 30 (E) 40.
- **asked**: highlight facts: BD = DC; AC split in 3 equal parts (2 near A, 1 near C). L3: a "?" marker sliding ALONG AD near P — don't show any ratio value. Goal chip: `[ABP] = ?`.
- **try1**: pause card with the figure.
- **rule** (Solution 1): L2–3 a small side demo: two triangles sharing an apex with bases on one line, the common dashed height drawn, `\text{area ratio} = \text{base ratio}`. L4 back on the main figure: shade ABD and ADC two colours, each labelled 30; dashed height from A to BC; `\dfrac{60}{2}=30`.
- **pieces**: L1 draw CP (dashed, new colour); five regions outlined. L2 shade BPD and CPD, label `x` each (equal ticks on BD, DC). L3 APE and CPE; marks AE = 2 steps, EC = 1 step. L4 labels `y` (CPE) and `2y` (APE). Keep ABP labelled `?`.
- **equations** (right panel rows): L1 highlight ADC = pieces x, y, 2y; L2 `x + 3y = 30`. L3 highlight BEC (corner B, base EC = ⅓ AC); L4 `[BEC] = \dfrac{1}{3}\times 60 = 20`, pieces x, x, y; L5 `2x + y = 20`.
- **solve**: L1 `2x + 6y = 60` (moved from row 1 ×2); L2 below it `2x + y = 20`, then `5y = 40` (subtract, show both rows aligned); L3 `y = 8`, then `2x + 8 = 20 \Rightarrow x = 6`; update labels on figure: x→6, y→8, 2y→16. L4 `[ABP] = 30 - 6 = 24` — answer reveal (strong beat, chime at END of line), ABP labelled 24, choice C highlighted. L5 check: shade ABP+APE = ABE, `24 + 16 = 40 = \dfrac{2}{3}\times 60` (show `\dfrac{2}{3}` because AE is 2 of 3 parts).
- **parallel** (Solution 2): fresh figure (no CP). L2 draw DF parallel to BE (dashed, parallel arrow marks on both DF and BE), label F. L3 highlight triangle CBE and its half-size copy CDF (CD = ½ CB); F the midpoint of EC (equal ticks EF = FC). L4 step marks along AC: AE = 4 steps, EF = 1, FC = 1 — label `4`, `1`, `1`. L5 highlight triangle ADF; PE ∥ DF; `AP : PD = AE : EF = 4 : 1`. L6 `AP = \dfrac{4}{5}AD`, highlight ABP inside ABD (shared corner B). L7 `\dfrac{4}{5}\times 30 = 24` + C chip. L8 small "best for: a ratio along a line" note.
- **traps**: one card per wrong choice, red `#ef4343`, with the figure piece:
  30 → ABD shaded, `\dfrac{1}{2}\times 60 = 30`; 40 → ABE shaded, `\dfrac{2}{3}\times 60 = 40`;
  20 → AD wrongly split 2:1 (red ghost point), `\dfrac{2}{3}\times 30 = 20`, then L5 correct split on AD 4:1 in green;
  15 → ghost P at midpoint of AD, `\dfrac{1}{2}\times 30 = 15`. L7 habit card "Every line gets its own ratio."
- **variant**: new triangle, same A, B, C, D; E at AE:EC = 3:1 → E (213.5, 164), P (135.714, 182.857), F (232.75, 186). Show `[ABC] = 84`, ticks on BD = DC, 4 step marks on AC (3 + 1). Goal `[ABP] = ?`. Don't draw DF yet.
- **try2**: pause card with the variant figure.
- **variant-answer**: L1 draw DF ∥ BE, F midpoint of EC. L2 steps AE = 6, EF = 1, FC = 1; `AP = \dfrac{6}{7}AD`. L3 `[ABD] = \dfrac{84}{2} = 42`. L4 `\dfrac{6}{7}\times 42 = 36` (reveal, chime at end). (Pieces for reference only: ABP 36, BPD 6, CPD 6, CPE 9, APE 27.)
- **recap**: key idea card: "Find how the crossing point splits each line, then take that fraction of a bigger triangle." Small icons for the two tools: same-height triangles, parallel line.
