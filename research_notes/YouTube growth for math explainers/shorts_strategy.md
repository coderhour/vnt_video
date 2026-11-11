# YouTube Shorts strategy for math/educational channels (Shorts as teasers for long-form), 2025–2026

Source-quality legend: **[OFFICIAL]** = YouTube Help / YouTube Blog / YouTube staff on Creator Insider. **[3P]** = third-party vendor/creator analysis (vidIQ, AIR Media-Tech, quso.ai, Subscribr, OutlierKit, etc.), not verified by YouTube. Most of the quantitative data in this space is [3P] marketing content.

## 1. Which Shorts signals matter (viewed vs. swiped away, % viewed, loops, length)?

### Takeaway
Officially, YouTube says only that a Short is shown to a small seed audience and its reach grows or shrinks with how those viewers respond ("the audience is the algorithm"). The one Shorts-specific metric YouTube surfaces is "viewed vs. swiped away." Third-party length data clearly favors short Shorts: the medians peak around 11–30 s and decline past 30 s, even though Shorts can now be 3 minutes long. A 30–40 s target is defensible for a teaser that has to set up a problem, but it sits past the median-views peak.

### Cited Findings
- [OFFICIAL] YouTube Help describes the Shorts analytics metric "Viewed vs. swiped away" as "the percentage of times that viewers viewed your Shorts versus swiped away" — [YouTube Help, Shorts analytics](https://support.google.com/youtube/answer/12942217?hl=en&co=YOUTUBE._YTVideoType%3Dshorts) (as quoted by [OutlierKit](https://outlierkit.com/resources/youtube-shorts-algorithm/))
- [OFFICIAL] Todd Sherman (Shorts product lead), on Creator Insider (Aug 2023, **older**): the system tries to "find a set of people that may enjoy your video" and expands or tapers reach from their response; "The audience is the algorithm"; a view should "encode for your intent of watching that thing" — [Creator Insider video](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=388s), via [OutlierKit](https://outlierkit.com/resources/youtube-shorts-algorithm/)
- [OFFICIAL] Sherman: in the Shorts feed "the element of a conscious choice on the part of the viewer is missing" (there's no click), so the watch-or-swipe decision is what the system reads — via [vidIQ](https://vidiq.com/blog/post/youtube-shorts-algorithm/)
- [OFFICIAL] YouTube has not published Shorts ranking signals or their weights. No official source covers loops or retention thresholds as ranking factors — [OutlierKit](https://outlierkit.com/resources/youtube-shorts-algorithm/)
- [OFFICIAL] View counting: from Mar 31, 2025, a Short's view counts every time it starts or replays, with no minimum watch time. The old metric became "engaged views" (Advanced Mode), and YPP eligibility and revenue still use engaged views — [TechCrunch](https://techcrunch.com/2025/03/26/youtube-is-changing-how-youtube-shorts-views-are-counted); [Tubefilter](https://www.tubefilter.com/2025/03/26/youtube-shorts-views-counting-stats/)
- [OFFICIAL] From Aug 24, 2026, a view counts from the first frame on every format, long-form included. CTR, average view duration and retention are still calculated from engaged views, and "recommendations and the algorithm are unchanged" — [YouTube Blog, Aug 19, 2026](https://blog.youtube/inside-youtube/engaged-views-youtube-explained/)
- [OFFICIAL] Since Oct 15, 2024, square or vertical uploads up to 3 minutes count as Shorts — [YouTube Help](https://support.google.com/youtube/answer/15424877?hl=en)
- [OFFICIAL] Sherman on length: "To what length do you need to tell your story?" He gave no ideal length — [Creator Insider](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=183s) via [OutlierKit](https://outlierkit.com/resources/youtube-shorts-algorithm/)
- [3P] quso.ai, 108,138 Shorts each live at least 14 days, median views by length: 0–10 s 514; **11–20 s 901 (peak)**; 21–30 s 542; 31–45 s 347; 46–60 s 188; 61–90 s 186; 90 s+ 51. Its recommendation is roughly 11–30 s, going longer only when the content needs it — [quso.ai](https://quso.ai/research/youtube-shorts-length)
- [3P] Nate Black's analysis of 35B Shorts views (reported by vidIQ) found 13 s and 60 s Shorts performing best and the first 3 s critical — [vidIQ](https://vidiq.com/blog/post/youtube-shorts-algorithm/). This conflicts with a reported Inflow Network study of 5,400 Shorts in which 50–60 s Shorts got about 22x the views of those under 10 s — summarized in search results from [Piktochart](https://piktochart.com/blog/how-long-youtube-shorts/) / [Shortimize](https://www.shortimize.com/blog/video-length-sweet-spots-tiktok-reels-shorts). **The length studies conflict.**
- [3P] Viewed-vs-swiped benchmarks vary by source: "aim 75–80% viewed"; "70–90% performed best (3.3B Shorts analysis)"; "60–70%, below 50% the push stops." The 50% cutoff is unverified — [Buffer](https://buffer.com/resources/youtube-shorts-algorithm/), [Metricool](https://metricool.com/youtube-shorts-algorithm), [Subscribr](https://subscribr.ai/youtube-strategy/youtube-shorts-analytics-metrics-growth)
- [3P] Average % viewed on Shorts includes replays, so it can exceed 100% (e.g., "150% for 1-min, 300%+ for 15-sec") — [Thunderbit](https://thunderbit.com/blog/youtube-shorts-statistics-engagement-metrics). No reliable APV benchmark exists for 1–3 minute Shorts — [Bytecap](https://www.bytecap.io/research/youtube-shorts-retention-benchmarks)

### Inferences
- Because views now count on first frame, raw Shorts view counts are inflated. Compare Shorts using engaged views, viewed-vs-swiped and APV.
- For a 30–40 s math teaser (the current `math-short` spec), the data suggests trimming toward 20–30 s where the setup allows. Short length also makes loops easier, since APV above 100% on a short clip probably helps.
- 3-minute Shorts exist, but nothing shows they distribute well. A full solution belongs in long-form.

### Gaps
- No official statement on the weight of loops/replays, completion rate, or comments/shares in Shorts ranking.
- No education- or math-specific length or retention benchmarks found.

## 2. Hook patterns, on-screen text, captions, sound/music, looping endings

### Takeaway
YouTube's official guidance on hooks is thin. The consistent advice from third parties is to make the question visible in the first 1–3 s, open a curiosity gap, caption everything for sound-off viewing, and loop the ending into the opening. For math puzzles, the proven pattern is a deceptively simple problem with a common wrong answer, which drives comment debates.

### Cited Findings
- [3P] First ~3 s decide retention; make the topic, payoff, question or visual clear immediately — [vidIQ](https://vidiq.com/blog/post/youtube-shorts-algorithm/) (citing Nate Black)
- [3P] Hook = "a single visual or claim" that "creates an open loop the viewer has to close," landing within the first ~24 frames — [Opus Clip](https://www.opus.pro/blog/youtube-shorts-hook-formulas)
- [3P] Make the ending loop by matching the last frame or line to the opening. Replays at 10–20% of views are called "a strong signal" (unverified) — summarized from [Klap](https://klap.app/blog/youtube-shorts-best-practices) / [Fluxnote](https://fluxnote.io/guides/increase-audience-retention-youtube-shorts)
- [3P] Captions and on-screen text are recommended because many viewers watch with sound off, though YouTube publishes no data on how much captions help — [VideoBGRemover blog](https://videobgremover.com/blog/youtube-shorts-best-practices)
- [3P] Viral "can you solve this" math Shorts reuse one formula: a short equation or pattern plus a challenge line ("99% fail"). Order-of-operations bait like "6 + 5 × 2" works because viewers argue in the comments — e.g., [example Short](https://www.youtube.com/shorts/S7hmXlRd2ZQ), [example Short](https://www.youtube.com/shorts/3PHjMeQxU4k)
- [3P] Puzzle Shorts "trigger comment-section debates as viewers rush to type their answers." The "85%+ completion" claim comes from a tool vendor's sales page — [PuzzleVid](https://puzzlevid.duhistudiokit.com/)
- [OFFICIAL] YouTube's own Shorts-to-long-form advice includes a spoken CTA in the final 5 s plus a visual cue, such as a downward gesture toward the link or a thumbnail overlay — [YouTube Blog, Jul 14, 2026](https://blog.youtube/creator-and-artist-stories/youtube-related-videos-traffic-guide/)

### Inferences
- The `math-short` skill's "trap-first hook + comment bait + word captions" design matches the third-party consensus. The one tension is YouTube's own advice to put a CTA in the last 5 s, which conflicts with a seamless loop. A workable compromise is a brief CTA plus a final frame that echoes the opening question.
- "Only geniuses can solve" clickbait is common, but it is low-trust for a brand aimed at parents and students. A specific trap ("most people answer 12, it's not 12") gets the same curiosity gap without hype.

### Gaps
- No official YouTube data on music, trending audio or captions for Shorts reach.
- No measured study of hook types for educational Shorts specifically.

## 3. The "Related video" link, pinned comments and description links

### Takeaway
The Related video link is YouTube's official bridge from Shorts to long-form, and YouTube promoted it again in July 2026. Its measured click-through is low; third parties report under 1% and sometimes about 0.05%. Third-party sources rate pinned comments higher at 1–3%, but there is no methodology behind that figure. Links in Shorts descriptions and comments have not been clickable since 2023.

### Cited Findings
- [OFFICIAL] Add a related video after upload: Studio → Content → the Short → Related video (Videos, Shorts or Live from your own channel). It shows as "a clickable link below your channel handle" in the Shorts player — [YouTube Help](https://support.google.com/youtube/answer/14075157?hl=en)
- [OFFICIAL] YouTube Blog (Jul 14, 2026), "How to convert YouTube Shorts views into long-form channel growth": (1) add a Related Video and match it to viewer intent (a quick tip links to the in-depth tutorial); (2) put a CTA in the final 5 s, spoken plus visual; (3) the long-form video should deliver the Short's promise in its first 5–10 s, with no slow logo or intro; (4) optionally test vertical live. The post gives no conversion numbers — [YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-related-videos-traffic-guide/)
- [OFFICIAL] Same post: three viewer segments are Shorts-only viewers, long-form viewers who also want quick clips, and Shorts browsers looking for new channels. Skipping Shorts means being "invisible to massive pockets of potential fans" — [YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-related-videos-traffic-guide/)
- [OFFICIAL/news, 2023, **older**] YouTube added Shorts-to-long-form linking in Aug–Sep 2023 and at the same time made links in Shorts comments and descriptions unclickable to fight spam — [Search Engine Journal](https://searchenginejournal.com/youtube-adds-shorts-links-limits-links-elsewhere/495463); [Tubefilter](https://tubefilter.com/2023/09/01/youtube-related-links-multi-format-creators-shorts-live-long-form/)
- [3P] Related-video conversion is reported "sometimes under 1%," and in some cases about 0.05%. The pinned-comment approach is claimed at 1–3%, with no methodology given — [Spotter community newsletter](https://spottercommunity.beehiiv.com/p/related-shorts) / [Subscribr](https://subscribr.ai/p/drive-traffic-shorts-to-long-videos)
- [3P] Case claim: one entertainment channel got +20% long-form views after linking Shorts. Shorts posted **within 3 days** of the long-form video drove more long-form views — [Spotter](https://spottercommunity.beehiiv.com/p/increase-views-from-related-shorts) (single anecdote)
- [3P] The publishing API reportedly does **not** support setting the related video, so it must be set by hand in Studio — [Vizard help](https://help.vizard.ai/en/articles/13643189-can-i-add-a-link-to-my-long-form-youtube-video-when-publishing-shorts-via-vizard)
- [3P] Adding the link at upload requires the one-time channel verification, which is not available for brand accounts or supervised accounts — [Gadgets To Use](https://gadgetstouse.com/blog/2023/10/10/add-related-video-to-youtube-short)

### Inferences
- For this repo, `tools/youtube.py` probably can't set the related video through the API (unverified; check the current Data API `videos` resource). A manual Studio step should go on the post-publish checklist, next to the pinned comment.
- Even at under 1% CTR, a Short at 100k views sends hundreds of targeted viewers to the full explainer. That works if the long-form video opens on the same question immediately, which is the official tip 3.
- Publishing the Short within about 3 days of the long-form video fits the existing "video + short" publish flow.

### Gaps
- No official or rigorous CTR data for Related video links. Pinned-comment links in Shorts are not clickable either, so the "1–3%" figure is doubtful. Its mechanism is probably viewers searching the title.

## 4. Do Shorts audiences convert to long-form? Help or hurt? Same channel or a separate one?

### Takeaway
Shorts convert viewers to subscribers far less efficiently than long-form (about 505 vs. about 106 views per subscriber in one [3P] study), and audience overlap is low. Correlational data on 18k channels says **education** channels that mix Shorts (around 25–35% of uploads) have more subscribers than long-only channels, while **science/tech** channels lean long-only. Nothing found shows Shorts causally hurting long-form. YouTube says the two formats are recommended by separate systems (the quote is not primary-verified).

### Cited Findings
- [3P] AIR Media-Tech, 18,000 English channels, Mar 2025–Mar 2026, correlational. **Education: the mix leads.** At 100K–1M subscribers the median is 113,000 (mix) vs. 82,200 (long-only), about 37% more; at 1M–10M it is 395k vs. 354k. **Science/tech: long-only leads** (1M–10M: 284k vs. 244.5k; at 100K–1M it is about even). Sweet spot is 25–40% Shorts (education about 25–35%). Above 55% Shorts, long-form tends to decline. Abrupt pivots of more than 30 pp underperformed — [AIR Media-Tech, May 28, 2026](https://air.io/en/audience-growth/do-youtube-shorts-help-your-long-form-videos-grow-data-from-18000-channels)
- [3P] vidIQ, 200,000 channels created in 2025 that reached 1k subscribers: long-form needs about 106 views per subscriber vs. about 505 for Shorts (4.7x). The transcript wording is inverted, but the 4.7x ratio confirms this reading. Median uploads to reach 1k subscribers: 46 (at least 95% long-form), 90 (at least 95% Shorts), 108 (mixed). vidIQ advises treating Shorts as a "content bridge": a teaser for a same-topic long video that is still useful on its own — [vidIQ / Rosetta transcript](https://rosetta.to/u/vidiq/the-fastest-way-to-1k-subs-in-2026)
- [3P] Overlap between a channel's Shorts and long-form viewers is "typically low… as low as around 10%" — [Subscribr](https://subscribr.ai/youtube-strategy/convert-shorts-viewers-to-subscribers) (unverified)
- [Academic, 2024, **older**] arXiv study of 250 creators found no statistically significant drop in long-form likes or comments after creators started Shorts — [arXiv 2402.18208](https://arxiv.org/html/2402.18208v2)
- [3P] Shorts RPM is 3–14% of long-form RPM in most niches (274 channels) — [AIR Media-Tech](https://air.io/en/youtube-hacks/should-you-chase-shorts-views-or-double-down-on-long-form-for-channel-growth)
- [3P] Claim that Todd Sherman said Shorts and long-form are served by separate recommendation systems; not confirmed from a primary source — [MarketMaker](https://marketmakermgmt.com/blog-list2/do-youtube-shorts-hurt-your-channel)
- [3P] Report that 2025 home-feed UI changes cut long-form slots (often 2 long-form recommendations, with a Shorts shelf in row 2). Anecdotal — [PPC Land](https://ppc.land/youtubes-home-feed-quietly-kills-long-form-video-discovery/)

### Inferences
- A Vantee channel is "education" (AMC prep), the niche where a mix correlates with growth. A 1:1 pairing of one Short per long-form video gives about 50% Shorts, which is above the 25–40% sweet spot and approaching the 55% "decline" zone. Treat that as a caution: correlational and not specific to math.
- Keeping Shorts on the same channel fits the teaser purpose, because the Related video link only points to your own channel's videos. No evidence was found for or against a separate Shorts channel for small education channels.
- Subscribers are worth more from long-form. Judge Shorts by long-form views and app sign-ups they drive, not by Shorts views.

### Gaps
- No math- or competition-math-specific conversion data.
- No rigorous 2025–2026 study isolating the causal effect of Shorts on the same channel's long-form.
- No data on separate vs. same channel for teaser Shorts.

## 5. Posting frequency, scheduling time, titles and hashtags

### Takeaway
YouTube says there is no volume threshold or posting-time optimization in the Shorts system, and hashtags are optional. Third parties tie long-run Shorts growth to volume (about 200+ Shorts), but quality per Short still matters. Titles and descriptions mostly help Search and other non-feed surfaces.

### Cited Findings
- [OFFICIAL, 2023, **older**] Sherman: "There is nothing in our systems that's like when you hit the five video or 10 short threshold per day." Fewer, better Shorts beat volume. Posting time: "It's not something that we think about optimizing for." Hashtags: "Are they required? No, of course not." Deleting and reposting a Short "risk[s]… that that gets seen as spam" — [Creator Insider](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=345s) via [OutlierKit](https://outlierkit.com/resources/youtube-shorts-algorithm/)
- [3P] Channels with at least 200 Shorts tended to see steady view growth (Nate Black). Metadata helps Search and non-feed surfaces; #Shorts isn't required; avoid keyword stuffing — [vidIQ](https://vidiq.com/blog/post/youtube-shorts-algorithm/)
- [3P] Suggested cadence for mixed channels is 1–2 Shorts/week alongside 3–5 long-form videos — [AIR Media-Tech](https://air.io/en/audience-growth/do-youtube-shorts-help-your-long-form-videos-grow-data-from-18000-channels)
- [3P] Shorts posted within 3 days of the related long-form video drove more long-form views — [Spotter](https://spottercommunity.beehiiv.com/p/increase-views-from-related-shorts)

### Inferences
- Scheduling time matters little for the Shorts feed itself. Schedule the Short for after the long-form video is public, so the Related video link and `{full_video_url}` work at launch, within about 3 days.
- Searchable titles that name the contest and topic (e.g., "AMC 10 incircle trap") help Search. The feed relies on the video itself.
- Republishing, which this repo does as a new Short with the old one set private, is close to the "delete and repost" behavior Sherman flagged as spam risk. Use it sparingly.

### Gaps
- No 2025–2026 official statement updating the 2023 frequency and time guidance.

## 6. Examples of successful math/puzzle Shorts channels and what they do

### Takeaway
I found little well-documented case-study material. Visible successful formats are (a) "can you solve this" single-problem Shorts with a debate-bait answer and (b) bite-size worked geometry/algebra problems from teacher-creators such as Andy Math. I found no interviews or published metrics.

### Cited Findings
- [3P stats] Andy Math: about 440K subscribers, about 2K videos (heavy Shorts output of short geometry/algebra puzzles), and links to andymath.com (data as of May 8, 2025; likely higher now) — [vidIQ stats](https://vidiq.com/youtube-stats/channel/UC6KhU3AMLHC-qv7tj0ZJduw)
- [3P] Typical viral math-Short format: a short equation or pattern plus a "can you solve it / 99% fail" challenge; order-of-operations questions drive comment debates — [example](https://www.youtube.com/shorts/S7hmXlRd2ZQ), [example](https://www.youtube.com/shorts/07tV648r92g), [example](https://www.youtube.com/shorts/YGCJLAfymGQ)
- [3P] Puzzle-adjacent long-form successes like Cracking the Cryptic (322M views, mostly long-form sudoku) show puzzle audiences will watch long solves — [Wikipedia](https://en.wikipedia.org/wiki/Cracking_the_Cryptic)
- [3P] AIR's science/tech advice: if making Shorts, keep each one self-contained — [AIR Media-Tech](https://air.io/en/audience-growth/do-youtube-shorts-help-your-long-form-videos-grow-data-from-18000-channels)

### Inferences
- Competition-math Shorts that pose one problem, show the trap answer, and ask viewers to comment their answer fit the proven format. Teasing "full solution + 2 other methods" in the linked video gives the bridge.

### Gaps
- No interviews or analytics from math Shorts creators (Andy Math, MindYourDecisions, etc.) were found. Other well-known channels (MindYourDecisions, BriTheMathGuy, SyberMath) were not checked within this research budget.

## 7. Cross-posting the same vertical to TikTok and Reels

### Takeaway
Upload a clean master file natively to each platform. Don't upload a file downloaded from another app (it carries that app's watermark). Instagram has said officially (2021–2024) that it de-recommends Reels with other apps' watermarks, while your own logo is fine. YouTube's Oct 2026 originality update penalizes re-uploading *other creators'* content, not your own clips.

### Cited Findings
- [OFFICIAL, 2021, **older**] Instagram makes Reels with visible marks from other apps (e.g., TikTok) less discoverable in recommendation surfaces. They still reach followers — [Tubefilter](https://tubefilter.com/2021/02/10/instagram-reels-with-tiktok-watermark-less-discoverable/)
- [OFFICIAL, 2024] Mosseri: editing in outside tools is not penalized, but third-party app watermarks are ranked lower, and your own logo is fine ("if it's your own logo, don't worry about it") — [Social Media Today](https://www.socialmediatoday.com/news/instagram-clarifies-including-your-own-logo-on-a-reel-is-ok/730852/); [RouteNote](https://routenote.com/blog/does-instagram-penalise-tiktok-or-capcut-content/)
- [OFFICIAL, 2022, **older**] Instagram's ranking prioritizes original content over reposts in the Reels tab and feed — [TechCrunch](https://techcrunch.com/?p=2551088) (via search summary)
- [OFFICIAL, older] YouTube watermarks Shorts that are downloaded from YouTube, which discourages cross-posting them to TikTok — [iDownloadBlog](https://www.idownloadblog.com/?p=915943)
- [OFFICIAL] YouTube, Oct 1, 2026: Shorts recommendations "further prioritize original content and reduce the reach of content re-uploaded from other creators." The change affects recommendations, not monetization, and the policy targets other creators' content (your own clips are not covered) — [YouTube Help Community](https://support.google.com/youtube/blog/470890423/prioritizing-original-content-on-shorts?hl=en); [Search Engine Journal](https://searchenginejournal.com/youtube-original-shorts-reposted-clips-reach/591774/); [Social Media Today](https://socialmediatoday.com/news/youtube-updates-shorts-algorithm-to-put-more-focus-on-original-content/831976); [OutlierKit](https://outlierkit.com/resources/youtube-shorts-original-content-update/)
- [3P] Best practice is to export one clean master and upload it natively to each platform (or via a scheduler that uses the original file). No official penalty figure for cross-posting a clean file exists — [PostEverywhere](https://posteverywhere.ai/blog/does-cross-posting-hurt-your-reach); [SocialKit](https://socialk.it/en/blog/tiktok-watermark-reach-guide)
- [3P, unverified] Claim that Meta now demotes and demonetizes accounts that repeatedly cross-post unoriginal content — [ChatCut](https://chatcut.io/blog/social-media-promo-video-2026)

### Inferences
- The repo's current flow fits this best practice: render `short.mp4` once and upload it by hand to TikTok and via the API to YouTube. The burned-in vantee.ai pill is "your own logo," which is fine per Mosseri.
- Platform-specific CTAs differ. YouTube has a clickable Related video, while TikTok and Reels need "link in bio" or a search CTA. China platforms need no links at all (already handled).

### Gaps
- No official TikTok statement found on penalizing other-platform watermarks or cross-posted content. TikTok's originality rules are only described second-hand.
