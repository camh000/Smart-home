import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SiteShell } from "@/components/SiteShell";

function loadDoc(name: string): string {
  return readFileSync(join(process.cwd(), "src", "content", name), "utf8");
}

export default function Home() {
  const planMd = loadDoc("plan.md");
  const integrationMd = loadDoc("integration.md");

  return <SiteShell planMd={planMd} integrationMd={integrationMd} />;
}
