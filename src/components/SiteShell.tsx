"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hero } from "./Hero";
import { Home } from "./Home";
import { TabNav, TABS } from "./TabNav";
import { LongDoc } from "./LongDoc";
import type { NavTarget } from "./Markdown";
import { Floorplan } from "./Floorplan";
import { Calculator } from "./Calculator";
import { ShoppingList } from "./ShoppingList";
import { Behaviours } from "./Behaviours";
import { NetworkMap } from "./NetworkMap";
import { BackToTop } from "./BackToTop";
import { CommandPalette } from "./CommandPalette";
import type { ParsedDoc, SearchEntry } from "@/lib/doc";

const INTROS: Record<string, { meta: string; title: string; lead: string }> = {
  behaviours: {
    meta: "The JARVIS factor",
    title: "Signature behaviours",
    lead: "Where the infrastructure stops being a dashboard and starts feeling like an attentive housemate. Tap a card to expand. Most need only phase 2–5 kit already in the plan.",
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
  network: {
    meta: "How it all connects",
    title: "Network topology",
    lead: "The logical network — gateway, switches, APs, server, cameras, the garage fibre link and the Selby SD-WAN. Toggle between a VLAN and a UniFi firewall-Zone view, with the live zone matrix below; tap a node for detail or filter by group. Documented from the plan, not live-discovered.",
  },
};

export function SiteShell({
  planDoc,
  integrationDoc,
  cablingDoc,
  searchIndex,
}: {
  planDoc: ParsedDoc;
  integrationDoc: ParsedDoc;
  cablingDoc: ParsedDoc;
  searchIndex: SearchEntry[];
}) {
  const [active, setActive] = useState("home");
  const [planSub, setPlanSub] = useState(planDoc.subviews[0]?.key ?? "overview");
  const [intSub, setIntSub] = useState(integrationDoc.subviews[0]?.key ?? "overview");
  const [cablingSub, setCablingSub] = useState(cablingDoc.subviews[0]?.key ?? "scope");
  const [paletteOpen, setPaletteOpen] = useState(false);
  // A heading to scroll to after a view switch; the target LongDoc expands the
  // containing section and scrolls once it has rendered.
  const [pendingHeading, setPendingHeading] = useState<string | null>(null);

  const locById = useMemo(() => {
    const m = new Map<string, { tab: string; subview?: string }>();
    for (const e of searchIndex) {
      if (e.headingId && !m.has(e.headingId)) m.set(e.headingId, { tab: e.tab, subview: e.subview });
    }
    return m;
  }, [searchIndex]);

  const navigate = useCallback(
    (target: NavTarget) => {
      let tab = target.tab;
      let subview: string | undefined;
      const headingId = target.headingId;

      if (headingId && locById.has(headingId)) {
        const loc = locById.get(headingId)!;
        tab = loc.tab;
        subview = loc.subview;
      }
      tab = tab ?? active;

      setActive(tab);
      if (tab === "plan" && subview) setPlanSub(subview);
      if (tab === "integration" && subview) setIntSub(subview);
      if (tab === "cabling" && subview) setCablingSub(subview);

      if (headingId) setPendingHeading(headingId);
      else window.scrollTo({ top: 0, behavior: "smooth" });
      setPaletteOpen(false);
    },
    [active, locById],
  );

  // Tab ↔ URL hash
  useEffect(() => {
    const fromHash = window.location.hash.replace("#tab-", "");
    if (TABS.some((t) => t.key === fromHash)) setActive(fromHash);
  }, []);
  useEffect(() => {
    history.replaceState(null, "", `#tab-${active}`);
  }, [active]);

  // ⌘K / Ctrl-K / "/" opens search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink shadow-[var(--shadow-lift)] focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      {active === "home" && <Hero />}
      <TabNav active={active} onChange={(key) => navigate({ tab: key })} onSearch={() => setPaletteOpen(true)} />

      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-6 pb-28 pt-8 outline-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.21, 0.6, 0.35, 1] as const }}
          >
            {INTROS[active] && (
              <div className="max-w-2xl pt-2">
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

            {active === "home" && <Home onNavigate={(tab) => navigate({ tab })} />}
            {active === "plan" && (
              <LongDoc
                doc={planDoc}
                activeSubview={planSub}
                onSubviewChange={setPlanSub}
                onNavigate={navigate}
                focusHeading={pendingHeading}
                onFocusHandled={() => setPendingHeading(null)}
              />
            )}
            {active === "integration" && (
              <LongDoc
                doc={integrationDoc}
                activeSubview={intSub}
                onSubviewChange={setIntSub}
                onNavigate={navigate}
                focusHeading={pendingHeading}
                onFocusHandled={() => setPendingHeading(null)}
              />
            )}
            {active === "cabling" && (
              <LongDoc
                doc={cablingDoc}
                activeSubview={cablingSub}
                onSubviewChange={setCablingSub}
                onNavigate={navigate}
                focusHeading={pendingHeading}
                onFocusHandled={() => setPendingHeading(null)}
              />
            )}
            {active === "behaviours" && <Behaviours />}
            {active === "network" && <NetworkMap />}
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

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        index={searchIndex}
        onNavigate={navigate}
      />
      <BackToTop />
    </>
  );
}
