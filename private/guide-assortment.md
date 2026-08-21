# The guide & e-book assortment

Liam Krassenburg · augustus 2026 · intern

Companion to [the marketing plan](./marketing-plan.md). This is the content
architecture for the paid library: what gets written, in what order, and how the
pieces relate.

---

## 1. The model

**Category → domain → guide.** Three levels, because a reader browses at the
first and buys at the last.

```
BODY                          ← the shelf they browse
└── Houding & mechanica       ← the section they land on
    ├── De Houdingsbijbel  €34   (pillar e-book)
    ├── Eenzijdige dominantie €12
    └── Naar voren hangende schouders €12
```

**The five categories:** MIND · SOUL · BODY · NUTRITION · ENVIRONMENT

| Category | Domains |
|---|---|
| **Mind** | Stress & zenuwstelsel · Brein & focus · Slaap |
| **Soul** | Zingeving & doel · Overtuigingen · Dankbaarheid · Meditatie · Ademwerk · Manifestatie & visualisatie · Geloof |
| **Body** | Houding & mechanica · Fascie · Kracht & spiermassa · Metabole gezondheid · Bloedwaarden & testen |
| **Nutrition** | Voeding · Supplementen · Darmen & spijsvertering |
| **Environment** | Licht & circadiaan · Omgeving & toxines |

A guide declares only its **domain**; the category is derived, so a guide can
never disagree with its own domain about where it belongs. Category and domain
labels live in the message files, because a customer reads them and they have
to be in their language.

**Pillar e-book per domain → narrow guides per problem.**

One domain is researched once. The e-book is the whole domain. Each guide is one
specific problem a person actually has, sold on its own.

```
Houding (e-book, €34)
├── Eenzijdige dominantie          €12
├── Naar voren hangende schouders  €12
├── Anterior pelvic tilt           €12
├── Forward head / tech neck       €12
└── … 6 more
```

**Why this works commercially:** nobody searches "posture e-book". They search
"waarom hangt mijn linkerschouder lager". The guide is the answer to that exact
sentence, and the e-book is the upsell once they trust it. One research effort,
eleven sellable objects, ten of them ranking for long-tail search the e-book
never could.

**Why this works for us specifically:** it forces the research standard down to
the smallest unit. A guide about one problem, with every claim traced, is much
harder to fake than a broad e-book where vagueness hides.

### The rule that must not bend

A guide ships only when every claim in it traces to a published source, **and it
names the studies that found nothing.** That is the brand. A guide that reads
like every other PDF on the internet is worse than no guide, because it spends
credibility we are trying to accumulate.

Each guide ends with a link to the free analysis on the site that backs it.
Free research → paid application. The research is never the paywalled part.

---

## 2. Naming and structure

Matches the frontmatter `src/lib/guides.ts` already expects:

```yaml
---
title: 'Naar voren hangende schouders'
summary: 'Waarom je schouders naar voren rollen, wat de studies erover zeggen, en het protocol om het terug te draaien.'
priceId: 'price_…'
cover: '/guides/houding-schouders.jpg'
file: 'houding-schouders-nl.pdf'
pages: 24
order: 21
contents:
  - 'Wat het is, en wat het niet is'
  - 'De drie oorzaken die het bewijs ondersteunt'
  - 'Het protocol, week voor week'
  - 'Wat niet werkt, en waarom het toch verkocht wordt'
---
```

**Slug convention:** `{domein}-{probleem}` — `houding-schouders`,
`slaap-doorslapen`, `licht-ochtendlicht`. Keeps the shop sortable and makes the
domain obvious from the URL.

**Order convention:** domain number × 10 + guide number. Posture is domain 2, so
the e-book is `20` and its guides are `21`–`30`. Adding a domain never
renumbers an existing one.

---

## 3. The domain map

Twenty domains. This is what "everything you need to live optimally" means when
you actually enumerate it.

| # | Domain | Pillar e-book | Guides | Priority |
|---|---|---|---|---|
| 1 | Basis & principes | Longevity Basics *(free — done)* | — | ✅ |
| 2 | Houding & mechanica | Houding | 10 | **P1** |
| 3 | Slaap | Slaap | 8 | **P1** |
| 4 | Licht & circadiaan | Licht | 7 | **P1** ⭐ |
| 5 | Voeding | Voeding | 12 | **P1** |
| 6 | Supplementen | Supplementen | 10 | **P1** ⭐ |
| 7 | Kracht & spiermassa | Kracht | 9 | P2 |
| 8 | Uithoudingsvermogen | Conditie | 7 | P2 |
| 9 | Stress & zenuwstelsel | Stress | 8 | P2 |
| 10 | Darmen & spijsvertering | Darmen | 9 | P2 |
| 11 | Metabole gezondheid | Metabool | 8 | P2 |
| 12 | Bloedwaarden & testen | Testen | 7 | P2 ⭐ |
| 13 | Hormonen | Hormonen | 10 | P3 |
| 14 | Huid, haar & uiterlijk | Huid | 9 | P3 |
| 15 | Cognitie & focus | Brein | 8 | P3 |
| 16 | Herstel | Herstel | 7 | P3 |
| 17 | Omgeving & toxines | Omgeving | 8 | P3 |
| 18 | Mond & gebit | Mond | 5 | P4 |
| 19 | Ogen & zicht | Ogen | 5 | P4 |
| 20 | Seksuele gezondheid | — | 7 | P4 |

⭐ = existing published research already backs part of it (infraroodlicht,
nattokinase, externe tests).

**Total at completion: 19 e-books, ~164 guides.** That is the "most complete
assortment" made concrete — and it is a multi-year build, not a quarter.

---

## 4. Domain 2 — Houding, fully worked as the template

Your example, built out. Every other domain follows this shape.

**Pillar: `houding` — "De Houdingsbijbel"** · ~140 pages · €34

The whole domain in one book: every misalignment, its causes, and the chains
they run through — including the lower back, which is where most readers arrive
from. The child guides are the same material narrowed to one problem each.

| Order | Slug | Title | The search it answers |
|---|---|---|---|
| 21 | `houding-eenzijdige-dominantie` | Eenzijdige dominantie ✅ **written** | "één schouder lager dan de andere" |
| 22 | `houding-schouders` | Naar voren hangende schouders | "ronde schouders rechtzetten" |
| 23 | `houding-bekkenkanteling` | Anterior pelvic tilt | "holle rug buik vooruit" |
| 24 | `houding-nek` | Forward head & tech neck | "nek pijn van telefoon" |
| 25 | `houding-thoracaal` | Stijve bovenrug & ribflare | "bovenrug stijf tussen schouderbladen" |
| 26 | `houding-voeten` | Platvoeten & voetboog | "doorgezakte voeten" |
| 27 | `houding-knie` | Knievalgus / X-benen | "knieën naar binnen bij squat" |
| 28 | `houding-heup` | Heupshift & beenlengteverschil | "scheve heup" |
| 29 | `houding-bureau` | Zitten & bureau-opstelling | "beste zithouding bureau" |
| 30 | `houding-ademhaling` | Ademhaling & houding | "ademhaling ribbenkast houding" |

**Shared skeleton for every guide in the domain**, as set by the reference guide:

1. **Er is altijd een oorzaak** — the misalignment is a consequence, never a fact on its own
2. **De ketting** — how it propagates, link by link, each link separately sourced
3. **Alle oorzaken** — habit load, sport, work, breath/stress, structural, fascia
4. **Vind jouw eerste schakel** — self-tests plus a decision tree routing to a cause
5. **Het protocol** — eight weeks, a separate part per cause
6. **Wat níét werkt** — and which studies found nothing
7. **Wanneer je naar een professional moet** — the honest boundary
8. **Bronnen** — every PMID

**The labelling rule.** Every claim carries `[gemeten]`, `[model]`,
`[onbekend]` or `[geloof]`. This is what lets the guides teach causal chains without
overclaiming: individual links are published — the hip-abductor → pelvic-drop
link is experimentally causal, not merely correlated — while the full chain in
one person is a model the reader tests on themselves. Without the labels a
chain is a story; with them it is a tool.

Section 5 and 6 are the ones competitors skip. They are the reason to buy ours.

⚠️ **Medical boundary:** posture guides sit close to physiotherapy. Section 6 is
not optional, and scoliosis, hernia and acute pain get referred out, never
protocolised. Same rule across every domain: we write about optimising a healthy
body, not treating a diagnosed condition.

---

## 5. Production order

Do not write in domain order. Write in the order that compounds.

**Wave 1 (2026 Q3–Q4) — the domains research already backs**
`licht`, `supplementen`, `testen`. The infraroodlicht and nattokinase analyses
are published; the guides are the applied layer on top. Fastest to ship
honestly, and they prove the free-research → paid-application loop.

**Wave 2 (2027 H1) — the domains with the biggest search volume**
`houding`, `slaap`, `voeding`. Highest demand, and posture in particular is
almost entirely served by unsourced content today. Easiest place to be visibly
better.

**Wave 3 (2027 H2)** — `kracht`, `stress`, `darmen`, `metabool`
**Wave 4 (2028)** — `hormonen`, `huid`, `brein`, `herstel`, `omgeving`
**Wave 5 (2028+)** — `conditie`, `mond`, `ogen`, seksuele gezondheid

**Cadence target: 2 guides/month from Q4 2026, 4/month from mid-2027.** At 4/month
the library completes around 2030 — the same year the marketing plan wants 200+
published analyses. They are the same effort viewed from two sides: the free
analysis is the research, the paid guide is the application.

---

## 6. Pricing

| Object | Price | Role |
|---|---|---|
| Longevity Basics | **free** | Lead magnet. Never priced. |
| Single guide | **€12** | Impulse. Cheaper than the thought of comparing. |
| Pillar e-book | **€34** | ≈3 guides, contains 8–12. Obvious upgrade. |
| Domain bundle (3 e-books) | **€79** | Thematic, e.g. "Beweging" |
| Complete library | **€249** | Everything, forever, including future guides |

**Deliberate choices:**

- **The library includes future releases.** It turns a one-off into a reason to
  stay on the list, and it converts early buyers into people who want the
  library to grow — which is free distribution.
- **No subscription.** A recurring charge for static PDFs is the kind of thing
  our own manifest argues against.
- **No discount ladder.** Per the marketing plan: one or two events a year,
  maximum. Permanent discounting teaches people the price is fake.
- **The research stays free.** Always. The guide is the applied protocol; the
  evidence behind it is never the paywalled part.

---

## 7. Production checklist per guide

- [ ] Every claim traced to a published source
- [ ] Null results included and named
- [ ] Section 5 ("wat niet werkt") written and specific
- [ ] Section 6 (referral boundary) present
- [ ] Linked to its free analysis on the site
- [ ] Stripe price created, `tax_behavior: inclusive` **at creation**
- [ ] PDF in `private/guides/`, never `public/`
- [ ] Cover image in `public/guides/`
- [ ] NL and EN both, or deliberately NL-only and recorded as such
- [ ] Frontmatter complete — a missing field fails the build by design

---

## 8. Where it lives — decided

**Both sites sell the same library.** Kratos Natural carries the research and
the shop; liamkratos carries the person, his own blogs, and the same guides.

Built in Kratos Natural (August 2026): `src/lib/guides.ts`,
`src/lib/entitlements.ts`, `api/checkout/guide`, `api/download/[slug]`,
`/guides` and `/guides/[slug]`, plus downloads on the account page. liamkratos
has the older copy of the same machinery and needs the newer changes brought
back across.

**One consequence, decided deliberately:** `entitlements.ts` only honours
purchases stamped with its own site. A guide bought on liamkratos does not
unlock on Kratos Natural. That keeps the two sets of books knowable, at the cost
of someone theoretically paying twice. Revisit if it ever actually happens.

---

## 9. The medical boundary

Not a section in each guide to remember — **a component the pages always
render**. `MedicalNotice.tsx` appears on the guides index and on every guide
page, because a notice an author has to remember is a notice missing from guide
forty-seven. Forgetting it would mean deleting code.

What it says, in both languages: these guides optimise a healthy body, they are
not medical advice, nothing here diagnoses or treats, talk to your doctor or
physiotherapist first — and especially so with a diagnosed condition, pain,
pregnancy or medication.

On top of that, **section 6 of every guide** is the referral boundary in that
guide's own terms. Scoliosis, hernia and acute pain get referred out, never
protocolised. The blanket notice covers the site; section 6 covers the specific
thing the reader came for.


---

## 10. Soul, and how it stays honest

Soul is the category where the research standard is most at risk, and also the
one with the most to gain from keeping it. The rest of the library buys the
credibility that makes anything said here worth reading; spending that
credibility on one unsourced sentence is a bad trade.

The way through is not to soften the standard. It is to add a fourth label.

### `[geloof]` — the fourth label

The existing three all make claims *about the world* at different strengths of
evidence. A belief is a different kind of statement, and pretending otherwise
is what damages both sides of it:

| Label | Means |
|---|---|
| `[gemeten]` | Published, cited, checkable. |
| `[model]` | Follows from measured parts; the whole is not itself tested. |
| `[onbekend]` | Claimed by others, not supported — or studied and found nothing. |
| **`[geloof]`** | **Stated as conviction, not as evidence. Held, not proven.** |

Marking something `[geloof]` is not a weaker version of `[gemeten]`. It is an
honest declaration that this is not the kind of claim a study settles. A reader
who disagrees with the belief can still trust every `[gemeten]` line on the
page — which is precisely what is lost if the two are blended.

### Where each topic actually stands

Written down so a guide starts from the truth rather than discovering it late.

| Topic | Standing |
|---|---|
| **Purpose & meaning** | Strong. Purpose in life is associated with all-cause mortality across large cohorts and meta-analysis. |
| **Gratitude** | Real RCT literature on well-being. Effects are genuine and modest — report the size, not just the direction. |
| **Meditation** | Large literature, including Cochrane-level reviews. Real, generally modest, and heavily dependent on what was measured. |
| **Breathwork** | Slow breathing and vagal tone / HRV is well-studied physiology. **The growth-hormone claim is specific and needs its own sources before it is written**, not assumed. |
| **Beliefs** | Maps onto published constructs: self-efficacy, mindset, expectancy and placebo research. Defensible when framed that way. |
| **Fascia** | Real tissue, real mechanics, measured force transmission at a distance. "Release and reset" is a therapy claim and a weaker one — separate the two. |
| **Manifestation** | Split it. Mental rehearsal and motor imagery have a real sports-psychology literature `[gemeten]`. "The universe delivers" is `[geloof]`. Same guide, different labels. |
| **Quantum jumping** | No published basis, and the word "quantum" is borrowed from physics for something that is not physics. Either `[geloof]`, or reframe around identity-based change, which does have literature. |
| **Jehovah** | Not a scientific claim and cannot be made one. But **religion and health is a real research field** — service attendance and mortality, religious practice and well-being — so the honest move is to cite research *about practice*, and mark the theology `[geloof]`. |

### The line that must not blur

Do not write that studies prove a theological claim. They cannot, and a reader
who knows the literature will stop trusting the rest of the library the moment
they see it.

What is true, defensible and still says what you want to say: **practices that
these teachings ask for — gratitude, purpose, rest, community, restraint —
turn out to be measurable, and the measurements are good.** That is a real
finding, it is citable, and it is more persuasive than the overclaim, because
a sceptic can check it.


---

## 11. Next guides to write

### `zingeving-weten-wat-je-wilt` — "Weten wat je wilt"

*Why not knowing exactly what you want is the thing keeping you stuck.*

Liam's, and it has an unusually strong evidence base for a Soul guide — which
makes it the right one to write first in that category, because it sets the
standard the softer subjects will be measured against.

**The literature to build it on** (verify each before writing; goal-setting
research lives in psychology and management journals rather than PubMed, so it
needs sourcing outside the usual search):

- **Goal-setting theory** — specific, difficult goals outperform "do your
  best". One of the most replicated findings in applied psychology.
- **Implementation intentions** — "when X, I will do Y". Large meta-analytic
  support for closing the gap between intention and action.
- **Goal conflict and ambivalence** — competing goals predict *inaction*,
  which is the mechanism behind "stuck" and the actual subject of the guide.
- **Sudden gains** — see below. Relevant because clarity is often what precedes
  a discontinuous change rather than a gradual one.

**The honest shape:** vagueness is not a motivation problem, it is a
specification problem. That claim is defensible from the literature, it is
useful, and it does not need a single unsourced sentence.

### On sudden, discontinuous change

Worth recording because it changes how one Soul subject gets labelled.

The experience of changing completely and quickly — rather than by degrees —
has a real research literature under the name **sudden gains**: measured,
replicated across conditions and populations, and indexed. Recent examples:
**PMID 40288269**, **PMID 40955789**, **PMID 39786803**.

Psychology also carries the term **quantum change** (Miller & C'de Baca) for
the same phenomenon, though that sits in book and APA literature rather than
PubMed and needs its own verification before being cited.

**What this means practically:** a guide about rapid identity change does not
have to be `[geloof]`. Framed as sudden gains — discontinuous change, what
precedes it, what makes it hold — it can be `[gemeten]`. The physics metaphor
in "quantum jumping" is the only part that cannot be sourced, and it is also
the part the guide does not need.


---

## 12. Where to look, before writing anything

PubMed is not the library. It indexes biomedicine, so it is the right tool for
a supplement, a lamp or a physiotherapy protocol — and close to useless for
goal-setting, beliefs, gratitude or meditation, which live in psychology and
management journals it does not carry. Searching PubMed for those and finding
nothing is not evidence of absence; it is evidence of the wrong database.

**So: pick the databases before writing, per guide, and write them down.**

### The databases, and what each is for

| Source | Covers | Access |
|---|---|---|
| **PubMed / NCBI E-utilities** | Biomedicine, physiology, clinical trials, Cochrane reviews | Free API. The web page CAPTCHAs; the API does not — use `eutils.ncbi.nlm.nih.gov`. |
| **OpenAlex** | Everything, including psychology, management, education. Returns DOI, year and citation count. | Free, no key. `api.openalex.org`. **The default for anything not biomedical.** |
| **Crossref** | DOI metadata, for verifying a reference exists as described | Free, no key. |
| **Cochrane Library** | Systematic reviews, highest evidence tier | Reachable through PubMed. |
| **PsycINFO (APA)** | Psychology, the deepest coverage | Paywalled. Find the record elsewhere, then verify. |
| **PsyArXiv / SSRN** | Preprints | **Not peer reviewed. Never cite as settled** — usable only to find a paper that was later published. |

### The rule

A guide names its databases in the manuscript before the first claim is
written. If a subject has no usable database, that is a finding: it means the
claim is `[geloof]` or `[onbekend]`, not that the search failed.

### What "verified" means here

Every citation resolves to a real record with a matching title, year and
venue, retrieved from an API rather than from memory. A DOI or PMID that was
never checked is worse than no citation, because it looks like diligence.


---

## 13. Capture list — future guides

Ideas land here as they arrive. Nothing here is committed to; the point is that
an idea stops living in your head and starts being checkable. Each gets a
one-line note on where the evidence stands, so the writing starts from the
truth rather than discovering it late.

Add to this freely. Deciding comes later.

### `consumptie` — "Alles wat je consumeert"

*Everything you take in — food, reels, music, rooms, people — is stored and
becomes who you are. And that can be used deliberately.*

Category: **Mind** (behaviour and identity), with a foot in **Environment**.

**Where the evidence stands — this one needs care, because it splits.**

| Part of the claim | Standing |
|---|---|
| Your environment shapes what you eat and do | **Solid.** Food environment and choice architecture is a real, replicated literature. |
| Repeated exposure changes preference | **Solid.** The mere-exposure effect is one of the older, better-replicated findings in psychology. |
| Heavy media consumption shapes how you believe the world is | **Reasonable.** Cultivation research is real, though effect sizes are argued over. |
| Behaviour follows identity, and identity can be chosen | **Reasonable.** Self-perception and identity-based behaviour change have support. |
| Subliminal input is silently programming you | ⚠️ **Weak, and a trap.** Social priming was hit hard by the replication crisis — several famous results did not survive. Do not build the guide on it. |

**The honest shape:** not "your subconscious is being programmed", which leans
on the shakiest part — but *what you repeatedly put in front of yourself
changes what you want, and you can choose what you put there.* That version is
defensible, is the same practical advice, and does not collapse when somebody
checks it.

### `geloof-celestial-terrestrial` — "Hemels en aards"

Category: **Soul**, domain **Geloof**.

Scriptural rather than scientific — the terms come from the writings, not from
a study. This is `[geloof]` territory throughout, and that is fine as long as
it is labelled, sits under Geloof where a reader knows what they are getting,
and does not borrow the authority of the cited guides.

Worth deciding before writing: whether the faith guides are sold alongside the
researched ones or offered separately. They are a different kind of thing, and
mixing them on one shelf is the fastest way to make a sceptic distrust both.

### Still to be captured

- Ademwerk and the growth-hormone claim (needs its own sources first — §10)
- Rapid identity change, framed as sudden gains (§11)
- Dankbaarheid, meditatie — both have real literature, neither written yet
