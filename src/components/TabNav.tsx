"use client";

import { useEffect, useRef } from "react";
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
  { key: "cabling", num: "07", label: "Cabling Spec" },
];

export function TabNav({
  active,
  onChange,
  onSearch,
}: {
  active: string;
  onChange: (key: string) => void;
  onSearch: () => void;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // Keep the active pill in view in the horizontally-scrolling rail (e.g. when a
  // far-right tab is reached via the command palette on a narrow screen).
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 sm:px-6">
        {/* Scrolling tab rail with a right-edge fade hinting at more tabs */}
        <div className="relative min-w-0 flex-1">
          <nav
            aria-label="Sections"
            className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((t) => {
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onChange(t.key)}
                  aria-current={isActive ? "page" : undefined}
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
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-paper to-transparent"
          />
        </div>

        {/* Search sits outside the scroll rail so it's always reachable on mobile */}
        <button
          onClick={onSearch}
          aria-label="Search"
          className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border border-line bg-paper px-1 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
}
