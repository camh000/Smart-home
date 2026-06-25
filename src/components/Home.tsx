"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { SHOPPING } from "@/data/shopping";
import { ROOMS } from "@/data/rooms";
import { CATEGORIES } from "@/data/categories";
import { BEHAVIOURS } from "@/data/behaviours";
import { AnimatedNumber } from "./AnimatedNumber";

const NAV: { key: string; num: string; title: string; blurb: string }[] = [
  { key: "plan", num: "01", title: "Project Plan", blurb: "The full working plan — kit, rooms, heating, audio, privacy, phasing and costs." },
  { key: "integration", num: "02", title: "Claude + HA", blurb: "The technical integration — software stack, conversation flow, memory/RAG, latency." },
  { key: "behaviours", num: "03", title: "Behaviours", blurb: "The JARVIS-style signature behaviours, as expandable cards." },
  { key: "floorplan", num: "04", title: "Floorplan", blurb: "Interactive schematic of both floors + garage. Tap a room for its planned kit." },
  { key: "calculator", num: "05", title: "Cost Calculator", blurb: "Live budget builder with Minimal / Balanced / Generous presets." },
  { key: "shopping", num: "06", title: "Shopping List", blurb: "Everything to buy, by build phase, with tickable progress." },
  { key: "cabling", num: "07", title: "Cabling Spec", blurb: "The structured-cabling specification — the physical backbone." },
];

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.04, ease: [0.21, 0.6, 0.35, 1] as const },
  }),
};

function phaseParts(title: string): { num: string; label: string } {
  const [head, ...rest] = title.split(" — ");
  const num = head.replace(/[^0-9]/g, "") || "•";
  return { num, label: rest.join(" — ") || head };
}

export function Home({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const totalCost = SHOPPING.reduce(
    (sum, p) => sum + p.items.reduce((a, it) => a + it.cost, 0),
    0,
  );
  const phases = SHOPPING.map((p) => ({
    ...phaseParts(p.title),
    total: p.items.reduce((a, it) => a + it.cost, 0),
  }));

  const stats: { value: ReactNode; label: string }[] = [
    { value: <AnimatedNumber value={totalCost} />, label: "indicative build cost" },
    { value: SHOPPING.length, label: "build phases" },
    { value: ROOMS.length, label: "rooms mapped" },
    { value: BEHAVIOURS.length, label: "signature behaviours" },
  ];

  // House-wide kit tally, computed from the floorplan so it stays correct.
  const kit = CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    color: c.color,
    count: ROOMS.reduce(
      (n, r) => n + r.items.filter((it) => it.cat === c.key).length,
      0,
    ),
  })).filter((c) => c.count > 0);

  return (
    <div className="pt-2">
      {/* At a glance */}
      <motion.div
        custom={0}
        variants={reveal}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="font-display text-3xl font-medium tracking-tight text-accent">
              {s.value}
            </div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted">
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Kit by the numbers */}
      <motion.section custom={1} variants={reveal} initial="hidden" animate="visible" className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
          <h2 className="font-display text-xl font-medium tracking-tight text-ink">Kit by the numbers</h2>
          <button
            onClick={() => onNavigate("floorplan")}
            className="font-mono text-[11px] text-accent transition-colors hover:text-accent-soft"
          >
            floorplan →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {kit.map((k, i) => (
            <motion.button
              key={k.key}
              custom={i}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              onClick={() => onNavigate("floorplan")}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 text-left shadow-[var(--shadow-soft)] transition-colors hover:border-line-strong"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: k.color }} />
              <span className="min-w-0">
                <span className="block font-display text-2xl font-medium tracking-tight text-ink">{k.count}</span>
                <span className="block truncate font-mono text-[10.5px] uppercase tracking-wide text-muted">{k.label}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Build phases timeline */}
      <motion.section custom={2} variants={reveal} initial="hidden" animate="visible" className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
          <h2 className="font-display text-xl font-medium tracking-tight text-ink">Build phases</h2>
          <button
            onClick={() => onNavigate("shopping")}
            className="font-mono text-[11px] text-accent transition-colors hover:text-accent-soft"
          >
            shopping list →
          </button>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {phases.map((p, i) => (
            <motion.li
              key={i}
              custom={i}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            >
              <button
                onClick={() => onNavigate("shopping")}
                className="flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 text-left shadow-[var(--shadow-soft)] transition-colors hover:border-line-strong"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-tint font-mono text-sm font-bold text-accent">
                  {p.num}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink">{p.label}</span>
                  <span className="font-mono text-[11px] text-muted">
                    £{p.total.toLocaleString("en-GB")}
                  </span>
                </span>
              </button>
            </motion.li>
          ))}
        </ol>
      </motion.section>

      {/* Explore */}
      <section className="mt-10">
        <h2 className="mb-3 border-b border-line pb-2 font-display text-xl font-medium tracking-tight text-ink">
          Explore
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NAV.map((n, i) => (
            <motion.button
              key={n.key}
              custom={i}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              onClick={() => onNavigate(n.key)}
              className="group flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:border-accent-soft hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-muted-light">{n.num}</span>
                <span className="text-muted-light transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-medium leading-tight tracking-tight text-ink">
                {n.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{n.blurb}</p>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
