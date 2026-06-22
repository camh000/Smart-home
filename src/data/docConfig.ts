import type { GroupDef } from "@/lib/doc";

// Which H2 sections of each long-form doc belong to which sub-view.
// Titles are the plain-text H2 headings (with "&", not "&amp;").

export const PLAN_GROUPS: GroupDef[] = [
  {
    key: "overview",
    label: "Overview",
    sections: [
      "Goals",
      "Foundation: structured cabling",
      "Existing kit to reuse",
      "Technical integration",
      "Networking — gateway & inter-site SD-WAN",
      "Server health monitoring (Unraid)",
    ],
  },
  {
    key: "hardware",
    label: "Hardware",
    sections: [
      "Voice coverage — rooms",
      "Hub & radios (Unraid box)",
      "Lighting",
      "Locks",
      "Blinds",
      "Heating & climate control",
      "Cooling / AC (optional)",
      "CCTV + doorbell",
      "Audio / music",
    ],
  },
  {
    key: "smart",
    label: "Smart layer",
    sections: [
      "Displays & touch panels",
      "Proactive automation",
      "Per-room presence (Aqara mmWave)",
      "PC integration",
      "Smart plug deployment",
      "Optional: Window motors",
    ],
  },
  {
    key: "build",
    label: "Build",
    sections: [
      "Additions to cabling scope (NOT in current spec)",
      "Pre-move-in wiring — additional considerations",
      "Privacy",
    ],
  },
  {
    key: "reference",
    label: "Reference",
    sections: [
      "Phased rollout",
      "Open questions",
      "Cost ballpark (very rough, UK, phase 1 only)",
    ],
  },
];

// The full "Signature behaviours" section lives in its own interactive
// Behaviours tab, so it's excluded from the Plan to keep the Smart layer lean.
export const PLAN_EXCLUDE = ["signature-behaviours"];

export const INTEGRATION_GROUPS: GroupDef[] = [
  {
    key: "overview",
    label: "Overview",
    sections: [
      "Overview",
      "Software stack",
      "Conversation flow",
      "Implementation route",
      "Reactive vs proactive — two modes",
    ],
  },
  {
    key: "proactive",
    label: "Proactive & people",
    sections: [
      "Proactive Claude — custom service architecture",
      "Person identification",
    ],
  },
  {
    key: "behaviour",
    label: "Behaviour",
    sections: ["Behaviour design", "Entity exposure strategy"],
  },
  {
    key: "memory",
    label: "Memory",
    sections: ["Memory architecture (RAG + structured)"],
  },
  {
    key: "reference",
    label: "Reference",
    sections: [
      "Latency budget",
      "Costs",
      "Open implementation questions",
      "Phase 1 implementation checklist",
    ],
  },
];
