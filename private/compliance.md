# Compliance per market

What has to be true before a market is opened, and what every product must be
checked against before it is cleared for one.

**This is not legal advice.** It is the checklist of what to ask a professional,
written down so the questions are not rediscovered each time. Every 🔴 below
deserves a specialist's answer before the first sale into that market.

Paired with `src/lib/markets.ts`, which holds the two switches:

- `OPEN_MARKETS` — which markets the business has opened. **Currently `['NL']`.**
- `markets:` in each product's frontmatter — which markets that product has been
  **cleared** for. Required, no default, because a default would be a guess at a
  legal question.

A product is sellable only where both agree. Forgetting to widen either one
fails closed.

---

## The rollout

| Step | Market | State | Gate to open it |
|---|---|---|---|
| 1 | 🇳🇱 Netherlands | **open** | — |
| 2 | 🇪🇺 EU-27 | closed | §2 below fully answered |
| 3 | 🇬🇧 UK | closed | §3 below fully answered |
| 4 | 🇺🇸 USA | closed | §4 below — includes the device question |
| 5 | 🌍 Worldwide | closed | §5, and a way to determine region legally |

One at a time. The site is optimised for one market properly rather than being
half-right in four.

---

## 1. 🇳🇱 Netherlands — open

- [x] VAT: Dutch BTW, `tax_behavior: inclusive` on every price.
- [x] KvK 92192475 · BTW NL004942521B32 on the About page and legal notice.
- [ ] 🟡 **Warenwet / NVWA** — the Dutch implementation of EU food law governs
      supplement claims. Same underlying regime as §2, so answering the EU
      health-claims question answers this one too.
- [ ] 🟡 Right of withdrawal: 14 days, and the model withdrawal form must be
      reachable. Check the refund policy actually says this.
- [ ] 🟡 Digital products: the 14-day withdrawal right is **waived** for
      downloads only if the buyer expressly consents and acknowledges losing it.
      Checkout has to capture that consent, or every guide is refundable for 14
      days after download. **Not currently captured.**
- [ ] 🟡 Electrical safety for the lamp: CE marking, and the declaration of
      conformity kept on file.

## 2. 🇪🇺 EU-27

- [ ] 🔴 **Health claims — Regulation (EC) 1924/2006.** Only claims on the EU
      authorised register may be made on a supplement or food. Botanicals are
      "on hold" and a legal grey area. This constrains **product page copy**,
      not the research articles — but the line blurs the moment an article links
      to a product it makes claims about. Get the product pages reviewed
      specifically, not the site in general.
- [ ] 🔴 **VAT OSS registration.** A PDF sold to an EU consumer is taxed at the
      *buyer's* rate. One OSS registration covers all 27. Stripe Tax computes
      it; it does not register for you.
- [ ] 🔴 **GPSR (EU 2023/988)**, in force since Dec 2024. Physical products sold
      to EU consumers need a named EU responsible person, safety information and
      traceability shown on the listing.
- [ ] 🟡 **European Accessibility Act**, applies to e-commerce since June 2025.
      A real obligation. Site-side work I can do: contrast, focus order,
      labels, keyboard traps, and a published accessibility statement.
- [ ] 🟡 WEEE registration for electrical products, per member state.
- [ ] 🟡 Packaging/EPR registration, per member state.
- [ ] 🟢 Code change to open: add `'EU'` to `OPEN_MARKETS` and to each cleared
      product's `markets:`.

## 3. 🇬🇧 UK

- [ ] 🔴 **UK VAT registration.** Not covered by EU OSS. An overseas seller
      shipping goods to UK consumers generally registers from the **first sale** —
      there is no threshold the way there is for UK-established businesses.
- [ ] 🔴 **GB nutrition and health claims register.** Mirrors the EU list but is
      diverging post-Brexit. Assume it needs its own answer, not a copy of §2.
- [ ] 🟡 UKCA vs CE marking position for the lamp.
- [ ] 🟡 UK GDPR — largely aligned with EU GDPR, but a separate regime.
- [ ] 🟡 Customs and duties post-Brexit; who pays.

## 4. 🇺🇸 USA

The step change. Two items here can stop a US launch outright.

- [ ] 🔴 **Device classification for the infrared lamp.** A red/near-infrared
      device *marketed for* pain relief, wound healing or any therapeutic effect
      is a medical device under FDA rules and can require clearance before sale.
      Sold as a salt lamp: not a device. Sold with the claims currently on the
      product page: an open question. **Ask a US regulatory consultant before
      the first US order.** If the answer is unfavourable, the product simply
      stays cleared for `['NL','EU']` and is never offered there — which is what
      the per-product `markets` list exists for.
- [ ] 🔴 **FDA disclaimer on structure/function claims.** Any claim about how a
      supplement affects the body's structure or function requires: *"These
      statements have not been evaluated by the Food and Drug Administration.
      This product is not intended to diagnose, treat, cure or prevent any
      disease."* — on the label **and** in marketing carrying the claim.
      Implement as a component the pages always render, the way `MedicalNotice`
      is, so it cannot be forgotten on product forty.
- [ ] 🔴 **FTC substantiation.** Health claims need "competent and reliable
      scientific evidence" — for health claims, generally RCTs. We are better
      placed than most here because every claim already traces to a source, but
      the standard is high and "our analysis found X" still needs care.
- [ ] 🔴 **Sales tax nexus**, per state. Economic nexus commonly ~$100k or 200
      transactions. Stripe Tax calculates and can file; **registration is per
      state and is yours.**
- [ ] 🟡 Digital goods are taxable in roughly half the states — and not the same
      half that tax physical goods.
- [ ] 🟡 **California Prop 65** — electrical and mineral products can trigger a
      warning obligation.
- [ ] 🟡 CCPA/CPRA if California revenue crosses the threshold.
- [ ] 🟡 Customs, duties and returns for US delivery.
- [ ] 🟡 **USD pricing.** A euro price converted at checkout reads as an
      afterthought. Needs a USD price per product in Stripe.

## 5. 🌍 Worldwide

- [ ] 🔴 How region is determined, legally. Options, best first:
      1. **Buyer picks** their country. No personal data processed, no consent
         needed, never wrong about a VPN. Least clever, most defensible.
      2. **Geo-IP** from an edge header (Vercel provides one). An IP address is
         personal data under GDPR, so this needs a basis and a mention in the
         privacy policy.
      3. Browser locale. Guesses language, not location. Do not use it for a
         legal decision.
      Recommendation: **(1)**, with (2) only as a suggested default the buyer
      can override.
- [ ] 🟡 Everything in §2–4 again, per new market. Worldwide is not one decision.

---

## Per-product clearance checklist

Run this before adding a market to any product's `markets:` list.

- [ ] Is the product category itself legal to sell there without a licence?
- [ ] Does it need registration or notification before first sale?
- [ ] Do the **claims on its page** comply with that market's claims regime?
- [ ] Does it need market-specific labelling, marking or warnings?
- [ ] Is there an import restriction on any ingredient or component?
- [ ] Does it need a local responsible person or importer of record?
- [ ] Is VAT/sales tax handled for that market?
- [ ] Can it physically be shipped there at a sane cost, and returned?

### Current clearances

| Product | Cleared for | Blocked on |
|---|---|---|
| Himalaya-zoutlamp / salt lamp | `NL` | EU claims review (§2), then UK, then the US device question (§4) |

### Guides — a different shape

Digital products carry no shipping, so **Stripe cannot enforce a market for
them**: Checkout has an `allowed_countries` list for *shipping* addresses, and
no equivalent for billing. Restricting a guide by market is therefore
best-effort at the app layer, not a hard gate.

What actually matters for guides:

- [ ] 🔴 VAT OSS (§2) before selling PDFs across the EU.
- [ ] 🟡 The 14-day withdrawal waiver at checkout (§1) — applies to every guide.
- [ ] 🟡 The medical notice already renders on every guide page and cannot be
      forgotten. For the US, the FDA disclaimer joins it.
- [ ] 🟡 A guide is speech, not a product, which puts it in a far safer position
      than a supplement label. That is not a reason to relax the sourcing
      standard — it is the reason the sourcing standard is worth having.
