# Build brief: 2026-11-01-triangle-sum-2024

Question `amc_practice_amc10_number_theory_template:c2-035`. Answer **C = 528** (choices A 253, B 483, C 528, D 736, E 1012).
No figure in the bank. `verify.py` checks every number below. Do not change any maths or narration meaning.
Each scene in `narration.json` also has a `visual` field with per-line notes; this brief adds the layout and the must-haves.
Line numbers below are 1-based within the scene.

**YouTube title:** Smallest n So 1+2+…+n Is a Multiple of 2024 | AMC 10-Style Level 4

## Core visual language
- **Factor tiles:** three rounded tiles reused all video long: `16` (primary green `#0cc281`), `11` (secondary `#7b61ff`),
  `23` (amber/orange). Variant uses `81` (green) and `25` (purple), plus a grey `2` tile marked "free".
- **Neighbor boxes:** two side-by-side boxes labelled `n` and `n+1` (KaTeX). Tiles drop *whole* into a box; a tile is never split.
- **Pile walk panel** (walkA/B/C, variant-answer): a horizontal row per step: `[neighbor-1]  [MULTIPLE]  [neighbor+1]`,
  the multiple in a bold box tinted with its pile's tile colours, each neighbor gets a red ✗ or green ✓ as the line says it.
  Above the walk rows, a small (≥ 36 px), grey, clearly secondary **reference strip** of multiples of the number being tested (e.g. 23 × 7 = 161, 23 × 8 = 184) so the kid can see why a neighbor fails.
  Keep each step's numbers ≥ 48 px. Stack ≤ 4 walk rows; then fade older rows to 40% instead of shrinking.
- Use `\dfrac` for every fraction. Spoken number words ↔ digits on screen (2024, 4048, 528 …).
- Stage above y ≈ 860 (captions). Longest KaTeX row must end before x ≈ 1880.
- **Never show 528 as "the answer" before walkC line 5.** In walkA it appears as "best so far" (neutral outline, no badge/chime).
  Never show 324 before variant-answer line 6.

## Scenes
- **intro** (3 lines): a running sum `1 + 2 + 3 + ⋯` with a total counter. The partial sums pass through choice values
  (1+⋯+22 = 253, 1+⋯+32 = 528), so **stop the counter at 1+⋯+20 = 210** (or earlier) and dissolve to `⋯  2024 ?` badge.
  Never display 253, 483, 528, 736 or 1012 here. Line 3: Vantee title card.
- **question** (4 lines): prompt in KaTeX: "What is the smallest positive integer $n$ for which $1+2+\cdots+n$ is divisible by $2024$?"
  Lines 2–3 read it (L2 "Find the smallest positive whole number n," L3 the condition). Line 4: choice chips A 253, B 483, C 528, D 736, E 1012. **Poster: ~1.0 s before the end of this scene** (full question + chips visible).
- **asked** (2 lines, hold 2.5 so the chapter is ≥ 10 s): L1 highlight `n` in the sum. L2 `sum ÷ 2024 = whole number` then mark **SMALLEST n**.
- **try1**: pause card, question + chips visible.
- **sum** (3 lines): Gauss pairing. L1 two rows `1  2  3  ⋯  n` and `n  ⋯  3  2  1` beneath (use a small n-agnostic display with "⋯").
  L2 column brackets glow, each labelled `n+1`; label `n columns`. L3 row `\text{sum} = \dfrac{n(n+1)}{2}` ("counts every number twice" → show `2 × sum = n(n+1)` first, then the fraction).
- **double** (3 lines): L1 `\dfrac{n(n+1)}{2}` divisible by 2024. L2 `n(n+1)` divisible by `2 × 2024 = 4048` (own row — the doubling must be visible).
  L3 `4048 = 16 × 11 × 23`, tiles appear; note `16 = 2×2×2×2` ("four factors of two"), `11, 23 prime`.
- **neighbors** (5 lines): neighbor boxes. L1 tag one box "odd: no 2s" (don't commit to which; e.g. animate a toggle, or label "the odd one").
  L2 the 16 tile drops whole into "the even one". L3 an 11 tile tries to sit in both boxes → red ✗ and `difference = (n+1) − n = 1`.
  L4 11 and 23 tiles each drop whole into a box. L5 the four piles as four small cards:
  ① `16·11 | 23`  ② `16·23 | 11`  ③ `16 | 11·23`  ④ `16·11·23 | –`, with products shown: 176, 368, 253, 4048.
  Mention visually that swapping boxes is the same pile (both neighbors are checked).
- **walkA** (5 lines): pile ① card highlighted, `16 × 11 = 176`. Reference strip: multiples of 23: `161, 184 | 345, 368 | 506, 529`.
  L1 both neighbor slots outlined. L2 `175 [176] 177` ✗✗. L3 `351 [352] 353` ✗✗. L4 `527 [528] 529`: 527 ✗, 529 ✓ with `529 = 23 × 23`.
  L5 pin `n = 528, n+1 = 529` as "best so far".
- **walkB** (3 lines): pile ②, `16 × 23 = 368`; reference `11 × 33 = 363, 11 × 34 = 374`. L1 `367 [368] 369` ✗✗.
  L2 `[736] 737` with `737 = 11 × 67` ✓ (here n = 736). L3 tag `736 > 528` (grey it).
- **walkC** (5 lines): pile ③, `11 × 23 = 253`; reference multiples of 16: `240, 256 | 496, 512`. L2 `252 [253] 254` ✗✗ and `505 [506] 507` ✗✗.
  L3 `759` greyed "past 528 — stop". L4 pile ④ `4048` greyed. L5 **answer reveal**: big badge `n = 528`, chip C highlighted green, check
  `1+2+⋯+528 = 139656 = 2024 × 69` small under it, chime at END of the line. Strong motion beat here (shotcraft reveal card).
- **choices** (7 lines): right panel rows, one per line.
  L1 `\dfrac{n(n+1)}{2}`: "halve the even one". L2 goal tiles `8, 11, 23` ("we need eight, eleven and twenty-three"); `\dfrac{253 × 254}{2} = 253 × 127` → "odd: no factor of 2" ✗.
  L3 `\dfrac{483 × 484}{2} = 483 × 242`, `242 = 2 × 121` → "one factor of 2" ✗. L4 `\dfrac{528 × 529}{2} = 264 × 529`.
  L5 `= (8 × 3 × 11) × (23 × 23)` ✓ (264 = 8 × 3 × 11; tick the 8, 11, 23 tiles). L6 small note "smallest choice ✓ — Solution 1 = proof". L7 card "timed test → check choices".
- **traps** (5 lines): five chips, C already green. L2 A red: `253 = 11 × 23`, `2024 = 8 × 11 × 23` with the 8 circled ("forgot the 8"); sum `253 × 127` odd.
  L3 E red: `1012 = 2024 ÷ 2`, sum `506 × 1013`, `506 = 2 × 253` → one factor of 2. L4 B red: `483 = 21 × 23`, `484 = 4 × 121` → sum `483 × 242`, one factor of 2, "no 8".
  L5 D amber outline: "works ✓ but 736 > 528".
- **variant** (2 lines): card "Smallest $n$ with $1+2+\cdots+n$ divisible by $2025$?"
- **try2**: pause card with the variant question.
- **variant-answer** (7 lines): L1 `n(n+1)` divisible by `2 × 2025 = 4050`. L2 `4050 = 2 × 81 × 25`; grey `2` tile "free: one neighbor is even".
  L3 tiles 81, 25 into boxes; "both in one: 2025 → n = 2024 or 2025; look for smaller". L4 walk `80 [81] 82`, `161 [162] 163`, `242 [243] 244`.
  L5 all ✗; small grey reference multiples of 25: `75, 100 | 150, 175 | 225, 250`. L6 `323 [324] 325`, `325 = 25 × 13` ✓.
  L7 answer badge `n = 324` (chime at end of L6's last word or start of L7 — after "three hundred twenty-four" is spoken); check row `\dfrac{324 × 325}{2} = 162 × 325 = 52650 = 2025 × 26`.
- **recap** (4 lines): summary card: `sum = \dfrac{n(n+1)}{2}` → "neighbors share no factor > 1" → "each prime power goes whole into one neighbor" → "piles · walk multiples · check neighbors". Sign-off.

## Notes
- "four twos" = 2×2×2×2 = 16; "three twos" in the choices scene = the 8 in 2024 after halving. Keep both visible where spoken.
- Spoken "two thousand twenty-four / twenty-five" = 2024 / 2025 on screen.
- 736 is a VALID n (1+⋯+736 = 271216 = 2024 × 134) — just not the smallest. Never mark it as wrong maths, only as "not smallest".
