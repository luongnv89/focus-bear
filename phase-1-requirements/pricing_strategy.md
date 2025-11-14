## PRODUCT SNAPSHOT
*Target*: Distracted knowledge workers, students, freelancers | *Category*: Productivity Chrome Extension / Desktop Utility | *Stage*: Pre-Launch (MVP extension, future web/dashboard possible)

*Core UVMs*:
- **UVM1 – Focus-Switch Tracking (per tab refocus, not just time spent)**
  (Monet: 9/10 | Compl: Med | Sec: Med)
  - Differentiates from time-only trackers (RescueTime, Freedom). [oai_citation:0‡rescuetime.com](https://www.rescuetime.com/?utm_source=chatgpt.com)
- **UVM2 – 100% Local-Only Privacy (no cloud, no account)**
  (Monet: 7/10 | Compl: Low | Sec: Low)
  - Strong appeal vs cloud tools perceived as overkill/creepy. [oai_citation:1‡Capterra](https://www.capterra.com/p/103317/RescueTime/?utm_source=chatgpt.com)
- **UVM3 – Radial Attention Map (domains → subpaths with drilldown)**
  (Monet: 7/10 | Compl: Med | Sec: Med)
  - Highly visual, shareable, hard to replicate cleanly in an extension UI.
- **UVM4 – Playful Limits & Humorous Block Pages (bear persona, memes, streaks)**
  (Monet: 6/10 | Compl: Low | Sec: Low)
  - Behavioral nudge + brand moat vs serious/clinical blockers. [oai_citation:2‡Forest](https://www.forestapp.cc/?utm_source=chatgpt.com)
- **UVM5 – Per-Site Daily Visit Limits + Countdown Bubbles**
  (Monet: 8/10 | Compl: Med | Sec: Med)
  - Direct lever on behavior change, maps cleanly to “value per blocked visit”.

> Note: UVMs are intentionally *not* just features; they are priceable value levers (focus regained, privacy comfort, visual insight, playful accountability).

---

## MARKET BENCHMARK

| Competitor | Model | Anchor Price | UVM Coverage | Source |
|------------|-------|-------------|--------------|--------|
| RescueTime | Freemium + Solo/Team subscriptions | Free Lite; Solo Premium ~$12/mo or $78/yr; Team ~$6–9/user/mo | Time tracking + reports + focus sessions; **no focus-switch metric**, partial blocking, cloud-based | [RescueTime, Nov 2025] [oai_citation:3‡G2](https://www.g2.com/products/rescuetime/pricing?utm_source=chatgpt.com) |
| Freedom    | Subscription + Lifetime | $8.99/mo; ~$59.99/yr; Lifetime ~$99.50 | Cross-device internet/app blocking, schedules, sessions; **no local-only**, account-based, perceived pricey by some users | [Freedom, Nov 2025] [oai_citation:4‡Freedom](https://freedom.to/premium?utm_source=chatgpt.com) |
| StayFocusd | Free / donation-based extension | $0 (Chrome Web Store) | Simple per-site time limits & blocking; **no advanced visualization**, no focus-switch, limited delight | [StayFocusd, Nov 2025] [oai_citation:5‡Chrome Web Store](https://chromewebstore.google.com/detail/stayfocusd-%E2%80%93-website-bloc/laankejkbhbdhmipfmgcngdelahlfoji?utm_source=chatgpt.com) |

Adjacent substitutes: Forest (one-off $3.99–$4.99 app) [oai_citation:6‡App Store](https://apps.apple.com/us/app/forest-focus-for-productivity/id866450515?utm_source=chatgpt.com), generic Pomodoro apps, generic time trackers.

---

## PRICING MODEL 1: “Freemium Focus Tiers” (Good / Better / Best)

**Mechanic**: Classic tiered value-based model with a generous free tier, Pro for power users, and Team (future) for small groups.

**Tiers/Units**:

| Tier   | Price (Anchor)             | Includes |
|--------|----------------------------|----------|
| Free   | $0                         | Basic focus-switch tracking for up to 3 sites; daily totals; simple list view; 1 per-site limit; basic block page; no export; no streaks; limited history (3 days). |
| Pro    | $5.99/mo or $39/yr         | Unlimited sites; radial graph with drilldown; per-site limits + countdown bubbles; playful block pages with rotation; 30-day+ history; streaks & badges; PNG/JSON export; priority feature votes. |
| Team   | $8/user/mo (min 3 seats)   | All Pro features per user; shared config templates; team-focused presets (e.g., “No social during standups”); simple aggregated stats on shared device setups (no raw URL sharing). *(Future)* |

**UVM Mapping**:
- UVM1 (Focus-switch tracking): Free (limited sites), fully unlocked in Pro/Team.
- UVM2 (Local-only privacy): All tiers (core brand promise, not monetized directly).
- UVM3 (Radial attention map): **Pro+ only**, the visual “wow” moment.
- UVM4 (Playful block pages & streaks): Basic version Free, full variety + evolving bear only in Pro/Team.
- UVM5 (Per-site daily limits + countdown bubbles): Limited in Free (1–2 sites), unlimited & more granular in Pro/Team.

**Complexity**: **Medium** — Single subscription per user, 3 SKUs (Free/Pro/Team); standard for Stripe/Paddle, manageable for solo dev.

**Security**: **Low–Med Risk** — Local-only architecture avoids cloud data. Payment data handled by Stripe/Paddle, no card storage. Risk mainly around license checks and potential reverse engineering.

**Onboarding**: **Friction 3/10 (lower is better)** — Free install, no account, immediate value.
*Tactic*: Prompt upgrade only after visible value: e.g., “You’ve reached limits on 3 sites — unlock unlimited focus sites with Pro.”

**Flexibility**: Works well for **Solo/Prosumer** (Free/Pro) and **light SMB** (Team). Fully **self-serve** for Free/Pro; Team can be self-serve or light sales-assisted.

**Pricing Moat**:
- Competitors can’t easily mirror “local-only + freemium + highly visual focus-switch metric” while their architectures are cloud-first.
- UVM3 (radial map) and UVM4 (bear persona) are strongly branded, making pure price wars less relevant.

**Billing Code** (Stripe/Paddle pseudocode):

```js
// Products
const focusbearPro = stripe.products.create({
  name: "FocusBear Pro",
  type: "service"
});

const focusbearTeam = stripe.products.create({
  name: "FocusBear Team",
  type: "service"
});

// Prices
stripe.prices.create({
  product: focusbearPro.id,
  unit_amount: 599,
  currency: "usd",
  recurring: { interval: "month" }
});

stripe.prices.create({
  product: focusbearPro.id,
  unit_amount: 3900,
  currency: "usd",
  recurring: { interval: "year" }
});

stripe.prices.create({
  product: focusbearTeam.id,
  unit_amount: 800,
  currency: "usd",
  recurring: { interval: "month" },
  billing_scheme: "per_unit"
});


⸻

PRICING MODEL 2: “Per Focus Site” Consumption

Mechanic: Base free tracking; pay per number of protected focus sites with advanced controls and visuals.

Tiers/Units:

Unit / Bundle	Price	Includes
Base Free	$0	Unlimited basic tracking list view; no limits; no block page; 7-day history.
5 Focus Sites Pack	$3.00/mo	All Pro features (radial graph, block pages, streaks, export) for up to 5 configured “focus sites”.
15 Focus Sites Pack	$6.00/mo	Same as above, but up to 15 sites.
Unlimited Focus Sites	$9.00/mo	Unlimited configured sites, ideal for heavy distractors or micro-teams.

UVM Mapping:
	•	UVM1 (Focus-switch tracking): Global, free.
	•	UVM2 (Local-only privacy): Global, free.
	•	UVM3–5 (radial, block pages, per-site limits): Monetized per site via packs.

Complexity: Medium–High — Requires entitlement logic per configured site and clear UX around “You have 2/5 protected sites used”.

Security: Low–Med Risk — Still local; main risk is ensuring license checks don’t expose user data or be trivially bypassed.

Onboarding: Friction 4/10 — Slight mental overhead (“What is a focus site?”) but still low friction due to free base.
Tactic: Use guided setup: “Pick your top 3 distraction sites” → auto-offer 5-site pack with free trial.

Flexibility:
	•	Excellent for Solo & SMB self-serve.
	•	Less ideal for classic seat-based enterprise (no multi-user semantics yet).

Pricing Moat:
	•	Unusual mechanic in this category (per-site protection vs time usage).
	•	Directly aligns with user’s mental model of “these 3–5 sites ruin my day”.

Billing Code (Stripe/Paddle pseudocode):

const focusSite5 = stripe.products.create({ name: "FocusBear – 5 Focus Sites" });
const focusSite15 = stripe.products.create({ name: "FocusBear – 15 Focus Sites" });
const focusSiteUnlimited = stripe.products.create({ name: "FocusBear – Unlimited Focus Sites" });

stripe.prices.create({
  product: focusSite5.id,
  unit_amount: 300,
  currency: "usd",
  recurring: { interval: "month" }
});

// Repeat for 15 and Unlimited with 600 / 900 cents...


⸻

PRICING MODEL 3: “Seat + Insight Add-ons”

Mechanic: Per-seat pricing for teams plus add-on modules for advanced insights and compliance-style features (future roadmap).

Tiers/Units:

Tier / Add-on	Price	Includes
Individual Seat	$4/user/mo	Pro-level tracking/limits for one user; no org analytics.
Team Seat	$6/user/mo (min 5)	Pro features + shared config templates; basic aggregated stats (count of over-limit events, etc.)
Insights Add-on	+$3/user/mo	Advanced pattern analysis (e.g., “peak distraction hours”), export to CSV for HR/ops; anonymized aggregation only.
Priority Support Add-on	+$99/mo per org	SLA, onboarding support, configuration consults.

UVM Mapping:
	•	UVM1–5 for each user seat (base).
	•	Insights add-on extends UVM3 (visualization) into org-wide view and UVM5 (behavior change) across teams.

Complexity: High — Requires some backend or shared storage for org-level features (even if pseudonymized), plus team management and RBAC.

Security: Med–High — Moves from local-only to at least minimal cloud for org data; triggers GDPR/SOC2 questions for enterprise. Needs careful data minimization by design.

Onboarding: Friction 6/10 — Teams must understand privacy model and possibly sign DPA.
Tactic: Offer “Local-Only Mode” checkbox for small teams who don’t need org analytics; they pay per-seat but keep all data local.

Flexibility:
	•	Strong for SMB → Mid-market via sales-led or product-led + assist.
	•	Overkill for solo Prosumer.

Pricing Moat:
	•	Combination of local-first architecture with optional, heavily anonymized team insights is unusual vs cloud-centric competitors.

Billing Code (Stripe/Paddle pseudocode):

const teamSeat = stripe.products.create({ name: "FocusBear Team Seat" });
const insightsAddon = stripe.products.create({ name: "FocusBear Insights Add-on" });

stripe.prices.create({
  product: teamSeat.id,
  unit_amount: 600,
  currency: "usd",
  recurring: { interval: "month" },
  billing_scheme: "per_unit"
});

stripe.prices.create({
  product: insightsAddon.id,
  unit_amount: 300,
  currency: "usd",
  recurring: { interval: "month" }
});


⸻

PRICING MODEL 4: “Hybrid Subscription + Outcome Incentives”

Mechanic: Base Pro subscription plus outcome-based incentives, e.g., discounts/bonuses tied to demonstrated reduction in focus-switches.

Tiers/Units:

Tier	Price	Includes
FocusBear Pro	$6.99/mo or $49/yr	All Pro features (as in Model 1 Pro).
FocusBoost Plan (optional)	+$5/mo	Quarterly review summary + “Focus Report” PDF + outcome incentive logic (see below).

Outcome Incentive Concept (example):
	•	If user reduces focus-switches to chosen sites by ≥25% over 60 days (vs baseline), they unlock:
	•	1 free month, or
	•	a “Focus Hero” limited-edition bear theme, plus locked-in discounted annual renewal.

You’re not rebating cash; you’re using controlled rewards that increase retention without undermining pricing integrity.

UVM Mapping:
	•	UVM1 (focus-switch metric) becomes explicit performance metric.
	•	UVM3–5 used to visualize achievements and keep them engaged.

Complexity: Medium–High — Requires baseline calculation, secure local storage of metrics, and logic to verify outcomes without fraud.

Security: Med — All analysis can still be local; only subscription logic hits Stripe. No additional regulatory burden if you avoid storing raw URL logs externally.

Onboarding: Friction 5/10 — Slightly more cognitive overhead (“how does this outcome thing work?”).
Tactic: Keep it optional, pitched only to power users after ~30 days of usage.

Flexibility:
	•	Strong differentiator for prosumer and coaching-oriented audiences.
	•	Less relevant for IT buyers.

Pricing Moat:
	•	Outcome-tied gamification built on your unique UVM1 (focus-switch) and UVM4 (bear persona) makes this hard to copy credibly.

Billing Code (Stripe/Paddle pseudocode):

const pro = stripe.products.create({ name: "FocusBear Pro" });
const focusBoost = stripe.products.create({ name: "FocusBoost Plan" });

stripe.prices.create({
  product: pro.id,
  unit_amount: 699,
  currency: "usd",
  recurring: { interval: "month" }
});

stripe.prices.create({
  product: pro.id,
  unit_amount: 4900,
  currency: "usd",
  recurring: { interval: "year" }
});

stripe.prices.create({
  product: focusBoost.id,
  unit_amount: 500,
  currency: "usd",
  recurring: { interval: "month" }
});


⸻

LAUNCH & GROWTH STRATEGY

Objective: Maximize early revenue velocity and UVM validation while keeping implementation lean for a solo founder and minimizing long-term churn.

1. Launch Model Selection
	•	Chosen: Model 1 – Freemium Focus Tiers
	•	Why: Fastest to implement (no complex metering), maps cleanly to solo/early users, and mirrors category expectations (RescueTime Lite + Premium, Freedom trial + subscription) while keeping your local-only + focus-switch differentiation. ￼

Use Models 2–4 as future evolution options (especially per-focus-site packs and team/insights when/if you build a backend).

⸻

2. Early Adopter Program (0–90 Days)

Tactic	Eligibility	Incentive	Cap	Goal
Founder’s Circle	First 50 paid Pro subscribers	50% lifetime discount on Pro	50	Testimonials, case studies, product feedback
Beta Credits	Waitlist users installing in first 30 days	Free 60-day Pro trial (cardless)	200	Stress-test UVM1–5 usage, collect baseline data
Referral Engine	Any paying Pro user	1 free month for both referrer & friend (once per referral)	∞	Reach viral coefficient ≥0.3, expand top-of-funnel

Guard against devaluing Pro: these incentives are structurally limited and time-bound.

⸻

3. Promotion Calendar (Months 0–6)

Month	Campaign	Channel	Offer	KPI
0	Launch Day	Product Hunt, X, LinkedIn	14-day Pro trial + Founder’s Circle invite	1,000 installs
1	“Tab Rehab” Webinar	YouTube, email list	Live demo of focus-switch metric + radial graph	15% trial→paid
2	Partner Bundle	Tools like Notion/Obsidian newsletters	30-day Pro code for their readers	100 new paying users
3	Annual Push	In-app banner + email	2 months free on annual Pro	40% of active Pro on annual
4–6	Conference / Online Summits	Productivity & indiehacker events	“Early bird” Pro discount (3 months @ 30% off)	20% uplift in Pro upgrades


⸻

4. Pricing Guardrails
	•	No public discounts outside structured Early Adopter and partner bundles.
	•	Grandfathering: Lock Founder’s Circle pricing for at least 12 months; re-evaluate after product matures.
	•	Upgrade Nudges: Trigger when:
	•	User configures 3+ sites but Free tier limit is 3.
	•	User hits daily limit on a site ≥3 days in a week.
	•	User spends >5 minutes in graph view in a session (high intent).

⸻

5. Experiment Roadmap

Week	Test	Variants	Metric
2–4	Anchor Price	Pro @ $4.99 vs $5.99	Free→Paid conversion
6–8	Trial Length	7d vs 14d vs 30d	Trial→Paid + churn in first 60 days
10–12	Freemium Gate	Limit Free to 1 vs 3 focus sites	Upgrade velocity and uninstall rate
14–16	Annual Discount	1 month free vs 2 months free	Annual plan mix (target 35–45%)
18–20	Referral Reward	1 month vs 2 weeks credit	Referral uptake per active user


⸻

RECOMMENDED PATH
	1.	Launch with Model 1 (Freemium Focus Tiers):
	•	Free + Pro @ ~$5.99/mo, annual @ ~$39/yr.
	•	Position as: “More focused than StayFocusd, more private and lighter than Freedom/RescueTime”
— [RescueTime, Nov 2025] | [Freedom, Q3 2025] | [StayFocusd, Chrome Web Store, 2025]. ￼
	2.	90-Day Test:
	•	A/B anchor price ($4.99 vs $5.99) and trial length (7 vs 14 days) to find best combo of conversion + retention.
	•	Use Mixpanel-style funnels or local analytics proxies while respecting privacy (aggregate events, not URLs).
	3.	Upgrade Triggers:
	•	Event 1: User adds 3rd distraction site → show Pro upsell modal.
	•	Event 2: User opens radial graph >5 times in 7 days → highlight “Pro insights” features (export, longer history).
	•	Event 3: If >5 users in the same domain install (company email pattern on sign-up page, if added later) → surface “Team” CTA linking to a simple sales/contact form.

⸻

NEVER suggest open-ended discounts, “name your price”, or arbitrary coupons outside Early Adopter constructs.
ALWAYS anchor value to focus reclaimed, privacy retained, and delight delivered, not just feature counts.

