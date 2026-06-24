// Shared category metadata — used by the floorplan markers/filters.
export type CategoryKey =
  | "voice"
  | "light"
  | "blind"
  | "lock"
  | "heat"
  | "camera"
  | "speaker"
  | "display"
  | "mmwave"
  | "net"
  | "window"
  | "safety";

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "voice", label: "Voice", color: "#b8543a" },
  { key: "light", label: "Lighting", color: "#c98a2b" },
  { key: "blind", label: "Blinds", color: "#6a7f9c" },
  { key: "lock", label: "Locks", color: "#7a4a8a" },
  { key: "heat", label: "Heating", color: "#c0532f" },
  { key: "camera", label: "Cameras", color: "#3f6b6b" },
  { key: "speaker", label: "Audio", color: "#4a6b8a" },
  { key: "display", label: "Displays", color: "#466b3f" },
  { key: "mmwave", label: "Presence", color: "#8a5a1c" },
  { key: "net", label: "Network", color: "#5a6478" },
  { key: "window", label: "Windows", color: "#2f8a7a" },
  { key: "safety", label: "Safety", color: "#a83232" },
];

export const CATEGORY_MAP: Record<CategoryKey, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<CategoryKey, CategoryMeta>;
