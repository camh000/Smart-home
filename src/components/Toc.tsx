"use client";

import { useEffect, useRef, useState } from "react";
import type { DocHeading } from "@/lib/doc";

export function Toc({
  headings,
  onJump,
}: {
  headings: DocHeading[];
  onJump: (id: string) => void;
}) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);
  const visible = useRef<Set<string>>(new Set());

  useEffect(() => {
    visible.current = new Set();
    setActive(headings[0]?.id ?? null);
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const order = headings.map((h) => h.id);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.current.add(e.target.id);
          else visible.current.delete(e.target.id);
        }
        // Active = first heading (in document order) currently in view band.
        const first = order.find((id) => visible.current.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-110px 0px -68% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const list = (
    <ul className="space-y-0.5">
      {headings.map((h) => {
        const isActive = active === h.id;
        return (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? 12 : 0 }}>
            <button
              onClick={() => onJump(h.id)}
              aria-current={isActive ? "true" : undefined}
              className="block w-full truncate border-l-2 py-1 pl-3 text-left text-[12.5px] leading-snug transition-colors"
              style={{
                borderColor: isActive ? "var(--color-accent)" : "transparent",
                color: isActive
                  ? "var(--color-accent)"
                  : h.level === 3
                    ? "var(--color-muted-light)"
                    : "var(--color-muted)",
                fontWeight: isActive ? 600 : h.level === 2 ? 500 : 400,
              }}
              title={h.title}
            >
              {h.title}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile: collapsible "on this page" */}
      <details className="mb-6 rounded-xl border border-line bg-surface p-3 lg:hidden">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          On this page
        </summary>
        <nav className="mt-3 border-t border-line pt-3">{list}</nav>
      </details>

      {/* Desktop: sticky sidebar */}
      <nav className="sticky top-28 hidden max-h-[calc(100vh-9rem)] overflow-y-auto lg:block">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-light">
          On this page
        </div>
        {list}
      </nav>
    </>
  );
}
