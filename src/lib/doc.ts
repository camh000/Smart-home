// Shared doc parsing: split a markdown document into grouped "sub-views" by
// its H2 sections, and extract heading outlines for the TOC / search.

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** GitHub-compatible heading slug. Entity-decoded so raw-markdown slugs match
 *  the ids react-markdown assigns to already-decoded heading text. */
export function slugify(text: string): string {
  return decodeEntities(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export interface DocHeading {
  id: string;
  title: string;
  level: 2 | 3;
}
/** A single H2 section, rendered as one collapsible card in the UI. */
export interface DocSection {
  /** Slug of the H2 — the scroll/anchor target. */
  id: string;
  title: string;
  /** One-line plain-text preview shown when the card is collapsed. */
  lead: string;
  /** Section markdown WITHOUT the leading "## Title" (the title lives in the card header). */
  body: string;
  headings: DocHeading[];
  /** Number of H3 sub-headings inside the section. */
  subCount: number;
}
export interface DocSubview {
  key: string;
  label: string;
  /** Optional preamble (the doc's H1 + lead paragraph), shown above the cards. */
  intro?: string;
  sections: DocSection[];
  headings: DocHeading[];
}
export interface ParsedDoc {
  subviews: DocSubview[];
}

/** Strip the common inline markdown so a heading/paragraph reads as plain text. */
function stripInline(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .trim();
}

function truncate(s: string, n = 175): string {
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

/** First meaningful line of a section (prose, or the first list item) as a preview. */
function extractLead(lines: string[]): string {
  let inCode = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode || !line) continue;
    if (/^#{1,6}\s/.test(line) || line.startsWith(">") || line.startsWith("|")) continue;
    const stripped = line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
    const txt = stripInline(stripped);
    if (txt) return truncate(txt);
  }
  return "";
}

export interface GroupDef {
  key: string;
  label: string;
  /** Exact H2 titles (plain text, with "&" not "&amp;") that belong here. */
  sections: string[];
}

interface RawSection {
  slug: string;
  lines: string[];
  headings: DocHeading[];
}

export function parseDoc(
  md: string,
  groups: GroupDef[],
  fallbackKey: string,
  exclude: string[] = [],
): ParsedDoc {
  const excludeSet = new Set(exclude);
  const lines = md.split("\n");
  const preamble: string[] = [];
  const sections: RawSection[] = [];
  let cur: RawSection | null = null;
  let inCode = false;

  for (const line of lines) {
    if (line.startsWith("```")) inCode = !inCode;
    const h2 = !inCode ? /^## (.+)/.exec(line) : null;
    if (h2) {
      const title = decodeEntities(h2[1].trim());
      const slug = slugify(title);
      cur = { slug, lines: [line], headings: [{ id: slug, title, level: 2 }] };
      sections.push(cur);
      continue;
    }
    if (cur) {
      const h3 = !inCode ? /^### (.+)/.exec(line) : null;
      if (h3) {
        const t = decodeEntities(h3[1].trim());
        cur.headings.push({ id: slugify(t), title: t, level: 3 });
      }
      cur.lines.push(line);
    } else {
      preamble.push(line);
    }
  }

  const slugToGroup = new Map<string, string>();
  for (const g of groups) for (const s of g.sections) slugToGroup.set(slugify(s), g.key);

  const buckets = new Map<string, RawSection[]>();
  for (const g of groups) buckets.set(g.key, []);
  if (!buckets.has(fallbackKey)) buckets.set(fallbackKey, []);

  for (const sec of sections) {
    if (excludeSet.has(sec.slug)) continue;
    const key = slugToGroup.get(sec.slug) ?? fallbackKey;
    buckets.get(key)!.push(sec);
  }

  const subviews: DocSubview[] = groups
    .map((g, idx) => {
      const secs = buckets.get(g.key) ?? [];
      const sections: DocSection[] = secs.map((s) => ({
        id: s.slug,
        title: s.headings[0]?.title ?? s.slug,
        lead: extractLead(s.lines),
        body: s.lines.slice(1).join("\n").trim(),
        headings: s.headings,
        subCount: s.headings.filter((h) => h.level === 3).length,
      }));
      const headings = secs.flatMap((s) => s.headings);
      const intro = idx === 0 ? preamble.join("\n").trim() : "";
      return { key: g.key, label: g.label, intro: intro || undefined, sections, headings };
    })
    .filter((sv) => sv.sections.length > 0 || (sv.intro?.length ?? 0) > 0);

  return { subviews };
}

export interface SearchEntry {
  title: string;
  crumb: string;
  tab: string;
  subview?: string;
  headingId?: string;
  level?: number;
}

/** Flatten parsed docs into a searchable index for the command palette. */
export function buildDocSearchEntries(
  tab: string,
  tabLabel: string,
  doc: ParsedDoc,
): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const sv of doc.subviews) {
    for (const h of sv.headings) {
      out.push({
        title: h.title,
        crumb: `${tabLabel} › ${sv.label}`,
        tab,
        subview: sv.key,
        headingId: h.id,
        level: h.level,
      });
    }
  }
  return out;
}
