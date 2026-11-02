# Builder brief: 2026-11-01-root-sum-floor

Question `amc_practice_amc10_algebra_template:c2-021`. Answer **C = 18**. Variant answer **198**.
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.

Line numbers below are 0-indexed within each scene (L0 = first line).

Choices (letters fixed): A 10, B 17, C 18, D 19, E 20.

Global rules for this video
- Never show the true value 18.59… before the `reveal` scene, line 3. No live "running total" counter anywhere.
- Spoken "root of k plus one" = `\sqrt{k+1}` (radical over the whole k+1). Always draw the radical over k+1, never `\sqrt k + 1`.
- Use `\dfrac` for every fraction; digits ≥ 48 px. Keep stage above y ≈ 860.
- Colours: floor/lower bound = primary green `#0cc281`; ceiling/upper bound = secondary purple `#7b61ff`; traps = `#ef4343`.
- No decimals are spoken. Decimals on screen only where listed below.

## intro (3 lines)
- L0: the long sum `\dfrac1{\sqrt1}+\dfrac1{\sqrt2}+\dfrac1{\sqrt3}+\cdots+\dfrac1{\sqrt{100}}` types in big, centred; a crossed-out calculator icon (simple drawn shape, no brand) on L1.
- L2: a green horizontal line (floor) slides up from below and a purple line (ceiling) slides down from above, both stopping with the sum between them. No numbers on the walls yet.

## question (4 lines) — poster: about 1 s into L2 (full prompt + all choices visible)
- L0: card "Question" + the prompt text.
- L1: the sum in KaTeX (as above), terms highlight left-to-right as read.
- L2: Mark-sweep the words "greatest whole number less than or equal to" in the prompt (no floor-bracket notation needed).
- L3: Choices row A–E: 10, 17, 18, 19, 20 (Tex). Make sure all choices are already on screen by the poster time.

## asked (4 lines)
- L0: "Goal: round the sum DOWN to a whole number."
- L1: a number line with integer ticks; show a dot between two neighbouring ticks n and n+1 (use letters n, n+1, NOT 18/19), arrow down to n.
- L2: rows: `\dfrac1{10}\le \dfrac1{\sqrt k}\le 1` then `100\times\dfrac1{10}=10\ \le\ \text{sum}\ \le\ 100\times 1 = 100`.
- L3: on the number line 0…100, a huge shaded window from 10 to 100 with a "too wide!" tag.

## try1 (pause, hold 10): PauseCard with the sum + choices visible.

## grow — Solution 1: grow a square (8 lines). Key "aha" visual.
Draw in maths coordinates (y up), one corner fixed bottom-left. Use a generic k, but draw it at a
readable scale: inner square side a = 3 units, outer side b = 3.6 units (labels are symbolic, not numeric).
- L1: inner square, label side `\sqrt k`, area label `k` inside.
- L2: outer square grows from the same corner (bottom-left fixed); label its side `\sqrt{k+1}`, area `k+1`.
- L3: shade the L-shaped strip (outer minus inner) green; label "area = 1" (because `(k+1)-k=1`, show that row). Thickness marked `g` with a small dimension bracket on the right side; caption tag `g=\sqrt{k+1}-\sqrt k`.
- L4: split the L into: right rectangle (g wide × √k tall, sits right of the inner square) and top rectangle (√(k+1) wide × g tall, across the full top). Slide them apart a little; label lengths `\sqrt k` and `\sqrt{k+1}`.
- L5: row `1 = g\sqrt k + g\sqrt{k+1} \;>\; g\cdot 2\sqrt k` (the `>` appears with the word MORE).
- L6: row `2g < \dfrac1{\sqrt k}`, then boxed green: `\dfrac1{\sqrt k} > 2\left(\sqrt{k+1}-\sqrt k\right)`.

## floor (5 lines)
- L0: nested squares from one corner, sides √1, √2, √3, … (draw ~6 explicitly, then "…", then √101 outer). Gaps alternate light/dark green.
- L1: a bracket along the bottom edge from side 1 to side √101: "all gaps = `\sqrt{101}-1`".
- L2: row `\text{sum} > 2\left(\sqrt{101}-1\right)`. Show the summed form first, small above it:
  `2(\sqrt2-\sqrt1)+2(\sqrt3-\sqrt2)+\cdots+2(\sqrt{101}-\sqrt{100})` (k = 1 … 100, ALL 100 terms, ends at √101).
- L3: `10^2=100<101`, so `\sqrt{101}>10`.
- L4: `\text{sum} > 2(10-1)=18`. Green floor line labelled 18 rises under the sum. ("There's our floor.")

## ceiling — Solution 1: the ceiling (8 lines)
Same square picture, purple, inner side √(k−1), outer side √k.
- L1: inner `\sqrt{k-1}`, outer `\sqrt k`, strip area 1.
- L2: thickness `h=\sqrt k-\sqrt{k-1}`; rectangles labelled `\sqrt{k-1}` and `\sqrt k`.
- L3: rows `1 = h\sqrt{k-1}+h\sqrt k < h\cdot 2\sqrt k` → boxed purple `\dfrac1{\sqrt k} < 2\left(\sqrt k-\sqrt{k-1}\right)`.
- L4: k = 1 check: `\dfrac1{\sqrt1}=1 < 2(\sqrt1-\sqrt0)=2` — tag "too loose".
- L5: the sum split: `\underbrace{1}_{\text{keep}} + \dfrac1{\sqrt2}+\cdots+\dfrac1{\sqrt{100}}` with "squeeze these 99".
- L6: `2(\sqrt2-\sqrt1)+2(\sqrt3-\sqrt2)+\cdots+2(\sqrt{100}-\sqrt{99}) = 2(\sqrt{100}-\sqrt1)=2(10-1)` (k = 2 … 100, ends at √100).
- L7: `\text{sum} < 1 + 2\cdot 9 = 19`. Purple ceiling line labelled 19 drops above the sum.
- Optional side note on L5–L7 (small but ≥ 48 px): "squeeze all 100 → `2+18=20`, too high" — this is what the narration means by keeping the first term; do NOT make it bigger than the main rows.

## reveal (3 lines) — the strong motion beat
- L0: number line 17–20, floor at 18 (green), ceiling at 19 (purple), sum's dot between them: `18 < \text{sum} < 19`.
- L1: Answer badge "C · 18" with chime at the END of the line (after "eighteen").
- L2: only now: `\text{sum}\approx 18.59` and the dot slides to its true spot (18.59). Fine to show this decimal on screen.

## algebra — Solution 2: the algebra shortcut (7 lines). Equation rows, one idea per row:
- L1: `\left(\sqrt{k+1}-\sqrt k\right)\left(\sqrt{k+1}+\sqrt k\right)`
- L2: `=(k+1)-k=1` (label "difference of squares")
- L3: `\sqrt{k+1}-\sqrt k=\dfrac{1}{\sqrt{k+1}+\sqrt k}`
- L4: `\sqrt{k+1}+\sqrt k>2\sqrt k` so `2\left(\sqrt{k+1}-\sqrt k\right)<\dfrac{2}{2\sqrt k}=\dfrac1{\sqrt k}` (two rows if needed).
- L5: telescoping: `(\sqrt2-\sqrt1)+(\sqrt3-\sqrt2)+(\sqrt4-\sqrt3)+\cdots+(\sqrt{101}-\sqrt{100})`; the matching middle roots cross out in pairs (strike + fade), leaving `\sqrt{101}-\sqrt1`.
- L6: tag "test day: 3 lines".

## traps (6 lines). One red card per choice, with its working:
- L1: A 10: `100\times\dfrac1{10}=10` — "true, but only a weak floor".
- L2: B 17: `17<18<\text{sum}` — "too small".
- L3: D 19: `\text{sum}<19` — a purple ceiling with the sum under it; "ceiling ≠ answer".
- L4: E 20: `2\sqrt{100}=20` — "forgot the −2(…)". (Don't claim more than "forgetting to subtract".)
- L5: habit card: "Floor AND ceiling".

## variant — Your turn: ten thousand terms (3 lines)
- L1: `\dfrac1{\sqrt1}+\dfrac1{\sqrt2}+\cdots+\dfrac1{\sqrt{10000}}`. L2: "greatest whole number ≤ the sum?"
- No choices for the variant. Never show 198 / 199 before the variant-answer scene.

## try2 (pause, hold 12): PauseCard with the variant sum visible.

## variant-answer (5 lines)
- L0: `\text{sum} > 2\left(\sqrt{10001}-1\right)`, `\sqrt{10001}>100`.
- L1: `> 2\cdot 99 = 198` (green floor).
- L2: `\text{sum} < 1 + 2\left(\sqrt{10000}-1\right)`.
- L3: `= 1 + 198 = 199` (purple ceiling).
- L4: answer badge **198** + chime at line end. Optional small on-screen note: `\approx 198.54`.

## recap (3 lines)
- L0: `2(\sqrt{k+1}-\sqrt k) < \dfrac1{\sqrt k} < 2(\sqrt k-\sqrt{k-1})` (green left, purple right) + "middle cancels".
- L1: floor and ceiling lines one apart, a dot between → "whole number".
- L2: Vantee sign-off.
