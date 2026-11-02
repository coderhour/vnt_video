# Build brief: 2026-11-01-coin-flip-race

Question `amc_practice_amc10_mixed_template:c2-047` (no figure). Answer **D = 1255/2048**. Variant: Ann 3, Bob 5 → **163/256**.
`narration.json` + `verify.py` are the contract. Probability / counting: draw coins, a mirrored three-pile bar chart and
KaTeX working rows built line by line on the voice. Line numbers below are 0-based (L0 = first line of the scene).

Visual conventions for the whole video
- Coins: circles ~70 px, "H" face primary `#0cc281`, "T" face light grey with dark "T". Ann's row has a secondary
  `#7b61ff` label/rim, Bob's row a primary label/rim. Labels "Ann (5)" / "Bob (7)" ≥ 48 px.
- Every fraction with `\dfrac` (never `\frac`), digits ≥ 48 px, also in chips and side notes.
- Spoken "twelve choose six" = `\binom{12}{6}`; "two to the twelfth" = `2^{12}`.
- Use B = Bob's heads, A = Ann's heads, T = Ann's tails in the rows (letters are fine; the voice says the words).
  In sol2 add a one-line legend on the panel: `B_6` = heads in Bob's first 6 coins; `H_B, T_B, H_A, T_A` = heads/tails of Bob (6 coins) and Ann.
- **Never show 2510, 1255/2048 or anything that equals the answer before sol1-piles L8 / sol1-answer.** In the bar
  chart, do NOT show cumulative totals; only the labels listed below.
- Coin outcomes in intro/question are seeded (deterministic), never `Math.random()`.

## Scenes

**intro**
- L0: two rows of coins spin and land (seeded): Ann 5, Bob 7. Head counts appear under each row (e.g. Ann 2, Bob 4).
- L1: Bob's last two coins glow / bounce ("two extra coins"); a big "?" next to "how often?". No probability numbers.
- L2: title card / Vantee greeting.

**question** (poster: middle of this scene, about L1, once the prompt card is fully shown)
- Prompt card: "Ann flips 5 fair coins and Bob flips 7 fair coins. What is the probability that Bob gets more heads than Ann?"
- Coin rows on the right (static, face-down/neutral is fine).
- L2: choice chips A `\dfrac{793}{2048}`, B `\dfrac12`, C `\dfrac{575}{1024}`, D `\dfrac{1255}{2048}`, E `\dfrac{1651}{2048}`. No highlight.

**asked**
- L0: a coin flipping between H and T with "H and T: equally likely" (each 1/2).
- L1: row `B > A` with Mark sweep on ">"; small red note "tie = not a win". Mark "MORE" in the prompt.
- L2: Ann's row and Bob's row slide toward each other and a "→ one count?" pill appears (no numbers).

**try1**: pause card, question + chips visible, 10 s ring.

**sol1-flip** (chapter "Solution 1: flip Ann's coins")
- Right panel, one row per line, building:
  - L1: Ann's 5 coins shown as 3 H + 2 T, label `A = 5 - T` (example "3 = 5 − 2" small underneath).
  - L2: row `B > 5 - T`.
  - L3: the T term travels from the right side to the left: row `B + T > 5`, then directly under it `B + T \ge 6`
    (show both rows; "more than five" → "at least six").
  - L4: **the strong beat**: Ann's five coins physically flip over one by one (3D flip via scaleX). Her T faces become
    H faces (green). Label under her row changes from "tails T" to "now heads". Keep the example 3H+2T → 2H+3T so the
    kid sees her tails became heads.
  - L5: small pill "still fair coins ✓".
  - L6: Ann's 5 flipped coins slide next to Bob's 7 into ONE row of 12 coins; big row: "Bob wins ⟺ at least 6 heads of 12"
    (`\ge 6` heads among 12).

**sol1-piles**
- Mirrored bar chart of the 13 head counts 0…12 (bar heights ∝ C(12,k); no labels on single bars). Three piles coloured:
  0–5 grey-blue ("fewer than 6"), 6 primary ("exactly 6"), 7–12 grey-blue ("more than 6").
- L0: `2^{12} = 4096` in the top-right.
- L1: bars rise; three bracket labels "fewer than 6", "exactly 6", "more than 6".
- L2: the left pile mirrors onto the right (flip animation across the middle bar), "mirror images" pill; then they settle
  back. Both outer piles get a "?" label for now (same unknown, show it once on each).
- L3: middle bar highlighted; `\binom{12}{6}` label on it, with a 12-coin strip where 6 coins show H.
- L4: working row `\dfrac{12\cdot11\cdot10\cdot9\cdot8\cdot7}{6\cdot5\cdot4\cdot3\cdot2\cdot1} = 924`
  (665280 and 720 are unspoken working values; may be shown small as `= \dfrac{665280}{720}`). Middle bar label → 924.
- L5: row `4096 - 924 = 3172`.
- L6: row `3172 \div 2 = 1586`; both outer pile labels "?" → 1586.
- L7: middle pile + right (top) pile get a highlight outline together; left pile fades to 30%. Label "at least 6".
- L8: row `924 + 1586 = 2510` (2510 appears only on this line).

**sol1-answer**
- L0: big `\dfrac{2510}{4096}`.
- L1: `= \dfrac{1255}{2048}` (÷2 arrows top and bottom), answer badge, chip D turns success green, soft chime at END of the line.

**sol2** (chapter "Solution 2: fair game plus a tiebreak")
- L0: Bob's 7th coin slides off to the side (dashed outline "coin 7"); 6 coins vs Ann's 5.
- L1: two rows: "Bob more heads" / "Bob more tails", with an "exactly one" bracket.
- L2: two short rows, each ending in a red ✗:
  `H_B \le H_A,\ T_B \le T_A \Rightarrow 6 \le 5` ✗ (on "five coins at most") and
  `H_B > H_A,\ T_B > T_A \Rightarrow 6 \ge 7` ✗ (on "he'd need seven"). (H = heads, T = tails.)
- L3: a balance/scale at 50 / 50: "6 vs 5: Bob wins `\dfrac12`".
- L4: coin 7 comes back with a "tiebreaker" tag; three cases row: "Bob ahead → win", "tie → coin 7 decides", "Bob behind → lose"
  (behind by ≥1 with 6 coins means 7 coins can at most tie, so lose).
- L5: Ann's coins flip again (quick); row `B_6 = A \iff B_6 + T = 5` → "exactly 5 heads among 11 coins".
- L6: `\binom{11}{5} = \dfrac{11\cdot10\cdot9\cdot8\cdot7}{5\cdot4\cdot3\cdot2\cdot1} = 462` (55440/120 unspoken working),
  and `2^{11} = 2048`; tie chance `\dfrac{462}{2048}`.
- L7: `462 \div 2 = 231` (coin 7 heads half the time).
- L8: `\dfrac12 = \dfrac{1024}{2048}`, then `\dfrac{1024 + 231}{2048}`.
- L9: `= \dfrac{1255}{2048}` ✓, "Same answer!" check mark (green), no second chime needed (or a softer one).
- L10: tip pill "one extra coin → exactly 1/2".

**traps** (chapter "Common traps")
- L0: one row of the five chips rewritten over 2048: A `\dfrac{793}{2048}`, B `\dfrac{1024}{2048}`, C `\dfrac{1150}{2048}`,
  D `\dfrac{1255}{2048}` (green), E `\dfrac{1651}{2048}`. Show `\dfrac12 = \dfrac{1024}{2048}` and
  `\dfrac{575}{1024} = \dfrac{1150}{2048}` conversions above B and C (the C one full size ≥ 48 px: it is spoken on L4).
- L1: red card A: mini bar chart with ONLY the top pile (7–12) highlighted: `\dfrac{1586}{4096} = \dfrac{793}{2048}`;
  note "forgot exactly 6".
- L2: red card B: "true for 6 vs 5", `\dfrac{1024}{2048}` + missing `231` from ties (`+231`).
- L3: red card E: mini bar chart with 5–12 highlighted: `\binom{12}{5} = 792`, `2510 + 792 = 3302`,
  `\dfrac{3302}{4096} = \dfrac{1651}{2048}`; note "counted a tie as a win".
- L4–L6: red card C: L5 shows Bob's first 5 vs Ann's 5: "ahead → win", "tie → needs ≥ 1 head from 2 spares (3/4)",
  and "behind by 1 → ✗ (forgot!)". Small working (unspoken, optional): `\dfrac{386}{1024} + \dfrac34\cdot\dfrac{252}{1024}
  = \dfrac{575}{1024}`. L6: the forgotten case lights up: "behind by 1 + both spares H → win!" (two H coins).
- L7: habit pill: "Does a tie count? more than vs at least" (`>` vs `\ge`).

**variant** (chapter "Your turn: three against five")
- New card: "Ann flips 3 fair coins, Bob flips 5 fair coins. P(Bob gets more heads)?" with coin rows 3 and 5.
  **Do NOT show the original choice chips** in variant scenes.

**try2**: pause card with the variant question, 12 s.

**variant-answer** (chapter "Three against five: the answer")
- L0: Ann's 3 coins flip over; rows `B > 3 - T \Rightarrow B + T \ge 4`, "at least 4 heads of 8".
- L1: `2^8 = 256`; small 9-bar chart (0…8); middle bar `\binom84 = \dfrac{8\cdot7\cdot6\cdot5}{4\cdot3\cdot2\cdot1} = 70`.
- L2: `256 - 70 = 186`, `186 \div 2 = 93`, outer piles labelled 93.
- L3: middle + top pile highlighted, `70 + 93 = 163`.
- L4: answer `\dfrac{163}{256}` with chime at END of the line, then light confetti.

**recap**
- L1: a coin flipping over, "fair stays fair".
- L2: card: "5 vs 7 coins → at least 6 heads of 12" with the mini three-pile chart.
- L3: sign-off.

## YouTube
Title: `Who Gets More Heads? 5 Coins vs 7 | AMC 10-Style Level 4` (in narration.json)
