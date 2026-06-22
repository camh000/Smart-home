# Smart Home — Woodhouse Road

An interactive, animated presentation of the Woodhouse Road smart-home project: a
bespoke, self-hosted replacement for Alexa built on **Home Assistant** with
**Claude** as the reasoning layer — voice control, lighting, locks, blinds, CCTV,
per-room presence and proactive automation.

This is a rebuild of the original single-file HTML plan as a modern React site
(Next.js + Framer Motion), deployable to Vercel.

## What's here

The site presents the plan as six views:

| View | What it is |
|------|------------|
| **Project Plan** | The full working plan — kit, rooms, heating, audio, privacy, phasing, costs. |
| **Claude + HA** | The technical integration design — software stack, conversation flow, memory/RAG architecture, latency budget. |
| **Behaviours** | The 14 "JARVIS" signature behaviours, as expandable cards. |
| **Floorplan** | An interactive schematic of both floors + garage. Filter by category, tap a room to see its planned kit. |
| **Cost Calculator** | Live budget builder with Minimal / Balanced / Generous presets. Saves to your browser. |
| **Shopping List** | Everything to buy, ordered by build phase, with tickable progress that persists locally. |

The two long-form documents are rendered from the source markdown in
`src/content/`, so the plan stays the single source of truth.

## Tech

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Motion** (Framer Motion) for scroll reveals, layout animations, animated totals
- **Tailwind CSS v4** for the warm-paper / deep-ink / terracotta design system
- `react-markdown` + `remark-gfm` for the rendered plan documents

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

## Project structure

```
src/
  app/            layout, global styles, server page (reads the markdown docs)
  components/     Hero, TabNav, Floorplan, Calculator, ShoppingList, Behaviours, …
  content/        plan.md, integration.md  (source-of-truth documents)
  data/           rooms, calculator config, shopping list, behaviours, categories
```

## Deploy

Zero-config on **Vercel** — import the repo (or run `vercel --prod`) and the
Next.js build runs as-is.
