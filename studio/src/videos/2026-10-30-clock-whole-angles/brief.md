# Build brief: 2026-10-30-clock-whole-angles

Question `amc_practice_amc8_mixed_template:c1-674`. Answer **30 (D, correct_index 3)**. Variant answer **6**.
`narration.json` and `verify.py` are the contract: no maths or meaning changes. Reword only for TTS
mishears, and list every reworded line.

## YouTube

- **Title:** When Is the Clock Angle a Whole Number? | AMC 8-Style Level 4
- **Description:**
  At 1:00 the clock hands make 30 degrees, but one minute later it's 24.5. So when is the angle a whole number?
  Vantee builds a formula for the clock angle, then shows a faster trick: just watch the hour hand.
  Pause, try it yourself, then take on a new clock challenge!

## Conventions (keep them the same everywhere)

- Spoken "five and a half degrees per minute" = on screen **5.5** (never 11/2). Spoken "half a degree" = **0.5°**.
  "half of m" = `0.5m`. Never show a fraction for these.
- The variable is `m` = minutes past the hour (italic KaTeX `m`).
- Clock maths: angles are measured clockwise from 12. A hand at θ degrees points to
  `(cx + r·sin θ, cy − r·cos θ)` (screen y down). Hour hand at h:m = `30h + 0.5m`; minute hand = `6m`.
  Draw the hour hand short and thick, the minute hand long and thinner, in different colours
  (hour = secondary `#7b61ff`, minute = primary `#0cc281`). 12 numbers + 60 minute ticks.
- The angle arc is always drawn on the SMALLER side, with its value label (≥ 48 px).
- Never show the answer 30 (as a count) or a choice value as a running counter before the line that says it.
  A grid may light cells up, but no live "×n" counter may pass 12, 15, 29 or 30 before the reveal line.

## Key numbers (all checked in verify.py)

1:00 → 30°, 1:01 → 24.5°, 1:02 → 19°, 1:20 → 30 − 110 = −80 → 80°, 1:40 → 30 − 220 = −190 → gap 190 → 360 − 190 = 170°.
Hour hand at 1:01 = 30.5°. 5.5 × 2 = 11, 5.5 × 3 = 16.5.
Variant (2:m): gap = 60 − 5.5m; hits m = 0, 10, 20, 30, 40, 50 → angles 60°, 5°, 50°, 105°, 160°, 145°.

## Scenes

**intro**
- L0: big clock at 1:00, arc between hands, label `30°` in success green.
- L1: minute hand ticks ONE step to 1:01 (step, not a sweep; the hour hand creeps 0.5°). Label morphs to `24.5°` in error red, small "not whole" tag.
- L2: Vantee wordmark/title pill.

**question**
- Full prompt text on the left: "How many of the times 1:00, 1:01, 1:02, …, 1:59 have a smaller angle between the clock hands that is a whole number of degrees?" Clock at 1:00 on the right.
- L1: highlight "1:00, 1:01, …, 1:59". L2: highlight "smaller angle" and "whole number of degrees".
- L3: choices row: (A) 12 (B) 15 (C) 29 (D) 30 (E) 60.

**asked**
- L0: a 6 × 10 grid of time chips `1:00 … 1:59` (rows 1:00–1:09, 1:10–1:19, …), all neutral grey. A tag "60 times".
- L1: two example chips pulled out: `1:00 → 30°` (green check) and `1:01 → 24.5°` (red cross).

**try1**: pause card, countdown 10, question text + clock at 1:00 still visible.

**speeds** (Solution 1 chapter)
- L0: minute hand sweeps a full turn, arc fills 360°. Row: `\dfrac{360^\circ}{60} = 6^\circ` per minute (shown on L1).
- L2: hour hand moves from the 1 to the 2, a 30° wedge shaded. Row: `\dfrac{30^\circ}{60} = 0.5^\circ` per minute.

**formula** (right panel builds up one row per line; clock on the left at a generic time like 1:10)
- L1: hour hand at the 1, arc from 12 labelled `30°`.
- L2: row `\text{hour hand} = 30 + 0.5m`
- L3: row `\text{minute hand} = 6m`
- L4: row `6 - 0.5 = 5.5` (degrees gained per minute)
- L5: boxed row `\text{gap} = 30 - 5.5m`

**test**
- L0: clock at 1:20; row `30 - 5.5 \times 20 = 30 - 110 = -80`
- L1: `-80` → `80^\circ`, arc labelled `80°` on the clock.
- L2: clock at 1:40; row `30 - 5.5 \times 40 = -190` → gap `190^\circ`. Draw the 190° arc first (big side).
- L3: arc flips to the other (smaller) side: `360 - 190 = 170^\circ`.

**whole**
- L0: show `30 - 5.5m` with "whole?" tag.
- L1: `30` turns green; `5.5m` gets highlighted (Mark sweep).
- L2: `5.5 \times 2 = 11` green check.
- L3: `5.5 \times 3 = 16.5` red, the `.5` highlighted.

**count**
- L0: row `360 - \text{whole} = \text{whole}`; then text "whole ⇔ m even".
- L1: the 1:00–1:59 grid returns. Group chips into pairs (1:00+1:01, 1:02+1:03, …) with a soft bracket; the even chip in each pair lights green, the odd one dims red.
  Light pairs in a sweep, NO counter yet.
- L2: counter appears only now: `60 \div 2 = 30` pairs.
- L3: answer reveal, choice (D) 30 highlighted. Chime at end of line. The one strong motion beat.

**hands** (Solution 2 chapter)
- L1: clock; minute hand steps minute by minute (1:00, 1:01, 1:02, 1:03), its readout `0°, 6°, 12°, 18°` always green.
- L2: hour hand readout `30°, 30.5°, 31°, 31.5°` — even-minute values green, odd-minute values red.
- L3: hold on 1:01: hour hand `30.5°` circled.
- L4: two rows: `\text{whole} - \text{whole} = \text{whole}` (green), `\text{whole} - (\ldots.5) = \text{not whole}` (red), e.g. `30.5 - 6 = 24.5`.
- L5: the grid flashes the same even-minute pattern; "every other minute → 30".

**traps** (one red trap card per line, each with its own mini-visual on the grid)
- L1: **60** — all 60 chips lit (no checking).
- L2: **29** — even chips lit except 1:00, which pulses with a "forgot me!" tag.
- L3: **12** — clock with minute hand on each number in turn; chips 1:00, 1:05, …, 1:55 lit (12 chips).
- L4: **15** — chips 1:00, 1:04, 1:08, …, 1:56 lit (even angles only); then 1:02 → `19°` pops in green as a missed whole angle.
- L5: habit card: "Check the first time • test an even AND an odd minute".

**variant**
- New clock at 2:00 (hour hand at the 2, 60°). Prompt: "From 2:00, 2:01, …, 2:59, how many times is the smaller angle a multiple of 5 degrees (5°, 10°, 15°, …)?"

**try2**: pause card, countdown 12, variant prompt + 2:00 clock visible.

**variant-answer**
- L0: row `\text{gap} = 60 - 5.5m`
- L1: "m even" tag.
- L2: row `5.5 \times 2 = 11,\ 5.5 \times 4 = 22,\ 5.5 \times 6 = 33,\ \ldots` (split into 2 rows if wide; must end before x ≈ 1880).
- L3: highlight: multiple of 11 AND multiple of 5.
- L4: list `0, 55, 110, 165, 220, 275` with m under each: `m = 0, 10, 20, 30, 40, 50`.
- L5: row `360 - (\text{multiple of }5) = \text{multiple of }5`. A 2:00–2:59 grid lights 2:00, 2:10, 2:20, 2:30, 2:40, 2:50, each with its angle `60°, 5°, 50°, 105°, 160°, 145°`. No count shown yet.
- L6: count reveal **6** (chime at line end); clock at 2:10 with `60 - 55 = 5^\circ` arc.
- L7: confetti.

**recap**
- L0: boxed `\text{angle at 1:}m = 30 - 5.5m`.
- L1: the 1:00–1:59 grid with even chips green, "every even minute".
- L2: Vantee sign-off.
