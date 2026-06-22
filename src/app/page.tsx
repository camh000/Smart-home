import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SiteShell } from "@/components/SiteShell";
import { parseDoc, buildDocSearchEntries, type SearchEntry } from "@/lib/doc";
import { PLAN_GROUPS, PLAN_EXCLUDE, INTEGRATION_GROUPS } from "@/data/docConfig";
import { BEHAVIOURS } from "@/data/behaviours";
import { ROOMS } from "@/data/rooms";

function loadDoc(name: string): string {
  return readFileSync(join(process.cwd(), "src", "content", name), "utf8");
}

export default function Home() {
  const planDoc = parseDoc(loadDoc("plan.md"), PLAN_GROUPS, "reference", PLAN_EXCLUDE);
  const integrationDoc = parseDoc(loadDoc("integration.md"), INTEGRATION_GROUPS, "reference");

  const searchIndex: SearchEntry[] = [
    ...buildDocSearchEntries("plan", "Plan", planDoc),
    ...buildDocSearchEntries("integration", "Claude + HA", integrationDoc),
    { title: "Behaviours", crumb: "Tab · interactive", tab: "behaviours" },
    { title: "Floorplan & planned kit", crumb: "Tab · interactive", tab: "floorplan" },
    { title: "Cost calculator", crumb: "Tab · interactive", tab: "calculator" },
    { title: "Shopping list", crumb: "Tab · interactive", tab: "shopping" },
    ...BEHAVIOURS.map((b) => ({ title: b.title, crumb: "Behaviours", tab: "behaviours" })),
    ...ROOMS.map((r) => ({ title: r.name, crumb: "Floorplan · room", tab: "floorplan" })),
  ];

  return (
    <SiteShell planDoc={planDoc} integrationDoc={integrationDoc} searchIndex={searchIndex} />
  );
}
