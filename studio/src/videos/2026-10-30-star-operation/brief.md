# Build brief: 2026-10-30-star-operation

Question `amc_practice_amc8_arithmetic_template:c1-095`. Answer C = 7/8 (bank correct_index 2). Run `python3 verify.py` here: every number below is asserted there.
`narration.json` + `verify.py` are the contract. No figure in the bank, so this is an algebra-morph video: big KaTeX fraction rows, top and bottom computed in their own coloured boxes.

Global visual rules
- Always `\dfrac` (never `\frac`), ≥ 56 px for main rows, ≥ 48 px for chips/side notes. Choice chips: A `\dfrac{5}{7}`, B `\dfrac{9}{11}`, C `\dfrac{7}{8}`, D `\dfrac{14}{15}`, E `\dfrac{77}{60}`.
- Keep the rule card `a\star b=\dfrac{a+b}{1+ab}` pinned small top-right from `asked` onward (the "top" part `a+b` tinted primary #0cc281, the "bottom" `1+ab` tinted secondary #7b61ff). Reuse those two tints for every TOP box and BOTTOM box in the solutions.
- A "chain tracker" strip (top of stage, `\dfrac` at 48 px): `\dfrac12\star\dfrac13\to\,?`, then `?\star\dfrac14\to\,?`, then `?\star\dfrac15\to\,?`. Each `?` fills in only when the voice says it (5/7 on step1 L4, 9/11 on step2 L3, 7/8 on step3 L4). Never show 7/8 before step3 line 4.
- Stage above y ≈ 860. Longest KaTeX row must end before x ≈ 1880.

## intro
L0: big ★ symbol pops in (the one strong beat here is fine). L1: a chain of three ★ with the last one greyed/"left behind" to hint at stopping early. L2: Vantee wordmark/hello.

## question
L0: rule `a\star b=\dfrac{a+b}{1+ab}` writes on. L1: full prompt expression `\left(\left(\dfrac12\star\dfrac13\right)\star\dfrac14\right)\star\dfrac15`. L2: choices A–E as chips (no highlighting of C).

## asked
L0: dim everything except the rule. L1: "machine" picture: two numbers in → ★ box → one number out. L2: highlight the innermost bracket first (Mark sweep), then arrows showing the result feeding the next ★ (inside-out order). Rule card shrinks to top-right.

## try1 (pause)
Pause card, question expression + choices still visible.

## step1 (Solution 1)
Main area: `\dfrac12\star\dfrac13 = \dfrac{\;\text{TOP}\;}{\;\text{BOTTOM}\;}` with two boxes.
- L1: show the template `\dfrac{\frac12+\frac13}{1+\frac12\cdot\frac13}` (use `\dfrac` inside too).
- L2 TOP box: `\dfrac12+\dfrac13=\dfrac36+\dfrac26=\dfrac56` (show the common-denominator row; don't skip it).
- L3 BOTTOM box: `1+\dfrac16=\dfrac66+\dfrac16=\dfrac76` (say "one plus one over six" — show `\dfrac12\cdot\dfrac13=\dfrac16` as a small note first).
- L4: `\dfrac{5/6}{7/6}` → render as `\dfrac56\div\dfrac76`, the two "6" denominators strike/fade, morph to `\dfrac57`. Fill tracker slot 1 with 5/7.

## step2
- L0: `\dfrac57\star\dfrac14`. The 5/7 should travel from the tracker into the new row.
- L1 TOP: `\dfrac57+\dfrac14=\dfrac{20}{28}+\dfrac{7}{28}=\dfrac{27}{28}`.
- L2 BOTTOM: note `\dfrac57\cdot\dfrac14=\dfrac{5}{28}`, then `1+\dfrac{5}{28}=\dfrac{33}{28}`.
- L3: `\dfrac{27}{28}\div\dfrac{33}{28}=\dfrac{27}{33}` (28s fade), then `\dfrac{27}{33}=\dfrac{9}{11}` with a small "÷3" on top and bottom. Fill tracker slot 2.

## step3
- L0: `\dfrac{9}{11}\star\dfrac15`.
- L1 TOP: `\dfrac{9}{11}+\dfrac15=\dfrac{45}{55}+\dfrac{11}{55}=\dfrac{56}{55}`.
- L2 BOTTOM: note `\dfrac{9}{11}\cdot\dfrac15=\dfrac{9}{55}`, then `1+\dfrac{9}{55}=\dfrac{64}{55}`.
- L3: `\dfrac{56}{55}\div\dfrac{64}{55}=\dfrac{56}{64}`, "÷8" on top and bottom.
- L4: morph to `\dfrac78` — answer reveal (Answer component, chime at END of line), chip C goes success green #21c45d, fill tracker slot 3.

## score (Solution 2)
Right panel: a "score" definition card `\text{score}(x)=\dfrac{1+x}{1-x}`.
- L1: definition card writes on.
- L2: `\text{score}\left(\dfrac12\right)=\dfrac{3/2}{1/2}=3` — write as `\dfrac32\div\dfrac12=3`.
- L3: `\text{score}\left(\dfrac13\right)=\dfrac43\div\dfrac23=2`; then a bold claim banner: `\text{score}(a\star b)=\text{score}(a)\times\text{score}(b)`.
- L4: bring back `\dfrac12\star\dfrac13=\dfrac57` from step1.
- L5: `\text{score}\left(\dfrac57\right)=\dfrac{12}{7}\div\dfrac27=6`, then `3\times2=6` with a green Check.

## why
Two rows, top/bottom colours as before:
- L0: `1+a\star b=\dfrac{1+ab+a+b}{1+ab}=\dfrac{(1+a)(1+b)}{1+ab}` (show the middle row; the "1+ab" bottom stays purple).
- L1: `1-a\star b=\dfrac{1+ab-a-b}{1+ab}=\dfrac{(1-a)(1-b)}{1+ab}`, then the division `\dfrac{1+a\star b}{1-a\star b}=\dfrac{(1+a)(1+b)}{(1-a)(1-b)}` with both `1+ab` bottoms struck out. If this row is too wide, stack it below; keep ≥ 48 px.

## score-chain
- L0: four score chips `\dfrac31,\ \dfrac42,\ \dfrac53,\ \dfrac64` under 1/2, 1/3, 1/4, 1/5 (label each with its number).
- L1: `\dfrac31\times\dfrac42\times\dfrac53\times\dfrac64` — strike the 3s and 4s pairwise (top 3 with bottom 3, top 4 with bottom 4), leaving `\dfrac{5\times6}{1\times2}=15`. Animate the cancels one pair at a time.
- L2: `1+x=15\,(1-x)` (call the answer x on screen only; voice says "the answer").
- L3: a bar of length "2" split into 16 equal parts: 15 parts primary green labelled `1+x`, 1 part purple labelled `1-x`; caption-free label `\text{each part}=\dfrac{2}{16}=\dfrac18`.
- L4: `1-x=\dfrac18\ \Rightarrow\ x=\dfrac78` — second (smaller) answer pulse, no confetti.
- L5: small "long chain → scores" note.

## traps
Five-row trap list, red #ef4343 for wrong; each row lands on its line:
- L1: chip A `\dfrac57` + tracker showing only step 1 filled, steps 2–3 dashed "left".
- L2: chip B `\dfrac{9}{11}` + tracker with step 3 dashed.
- L3: chip E `\dfrac{77}{60}` = `\dfrac12+\dfrac13+\dfrac14+\dfrac15=\dfrac{30+20+15+12}{60}=\dfrac{77}{60}`; the rule card's purple bottom `1+ab` flashes as "forgotten".
- L4: number line 0…1 with a ceiling at 1; `\dfrac{77}{60}>1` marked red beyond it. (True rule: for 0<a,b<1, a★b<1, because 1+ab−a−b=(1−a)(1−b)>0 — no need to show this.)
- L5: chip D `\dfrac{14}{15}` = `1-\dfrac1{15}` (use `\dfrac{1}{15}`) — it is "what you'd get if", so word any on-screen label as "if you did", not as fact.
- L6: the score 15 → 16-part bar → 7/8 path from score-chain repeated small, with green check on 7/8.
C chip stays green throughout.

## variant
- L0: rule card. L1: `\left(\left(\dfrac13\star\dfrac14\right)\star\dfrac15\right)\star\dfrac16`. Same chain tracker with three empty slots. 3/4 must not appear yet.

## try2 (pause)
Pause card with the variant expression visible.

## variant-answer
- L0: slot 1 fills `\dfrac{7}{13}`; side working: TOP `\dfrac{7}{12}`, BOTTOM `\dfrac{13}{12}`.
- L1: slot 2 fills `\dfrac23`; side working: TOP `\dfrac{48}{65}`, BOTTOM `\dfrac{72}{65}`, `\dfrac{48}{72}=\dfrac23`.
- L2: slot 3 fills `\dfrac34`; side working: TOP `\dfrac56`, BOTTOM `\dfrac{10}{9}`, `\dfrac56\div\dfrac{10}{9}=\dfrac{45}{60}=\dfrac34`. Answer reveal + chime at line end.
- L3: score chips `\dfrac42\times\dfrac53\times\dfrac64\times\dfrac75=\dfrac{6\times7}{2\times3}=7` (cancels as before), and `1+x=7\,(1-x)`.
- L4: 8-part bar (7 green + 1 purple), `\text{each part}=\dfrac28=\dfrac14`, `1-x=\dfrac14\Rightarrow x=\dfrac34`.
- L5: confetti / celebration.

## recap
- L1: rule card + "one step at a time · top and bottom separately" two-box icon.
- L2: chain tracker with all three slots filled, final slot highlighted.
- L3: sign-off.

## YouTube
Title: `The Star Puzzle: Fractions in a Chain | AMC 8-Style Level 4`
Description:
A made-up "star" rule, three steps in a row, and one sneaky trap: stopping too early!
Vantee shows you the careful step-by-step way, a clever "score" trick that makes the chain collapse, every wrong answer, and a new chain for you to try.
