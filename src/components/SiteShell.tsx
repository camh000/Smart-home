"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hero } from "./Hero";
import { TabNav, TABS } from "./TabNav";
import { Markdown } from "./Markdown";
import { Floorplan } from "./Floorplan";
import { Calculator } from "./Calculator";
import { ShoppingList } from "./ShoppingList";
import { Behaviours } from "./Behaviours";
import { BackToTop } from "./BackToTop";

const INTROS: Record<string, { meta: string; title: string; lead: string }> = {
  behaviours: {
    meta: "The JARVIS factor",
    title: "Signature behaviours",
    lead: "Where the infrastructure stops being a dashboard and starts feeling like an attentive housemate. Tap a card to expand. Most need only phase 2–3 kit already in the plan.",
  },
  floorplan: {
    meta: "Room by room",
    title: "Floorplan & planned kit",
    lead: "Every room, the kit that lands in it, and why. Filter by category to see where each technology spreads across the house.",
  },
  calculator: {
    meta: "Build your config",
    title: "Cost calculator",
    lead: "Toggle options to see how the budget moves. Numbers are deliberately rough — the secondhand market usually beats them on AVR and speakers.",
  },
  shopping: {
    meta: "Phase by phase",
    title: "Shopping list",
    lead: "Everything to buy, ordered by build phase. Tick items as you go — your progress saves locally in this browser.",
  },
};

export function SiteShell({
  planMd,
  integrationMd,
}: {
  planMd: string;
  integrationMd: string;
}) {
  const [active, setActive] = useState("plan");

  const change = useCallback((key: string) => {
    setActive(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Sync tab to the URL hash so links/refreshes land on the right view.
  useEffect(() => {
    const fromHash = window.location.hash.replace("#tab-", "");
    if (TABS.some((t) => t.key === fromHash)) setActive(fromHash);
  }, []);
  useEffect(() => {
    history.replaceState(null, "", `#tab-${active}`);
  }, [active]);

  const navigateDoc = useCallback(
    (doc: "plan" | "integration") => change(doc),
    [change],
  );

  return (
    <>
      <Hero />
      <TabNav active={active} onChange={change} />

      <main className="mx-auto max-w-6xl px-6 pb-28 pt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.21, 0.6, 0.35, 1] as const }}
          >
            {INTROS[active] && (
              <div className="max-w-2xl">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                  {INTROS[active].meta}
                </div>
                <h2 className="mt-2 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-medium tracking-[-0.02em] text-ink">
                  {INTROS[active].title}
                </h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">
                  {INTROS[active].lead}
                </p>
              </div>
            )}

            {active === "plan" && (
              <article className="max-w-3xl">
                <Markdown source={planMd} onNavigateDoc={navigateDoc} />
              </article>
            )}
            {active === "integration" && (
              <article className="max-w-3xl">
                <Markdown source={integrationMd} onNavigateDoc={navigateDoc} />
              </article>
            )}
            {active === "behaviours" && <Behaviours />}
            {active === "floorplan" && <Floorplan />}
            {active === "calculator" && <Calculator />}
            {active === "shopping" && <ShoppingList />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-line bg-paper-soft/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Smart home — Woodhouse Road · working planning document</span>
          <span className="font-mono text-[11px] text-muted-light">
            Home Assistant · Claude · Frigate · local-first
          </span>
        </div>
      </footer>

      <BackToTop />
    </>
  );
}
