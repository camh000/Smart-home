// Logical network topology — hand-curated from the plan (not auto-discovered).
// Rendered as a tiered diagram by NetworkMap.tsx.

export type VlanKey = "infra" | "main" | "iot" | "voice" | "cctv" | "guest" | "download";

export interface Vlan {
  key: VlanKey;
  label: string;
  color: string;
}

// "infra" = the backbone itself (gateway/switches/APs carry every VLAN as a
// trunk, so they aren't on one VLAN); the rest are the segmented client VLANs.
export const VLANS: Vlan[] = [
  { key: "infra", label: "Infrastructure", color: "#5a6478" },
  { key: "main", label: "Main", color: "#4a6b8a" },
  { key: "iot", label: "IoT", color: "#c98a2b" },
  { key: "voice", label: "Voice", color: "#b8543a" },
  { key: "cctv", label: "CCTV", color: "#3f6b6b" },
  { key: "guest", label: "Guest", color: "#7a4a8a" },
  { key: "download", label: "Downloads (VPN)", color: "#5a8f3f" },
];

export const VLAN_MAP: Record<VlanKey, Vlan> = Object.fromEntries(
  VLANS.map((v) => [v.key, v]),
) as Record<VlanKey, Vlan>;

export type NodeType =
  | "wan"
  | "site"
  | "gateway"
  | "switch"
  | "ap"
  | "camera"
  | "server"
  | "service"
  | "voice"
  | "iot"
  | "client";

export interface NetNode {
  id: string;
  label: string;
  sub?: string;
  type: NodeType;
  vlan: VlanKey;
  /** Tier row (0 = WAN at top) and horizontal position in a 0–1000 virtual space. */
  tier: number;
  x: number;
  icon: string;
  meta: string;
}

export type EdgeKind = "wan" | "sdwan" | "wired" | "poe" | "fibre" | "wifi";

export interface NetEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  label?: string;
}

export const EDGE_STYLE: Record<EdgeKind, { label: string; color: string; dash?: string }> = {
  wan: { label: "WAN / internet", color: "#8e96a6" },
  sdwan: { label: "SD-WAN tunnel", color: "#b8543a", dash: "7 6" },
  wired: { label: "Ethernet", color: "#c9bfa9" },
  poe: { label: "PoE (power + data)", color: "#466b3f" },
  fibre: { label: "Fibre (inter-building)", color: "#c98a2b", dash: "2 6" },
  wifi: { label: "Wi-Fi", color: "#8a6db0", dash: "1 7" },
};

export const NODES: NetNode[] = [
  // Tier 0 — the outside world
  { id: "wan", label: "Internet", sub: "FTTP · dynamic IP", type: "wan", vlan: "infra", tier: 0, x: 470, icon: "🌐", meta: "Full-fibre broadband on a public dynamic IP — the reachable endpoint for the Selby SD-WAN (no static IP or dynamic-DNS needed; the gateway reports its WAN IP to UniFi's cloud)." },
  { id: "selby", label: "Selby (dad's)", sub: "remote UniFi site", type: "site", vlan: "infra", tier: 0, x: 880, icon: "🏠", meta: "Dad's UniFi gateway in Selby — the other end of the Site Magic SD-WAN. Hosts off-site encrypted backups (HA snapshots, Immich, memory) and an Uptime-Kuma watchdog probing Woodhouse. Mutual." },

  // Tier 1 — gateway
  { id: "ucg", label: "UCG-Ultra", sub: "gateway · firewall", type: "gateway", vlan: "infra", tier: 1, x: 470, icon: "🛡️", meta: "UniFi Cloud Gateway Ultra — the network root: routing, firewall, IDS/IPS (~1 Gbps), VLAN segmentation, WireGuard/Teleport VPN and Site Magic SD-WAN. 1× 2.5 GbE WAN + 4× 1 GbE LAN (no PoE, no Wi-Fi)." },

  // Tier 2 — core switch
  { id: "core", label: "Core PoE switch", sub: "UniFi · head-end (Bed 3)", type: "switch", vlan: "infra", tier: 2, x: 470, icon: "🔀", meta: "UniFi PoE+ switch at the Bedroom-3 head-end — the star point all home-runs return to. Powers the cameras + doorbell (and the future U7 APs). A USW-Pro-Max-16-PoE would also add the 2.5 GbE the Ultra's gigabit LAN lacks." },

  // Tier 3 — distribution / direct devices
  { id: "office-sw", label: "Office switch", sub: "TP-Link · VLAN access", type: "switch", vlan: "infra", tier: 3, x: 85, icon: "🔀", meta: "Owned TP-Link 9-port Easy Smart, reused as a VLAN-aware access switch where the office desk fans out off one drop. 802.1Q tagged to match the UniFi VLAN IDs (not UniFi-managed)." },
  { id: "lounge-sw", label: "Lounge switch", sub: "TP-Link · VLAN access", type: "switch", vlan: "infra", tier: 3, x: 235, icon: "🔀", meta: "Owned TP-Link 9-port Easy Smart for the lounge AV stack (AVR, Apple TV, TV, console) off one drop. 802.1Q tagged to the UniFi VLANs." },
  { id: "aps", label: "Wi-Fi APs", sub: "Deco → U7 (planned)", type: "ap", vlan: "infra", tier: 3, x: 470, icon: "📶", meta: "3× TP-Link Deco as access points behind the gateway today; planned swap to WiFi-7 UniFi APs (U7). PoE-powered — they add to the core switch's PoE budget. Broadcast every client VLAN (main/IoT/voice/guest)." },
  { id: "cameras", label: "Cameras + doorbell", sub: "4× PoE + bell", type: "camera", vlan: "cctv", tier: 3, x: 660, icon: "🎥", meta: "4 PoE cameras + a PoE video doorbell on the CCTV VLAN, recorded locally by Frigate on Unraid. Internet egress blocked; local NTP. Person/face detection drives automations." },
  { id: "unraid", label: "Unraid server", sub: "HA · Frigate · Qdrant", type: "server", vlan: "main", tier: 3, x: 815, icon: "🖥️", meta: "The brain: Home Assistant, Frigate, Qdrant memory, Docker. Wants a 2.5 GbE uplink so CCTV + HA + backups don't bottleneck — needs a 2.5 G switch port (the Ultra's LAN is gigabit)." },
  { id: "garage", label: "Garage Deco", sub: "detached building", type: "ap", vlan: "infra", tier: 3, x: 940, icon: "🛰️", meta: "Deco/AP at the far end of the detached garage, fed by the inter-building fibre link. Extends the network (and a VLAN or two) to the garage bar + devices." },

  // Tier 4 — leaf endpoints
  { id: "office-pcs", label: "Cam + Nova PCs", sub: "HASS.Agent", type: "client", vlan: "main", tier: 4, x: 85, icon: "💻", meta: "The two office PCs (Cam + Nova), each running HASS.Agent for ~30 activity/presence sensors. On the main VLAN." },
  { id: "lounge-av", label: "AV stack", sub: "AVR · Apple TV · TV", type: "client", vlan: "main", tier: 4, x: 235, icon: "📺", meta: "Lounge AV: AVR, Apple TV, the TV (Android TV / Cast + CEC) and the Steam Deck dock for game streaming. Main VLAN." },
  { id: "voice", label: "Voice nodes", sub: "7× HA Voice PE", type: "voice", vlan: "voice", tier: 4, x: 410, icon: "🎙️", meta: "HA Voice PE satellites in 7 rooms — Wi-Fi + USB-C (no Ethernet), so they ride the APs on the voice VLAN. Wake → STT → Claude → tool-call → TTS." },
  { id: "phones", label: "Phones & tablets", sub: "Companion app", type: "client", vlan: "main", tier: 4, x: 545, icon: "📱", meta: "Phones (HA Companion presence + push) and wall tablets for dashboards. Main VLAN over Wi-Fi." },
  { id: "iot", label: "IoT devices", sub: "lights · plugs · locks", type: "iot", vlan: "iot", tier: 4, x: 690, icon: "💡", meta: "Wi-Fi/Matter IoT — smart plugs, some lighting, locks and sensors — isolated on the IoT VLAN (Zigbee kit rides its own mesh via the coordinator on Unraid, not Wi-Fi)." },
  { id: "garage-leaf", label: "Garage bar + kit", sub: "iot", type: "iot", vlan: "iot", tier: 4, x: 940, icon: "🍺", meta: "Garage bar electronics (keg flow-meter, WLED, sensors) and any garage IoT, reached over the fibre link." },
  { id: "downloads", label: "Download stack", sub: "qBit · Deluge · Prowlarr", type: "service", vlan: "download", tier: 4, x: 815, icon: "📥", meta: "qBittorrent, Deluge and Prowlarr (with the *arr apps) as Docker containers on Unraid, pinned to a dedicated isolated VLAN (VLAN-tagged macvlan/ipvlan). Firewalled off every other VLAN — no reach to HA, cameras or main — and forced out through a VPN with a kill-switch (e.g. gluetun), so torrent/usenet traffic never touches the rest of the house and can't leak if the tunnel drops." },
];

export const EDGES: NetEdge[] = [
  { from: "wan", to: "ucg", kind: "wan" },
  { from: "selby", to: "ucg", kind: "sdwan", label: "Site Magic" },
  { from: "ucg", to: "core", kind: "wired", label: "1 GbE" },
  { from: "core", to: "office-sw", kind: "wired" },
  { from: "core", to: "lounge-sw", kind: "wired" },
  { from: "core", to: "aps", kind: "poe" },
  { from: "core", to: "cameras", kind: "poe" },
  { from: "core", to: "unraid", kind: "wired", label: "2.5 GbE*" },
  { from: "core", to: "garage", kind: "fibre" },
  { from: "office-sw", to: "office-pcs", kind: "wired" },
  { from: "lounge-sw", to: "lounge-av", kind: "wired" },
  { from: "aps", to: "voice", kind: "wifi" },
  { from: "aps", to: "phones", kind: "wifi" },
  { from: "aps", to: "iot", kind: "wifi" },
  { from: "garage", to: "garage-leaf", kind: "wired" },
  { from: "unraid", to: "downloads", kind: "wired", label: "VLAN" },
];

// Tier → vertical position in the 0–560 virtual space used by NetworkMap.
export const TIER_Y = [44, 150, 262, 386, 516];
export const VIEW_W = 1000;
export const VIEW_H = 560;

// ---------------------------------------------------------------------------
// UniFi Zone-Based Firewall — mirrors the actual UCG zone setup. A zone groups
// one or more networks; the matrix is the inter-zone policy.
// ---------------------------------------------------------------------------
export type ZoneKey = "internal" | "external" | "gateway" | "vpn" | "hotspot" | "dmz";

export interface Zone {
  key: ZoneKey;
  label: string;
  color: string;
  members: string[];
  note: string;
}

export const ZONES: Zone[] = [
  { key: "internal", label: "Internal", color: "#466b3f", members: ["Default"], note: "Trusted LAN — the everyday network." },
  { key: "external", label: "External", color: "#2a3548", members: ["Internet 1", "Internet 2"], note: "WAN uplinks; no unsolicited inbound." },
  { key: "gateway", label: "Gateway", color: "#8e96a6", members: ["UCG-Ultra"], note: "The gateway itself." },
  { key: "vpn", label: "VPN", color: "#4a6b8a", members: ["Branetec", "The Barn"], note: "Site-to-site links — trusted like Internal." },
  { key: "hotspot", label: "Hotspot", color: "#c98a2b", members: ["Guest networks"], note: "Guest portal — internet only." },
  { key: "dmz", label: "DMZ", color: "#b8543a", members: ["DMZ", "Downloads"], note: "Isolated servers — internet only, no lateral access." },
];

export const ZONE_MAP = Object.fromEntries(ZONES.map((z) => [z.key, z])) as Record<ZoneKey, Zone>;

// Which zone each topology node sits in (best-effort: today everything trusted
// is on the single Default network → Internal; the download stack is isolated
// in DMZ; the off-site peer is in VPN).
export const NODE_ZONE: Record<string, ZoneKey> = {
  wan: "external",
  selby: "vpn",
  ucg: "gateway",
  core: "internal",
  "office-sw": "internal",
  "lounge-sw": "internal",
  aps: "internal",
  cameras: "internal",
  unraid: "internal",
  garage: "internal",
  "office-pcs": "internal",
  "lounge-av": "internal",
  voice: "internal",
  phones: "internal",
  iot: "internal",
  "garage-leaf": "internal",
  downloads: "dmz",
};

export type Policy = "all" | "return" | "block" | "self";

export const MATRIX_STYLE: Record<Policy, { label: string; bg: string; fg: string }> = {
  all: { label: "Allow All", bg: "#e7f0e6", fg: "#2f5a2a" },
  return: { label: "Allow Return", bg: "#e6eef5", fg: "#2a4a6b" },
  block: { label: "Block All", bg: "#f6e1dd", fg: "#8a2f1c" },
  self: { label: "—", bg: "transparent", fg: "#8e96a6" },
};

// Source zone → destination zone → policy (faithful to the UCG zone matrix).
export const ZONE_MATRIX: Record<ZoneKey, Record<ZoneKey, Policy>> = {
  internal: { internal: "all", external: "all", gateway: "all", vpn: "all", hotspot: "all", dmz: "all" },
  external: { internal: "return", external: "return", gateway: "return", vpn: "return", hotspot: "return", dmz: "return" },
  gateway: { internal: "all", external: "all", gateway: "self", vpn: "all", hotspot: "all", dmz: "all" },
  vpn: { internal: "all", external: "all", gateway: "all", vpn: "all", hotspot: "all", dmz: "all" },
  hotspot: { internal: "return", external: "all", gateway: "return", vpn: "return", hotspot: "block", dmz: "block" },
  dmz: { internal: "return", external: "all", gateway: "return", vpn: "return", hotspot: "block", dmz: "block" },
};
