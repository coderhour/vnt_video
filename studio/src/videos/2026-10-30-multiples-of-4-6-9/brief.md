# Build brief: 2026-10-30-multiples-of-4-6-9

Question `amc_practice_amc8_number_theory_template:c1-821`. Answer **C = 389** (choices A 362, B 388, C 389, D 416, E 527).
No figure in the bank. `verify.py` checks every number below. Do not change any maths or narration meaning.

**YouTube title:** Multiples of 4, 6 or 9: Don't Count Twice! | AMC 8-Style Level 4

**Description:**
How many numbers from 1 to 1000 are multiples of 4, 6 or 9? Adding the three counts is not enough,
because some numbers sneak in twice. Vantee shows you how to fix the overcount with a Venn diagram,
a faster "build it up" trick, and a new puzzle for you to try.

## Core visual: three-circle Venn diagram
Three circles labelled `multiples of 4` (primary green `#0cc281`), `multiples of 6` (secondary `#7b61ff`),
`multiples of 9` (amber/orange). Reuse the same diagram in `singles`, `pairs`, `subtract`, `addback`, `aha`.
Region sizes for reference only (they are NEVER spoken, so do NOT show them as numbers):
only-4 167, only-6 55, only-9 56, 4&6-not-9 56, **4&9-not-6 0 (empty)**, 6&9-not-4 28, all three 27.
Keep the diagram on the left about 900 px wide, with the arithmetic rows on the right panel. Keep the stage above y ≈ 860.

## Scenes
- **intro** — L0: number strip 1…40 (small tiles) with multiples of 4/6/9 lighting up in their colours; tiles for
  12, 18, 24, 36 light in two/three colours (striped) to show "sneak in twice" on L1. L2: Vantee wordmark/title card.
  Don't show 389 or any choice value.
- **question** — full prompt as KaTeX/text: "How many whole numbers from 1 to 1000 are multiples of at least one of 4, 6 and 9?"
  L1–L2 highlight-read the prompt in two halves. L3: the five choices row A 362, B 388, C 389, D 416, E 527 (≥ 48 px).
- **asked** — L0: three rule pills `4 | n`, `6 | n`, `9 | n` (or "4 goes in", etc.) joined by **OR**. L1: tile `12` with
  checks under the 4-pill and the 6-pill, then a big "count once" stamp on it (×1).
- **try1** — pause card, question + choices still visible.
- **singles** — L1: `1000 ÷ 4 = 250` row; the 4-circle fills. L2: `1000 ÷ 6 = 166 R 4` (show the remainder 4, it is spoken);
  6-circle fills. L3: `1000 ÷ 9 = 111 R 1`; 9-circle fills. L4: `250 + 166 + 111 = 527`, then the three lens overlaps pulse
  red `#ef4343` ("counted twice"). 527 here is a computed sum, not the answer — fine to show.
- **pairs** — L0: a `12` token drops into the 4&6 lens, a "×2" badge on it. L1: two rows of multiples:
  `4, 8, 12` and `6, 12`, the two 12s circled and joined → label `12` appears on the 4&6 lens.
  L2: show `24` crossed out in red beside it, with `12` and `36` marked "missed by 24". L3: label `18` on the 6&9 lens.
  L4: `4 × 9 = 36`, label `36` on the 4&9 lens, placed in the CENTRE part of that lens (the all-three region). The 4&9-only crescent (outside the 6-circle) must never get a token or label: it is empty, which `aha` reveals. Spoken numbers only.
- **subtract** — L0: three rows `1000 ÷ 12 = 83`, `1000 ÷ 18 = 55`, `1000 ÷ 36 = 27` (remainders are not spoken
  here, so show whole-number results only, e.g. "1000 ÷ 12 → 83 whole twelves"). L1: `83 + 55 + 27 = 165`, lens overlaps flash, minus sign.
  L2: `527 − 165 = 362`, then a "?" after it.
- **addback** — L0: a `36` token placed in the centre (all three) region. L1: tally next to it: +1 +1 +1 (three circles)
  then −1 −1 −1 (three lenses) → `= 0`, centre region goes grey/hollow. L2: centre label `36` → `1000 ÷ 36 = 27`, "+27".
  L3: `362 + 27 = 389`; answer reveal (strong motion beat, chime at END of the line), choice C highlighted green.
- **aha** — L0: spotlight the 4&9-not-6 slice (dim everything else). L1: chain `4 and 9 → 36 → 36 = 6 × 6` (shows 36 is a
  multiple of 6, so it lives in all three circles). L2: slice labelled "empty"; the −27 (from the 4&9 pair) and +27
  (all three) shown side by side with a cancel line. IMPORTANT: no number 0 is spoken; write "empty", not 0.
- **buildup** — new layout: two-step build. L1: `250 + 166 − 83` with the 83 tagged "twelves"; L2: `= 333`, a "so far" bar.
  L3: multiples of 9 strip `9, 18, 27, 36, 45, 54, 63, 72 …`. L4: even ones (18, 36, 54, 72) turn purple with
  "÷18 → ÷6 ✓ already counted". L5: odd ones (9, 27, 45, 63) glow amber "NEW". L6: `111 − 55 = 56` (111 multiples of 9,
  55 even, 56 odd). L7: `333 + 56 = 389` with a "same answer" check. L8: small tip card "one overlap hides inside another"
  (the 4&9 slice inside 6&9).
- **traps** — one red card per wrong choice, each with its sum shown on its line:
  L1 E: `250 + 166 + 111 = 527` ("no overlaps taken away"). L2 A: `527 − 165 = 362` ("forgot to add 27 back").
  L3 B: `388` + "stopped at 999" with `1000 ÷ 4 = 250` and 1000 struck/missing ("1000 is a multiple of 4").
  L4 D: `527 − 83 − 55 + 27 = 416` ("skipped the 4 & 9 overlap, but still added 27 back"; show the missing `− 27` as a red gap). L5: tokens `36, 72, …` landing in the 4&9 lens (centre part, never the empty crescent).
  L6: habit card "first meeting number" (e.g. `4, 6 → 12`, not 24). The correct C is not a trap card.
- **variant** — new question card: "How many whole numbers from 1 to 300 are multiples of at least one of 4, 6 and 10?"
  Two halves highlighted on L1/L2. No choices for the variant. 110 must NOT appear before variant-answer L4.
- **try2** — pause card with the variant question.
- **variant-answer** — Venn again with circles 4, 6, 10. L0: `300 ÷ 4 = 75`, `300 ÷ 6 = 50`, `300 ÷ 10 = 30`.
  L1: `75 + 50 + 30 = 155`. L2: lens labels `12`, `20`, `30` and rows `300 ÷ 12 = 25`, `300 ÷ 20 = 15`, `300 ÷ 30 = 10`.
  L3: `25 + 15 + 10 = 50` (minus), centre label `60`, `300 ÷ 60 = 5`. L4: `155 − 50 + 5 = 110`, success reveal + chime at end.
- **recap** — rule card in three steps appearing on the words: `+ add the three counts`, `− take away each pair`,
  `+ add back all three` (formula `|A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|` optional, small but ≥ 48 px if shown).
  L2: `12 ✓  24 ✗` beside the words "smallest number they all go into". L3: sign-off.

Notes: 1000 is spoken "one thousand"; keep all on-screen numbers as digits. Captions come from the timeline.
