"use client";

import { motion } from "motion/react";
import { ROOMS } from "@/data/rooms";
import { SHOPPING } from "@/data/shopping";

// Computed from the floorplan + shopping data so these never drift out of date.
const catCount = (key: string) =>
  ROOMS.reduce((n, r) => n + r.items.filter((it) => it.cat === key).length, 0);
const voiceRooms = ROOMS.filter((r) => r.items.some((it) => it.cat === "voice")).length;

const STATS = [
  { value: String(voiceRooms), label: "voice rooms" },
  { value: String(catCount("light")), label: "light zones" },
  { value: String(catCount("lock")), label: "smart locks" },
  // camera markers include the doorbell — show it as "+ bell".
  { value: String(Math.max(catCount("camera") - 1, 0)), label: "cameras + bell" },
  { value: String(SHOPPING.length), label: "build phases" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.6, 0.35, 1] as const } },
};

export function Hero() {
  return (
    <header className="relative overflow-hidden border-b border-line">
      {/* soft radial wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 80% at 18% -10%, rgba(216,123,95,0.16), transparent 60%), radial-gradient(50% 70% at 90% 0%, rgba(15,27,45,0.06), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-16 sm:pt-20">
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.div
            variants={item}
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Working document
            <span className="text-line-strong">·</span>
            Home Assistant × Claude
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-5 max-w-4xl font-display text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.025em] text-ink"
          >
            Smart home <em className="font-light italic text-accent">at</em> Woodhouse Road
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-soft"
          >
            A bespoke, self-hosted replacement for Alexa — voice control, lighting, locks,
            blinds and CCTV, with Claude wired into Home Assistant as the reasoning layer.
            Everything local-first; the cloud only where it&apos;s unavoidable.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold tracking-tight text-accent">
                  {s.value}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
