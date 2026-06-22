"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BEHAVIOURS } from "@/data/behaviours";

export function Behaviours() {
  const [open, setOpen] = useState<string | null>("cinema");

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {BEHAVIOURS.map((b, i) => {
        const isOpen = open === b.id;
        return (
          <motion.article
            key={b.id}
            layout
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            transition={{ duration: 0.45, delay: (i % 2) * 0.05 }}
            className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-soft)]"
            style={{ borderColor: isOpen ? "var(--color-accent-soft)" : "var(--color-line)" }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : b.id)}
              className="flex w-full items-start gap-3 p-5 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-accent-tint px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-accent">
                    Phase {b.phase}
                  </span>
                  <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-muted">
                    {b.cost}
                  </span>
                  <span className="font-mono text-[10px] text-muted-light">{b.hardware}</span>
                </div>
                <h3 className="font-display text-lg font-medium leading-tight tracking-tight text-ink">
                  {b.title}
                </h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{b.summary}</p>
              </div>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25 }}
                className="mt-1 shrink-0 text-xl leading-none text-accent"
              >
                +
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="detail"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] as const }}
                  className="overflow-hidden"
                >
                  <ul className="space-y-2 border-t border-line px-5 pb-5 pt-4">
                    {b.points.map((p, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + j * 0.04 }}
                        className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-soft"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
                        <span>{p}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        );
      })}
    </div>
  );
}
