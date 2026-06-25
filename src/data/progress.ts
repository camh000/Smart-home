// The "Start now for £0" foundations — what's already running on the testbed
// vs still to stand up. Flip `done` as each one lands; the homepage tracker
// recomputes automatically.
export interface FoundationItem {
  label: string;
  done: boolean;
}

export const FOUNDATIONS: FoundationItem[] = [
  { label: "Home Assistant", done: true },
  { label: "Mosquitto MQTT", done: true },
  { label: "Matter Server", done: true },
  { label: "Companion app", done: true },
  { label: "Govee bulbs → HA", done: true },
  { label: "Bedroom Matter lamp", done: true },
  { label: "Grocy", done: true },
  { label: "Scrutiny", done: true },
  { label: "Glances → HA", done: true },
  { label: "Zigbee coordinator", done: false },
  { label: "RAG memory (Qdrant + Ollama)", done: false },
  { label: "Claude integration", done: false },
  { label: "Voice pipeline (Whisper/Piper)", done: false },
  { label: "Frigate (NVR)", done: false },
];
