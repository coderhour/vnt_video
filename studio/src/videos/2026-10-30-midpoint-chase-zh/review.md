# Review: 2026-10-30-midpoint-chase-zh

Independent review (SKILL.md step 8), 2026-10-30. Inputs: `videos/2026-10-30-midpoint-chase-zh/video.mp4` (6:27, 1920x1080@30),
`narration.json`, `timeline.json`, `Composition.tsx`, `meta.json`, `script.md`, English `2026-10-30-midpoint-chase/narration.json`,
question `amc_practice_amc8_arithmetic_template:c1-822`. 71 frames (end of every line + extras) checked on half-scale 2x2 contact sheets.

**Must-fix: 0.** The maths is right everywhere (0, 64, 32, 48, 40, 44, 42, 43, 42½, 42¾; the variant gives P₉ = 21¼ in 8 jumps,
and the pairs 16+4+1+¼ add up). Every line keeps the English meaning. No "显然/很简单". The framing is "AMC 8 风格" throughout.
No on-screen English is left. Hanzi render in Noto Sans CJK SC (bold sans), with no tofu and no serif. 42.75 is first shown as
the answer at 2:43 ("所以P十是…", line 26): before that it shows only as choice C, and the 2:37.9 frame has P₉ but no P₁₀. Same for 21.25 (5:54). Sync
is good: voice onsets land within ~0.05 s of the timeline line starts.

**TTS check** (`tts.py … --check`, cached audio): "voice check: all lines match". The only differences are
punctuation, and every fraction/number read back correctly (四十二又八分之五, 二十一又四分之一, 左/右 not swapped).

## Should-fix

1. **Captions break mid-word and leave 1–2 character orphan lines** (all through the video; the caption box wraps by width only).
   Seen at:
   - 1:41 `…向左跳了三十 / 二。` (splits the number 三十二)
   - 1:56 `…而且方向相 / 反。` (splits 相反)
   - 2:04 `…它要往回跳，距 / 离减半。` (splits 距离)
   - 2:22 `…P八在四 / 十三。` (splits 四十三)
   - 3:48 `…配对能让算式更整 / 齐。`
   - 3:57 `…真实出现过的 / 点！`
   - 4:28 `…那你以为的P十，其 / 实是P十一。` (splits 其实)
   - 5:13 `…方向 / 相反。`
   - 5:23 `…向右二，向左 / 一。` (splits 向左一)
   - 5:31 `…正好到 / P九。`
   - 6:00 `…太棒 / 了！`
   - 6:12 `…而 / 且方向相反。`
   - 6:19 `…靠拢到同 / 一个值。`

   Fix: in `studio/src/lib/Explainer.tsx` add `textWrap: 'balance'` to the caption div's style, so lines split evenly.
   Remotion's Chromium supports it, and English captions benefit too. If a break still lands inside a word, add an explicit
   break at the comma for these lines (e.g. via a `\n` in the caption plus `whiteSpace: 'pre-line'`), or shorten the line.
   Shorter wording also helps. Examples:
   `然后，P四在三十二和六十四的正中间：四十八，向右跳了十六。` · `看，每一跳都是上一跳的一半，方向还相反。`

2. **True peak -1.0 dBTP, over the ≤ -1.5 target** (integrated -14.3 LUFS is fine; LRA 4.8). The English video has the same
   problem (-1.2), so the single-pass `loudnorm` in SKILL.md §7 is overshooting. Fix: do two-pass loudnorm (measure first, then
   pass `measured_I/TP/LRA/thresh` with `linear=true`), or add `alimiter=limit=0.82` (≈ -1.7 dBFS) after loudnorm, then re-check
   with `ebur128=peak=true`.

3. **0:35–0:43 (question scene, line 7–8) arcs run through the labels.** The green 16-arc crosses the `P₃` and `P₄` labels,
   and the purple 32-arc's head and tail sit on the `32` and `64` tick numbers. The same thing happens at 1:41 and 1:50 (jumps scene).
   Fix: start and end the arcs a little above the dots (e.g. offset the endpoints 14 px from the dots), or move the bottom arc's
   tick labels lower or the arc deeper. This likely comes from the English composition, so fix both if it's shared code.

4. **2:04 (jumps line 6) label pile-up near P₃/P₅.** `P₃P₅` touch, the faded `16` sits on top of `P₅`, and the purple `8`
   touches `48`. Fix: put `P₅` below the axis (or nudge it right), and move the `8` label further below the arc.

5. **5:23 (variant-answer line 2) the diagram is tiny and cluttered.** All 6 arcs are squeezed into ~400 px. `P₇` overlaps the
   arcs, and `21` sits inside the purple loop. Fix: draw the number line across the full stage width for this step, or label
   only the newest point and fade the old arcs more.

6. **Wording: line 38 (4:03) "如果在跳出分数之前就停下"**: "跳出分数" is unclear and sounds like translationese.
   Fix: `四十三是P八。要是在出现分数之前就停下来，就会得到它。` (and drop "就是…这个点", which adds nothing).

## Nits

7. **Line 41 (4:21) "要是第一个点叫P零"**: better as `要是把第一个点叫作P零，就会选它。那你以为的P十，其实是P十一。`
   ("选它" matches the trap framing better than "得到它").
8. **Line 39 (4:09) "这停得太早了"** loses "far" in "far too early". Try `四十四是P六，停得太早太早了。` or `…早了整整四步。`
9. **Line 20 (1:57) "它要往回跳，距离减半"**: the cause and effect is a little loose. Try `为什么呢？新的点落在上一跳的正中间，所以它会往回跳，距离只有一半。`
10. **Line 56 (6:13) and the recap card "看着每一跳"** sounds literal. Try `留意每一跳` / `盯住每一跳`.
11. **Line 13 (1:01) "这张表帮你把小数和分数对上号"**: the screen shows 4 cards, not a table. Try `下面这几个，帮你把小数和分数对上号。`
12. **Captions write points as "P一 / P十"**, and numbers in hanzi ("P八在四十三") while the screen shows P₈ = 43. That matches the
    English pipeline (captions = spoken text), but Chinese readers would scan `P₁ 在 0` faster. Optional: a zh caption override
    that uses digits and subscripts.
13. **Title/description**: "第5级" is fine, but "难度 5" may be clearer to Chinese parents. The description and chapters read
    naturally. Chapter times match the timeline (0:00, 0:18, 0:44, 1:09, 1:24, 2:46, 3:51, 4:36, 5:06, 6:03).
14. **3:41 (pairs line 8)**: the 2-line caption box's top edge touches the `4` denominator of `P₁₀ = 42¾`, with no gap.
    Fix: move that row up ~20 px.
16. **0:06–0:12 (line 2) and 2:39–2:44 (line 26): stray half-width space where `<short pause>` was cut**:
    `…正中间。 它会停在哪里？`, `…四分之三！ 答案是C。` A space after full-width punctuation looks wrong in Chinese.
    Fix: in `tts.py` `caption()`, replace the tag with "" (not " ") when the char before it is CJK, e.g.
    `re.sub(r"(?<=[　-〿＀-￯一-鿿])\s*<[^>]+>\s*", "", text)` first, then the existing rule.
15. **2:35–2:38 (list lines 4–5)**: the `½` and `¼` jump labels sit on the faded P₇→P₈ arc. Fix: lift them ~15 px or fade
    that arc further.
