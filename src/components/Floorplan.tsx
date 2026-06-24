"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ROOMS, ROOM_MAP, type Room } from "@/data/rooms";
import { CATEGORIES, CATEGORY_MAP, type CategoryKey } from "@/data/categories";

type Filter = CategoryKey | "all";

function uniqueCats(room: Room): CategoryKey[] {
  return Array.from(new Set(room.items.map((i) => i.cat)));
}

function FloorPlan({
  title,
  floor,
  selected,
  filter,
  onSelect,
}: {
  title: string;
  floor: "ground" | "first" | "detached";
  selected: string | null;
  filter: Filter;
  onSelect: (id: string) => void;
}) {
  const rooms = ROOMS.filter((r) => r.floor === floor);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {title}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div
        className={`relative w-full rounded-[var(--radius-card)] border border-line-strong bg-paper-soft/60 ${
          floor === "detached" ? "" : "min-h-[31rem] sm:min-h-0"
        }`}
        style={{ aspectRatio: floor === "detached" ? "3 / 1" : "7 / 6" }}
      >
        {rooms.map((room) => {
          const cats = uniqueCats(room);
          const matchCount =
            filter === "all"
              ? room.items.length
              : room.items.filter((i) => i.cat === filter).length;
          const dim = filter !== "all" && matchCount === 0;
          const isSel = selected === room.id;
          return (
            <motion.button
              key={room.id}
              onClick={() => onSelect(room.id)}
              className="absolute flex flex-col items-start justify-between rounded-[10px] border p-2 text-left transition-colors"
              style={{
                left: `${room.rect.x}%`,
                top: `${room.rect.y}%`,
                width: `${room.rect.w}%`,
                height: `${room.rect.h}%`,
                borderColor: isSel ? "var(--color-accent)" : "var(--color-line-strong)",
                background: isSel ? "var(--color-accent-tint)" : "var(--color-surface)",
                opacity: dim ? 0.38 : 1,
                boxShadow: isSel ? "var(--shadow-lift)" : "var(--shadow-soft)",
                zIndex: isSel ? 5 : 1,
              }}
              whileHover={{ scale: dim ? 1 : 1.015, y: dim ? 0 : -1 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              <span className="flex w-full items-start justify-between gap-1">
                <span className="text-[11px] font-semibold leading-tight text-ink sm:text-xs">
                  {room.name}
                </span>
                {filter !== "all" && matchCount > 0 && (
                  <span
                    className="shrink-0 rounded-full px-1.5 text-[10px] font-bold text-white"
                    style={{ background: CATEGORY_MAP[filter as CategoryKey].color }}
                  >
                    {matchCount}
                  </span>
                )}
              </span>
              <span className="flex flex-wrap gap-1">
                {cats.map((c) => (
                  <span
                    key={c}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: CATEGORY_MAP[c].color,
                      opacity: filter === "all" || filter === c ? 1 : 0.25,
                    }}
                    title={CATEGORY_MAP[c].label}
                  />
                ))}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function Floorplan() {
  const [selected, setSelected] = useState<string | null>("lounge");
  const [filter, setFilter] = useState<Filter>("all");
  const panelRef = useRef<HTMLDivElement>(null);

  // On phones the detail panel sits below the plans, so bring it into view when a
  // room is tapped — otherwise the kit list updates off-screen and the tap reads
  // as unresponsive. No-op on desktop where the panel is a sticky sidebar.
  function handleSelect(id: string) {
    setSelected(id);
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  }

  const room = selected ? ROOM_MAP[selected] : null;
  const items = useMemo(() => {
    if (!room) return [];
    return filter === "all" ? room.items : room.items.filter((i) => i.cat === filter);
  }, [room, filter]);

  return (
    <div className="mt-8">
      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} color="var(--color-ink)">
          All kit
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.key}
            active={filter === c.key}
            onClick={() => setFilter(c.key)}
            color={c.color}
          >
            {c.label}
          </FilterChip>
        ))}
      </div>

      <div className="grid gap-7 lg:grid-cols-[1.25fr_1fr]">
        {/* Plans */}
        <div className="space-y-7">
          <div className="grid gap-7 sm:grid-cols-2">
            <FloorPlan title="Ground floor" floor="ground" selected={selected} filter={filter} onSelect={handleSelect} />
            <FloorPlan title="First floor" floor="first" selected={selected} filter={filter} onSelect={handleSelect} />
          </div>
          <div className="relative">
            <FloorPlan title="Detached garage — fibre link" floor="detached" selected={selected} filter={filter} onSelect={handleSelect} />
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-muted-light">
            Schematic — not to scale. Front of house faces south. Tap a room to see its
            planned kit; filter by category to see where each technology lands.
          </p>
        </div>

        {/* Detail panel */}
        <div ref={panelRef} className="scroll-mt-20 lg:sticky lg:top-28 lg:self-start">
          <div className="min-h-[18rem] rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-soft)]">
            <AnimatePresence mode="wait">
              {room ? (
                <motion.div
                  key={room.id + filter}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                >
                  <h3 className="font-display text-2xl font-medium tracking-tight text-ink">
                    {room.name}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
                    {room.meta}
                  </p>
                  <div className="mt-5 space-y-3">
                    {items.length === 0 ? (
                      <p className="text-sm text-muted">
                        No items in this category for this room.
                      </p>
                    ) : (
                      items.map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.04 * i, duration: 0.3 }}
                          className="border-l-2 pl-3"
                          style={{ borderColor: CATEGORY_MAP[item.cat].color }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                              style={{ background: CATEGORY_MAP[item.cat].color }}
                            >
                              {CATEGORY_MAP[item.cat].label}
                            </span>
                            <strong className="text-sm text-ink">{item.label}</strong>
                          </div>
                          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                            {item.detail}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              ) : (
                <p className="text-sm text-muted">Select a room to see its kit.</p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
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
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: active ? "rgba(255,255,255,0.85)" : color }}
      />
      {children}
    </button>
  );
}
