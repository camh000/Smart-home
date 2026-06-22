// Plain-language definitions for the jargon / product names used in the docs.
// Each entry lists the surface forms that should trigger the tooltip.

export interface GlossaryEntry {
  terms: string[];
  def: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  // Core software / server
  { terms: ["Unraid"], def: "The NAS/server operating system hosting Home Assistant, Frigate, Docker containers and storage." },
  { terms: ["Frigate"], def: "Open-source local NVR (camera recorder) with AI object detection; runs in Docker on Unraid." },
  { terms: ["Qdrant"], def: "Open-source vector database — stores conversation/memory embeddings for fast similarity search." },
  { terms: ["Ollama"], def: "Runs local AI models (here, the small text-embedding model) on your own hardware." },
  { terms: ["Grocy"], def: "Self-hosted household & grocery inventory / chore manager." },
  { terms: ["Immich"], def: "Self-hosted Google-Photos alternative for your own photo and video library." },
  { terms: ["Scrutiny"], def: "Dashboard that tracks hard-drive SMART health and predicts disk failures." },
  { terms: ["Glances"], def: "Lightweight system monitor that exposes CPU/RAM/disk metrics to Home Assistant." },
  { terms: ["SMART"], def: "Self-monitoring data built into drives (reallocated sectors, temperature…) that hints at failure." },
  { terms: ["restic", "borg"], def: "Backup tools with built-in client-side encryption — so an off-site copy can't be read by the host." },

  // Voice pipeline
  { terms: ["HA Voice PE", "Voice PE", "Voice Preview Edition"], def: "Home Assistant's official voice satellite — Wi-Fi, USB-C powered, with mic, speaker and a mute switch (no Ethernet)." },
  { terms: ["openWakeWord"], def: "Local wake-word detector that listens for the trigger phrase on each voice node." },
  { terms: ["Whisper"], def: "Local speech-to-text engine that transcribes what you say." },
  { terms: ["Piper"], def: "Fast local text-to-speech engine — the assistant's voice." },
  { terms: ["Wyoming"], def: "Home Assistant's protocol for connecting voice satellites and services." },
  { terms: ["STT"], def: "Speech-to-text — turning your spoken words into text." },
  { terms: ["TTS"], def: "Text-to-speech — turning the assistant's reply into spoken audio." },
  { terms: ["RAG"], def: "Retrieval-Augmented Generation — fetching relevant stored memories to feed the AI as context." },
  { terms: ["Picovoice Eagle", "Eagle"], def: "Speaker-recognition SDK that identifies who is talking from their voice." },

  // Audio / AV
  { terms: ["WiiM Mini", "WiiM Pro", "WiiM"], def: "Compact network audio streamer (AirPlay/Chromecast/Spotify/DLNA) that HA can control." },
  { terms: ["AVR"], def: "AV receiver — the home-cinema amplifier that drives surround speakers and switches HDMI." },
  { terms: ["eARC"], def: "Enhanced Audio Return Channel — sends the TV's audio back to the AVR over one HDMI cable." },
  { terms: ["Plex"], def: "Self-hosted media server for your films and music." },

  // Networking
  { terms: ["PoE"], def: "Power over Ethernet — one network cable carries both data and power (for cameras, etc.)." },
  { terms: ["VLAN"], def: "Virtual LAN — logically separates devices (IoT, cameras, guest) on the same physical network." },
  { terms: ["SD-WAN"], def: "Software-defined link that securely joins two sites' networks over the internet." },
  { terms: ["Site Magic"], def: "Ubiquiti's one-click feature to build a site-to-site SD-WAN between two UniFi gateways." },
  { terms: ["UCG-Max", "Cloud Gateway Max"], def: "UniFi Cloud Gateway Max — the router/firewall at the heart of the network." },
  { terms: ["CGNAT"], def: "Carrier-grade NAT — when your ISP shares one public IP across many customers, so you don't get your own." },
  { terms: ["Tailscale"], def: "Zero-config mesh VPN that securely connects your devices over the internet." },
  { terms: ["IDS/IPS"], def: "Intrusion detection/prevention — the gateway inspecting traffic for threats." },
  { terms: ["MQTT"], def: "Lightweight messaging protocol many sensors use to talk to Home Assistant." },
  { terms: ["Deco"], def: "TP-Link's mesh Wi-Fi system — here demoted to plain access points behind the UniFi gateway." },

  // Radios / standards
  { terms: ["Zigbee"], def: "Low-power mesh radio for sensors/bulbs/switches; needs a USB coordinator dongle." },
  { terms: ["Matter"], def: "Cross-vendor smart-home standard for local control (over Wi-Fi or Thread)." },
  { terms: ["Thread"], def: "Low-power mesh radio that underpins many Matter devices." },
  { terms: ["mmWave"], def: "Millimetre-wave radar presence sensing — detects you even sitting still (unlike a motion sensor)." },
  { terms: ["PIR"], def: "Passive-infrared motion sensor — only sees movement, not stillness." },

  // Heating
  { terms: ["TRV"], def: "Thermostatic radiator valve — here a smart one HA can control per room." },
  { terms: ["UFH"], def: "Underfloor heating." },
  { terms: ["OpenTherm"], def: "Boiler protocol that lets the heating modulate (run gently) instead of just switching on/off." },
  { terms: ["OTGW", "OpenTherm Gateway"], def: "A small box that bridges the boiler's OpenTherm to Home Assistant." },
  { terms: ["Generic Thermostat"], def: "Built-in HA component that turns any heater + temperature sensor into a thermostat." },
  { terms: ["TPI", "PWM"], def: "Time-proportional control — pulsing heat on/off in a duty cycle to avoid overshoot (good for slow UFH)." },

  // CCTV / detection
  { terms: ["NVR"], def: "Network video recorder — records and manages the CCTV cameras." },
  { terms: ["ALPR"], def: "Automatic licence-plate recognition." },
  { terms: ["Coral TPU", "Coral"], def: "Google's USB AI accelerator that speeds up Frigate's object detection." },
  { terms: ["OpenVINO"], def: "Intel's toolkit that runs Frigate's AI detection on a CPU/iGPU instead of a Coral." },

  // Power / monitoring
  { terms: ["UPS"], def: "Uninterruptible power supply — battery backup that rides out power cuts." },
  { terms: ["NUT"], def: "Network UPS Tools — lets HA read the UPS and trigger a safe shutdown on power loss." },
  { terms: ["Uptime Kuma"], def: "Self-hosted uptime monitor that actively pings your services and alerts when one goes down." },
  { terms: ["Healthchecks.io", "Healthchecks"], def: "A 'dead man's switch' service — your system pings it on a schedule; if the pings stop, it alerts you." },
  { terms: ["dead-man's-switch", "dead man's switch"], def: "Monitoring that alerts on the *absence* of an expected signal — so a total outage (which can't send an alert itself) still gets noticed." },

  // Brands / integrations
  { terms: ["HASS.Agent"], def: "Windows app that exposes PC sensors (active/idle, focused window…) to HA over MQTT." },
  { terms: ["Adaptive Lighting"], def: "HA add-on that auto-shifts bulb colour temperature through the day (circadian)." },
  { terms: ["Fully Kiosk"], def: "Android app that locks a tablet into a single full-screen HA dashboard." },
  { terms: ["Shelly"], def: "Small Wi-Fi relays/meters with a proper local API — used here for UFH actuators and energy metering." },
  { terms: ["Aqara"], def: "Smart-home brand (sensors, locks, TRVs); many devices are HomeKit/Matter-native." },
  { terms: ["Frient"], def: "Danish brand of well-regarded Zigbee safety sensors (smoke / CO / leak)." },
  { terms: ["Octopus Agile"], def: "A UK electricity tariff with half-hourly prices you can schedule appliances around." },

  // Cabling spec
  { terms: ["Cat6"], def: "Category-6 twisted-pair network cable — the structured-cabling standard used throughout the house." },
  { terms: ["patch panel"], def: "A rack panel where every cable run terminates, so drops can be patched to switches with short leads." },
  { terms: ["keystone"], def: "The snap-in RJ45 socket module a cable terminates into at the wall plate." },
  { terms: ["first fix"], def: "The build stage where cables are pulled and containment installed before the walls are closed up — the point of no return." },
  { terms: ["second fix"], def: "The later stage where cables are terminated to sockets and patch panels once the walls are finished." },
  { terms: ["fibre"], def: "Fibre-optic cable — used for the garage link to avoid electrical surge/earth issues between buildings." },
  { terms: ["head-end"], def: "The central comms point (Bedroom 3) where every cable run terminates and the active kit lives." },
];

interface Lookup {
  key: string;
  def: string;
}

/** surface form → { canonical key, def } */
export const GLOSSARY_LOOKUP: Map<string, Lookup> = (() => {
  const m = new Map<string, Lookup>();
  for (const e of GLOSSARY) {
    const key = e.terms[0];
    for (const t of e.terms) m.set(t, { key, def: e.def });
  }
  return m;
})();

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** One regex matching any surface form, longest first, on word boundaries. */
export const GLOSSARY_RE: RegExp = (() => {
  const surfaces = Array.from(GLOSSARY_LOOKUP.keys()).sort((a, b) => b.length - a.length);
  return new RegExp(`(?<![\\w-])(?:${surfaces.map(escapeRe).join("|")})(?![\\w-])`, "g");
})();
