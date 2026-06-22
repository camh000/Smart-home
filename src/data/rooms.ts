import type { CategoryKey } from "./categories";

export interface RoomItem {
  cat: CategoryKey;
  label: string;
  detail: string;
}

export interface Room {
  id: string;
  name: string;
  meta: string;
  floor: "ground" | "first" | "detached";
  /** Schematic position within the floor plan, in % (left, top, width, height). */
  rect: { x: number; y: number; w: number; h: number };
  bay?: boolean;
  items: RoomItem[];
}

export const ROOMS: Room[] = [
  {
    id: "lounge",
    name: "Lounge",
    meta: "4.07 × 3.91m · front-left, ground floor · bay window · south-facing",
    floor: "ground",
    rect: { x: 2, y: 50, w: 42, h: 47 },
    bay: true,
    items: [
      { cat: "voice", label: "Voice node", detail: "HA Voice PE — main listening position. Wired Cat6." },
      { cat: "speaker", label: "Audio", detail: "AVR + 5.1 surround (Atmos not in scope). Eltax C-205 as rears. Front L/R + centre TBC (secondhand hunt). Apple TV plugs into AVR for film/Plex." },
      { cat: "blind", label: "Bay window blinds", detail: "3 motors (narrow-wide-narrow). Power decision deferred — provision to all 3 heads." },
      { cat: "window", label: "Bay window actuator", detail: "Motorised opening on the openable bay section (typically the centre). Battery or mains TBD with the rest of the window-motor scope." },
      { cat: "light", label: "Zigbee lighting", detail: "Migrate existing 4× Govee H6008 here for phase 1 testing. Will become full Zigbee zone." },
      { cat: "display", label: "Wall tablet — phase 3", detail: "AV control, scene selection, doorbell feed, ambient info while watching TV." },
      { cat: "display", label: "Steam Deck dock (game streaming)", detail: "Docked Steam Deck streams the office gaming PC to the lounge TV/AVR. Wire the dock's Gigabit port to a lounge Cat6 drop (bypasses the Deck's Wi-Fi) and keep it on the same VLAN as the gaming PC. Drives the “lounge gaming” scene (AVR + TV input + lights + Wake-on-LAN of the PC)." },
      { cat: "heat", label: "Wet UFH zone", detail: "One of two UFH zones (lounge + dining). Shelly relay on manifold actuator + Aqara temp sensor + HA Generic Thermostat. Driven by mmWave presence + person preferences." },
      { cat: "camera", label: "Front camera (external)", detail: "Mounted high above bay — covers porch, bays, driveway." },
      { cat: "camera", label: "Driveway-side camera (external)", detail: "House-mounted on the driveway elevation, looking down the side passage toward the garage. The 4th confirmed PoE camera (there's no passage on the opposite side). Pairs with the above-garage camera for bidirectional driveway coverage." },
    ],
  },
  {
    id: "dining",
    name: "Dining Room",
    meta: "3.25 × 3.20m · rear-left, ground floor",
    floor: "ground",
    rect: { x: 2, y: 2, w: 42, h: 46 },
    items: [
      { cat: "lock", label: "Smart lock — French doors (N wall)", detail: "Aqara A100 Pro or Nuki 4 Pro smart Euro cylinder. Engages the existing multi-point mechanism on the French doors; door looks unchanged externally. Battery, Matter native." },
      { cat: "light", label: "Zigbee lighting", detail: "Single zone, pendant likely." },
      { cat: "blind", label: "Window blind", detail: "One motor — but with French doors here, also consider a thicker blackout blind or curtains for night privacy (back garden visibility into the room)." },
      { cat: "heat", label: "Wet UFH zone", detail: "Second of two UFH zones. Shelly relay + Aqara temp sensor. Can run different target temps to lounge." },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    meta: "3.24 × 2.52m · rear-middle, ground floor",
    floor: "ground",
    rect: { x: 45, y: 2, w: 25, h: 46 },
    items: [
      { cat: "voice", label: "Voice node (PHASE 1)", detail: "HA Voice PE — busiest room. Hands often full. One of two phase 1 nodes." },
      { cat: "speaker", label: "WiiM Mini + Edifier R1280T", detail: "Music endpoint, cooking music / podcasts." },
      { cat: "display", label: "Wall tablet — phase 2", detail: "Samsung Tab A8/A9 secondhand, flush-mount, USB through wall. Fully Kiosk Browser. Auto-popup to doorbell camera on ring." },
      { cat: "light", label: "Zigbee lighting", detail: "Under-cabinet, ceiling, possibly accent. Multi-zone." },
      { cat: "blind", label: "Window blind", detail: "Single motor." },
    ],
  },
  {
    id: "conservatory",
    name: "Conservatory",
    meta: "4.18 × 2.45m · rear-right, ground floor · east-facing · living space",
    floor: "ground",
    rect: { x: 71, y: 2, w: 27, h: 95 },
    items: [
      { cat: "voice", label: "Voice node", detail: "HA Voice PE — confirmed as living space, full kit. Wired Cat6." },
      { cat: "lock", label: "Smart lock — hinged door (S wall)", detail: "Aqara U100 Euro cylinder retrofit. Standard hinged door makes this straightforward. Battery, Matter native." },
      { cat: "speaker", label: "WiiM Mini + powered speaker", detail: "Music endpoint for the conservatory." },
      { cat: "blind", label: "Conservatory blinds", detail: "5-7 panels, biggest swing factor in budget. Thermal/pleated vs standard roller TBC. East-facing = morning sun glare priority." },
      { cat: "light", label: "Zigbee lighting", detail: "Likely single zone." },
      { cat: "camera", label: "Back garden camera (external)", detail: "High mount above conservatory, covering garden — sees both the conservatory door and the dining French doors from one position." },
      { cat: "heat", label: "Heating — TBD", detail: "Conservatory heating: UFH third zone, separate rad, or electric panel? Open question." },
    ],
  },
  {
    id: "hall",
    name: "Hall",
    meta: "Ground floor · stairs",
    floor: "ground",
    rect: { x: 45, y: 50, w: 25, h: 38 },
    items: [
      { cat: "net", label: "Deco 1 (root)", detail: "Mesh root, wired backhaul, at incoming internet connection." },
      { cat: "lock", label: "Front door lock", detail: "Yale Assure 2 or Aqara U100. Tier-2 (verbal confirm before lock/unlock)." },
      { cat: "display", label: "Wall tablet — phase 3", detail: "Away/home modes, doorbell feed, household status overview." },
      { cat: "light", label: "Lighting", detail: "Hall + stairs." },
    ],
  },
  {
    id: "porch",
    name: "Porch",
    meta: "Front entrance",
    floor: "ground",
    rect: { x: 45, y: 89, w: 25, h: 9 },
    items: [
      { cat: "camera", label: "PoE doorbell", detail: "Reolink PoE video doorbell. Cat6 run added to cabling scope." },
    ],
  },
  {
    id: "bed1",
    name: "Bedroom 1 (Master)",
    meta: "4.25 × 3.90m · front, first floor · bay window",
    floor: "first",
    rect: { x: 2, y: 50, w: 60, h: 48 },
    bay: true,
    items: [
      { cat: "voice", label: "Voice node (PHASE 1)", detail: "HA Voice PE — bedside placement. One of two phase 1 nodes." },
      { cat: "blind", label: "Bay window blinds", detail: "3 motors (narrow-wide-narrow). Privacy + light control." },
      { cat: "light", label: "Zigbee lighting", detail: "Main + bedside lamps. Scene for “goodnight” / “good morning”." },
      { cat: "heat", label: "TRV (Aqara E1)", detail: "Zigbee TRV on radiator. Per-person preferences (Cam vs Nova), sleep-mode drop, wake warm-up." },
      { cat: "display", label: "Wall tablet (optional) — phase 3", detail: "Wake-up dashboard, sleep mode. Optional." },
      { cat: "speaker", label: "WiiM Mini (optional)", detail: "For music. Could start with Voice PE built-in speaker." },
    ],
  },
  {
    id: "bed2",
    name: "Bedroom 2 (Office)",
    meta: "3.50 × 3.29m · rear, first floor · two desks side-by-side opposite window (Cam + Nova)",
    floor: "first",
    rect: { x: 2, y: 2, w: 50, h: 46 },
    items: [
      { cat: "voice", label: "Voice node", detail: "HA Voice PE — also functions as office voice for assistance during work." },
      { cat: "display", label: "PC integration (×2)", detail: "HASS.Agent on both Cam and Nova’s PCs, distinct MQTT topic prefixes so HA tracks them independently. Drives per-person routing (e.g. doorbell pops up on whoever’s active). Note: HASS.Agent can't go on the locked-down work laptop — its presence is inferred from Wi-Fi instead." },
      { cat: "display", label: "Dual monitors + KVM (34\" ultrawide)", detail: "Two monitors — one a 34\" 21:9 ultrawide (3440×1440, 144-165Hz) — shared between the work laptop and gaming PC via a dual-head DP 1.4 KVM. Buy-time check: confirm the work laptop can drive two external displays over USB-C without DisplayLink (locked-down = no driver install). Prefer an RS-232/TCP KVM so HA can switch the desk by voice and the 9am work scene auto-selects the laptop." },
      { cat: "mmwave", label: "Aqara FP2", detail: "Ceiling-mounted above the middle of the room (or wall-mounted on the window wall facing the desk wall). Two zones split left/right so each desk is its own zone — enables per-desk presence detection without needing voice ID." },
      { cat: "net", label: "Cat6 drops (4-6) on desk wall", detail: "Cabling spec amendment: bedroom 2 currently 2 drops, needs 4 minimum (2 per desk) — ideally 5-6 with spares. All on the wall opposite the window where both desks sit side-by-side." },
      { cat: "light", label: "Zigbee lighting", detail: "Task-friendly: cooler colour temp during working hours via Adaptive Lighting overrides. Stays cool past sunset while either PC is active." },
      { cat: "blind", label: "Motorised blind", detail: "Single motor on the window opposite the desks. Auto-tilt to reduce screen glare based on sun position." },
      { cat: "window", label: "Window actuator", detail: "Motorised opening for ventilation. Two people working all day = high CO2; automated opening when CO2 climbs above threshold." },
      { cat: "heat", label: "TRV (Aqara E1)", detail: "Zigbee TRV on radiator. Office mode bumps temp when either desk is occupied." },
      { cat: "light", label: "Focus accountability LED", detail: "Small desk LED/WLED for the “Focus mode / phone mindfulness” system: green while focused → amber → red as personal-phone screen-time climbs during work hours (fixed 9:00–17:30 weekdays, minus a declared lunch). Silent, glanceable — needs nothing on the locked-down work laptop." },
      { cat: "display", label: "NFC focus-dock", detail: "A tag on a phone stand: tap to start a Pomodoro focus sprint; phone goes face-down and lifting it early is the nudge. Pairs with auto-DND on the personal phone. The work laptop's presence on Wi-Fi is the (optional) no-install “awake/working” proxy." },
    ],
  },
  {
    id: "bed3",
    name: "Bedroom 3 (Box · HEAD-END)",
    meta: "2.36 × 1.86m · front-right, first floor",
    floor: "first",
    rect: { x: 64, y: 50, w: 34, h: 48 },
    items: [
      { cat: "net", label: "Head-end: patch panel, PoE switch, Unraid", detail: "All active kit lives here. Per cabling spec §4. Needs mains spur, ventilation, clear cable route from both floors and external/garage entries. Treat as comms room — no regular occupant." },
      { cat: "voice", label: "Voice node", detail: "HA Voice PE — covers the room and acts as backup voice coverage if anyone’s in there." },
      { cat: "light", label: "Lighting", detail: "Basic — utility/comms-room style. No task lighting needed." },
      { cat: "blind", label: "Window blind", detail: "Single motor." },
      { cat: "heat", label: "TRV (Aqara E1)", detail: "Zigbee TRV on radiator. Held at low temp by default (no occupant) unless equipment heat needs offsetting." },
    ],
  },
  {
    id: "wet",
    name: "Bathroom",
    meta: "2.26 × 1.48m · first floor · planned conversion from wet room",
    floor: "first",
    rect: { x: 54, y: 2, w: 44, h: 30 },
    items: [
      { cat: "display", label: "Smart mirror — phase 3", detail: "DIY: tablet behind two-way acrylic, runs MagicMirror² or HA dashboard. Easier in a standard bathroom than a wet room — no constant steam risk." },
      { cat: "light", label: "Bathroom lighting + Aqara FP1E", detail: "mmWave presence keeps lights on through shower — mounted on ceiling away from direct spray. Standard bathroom (not wet room) makes this straightforward." },
      { cat: "heat", label: "TRV (Aqara E1)", detail: "Zigbee TRV on towel rail / radiator. Pre-warm scene before shower time." },
    ],
  },
  {
    id: "landing",
    name: "Landing",
    meta: "First floor · stairs",
    floor: "first",
    rect: { x: 54, y: 34, w: 44, h: 14 },
    items: [
      { cat: "net", label: "Deco 2", detail: "First-floor mesh node, wired backhaul." },
      { cat: "light", label: "Landing lighting", detail: "Plus Zigbee scene buttons at top of stairs (goodnight / good morning)." },
      { cat: "heat", label: "TRV (Aqara E1)", detail: "Zigbee TRV on landing radiator." },
    ],
  },
  {
    id: "garage",
    name: "Garage",
    meta: "9.46 × 3.32m · detached · fibre link",
    floor: "detached",
    rect: { x: 2, y: 20, w: 96, h: 60 },
    items: [
      { cat: "voice", label: "Voice node", detail: "HA Voice PE — workshop. Check temperature spec for winter." },
      { cat: "net", label: "Deco 3 + fibre media converter", detail: "Inter-building fibre link from head-end. Avoids ground-potential-difference / surge risk per cabling spec §8." },
      { cat: "camera", label: "Exterior camera", detail: "Covers main garage door. Can share garage fibre conduit." },
      { cat: "light", label: "Garage lighting", detail: "Workshop lighting, motion-activated." },
      { cat: "speaker", label: "WiiM Mini + rugged speaker", detail: "Workshop tunes — also the bar's audio + DJ-Claude endpoint." },
      { cat: "light", label: "Bar — WLED + scenes", detail: "Addressable strip (ESP32) behind the bar for under-counter glow, bottle backlighting and team/holiday colours. Drives the “open the bar” / “last orders” / “closing time” scenes and goal-reactive flashes. See the Garage bar section." },
      { cat: "display", label: "Bar tablet — now playing / tabs / quiz", detail: "Bar dashboard: now playing, who's here, tabs, the cocktail menu, and the pub-quiz/darts scoreboard. NFC-jukebox tap target." },
      { cat: "heat", label: "Bar heater (pre-warm)", detail: "Smart heater so a planned bar night pre-warms the cold detached garage — “bar's warming, ready in 20”. Plus keg/bar-fridge temp control and a CO2 leak sensor if a keg CO2 cylinder is used (enclosed-space safety)." },
    ],
  },
];

export const ROOM_MAP: Record<string, Room> = Object.fromEntries(
  ROOMS.map((r) => [r.id, r]),
);
