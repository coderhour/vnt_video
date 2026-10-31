# Independent review: 2026-10-30-sliding-triangle

Question `amc_practice_amc8_mixed_template:c1-716`. Video 367.7 s, 1920×1080, 30 fps, 11028 frames.
Evidence: 130 frames (middle and end of every line, plus every scene end) tiled into 22 contact sheets, full-res
crops of the labels, ebur128, `tts.py --check`.

**Must-fix: 0. Should-fix: 8 (S1–S5, K1, K2, V1). Nits: 10 (N1–N10).**

## 1. Math: passes

- Blind re-solve: overlap = right triangle (4,0)(12,0)(4,6). Its base is 8 and it has the same slant as the original
  (9 down per 12 across), so its height is 6 and its area is 24. 54 − 24 = 30 = choice E (`correct_index` 4). ✓
- `verify.py` re-run: `ok` (whole 54, overlap 24, shaded 30, left strip 30; variant 25 / 9 / 16, strip 16). ✓
- Strip method: same-area argument is right (T and C are both 54 and both lose O). Drop of 3 per 4 across gives 6,
  and the trapezoid (9+6)/2·4 = 30. ✓
- Variant 10×5 slid 4: 25 − 9 = 16, strip (5+3)/2·4 = 16. ✓
- Traps: "Eighteen is what you'd get if you called the strip a triangle, base four, height nine" → ½·4·9 = 18, exactly
  true. "Twenty-eight is what you'd get if the long side dropped four, not three, for every four across" → right side
  9 − 4 = 5, (9+5)/2·4 = 28, exactly true. 24 (overlap) and 27 (half of 54) are worded correctly. ✓
- The 2/3 scale is justified only by "Its slanted side is part of the original's long side. So it's a smaller copy",
  plus the on-screen note "same angles, smaller". See kid test K1.

## 2. Spoken vs shown

The figure matches the bank in every scene: the 12-leg is horizontal, the right angle is bottom-left, the copy is slid
exactly 4/12 of the base, and the variant has a 2:1 ratio with a 4/10 slide. The intro slide has no numeric readout,
and no choice value appears before the reveal, apart from the case in S1. Shading matches what is said in every line I
checked: gray = copy-only, green = overlap, purple = left strip. Every spoken number has a matching number on screen.

- **S1 (should-fix), total1 L1, about 139.5 s; variant-answer L5, about 326 s.** The full rows `54 − 24 = 30` (start
  at L1 0.2) and `25 − 9 = 16` (start at L5 0.2) appear about 2 s before "thirty" / "sixteen" is spoken. So the answer
  is on screen before it is said and before the reveal beat. **Fix:** show `54 − 24` at 0.2 and fade in `= 30` at about
  0.85 of the line, when "thirty" is spoken. Do the same for `= 16`.
- **S2 (should-fix), whole L3, 92–95 s, and total1 L1 (label "54"); variant-answer L1, about 305 s (label "25").**
  The "54" label at `P(11,~1.4)` sits on the copy's hypotenuse, and its halo cuts the line. The "25" label at
  `P(8,1.4)` sits right on top of the original's hypotenuse, half in the overlap and half in the copy-only part.
  Both also sit mostly in the shaded region, so they can read as "shaded = 54 / 25". **Fix:** move them to the open
  middle of the copy, clear of every edge: about `P(7.5,2.2)` for 54 and about `P(6.5,1.0)` for 25 (check that it
  clears the line `y = 5 − x/2`). Or put the number beside the copy with a short leader.
- **S3 (should-fix), strip L5–L7, 173–190 s, and strip-area.** The "?" and then the "6" float at `P(3.3,3)` inside the
  purple strip. The right side (4,0)–(4,6) that the narration asks about ("How tall is its right side?") is never
  highlighted, so "6" can read as an area or a width. **Fix:** at L5, draw the right side as a coloured segment
  (`Seg P(4,0)→P(4,6)`), like the amber side in traps L5. Put "?" and then "6" just right of it, about `P(4.6,3)`, or
  just left of it with a leader.
- **S4 (should-fix), variant-answer L6–L8, 330–346 s.** The purple strip label "5" is drawn at `P(1.5,5.8)`, above the
  apex and centred over the top of the strip. It looks like a horizontal width of 5 (the strip is 4 wide), and the black
  "5" dimension is already on the left. **Fix:** remove it, or put it beside the strip's left side, about `P(-0.6,2.5)`
  in violet. Also move the violet "3" next to the strip's right side (x = 4), not into its middle.
- N1 (nit), strip L2–END. The note "Original T = 54, loses the same 24" uses "T", which is never spoken or defined.
  → "Original = 54, loses the same 24".
- N2 (nit), variant-answer L2, about 309 s. `10 − 4 = 6` is shown, but the figure has no "6" bar under the overlap (the
  main question had the green "8" bar). → Add a `DimH` 4..10 labelled 6, in green.
- N3 (nit), total1 END, about 150 s. The "30" label at `P(11.2,1.4)` nearly touches the overlap's hypotenuse.
  → Nudge it to about `P(12.2,1.6)`.

## 3. Kid test

- **K1 (should-fix), overlap L4, about 114–118 s.** "Its slanted side is part of the original's long side. So it's a
  smaller copy" skips the reason. A kid needs both a square corner and the same slant. **Fix:** "It has a square
  corner, and its slanted side lies along the original's long side, so it has the same slant. Same angles: it's a
  smaller copy of the original." (The screen already says "same angles, smaller".)
- **K2 (should-fix), strip-area L1–L2, 194–206 s.** The trapezoid area rule is used without being said:
  "Nine plus six is fifteen. Half is seven and a half. Times four…" The 28 trap later relies on the same rule. **Fix:**
  add to L1: "A trapezoid's area is the average of its two parallel sides, times the width." Optionally show
  `\dfrac{9+6}{2}\times 4` as the first row. Also, the parallel sides are vertical here, which kids rarely see. A quick
  90° turn, or a note "the parallel sides stand up", would help (the brief allowed "L rotated").
- N4 (nit), strip L7. "So after four steps across" can be heard as four steps of four. → "So after four across, it has
  dropped three."
- N5 (nit). "one over two, times twelve, times nine" is TTS-safe but stiff. "half of twelve times nine" sounds more
  natural if the normaliser allows it. Leave it if this is house style.
- Pacing is fine: 10 s and 12 s pauses, line gaps of 10 frames or more, and each row lands during its line.

## 4. Visual / audio

- Loudness: **−14.1 LUFS integrated**, true peak −1.0 dBFS, LRA 4.6 LU. ✓ Audio is 367.7 s and video is 367.6 s
  (11028 frames = timeline `durationInFrames`), so there is no drift. Captions, rows and highlights land inside their
  lines in every sheet. ✓
- Captions: 58 px and at most 2 lines everywhere. ✓ No clipped text and no overlap between the caption and the panel. ✓
- **S5 (should-fix), whole L2, overlap L7, traps L4, variant-answer L1 and L4.** The ½ is written as `\tfrac12` at size
  52–62. Its digits render at about 25–30 px, below the 48 px floor for maths. **Fix:** use `\dfrac{1}{2}`, as the other
  fractions already do.
- N6 (nit), traps L3–L5, strip-area L3. The small notes "not half!" (42), "4 across, 4 down (not 3)" (42), the pill
  "Strip easier to see? Use this way" (36) and "Amazing work!" (36) are above the 32 px auxiliary floor but small next
  to the 52 px rows. Bump them to 44–48.
- N7 (nit), variant-answer L7. `\dfrac{8}{2} = 4` is 52 px and `4 × 4 = 16` is 70 px, and the stack looks cramped.
  Use the same size, or add about 20 px of spacing.
- N8 (nit), recap L1, about 346–349 s. The big white "The big idea" card is empty for the whole line (about 3 s).
  → Fade in the first sentence at L1 0.5, or show the small figure earlier.
- N9 (nit), variant-answer L8. The confetti is sparse, and a few specks drift over the caption box. Not a real problem.

## 5. Voice (`tts.py --check`, after the "1 over 2" fix)

The "one over two" lines now pass ("one over two times ten times five" ✓). Two mismatches remain:

- **V1 (should-fix), intro L2, about 6–10 s.** "How much of the **copy** sticks out?" was heard as "cup B" and, on the
  re-listen, as "puppy". Two different wrong hearings, while "copy" passes in every other line, point to a real slur
  in this clip, and it is the hook line. **Fix:** regenerate this line (bust its cache entry). If it still fails,
  rephrase to "How much of the copied triangle sticks out?"
- N10 (nit), asked L3, about 51–53 s. "The copy slides **four** along the bottom line" was heard as "forth", then "for".
  "for" is a homophone, and "slides four along" is an unusual phrase, so this is most likely a transcription guess,
  not bad audio. Still, the same phrase is ambiguous for a listener. **Fix (optional):** "The copy slides four to the
  right, along the bottom line."
- "Vantee" → "Vanti" is the known brand-name transcription. Ignore it.
