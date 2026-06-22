"use client";

import { motion, AnimatePresence } from "motion/react";
import type { ParsedDoc } from "@/lib/doc";
import { Markdown, type NavTarget } from "./Markdown";
import { Toc } from "./Toc";

export function LongDoc({
  doc,
  activeSubview,
  onSubviewChange,
  onNavigate,
}: {
  doc: ParsedDoc;
  activeSubview: string;
  onSubviewChange: (key: string) => void;
  onNavigate: (target: NavTarget) => void;
}) {
  const sub = doc.subviews.find((s) => s.key === activeSubview) ?? doc.subviews[0];

  return (
    <div>
      {/* Sub-view nav */}
      <div className="sticky top-[3.05rem] z-20 -mx-6 mb-7 border-b border-line bg-paper/85 px-6 py-2 backdrop-blur-md">
        <div className="flex flex-wrap gap-1">
          {doc.subviews.map((s) => {
            const isActive = s.key === sub.key;
            return (
              <button
                key={s.key}
                onClick={() => onSubviewChange(s.key)}
                className="relative rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors"
                style={{ color: isActive ? "var(--color-accent)" : "var(--color-muted)" }}
              >
                {isActive && (
                  <motion.span
                    layoutId={`subpill-${doc.subviews[0].key}`}
                    className="absolute inset-0 rounded-full bg-accent-tint"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <AnimatePresence mode="wait">
          <motion.article
            key={sub.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="min-w-0 max-w-3xl"
          >
            <Markdown source={sub.markdown} onNavigate={onNavigate} />
          </motion.article>
        </AnimatePresence>

        <aside className="min-w-0">
          <Toc
            key={sub.key}
            headings={sub.headings}
            onJump={(id) => onNavigate({ headingId: id })}
          />
        </aside>
      </div>
    </div>
  );
}
