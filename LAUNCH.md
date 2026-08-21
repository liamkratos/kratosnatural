# Launch checklist

Everything that has to be true before each site goes live, in one place, so
building never stalls on "what was the next thing again".

Master list across all three sites. `liamkratos/TODO.md` stays as the detail
list for that repo and feeds into this one.

**How to use it:** work top to bottom within a section. Anything marked 🔴 is
launch-blocking — the site should not go live with it open. 🟡 is "live is fine,
but fix it soon". ⚪ is backlog. Anything marked 👤 only you can do (dashboard,
legal, writing, decisions) — everything else I can build.

---

## 0. Settled

- [x] **`sk_live_` key rolled.**
- [x] **Launch order: Kratos Natural → Liam Kratos → Krealio.**
- [x] **Stripe connector authorised** (`acct_1TyYXHLq2PCdti2p`, KRATOS NATURAL).
      I can create and read prices directly now.
- [x] **Market rollout: 🇳🇱 NL → 🇪🇺 EU → 🇬🇧 UK → 🇺🇸 US → 🌍 worldwide**, one at a
      time, same sequence for all three sites. Encoded in
      [`src/lib/markets.ts`](src/lib/markets.ts); requirements per market in
      [`private/compliance.md`](private/compliance.md).
- [x] **A product is only sold where it has been cleared.** `markets:` is now
      **required** frontmatter on every product — no default, because a default
      would be a guess at a legal question. The build fails without it.
- [x] Salt lamp price verified live: €24.99, EUR, tax inclusive, active.

---

## 1. Markets — NL first, then outward

Full requirements per market live in [`private/compliance.md`](private/compliance.md).
This is only the sequence and the switch.

| Step | Market | State | Gate |
|---|---|---|---|
| 1 | 🇳🇱 Netherlands | **open** | — |
| 2 | 🇪🇺 EU-27 | closed | health claims review, VAT OSS, GPSR |
| 3 | 🇬🇧 UK | closed | UK VAT from first sale, GB claims register |
| 4 | 🇺🇸 USA | closed | lamp device classification, FDA disclaimer, state nexus |
| 5 | 🌍 Worldwide | closed | a legal way to determine region |

**To open a market:** add it to `OPEN_MARKETS` in `src/lib/markets.ts`, then add
it to the `markets:` list of each product that has been cleared for it. Both are
required — forgetting either fails closed, which is the point.

- [ ] 🔴 👤 **Clear the salt lamp for the EU.** Currently `['NL']`. Blocked on the
      health-claims review of its product copy.
- [x] **No waiver, no sale.** Required, un-ticked checkbox on every guide page
      carrying both conditions the law asks for. Checkout **refuses** without
      it and sends the buyer back with the reason — no exceptions, no quiet
      sale that keeps the 14-day right. Recorded on the Stripe payment intent
      as `withdrawal_waiver` + timestamp and confirmed back on the success
      page.
- [x] **Durable-medium confirmation built.** A Stripe webhook on
      `checkout.session.completed` sends a purchase confirmation carrying the
      waiver, the moment it was given, and the trader details. In a webhook
      rather than on the success page: a confirmation that depends on the buyer
      keeping a tab open is not a record of anything.
- [ ] 🔴 👤 **Create the webhook endpoint in Stripe** → `/api/stripe/webhook`,
      event `checkout.session.completed`, then set `STRIPE_WEBHOOK_SECRET` in
      Vercel. Without it the endpoint refuses every call and a paying buyer
      never gets the confirmation. Required **before** the first guide sells.
- [x] **Refund policy placeholders filled** from the Chamber of Commerce
      details, the same source the About page and legal notice use, so the
      three cannot disagree. No template text left in any policy.
- [x] ~~Local test key vs livemode prices.~~ **Accepted, not a bug.** Dev shows
      "prijs niet beschikbaar" and buy forms do not render locally. That is the
      correct behaviour for an unresolvable price and it keeps a live key off
      the laptop. Use `stripe listen` when checkout itself needs testing.
- [x] **Guides are market-gated in our own app**, since Stripe cannot do it for
      a download. `markets:` is required on every guide exactly as on a product;
      a guide cleared for no open market is hidden from the listing **and**
      refused at checkout. Verified: a guide set to a closed market disappears
      from `/guides` and its checkout returns `?checkout=region` even with a
      valid waiver. Buyers keep guides they already own if a market later
      closes — `getGuide`/`findGuide` deliberately skip the filter.
- [x] **Region is always the buyer's own answer, never their IP.** Verified:
      there is no geo-IP anywhere in the codebase — no `x-vercel-ip-country`, no
      `request.geo`, nothing. For a parcel the buyer picks the country in Stripe
      Checkout from our allowlist; for a download the market gate above decides.
      Nothing to build for step 5 beyond widening `OPEN_MARKETS`, and no IP
      lookup is to be added later: it is personal data under GDPR, needs a
      lawful basis and a privacy-policy line, and is wrong about every VPN.

## 2. Kratos Natural — the €1B vehicle, launches first

### Products

- [ ] 🔴 👤 **Salt lamp specifications**: wavelength, power, irradiance,
      dimensions, socket, cable. The page makes wavelength and dose claims while
      the spec list says "being finalised". This is the most visible credibility
      hole on the site and it sits on the only thing you sell.
- [ ] 🔴 👤 Real product photography. Three images exist; a product page carrying
      research claims needs to look like the claims are serious.
- [ ] 🔴 👤 Stripe price live, `tax_behavior: inclusive` **at creation**.
- [ ] 🟡 👤 Decide SKU 2 and 3. One product is not a shop.

### Guides & e-books — the current push

- [ ] 🔴 👤 **Write Wave 1**: `licht`, `supplementen`, `testen`. These first
      because the published infraroodlicht and nattokinase analyses already back
      them, so they can ship *honestly* fastest.
- [x] **Three guides written**, manuscripts in `private/guides/manuscripts/`:
      Eenzijdige dominantie (17 sources), Naar voren hangende schouders (11),
      Weten wat je wilt (9). Every DOI and PMID resolved against an API.
      **Next: Liam takes them to Canva for covers and layout, rewrites in his
      own voice, returns PDFs in both languages.**
- [ ] 🔴 👤 Stripe price per guide. One each, `tax_behavior: inclusive`.
- [ ] 🔴 👤 Cover images in `public/guides/`. The template currently points at
      `/moss.jpg` so the page renders.
- [ ] 🔴 👤 PDFs into `private/guides/`, never `public/`.
- [ ] 🟡 EN versions of every NL guide. Both or deliberately one, recorded.
- [ ] 🟡 Bundle pricing: domain bundle €79, complete library €249 including
      future releases. Needs a Stripe product each and a way to grant a bundle's
      contents — **not built yet**, `entitlements.ts` currently resolves one
      slug per payment.
- [ ] ⚪ Delete the `houding-schouders` template once a real guide replaces it.

### Content & credibility

- [ ] 🔴 **Re-check the three published articles** for sources, facts and
      statements. 64 / 13 / 3 citations respectively. I can run a pass that
      verifies every PMID resolves, every claim maps to a citation, and no
      sentence overstates what its source found. **Say the word.**
- [ ] 🟡 The research download files — `nattokinase-research-database.xlsx`
      exists; the infrared one is referenced in the plan but check it ships.
- [ ] 🟡 30 articles by end of 2027 for the research moat to be a moat. Currently 3.

### Site fixes

- [x] **Images cleaned.** Four unreferenced files deleted, the homepage PNG
      converted; `public/` went from ~12MB to 4.7MB. Note the earlier claim that
      this was a page-weight win was wrong — `next/image` already resized and
      served WebP to visitors. The saving is repository and deploy size.
- [ ] 🟡 Apex vs www: Vercel serves `www`, canonical tags name the apex. Pick one.
- [ ] 🟡 👤 Google Business Profile — the reviews block links to it and the star
      ratings in search come from there, not from the site.
- [ ] ⚪ `next-intl` v4 upgrade (open advisory, does not reach us, changes the
      domain routing API — deliberately not next to a launch).

---

## 3. Liam Kratos — the trust engine

### Blocking checkout

- [ ] 🔴 👤 `NEXT_PUBLIC_COACHING_PRICE_ID` in Stripe live mode + Vercel.
      `tax_behavior: inclusive` at creation, and make it the product default.
- [ ] 🔴 👤 The three guide `price_` ids + `STRIPE_WEBHOOK_SECRET` in Vercel.

### Blocking launch

- [ ] 🔴 👤 **Own logo.** The header still carries the Kratos Natural logo.
- [ ] 🔴 👤 Vercel env: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL_EN`,
      `NEXT_PUBLIC_SITE_URL_NL`, `ACCOUNT_TOKEN_SECRET` (**fresh**, not the
      Kratos Natural value), `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`,
      `ACCOUNT_EMAIL_FROM`.
- [ ] 🔴 👤 Domains on the Vercel project, DNS pointed at it.
- [ ] 🔴 👤 Resend: verify `liamkratos.com`. `RESEND_AUDIENCE_ID` must be **the
      same id as Kratos Natural** — Kratos Weekly is one letter for both sites,
      and a shared list is what stops a double signup getting it twice.
      `RESEND_LEADS_AUDIENCE_ID` is new and holds only this site's signups.
- [ ] 🔴 👤 **Free guide for the newsletter.** `/downloads` is empty here, so
      signup currently mails a link to a file that does not exist. This is live
      right now and it is the worst possible first impression.
- [ ] 🔴 👤 Policies name "Kratos Natural" as the operator throughout. They sit
      on liamkratos now.
- [ ] 🔴 👤 Company details on the About page are inherited. Confirm trade name,
      VAT and CoC are right for this entity.

### Coaching, written out A–Z

You asked for this explicitly. What has to exist:

- [ ] 🔴 👤 **Define what "guaranteed" means, precisely.** You described it as
      guaranteeing people's lives change. As written that is an outcome
      guarantee on a health result, which is both unenforceable and a consumer-law
      problem. The version that keeps the promise and survives scrutiny is a
      **process guarantee**: define the work (sessions attended, protocol
      followed, check-ins completed), and refund in full if they did all of it
      and nothing changed. Same promise, defensible.
- [ ] 🔴 👤 Who it is for, and **who it is not for**. The qualifying question is
      already in front of the coaching page — write the real answer behind it.
- [ ] 🔴 👤 Intake: application form → qualification call → accept or decline.
      Declining well is part of the product, given the small deliberate audience.
- [ ] 🔴 👤 Baseline: what gets measured before week 1 (bloodwork, body
      composition, sleep, whatever you actually use).
- [ ] 🔴 👤 The 12 weeks, week by week. What happens, what's delivered, what the
      client does. The roadmap page shows a road — this is what fills it.
- [ ] 🔴 👤 Weekly rhythm: call cadence, async access, response times you can
      actually hold.
- [ ] 🔴 👤 Tools: where the protocol lives, how progress is tracked, where they
      message you.
- [ ] 🔴 👤 **Client cap.** Coaching does not scale and must never be allowed to
      eat the week. Pick the number now, publish it.
- [ ] 🔴 👤 Price, and the reasoning behind it.
- [ ] 🟡 👤 Offboarding: what happens at week 13, and what they can buy next.
- [ ] 🔴 👤 **Remove clients from the warm-up sequence on signup.** A paying
      client still receiving "why you should start coaching" is the one mistake
      the audience split exists to prevent.
- [ ] 🔴 👤 Write the warm-up sequence itself. The list fills from launch day;
      nothing sends until it exists in Resend.

### Blogs

- [ ] 🔴 A `/blog` route. The article machinery here is built for `.paper`
      research pages with PMIDs — wrong treatment for an essay. **I can build
      this.**
- [ ] 🟡 👤 Move *Being vs Doing* and *Limiting Beliefs* across from Shopify.
      Brand typography, not `.paper`.
- [ ] 🟡 👤 First three original blogs written.

### Guides

- [ ] 🟡 Port the newer guide machinery back from Kratos Natural (domains,
      pillar e-books, drafts, research backlink). **I can do this.**
- [ ] 🟡 👤 Decide the revenue split when the same guide sells on both sites.
      `entitlements.ts` deliberately does not honour the other site's purchases.

---

## 4. Krealio — hobby, unlimited ceiling, cannot be forgotten

Treated exactly as you framed it: it ships, then it is left alone. No content
engine, no launch calendar, no percentage of weekly attention.

- [ ] 🔴 **Fix the copied text.** `messages/nl.json` still carries Kratos
      Natural's stats — `stat1` talks about systematic reviews and meta-analyses
      on an art brand. Embarrassing if anyone reads it.
- [ ] 🔴 **The sizes shop.** Clothing needs size variants, a size guide, and
      stock per size — none of which the Kratos Natural product model has, since
      a salt lamp has no size. **This is real work and I can build it.**
- [ ] 🔴 **Drop mechanics + waiting list.** Releases sit behind a waiting list.
      Needs: a signup that is not the newsletter, a "notify me" per drop, a drop
      state (announced / open / sold out), and an email that fires on open.
      **I can build this.**
- [ ] 🔴 👤 Domains + Vercel project + DNS.
- [ ] 🔴 👤 Own logo.
- [ ] 🟡 **Art gallery that is not a shop.** Art gets uploaded when you make
      something; originals are one-of-one and "weg is weg". Different object to
      a clothing drop and it needs its own model.
- [ ] 🟡 👤 Print/fulfilment decision: print-on-demand or hold stock. This
      changes the whole shop, so decide before it is built.
- [ ] 🟡 Returns policy for clothing — physical goods, sizes, 14-day EU right of
      withdrawal. Different from both digital guides and the lamp.
- [ ] 🟡 👤 EU textile labelling (fibre composition) if selling into the EU.
- [ ] ⚪ The two collab collections already named in the copy —
      *Kratos Natural x Krealio* and *Liam Kratos x Krealio*.

---

## 5. Monday 24 August — the cold start

The schedule starts Monday. Today is Friday 21st; tomorrow is the only working
day before it, because Sunday is a rest day and that is not negotiable in week
one of all weeks.

### The problem with week 1

The steady-state week films on Tuesday. But reels publish from **Monday**, and
Tuesday's footage does not exist yet — so week one has a hole in it that every
later week does not.

Two ways through. Pick one tomorrow morning, not Monday night.

**Option A — front-load Saturday.** Film Monday and Tuesday's reels tomorrow,
alongside writing the blog. Honest assessment: that is a heavy day, and the
blog is the thing that will suffer.

**Option B — reels start Wednesday in week 1.** Blog goes out Monday as
planned, research Thursday, newsletter Friday. Filming happens Tuesday as it
always will, and reels begin Wednesday. Week one publishes 4 reels per brand
instead of 6 and 5.

**Recommended: B.** The three fixed deadlines all hold, the schedule you
designed starts exactly as designed, and nothing is missed except three reels
in a week nobody is watching yet. Option A trades the blog — the one piece with
a real publication date — for volume on a channel with no audience.

### What has to be true by end of Saturday

**Must, or Monday does not happen:**

- [ ] 🔴 👤 **Monday's blog written.** This is the schedule's own Saturday task
      and the only thing with a Monday deadline.
- [ ] 🔴 👤 **Accounts exist and are reachable**: TikTok, Instagram, Facebook
      and X, for both brands. Nothing can be scheduled into an account that
      does not exist.
- [ ] 🔴 👤 **A scheduler chosen and connected.** Thursday only works as one
      session. Four separate apps is four sessions, and that is the version
      that quietly stops happening.

**Should, or Tuesday's film day is wasted:**

- [ ] 🟡 👤 **Eleven reel topics decided**, written down. Turning up to film
      without a list is how a filming day becomes a filming afternoon and then
      four videos.
- [ ] 🟡 👤 **Filming setup fixed in place** — camera, light, sound, framing.
      Eleven videos in a day only works if setup time is zero.
- [ ] 🟡 👤 **Wednesday's research article topic picked**, so Monday's writing
      day starts with a subject rather than a search.

**Not needed Monday — do not let these block the start:**

The shop being sellable. Guide prices, guide PDFs, covers, salt lamp specs.
None of that gates the content engine, and the plan is explicit that the
audience comes before the revenue. Publishing starts Monday whether or not
anything can be bought.

---

## 5. The week

Fixed deadlines, one filming day, one scheduling session. Nothing is published
by hand on the day it goes out — that is the only version of this that survives
past month two.

### The deadlines

| Publishes | Must be finished |
|---|---|
| Newsletter — **Friday** | Thursday |
| Research article — **Thursday** | Wednesday |
| Liam Kratos blog — **Monday** | Saturday |

### The week

| Day | Deep work | Goes out |
|---|---|---|
| **Mon** | Write the research article | Blog (written Sat) · reels · X |
| **Tue** | **FILM DAY** — all 11 videos, one session | reels · X |
| **Wed** | Edit and cut. **Research article done.** | reels · X |
| **Thu** | Newsletter written. **Schedule all of next week.** | Research article · reels · X |
| **Fri** | Coaching, admin, orders | **Newsletter** · reels · X |
| **Sat** | Write Monday's blog | reels · X |
| **Sun** | **Rest. Genuinely.** | — |

**Reels:** Liam Kratos 6×/week (Mon–Sat), Kratos Natural 5×/week (Mon–Fri).
Same videos in both languages. X on the same cadence, no testing. Reels also to
Facebook.

### The two rules that make it possible

**1. Film once, schedule once.** Tuesday is the only camera day; Thursday is
the only scheduling session. Everything else runs from a queue. Publishing by
hand is ninety-odd small decisions a week, and that — not the filming — is what
kills content calendars.

**2. Test in Dutch only.** Two or three hooks per video, TikTok first, Dutch
only. The winner gets cut in both languages and goes everywhere else.

Testing both languages means 55 TikTok uploads a week instead of 28, to answer
a question you already have: a hook that wins in Dutch wins in English, because
what is being tested is the *hook*, not the translation.

### What this costs

| | Per week | Per year |
|---|---|---|
| Videos made | 11 | **572** |
| Upload actions | ~94 | ~4,900 |
| Research articles | 1 | 52 |
| Blogs | 1 | 52 |
| Newsletters | 1 | 52 |

This is a full-time content operation, run by one person, alongside coaching, a
shop, and writing a hundred and sixty guides. It is achievable for a while and
not achievable indefinitely. The marketing plan puts a video producer as the
first hire; this table is the argument for making that hire earlier than
planned rather than later.

### If it cracks, cut in this order

Decided now, while it is calm, so it is not decided at 11pm on a Thursday in
month four.

1. **Kratos Natural reels 5 → 3.** Research articles are that brand's engine;
   reels amplify them.
2. **X.** Lowest reach per unit of effort on the list.
3. **Facebook.** Keep only while it returns something measurable.
4. **Liam Kratos reels 6 → 4.**

**Never cut, in increasing order of stubbornness:** the newsletter, the
research article, Sunday.

The newsletter is the only audience you own — everything else is rented from a
company that can change its mind. The research article is the moat. And a rest
day dropped "just this week" is how a nine-year plan becomes an eighteen-month
one.

- [ ] 🟡 👤 Pick a scheduler that posts to TikTok, Instagram, Facebook and X in
      one pass. Thursday only works if it is one session, not four.
- [ ] 🟡 👤 Decide the filming setup before the first Tuesday — 11 videos in a
      day only works with the camera already in place.

## 6. What I can start on immediately

Say which and I will build it:

1. **Draft one complete reference guide** end to end — Wave 1, real citations,
   the 7-section skeleton, the referral boundary. The quality bar for all ~164.
2. **Audit the three published articles** — every PMID resolves, every claim maps
   to a source, nothing overstates what the study found.
3. **The `/blog` route on liamkratos** so your own writing has somewhere to go.
4. **Krealio's sizes shop + drop/waiting-list mechanics.**
5. **The image cleanup** — delete the dead ones, convert the heavy ones.
6. **Accessibility pass** for the EAA, across all three.
