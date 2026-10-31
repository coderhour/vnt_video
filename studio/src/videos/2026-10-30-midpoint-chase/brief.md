# Build brief: 2026-10-30-midpoint-chase

Question `amc_practice_amc8_arithmetic_template:c1-822` (difficulty 5). Answer **C = 42.75** (bank correct_index 2).
`narration.json` + `verify.py` are the contract: do not change any maths or narration meaning.

## YouTube

- Title: **Where Does the Midpoint Chase End? | AMC 8-Style Level 5**
- Description:
  Two points on a number line, and every new point lands halfway between the last two. Where is the tenth point?
  Follow the chase with Vantee: watch the jumps halve and flip, then add them in pairs for a neat shortcut.
  Then try a new chase on your own!

## Number conventions (read first)

- **Voice says mixed numbers, screen shows decimals** (to match the choices): voice "forty-two and three quarters"
  ↔ screen `42.75`; "forty-two and a half" ↔ `42.5`; "forty-two and five eighths" ↔ `42.625`;
  "twenty-one and a quarter" ↔ `21.25`. Wherever a decimal appears on the same line the voice says it,
  put the mixed number as a small chip right under it (`42\tfrac34` style, still ≥ 48 px, use `\dfrac` or a
  fraction-glyph chip). Jumps of a half/quarter are shown as `\dfrac12`, `\dfrac14` in the jump lists and pair sums.
- Point names on screen: `P_1 … P_{11}` (KaTeX). Voice: "P ten".
- Never speak a decimal. If `--check` flags "five eighths" (transcriber writes 5/8) or "and a half" (writes 42.5),
  reword the line per SKILL 4b (e.g. "forty-two and five over eight"), and if it still flags after re-transcribing,
  list it for the user. Do NOT edit `tts.py` (shared by every video). List every reworded line in your report.
- Several lines start with a bare "P three…/P ten…"; if a line's first word mishears, reword its opening.

## Core visual: the number line

One horizontal number line, reused across scenes. Two zoom levels:
- **Wide**: 0 … 64, ticks every 8, labels at 0, 16, 32, 48, 64 (and 40, 44 once those points appear).
- **Zoom**: 40 … 45, ticks every 0.25, labels at 40, 41, 42, 43, 44, 45. Use a clear "magnifier" transition
  (a bracket on the wide line around 40–45 expands into the zoomed line), so the kid sees it's the same line.
- Each point is a dot with a label `P_n` above it and its value below. Newest point = primary `#0cc281`,
  older points fade to grey but stay. Jumps are curved arrows from the previous point to the new one, with
  the length on the arrow (`64`, `32`, …). **Right jumps above the line in primary green, left jumps below
  the line in secondary purple `#7b61ff`**, so "flips direction" is visible as above/below alternation.
- Never tween a dot smoothly along the line with a live readout (it would pass through choice values).
  Dots pop in at their final spot; arrows draw from start to end with no value readout during the draw.
- Ensure no point or value beyond the current line's narration appears early. In particular **42.75 / P10 must
  not appear before scene `list` line 5** ("P ten is forty-two and three quarters!"), and 42.5 / P9 not before
  `list` line 3.

## Scenes

Line numbers are 0-indexed (L0 = first line of the scene, matching `at(scene, i, t)` / `cue()`).

### intro (3 lines)
- L0: wide number line, dots at 0 and 64 pop in (labels `P_1`, `P_2`).
- L1: a dot appears at 32 with a jump arrow, then 48 (only P3, P4: values the question gives). Then a
  pulsing "?" bracket over the 40–45 region. Do NOT show any later point.
- L2: Vantee intro card / title "The Midpoint Chase".

### question (6 lines)
- Question text on the left/top, number line below with P1 = 0, P2 = 64.
- L1: highlight `P_1 = 0`, `P_2 = 64` in the text and pop the two dots.
- L2: highlight "midpoint of the two points before it".
- L3: dots P3 = 32 and P4 = 48 appear with jump arrows (32 left, 16 right).
- L4: "Where is `P_{10}`?" highlighted.
- L5: five choice chips: (A) 42.5 (B) 42.625 (C) 42.75 (D) 43 (E) 44 (use `<Choices>` with `<Tex>`). No highlight.

### asked (4 lines)
- L1: rule card: `P_{n+2} = \text{midpoint of } P_n \text{ and } P_{n+1}`, plus small cartoon "newest two".
- L2: a row of slots `P_1 P_2 | P_3 P_4 … P_{10}`, the 8 slots P3…P10 bracketed with "8 midpoints".
  P3, P4 filled (32, 48), P5…P10 empty boxes.
- L3: decimal key card: `0.5 = \tfrac12`, `0.25 = \tfrac14`, `0.75 = \tfrac34`, `0.625 = \tfrac58`.

### try1 (pause, hold 10)
- PauseCard with the question text + choices still visible, small number line with P1–P4.

### jumps (6 lines) — chapter "Solution 1: follow the jumps"
- Wide number line, clean. A "jump list" panel on the right builds one row per line.
- L1: arrow 0 → 64 above the line, label `+64` (right). Panel row: `P_1 \to P_2:\ 64 \text{ right}`.
- L2: dot P3 at 32, arrow 64 → 32 below the line, `32 left`.
- L3: dot P4 at 48, arrow 32 → 48 above, `16 right`. Briefly highlight that 48 sits between 32 and 64.
- L4: "Mark" sweep on the panel: `64, 32, 16` with "÷2" chips between and alternating right/left icons.
- L5: the "why" visual: highlight the last jump (32 → 48) as a segment, put its midpoint tick on it, and show
  the next arrow starting at 48 going BACK to that midpoint (40) — half the length. Label: "half of 16 = 8, back".
  (This is the reason line; the dot at 40 may appear here, it's P5 and is named on the next line.)

### list (6 lines)
- L0: jump panel continues: `8\text{ left}, 4\text{ right}, 2\text{ left}, 1\text{ right}`.
- L1: dots pop in at 40, 44, 42, 43 one by one, timed to each value in the sentence (use cue()). Then the
  magnifier transition to the zoom 40–45 line, carrying all points from 40 up (P5–P8, 32/48/64 shown as
  off-screen arrows "← 32", "48 →" if wanted).
- L2: a shrinking bracket around the latest points to show them squeezing together (no value labels on the
  bracket, no target value shown — the limit 42 2/3 is never shown or said).
- L3: arrow 43 → 42.5 below the line labelled `\tfrac12 \text{ left}`; dot `P_9` with `42.5` and chip `42\tfrac12`.
- L4: arrow from 42.5 to the right, labelled `\tfrac14 \text{ right}` — draw the arrow but keep the endpoint
  label hidden until L5.
- L5 (reveal, the one strong motion beat): dot `P_{10}` lands, value `42.75` + chip `42\tfrac34`, Answer badge
  **C = 42.75**, chime at the END of the line.

### pairs (9 lines) — chapter "Solution 2: pair up the jumps"
- Right panel KaTeX rows, one idea per row (keep each row < x ≈ 1880):
- L0–L1: `P_{10} = 0 + 64 - 32 + 16 - 8 + 4 - 2 + 1 - \tfrac12 + \tfrac14` (signs green +, purple −). If too
  wide, split onto two rows after `- 8`.
- L2: bracket `(64 - 32)` → `32`.
- L3: `(16 - 8)` → `8`, `(4 - 2)` → `2`.
- L4: `(1 - \tfrac12)` → `\tfrac12`; the lone `+\tfrac14` gets a circle "on its own".
- L5: row of pair results `32,\ 8,\ 2,\ \tfrac12` with "÷4" chips between them.
- L6: `32 + 8 + 2 = 42`.
- L7: `\tfrac12 + \tfrac14 = \tfrac34` then `P_{10} = 42\tfrac34 = 42.75` with a Check mark (no second chime).
- L8: small "When to pick it: many steps → pairs keep it tidy" card.

### traps (7 lines) — chapter "Common traps"
- Zoomed number line (40–45) with all points P5…P11 marked faintly; add P11 = 42.625 (between 42.5 and 42.75).
  Each trap card: the choice (red `#ef4343` border), its decimal + mixed chip, and an arrow to its dot on the line.
- L1: (A) `42.5 = P_9` — "one point too early".
- L2: (D) `43 = P_8` — show the jump list cut after `1` with a red scissors/line: "stopped before fractions".
- L3: (E) `44 = P_6` — "far too early".
- L4: (B) `42.625 = 42\tfrac58 = P_{11}` — "one point too late".
- L5: relabel demo: under 0 show `P_0` (red, struck through on the true `P_1`), 64 as "P_1?", and an arrow
  from "your tenth" to the true `P_{11}`.
- L6: habit card: "Label every point as you go" with the labelled list `P_1 … P_{10}`.

### variant (3 lines) — chapter "Your turn: a new chase"
- New wide number line 0 … 32 (ticks every 4). L1: dots `P_1 = 0`, `P_2 = 32`.
- L2: question "Where is `P_9`?" No other points.

### try2 (pause, hold 12)
- PauseCard with the variant text and the 0 … 32 line (P1, P2 only).

### variant-answer (7 lines) — chapter "New chase: the answer"
- L0–L1: jump list `32 R, 16 L, 8 R, 4 L, 2 R, 1 L` with above/below arrows on the 0…32 line, dots at
  16, 24, 20, 22, 21 appearing per jump.
- L2: zoom to 20…23 (ticks 0.25); `\tfrac12 R` → 21.5, `\tfrac14 L` arrow drawn, endpoint label hidden.
  Counter "8 jumps → `P_9`".
- L3–L4: rows `(32-16)=16`, `(8-4)=4`, `(2-1)=1`, `(\tfrac12-\tfrac14)=\tfrac14`.
- L5: `16 + 4 + 1 = 21`, then `+\tfrac14`.
- L6: reveal `P_9 = 21\tfrac14 = 21.25`, dot lands, success green, chime at line end.

### recap (4 lines)
- L1: card "Midpoint rule → each jump is half the last, and flips direction" with the zoomed alternating arrows.
- L2: card "List the points, watch the jumps — the points close in on one value".
- L3: Vantee sign-off.
