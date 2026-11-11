# Builder brief: 2026-11-07-non-squares-2026

Question `amc_practice_amc10_algebra_template:c4-069`. Answer **C = 2071**. Variant answer **1032** (the 1000th non-square).
`narration.json` + `verify.py` are the contract. Don't change maths or meaning; list any reworded line.

Line numbers below are 0-indexed within each scene (L0 = first line).

Choices (letters fixed): A 2069, B 2070, C 2071, D 2072, E 2116.

Global rules for this video
- Never show 2071 anywhere outside the choices row before `reveal` L1. No running counter / sliding pointer that passes
  through 2071 earlier, no `2025 + 46 =` result before reveal L1. In `skip` it may appear from L4 on (after the reveal).
- Never show 1031 or 1032 before `variant-answer` (L1 for 1031, L3 for 1032).
- TWO label layers, always: the **number** (value) on the tick, big (≥ 48 px, text colour #333), and its **spot** (position in
  the list) small underneath in secondary purple `#7b61ff` as "spot 1", "spot 2"… (the spot label can be ~36 px since it is a tag,
  but any spot number the voice says must be ≥ 48 px in a row/pill). The kid must never confuse "spot 2026" with "the number 2026".
- Colours: perfect squares = red `#ef4343` (knocked out: red tile with a strike/X, dimmed); surviving non-squares = primary green
  `#0cc281`; spot labels and "spot" pills = purple `#7b61ff`; gap brackets = green; the answer = success `#21c45d`.
- Notation on screen: `k^2`, `(k+1)^2 = k^2+2k+1`, `45^2 = 2025`, `46^2 = 2116`. No decimals anywhere (no 45.01, no √ decimals).
- Every number the voice says is on screen at that moment. No UNSPOKEN results, totals, spot numbers or answer values on screen;
  figure tick labels (1 … 17, 2023, 2024 …) and arithmetic the voice walks through are fine.
- 2116 is choice E: on the big line, label the right-hand red tile `46^2` only, and show the value 2116 only from `skip` L6 on.
- Keep the stage above y ≈ 860. Math ≥ 48 px. Rows nowrap, end before x ≈ 1880.

Number-line figures (reuse across scenes)
- **Small line**: tiles/ticks for 1 … 17, evenly spaced (e.g. x = 140 + (v−1)·100, y ≈ 420). Squares 1, 4, 9, 16 red and struck out.
  Survivors green. Spot tags = bare purple numerals in a small circle under the tile (1, 2, 3), plus ONE purple legend "spot" at the
  left end of the row; never write "spot 1" per tile at this spacing. Only tags for 2, 3, 5 are numbered (spoken in `asked` L2).
- **Big line** (not to scale, with breaks "⋯"): `⋯ 2023 2024 | 2025 | 2026 2027 ⋯ ? ⋯ 2115 | 46² | ⋯`, with 2025 and 46² red/struck
  (46² shows as `46^2` until `skip` L6, never "2116" before that).
  The "?" slot is where the answer appears at reveal L1. Spot labels only where spoken (2024 → spot 1980, 2026 → spot 1981).

## intro (3 lines)
- L0: big title text "the 2026th number that is NOT a perfect square". Show 2026 big; do not show 2071.
- L1: small number line types in left to right; squares 1, 4, 9, 16 flash red and drop out leaving gaps (the "pattern in the gaps").
- L2: tagline "knock out the squares, count what's left".

## question (5 lines) — poster: about 1 s into L4 (full prompt + all five choices visible)
- L0: card "Question" + prompt text (from the bank: "The positive integers that are not perfect squares are listed in increasing
  order: 2, 3, 5, 6, 7, 8, 10, …. What is the 2026th number in the list?").
- L1: Mark-sweep "not perfect squares".
- L2: the list `2, 3, 5, 6, 7, 8, 10, …` highlights term by term as read.
- L3: Mark-sweep "2026th".
- L4: Choices row A–E: 2069, 2070, 2071, 2072, 2116 (Tex). On screen by the poster time.

## asked (4 lines)
- L0: small line 1 … 17 appears; squares 1, 4, 9, 16 turn red.
- L1: the red ones are struck out / dim; survivors turn green.
- L2: spot labels appear under 2, 3, 5 (spot 1, spot 2, spot 3) as each is said; the other survivors get blank purple dots, not numbers.
- L3: two pills side by side: purple "spot 2026" → arrow → green "number = ?". Tag "spot ≠ number".

## try1 (pause, hold 10): PauseCard with the prompt + choices visible.

## gaps — Solution 1: count the gaps (10 lines). Key "aha" visual.
- L0: small line again (squares red).
- L1: green bracket under 2,3 labelled "2"; then bracket under 5–8 labelled "4".
- L2: bracket under 10–15 labelled "6"; row "2, 4, 6, 8, …" with "+2" arrows between.
- L3: generic picture: red tile `k^2` … green bracket "2k numbers" … red tile `(k+1)^2`; row `(k+1)^2 = k^2 + 2k + 1`
  (the "2k" in green, the "+1" is the next square itself).
- L4: running sums table (the `8` in it was spoken on L2's "two, four, six, eight"), one column per gap: `2`, `2+4=6`, `6+6=12`, `12+8=20`.
- L5: under each sum: `1\times2`, `2\times3`, `3\times4`, `4\times5` (matching colours; the pattern "n × (n+1)").
- L6: row `44 \times 45 = 1980 < 2026` with label "first 44 gaps" and a green "just under" tag. (Don't show 45 × 46 = 2070: it's
  unspoken and is choice B's value.)
- L7: switch to the big line. All survivors left of 2025 shaded green as one block labelled "spots 1 … 1980"; 2025 red with `45^2`.
  Show `2024 \to \text{spot } 1980`.
- L8: a hop arc over the red 2025; 2026 lights green with purple tag "spot 1981".
- L9: row `2026 - 1980 = 46`; a bracket starts at 2026 heading right toward the "?" slot, labelled "46 numbers". NO value at the end yet.

## reveal (3 lines) — the strong motion beat
- L0: the bracket "46 numbers past 2025" completes, ending on the "?" slot.
- L1: row `2025 + 46 = 2071`; "?" turns into 2071; Answer badge "C · 2071" with chime at the END of the line (after "Choice C").
- L2: bracket from 2026 to 2115 labelled "90 numbers" (small `2 \times 45`) with 2116 red at its right end; 2071 sits inside it.

## skip — Solution 2: add back the squares (11 lines)
(The value 2071 may show from L4 on: the reveal has happened.)
- L0: small line; red squares.
- L1: idea card: `\text{answer} = \text{spot} + (\text{how many squares are below it})` — a COUNT, not a sum: never write
  `1+4+9+…` here. Animation (the visual that proves the rule): the survivors start packed in slots 1 … 13 of the small line
  (number = slot). Then the red squares 1, 4, 9, 16 insert one at a time, each shoving every tile to its right one slot right
  (step slot to slot, no smooth tween through wrong slots). End state = the 1 … 17 value line with purple tags under 2, 3, 5.
- L2: row `2026 + (\text{squares} \le 2026)`.
- L3: `45^2 = 2025 \le 2026`, list `1^2, 2^2, \ldots, 45^2` → "45 squares".
- L4: `2026 + 45 = 2071`.
- L5: big "check?" tag; L6: `46^2 = 2116 > 2071` with a green ✓ "safe". (Right side: `45^2 \le 2071 < 46^2`.)
- L7: shortcut card: "spot n → add the root of the perfect square nearest to n".
- L8: distance picture: `2025 = 45^2` —short arrow— `2026` ——long arrow—— `2116 = 46^2` (no distance numbers; they aren't spoken);
  `45^2` highlighted "nearest"; row `2026 + 45 = 2071` (same answer, ✓).
- L9: generic gap after `k^2` on a small sketch; its spots bracketed and an arrow to `k^2` "nearest square", plus "k squares before".
  (Fact, verified: spots k²−k+1 … k²+k all have k² as their nearest square. Don't show those bounds unless you also speak them; a
  picture is enough.)
- L10: tag "test day: fast — then check".

## traps (6 lines). One red card per wrong choice, with its working:
- L0: rule card: `\text{spot} = \text{number} - (\text{how many squares come before it})`.
- L1: A 2069: "45 squares before it" (`45^2 = 2025 < 2069`), `2069 - 45 = 2024` → "spot 2024: too early".
- L2: B 2070: `2026 + 44 = 2070` → "forgot that 1 is a square" (strike through `1^2` in a small square list).
- L3: D 2072: `2026 + 46 = 2072` → "used the next root, 46 — too late".
- L4: E 2116: `46^2 = 2116` → "a square! not in the list" (red X).
- L5: habit card: "Add the squares, then CHECK for a new one."
- Show C only as a calm green check at the end if you like; no extra numbers.

## variant — Your turn: spot one thousand (3 lines)
- L1: big "spot 1000 → number = ?". L2: tag "check!". No choices.

## try2 (pause, hold 12): PauseCard with "What is the 1000th number in the list?" visible.

## variant-answer (6 lines)
- L0: `31^2 = 961 < 1000`, "31 perfect squares below 1000".
- L1: `1000 + 31 = 1031`.
- L2: big line sketch `⋯ 1000 ⋯ 1024 ⋯ 1031`: `32^2 = 1024` red, sitting BETWEEN 1000 and 1031; tag "jumped over it!".
- L3: `1031 + 1 = 1032` → answer badge **1032** + chime at line end.
- L4: `33^2 = 1089 > 1032` ✓ "safe" (badge stays).
- L5: `961 = 31^2` —long arrow— `1000` —shorter arrow— `1024 = 32^2` (no distance numbers; 1024 must look visibly nearer: put 1000
  at 24/63 of the way, not the midpoint); nearest is `32^2`; row `1000 + 32 = 1032` ✓.

## recap (3 lines)
- L0: `\text{answer} = \text{spot} + (\text{how many squares below it})` + "then check for one more".
- L1: `\text{spot } n \to n + \sqrt{\text{nearest square to } n}` (no examples; their numbers aren't spoken here).
- L2: Vantee sign-off: `<SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />`.
