"use client";

import { motion } from "motion/react";

export interface TabDef {
  key: string;
  num: string;
  label: string;
}

export const TABS: TabDef[] = [
  { key: "plan", num: "01", label: "Project Plan" },
  { key: "integration", num: "02", label: "Claude + HA" },
  { key: "behaviours", num: "03", label: "Behaviours" },
  { key: "floorplan", num: "04", label: "Floorplan" },
  { key: "calculator", num: "05", label: "Calculator" },
  { key: "shopping", num: "06", label: "Shopping List" },
];

export function TabNav({
  active,
  onChange,
}: {
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2.5 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className="relative shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors sm:px-4"
              style={{ color: isActive ? "var(--color-surface)" : "var(--color-ink-soft)" }}
            >
              {isActive && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <span
                  className="font-mono text-[10px]"
                  style={{ color: isActive ? "var(--color-accent-soft)" : "var(--color-muted-light)" }}
                >
                  {t.num}
                </span>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
