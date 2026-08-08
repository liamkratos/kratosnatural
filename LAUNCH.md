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

## 0. Do these first, everything else waits

- [ ] 🔴 👤 **Roll the `sk_live_` key that was pasted into a chat.** Stripe →
      Developers → API keys → roll, then update `STRIPE_SECRET_KEY` in Vercel on
      every project using it. Treat it as compromised until done.
- [ ] 🔴 👤 **Decide the launch order.** Three sites at once is three half
      launches. Recommendation: Kratos Natural first (it is the €1B vehicle),
      Liam Kratos second, Krealio third and quietly.
- [ ] 🔴 👤 **Authorise the Stripe connector** if you want me creating prices and
      products directly. Right now it is unauthenticated in this session, so
      every Stripe step below is yours. Do it from your claude.ai connector
      settings, or `/mcp` in an interactive terminal.

---

## 1. Market expansion: USA + full EU + UK

This is the section you did not ask for and most needs writing down. Adding the
US is not a bigger version of selling to Belgium — it is a different legal
regime, and two items here can stop the whole thing.

**I am not a lawyer and this is not legal advice.** It is a list of what to ask
a professional about, and every item below deserves one before you sell into
that market.

### 🔴 The two that can actually stop you

- [ ] 🔴 👤 **The infrared lamp may be a regulated medical device in the US.**
      A red/near-infrared device marketed for pain, wound healing or any
      therapeutic effect is a device under FDA rules and can need clearance
      before it is sold there. Sold as a *salt lamp*, no problem. Sold with the
      claims currently on the product page, the classification question is real.
      Ask a US regulatory consultant **before** the first US order, not after.
- [ ] 🔴 👤 **FDA disclaimer on US structure/function claims.** Any supplement
      claim about how something affects the body's structure or function needs
      the statement "These statements have not been evaluated by the Food and
      Drug Administration. This product is not intended to diagnose, treat, cure
      or prevent any disease." — on the label *and* in marketing that carries the
      claim. Needs to be a component, like `MedicalNotice`, so it cannot be
      forgotten.

### EU

- [ ] 🔴 👤 **Health claims regulation (EC 1924/2006).** On a supplement or food
      product page, only claims on the EU authorised register may be made. This
      constrains product copy, not the research articles — but the line blurs the
      moment an article links to a product it makes claims about. Get the product
      pages reviewed specifically.
- [ ] 🔴 👤 **VAT OSS registration for digital sales.** Selling a PDF to an EU
      consumer means VAT at the *buyer's* rate. One OSS registration covers all
      member states. Stripe Tax computes it; it does not register for you.
- [ ] 🔴 👤 **GPSR (General Product Safety Regulation).** In force since Dec
      2024. Selling physical products to EU consumers requires a named EU
      responsible person, safety information and traceability on the listing.
- [ ] 🟡 **European Accessibility Act.** Applies to e-commerce since June 2025.
      A real obligation, not a nice-to-have. I can run an audit pass and fix the
      site side — contrast, focus order, labels, keyboard traps.
- [ ] 🟡 Extend `allowed_countries` to the full EU. Currently 14 of 27:
      missing GR, CZ, SK, HU, RO, BG, HR, SI, EE, LV, LT, CY, MT.

### UK

- [ ] 🔴 👤 **UK VAT registration.** Not covered by EU OSS. An overseas seller
      shipping goods to UK consumers generally has to register from the first
      sale — there is no threshold the way there is for UK-established sellers.
- [ ] 🟡 👤 **GB health claims register.** Mirrors the EU list but is diverging
      post-Brexit. Assume it needs its own check, not a copy of the EU answer.
- [ ] 🟡 👤 UKCA / CE marking position for the lamp.
- [ ] 🟡 Add `GB` to `allowed_countries`.

### USA

- [ ] 🔴 👤 **Sales tax nexus.** Economic nexus is per-state (commonly ~$100k or
      200 transactions). Stripe Tax can calculate and file, but registration is
      per state and is yours.
- [ ] 🟡 👤 **Digital goods tax.** PDFs are taxable in roughly half the states,
      and not the same half that tax physical goods.
- [ ] 🟡 👤 **California Prop 65.** Electrical products and mineral products can
      trigger a warning obligation.
- [ ] 🟡 👤 **CCPA/CPRA** if California revenue crosses the threshold.
- [ ] 🟡 👤 Customs, duties and returns for US delivery. Decide who pays.
- [ ] 🟡 **USD pricing.** Stripe multi-currency, or a US price per product.
      Converting €12 at checkout looks like an afterthought; $12 does not.

### Site work that follows from all of it

- [ ] 🟡 **A third locale is probably wrong.** `en` currently serves everyone
      outside NL. US English and UK English differ in spelling, units, and legal
      furniture. Cheapest correct answer: keep `en`, but make the legal blocks
      (disclaimers, tax lines, shipping) region-aware rather than forking the
      whole site.
- [ ] 🟡 Region-aware shipping and returns copy. A US buyer reading "PostNL or
      DHL, 14 days" is reading someone else's policy.

---

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
- [ ] 🔴 One complete reference guide, written end to end, as the quality bar
      everything else is measured against. **I can draft this — say the word.**
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

- [ ] 🟡 **Dead images in `public/`**: `anti-wrinkle.png` (2.2MB),
      `anti-wrinkle-protocol.png` (1.5MB), `stream.jpg` (2.6MB),
      `swiss-view.jpg` (1.7MB) are not referenced anywhere. Delete or use.
- [ ] 🟡 **Oversized images.** `slow-down-aging.png` is 2.6MB and renders in the
      homepage slider. Convert to WebP and resize — this is the single biggest
      page-weight win available.
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

## 5. The weekly rhythm

The plan needs 18 months of consistent publishing through near-zero traction.
That only survives if it is a schedule, not a mood.

| Day | Block | What |
|---|---|---|
| **Mon** | Deep work | Write. One guide section or one article. No admin. |
| **Tue** | Film | Everything for the week, one session. Batch or it will not happen. |
| **Wed** | Coaching | All client calls in one day. Protects the rest of the week. |
| **Thu** | Edit + publish | YouTube long-form out. Cut the shorts from it. |
| **Fri** | Kratos Weekly | Newsletter, without exception. Then admin and orders. |
| **Sat** | Shorts + Krealio | Schedule the week's shorts. Krealio only if it is fun. |
| **Sun** | Off | Genuinely off. The plan is nine years long. |

**Monthly:** review the one metric for the current phase (right now: **email
subscribers**, not revenue). **Quarterly:** re-read the manifest and check the
work still matches it.

- [ ] 🟡 👤 Commit to this, or edit it into something you will actually hold.
      A schedule you ignore is worse than none.

---

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
