"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  NODES,
  EDGES,
  VLANS,
  VLAN_MAP,
  EDGE_STYLE,
  TIER_Y,
  VIEW_W,
  VIEW_H,
  type VlanKey,
  type NetNode,
} from "@/data/network";

type Filter = VlanKey | "all";

const NODE_BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<string, NetNode>;
const cx = (n: NetNode) => n.x;
const cy = (n: NetNode) => TIER_Y[n.tier];

export function NetworkMap() {
  const [selected, setSelected] = useState<string>("ucg");
  const [hover, setHover] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const panelRef = useRef<HTMLDivElement>(null);

  const focus = hover ?? selected;
  const incident = useMemo(() => {
    const s = new Set<string>();
    if (!focus) return s;
    EDGES.forEach((e, i) => {
      if (e.from === focus || e.to === focus) s.add(String(i));
    });
    return s;
  }, [focus]);

  const node = NODE_BY_ID[selected];
  const uplink = EDGES.find((e) => e.to === selected);
  const downstream = EDGES.filter((e) => e.from === selected).map((e) => NODE_BY_ID[e.to]);

  function select(id: string) {
    setSelected(id);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
      );
    }
  }

  const dimNode = (n: NetNode) => filter !== "all" && n.vlan !== filter;

  return (
    <div className="mt-8">
      {/* VLAN legend / filter */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Chip active={filter === "all"} color="var(--color-ink)" onClick={() => setFilter("all")}>
          All VLANs
        </Chip>
        {VLANS.map((v) => (
          <Chip key={v.key} active={filter === v.key} color={v.color} onClick={() => setFilter(filter === v.key ? "all" : v.key)}>
            {v.label}
          </Chip>
        ))}
      </div>

      {/* Diagram */}
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-paper-soft/40 p-4 shadow-[var(--shadow-soft)]">
        <div className="relative mx-auto aspect-[1000/560] min-w-[880px]">
          {/* edges */}
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {EDGES.map((e, i) => {
              const a = NODE_BY_ID[e.from];
              const b = NODE_BY_ID[e.to];
              if (!a || !b) return null;
              const style = EDGE_STYLE[e.kind];
              const on = incident.has(String(i));
              const dimmed =
                filter !== "all" && a.vlan !== filter && b.vlan !== filter && !on;
              return (
                <line
                  key={i}
                  x1={cx(a)}
                  y1={cy(a)}
                  x2={cx(b)}
                  y2={cy(b)}
                  stroke={on ? "var(--color-accent)" : style.color}
                  strokeWidth={on ? 3 : 2}
                  strokeDasharray={style.dash}
                  strokeLinecap="round"
                  opacity={dimmed ? 0.12 : on ? 1 : 0.7}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* edge labels */}
          {EDGES.filter((e) => e.label).map((e, i) => {
            const a = NODE_BY_ID[e.from];
            const b = NODE_BY_ID[e.to];
            if (!a || !b) return null;
            return (
              <span
                key={i}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded bg-paper/85 px-1 font-mono text-[9px] text-muted"
                style={{ left: `${((cx(a) + cx(b)) / 2 / VIEW_W) * 100}%`, top: `${((cy(a) + cy(b)) / 2 / VIEW_H) * 100}%` }}
              >
                {e.label}
              </span>
            );
          })}

          {/* nodes */}
          {NODES.map((n) => {
            const isSel = selected === n.id;
            const color = VLAN_MAP[n.vlan].color;
            return (
              <button
                key={n.id}
                onClick={() => select(n.id)}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                className="absolute flex w-[7rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-xl border-2 bg-surface px-2 py-1.5 text-center transition-shadow"
                style={{
                  left: `${(cx(n) / VIEW_W) * 100}%`,
                  top: `${(cy(n) / VIEW_H) * 100}%`,
                  borderColor: isSel ? "var(--color-accent)" : color,
                  opacity: dimNode(n) ? 0.32 : 1,
                  boxShadow: isSel ? "var(--shadow-lift)" : "var(--shadow-soft)",
                  zIndex: isSel ? 5 : 2,
                }}
              >
                <span className="flex items-center gap-1">
                  <span className="text-[13px] leading-none">{n.icon}</span>
                  <span className="truncate text-[11px] font-semibold leading-tight text-ink">{n.label}</span>
                </span>
                {n.sub && <span className="truncate text-[9.5px] leading-tight text-muted">{n.sub}</span>}
                <span className="mt-0.5 h-1 w-6 rounded-full" style={{ background: color }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* link-type legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {Object.values(EDGE_STYLE).map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <svg width="22" height="6" className="shrink-0">
              <line x1="0" y1="3" x2="22" y2="3" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} strokeLinecap="round" />
            </svg>
            {s.label}
          </span>
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted-light">
        Logical view — documented from the plan, not live-discovered. Tap a node for detail; filter by VLAN. *Unraid&apos;s 2.5 GbE needs a 2.5 G switch port (the Ultra&apos;s LAN is gigabit).
      </p>

      {/* detail panel */}
      <div ref={panelRef} className="mt-6 scroll-mt-24">
        {node && (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none">{node.icon}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-medium tracking-tight text-ink">{node.label}</h3>
                {node.sub && <p className="font-mono text-[11px] text-muted">{node.sub}</p>}
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ background: VLAN_MAP[node.vlan].color }}
              >
                {VLAN_MAP[node.vlan].label}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Uplink">
                {uplink ? (
                  <>
                    {EDGE_STYLE[uplink.kind].label}
                    {uplink.label ? ` · ${uplink.label}` : ""} <span className="text-muted">from</span>{" "}
                    <button onClick={() => select(uplink.from)} className="text-accent hover:underline">
                      {NODE_BY_ID[uplink.from]?.label}
                    </button>
                  </>
                ) : (
                  "—"
                )}
              </Field>
              <Field label="Feeds">
                {downstream.length ? (
                  <span className="flex flex-wrap gap-x-1.5 gap-y-1">
                    {downstream.map((d, i) => (
                      <button key={d.id} onClick={() => select(d.id)} className="text-accent hover:underline">
                        {d.label}
                        {i < downstream.length - 1 ? "," : ""}
                      </button>
                    ))}
                  </span>
                ) : (
                  "—"
                )}
              </Field>
            </div>

            <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{node.meta}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-all"
      style={{
        borderColor: active ? color : "var(--color-line)",
        background: active ? color : "var(--color-surface)",
        color: active ? "#fff" : "var(--color-ink-soft)",
      }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: active ? "rgba(255,255,255,0.85)" : color }} />
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-paper-soft/50 px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-light">{label}</div>
      <div className="mt-0.5 text-[13px] text-ink-soft">{children}</div>
    </div>
  );
}
