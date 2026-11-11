# Builder brief: 2026-11-07-incircle-cevians

Question `amc_practice_amc10_geometry_template:c2-019`. Answer **D = 49:24**. Variant answer **8:3**.
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.

Line numbers below are 0-indexed within each scene (L0 = first line).

Choices (letters fixed): A `24:49`, B `7:4`, C `2:1`, D `49:24`, E `15:7`.

## Figure (use the bank SVG as the base, redrawn in maths coordinates, y up)
Exact coordinates (units; the bank SVG is 16 px/unit with B at (20,222), y flipped — it is accurate):
- B = (0,0), C = (14,0), A = (5,12). Sides AB 13, BC 14, CA 15.
- Incircle centre I = (6,4), radius 4.
- Touch points: D = (6,0) on BC; E = (9.2, 6.4) on CA; F = (30/13, 72/13) ≈ (2.31, 5.54) on AB
  (F is not in the question; label it F only from the `tangents` scene on).
- P = AD ∩ BE = (414/73, 288/73) ≈ (5.67, 3.95).
- Solution 2 point G on CA (line through D parallel to BE): G = (394/35, 128/35) ≈ (11.26, 3.66). CG = 32/7, GE = 24/7.
Draw it big (about 50–55 px/unit, triangle ~ 760 px wide) on the left; equation rows on a right panel.

**Misleading-figure warning:** P is only 0.34 units from the incircle centre I. Never draw I in the same
scene as P (I appears only on `tangents` L2 for the fold, with AD and BE hidden). Never call P a centre.

## Global rules
- Never show `49:24`, `49`, `24` (as a mass), or `\dfrac{49}{24}` before the line where it is spoken
  (mass L5 for 24/28/21, mass L7 for 49, reveal L0 for the ratio). The choices row is the only exception.
- Colours: segment AP primary green `#0cc281`, PD secondary purple `#7b61ff` (same everywhere, incl. the variant);
  tangent pieces: x (from A) green, y (from B) purple, z (from C) amber `#f59e0b`; traps `#ef4343`; correct `#21c45d`.
- Weights = filled circles at the vertex with the number inside (≥ 48 px digits), radius roughly ∝ weight is nice but optional.
- Segment names on screen as `AB`, `AP`, `PD` (KaTeX `\overline{AB}` not needed). Ratios as `AP:PD`, fractions `\dfrac`.
- Products in rows written with `\times`: `B\times 6 = C\times 8`. Keep stage above y ≈ 860; math ≥ 48 px.

## intro (3 lines)
- L0: ("right inside its circle": P is inside the incircle, near its centre) the figure draws itself (triangle, circle, then AD and BE), P pulses at the crossing. No numbers.
- L1: a red "2 : 1 ?" tag pops near P and gets a red strike/shake on "trap".
- L2: tiny seesaw icon (a triangle pivot + bar) tips and settles level. No numbers.

## question (4 lines) — poster: ~1.5 s into L3 (full prompt, figure with 13/14/15, all choices visible)
- L0: card "Question" + prompt text; figure on the left with side labels 13, 14, 15.
- L1: highlight sides AB, BC, CA as each length is read.
- L2: circle glows; D then E glow; AD then BE draw/glow; P pulses.
- L3: choices row A–E (Tex). All five visible by the poster time.

## asked (2 lines, hold 2)
- L0: AP turns green, PD purple; "Goal: `AP : PD`".
- L1: D and E get "?" tags with dashed brackets along BD/DC and CE/EA (no numbers).

## try1 (pause, hold 10): PauseCard with the figure + choices.

## tangents — Step 1: equal tangents (9 lines). Hide (or very faintly dim) AD, BE and P for this whole scene.
- L1: show the six tangent pieces: from A to F and A to E (green), B to F and B to D (purple), C to D and C to E (amber). Tick marks: one tick on both A pieces, two on B pieces, three on C pieces.
- L2: draw I (small dot) and the dashed line A–I extended; animate the half-picture reflecting across line AI so AF lands on AE (a short mirror/fold flash is enough). Then fade I out.
- L3: labels `x` on both A pieces, `y` on both B pieces, `z` on both C pieces.
- L4: rows `x+y=13`, `y+z=14`, `z+x=15` (each side highlights as read).
- L5: row `2(x+y+z)=42` → `x+y+z=21`.
- L6: row `x = 21-(y+z) = 21-14 = 7` (the `y+z` part highlights BC).
- L7: rows `y = 6`, `z = 8` (no subtraction rows: not spoken).
- L8: figure labels replace letters: BD 6, DC 8, CE 8, EA 7. Keep these numbers on the figure for mass and parallel scenes.

## mass — Solution 1: mass points (10 lines). Figure with 6/8/8/7 labels, AD and BE back.
- L0: empty weight discs (circles with "?") at A, B, C.
- L1: small seesaw illustration on the right: bar with pivot, a weight w1 at distance d1 and w2 at d2; row `w_1\times d_1 = w_2\times d_2`. (Letters, not numbers.)
- L2: BC highlighted as a seesaw with pivot at D; row `B\times 6 = C\times 8`.
- L3: CA highlighted as a seesaw with pivot at E; row `C\times 8 = A\times 7`.
- L4: combined row `B\times 6 = C\times 8 = A\times 7 = 168`.
- L5: discs fill: B 28, C 21, A 24 (one at a time as spoken). No extra check rows (unspoken numbers).
- L6: on BC: arrows showing B (28, heavier) with short BD = 6 vs C (21) with long DC = 8. Tag "heavier = closer".
- L7: discs B and C slide along BC and merge into a disc **49** at D (`28+21=49`).
- L8: discs A and C (ghost copy of C's 21) merge at E into a disc labelled `A+C` (no number: 45 is never spoken). Then BE glows, then AD ("balances on BE, and also on AD" — AD from the merge at D).
- L9: P pulses at the crossing; segment AD as a seesaw: disc 24 at A, disc 49 at D, pivot at P.

## reveal (2 lines) — the strong motion beat
- L0: row `24\times AP = 49\times PD` → `AP:PD = 49:24` (AP green, PD purple). The AD seesaw levels.
- L1: Answer badge "D · 49:24" with chime at the END of the line.

## parallel — Solution 2: a parallel line (8 lines). Fresh copy of the figure (no weights). Show BE, AD, P; labels 6, 8, 8, 7.
- L1: draw a dashed line from D parallel to BE, ending at G on CA (coords above). Label G. Small parallel arrows (">") on BE and DG.
- L2: shade triangle CBE lightly; highlight CB and CE.
- L3: row `CD:DB = 8:6`; CE (length 8) bracket split at G into CG and GE (no numbers yet).
- L4: row `GE = \dfrac{8\times 6}{14} = \dfrac{24}{7}`; label GE `24/7` on the figure.
- L5: shade triangle ADG (different tint); parallel marks on PE and DG; row `\dfrac{AP}{PD} = \dfrac{AE}{EG}`.
- L6: row `\dfrac{AE}{EG} = 7 \div \dfrac{24}{7} = \dfrac{49}{24}` with a green check.
- L7: tag "no weights needed".

## traps (7 lines). One red card per choice, with its working:
- L1: A `24:49` — `PD:AP`, arrows showing the two parts swapped. "flipped".
- L2: B `7:4` — figure with G drawn at the MIDPOINT of CE (wrong spot, red), `GE = 4`, `AE:EG = 7:4`; then the true G (24/7) ghosted.
- L3: C `2:1` — discs 7 at A, 6 at B, 8 at C (red), D gets `6+8=14`, `14:7=2:1`.
- L4: on BC, `6\times 6 = 36` vs `8\times 8 = 64`, `36 \ne 64`, with a tilted seesaw.
- L5: E `15:7` — highlight whole side CA = 15 and AE = 7, `CA:AE = 15:7`, tag "a side ratio, not on AD".
- L6: habit card "Check every seesaw balances".

## variant — Your turn: a 3-4-5 triangle (2 lines)
Right angle at B. Coordinates: B = (0,0), C = (4,0), A = (0,3); I = (1,1), r = 1; D = (1,0), E = (1.6,1.8), F = (0,1); P = (8/11, 9/11).
- L0: new figure, sides labelled 3 (AB), 4 (BC), 5 (CA), incircle, D, E.
- L1: D, E glow, AD and BE draw, P marked; "`AP:PD = ?`". No choices for the variant. Never show 8 or 3-as-a-weight/8:3 before variant-answer.

## try2 (pause, hold 12): PauseCard with the variant figure visible.

## variant-answer (6 lines)
- L0: `\dfrac{3+4+5}{2} = 6` ("half the perimeter"), `x = 6-4 = 2`.
- L1: `y = 1`, `z = 3` (no subtraction rows: not spoken).
- L2: figure labels BD 1, DC 3, CE 3, EA 2.
- L3: row `B\times1 = C\times3 = A\times2 = 6`.
- L4: discs B 6, C 2, A 3; D disc `6+2=8`.
- L5: answer badge **8 : 3** + chime at line end.

## recap (3 lines)
- L0: main figure with the tangent pieces 7/6/8 coloured and ticked; "equal tangents → touch points".
- L1: weights 24, 28, 21 → 49 at D; `AP:PD = 49:24`.
- L2: `<SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />`.

TTS note: many lines use two-letter segment names (C E, G E, P E, P D). Watch `--check` for "see"/"gee"/"pee" blurs and reword only as needed (e.g. "segment G E").
