"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Term({ term, def }: { term: string; def: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="cursor-help border-b border-dotted border-accent-soft/70 font-medium text-ink-soft transition-colors hover:text-accent"
        aria-label={`${term}: ${def}`}
      >
        {term}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute bottom-full left-1/2 z-40 mb-2 w-64 max-w-[78vw] -translate-x-1/2 rounded-xl border border-line-strong bg-ink p-3 text-left text-[12.5px] font-normal not-italic leading-snug text-paper shadow-[var(--shadow-lift)]"
          >
            <span className="mb-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-accent-soft">
              {term}
            </span>
            {def}
            <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-line-strong bg-ink" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
