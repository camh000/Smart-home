"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SearchEntry } from "@/lib/doc";

export function CommandPalette({
  open,
  onClose,
  index,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  index: SearchEntry[];
  onNavigate: (e: SearchEntry) => void;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return index.slice(0, 14);
    const scored = index
      .map((e) => {
        const t = e.title.toLowerCase();
        const c = e.crumb.toLowerCase();
        let score = -1;
        if (t === query) score = 100;
        else if (t.startsWith(query)) score = 80;
        else if (t.includes(query)) score = 60;
        else if (c.includes(query)) score = 30;
        return { e, score };
      })
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
    return scored.map((x) => x.e);
  }, [q, index]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setSel(0), [q]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[sel];
      if (pick) onNavigate(pick);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[var(--shadow-lift)]"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="7" cy="7" r="4.5" stroke="var(--color-muted)" strokeWidth="1.6" />
                <path d="M10.5 10.5L14 14" stroke="var(--color-muted)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the plan — rooms, kit, sections…"
                className="w-full bg-transparent py-3.5 text-[15px] text-ink outline-none placeholder:text-muted-light"
              />
              <kbd className="shrink-0 rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] text-muted">
                esc
              </kbd>
            </div>

            <ul className="max-h-[55vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted">No matches.</li>
              )}
              {results.map((e, i) => {
                const isSel = i === sel;
                return (
                  <li key={`${e.tab}-${e.subview ?? ""}-${e.headingId ?? e.title}-${i}`}>
                    <button
                      onMouseEnter={() => setSel(i)}
                      onClick={() => onNavigate(e)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors"
                      style={{ background: isSel ? "var(--color-paper-soft)" : "transparent" }}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium text-ink">
                          {e.title}
                        </span>
                        <span className="block truncate font-mono text-[11px] text-muted-light">
                          {e.crumb}
                        </span>
                      </span>
                      {isSel && (
                        <kbd className="shrink-0 rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] text-muted">
                          ↵
                        </kbd>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
