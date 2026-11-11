# Build brief: 2026-11-01-rolling-square

Question `amc_practice_amc10_geometry_template:c2-075` (no `figure` in the bank: draw it from scratch).
Answer **C = (2+2√2)π**. Variant: path of the small square's CENTER → **3√2π** (no choice chips).
`narration.json` + `verify.py` are the contract. Self-contained video: do not reuse or mention the rolling-ring video.

## Figure frame (use everywhere)
- Maths plane, **y up** (like `2026-10-29-triangle-in-square`). Unit ≈ 150 px. Window must show x ∈ [-1, 3], y ∈ [-1, 3]
  (the small square leaves the big one on all four sides). Keep the stage above y ≈ 860 px.
- Big square: [0,2]×[0,2], light grey fill, dark outline, fixed (a thin "table" line under it is fine).
- Small square start: [0,1]×[2,3], light primary fill. **P = (0,2)**: the small square's bottom-left corner,
  sitting on the big square's top-left corner. P = dark `#333` dot with a white ring + label "P" (≥ 48 px).
- "Clockwise" = clockwise **as seen on screen**. In y-up maths coords a clockwise turn by θ about c is
  (x,y) ↦ c + (dx·cosθ + dy·sinθ, −dx·sinθ + dy·cosθ); if you work in screen coords (y down) the sign flips. Check that
  move 1 sends the square to the RIGHT along the top.
- Animate each move as a real rotation about its pivot (smooth is fine here: every intermediate state is valid,
  the square never enters the big one). Pivot = small pulsing ring on that corner during its move.
- Arc trail left by P, coloured by radius: r = 1 primary `#0cc281`, r = √2 secondary `#7b61ff`. Zero-radius moves leave no trail.

The 8 moves (from verify.py; square = its lower-left corner after the move):

| # | pivot | turn | P before → after | P radius | arc | square after |
|---|-------|------|------------------|----------|-----|--------------|
| 1 | (1,2) | 90°  | (0,2) → (1,3)    | 1        | π/2 | [1,2]×[2,3] |
| 2 | (2,2) | 180° | (1,3) → (3,1)    | √2       | √2π | [2,3]×[1,2] |
| 3 | (2,1) | 90°  | (3,1) → (2,0)    | 1        | π/2 | [2,3]×[0,1] |
| 4 | (2,0) | 180° | (2,0) → (2,0)    | 0        | 0   | [1,2]×[−1,0] |
| 5 | (1,0) | 90°  | (2,0) → (1,−1)   | 1        | π/2 | [0,1]×[−1,0] |
| 6 | (0,0) | 180° | (1,−1) → (−1,1)  | √2       | √2π | [−1,0]×[0,1] |
| 7 | (0,1) | 90°  | (−1,1) → (0,2)   | 1        | π/2 | [−1,0]×[1,2] |
| 8 | (0,2) | 180° | (0,2) → (0,2)    | 0        | 0   | [0,1]×[2,3] (home) |

Halfway freeze of move 2 (the key "aha" frame): square at [2,3]×[2,3], touching the big square only at (2,2).

Spoken ↔ shown: "two plus two root two, all times pi" = `(2+2\sqrt2)\pi`; "root two" = `\sqrt2`;
"pi over two" = `\dfrac{\pi}{2}`; "root two over two" = `\dfrac{\sqrt2}{2}`. Never show a decimal.
**Never show the total (2+2√2)π, or any choice value as a running sum, before sum L3.** No running total readout.

## Scenes

**intro** — L0: small square tumbling around the big one (one full lap, fast, no trail numbers), P dot leaving a faint trail.
L1: freeze at a big-square corner with a "?" over it (hint at the corner detail). L2: Vantee title card. Avoid showing the full labelled path.

**question** (poster ≈ the end of L4 of this scene, all text + figure visible; give the second count in your report)
- Left: question text card (short paraphrase lines matching the voice). Right: the figure at start, P marked, a small curved
  clockwise arrow around the big square.
- L0: big square appears with "2" on its sides. L1: small square drops on top, "1" label, left edges highlighted as lined up.
- L2: clockwise arrow. L3: ghost demo of move 1 (pivot ring at (1,2)), then snap back to start.
- L4: P pulses. L5: choice chips A `(2+\sqrt2)\pi`, B `4\pi`, C `(2+2\sqrt2)\pi`, D `(4+\sqrt2)\pi`, E `(4+2\sqrt2)\pi` (no highlight).

**asked**
- L0: P label grows; arrow from "started on the big square's top-left corner" to P.
- L1: small square's corners labelled; **bottom-left = P (tick)**, **top-left (0,3) = NOT P** (grey "✗ not this one").
  Sets up trap D.
- L2: pivot idea: ring on (1,2) labelled "pivot"; goal card "add up every arc P travels".

**try1** — pause card, figure at start visible, chips visible.

**roll1** (Solution 1)
- Right panel: build a table row per move: `move | turn | radius | arc`. Rows appear on the voice, sum NEVER shown here.
- L1: pivot ring on (1,2). L2: rotate 90° about (1,2); "90°" angle mark at the pivot. L3: dashed segment P–pivot labelled "1";
  green quarter-arc trail. L4: full faint circle radius 1 around the pivot, label `2\pi`; quarter of it highlighted → row 1 `90° | 1 | \dfrac{\pi}{2}`.

**corner**
- L0: square at [1,2]×[2,3]; pivot ring on (2,2). L1: rotate 90° and **freeze** at [2,3]×[2,3]; flash the single touching point
  (2,2), red "not flat" tag. L2: continue to 180° (lands at [2,3]×[1,2]); angle mark "180°".
- L3: draw the small square's diagonal from P=(1,3) to the pivot (2,2) **before** the move resumes (or replay), label `\sqrt2`.
- L4: purple half-circle trail; row 2 `180° | \sqrt2 | \sqrt2\,\pi`.

**rest**
- L0: move 3 (pivot (2,1)), "1", green quarter arc; row 3 `90° | 1 | \dfrac{\pi}{2}`.
- L1: move 4: pivot ring on (2,0) **coincides with P**; P pulses in place while the square flips 180° around it.
- L2: row 4 `180° | 0 | 0` ("0" big). "half a lap" tag; then moves 5–8 play (each row added as the move finishes,
  same colours) during L2–L3. L3 words list the four moves: rows 5–8 `90°|1`, `180°|√2`, `90°|1`, `180°|0`, timed to each phrase.
- L4: square home at [0,1]×[2,3], P at (0,2), check mark. Full trail visible: 4 green quarter arcs + 2 purple half circles.

**sum**
- L0: the 4 green rows highlight → `4 \times \dfrac{\pi}{2} = 2\pi`. L1: 2 purple rows → `2 \times \sqrt2\,\pi = 2\sqrt2\,\pi`.
- L2: 2 zero rows → `0`. L3: `2\pi + 2\sqrt2\,\pi = (2+2\sqrt2)\pi` → answer badge, chip C highlighted, chime at END of L3.

**circles** (Solution 2)
- L1: the 4 green quarter arcs fly from their places on the trail and join around ONE centre into a full circle radius 1, label `2\pi`.
- L2: the 2 purple half circles join into one full circle radius √2, label `2\sqrt2\,\pi`.
- L3: `2\pi + 2\sqrt2\,\pi` with "same answer" check. L4: small note card "arcs in matching sets → glue them".

**traps** — chips row; each wrong chip turns red on its line, with a mini figure:
- L1–L2 (A): freeze frame of the corner quarter turn (square at [2,3]×[2,3], one touching point). Show the sum that gives A:
  `2\pi + 2\cdot\dfrac{\sqrt2\,\pi}{2} = (2+\sqrt2)\pi`.
- L3–L4 (B): diagonal P–pivot at (2,2) with a wrong "1" crossed out → `\sqrt2`. Sum: `2\pi + 2\cdot\pi\cdot 1 = 4\pi`.
- L5–L6 (D): the small square's top-left corner (0,3) highlighted (instead of P) and its trail. Its radii: √2, 1, 0, 1, √2, 1, 0, 1
  (quarter, half, quarter, half…): `\sqrt2\,\pi + 4\pi = (4+\sqrt2)\pi`. Show only the final sum + the trail; no need to tabulate.
- L7–L8 (E): P pulsing at the pivot (2,0) with a wrong "r = 1" crossed out → "r = 0". Sum:
  `2\pi + 2\sqrt2\,\pi + 2\pi = (4+2\sqrt2)\pi`.
- L9: four tags: "wrong angle · wrong radius · wrong corner · forgotten zero".

**variant** — L0: start figure again. L1: small square's center (0.5, 2.5) marked with a secondary-coloured dot, label "center"; "?" path.

**try2** — pause card, variant figure visible.

**variant-answer**
- L0: the small square with both diagonals; half-diagonal from center to a corner labelled `\dfrac{\sqrt2}{2}`.
- L1: play the lap quickly: a dashed segment center–pivot, same length every move (all 8). The center's trail: arcs of radius √2/2
  (positions after each move: (1.5,2.5), (2.5,1.5), (2.5,0.5), (1.5,−0.5), (0.5,−0.5), (−0.5,0.5), (−0.5,1.5), (0.5,2.5)).
- L2: `4 \times 90^\circ + 4 \times 180^\circ`. L3: `= 1080^\circ`. L4: `= 3` full turns → three circles of radius `\dfrac{\sqrt2}{2}`.
- L5: `2\pi \cdot \dfrac{\sqrt2}{2} = \sqrt2\,\pi`, then `3 \times \sqrt2\,\pi = 3\sqrt2\,\pi` badge, chime at END of L5.

**recap** — card: "List every move: pivot + angle" / "radius = distance from the pivot (can be 0!)", small figure with one arc. L3 sign-off.
