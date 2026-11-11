# Xiaohongshu (小红书 / RED) platform rules for an AI-voice AMC math explainer account (2025–2026)

Research date: 2026-11-09. Most sources are Chinese tech press (IT之家, 网易, 搜狐, 新浪) reporting on official announcements. I did not fetch Xiaohongshu's own announcement pages (they are in-app). Each item is marked **[official text]** (a regulation or official document read directly), **[press report of official rule]**, or **[third-party / folklore]** (agency blogs and creator tips).

## 1. AI-generated content labeling (CAC 标识办法 + Xiaohongshu implementation)

### Takeaway
A video narrated by an AI voice (TTS) counts as AI-synthesized content under the CAC Measures, which effective 2025-09-01 require the user to "主动声明" it with the platform's labeling tool. On Xiaohongshu, that means ticking 设置 → 内容类型声明 → 笔记含AI合成内容 for every post. If you don't, the platform can detect and label the note itself. Xiaohongshu's 2026 rules penalize AI 托管 (automated posting and interaction), AI fabrication and low-quality template content, not honest AI-assisted creation. One official statement says disclosure doesn't hurt distribution, but it was made about virtual-human accounts.

### Cited Findings
- **[official text]** The 《人工智能生成合成内容标识办法》 was issued jointly by 网信办, 工信部, 公安部 and 广电总局 and took effect 2025-09-01 — [新华网](https://www.news.cn/tech/20250314/f8b96305ff274e0cb70031c2819092ee/c.html)
- **[official text]** Art. 3: AI-generated or synthesized content "是指利用人工智能技术生成、合成的文本、图片、音频、视频、虚拟场景等信息". Audio is explicitly in scope, so TTS narration is covered — [光明网 full text](https://m.gmw.cn/2025-03/15/content_1303991695.htm)
- **[official text]** Art. 4 explicit labels (obligations on the generating service, e.g. the TTS provider): audio gets "在音频的起始、末尾或者中间适当位置添加语音提示或者音频节奏提示等标识". Video gets "在视频起始画面和视频播放周边的适当位置添加显著的提示标识" — [光明网](https://m.gmw.cn/2025-03/15/content_1303991695.htm)
- **[official text]** Art. 6: the distribution platform checks file metadata for implicit labels. If the user declares AI content, it labels the post "可能为生成合成内容". If it detects traces without a declaration, it labels the post "疑似生成合成内容" — [光明网](https://m.gmw.cn/2025-03/15/content_1303991695.htm)
- **[official text]** Art. 10 (user obligation): "用户使用网络信息内容传播服务发布生成合成内容的，应当主动声明并使用服务提供者提供的标识功能进行标识". Removing or hiding labels is prohibited — [光明网](https://m.gmw.cn/2025-03/15/content_1303991695.htm)
- **[official text]** Art. 13 is the only penalty clause. It defers to the regulators ("依据职责…予以处理") and sets no specific fines — [光明网](https://m.gmw.cn/2025-03/15/content_1303991695.htm)
- **[third-party summary of official announcement, ~2025-08-31]** Xiaohongshu's announcement for the 9-01 rule tells creators to label any note containing AI-synthesized content at publishing: 设置 → 内容类型声明 → 勾选「笔记含AI合成内容」. It also says "平台有权…添加显式或隐式标识，用户不得恶意删除、篡改或隐藏相关标识" — [X post summarizing the announcement](https://x.com/frxiaobei/status/1962015521777537506); [网易](https://www.163.com/dy/article/K86VAJIQ053144S4.html)
- **[press report]** The label shows next to the note's publish time and IP location — [财联社 实测](https://www.cls.cn/detail/2133981) (via search snippet)
- **[press report of official rule, 2026-04-27]** 《AI 治理规则》: creators should declare both fully AI-generated and AI-polished content. Undeclared AI content that the platform identifies "将统一添加标识", and there is an appeal channel. Violations get graded measures such as 限制分发 and 封禁账号 — [IT之家](https://www.ithome.com/0/944/156.htm); [搜狐/太平洋](https://www.sohu.com/a/1015736769_223764)
- **[press report]** The April 2026 rules list "AI造假" (cloning someone else's voice or face, fake personas, fabricated experiences). They also ban mass-producing homogeneous content from templates, sensational clickbait visuals, and using AI to run accounts automatically or impersonate real users. Compliant AI content that adds information, including "科普教育", is named as getting traffic support — [搜狐](https://www.sohu.com/a/1015736769_223764)
- **[press report]** A platform official said that in 2026 Xiaohongshu labels over 300,000 notes per day — [腾讯新闻](https://news.qq.com/rain/a/20260428A05TXI00) (via search snippet; not on the fetched page)
- **[press report of official rule, 2026-08-06]** Updated 《AI 治理规则公告》: it again says unlabeled AI content "将由平台统一识别、添加标识". It opposes synthesizing another person's voice or face. AI virtual-human accounts must disclose on their profile and show an "AI虚拟人" tag. The report states that proactive disclosure does not reduce distribution, but that statement is in the virtual-human context. It also bans cloud AI tools and phone scripts for running accounts, teaching how to evade review, and fabricating hot topics — [IT之家](https://www.ithome.com/0/987/042.htm); [凤凰网](https://i.ifeng.com/c/8vONpzWJByU) (says undeclared virtual-human accounts "或被限流")
- **[press report of official rule, 2026-03-10, effective immediately]** Crackdown on AI 托管 accounts, which the notice describes as notes generated and published automatically by technology and simulated human interaction in comments, DMs and group chats. An ordinary account that occasionally uses AI hosting to write, post or interact gets "警告、限制内容分发等梯度处理措施". The notice urges "合理使用 AI 工具" without drawing the line exactly. Accounts registered, posting or interacting through AI hosting tools, or whose public notes are all AI-hosted, are banned — [IT之家](https://www.ithome.com/0/927/689.htm); [网易](https://www.163.com/dy/article/KNM642OP0519QIKK.html)
- **[press report, 2026-07-17]** Xiaohongshu disposed of 420,000 AI 托管 accounts. Fully automated accounts were banned, and semi-automated repeat users were muted (禁言) — [新浪](https://www.sina.cn/news/detail/5321739600923410.html); [搜狐](https://www.sohu.com/a/994732258_121948396) (via search summary, pages not fetched)
- **[third-party]** Analysts say using AI to help write copy, make images or narrate, with a real person running the account, does not cross the line — [知乎](https://zhuanlan.zhihu.com/p/2064053799715600224)

### Inferences
- **Implicit labels:** Art. 6(1) has the platform check file metadata for an implicit AI label. Gemini TTS is not a PRC-registered provider, and Remotion re-encodes the audio, so the uploaded MP4 carries no CAC-style metadata. That makes the user declaration (Art. 6(2) / Art. 10) the only compliant route. Without it, the post falls to Art. 6(3) detection and gets the "疑似" label. Ticking 「笔记含AI合成内容」 is required, not optional.
- An AI (Gemini TTS) voice means every video must be declared with 「笔记含AI合成内容」. Leaving it out risks a platform-applied "疑似" label, and possibly graded penalties if the account looks deceptive. Declaring has no stated penalty.
- An on-screen "AI配音" note in the opening frame (the Art. 4 video-label style) is cheap insurance. Strictly, Art. 4 binds the generating service, not the uploader.
- The main risk is not the AI voice. It is account-behavior signals: auto-posting through tools or scripts, and identical template notes. Post by hand from the app or the official creator web page, and vary titles, covers and text.
- **Decide: brand account or persona account.** The videos feature "Vantee", a cartoon tutor with an AI voice. If the account presents itself as that character (an AI virtual-human persona), the Aug-2026 rules require disclosure on the profile plus the "AI虚拟人" tag, and 凤凰网 says undeclared persona accounts "或被限流". If it's a company or brand account that posts videos featuring a character, the per-note AI declaration is the main obligation. Either way, saying in the bio that the narration is AI is low-cost.
- Avoid an AI voice that imitates a real, identifiable person (AI造假). A stock TTS voice like Zephyr is fine.
- The math explainer fits the 科普教育 category the April 2026 rules name for traffic support. That is a press paraphrase, so don't count on it.

### Gaps
- I found no official statement on whether AI-labeled ordinary notes get lower reach. The only "no effect" claim found is about virtual-human accounts. Reach-penalty claims are creator folklore.
- I couldn't fetch the original in-app announcement texts. Everything here comes from press summaries.
- No specific penalty is defined for simply failing to declare, other than the platform applying the label.
- The brief asked about 2024–2025 AI托管 / AI 批量 announcements. The ones found are dated 2026-03-10 and 2026-07-17. I found no separate 2024–2025 AI托管 notice, and the "2025" in the brief may be a mix-up.

## 2. Off-platform traffic (导流) rules

### Takeaway
Links, QR codes, WeChat IDs, phone numbers, other platforms' account names, watermarks or 口令, and coded hints at off-platform contact are all banned. This applies to titles, body text, images, videos, comments and DMs, for ordinary users too. The 《交易导流违规管理细则》 was tightened again effective 2026-09-18. The compliant alternatives are the official 专业号 tools: 社媒名片, 私信获客/留资 components, group chats and shops.

### Cited Findings
- **[press report of official rule]** Revised 《交易导流违规管理细则》 announced ~2026-09-13, effective 2026-09-18. Banned: spreading personal or group contact info or other platforms' account or shop info; guiding users to view, add, provide or exchange 私域/三方 info; posting other platforms' links, 口令, screenshots, watermarks, QR codes or mini-programs; directing users to third-party sites or apps; implied or coded guidance. It covers all users including ordinary notes, with titles, text, images, videos and comments named. DMs and group chats are key monitoring areas, and linked accounts can also be penalized — [网易](https://www.163.com/dy/article/L6MU30SF053144S4.html)
- **[press report]** Penalties include warnings, traffic limits on accounts, notes or products, content removal, profile resets, and restrictions on DMs, comments or groups, up to account bans. Buyers get a 7-day restriction for a first offense, 14 days for a second, and permanent removal of privileges for a third — [网易](https://www.163.com/dy/article/L6MU30SF053144S4.html)
- **[press report of official rule, effective 2025-03]** Earlier version: inducing transactions outside 小红书商城, the live-stream cart or official lead-capture components is banned, with five listed behaviors that can lead to permanent bans — [新浪科技](http://finance.sina.com.cn/tech/discovery/2025-03-12/doc-inepkkxi8789428.shtml); [光明网](https://m.gmw.cn/2025-03/12/content_1303989067.htm)
- **[press report, 2025-01]** 专业号 auto-replies and welcome messages may not include a WeChat ID or phone number. Off-platform diversion must go through 社媒名片. The 私信获客 tool offers 服务留资卡, 企微名片 and 个微名片 — [电商派](https://www.pai.com.cn/p/01jh7h7qtrd8dwnf1f65x1bqfs)
- **[press report, 2024-11]** An earlier governance notice already treated giving a WeChat ID or phone number, or links to other platforms, as violations — [人人都是产品经理](https://www.woshipm.com/share/6138360.html); [OFweek](https://tele.ofweek.com/2024-11/ART-8320506-8420-30652275.html)
- **[official text, enterprise account guide]** Enterprise account names may not contain commercial diversion info (example "**淘宝店"), and avatars may not contain website links. Account names can be based on a trademark, website or app name — [小红书企业号认证申请指南 PDF](https://dc.xhscdn.com/62f0c1cfe638eb13c67415419cd6d5c75985fa2b.pdf)
- **[third-party]** Penalties seen in practice: limited reach, 7/14/30-day mutes, bans. Non-专业号 accounts are reportedly limited in how many users they can DM — [界面](https://m.jiemian.com/article/12228571.html); [数英](https://www.digitaling.com/articles/1312380.html) (via search summary)
- **[third-party]** Videos with other platforms' watermarks are not allowed — [resouci spec guide](https://resouci.com/xiaohongshu-video-note-spec-2026/)

### Inferences
- The current China cut (no domain, no link, logo without ".ai") is right. Also keep "vantee.ai", "App Store", "下载Vantee" and "评论区/私信领资料" out of titles, text, comments and DMs.
- An app brand name alone is a gray zone. It's fine as an enterprise account's verified name (names may be based on an app). Calls to action telling viewers to go download or search an external app look like 导流, so avoid them.
- Don't reuse YouTube or TikTok exports that carry watermarks or YouTube end screens.
- "私信领资料" (DM me for the worksheet) is the classic education-account violation pattern. Skip it, or use only the official 留资 components on a verified 专业号.

### Gaps
- I found no official text that names "brand names of external apps" as a violation. The published categories are contact info, links, codes and guidance.
- I couldn't fetch the full official 细则 text. Penalty tiers for ordinary creator accounts (not merchants or buyers) aren't spelled out in the reports.

## 3. Education category: 双减, 学科培训, 竞赛, minors

### Takeaway
I found no rule that bans free math explainer content (科普/解题) on Xiaohongshu. The binding restrictions apply to advertising and promotion of off-campus training for minors: no paid promotion for K-12 subject training, and no 保过/提分/押题 claims. Promoting AMC courses, scores or 升学 advantages to minors carries regulatory risk under 双减 and the MoE competition rules. Present the content as free problem-solving.

### Cited Findings
- **[official local guidance]** Shenzhen's 《教育培训广告合规指引》, implementing the 双减 opinions: mainstream media, online platforms and public spaces "不刊登、不播发面向中小学（含幼儿园）的学科类、非学科类校外培训广告". Disguised forms such as "思维训练班" are also banned. Date unconfirmed — [深圳市司法局 PDF](https://sf.sz.gov.cn/attachment/1/1715/1715454/12799812.pdf)
- **[third-party ad agency]** Xiaohongshu ad review: subject courses for ages 3–18 may not be promoted, and off-campus training ads for under-18s are restricted. Banned claim words include 零风险, 绝对, 顶级, 包过, 保过, 押题, 一次通过, 无需学习, 稳拿, 必得 and 保分. 专业号 verification and ad-industry qualification are separate systems. Education ad qualifications require a business license with education/training scope plus a school-running permit (办学许可证) — [xiao-ad 教育过审指南](https://www.xiao-ad.com/jd/1195.html); [xiao-ad FAQ](https://www.xiao-ad.com/jd/1057.html); [juxuan](https://www.juxuan.net/22658.html)
- **[press/third-party, ~2022]** The MoE whitelist of competitions contains no subject competitions for compulsory-education students. Competitions may not charge fees, and results may not be used for school admission — [知乎](https://zhuanlan.zhihu.com/p/585393604)
- **[third-party, training-org marketing]** AMC still runs in China, and training agencies openly market AMC courses. Claims that AMC is "officially recognized" come from interested parties — [腾讯新闻](https://news.qq.com/rain/a/20250301A01NYM00); [知乎](https://zhuanlan.zhihu.com/p/1921856240608343660)

### Inferences
- Organic, free explainer videos are content, not training ads. Paid promotion (薯条/聚光) of AMC prep aimed at K-12 parents is likely to be rejected, and a foreign app company without a 办学许可证 couldn't qualify anyway.
- Avoid wording like 保过, 提分, 稳拿奖, "AMC拿奖=名校敲门砖" and other 升学 links, and anything implying paid tutoring for minors.
- Use neutral framing: "一道AMC 10 真题的三种解法", 数学思维, 科普. Avoid on-camera minors. The narrator is a cartoon or AI tutor, which also fits the virtual-human disclosure rule if the account presents as an AI persona.

### Gaps
- I couldn't find Xiaohongshu's own community rules text for the 教育 category, or any rules on minors appearing in content.
- No official finding confirms whether posting AMC content counts as "竞赛 promotion" under MoE rules. No authoritative source was found.

## 4. Account types and overseas operators

### Takeaway
Ordinary accounts can be registered with foreign phone numbers. Enterprise 专业号 (blue-V) verification officially accepts 境外及港澳台企业, using notarized registration documents instead of a mainland business license, plus an annual review fee. Advertising qualifications for education, and probably e-commerce tools, need Chinese licenses. A Dec 2025 terms change reportedly splits "international" users from Chinese ones, which may matter for reaching mainland users.

### Cited Findings
- **[official text, undated PDF, fee info ≥2019]** "小红书企业号支持中国境内企业、中国境外及港澳台企业进行线上认证申请". Overseas firms upload a color scan of valid registration documents with the company seal or the signature and title of a responsible person. Non-Chinese/English documents need a stamped translation. Account names can be based on a trademark, website or app and must be ≤20 characters. Bios must be ≤20 characters. App-based names need a 《计算机软件著作权登记证书》, and website-based names need an ICP filing screenshot. The fee was 300元 per review with annual renewal, and it isn't refunded on failure. The guide recommends a brand-new account for verification — [小红书企业号认证申请指南](https://dc.xhscdn.com/62f0c1cfe638eb13c67415419cd6d5c75985fa2b.pdf)
- **[third-party]** Newer agency write-ups say the verification fee is 600元 — [opp2](https://www.opp2.com/345254.html); [xiao-ad](https://www.xiao-ad.com/zx/2367.html) (via search summary)
- **[press report]** Xiaohongshu is a rare Chinese app that lets users register with foreign numbers without Chinese-ID real-name verification — [KR-Asia/Nikkei](https://www.kr-asia.com/tiktok-refugees-a-mixed-blessing-for-chinese-app-xiaohongshu)
- **[third-party, unverified]** A December 2025 terms update reportedly treats accounts registered before 2025-12-08 as Chinese users. Accounts registered after that with a non-Chinese number are treated as international, under RedNote Technology PTE LTD (Singapore) — [WebProNews](https://www.webpronews.com/rednotes-great-divide-how-chinas-lifestyle-app-splits-worlds-to-chase-global-dreams/) (403 on fetch; from search summary only)
- **[third-party, conflicting]** One guide says a Chinese phone number is needed for 专业号 verification, and another says overseas entities can use other verified contacts — [RedNoteGo substack](https://rednotego.substack.com/p/rednote-registration-and-account); [appinchina](https://appinchina.co/blog/the-complete-guide-to-rednote-xiaohongshu-marketing-in-china/)
- **[third-party]** Multiple 专业号 under the same company can share qualifications — [xiao-ad](https://www.xiao-ad.com/jd/2505.html)

### Inferences
- The simplest compliant path is a 个人号 or a free personal 专业号 (creator) for organic posting. A foreign-entity enterprise verification is possible but costs money and paperwork. For an app-named account, it would need a Chinese software copyright certificate or a trademark, which may be impractical.
- If the Dec-2025 split is real, an account registered now with a US number may be an "international" account. Its distribution to mainland users is unknown, so test it. A mainland-number account run by a China-based person may be needed for full domestic reach.

### Gaps
- I couldn't verify the Dec-2025 Chinese/international split or its effect on content visibility from official terms.
- I found no official answer on phone requirements for enterprise verification, or the current fee (300 vs 600元).

## 5. Video specs and publishing format

### Takeaway
Both landscape and portrait uploads are accepted. Vertical 3:4 or 9:16 fills the feed, and 3:4 (1080×1440) is the standard cover. Upload duration is reported as up to 15 min (some sources say 5 min). The platform is pushing mid-length 2 min+ video in 2026. All numeric specs here come from third parties, not official documentation.

### Cited Findings
- **[third-party]** No hard aspect-ratio rule: 16:9, 4:3, 9:16 and 3:4 all upload. Vertical is recommended, and landscape shows black bars in the feed. Recommended resolution is 1080p — [aiyongtech](https://www.aiyongtech.com/new/id10313); [secaiyun 2026](https://www.secaiyun.com/docs/social-media-video-size-specification-guide-2026-08-28.html)
- **[third-party, conflicting]** Max length: "常规视频笔记最长可发布15分钟" and web upload ≤15 min, ≤10GB — [riseton](https://www.riseton.com/yunying/5977.html); [腾讯云](https://cloud.tencent.com.cn/developer/news/1149150). Another source says 5 min technical max, 15–60 s recommended, 3:4 1080×1440 or 9:16 1080×1920, 3:4 cover, H.264 MP4 30fps, and explicitly says it is not official — [resouci 2026](https://resouci.com/xiaohongshu-video-note-spec-2026/)
- **[third-party]** The desktop publisher allows up to 4 cover images for A/B testing, and after about 10 hours the best click-through cover is kept — [人人都是产品经理](https://www.woshipm.com/marketing/5572030.html)
- **[press report, 2026-05]** Xiaohongshu is betting on mid-to-long video (>2 min) and plans long-form text, podcasts and 4K in 2026 — [虎嗅](https://m.huxiu.com/article/4861801.html)
- **[official text]** Enterprise account nickname and bio are each ≤20 characters — [企业号认证指南 PDF](https://dc.xhscdn.com/62f0c1cfe638eb13c67415419cd6d5c75985fa2b.pdf)

### Inferences
- A 16:9 full explainer is postable but shows letterboxed in the feed. For 小红书, post the vertical short (9:16) and/or a 3:4 crop, with a 3:4 cover. The repo's existing WeChat `cover-3x4.jpg` fits directly.
- Full explainers likely fit within 15 min. Check the in-app limit.

### Gaps
- I found no source for the note title limit (widely said to be 20 characters), the body limit (said to be 1,000 characters) or the hashtag (话题) limit. These are creator folklore here, so check in the app.
- I found no official creator-center spec page (creator.xiaohongshu.com).
