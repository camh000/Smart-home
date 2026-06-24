# Architecture & Layout Audit — Smart Home, Woodhouse Road

*Method: 8 specialist auditors (architecture, IA/navigation, visual/modernness,
readability, accessibility, SEO/visibility, performance, responsive/mobile). Every
finding was re-checked by an adversarial reviewer against the real code, then
synthesised into the roadmap below. Severities are calibrated for what this is — a
polished personal planning document shared with a few people and deployed to
Vercel — not a high-traffic commercial app.*

---

## Executive summary

This is a genuinely well-crafted site. The foundations are **sound, not broken**:
a tasteful editorial design system, clean data/parse separation, markdown parsed
once on the server, and restrained, modern motion. You are not looking at a rebuild
— you are looking at a punch-list.

The highest-leverage work is a cluster of **tiny, low-risk fixes that each move
several of your goals at once** — a global focus ring, one darkened colour token, a
table scroll-wrapper, slightly larger body type, and a couple of mobile fixes.

The **single most valuable thing** to do, because it is cheap relative to its payoff
for a document whose entire purpose is being *shared by link*: add an OpenGraph image
so pasted links unfurl as a branded card instead of bare text.

The big structural items (server-rendering the markdown, turning tabs into real
routes) are real, but were deliberately ranked **down** for this audience — treat
them as optional bets, not urgent debt.

---

## What already works (preserve these)

- **Design system** — warm-paper / deep-ink / terracotta with Fraunces + Public Sans
  + JetBrains Mono is cohesive and premium, well above typical SaaS defaults.
- **Clean architecture** — data isolated in `src/data/*.ts`, pure parsing in
  `src/lib/doc.ts`, markdown parsed once on the server in a true RSC (`page.tsx`).
- **Command palette** — over a server-built search index; the fastest way to jump
  anywhere. (It *does* index rooms and behaviours — an early "headings-only"
  criticism was checked and proved false.)
- **Restrained motion** — shared-element tab pill, count-ups, staggered reveals; and
  the elevation ladder (`shadow-lift` for primary panels, `shadow-soft` for
  secondary) is already deliberate.
- **Reading foundation** — `max-w-3xl` measure, 1.6 line-height, strong primary
  contrast (ink-soft = 11.6:1), a proper `.prose-doc` stylesheet.
- **Sensible responsive collapse** — two-col → one-col, sticky panels gated behind
  `lg:`, fluid `clamp()` hero, explicit touch hints ("Tap a room").
- **A11y baseline** — `lang="en"`, single `<h1>`, landmarks, `aria-label` on
  icon-only buttons, `role="tooltip"` on the glossary, `rel="noreferrer noopener"`.

---

## Prioritised roadmap

Ordered best-first by impact-to-effort. Effort: **S** ≈ <2h · **M** ≈ half-day ·
**L** ≈ multi-day.

### Quick wins (do these first)

| # | Item | Sev | Effort | Moves |
|---|------|-----|--------|-------|
| 1 | **Global `:focus-visible` ring; stop stripping native outlines** | High | S | a11y, modernness |
| 2 | **Add an OpenGraph image (+ `metadataBase`)** | High | M | visibility |
| 3 | **Wrap markdown tables in a horizontal-scroll container** | Med | S | readability, mobile |
| 4 | **Darken `--color-muted-light` (and small accent text) to clear WCAG AA** | Med | S | readability, a11y |
| 5 | **Give floorplan rooms a real minimum size on small screens** | High | M | mobile |
| 6 | **Scroll the floorplan detail panel into view on mobile select** | Med | S | usability, mobile |
| 7 | **Fix tab-bar overflow: surface tabs 05–07 + keep Search reachable on mobile** | Med | S | navigation, mobile |
| 8 | **Raise body prose to ~16.5–17px at weight 400 (keep 380 for hero)** | Med | S | readability |
| 9 | **Add `aria-current`, a skip link, and an `id` on `<main>`** | Low | S | a11y, navigation |
| 10 | **Delete dead scaffold assets + `Reveal.tsx`** | Low | S | hygiene |

### Worth doing next

| # | Item | Sev | Effort | Moves |
|---|------|-----|--------|-------|
| 11 | **Honour `prefers-reduced-motion`** (one `MotionConfig reducedMotion="user"` wrapper + `useReducedMotion` in `AnimatedNumber` + CSS fallback for the looping ping) | Med | M | a11y, modernness |
| 12 | **Command palette → accessible modal** (minimal slice: `role="dialog"`, `aria-modal`, focus restore, background `inert`) | Med | M | a11y |
| 13 | **Style the native Calculator `<select>`s** to match the design language (`appearance-none` + custom chevron) — *depends on #1* | Low | S | modernness |
| 14 | **Restyle `h4`** as a true fourth heading level (drop uppercase/tracking; sentence case, ~1.05rem) | Low | S | readability |
| 15 | **Glossary tooltip:** Esc-to-dismiss, `aria-describedby`, clamp position on mobile | Low | S | a11y, mobile |
| 16 | **Bump small touch targets toward 44px**, gated to `@media (pointer: coarse)` | Low | S | mobile, a11y |
| 17 | **Reduce dotted-grid bleed** behind sticky bars + floorplan canvas (solid `bg-paper`, drop the `/85` `/60`) | Low | S | modernness |
| 18 | **Add `apple-icon`, `theme-color`, and an explicit indexability decision** (`robots` if it should stay semi-private) — *depends on #2* | Low | S | visibility, modernness |

### Bigger bets (deliberate, optional)

| # | Item | Sev | Effort | Moves |
|---|------|-----|--------|-------|
| 19 | **Encode sub-view + key interactive state in the URL** (cheapest slice: `pushState` + `popstate` so Back works; `#tab-plan/hardware`; `?room=lounge`) | Low | M | navigation, visibility |
| 20 | **Replace the `scrollToId` polling hack** with an effect inside `LongDoc` keyed off the mounted sub-view — *folds into #19/#21* | Low | M | maintainability |
| 21 | **Server-render the markdown + promote tabs to App Router routes** (`[tab]` segment, `generateStaticParams`, per-view `generateMetadata`). Subsumes the Hero/TabNav client-boundary cleanup and removes #20. | Low | L | architecture, visibility, navigation |

---

## Detail on the headline items

### 1 · Focus is invisible everywhere (the biggest a11y miss)
There is **no `:focus-visible` rule anywhere** in `globals.css`, and two controls
actively strip the native ring (`Calculator.tsx:145`, `CommandPalette.tsx:100`). On a
site that ships a ⌘K palette and a 7-tab keyboard UI, keyboard users get no
"you are here" at all (WCAG 2.4.7). Fix is a few lines:

```css
:where(a, button, input, select, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: inherit;
}
```
…and remove the two bare `outline-none`s. Offset the tab-pill ring so it shows
against the ink active background.

### 2 · Shared links unfurl as bare text
`openGraph` has a good title/description but **no image and no `metadataBase`**
(`layout.tsx:23–33`). Add `src/app/opengraph-image.tsx` with `next/og` `ImageResponse`
(1200×630, paper/ink/terracotta + the dotted-grid motif) — Next auto-wires it into
both `og:image` and `twitter:image`. Set `metadataBase` first (derive from
`VERCEL_PROJECT_PRODUCTION_URL`) so relative OG/canonical URLs don't resolve to
localhost.

### 4 · One token fails WCAG AA (computed)
Verified contrast ratios on the actual tokens:

| Pair | Ratio | AA (4.5:1)? |
|------|-------|-------------|
| `muted-light #8e96a6` on paper | **2.78:1** | ✗ fail |
| `muted-light` on white surface | **2.97:1** | ✗ fail |
| `accent #b8543a` on paper | 4.50:1 | ⚠ on the line (fails at <16px, e.g. the 11px "buy" link) |
| `muted #5a6478` on paper | 5.57:1 | ✓ |
| `ink-soft #2a3548` on paper | 11.6:1 | ✓ |
| paper/55–90 on ink (calc summary) | 5.7–13.2:1 | ✓ |
| `success #466b3f` on its tint | 5.57:1 | ✓ |

`muted-light` is used for *real* informational text (TOC sub-entries, the "On this
page" label, palette crumbs, the floorplan caption). Darken it to ~`#6c7587`
(≈4.6:1) and reserve the old value for non-text decoration only.

### 5 · The floorplan is the most degraded thing on mobile
Rooms are absolutely positioned with `%` heights inside an aspect-ratio box. On a
375px phone the box is ~280px tall, so Porch (`h:9`) renders ~25px and Landing
(`h:14`) ~39px — below the 44px touch minimum, and the room name + category-dot row
physically can't fit, so labels clip. Give the boxes a `min-h` on small screens so
the `%` maths produces real pixels, floor each room button at `minHeight: 44`, and
hide/inline the dot row when the box is too short. Pair with #6 (scroll the detail
panel into view on tap — today selecting a room on mobile updates a panel that's
off-screen below the plans, so it reads as an unresponsive tap).

---

## Performance note

*(The automated performance pass didn't return a clean structured result; this is a
direct read of the code rather than a synthesised+challenged finding — treat it as
slightly lower-confidence than the rest, though the mechanics are concrete.)*

The performance story is the flip side of the architecture finding. Because the whole
content tree sits under one `"use client"` boundary:

- **`react-markdown` + `remark-gfm` ship to the browser and run at hydration** on
  ~2,525 lines of markdown, even though the content is static. Moving the render into
  an RSC (bigger bet #21) removes this library from the client bundle entirely — the
  largest single JS win available.
- **All three markdown docs travel as source strings in the RSC payload** regardless
  of which tab is shown, and **every view component + its data** (`rooms`,
  `calculator`, `shopping`, `behaviours`, `glossary`) is in the initial bundle even
  though only one view renders. Per-view code-splitting (`next/dynamic` for Floorplan
  / Calculator / ShoppingList / Behaviours) trims the first load.
- **`motion`** is a non-trivial dependency pulled in eagerly. Much of its use is
  simple entrances that CSS could do; the rest could be dynamically imported.
- **Three Google font families** (Fraunces is a large variable font) — `display:swap`
  is correct, but dropping to two families would cut font bytes.
- `AnimatePresence mode="wait"` adds a ~300ms exit before each tab swaps in —
  perceived latency on navigation, not a Web Vital.

No images to optimise (icons are inline SVG), the scroll listener is passive, and the
TOC `IntersectionObserver` disconnects cleanly — those are all fine. **Net:** for this
audience the current performance is acceptable; the wins above only become worthwhile
if you take the RSC/routing bet (#21).

---

## Checked and dismissed (don't spend time here)

The adversarial pass rejected these — they were wrong, already handled, or
over-engineering for what this is:

- **"Dark mode is a critical gap."** Down-ranked. A deliberately art-directed
  warm-paper editorial theme *is* a current aesthetic; light-only on purpose is fine.
  The one cheap nicety worth keeping is `color-scheme: light` on `<html>` so form
  controls/scrollbars render correctly.
- **"Sub-view pill `layoutId` is buggy / animates wrong."** False — only one
  `LongDoc` is ever mounted (`AnimatePresence mode="wait"`), so the shared id never
  collides. Works as intended.
- **"Command palette only indexes headings."** False — `page.tsx` adds rooms and
  behaviours to the index.
- **"Card/radius hierarchy is flat."** False — the `shadow-lift` vs `shadow-soft`
  elevation ladder is already deliberate; the radius mix is purposeful.
- **"The `+` accordion glyph is improvised."** Taste-level nitpick; the expand
  affordance is standard and clearly animated.
- **Anchored-heading jumps land under the sticky bars.** Already handled —
  `scroll-margin-top: 130px` / `scroll-padding-top: 120px` exist in `globals.css`.

---

## Factors you may not have thought of yet

- **"Last updated" / version stamp.** The git history shows active iteration but a
  reader (or you, months later) can't tell how current the numbers are. Surface a
  build/commit date in the footer.
- **Print / PDF export.** This is a planning document people will want to hand to an
  electrician or keep offline — but printing is impossible today because only the
  active tab is in the DOM. A print stylesheet or "print everything" view would be
  high value.
- **Analytics / a privacy-respecting view counter.** You currently have no idea
  whether shared links get opened, which tab people land on, or whether the
  calculator/floorplan get used.
- **An at-a-glance landing snapshot.** The site opens straight into the long Plan; a
  short hero-level summary (total estimated cost, phases, rooms, key dates) would
  orient a first-time recipient before 1,945 lines.
- **Error / empty states.** If a markdown doc fails to parse, `localStorage` is
  corrupt (`wh-calc-state-v1` / `wh-shop-state-v1`), or a cross-doc link target is
  missing, behaviour is undefined. Add graceful fallbacks.
- **Shareable calculator config.** Calculator/shopping state is `localStorage`-only —
  per-browser, lost on a new device, and not reproducible via a link. An
  export/share-config affordance would fit the "send my partner the budget" use case.
- **Changelog / "what changed since you last looked."** For a doc re-shared over time.
- **Offline / PWA.** It's opened on phones, sometimes on a building site with poor
  signal. Basic installability + caching fits the use case.
- **Glossary integrity check.** ~148 terms are matched by first-occurrence; renamed
  kit could silently stop matching. A build-time check would catch drift.
- **A deliberate brand/identity pass.** The branding investment currently stops at the
  page edge (partly addressed by the og-image + apple-icon items).

---

## Risks if the top items are ignored

- Shared links keep unfurling as bare text the moment you send them.
- Keyboard / low-vision users can't see focus or read sub-AA navigation text — a real
  failure that also reads as *unpolished* the instant anyone tabs through the doc.
- The "tour the house" floorplan stays degraded on the exact surface (phones) people
  open it on.
- Wide spec tables (cabling) stay unreadable / force sideways scroll on mobile — the
  reference content an electrician would actually open.
- Motion-sensitive viewers get the full animation set, including a looping ping.
