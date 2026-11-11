# Current in-repo video production: skills and outputs audit

Scope: local codebase only (no web research). Snapshot = working tree of `/home/brad/code/vnt_video` on 2026-11-09, **including uncommitted changes** (13 meta.json / short files modified since commit 225a515). "Sources" are absolute file paths with line numbers. Durations come from `ffprobe` on the local `video.mp4` / `short.mp4`. Counts come from a script over all `videos/*/meta.json` (135 video folders: 86 English, 49 `-zh`; 83 English quiz-question explainers, 2 contest guides, 1 booth/intro video).

## 1. Structure of a full explainer (hook, length, sections, CTA, end screen, chapters)

### Takeaway
Every full explainer follows one fixed 9-part lesson template (Intro → Question → What are we asked → Pause & try → Solution 1 → Solution 2(+3) → Common traps → Variant → Recap). Runs are 5–7.25 min (median 6:48), with 9–12 YouTube chapters auto-generated from the script. The full problem statement starts at 11–21 s (median 17 s). There is no spoken subscribe, comment or vantee.ai call to action. The only end element is a ~6–7 s branded sign-off card; nothing sets YouTube end screens or cards.

### Cited Findings
- Spec: "English, 1920×1080, 30 fps, about 4–7 minutes." Audience 10–14 year olds, one hard (difficulty 4–5) question per video. — [SKILL.md:8,19](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Scene template (bold = YouTube chapter): 1 Intro "hook in under 10 s (a surprising fact, or 'most kids get 26 here…'), then 'I'm Vantee'"; 2 The question; 3 What are we asked?; 4 Try it yourself (pause card, `hold: 10`, countdown); 5 Solution 1 (intuitive); 6 Solution 2/3 (clever); 7 Common traps; 8 Your turn: a variant (pause card plus worked answer); 9 Recap with `<SignOff text="Keep exploring!">`. — [SKILL.md:107-119](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Pacing rule of thumb: "about 4.5 s per line, so about 58 lines gives about 6:50. Over 60 lines goes past 7 min." — [SKILL.md:242](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Measured durations of the 83 English quiz explainers: min 299 s (4:59, clock-hand-moves), median 408 s (6:48), max 435 s (7:15, integer-roots-12b). Contest guides: AMC 8 guide 265 s, AMC 10 guide 303 s. Booth intro 147 s. Chinese (`-zh`) cuts run about 10–18% longer (e.g. dot-grid-squares 409 s EN vs 482 s ZH). — ffprobe on `/home/brad/code/vnt_video/videos/*/video.mp4`
- Hook reality: all 83 explainer descriptions put the second chapter ("The question") at 11–21 s (median 17 s). So the intro runs past the skill's "under 10 s" target, and the formal problem appears after it. Sample intros (from timeline.json captions):
  - dot-grid-squares: "Twenty dots. How many squares can you make with them?" / "Most kids find twenty. But there are MORE hiding in here." / "Hi, I'm Vantee! Let's find every last one, together."
  - incircle-radius-4: "A circle of radius four sits snugly inside a triangle. How big can that triangle be?" / "One tiny slip here gives you exactly half the right answer." / "Hi, I'm Vantee. Let's go triangle hunting!"
  - broken-stick: "Snap a stick in 2 random places…" / "…Here's a hint: it's rarer than you might think." / "Hi, I'm Vantee!…"
  — [/home/brad/code/vnt_video/studio/public/2026-10-29-dot-grid-squares/timeline.json](/home/brad/code/vnt_video/studio/public/2026-10-29-dot-grid-squares/timeline.json), [/home/brad/code/vnt_video/videos/2026-11-07-broken-stick/script.md:1-10](/home/brad/code/vnt_video/videos/2026-11-07-broken-stick/script.md)
- So the intro poses the problem informally in line 1 (a question to the viewer), adds a "trap/surprise" line, then gives the name intro. — same sources
- Chapters: `tts.py` builds them from scenes marked `chapter` and enforces YouTube's rules (first at 0:00, ≥3 chapters, each ≥10 s). It prints chapter lines to paste into the description. — [tts.py:292-303](/home/brad/code/vnt_video/.claude/skills/math-explainer/scripts/tts.py), [SKILL.md:149-152](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Every one of the 83 explainer descriptions contains 9–12 chapter timestamps. — script over meta.json
- On-screen furniture in every frame: chapter pill (top-left), "AMC 10-style · Level 4" badge (top-right), burned-in sentence captions in a bottom box, and a static Vantee leaf logo watermark bottom-left. — [Explainer.tsx:58,68,102-125](/home/brad/code/vnt_video/studio/src/lib/Explainer.tsx), [SKILL.md:214-215](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Audio: Gemini TTS voice "Achird", style "warm and encouraging, speaking at a relaxed pace, no laughing". Light SFX only (chime on reveals, tick on countdown, ~0.2–0.3 vol). "No background music for now (the user decided this)". Loudness normalized to -14 LUFS. — [SKILL.md:34,160-165,259-260](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md), [render.sh:40-41](/home/brad/code/vnt_video/.claude/skills/math-explainer/scripts/render.sh)
- Ending: the last line is always "I'm Vantee. Keep exploring (or 'Keep counting'), and I'll see you next time!". The SignOff card (logo, "Your family AI Coach" tagline, "Keep exploring!", sparkle SFX) fades in on that last line. Measured: dot-grid last line starts at 402.6 s of 409.1 s; incircle 420.1 of 426.3; broken-stick 412.1 of 418.3; juice-mix 367.6 of 374.5. So the end card is on screen for about 6–7 s. — [Brand.tsx:28-44](/home/brad/code/vnt_video/studio/src/lib/Brand.tsx), timeline.json files under `/home/brad/code/vnt_video/studio/public/<slug>/`
- No full-video narration (135 `narration.json` files, EN plus ZH) contains "subscribe", "comment" or "vantee.ai". "next time" appears in 83. The only practice/CTA text sits in the description footer (see Q3). — script over `/home/brad/code/vnt_video/studio/src/videos/*/narration.json`
- No code or skill text mentions YouTube end screens or info cards (grep of tools/, site/, skills). — [youtube.py](/home/brad/code/vnt_video/tools/youtube.py) (whole file), [site/index.html](/home/brad/code/vnt_video/site/index.html)
- Two "Pause & try it" countdown cards per video (main question plus variant). The skill fixes `hold: 10` for the first; dot-grid-squares uses 10 s and 12 s. — [SKILL.md:111-112,116](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md), [PauseCard.tsx](/home/brad/code/vnt_video/studio/src/lib/PauseCard.tsx)

### Inferences
- In line with common practice: chapters on every video, -14 LUFS loudness, captions burned in, problem posed as a question in the first sentence, a clear promise ("one tiny slip gives you half the answer").
- Possibly against common practice: the self-intro ("Hi, I'm Vantee!") takes the third intro line on every video. The full problem doesn't appear until about 17 s. There's no verbal or visual call to subscribe or comment in long-form. The end card (~6–7 s) is too short for YouTube end-screen elements, which run 5–20 s and need the final stretch free of content. No end screen is set either way.
- Two 10 s pause cards plus a "What are we asked?" restatement put about 30–40 s of low-motion time into the first ~1:30, which may hurt early retention. This is a judgment; no retention data exists to check it.
- Style is uniform across 83 videos (same template, voice, palette, sign-off). That's good for brand consistency, but it also means any retention problem repeats in every video.

### Gaps
- No audience-retention, CTR or watch-time data in the repo to tell whether the 17 s intro or the pause cards cost viewers.
- Unknown whether end screens or cards were added by hand in YouTube Studio; the repo has no record.

## 2. Structure of a short (hook, length, captions, CTA, link to full video, loop)

### Takeaway
Shorts are vertical 1080×1920 teasers of 30–40 s (measured median 38.6 s) with a fixed 5-scene shape. The hook is "AMC eight/ten challenge! Think it's <trap>? Nope!" with a NOPE stamp from frame 0. Then come the question, a "Comment your letter, then watch!" beat, one zoomed aha animation, and the reveal with "Did you get X? Tell me below!". Word-by-word captions, a quiet music bed and a "Practice more at vantee.ai" pill are always on. The last frame is built to loop back into frame 0. The full-video link sits only in the description; Related video is set by hand in Studio.

### Cited Findings
- Purpose: "stop the scroll, give one satisfying 'aha', get a comment, and send the viewer to vantee.ai to practice more." 1080×1920, 30 fps, 30–40 s. — [math-short SKILL.md:8-10](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md)
- 5 scenes, ~10 lines:
  - `hook` ~3 s: "AMC eight challenge! Think it's <trap>? Nope!", where <trap> is the most tempting wrong choice. Violet chip "AMC 8 · Challenge #N", 96 px title, figure in a PushIn, red NOPE stamp plus buzz. "Never invent a statistic ('most kids…')".
  - `question` ~8 s: question card, figure, choices as chips.
  - `think` ~2.5 s: "Comment your letter, then watch!" with pulsing choices and a CommentBubble.
  - `aha` 12–15 s: one key idea with zooms, a counter, something changing every 2–3 s.
  - `reveal` ~9 s: answer, then trap line, then "Did you get <answer>? Tell me below!", with the CtaPill on the last line.
  — [math-short SKILL.md:17-25](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md)
- Loop: "The last frame must show the same figure, at the same place, as frame 0 (so the loop back to the hook is a clean cut)." — [math-short SKILL.md:25](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md)
- CTA rules: no end card; the pill replaces it. "Never say 'tap the link below' (Shorts and TikTok links aren't clickable) or promise the full lesson on vantee.ai (it isn't public there). Always reveal the answer." — [math-short SKILL.md:27-29](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md)
- CtaPill = green "Practice more at vantee.ai" pill (in the China cut, just the logo chip). — [Short.tsx:111-112](/home/brad/code/vnt_video/studio/src/lib/Short.tsx)
- Voice style for shorts: "warm and upbeat, speaking at a brisk, energetic pace, no laughing", line_gap 0.15 s, digits in captions (`caption_digits`). — [math-short SKILL.md:31-38](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md)
- Captions: `captions="words"` (punchy word captions at y 1330–1500, always on "because muted viewers need every line"). Small Vantee.ai logo plus "AMC 10-style" badge at top-left, y=200. — [math-short SKILL.md:40-43](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md), [Short.tsx:129-152](/home/brad/code/vnt_video/studio/src/lib/Short.tsx)
- Music: shorts get a looped Mixkit hip-hop bed ("tonight-hiphop.mp3") at volume 0.035 that fades at the end. Full videos have none. — [Short.tsx:75,151](/home/brad/code/vnt_video/studio/src/lib/Short.tsx), [math-explainer SKILL.md:34](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- SFX palette for shorts: buzz (NOPE/trap), click (sweeps), whoosh (scene changes, zooms), riser into the answer pop. — [Short.tsx:69-74](/home/brad/code/vnt_video/studio/src/lib/Short.tsx)
- Safe zone: platform UI covers the top ~200 px, bottom ~340 px, right ~160 px below y≈900. — [math-short SKILL.md:73](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md)
- Observed frame 0 (incircle-radius-4 short): chip "AMC 10B prep · Challenge #7", "Think it's 81?" with 81 in red, subtitle "Biggest perimeter?", figure, word caption "Think it's 81?". — ffmpeg frame 0 of `/home/brad/code/vnt_video/videos/2026-11-01-incircle-radius-4/short.mp4`
- Measured short durations (83 English explainer shorts): min 32.7 s, median 38.6 s, max 40.1 s. Out of spec (>40 s): amc10-guide 41.0, and zh shorts geometric-triangle-zh 49.3, circles-through-grid-points-zh 49.6, polygon-center-zh 44.4, amc8-guide-zh 42.7, amc10-guide-zh 40.9, lattice-triangle-10-zh 40.8. — ffprobe on `/home/brad/code/vnt_video/videos/*/short.mp4`
- Every English explainer has a rendered short (83/83). Most `-zh` folders have no short. — same
- Link to the full video: only via the description token `{full_video_url}` ("Full lesson with two solutions and every trap: <url>"), filled at publish time. "The API can't set a Short's Related video, so set it in YouTube Studio after publishing." A short can't be uploaded before its full video. — [math-short SKILL.md:84-91](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md), [youtube.py:286-293,306-307](/home/brad/code/vnt_video/tools/youtube.py)
- Numbered series: `short.challenge` N, with separate AMC 8 and AMC 10 series in planned posting order. The number is shown on screen ("Challenge #N") and used for the Shorts playlist position. — [math-short SKILL.md:88-89](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md), [youtube.py:151-154](/home/brad/code/vnt_video/tools/youtube.py)
- Republish: a fixed short is uploaded as a NEW video and the old one set private. The site warns that views, likes and comments don't carry over and that Related video must be set again. Used once: geometric-triangle (old `g-OTMmAdZgs` → private). — [youtube.py:300-333](/home/brad/code/vnt_video/tools/youtube.py), [site/index.html:64-66](/home/brad/code/vnt_video/site/index.html), `/home/brad/code/vnt_video/videos/2026-10-30-geometric-triangle/meta.json`

### Inferences
- In line with common Shorts practice: hook text and visual from frame 0 with no fade, the trap-first curiosity gap, a comment prompt ("Comment your letter"), a seamless loop, always-on captions for muted viewing, a UI safe zone, and 30–40 s length.
- Possibly against it: the short pushes viewers to vantee.ai (off-platform, can't be clicked) instead of the full YouTube lesson, which is the on-platform watch-time path. The Related video link, the only clickable on-screen path to the full lesson, depends on a manual Studio step that isn't tracked in meta.json.
- The hook formula is the same in every short ("Think it's X? Nope!"), which may wear out with repeat viewers. That's a judgment with no data behind it.

### Gaps
- No record of whether Related video was set for each of the 14 published shorts.
- No data on loop rate, swipe-away rate or comment counts.

## 3. Title, description and tag templates; thumbnail process

### Takeaway
Full-video titles follow "<curiosity question/hook> | AMC 8-Style Level N" (median 56 chars). Two AMC 10 videos were recently retitled to "AMC 10B Practice: …" with a date-tied first line, uncommitted. Descriptions are 2–3 kid-friendly lines, then chapters, then a credits line, then an auto-appended footer with a UTM link to vantee.ai and an MAA trademark disclaimer. Tags are 6 generic defaults. The "thumbnail" is `poster.jpg`, a raw frame grabbed at a fixed second of the question scene (captions and small text visible). It's uploaded via the API for full videos only, but nothing records whether that worked. Shorts get no thumbnail.

### Cited Findings
- Title template example: "Can You Find All 30 Squares? | AMC 8-Style Level 5". Description = "<2–3 kid-friendly lines>\n\n<chapter lines from tts.py>". — [math-explainer SKILL.md:270-276](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Naming rule: always "AMC 8-style / AMC 10-style", never present a question as a real AMC problem (no year or number, no MAA logo). — [math-explainer SKILL.md:16-18](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Actual titles (sample): "Can You Find All the Squares? | AMC 8-Style Level 5"; "Juice or Water? A Mixing Puzzle | AMC 8-Style Level 4"; "Keep the Girls Apart | AMC 8-Style Level 4"; "Square AND Cube? | AMC 8-Style Level 4"; "Break a Stick Twice: What Are the Odds? | AMC 10-Style Level 4". Title lengths across 83 explainers: median 56, max 79 chars. Several titles give no clue to the topic ("Does It Hold the Center?", "Where Do the Lines Cross?", "The Number You Can Never Make"). — `/home/brad/code/vnt_video/videos/*/meta.json`
- Template drift (uncommitted working-tree change): incircle-radius-4 → "AMC 10B Practice: A Circle of Radius 4 — How Big Can the Triangle Get?". integer-roots-12b changed from "When Are Both Roots Integers? x² + bx + 12b | AMC 10-Style Level 4" to "AMC 10B Practice: When Are Both Roots Integers? x² + bx + 12b". Both descriptions gained a first line "AMC 10B is Nov 13 — 2 tools you need: …", and both have a `pinned_comment` ("Taking the 10B Friday? Comment your answer before you watch."). — `git diff videos/2026-11-01-integer-roots-12b/meta.json`; [/home/brad/code/vnt_video/videos/2026-11-01-incircle-radius-4/meta.json](/home/brad/code/vnt_video/videos/2026-11-01-incircle-radius-4/meta.json)
- Contest guide titles: "AMC 10 Scoring and Strategy: Why 14 Right Can Beat 16"; "AMC 8 Explained: Format, Scoring and Test-Day Strategy". — `/home/brad/code/vnt_video/videos/2026-11-05-amc{8,10}-guide/meta.json`
- Description body example (dot-grid): "20 dots, and most kids find 20 squares. But there are more hiding in there! Vantee shows two ways…", then 10 chapter lines, then "Sound effects: Freesound (CC0)." The credits line appears in only 58 of 83 explainer descriptions (e.g. broken-stick lacks it). — `/home/brad/code/vnt_video/videos/2026-10-29-dot-grid-squares/meta.json`, `/home/brad/code/vnt_video/videos/2026-11-07-broken-stick/meta.json`
- Footer auto-appended to every upload: "Want full AMC 8 and AMC 10 practice? Vantee has many more questions like this one, with a tutor that helps step by step. Parents and students, try it at https://www.vantee.ai/?utm_source=youtube&utm_medium={video|short}&utm_campaign={slug}", plus the MAA trademark / non-affiliation disclaimer. — [youtube.py:162-171,278,319](/home/brad/code/vnt_video/tools/youtube.py)
- Upload snippet: title cut at 100 chars, `<`/`>` replaced, `categoryId` "27" (Education), `defaultLanguage`/`defaultAudioLanguage` "en", privacy public by default, `selfDeclaredMadeForKids` false unless env `YOUTUBE_MADE_FOR_KIDS=1`. — [youtube.py:179-184](/home/brad/code/vnt_video/tools/youtube.py)
- Tags default: [contest, "math competition", "math olympiad", "problem solving", "Vantee", "math for kids"], or `meta.tags` if set (only the 2 guides and the booth video set it). — [youtube.py:114-116](/home/brad/code/vnt_video/tools/youtube.py)
- Shorts upload with `tags(meta)`, the full video's top-level tags. `short.tags` (e.g. ["AMC 10", "Math Challenge", "MathTok", "Math Puzzle"]) are TikTok hashtags only. — [youtube.py:319](/home/brad/code/vnt_video/tools/youtube.py), [math-short SKILL.md:89](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md)
- Short title: "<hook-style title, ≤ 60 chars> #Shorts" ("#Shorts" appended if missing). Short description: 1–2 lines, then "Full lesson with two solutions and every trap: {full_video_url}", then "#math #amc10 #mathpuzzle", then the footer. Sample short titles: "Think it's 81? Biggest perimeter with a radius-4 circle #Shorts", "Add water and it gets STRONGER?! #Shorts", "Think this ladder is 15 ft? Nope! #Shorts", "Color the grid: how many ways? #Shorts". — [math-short SKILL.md:84-86](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md), [youtube.py:318](/home/brad/code/vnt_video/tools/youtube.py), `/home/brad/code/vnt_video/videos/*/meta.json`
- Thumbnail process: `render.sh` grabs one frame `ffmpeg -ss <poster_seconds> -i video.mp4 -frames:v 1 poster.jpg` (default 30 s; the skill says "a still of the question scene"). No designed thumbnail, text overlay or face. — [render.sh:10,43](/home/brad/code/vnt_video/.claude/skills/math-explainer/scripts/render.sh), [math-explainer SKILL.md:269](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Observed poster (incircle-radius-4, 1920×1080): the question scene with paragraph text, choice chips A–E, triangle figure, chapter pill "The question", level badge, and the burned-in caption "Your choices: forty-two, sixty, eighty-one…" across the bottom. — `/home/brad/code/vnt_video/videos/2026-11-01-incircle-radius-4/poster.jpg`
- `poster.jpg` exists for every rendered video (missing only for the 9 zh folders with no video.mp4).
- Upload: `put()` calls `thumbnails/set` with poster.jpg for full videos. On failure it only prints "thumbnail not set" to stderr ("custom thumbnails need a phone-verified channel"), and meta.json records nothing. `upload_short` passes no thumbnail. — [youtube.py:192-197,278,319](/home/brad/code/vnt_video/tools/youtube.py)
- WeChat Channels covers (3:4 and 4:3) do have a designed template (`studio/src/Cover.tsx`, `COVERS`). YouTube has no equivalent. — [/home/brad/code/vnt_video/CLAUDE.md](/home/brad/code/vnt_video/CLAUDE.md) ("WeChat Channels covers")
- Pinned comment: optional `meta.pinned_comment`, shown as a copy row on the site. It's posted and pinned by hand. Present on 2 videos only (incircle-radius-4, integer-roots-12b). — [/home/brad/code/vnt_video/CLAUDE.md](/home/brad/code/vnt_video/CLAUDE.md), [site/index.html:141](/home/brad/code/vnt_video/site/index.html)
- YouTube quiz Post: a copy-paste row generated by `quiz_post()` (question, 4 of 5 choices, ≤350-char explanation, video link), since the API can't create Posts. Used once (geometric-triangle). — [youtube.py:248-265](/home/brad/code/vnt_video/tools/youtube.py)
- Playlists: full videos go to "AMC 8/AMC 10-Style Practice Problems, Explained". Shorts go to "AMC 8/AMC 10 Math Challenges" in challenge order. 4 playlist ids are stored. — [youtube.py:125-159](/home/brad/code/vnt_video/tools/youtube.py), [/home/brad/code/vnt_video/videos/playlists.json](/home/brad/code/vnt_video/videos/playlists.json)

### Inferences
- In line with common practice: question-style curiosity titles, chapters in descriptions, a UTM-tagged CTA, Education category, playlists for binge sessions, and a pinned-comment prompt starting to appear.
- Likely against common practice: the thumbnail is an unedited, text-dense frame with a caption bar. It has no big readable hook text, no contrast or zoomed figure, and doesn't follow the short's strong "Think it's 81?" visual. The ` | AMC 8-Style Level N` suffix takes up the end of the title, and "Level N" is an internal difficulty that searchers don't type. Several titles carry no searchable topic words. Tags are identical across videos (YouTube treats tags as minor anyway). The first visible description line is kid copy, not search keywords.
- The description's first line sometimes makes an unsupported statistic claim ("most kids find 20 squares"), which conflicts with the short skill's rule against invented statistics (see Q5).

### Gaps
- Can't tell from the repo whether any custom thumbnail is live on YouTube (failures aren't recorded, and channel phone-verification status is unknown).
- No CTR or impressions data to compare title styles (e.g. the new "AMC 10B Practice:" prefix vs "| AMC 10-Style Level 4").

## 4. Publishing cadence and counts so far

### Takeaway
Publishing started 2026-11-01. By 2026-11-09 the channel has 18 full uploads (15 quiz explainers, 2 contest guides, 1 booth/intro video) and 14 YouTube Shorts. Two of these (incircle full plus short) are scheduled for 18:30 PT today and not yet live. Off YouTube: 1 TikTok, 1 YouTube quiz Post, 2 WeChat Channels videos. That's about 1–2 full videos a day; since ~11-04 each short goes up at the same minute as its full video. 68 English explainers (3 "ready": consecutive-sums, geometric-144, integer-roots-12b; 65 draft) plus their shorts are rendered but unpublished. The 15 published explainers are 13 "ready" and 2 still marked draft.

### Cited Findings
Chronological post log (from `posts[].published_at` / `scheduled_at` in `/home/brad/code/vnt_video/videos/*/meta.json`; "sched" = scheduled via `status.publishAt`):
- 11-01 00:20–00:28 PDT: FULL geometric-triangle, hill-average-speed, pizza-pasta-soup, dot-grid-squares (batch of 4)
- 11-01 10:38 / 11:02: FULL plus SHORT triangle-in-square; 11:05 FULL ant-on-prism
- 11-02 06:59: SHORT ant-on-prism
- 11-03 10:58: SHORT geometric-triangle (the republished one); 19:15 FULL ladder-over-box
- 11-04 18:55: FULL plus SHORT circles-through-grid-points
- 11-05 11:14: FULL plus SHORT lattice-triangle-10; 18:30 SHORT dot-grid-squares (sched); 20:33 FULL amc10-guide and amc8-guide
- 11-06 09:40: SHORT amc10-guide; 18:30 SHORT ladder-over-box (sched); 18:55 FULL plus SHORT domino-tromino-2x6 (sched)
- 11-07 11:30: FULL plus SHORT polygon-center (sched); 18:30 FULL vantee-intro (sched); 18:55 FULL plus SHORT fibonacci-2024 (sched)
- 11-08 07:11: FULL plus SHORT juice-mix; 11:00 FULL plus SHORT hexagon-triangles (sched); 16:35/16:36 WeChat Channels geometric-triangle-zh, circles-through-grid-points-zh
- 11-09 18:30: FULL plus SHORT incircle-radius-4 (sched, scheduled at 10:04 today, so not yet public at time of audit)
- No date recorded: "YouTube quiz post" for geometric-triangle, TikTok for geometric-triangle short
- Scheduling is supported from the CLI and the site (local time → `status.publishAt`, uploaded private). Each post keeps `published_at` plus `scheduled_at` "to find the best time to publish". — [youtube.py:86-106,185-187](/home/brad/code/vnt_video/tools/youtube.py)
- Full videos with no short on YouTube yet: hill-average-speed, pizza-pasta-soup, amc8-guide (short.mp4 exists for all three). — meta.json
- Status inconsistencies: triangle-in-square and ant-on-prism are published but still `status` draft. vantee-intro's description says "Not a channel upload: don't publish from the site", yet it has a scheduled YouTube post (11-07 18:30) and a youtube_id. — `/home/brad/code/vnt_video/videos/2026-11-06-vantee-intro/meta.json`
- Backlog: 83 English explainers, of which 15 published; status counts across all 83 = 16 "ready", 67 "draft" (incl. published ones still marked draft). By contest: 57 AMC 8, 26 AMC 10. 49 `-zh` folders, 9 with no rendered video (5 have meta.json plus a render.log; 4 hold only script.md). — script over meta.json
- Production cadence (git log): first explainer committed 2026-10-29; batches of 10–20 videos per commit through 11-02; guides and booth video 11-06. — `git log` in `/home/brad/code/vnt_video`

### Inferences
- Publish times so far are spread out (00:20, 07:11, 10:38, 11:00, 18:30, 18:55, 20:33 PT). Scheduled slots cluster at evenings (18:30/18:55) and late mornings (11:00/11:30). The dataset is too small to pick a best time.
- Uploading the full video and its short at the same minute uses each short once, right at the full video's launch. Spacing shorts out could keep driving traffic to older long-form videos. That's a judgment.
- The ~68-video backlog means production volume isn't the limit; packaging and distribution are.

### Gaps
- No views, subscribers or watch time recorded anywhere, so cadence can't be tied to results.
- Not known whether the scheduled publishes all went live as planned (only the intent is recorded).

## 5. Alignment with / departures from common YouTube practices (as found in the code)

### Takeaway
Strong on teaching quality, accessibility and technical hygiene (verified math, chapters, captions, loudness, playlists, scheduling, safe zones, loops). Weak or missing on packaging and growth: no designed thumbnails, a self-intro in every hook, no long-form CTAs or end screens, manual and untracked Related-video links, no synthetic-content flag set via the API, made-for-kids defaulting to false, and no analytics. The intro/hook rules also contradict each other across the two skills.

### Cited Findings
- Correctness pipeline: independent solve, Python brute-force `verify.py`, word-by-word TTS transcript check, name-pronunciation check, and an independent Opus review of math, spoken-vs-shown sync and a "kid test". — [math-explainer SKILL.md:13-15,96-104,175-193,282-290](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Conflicting hook guidance: the explainer skill suggests the hook "most kids get 26 here…" ([SKILL.md:108](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)). The short skill says "Never invent a statistic ('most kids…')" ([math-short SKILL.md:21](/home/brad/code/vnt_video/.claude/skills/math-short/SKILL.md)). Shipped intros use it: dot-grid "Most kids find twenty", juice-mix "Lots of kids find the juice." — timeline.json under `/home/brad/code/vnt_video/studio/public/`
- AI voice disclosure: `put()` sends no altered/synthetic-content field, and none of tools/, site/ or the skills mention a YouTube AI disclosure. The only AI-disclosure instruction is the manual China step: "tick the 'AI-generated content' declaration (内容由AI生成)". — [youtube.py:179-184](/home/brad/code/vnt_video/tools/youtube.py), [site/index.html:159](/home/brad/code/vnt_video/site/index.html), [/home/brad/code/vnt_video/CLAUDE.md](/home/brad/code/vnt_video/CLAUDE.md)
- Made for kids: `selfDeclaredMadeForKids` is false unless an env flag is set, while the stated audience is 10–14 year olds and the footer comment says "viewers are kids". — [youtube.py:162,183](/home/brad/code/vnt_video/tools/youtube.py), [math-explainer SKILL.md:8](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Music: none on long-form by user decision; low-volume hip-hop bed on shorts. — [math-explainer SKILL.md:34](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md), [Short.tsx:75](/home/brad/code/vnt_video/studio/src/lib/Short.tsx)
- Branding is static (logo watermark, no motion, no mascot avatar or face). — [math-explainer SKILL.md:214](/home/brad/code/vnt_video/.claude/skills/math-explainer/SKILL.md)
- Multi-platform: China cut with no links or domain (Xiaohongshu / WeChat Channels). TikTok is manual, and the API path only posts to private accounts until audit. — [/home/brad/code/vnt_video/CLAUDE.md](/home/brad/code/vnt_video/CLAUDE.md)
- Distribution into the Vantee app (offline Remotion Player bundles), so each video doubles as in-product content. — [/home/brad/code/vnt_video/CLAUDE.md](/home/brad/code/vnt_video/CLAUDE.md) ("Vantee app delivery")

### Inferences
- In line with practice: chapters, captions, -14 LUFS, Education category, playlists (incl. numbered Shorts series), scheduling, a comment prompt in shorts, a looping short, a short-to-long link via description, pinned comments (just started), quiz Posts (once), UTM tracking on links.
- Departures likely to matter most for growth, in rough order: (1) thumbnails are raw frames and shorts have none, (2) titles end in an internal "Level N" label and some lack search terms, (3) long-form has no comment, subscribe or next-video CTA and no end-screen window, (4) the self-intro and ~17 s before the full question, (5) Related video is a manual step that isn't tracked, (6) shorts reuse generic full-video tags, (7) no YouTube altered/synthetic-content flag is set via the API, though the voice is AI TTS. Whether a disclosure is *required* for a TTS narrator over animated math wasn't researched here. (8) The made-for-kids setting is false; implications not researched here.

### Gaps
- Unknown whether AI disclosure, made-for-kids, Related video, end screens or thumbnails were set by hand in YouTube Studio; the repo only shows what the API path does.

## 6. Data that is absent

### Takeaway
The repo holds no performance data at all: no views, CTR, retention, subscribers, comments or traffic sources for any platform. The only measurement hooks are UTM parameters on the vantee.ai link and recorded publish times.

### Cited Findings
- CLAUDE.md states it directly: "No stats automation." — [/home/brad/code/vnt_video/CLAUDE.md](/home/brad/code/vnt_video/CLAUDE.md) (Publishing section, TikTok paragraph)
- `youtube.py` uses only upload, thumbnails, playlists and video-status endpoints. It never calls the YouTube Analytics API and never reads statistics. Grep for "analytics|viewCount|statistics" in tools/ finds nothing. — [youtube.py](/home/brad/code/vnt_video/tools/youtube.py)
- UTM tagging: `utm_source=youtube&utm_medium=video|short|playlist&utm_campaign=<slug>`. Results would live in Vantee's web analytics, not in this repo. — [youtube.py:165](/home/brad/code/vnt_video/tools/youtube.py)
- `published_at` / `scheduled_at` are kept "to find the best time to publish", but nothing joins them to outcomes. — [youtube.py:87](/home/brad/code/vnt_video/tools/youtube.py)

### Inferences
- Any growth recommendation will have to rest on external best-practice evidence until an analytics pull exists. The YouTube Analytics API would need an extra OAuth scope beyond the current `youtube` scope ([youtube.py:29](/home/brad/code/vnt_video/tools/youtube.py)); this wasn't checked here.

### Gaps
- Channel-level facts are unknown: subscriber count, phone verification (needed for custom thumbnails), monetization status, current Studio defaults.
- vantee.ai UTM conversion data wasn't looked at (it lives outside this repo).
