"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { SHOPPING, type ShopItem } from "@/data/shopping";
import { AnimatedNumber } from "./AnimatedNumber";

const STORAGE_KEY = "wh-shop-state-v1";

const NO_BUY = ["free", "owned", "code only", "in electrical"];

/** Explicit link if given; otherwise an Amazon UK search for purchasable items. */
function buyUrl(it: ShopItem): string | null {
  if (it.url) return it.url;
  if (it.cost <= 0 || NO_BUY.some((n) => it.costLabel.toLowerCase().includes(n))) return null;
  const q = it.name
    .split(" — ")[0]
    .split(" (")[0]
    .replace(/^\d+×\s*/, "")
    .trim();
  return `https://www.amazon.co.uk/s?k=${encodeURIComponent(q)}`;
}

export function ShoppingList() {
  const [bought, setBought] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBought(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bought));
      } catch {
        /* ignore */
      }
    }
  }, [bought, loaded]);

  function toggle(id: string) {
    setBought((b) => ({ ...b, [id]: !b[id] }));
  }

  const stats = useMemo(() => {
    let total = 0,
      done = 0,
      spent = 0,
      remaining = 0;
    SHOPPING.forEach((p) =>
      p.items.forEach((it) => {
        total++;
        if (bought[it.id]) {
          done++;
          spent += it.cost;
        } else {
          remaining += it.cost;
        }
      }),
    );
    return { total, done, spent, remaining };
  }, [bought]);

  return (
    <div className="mt-8">
      {/* Stats bar */}
      <div className="sticky top-[4.75rem] z-20 mb-8 grid grid-cols-3 gap-3 rounded-[var(--radius-card)] border border-line-strong bg-paper/85 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
        <Stat label="Items bought" value={`${stats.done} / ${stats.total}`} />
        <Stat label="Spent" value={<AnimatedNumber value={stats.spent} />} accent />
        <Stat label="Remaining" value={<AnimatedNumber value={stats.remaining} />} />
      </div>

      <div className="space-y-8">
        {SHOPPING.map((phase) => {
          const phaseSpent = phase.items.reduce(
            (a, it) => a + (bought[it.id] ? it.cost : 0),
            0,
          );
          const phaseTotal = phase.items.reduce((a, it) => a + it.cost, 0);
          return (
            <section key={phase.id}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2">
                <h3 className="font-display text-xl font-medium tracking-tight text-ink">
                  {phase.title}
                </h3>
                <span className="font-mono text-[12px] text-muted">
                  £{phaseTotal.toLocaleString("en-GB")}
                  {phaseSpent > 0 && (
                    <span className="text-success"> · £{phaseSpent.toLocaleString("en-GB")} bought</span>
                  )}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {phase.items.map((it) => {
                  const isOn = !!bought[it.id];
                  const buy = buyUrl(it);
                  return (
                    <motion.div
                      key={it.id}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-start gap-3 rounded-xl border p-3 transition-colors"
                      style={{
                        borderColor: isOn ? "var(--color-success)" : "var(--color-line)",
                        background: isOn ? "rgba(70,107,63,0.07)" : "var(--color-surface)",
                      }}
                    >
                      <button
                        onClick={() => toggle(it.id)}
                        className="flex min-w-0 flex-1 items-start gap-3 text-left"
                      >
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors"
                          style={{
                            borderColor: isOn ? "var(--color-success)" : "var(--color-line-strong)",
                            background: isOn ? "var(--color-success)" : "transparent",
                          }}
                        >
                          {isOn && (
                            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className="block text-[13.5px] font-semibold text-ink"
                            style={{ textDecoration: isOn ? "line-through" : "none", opacity: isOn ? 0.6 : 1 }}
                          >
                            {it.name}
                          </span>
                          {it.meta && (
                            <span className="mt-0.5 block text-[12px] leading-snug text-muted">{it.meta}</span>
                          )}
                        </span>
                      </button>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-mono text-[12px] text-muted">{it.costLabel}</span>
                        {buy && (
                          <a
                            href={buy}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="flex items-center gap-0.5 font-mono text-[11px] text-accent transition-colors hover:text-accent-soft"
                          >
                            buy
                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                              <path d="M3 7L7 3M7 3H4M7 3V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                        )}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{label}</div>
      <div
        className="mt-0.5 font-display text-xl font-medium tracking-tight"
        style={{ color: accent ? "var(--color-accent)" : "var(--color-ink)" }}
      >
        {value}
      </div>
    </div>
  );
}
