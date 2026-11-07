# Vantee intro — book fair booth video (design spec)

Mode: video-shotcraft co-creation. Everything below was confirmed with the user unless marked PENDING.

## Brief (confirmed)
- Audience: parents walking past a booth at a **book fair**. Silent, loops, captions only, English (US spelling).
- Length ~130 s, 1920×1080 (4K render optional), 30 fps.
- Spine (from the live landing page): The right AI coach for every family goal → Find a coach → Build the path → Follow through → Grow together; parents in control.
- Must show: Family AI Coach (coach lineup), Skill Check, "beyond a practice book" (time per question, rushed vs stuck, step-by-step explain, video explainers, missed questions come back, writing rubric feedback), plan that fits the week, follow-through, Team Story (grow together, challenge-level share, a friend from another family), parent sees the kid's actual work, rewards (short), tutors (homework now, "publish your own AI coach" = Coming soon), CTA.
- Crews are deprecated: sharing is at challenge level.
- CTA: two branded QR codes (VntWeb.ShareQrCode.to_svg/2):
  - https://vantee.ai/math-coach?utm_source=bookfair&utm_medium=qr&utm_campaign=bookfair-2026
  - https://vantee.ai/writing-coach?utm_source=bookfair&utm_medium=qr&utm_campaign=bookfair-2026

## Data (confirmed)
Fictional demo families on vnt.coderhour.com: parent Sarah, kids Leo (Gr 6, AMC 8 by Jan 22 2027) and Mia (Gr 5, Write a story together with Leo); second family parent Priya, kid Ava (Gr 5) who joins Mia's Team Story. Hide the test env `dev:` strip. Time-dependent states (missed week, finished chapters, a week of history) are rebuilt in Remotion from real captured components.

## Visual direction (confirmed: Soft Garden)
Landing `page_bg.webp`/`hero_bg.webp` watercolor; Baloo 2 800 headlines, Nunito 600–800 body; green 500 `#0cc281`, green 800 `#05472f`, ink `#191936`, sub `#515469`, lilac accent `#7b61ff`; white 32px-radius cards with soft green shadow; mascot `Vantee_avatar_point2x.png`. Styleframes: scratchpad `sf/f1–f3.png`. Motion: calm, gentle push-ins, springs with light overshoot, holds ≥1 s; ≤3 camera-level impacts.

## Storyboard (approved 2026-11-06; built version below in "As built")
| # | Time | Beat | Shot card | Main action | Screens | Caption |
|---|---|---|---|---|---|---|
| 1 | 0:00–0:06 | Hook | type-assembly / blur-slide | Mascot floats in, line blurs in word by word | — | Every family has goals. **Following through** is the hard part. |
| 2a | 0:06–0:11 | Family AI Coach | pill-slot-cycle | Slot cycles math goal → writing goal → screen-time goal → **family goal** | — | The right AI coach for every ___ |
| 2b | 0:11–0:16 | One coach, whole family | PageCam push-in + chip press | "Who is this for? Me / Mia / Leo", tap Leo | goal entry | One place for the whole family. |
| 3 | 0:16–0:28 | Skill Check | cursor-flyover | Cursor answers an AMC 8 question, flies to report score + focus topics | /skill-check/amc8, report | Start with a free skill check. |
| 4a | 0:28–0:34 | Time per question | scanline-annotate-focus | Scan line tags rows: "Rushed · 14 s", "Stuck · 3 m 10 s", "Slip vs gap" | skill check report time section | We see how long every question takes. |
| 4b | 0:34–0:40 | Explain | document-typewriter-reveal | "Explain more" steps write themselves | quiz review + explain | Every question, explained step by step… |
| 4c | 0:40–0:46 | Video explainer | ClipCard + contact-shadow-lift | Our explainer video plays inside the review player card | quiz review player | …and on video. |
| 4d | 0:46–0:51 | Fix-it | draw-svg-trace | Ink circle on "Missed questions come back the next day" | Leo's path | Missed it? It comes back tomorrow. |
| 4e | 0:51–0:56 | Writing rubric | row-embed | Rubric rows drop in with scores + one next step | writing check report | Writing feedback, by a real rubric. |
| 5 | 0:56–1:06 | Build the path | list-reveal | 8 stages step in; "3 days a week" pill | AMC 8 path | A plan that fits your week, and adapts as they grow. |
| 6 | 1:06–1:22 | Follow through | doc-park-left-pill-deal | Planner parks left; three cards dealt: "One more time…", "What got in the way?", "I need help → Help is on the way" | /my_day + cards | Vantee helps them follow through, every day. |
| 7 | 1:22–1:40 | Team Story | collab-cursor-moves (cast-ensemble) → card-stack | Mia shares the challenge, Ava joins; three named cursors write chapters; chapters stack into a book cover | Team Story challenge | Write a story together. **Grow together.** |
| 8 | 1:40–1:54 | Parent sees the work | depth-layer-moves (multiplane) | Family goals in back; Mia's chapter, Leo's quiz results, the report float forward | Home family goals, work | See their actual work, not just a checkmark. |
| 9 | 1:54–2:00 | Rewards | chip-grid-single-select | Parent's reward list → kid redeems one | /rewards | You set the rewards. They earn them. |
| 10 | 2:00–2:07 | Tutors | steep-tilt-glide | /tutors page glides past; "Coming soon" pill lands | /tutors | Tutors: give homework, track progress, save time. · Coming soon: publish your own AI coach |
| 11 | 2:07–2:16 | CTA | row-embed (cards) + logo hold | Logo, line, two QR cards rise and hold ≥6 s | QR codes | Private · No ads · Parents in control |
Chapter transitions: shot-transitions (mask-wipe between chapters, flash-cut inside a chapter). Loop: last frame fades into frame 1.

## Sound (as built)
BGM: Mixkit "Feeling Happy" (Ahjay Stelino), Mixkit Free License, crossfade-looped once to 147 s (`audio/bgm.mp3`; kept after comparing 9 Mixkit tracks on 2026-11-06; original in
`audio/bgm-feeling-happy.mp3`). SFX: Freesound CC0 tick + chime already used by the series
(`sfx/FREESOUND-CREDITS.md`). Two renders: `video.mp4` (BGM) and `video-sfx-only.mp4` (`--props='{"bgm":false}'`).

## As built
Shot cards used as hero moves: blur-slide (every caption), pill-slot-cycle (beat 2a), card-stack (chapters), doc-park-left-pill-deal
idea (follow-through). Every other beat = caption + real screen card (styleframe f2 pattern) with one highlight.
Beat 4c (video explainer) toggles with `--props='{"video":false}'`.

Captured for real (2x, `studio/public/<slug>/tex/`): goal entry "Who is this for", AMC 8 skill check question + report (time chart,
"3 wrong answers came in under 20 seconds"), Leo's quiz review + Explain more, Leo's goal page path / How it works, practice-test-done
summary, aim-higher offer, writing check report, planner, Mia's share dialog (code row only), Ava's join preview, Priya's join approval,
Team Story chapters + 3 AI illustrations, parent home highlights + check-in storybook card, reward setup + redeem, /tutors page.
Rebuilt from the app's real markup + compiled app.css (state needs time to pass): weekly catch-up card, weekly recovery card + thanks,
"I need help" chips + "Help is on the way." (`img/card-*.png`, source `scratchpad/cards/cards.html`).
Not on screen: test-env "LIVE" pill (painted out), dev strip (hidden), coderhour link + join QR (cropped out).
Copy note: captions say "writing traits" (the report's wording), not "rubric".

## Open (asked of the user)
- Prod flags: `quiz_video_explainer` (beat 4c) and `weekly_goal_catch_up` (catch-up + recovery cards in beat 6) ship OFF by default.

## Independent review (2026-11-06) and fixes
Fixed: reading time (coach +60f, five 6 s feature beats +30f, path +30f; total 4410f = 2:27), BGM leading 1.7 s silence trimmed,
"until they're right" dropped (app copy: "come back the next day"), redeem crop shows the whole Confirm button, planner kept inside the
frame, parent beat pans to Leo's quiz ("Every chapter and quiz"), chapter 2 credited "Friend" (as the app's cross-family view does),
explanation crop fades at the right edge, push-ins on the skill-check question and the "3 wrong answers…" row.
Accepted: UK spelling inside the app's own screens; the tutors page artwork's "vantee.com/…" link (real marketing art); QR only on the
end card (put a printed QR at the booth too).
