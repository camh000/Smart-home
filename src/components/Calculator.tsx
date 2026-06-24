"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  CALC_GROUPS,
  PRESETS,
  PRESET_LABELS,
  computeTotals,
  type CalcState,
} from "@/data/calculator";
import { AnimatedNumber } from "./AnimatedNumber";

const GROUP_LABELS: Record<string, string> = {
  base: "Phase 1 base",
  audio: "Audio & AVR",
  cctv: "CCTV & network",
  light: "Lighting",
  locks: "Locks",
  blinds: "Blinds",
  voice: "Voice & sensors",
  stark: "Displays & extras",
  extras2026: "2026 additions",
  windows: "Window motors",
};

const STORAGE_KEY = "wh-calc-state-v1";

export function Calculator() {
  const [state, setState] = useState<CalcState>(PRESETS.balanced);
  const [activePreset, setActivePreset] = useState<string | null>("balanced");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw));
        setActivePreset(null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const { groups, grand } = useMemo(() => computeTotals(state), [state]);

  function setField(key: string, value: number) {
    setState((s) => ({ ...s, [key]: value }));
    setActivePreset(null);
  }
  function applyPreset(key: string) {
    if (key === "reset") {
      const zeroed: CalcState = {};
      CALC_GROUPS.forEach((g) =>
        g.fields.forEach((f) => (zeroed[f.key] = f.options[0].value)),
      );
      setState(zeroed);
      setActivePreset(null);
      return;
    }
    setState(PRESETS[key]);
    setActivePreset(key);
  }

  const breakdown = Object.entries(groups)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const max = Math.max(...Object.values(groups), 1);

  return (
    <div className="mt-8">
      {/* Presets */}
      <div className="mb-7 flex flex-wrap items-center gap-2">
        {PRESET_LABELS.map((p) => (
          <button
            key={p.key}
            onClick={() => applyPreset(p.key)}
            className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
            style={{
              borderColor: activePreset === p.key ? "var(--color-accent)" : "var(--color-line)",
              background: activePreset === p.key ? "var(--color-accent)" : "var(--color-surface)",
              color: activePreset === p.key ? "#fff" : "var(--color-ink-soft)",
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => applyPreset("reset")}
          className="ml-auto rounded-full px-3 py-2 text-sm text-muted transition-colors hover:text-accent"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-7 lg:grid-cols-[1fr_22rem]">
        {/* Field groups */}
        <div className="grid gap-5 sm:grid-cols-2">
          {CALC_GROUPS.map((g) => (
            <motion.div
              key={g.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              transition={{ duration: 0.4 }}
              className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="mb-3 flex items-baseline justify-between border-b border-line pb-2">
                <h4 className="text-[13px] font-bold uppercase tracking-wide text-ink">
                  {g.title}
                </h4>
                <span className="font-mono text-sm font-semibold text-accent">
                  <AnimatedNumber value={groups[g.key]} />
                </span>
              </div>

              {g.fixed != null ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-ink-soft">
                    Fixed kit
                    <span className="mt-0.5 block text-[11px] text-muted">{g.fixedNote}</span>
                  </span>
                  <span className="font-mono text-xs text-muted">£{g.fixed}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {g.fields.map((f) => (
                    <label key={f.key} className="block">
                      <span className="text-[13px] text-ink-soft">
                        {f.label}
                        {f.sub && (
                          <span className="mt-0.5 block text-[11px] text-muted">{f.sub}</span>
                        )}
                      </span>
                      <select
                        value={state[f.key] ?? f.options[0].value}
                        onChange={(e) => setField(f.key, Number(e.target.value))}
                        className="mt-1.5 w-full cursor-pointer rounded-lg border border-line bg-paper px-2.5 py-2 text-[13px] text-ink outline-none transition-colors focus:border-accent"
                      >
                        {f.options.map((o) => (
                          <option key={o.value + o.label} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Live summary */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-line-strong bg-ink text-paper shadow-[var(--shadow-lift)]">
            <div className="border-b border-white/10 px-6 py-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/55">
                Live total
              </span>
              <div className="mt-1 font-display text-4xl font-medium tracking-tight">
                <AnimatedNumber value={grand} />
              </div>
              <p className="mt-1 text-[12px] text-paper/55">
                Indicative only · secondhand hunts often beat these.
              </p>
            </div>
            <div className="space-y-2.5 px-6 py-5">
              {breakdown.map(([k, v]) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-[12px]">
                    <span className="text-paper/75">{GROUP_LABELS[k]}</span>
                    <span className="font-mono text-paper/90">£{v.toLocaleString("en-GB")}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-accent-soft"
                      initial={false}
                      animate={{ width: `${(v / max) * 100}%` }}
                      transition={{ type: "spring", stiffness: 200, damping: 26 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
