"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ParsedDoc, DocSection } from "@/lib/doc";
import { Markdown, type NavTarget } from "./Markdown";
import { Toc } from "./Toc";

/** Scroll to a heading once it exists, retrying briefly while the card expands. */
function scrollToHeading(id: string, attempts = 16) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (attempts > 0) requestAnimationFrame(() => scrollToHeading(id, attempts - 1));
}

export function LongDoc({
  doc,
  activeSubview,
  onSubviewChange,
  onNavigate,
  focusHeading,
  onFocusHandled,
}: {
  doc: ParsedDoc;
  activeSubview: string;
  onSubviewChange: (key: string) => void;
  onNavigate: (target: NavTarget) => void;
  focusHeading?: string | null;
  onFocusHandled?: () => void;
}) {
  const sub = doc.subviews.find((s) => s.key === activeSubview) ?? doc.subviews[0];
  const sections = sub.sections;

  // heading id (H2 or H3) -> the id of the section that contains it
  const sectionByHeading = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of sections) {
      m.set(s.id, s.id);
      for (const h of s.headings) m.set(h.id, s.id);
    }
    return m;
  }, [sections]);

  // Which section cards are expanded. Default: first section open, rest collapsed
  // (so the view reads as a scannable menu, not a wall of text).
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(sections[0] ? [sections[0].id] : []),
  );

  // Reset to the default (first section open) when switching sub-views.
  useEffect(() => {
    setOpen(new Set(sections[0] ? [sections[0].id] : []));
  }, [sub.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const reveal = useCallback(
    (headingId: string) => {
      const secId = sectionByHeading.get(headingId);
      if (secId) setOpen((prev) => new Set(prev).add(secId));
      setTimeout(() => scrollToHeading(headingId), 90);
    },
    [sectionByHeading],
  );

  // Heading requested from elsewhere (command palette, cross-doc link): expand
  // the containing section and scroll to it.
  useEffect(() => {
    if (!focusHeading) return;
    reveal(focusHeading);
    onFocusHandled?.();
  }, [focusHeading, sub.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const allOpen = sections.length > 0 && open.size >= sections.length;
  const toggleAll = () =>
    setOpen(allOpen ? new Set() : new Set(sections.map((s) => s.id)));
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
                aria-current={isActive ? "true" : undefined}
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
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={sub.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {sub.intro && (
                <div className="mb-7 max-w-3xl">
                  <Markdown source={sub.intro} onNavigate={onNavigate} />
                </div>
              )}

              {sections.length > 1 && (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-light">
                    {sections.length} sections
                  </span>
                  <button
                    onClick={toggleAll}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {allOpen ? "Collapse all" : "Expand all"}
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {sections.map((s, i) => (
                  <SectionCard
                    key={s.id}
                    section={s}
                    index={i}
                    isOpen={open.has(s.id)}
                    onToggle={() => toggle(s.id)}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="min-w-0">
          <Toc key={sub.key} headings={sub.headings} onJump={reveal} />
        </aside>
      </div>
    </div>
  );
}

function SectionCard({
  section,
  index,
  isOpen,
  onToggle,
  onNavigate,
}: {
  section: DocSection;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (target: NavTarget) => void;
}) {
  return (
    <motion.section
      id={section.id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.4, ease: [0.21, 0.6, 0.35, 1] as const }}
      className="scroll-mt-28 overflow-hidden rounded-[var(--radius-card)] border bg-surface shadow-[var(--shadow-soft)] transition-colors"
      style={{ borderColor: isOpen ? "var(--color-accent-soft)" : "var(--color-line)" }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        <span className="mt-1 font-mono text-[12px] font-semibold tabular-nums text-accent">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-display text-[1.18rem] font-medium leading-tight tracking-tight text-ink">
              {section.title}
            </span>
            {section.subCount > 0 && (
              <span className="shrink-0 rounded-full border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted-light">
                {section.subCount}
              </span>
            )}
          </span>
          {!isOpen && section.lead && (
            <span className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-muted">
              {section.lead}
            </span>
          )}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="mt-1 shrink-0 text-muted-light"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] as const }}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-5 pb-6 pt-5">
              <Markdown source={section.body} onNavigate={onNavigate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
