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
  { terms: ["cache pool", "cache"], def: "On Unraid, a fast SSD/NVMe tier that absorbs writes before data is moved to the slower array. A pool can hold one or several drives." },
  { terms: ["the mover", "Unraid mover", "mover"], def: "Unraid's scheduled job that relocates files from the cache pool onto the array. The Mover Tuning plugin adds rules like 'only move files older than N days'." },
  { terms: ["parity", "parity array", "parity-protected"], def: "Unraid's array protection — a dedicated drive lets you rebuild data if one disk dies. Costs a whole drive, so it's wasteful for replaceable data like CCTV footage." },
  { terms: ["btrfs", "ZFS"], def: "Filesystems Unraid uses for multi-device pools — supporting mirrors (redundancy) or stripes (capacity/speed)." },
  { terms: ["unprotected disk", "unassigned device"], def: "An Unraid drive outside the parity array — no rebuild protection, but no parity write-penalty either. Ideal for replaceable, write-heavy data like CCTV." },
  { terms: ["Minimum free space", "Minimum Free Space"], def: "Unraid (and *arr) setting — once a disk's free space drops below it, new writes for that share stop landing there. Used to fence off a reserve so one share can't fill the disk and starve another." },
  { terms: ["SMART"], def: "Self-monitoring data built into drives (reallocated sectors, temperature…) that hints at failure." },
  { terms: ["ntfy"], def: "Simple self-hosted push-notification service — apps POST a message and it pings your phone/desktop." },
  { terms: ["Shoutrrr"], def: "A notification-routing library many self-hosted apps (incl. Scrutiny) use to send alerts to services like ntfy, Telegram or a webhook." },
  { terms: ["restic", "borg"], def: "Backup tools with built-in client-side encryption — so an off-site copy can't be read by the host." },

  // Voice pipeline
  { terms: ["HA Voice PE", "Voice PE", "Voice Preview Edition"], def: "Home Assistant's official voice satellite — Wi-Fi, USB-C powered, with mic, speaker and a mute switch (no Ethernet)." },
  { terms: ["openWakeWord"], def: "Local wake-word detector that listens for the trigger phrase on each voice node." },
  { terms: ["Whisper"], def: "Local speech-to-text engine that transcribes what you say." },
  { terms: ["Piper"], def: "Fast local text-to-speech engine — the assistant's voice." },
  { terms: ["Wyoming"], def: "Home Assistant's protocol for connecting voice satellites and services." },
  { terms: ["microWakeWord"], def: "Tiny on-device wake-word detector that runs on the Voice PE itself, so the trigger phrase is caught locally with no server round-trip." },
  { terms: ["acoustic echo cancellation", "AEC"], def: "Subtracts the speaker's own output from the mic feed so the device can still hear you while it's talking (lets you interrupt it mid-reply)." },
  { terms: ["beamforming"], def: "Combining several microphones to focus on the voice direction and suppress room noise." },
  { terms: ["XMOS"], def: "The dedicated audio chip (XU316) in the Voice PE that runs echo cancellation and beamforming before audio reaches the wake-word/STT stage." },
  { terms: ["HA Cloud", "Nabu Casa"], def: "Home Assistant's paid cloud subscription (~£65/yr) — funds HA and provides high-accuracy cloud speech-to-text/text-to-speech and easy remote access." },
  { terms: ["faster-whisper"], def: "An optimised build of Whisper that runs much quicker (especially on a GPU) for lower voice latency." },
  { terms: ["ReSpeaker"], def: "A multi-microphone array board (e.g. 4-mic) that gives a DIY Raspberry Pi voice satellite far better far-field pickup." },
  { terms: ["STT"], def: "Speech-to-text — turning your spoken words into text." },
  { terms: ["TTS"], def: "Text-to-speech — turning the assistant's reply into spoken audio." },
  { terms: ["RAG"], def: "Retrieval-Augmented Generation — fetching relevant stored memories to feed the AI as context." },
  { terms: ["Picovoice Eagle", "Eagle"], def: "Speaker-recognition SDK that identifies who is talking from their voice." },

  // Audio / AV
  { terms: ["WiiM Mini", "WiiM Pro", "WiiM Amp", "WiiM"], def: "Compact network audio streamer (AirPlay/Chromecast/Spotify/DLNA) that HA can control. Mini is Wi-Fi-only; Pro adds Ethernet + sub-out; the Amp also drives passive speakers." },
  { terms: ["Music Assistant"], def: "A Home Assistant add-on that pulls your music sources together and drives any endpoint (WiiM, Sonos, Chromecast, AirPlay, Snapcast) from HA — the control plane that decouples you from any one speaker brand." },
  { terms: ["Snapcast"], def: "Open-source server for sample-accurate synchronised multi-room audio — the fully-local DIY alternative to a commercial multi-room system." },
  { terms: ["LinkPlay"], def: "The streaming platform WiiM is built on; what HA's integration talks to for local control." },
  { terms: ["Spotify Connect", "Tidal Connect"], def: "Cast a stream straight from the Spotify/Tidal app to a network speaker, which then pulls the audio itself." },
  { terms: ["Roon"], def: "High-end music library/streaming software; WiiM units can act as Roon playback endpoints." },
  { terms: ["Sonos"], def: "The mainstream commercial multi-room audio system — polished but cloud-dependent and pricier than WiiM." },
  { terms: ["AVR"], def: "AV receiver — the home-cinema amplifier that drives surround speakers and switches HDMI." },
  { terms: ["eARC"], def: "Enhanced Audio Return Channel — sends the TV's audio back to the AVR over one HDMI cable." },
  { terms: ["QD-Mini LED", "Mini-LED"], def: "A TV backlight of thousands of tiny LEDs + Quantum Dots — very bright with deep local-dimming contrast; great in bright rooms." },
  { terms: ["OLED"], def: "A TV panel where each pixel makes its own light — perfect blacks, but dimmer than Mini-LED and can burn-in on static images." },
  { terms: ["HDMI 2.1"], def: "The HDMI version that carries 4K@120Hz, VRR and ALLM — the gaming-friendly features." },
  { terms: ["VRR"], def: "Variable Refresh Rate — the TV syncs to the source's frame rate to remove tearing/stutter in games." },
  { terms: ["ALLM"], def: "Auto Low Latency Mode — the TV auto-switches to its low-lag Game Mode when a console/PC is detected." },
  { terms: ["HDMI-CEC", "CEC"], def: "HDMI control signalling — lets one device power on/switch others (e.g. HA/AVR turning the TV on and selecting an input)." },
  { terms: ["Google TV", "Android TV"], def: "Google's smart-TV platform (on TCL here) — HA controls it for power, volume, apps and playback state." },
  { terms: ["Dolby Vision"], def: "A premium HDR format with scene-by-scene tone mapping for better contrast and colour on supported TVs." },
  { terms: ["AirPlay 2"], def: "Apple's wireless streaming — lets Plex/phones cast audio or video straight to the TV." },
  { terms: ["one-touch play"], def: "HDMI-CEC feature where waking one device (the Apple TV) powers on the TV + soundbar and switches to the right input." },
  { terms: ["Plex"], def: "Self-hosted media server for your films and music." },

  // Networking
  { terms: ["PoE"], def: "Power over Ethernet — one network cable carries both data and power (for cameras, etc.)." },
  { terms: ["VLAN"], def: "Virtual LAN — logically separates devices (IoT, cameras, guest) on the same physical network." },
  { terms: ["SD-WAN"], def: "Software-defined link that securely joins two sites' networks over the internet." },
  { terms: ["Site Magic"], def: "Ubiquiti's one-click feature to build a site-to-site SD-WAN between two UniFi gateways." },
  { terms: ["UCG-Max", "Cloud Gateway Max"], def: "UniFi Cloud Gateway Max — the router/firewall at the heart of the network." },
  { terms: ["CGNAT"], def: "Carrier-grade NAT — when your ISP shares one public IP across many customers, so you don't get your own." },
  { terms: ["Tailscale"], def: "Zero-config mesh VPN that securely connects your devices over the internet." },
  { terms: ["WireGuard"], def: "A fast, modern VPN protocol — here run on the gateway so remote access doesn't depend on the server." },
  { terms: ["Teleport"], def: "UniFi's built-in one-tap remote-access VPN, hosted on the gateway itself." },
  { terms: ["Pi-hole", "AdGuard"], def: "Self-hosted network-wide DNS ad-blocker — handy, but don't make it the only DNS or a server outage breaks all internet." },
  { terms: ["IDS/IPS"], def: "Intrusion detection/prevention — the gateway inspecting traffic for threats." },
  { terms: ["MQTT"], def: "Lightweight messaging protocol many sensors use to talk to Home Assistant." },
  { terms: ["HACS"], def: "Home Assistant Community Store — a one-time add-on that lets you install community integrations and dashboards not bundled with HA." },
  { terms: ["govee2mqtt"], def: "A small container/add-on that bridges Govee's cloud (and LAN) to MQTT, so cloud-only Govee devices show up in Home Assistant via a free API key." },
  { terms: ["Mosquitto"], def: "The standard lightweight MQTT broker — the message hub that MQTT devices and bridges publish to." },
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
  { terms: ["WLED"], def: "Open-source firmware for ESP32-driven addressable LED strips — effects, colours and music-reactive, controllable from HA." },
  { terms: ["ESP32"], def: "A cheap Wi-Fi microcontroller that runs WLED/ESPHome — the glue for DIY sensors and lighting." },
  { terms: ["NFC"], def: "Near-field tags you tap a phone/reader on — here, coasters that queue a song or open a tab." },
  { terms: ["CodeProject.AI"], def: "Self-hosted AI server (runs on Unraid) for tasks like licence-plate or dart scoring via the cameras." },
  { terms: ["HX711"], def: "A small amplifier board that reads load cells (weight sensors) into an ESP32 — used here to weigh bottles." },
  { terms: ["PETG"], def: "A tough, slightly heat-resistant 3D-printing filament — good for functional parts and anything near warmth." },
  { terms: ["ASA"], def: "A UV- and heat-resistant 3D-printing filament — the pick for outdoor parts like camera mounts." },
  { terms: ["PLA"], def: "The easiest 3D-printing filament, but it softens in heat/sun — fine indoors, not for hot or outdoor spots." },
  { terms: ["AMS"], def: "Bambu's Automatic Material System — a multi-spool feeder that auto-switches filament and reports levels to HA." },
  { terms: ["Obico"], def: "Self-hosted AI that watches the printer camera for failures (spaghetti) and can auto-pause and alert." },
  { terms: ["Pomodoro"], def: "A focus technique: work in timed sprints (e.g. 25 min) with short breaks between." },
  { terms: ["KVM"], def: "Keyboard-Video-Mouse switch — share one set of monitors + peripherals between two computers (here, the work laptop and gaming PC)." },
  { terms: ["DP Alt Mode"], def: "DisplayPort over a USB-C cable — how most laptops drive an external monitor through their USB-C port." },
  { terms: ["MST"], def: "Multi-Stream Transport — lets one DisplayPort/USB-C output drive two monitors, no extra drivers (if the laptop supports it)." },
  { terms: ["DisplayLink"], def: "A way to drive extra monitors over USB that needs a driver install — usually blocked on locked-down work laptops." },
  { terms: ["Sunshine"], def: "Open-source game-stream host that runs on the gaming PC; pairs with the Moonlight client on the Steam Deck." },
  { terms: ["Moonlight"], def: "Open-source low-latency game-streaming client — runs on the Steam Deck to play the gaming PC remotely." },
  { terms: ["Steam Remote Play"], def: "Valve's built-in in-home game streaming — zero-setup for Steam games, PC to Steam Deck." },
  { terms: ["Wake-on-LAN", "WoL"], def: "A network 'magic packet' that powers on a sleeping PC — here, HA waking the gaming PC on demand." },
  { terms: ["mDNS"], def: "Multicast DNS — how devices auto-discover each other on a LAN; it doesn't cross VLANs without a reflector." },
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
