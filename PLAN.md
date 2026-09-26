# RepoPicks — Perfection Plan v1

**Status:** PROPOSED — do not implement until the owner approves.
**Branch:** `plan/perfection-v1` (nothing here touches `main` or the live site)
**Date:** 2026-09-26
**Goal:** Turn the RepoPicks site into the brand authority engine for @repopicks → 10K Instagram followers → sponsors.
**Non-negotiable constraint:** ZERO daily/weekly manual work. Everything below is either fully automated by the existing GitHub Actions pipeline or a one-time setup. Anything requiring ongoing human effort is rejected (see §7).

---

## 1. Where we are (audit summary, 2026-09-26)

**Stack:** Next.js 16.3.5 (App Router, Turbopack) + React 19 + Tailwind. Minimal deps (`lucide-react`, `next`, `pg`). No analytics, no SEO libraries, no OG image.

**Routes (live, all 200):** `/`, `/rising`, `/hidden-gems`, `/methodology`, `/repo/[owner]/[name]` (SSG, top-100, revalidate 1h), `/feed.xml` (dynamic RSS), `/picks.xml` (static auto-RSS), `/api/trending` (366KB JSON), `/api/badge`.

**Data pipeline (already automated):** GitHub Actions cron every 6h → GitHub GraphQL (PAT) → optional Postgres → `public/data/trending-summary.json` (500 repos, 512KB) → commit+push → Vercel auto-deploy. `scripts/generate-picks.ts` auto-selects top-5 by star velocity (excludes forks, anomalous signals, empty/non-English descriptions) and writes `picks.json` + `picks.xml`; the ETL self-commits them.

**SEO baseline:** title/meta/OG/Twitter tags, `sitemap.xml` (core pages + top-100 repos), `robots.txt` (allows `/`, disallows `/api/`). Bugs found: repo page `<title>` renders "…| RepoPicks | RepoPicks" (duplicated brand suffix); `robots.ts` has a stale default domain (live value is correct via env var only); no `schema.org` markup; no canonical tags.

**Product gaps:** no analytics (flying blind), no email capture until newsletter URL is configured, no language/category archive pages, no sponsor inventory, placeholder contact email, generic hero, no OG share image.

---

## 2. What research taught us

**Competitors** (github.com/trending, daily.dev, bestofjs.org, ossinsight.io, console.dev, tldr.tech):
- github.com/trending's biggest SEO asset is **language spoke pages** (`/trending/python?since=daily`) — high search intent, weak competition for a fast data-rich page.
- daily.dev's growth engine is its **email digest** (1.5M subs); tldr.tech's is **edition segmentation** (13 topic editions) + a dedicated `/signup` conversion page + public `advertise.*` rate card.
- bestofjs.org (closest analog, also fully automated) proves **per-project pages + tag landing pages + Hall of Fame** rank and earn backlinks. It has NO email capture — our easiest win over it.
- ossinsight.io's star rankings are currently **paused because GitHub changed event pagination and their ingestion silently under-captured data** — a direct warning: our ETL needs data-quality guardrails, and must not rely on the public events timeline.
- console.dev proves devtools vendors **pay for sponsorships** to reach this audience; "Sponsored" labeling is proven inventory.

**Newsletter (key correction):** native "poll my RSS and send a digest" is **not free anywhere credible in 2026** — Buttondown's RSS-to-email is a +$9/mo add-on, beehiiv's is on the ~$96/mo Max plan. The correct $0 architecture: **the GitHub Actions ETL composes the weekly digest itself and pushes it via API.** Recommended platform: **Buttondown free** (100 subs, full API on free tier, unlimited sends, Markdown-first, custom domain, CSV export; dev/indie audience fit). Upgrade path when real: beehiiv Scale (ad network) at 1,000+ subs.

**SEO for data sites:** index category/language archives first (stable URLs, unique aggregated data, link hubs — use `ItemList` schema); index only top ~200–300 per-repo pages that clear a trending threshold, `noindex` the long tail; per-repo pages must show data GitHub doesn't (velocity charts, rank history) — never mirror GitHub's description verbatim (thin-content risk under Scaled Content Abuse enforcement).

**Monetization that fits automation:** newsletter sponsorships ($150/send founding flat rate → $30–60 CPM later), Carbon Ads (one-time snippet), EthicalAds at 50k pageviews/mo, affiliate links (zero outreach), `/advertise` page with rate card (inbound only). Ethics: "Sponsored" labeling, never let payment touch rankings.

---

## 3. Prioritized change list

### P0 — do first (highest leverage, all automatable)
1. **Analytics, one-time snippet** (Plausible or Umami). We currently measure nothing — no traffic, no signup conversion, no sponsor metrics. *Automatable: yes, after one-time account setup.*
2. **Weekly digest automation.** New weekly GitHub Actions job (e.g., Sundays 09:00 UTC): queries ETL data → top risers + hidden gems → renders Markdown template → POSTs to Buttondown API as a scheduled send. Signup via static form on site. *Automatable: yes. One-time setups: Buttondown account, `BUTTONDOWN_API_KEY` repo secret, domain/DKIM verification.*
3. **Dedicated `/newsletter` landing page.** TLDR-style conversion page: what you get, sample issue (Buttondown archive URL), frequency, one-field signup. Highest-ROI single page. *Automatable: yes (static).*
4. **Language spoke pages** `/trending/{language}` (+ daily/weekly/monthly variants): TypeScript, Python, Rust, Go, JavaScript + 5 more. Static generation from ETL data, added to sitemap. *Automatable: yes.*
5. **SEO bug fixes + schema.org:** fix duplicated `| RepoPicks` title suffix; fix stale `robots.ts` default domain; add `SoftwareSourceCode` JSON-LD on repo pages, `ItemList` on archives, `BreadcrumbList` everywhere, `Organization`+`WebSite` on homepage; self-referencing canonicals. *Automatable: yes.*
6. **Brand OG share image** (`opengraph-image.tsx`): one static branded image so link shares on X/Instagram/Telegram look professional. *Automatable: yes (one-time build).*

### P1 — next (all automatable)
7. **Topic/category landing pages** (`/topics/ai-agents`, `/topics/cli`, `/topics/devtools`…) auto-clustered from GitHub topics in the ETL. *Automatable: yes.*
8. **Per-repo "Why it's rising" data cards:** velocity sparkline, stars/day, 30d curve, first-trended date, license — computed at build from ETL data, template text only. Turns detail pages from GitHub mirrors into insight pages (the 40%-unique-content gate). *Automatable: yes.*
9. **`/advertise` page + media kit:** inventory (newsletter primary sponsor, classifieds, site banner, "Powered by" slot), rate card (flat founding rates), audience stats pulled from analytics, contact email. Inbound only. *Automatable: yes (static; stats refreshed from analytics).*
10. **Hall of Fame evergreen page:** all-time top velocity spikes / most-starred discoveries, regenerated from ETL snapshots. Backlink magnet. *Automatable: yes.*
11. **ETL data-quality guardrails:** row-count delta assertions, null-rate checks, sample cross-check vs live GitHub API; fail the Action loudly on anomaly (learned from ossinsight's silent under-capture). *Automatable: yes.*
12. **Newsletter topic editions** (AI repos, JavaScript, Python, DevTools): same ETL, filtered templates, Buttondown segments. Multiplies sponsor slots. *Automatable: yes — after P0 digest works.*

### P2 — milestone-gated (do when the trigger hits)
13. **Carbon Ads** snippet (apply when traffic qualifies — one-time). **EthicalAds** at 50k pageviews/mo.
14. **beehiiv Scale migration** at 1,000+ subscribers (ad network + sponsorship storefront). Buttondown CSV export makes this trivial.
15. **Flat → CPM pricing** ($30–60/1k opens) once open rates are measurable.
16. **"Recently added" section + repo submission form** → auto-added to ETL watchlist (bestofjs-style discovery loop, no manual triage).
17. **Custom domain** (e.g., repopicks.dev) + affiliate links (Vercel/Railway/dev-tool programs).

---

## 4. What stays fully automated (the pipeline inventory)

After this plan, the recurring machine does all of this with no human touch: 6h data refresh → trending dataset → Picks of the Day → `/picks.xml` RSS → auto-commit → Vercel deploy → sitemap regeneration (only bumping `lastmod` where data materially changed) → language/topic/archive/Hall-of-Fame pages → weekly digest composition + send via Buttondown API → sponsor slot injection from `sponsors.yaml` (when sponsors exist) → data-quality assertions. The owner never edits content, never hits "send", never triages.

## 5. One-time setups the owner must do themselves

1. **Buttondown:** create free account, verify sending domain/DKIM, create `BUTTONDOWN_API_KEY` and add it as a GitHub repo secret (engineer wires the rest).
2. **Analytics:** create Plausible/Umami account, paste the domain into the one-line snippet config.
3. **Contact email:** replace `hello@repopicks.dev` with a real inbox (used in footer + `/advertise`).
4. **(Recommended)** Custom domain + DNS.
5. **(Later)** Carbon Ads application when traffic qualifies; beehiiv migration at 1k subs.

## 6. Sequencing

**Week 1:** P0 items 1–6 (analytics, digest automation, `/newsletter` page, language spokes, SEO fixes+schema, OG image).
**Week 2:** P1 items 7–11 (`/advertise`, topics, Hall of Fame, repo data cards, ETL guardrails).
**Week 3:** P1 item 12 (topic editions) + P2 items that are one-time (affiliate links, submission form).
**Ongoing (machine):** everything in §4. **Milestone-gated:** P2 items 13–15.

## 7. Deliberately NOT doing (with reasons)

- **Manual curation of picks/content** — violates the non-negotiable zero-manual-work constraint; the velocity algorithm *is* the curation.
- **Community features** (comments, upvotes, accounts, Squads) — require auth + moderation, i.e., ongoing human work; rejected per constraint.
- **Editorial reviews** (console.dev-style "what we like/don't like") — manual by design; approximated instead by automated "why it's rising" data cards.
- **Active sponsor outreach** (cold emails/calls) — ongoing manual work by definition; inbound via `/advertise` page only until/unless the owner hires it out.
- **Substack + Zapier/IFTTT RSS workarounds** — fragile third-party dependency; fails the robustness bar.
- **Mailchimp/MailerLite free tiers** — 250-subscriber caps would force a paid plan within weeks; Buttondown's API-first free tier is strictly better.
- **Sponsored rankings or unlabeled native placements** — fails FTC disclosure rules and would destroy the brand authority this whole project is building. Sponsored slots are always labeled and visually separated from velocity rankings.
- **Mobile app / browser extension** — daily.dev proves distribution value, but it's a separate product surface; parked as a future consideration, not perfection-v1.
- **Indexing all 500+ per-repo pages** — thin-content risk under Google's Scaled Content Abuse enforcement; index only pages that clear the trending threshold, `noindex` the rest.
