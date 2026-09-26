# GAPS.md — Feature gaps voiced by real users (research-only)

**Date:** 2026-09-26 · **Branch:** `plan/perfection-v1` · **Status:** research, awaiting user approval. No implementation.

**Method:** Three parallel research passes mined real user voices (paraphrased, never verbatim):
1. Reddit/HN/GitHub Community discussions (HN threads, github/orgs/community#179946, builder launch docs)
2. Social (Threads/Instagram — X/Twitter not accessible to tooling) + Product Hunt reviews + Chrome Web Store reviews
3. GitHub Issues on open-source discovery projects (nilbuild/githunt, bestofjs/bestofjs, pingcap/ossinsight, star-history/star-history, trendshift.io creator posts)

**Honest caveats:** Reddit thread content was thin via the search tools (r/github, r/opensource coverage is a follow-up). X/Twitter voices could not be retrieved directly; Threads/Instagram used as social proxy. All quotes below are [paraphrased] sentiments, not exact wording.

---

## Ranked TOP 10 gaps (scored on demand × full-automation fit × SEO/newsletter/sponsor value)

### 1. Rank by momentum (star velocity), not total stars
- **Evidence:** [paraphrased] "GitHub Trending favors repos that are already famous and has no memory of growth trajectories — it can't tell a repo exploding this week from one that peaked months ago." — Threads @chiefaii (June 2026), announcing findarepo.com built for this. [paraphrased] "Total stars tell you what was popular. Stars gained today tell you what is happening." — Threads @p32929 (ghtr.fly.dev). Maintainers confused: 100+ stars gained, never trended, while a +1-star repo did (github/orgs/community#179946).
- **Frequency:** recurring, strongest structural complaint cluster.
- **Automation fit:** 5/5 — we already ingest star velocity ("+N today").
- **What we'd build:** default "Rising now" sort + `/rising` page ranked purely by stars-gained-today, each card showing the transparent velocity number.

### 2. Trust score / fake-star filtering ("is this repo legit?")
- **Evidence:** [paraphrased] Author cloned a "trending" repo with thousands of stars expecting solid scaffolding, got half-baked code that wouldn't compile (dev.to, "the fake GitHub economy"). Research (StarScout, ICSE 2026) flagged ~6M suspected fake stars; 78 fake-star campaigns still reached GitHub Trending. Users want stargazer-quality grading, not raw counts.
- **Frequency:** major recurring theme across social, blogs, peer-reviewed research.
- **Automation fit:** 4/5 — heuristic score from API data: stargazer account-age distribution, star/fork ratio, commit recency, issue activity. No manual review.
- **What we'd build:** nightly-computed "Legit score" badge on every repo card + "hide suspicious" toggle; filter fake-star spikes out of rankings.

### 3. Early-breakout radar (catch repos pre-viral, ~40 stars)
- **Evidence:** [paraphrased] "To find repos before 10k stars you need a manual 4-step system — momentum search, star-history curves, trending as a habit, daily.dev for passive discovery. No single tool does this." — Instagram @devlearningcorner (Aug 2026). Breakout repos sit at ~40 stars ~11 days before anyone notices.
- **Frequency:** recurring in dev-creator content; "find the library before your team standardizes" is the stated job.
- **Automation fit:** 5/5 — velocity filter on low-star repos, fully computable.
- **What we'd build:** `/breakouts` page: repos under ~200 stars with extreme velocity, stamped "caught at N stars" as receipts.

### 4. Maintenance-health signals on every trending repo ("survived past the README?")
- **Evidence:** [paraphrased] "Which one has actually survived past the README? lol" — comment on @findarepo's Threads post (Aug 2026). [paraphrased] trendshift.io creator: "I want to quickly assess whether a repository is still popular, keeps receiving contributions, and is actively maintained" — built a monthly engagements page for it. Best of JS lists "deeper health signals" as planned/unbuilt.
- **Frequency:** multiple independent threads; the handroai reel on this pain drew 220 comments.
- **Automation fit:** 5/5 — last-commit date, merged-PR/issue activity, archived flag, all from the API.
- **What we'd build:** health dots on every card ("active 2d ago", "quiet 8mo", "archived") + "actively maintained only" filter.

### 5. Related / alternative repos on per-repo pages
- **Evidence:** [paraphrased] Best of JS maintainer (bestofjs/bestofjs#216, still open): "when checking a project, I want to see similar projects — alternatives for the same solution — matched by shared tags." Standalone product relatedrepos.com ("updated daily") exists purely for this.
- **Frequency:** maintainer-confirmed unbuilt roadmap item; a whole product validates the demand.
- **Automation fit:** 4/5 — topic overlap + co-star/co-trending similarity, computed in ETL.
- **What we'd build:** "Similar repos" and "Open-source alternatives" sections on every per-repo page — this is also our biggest SEO play ("open source alternative to X" queries).

### 6. One-click exclusion filters — "Trending minus AI"
- **Evidence:** [paraphrased] "I kept opening GitHub Trending to see what was new in open source and most of the list was LLM wrappers, agent frameworks, and prompt toolkits… sometimes you just want to see what's happening across the rest of it." — pritam-patil/github-trending-without-ai (an entire project + daily Action + RSS built for this single gap, Sept 2026).
- **Frequency:** one project + directional HN sentiment; AI-saturation of trending is widely complained about.
- **Automation fit:** 5/5 — topic/keyword exclusion lists applied in ETL/UI.
- **What we'd build:** exclusion chips (AI/LLM, crypto, tutorials, "no-language junk") + a `/trending-without-ai` page capturing that exact search intent.

### 7. Push delivery: per-language email/RSS digests, not a page you must visit
- **Evidence:** [paraphrased] HN Show HN (news.ycombinator.com/item?id=16446250): "RSS feeds or mailing lists would be nice too — I don't care how I receive it as long as it arrives automatically." [paraphrased] "GitHub's official newsletter only covers all languages, so you can't focus on one language." The unofficial RSSHub github/trending route has ~46.8K subscribers on Folo.
- **Frequency:** repeated across HN thread, GitHub discussion #179946, newsletter workarounds.
- **Automation fit:** 5/5 — extends the already-planned Buttondown digest; per-language RSS feeds are static files from ETL.
- **What we'd build:** weekly digest (planned) + per-language RSS/edition feeds (`/feed/python.xml`), each with its own subscribe landing section.

### 8. Historical trending archive ("what trended last month?")
- **Evidence:** [paraphrased] Product Hunt comment on GitHunt 2.0: "GitHub's trending page shows only 25 repos and has no way to check past trending projects." Gap persists in 2026 — github.com/trending still shows ~25 rows, no history, no API.
- **Frequency:** single dated source, but the gap is structurally still open.
- **Automation fit:** 5/5 — our ETL already accumulates daily snapshots; archive pages generate themselves.
- **What we'd build:** `/archive/2026/09/26`-style daily snapshots, browsable and indexed — evergreen SEO ("what trended in AI in March 2026").

### 9. A free, documented "what's trending" API/RSS for developers
- **Evidence:** [paraphrased] "GitHub exposes no official Trending API/RSS" — devs scrape HTML instead (huchenme/github-trending-api exists for that reason; its issues are all uptime reports, zero feature asks — the need is taken for granted). Trendshift rank used as a composable signal requested in mvanhorn/last30days-skill#861.
- **Frequency:** 46.8K subscribers on the unofficial RSS route = measured demand.
- **Automation fit:** 5/5 — our `/api/trending` (500 repos) already exists; needs docs + versioning + rate-limit headers.
- **What we'd build:** documented public API + versioned RSS; dev goodwill + backlinks (docs pages rank and get cited).

### 10. "Hidden gems" — high-quality repos that never trend
- **Evidence:** [paraphrased] "Many developers discover valuable repositories too late — these hidden resources can save months of learning." — Instagram @codewith_random carousel (3.5K likes, 620 comments, March 2026). Distinct from breakouts: quality that never spikes.
- **Frequency:** strong engagement signal.
- **Automation fit:** 4/5 — quality heuristics (docs presence, tests, health score from #4) × low star count × never-trended, computed weekly.
- **What we'd build:** `/hidden-gems` weekly auto-list — "great repos the algorithm missed."

---

## Considered but NOT in top 10

| Gap | Verdict | Reason |
|---|---|---|
| Multi-select language filtering | P1 UX, not top 10 | Single GitHub issue ask; nice filter upgrade, low SEO value |
| "Hide repos I've seen" novelty filter | Defer | Needs user identity; cookie/localStorage version possible later |
| Bookmarks / watchlist | Reject for now | Needs auth; bestofjs itself hasn't shipped it post-rewrite; localStorage-only version is scope creep |
| User-submitted repos ("Product Hunt for repos") | **Reject** | Requires human moderation — violates the zero-manual-work constraint |
| Release notifications for followed repos | **Reject** | No clear user voice found; needs accounts + polling infra |
| New-tab extension | **Reject** | Separate product, separate store; thin evidence |
| Aggregate star-history / portfolio views | Defer | Single issue ask (star-history#187); thin |
| Paste-full-URL search | Trivial fix | One-line UX improvement, include opportunistically |
| Reduced-motion / static-data mode | Accept as a11y | Trivial, include opportunistically |
| "Reliable fresh daily list" | Table stakes | Already covered by 6h ETL + guardrails in PLAN.md |

## Anti-lessons (what to avoid, from user complaints)
- **daily.dev slop:** "lots of organizations posting slop… super hard to get out of your feed" (dev.to, Jan 2025; consistent PH review theme) → keep the feed algorithmic + strong exclusion filters (#6), never pay-to-rank.
- **Silent stale data:** ossinsight's star rankings paused site-wide from silent ingestion under-capture; GitHub Trending froze for weeks (Nov 2025, 8+ reporters) → ETL freshness guardrails + public "data updated Xh ago" stamp (already in PLAN.md).
- **Never sell rankings:** sponsored slots always labeled, never touching order (PLAN.md §monetization).

## Research gaps to close later
- Native Reddit search pass (r/github, r/opensource, r/programming) — tooling didn't surface reddit.com threads.
- X/Twitter direct voice mining — no tooling access; Threads/Instagram used as proxy.
- Reaction/+1 counts on GitHub issues (client-rendered) — frequency scored on participant counts and cross-source recurrence instead.
