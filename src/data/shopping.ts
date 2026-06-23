export interface ShopItem {
  id: string;
  name: string;
  meta?: string;
  cost: number; // numeric, for totals
  costLabel: string; // display
  /** Explicit buy link (specialist store / exact product). Wins over `search`. */
  url?: string;
  /** Curated Amazon UK search query. A link only shows if `url` or `search` is set
   *  — generic bundles, secondhand finds and free/config items get no link. */
  search?: string;
}
export interface ShopPhase {
  id: string;
  title: string;
  items: ShopItem[];
}

export const SHOPPING: ShopPhase[] = [
  {
    id: "0",
    title: "Phase 0 — Pre-move testbed",
    items: [
      { id: "bp0a", name: "HA Voice PE — testbed", meta: "Living room of current home. Travels to Woodhouse Phase 1.", cost: 55, costLabel: "~£55", url: "https://thepihut.com/search?q=home+assistant+voice+preview" },
      { id: "bp0b", name: "Sonoff ZBDongle-E", meta: "Start the Zigbee mesh now. Travels to Woodhouse Phase 1.", cost: 25, costLabel: "~£25", url: "https://thepihut.com/search?q=sonoff+zbdongle-e" },
      { id: "bp0c", name: "2× Innr Zigbee bulbs", meta: "For testbed. Migrate to Woodhouse with everything else.", cost: 30, costLabel: "~£30", search: "Innr smart bulb Zigbee E27" },
      { id: "bp0d", name: "Anthropic API credit", meta: "First month at testbed scale", cost: 10, costLabel: "~£5-10" },
      { id: "bp0f", name: "3D printer (Bambu Lab A1 Mini)", meta: "Prints the bespoke mounts + DIY-board enclosures across the build. Appliance-tier, near-zero tuning.", cost: 230, costLabel: "~£200-250", search: "Bambu Lab A1 Mini" },
      { id: "bp0g", name: "Filament — PETG + ASA", meta: "PETG for heat/radiator-adjacent parts; ASA for outdoor/sunny camera mounts (PLA sags). A few kg.", cost: 40, costLabel: "~£40", search: "PETG filament 1.75mm" },
      { id: "bp0e", name: "(optional) 2nd HA Voice PE", meta: "For multi-room handoff testing. Skip if budget tight.", cost: 55, costLabel: "~£55", url: "https://thepihut.com/search?q=home+assistant+voice+preview" },
    ],
  },
  {
    id: "1",
    title: "Phase 1 — Prove the pipeline (post-move)",
    items: [
      { id: "b0u", name: "UPS — head-end (1000-1500VA)", meta: "APC Back-UPS Pro, CyberPower CP1500, or Eaton 5E. Mandatory before Unraid first power-on.", cost: 175, costLabel: "~£150-200", search: "CyberPower CP1500EPFCLCD" },
      { id: "b1", name: "Zigbee coordinator", meta: "SkyConnect or Sonoff ZBDongle-E", cost: 20, costLabel: "~£20", url: "https://thepihut.com/search?q=sonoff+zbdongle-e" },
      { id: "b2", name: "HA Voice PE — Kitchen", meta: "Wi-Fi + USB-C (no Ethernet) — needs a nearby socket", cost: 55, costLabel: "~£55", url: "https://thepihut.com/search?q=home+assistant+voice+preview" },
      { id: "b3", name: "HA Voice PE — Master Bedroom", meta: "Wi-Fi + USB-C (no Ethernet) — needs a nearby socket", cost: 55, costLabel: "~£55", url: "https://thepihut.com/search?q=home+assistant+voice+preview" },
      { id: "b4", name: "Coral USB TPU (optional)", meta: "For Frigate AI inference — optional, OpenVINO/iGPU is the free fallback", cost: 60, costLabel: "~£60", url: "https://thepihut.com/search?q=coral+usb+accelerator" },
      { id: "b5", name: "Misc cables / patch leads / power", meta: "USB-C, Cat6 patches, plug-tops", cost: 30, costLabel: "~£30" },
    ],
  },
  {
    id: "2",
    title: "Phase 2 — Security, entry & safety",
    items: [
      { id: "b8", name: "16-port PoE+ switch", meta: "Unifi USW-Lite-16-PoE or TP-Link TL-SG1218MP", cost: 200, costLabel: "~£200", search: "TP-Link TL-SG1218MP" },
      { id: "b8a", name: "Dedicated CCTV HDD (4-8TB)", meta: "For the 30-day event archive — the *arr apps keep the array tight. 1TB NVMe cache already owned; dedicate this disk to Frigate (unprotected pool, or array + pinned share).", cost: 120, costLabel: "~£90-160", search: "WD Red Plus 8TB" },
      { id: "b9", name: "PoE camera — Front", meta: "Reolink RLC-810A or 811A", cost: 90, costLabel: "~£90", search: "Reolink RLC-810A" },
      { id: "b10", name: "PoE camera — Rear (above conservatory)", meta: "Reolink RLC-810A or 811A", cost: 90, costLabel: "~£90", search: "Reolink RLC-810A" },
      { id: "b11", name: "PoE video doorbell", meta: "Reolink — front porch", cost: 110, costLabel: "~£110", search: "Reolink PoE video doorbell" },
      { id: "b12", name: "Smart lock — Front door", meta: "Yale Assure 2 SL Touchscreen. Matter native, face-rec auto-unlock.", cost: 250, costLabel: "~£250", search: "Yale Assure 2 smart lock" },
      { id: "b12a", name: "Smart lock — Conservatory door", meta: "Aqara U100. Euro cylinder retrofit for hinged door.", cost: 170, costLabel: "~£170", search: "Aqara U100 smart lock" },
      { id: "b12b", name: "Smart lock — Dining French doors", meta: "Aqara A100 Pro or Nuki 4 Pro — smart Euro cylinder for multi-point door.", cost: 220, costLabel: "~£180-260", search: "Nuki 4 Pro smart lock" },
      { id: "b29h", name: "Frigate face recognition training", meta: "Photos of each person, ~30 min setup", cost: 0, costLabel: "free" },
      { id: "b16s1", name: "Zigbee smoke + CO alarms (×3)", meta: "Life safety — Frient/Heiman, still function as standalone alarms", cost: 120, costLabel: "~£120", search: "Frient smoke detector Zigbee" },
      { id: "b16s2", name: "Zigbee water-leak sensors (×4)", meta: "UFH manifold, boiler, under sinks, behind washer/dishwasher", cost: 60, costLabel: "~£60", search: "Aqara water leak sensor" },
      { id: "b16s3", name: "Motorised stopcock / mains water valve", meta: "Auto-shut on confirmed leak — highest-ROI safety device", cost: 90, costLabel: "~£90", search: "smart water shut off valve" },
    ],
  },
  {
    id: "3",
    title: "Phase 3 — Living-space coverage & comfort",
    items: [
      { id: "b6", name: "HA Voice PE — Lounge", cost: 55, costLabel: "~£55", url: "https://thepihut.com/search?q=home+assistant+voice+preview" },
      { id: "b7", name: "HA Voice PE — Garage", cost: 55, costLabel: "~£55", url: "https://thepihut.com/search?q=home+assistant+voice+preview" },
      { id: "b13", name: "Lounge Zigbee bulbs / relays", meta: "Migrate from Govee testing", cost: 200, costLabel: "~£200" },
      { id: "b14", name: "AVR (FB Marketplace)", meta: "Denon X3700H or Marantz SR6014 — secondhand", cost: 350, costLabel: "~£350" },
      { id: "b15", name: "Lounge speakers — Front L/R + centre", meta: "Q Acoustics / Monitor Audio / KEF, secondhand", cost: 350, costLabel: "~£350" },
      { id: "b16", name: "Subwoofer (used)", meta: "BK Electronics / SVS / REL — secondhand", cost: 150, costLabel: "~£150" },
      { id: "b15a", name: "Lounge TV — TCL 65C6KS-UK (65\" QD-Mini LED, 2025)", meta: "Chosen set. Mini-LED suits the bright south-facing lounge; Dolby Vision/Atmos, AirPlay 2, Google TV → HA. Entry-tier (likely 60Hz — fine for film + Steam Deck streaming). Confirm eARC + refresh rate.", cost: 529, costLabel: "~£529", search: "TCL 65C6KS" },
      { id: "b16a", name: "Wall tablet — Kitchen", meta: "Samsung Tab A8/A9 — secondhand", cost: 80, costLabel: "~£80" },
      { id: "b16b", name: "Kitchen tablet mount + USB outlet", cost: 35, costLabel: "~£35" },
      { id: "b16c", name: "Fully Kiosk Browser license", meta: "One-off, covers all tablets", cost: 6, costLabel: "~£6", url: "https://www.fully-kiosk.com/" },
      { id: "b16d", name: "Aqara FP2 — Lounge", meta: "mmWave presence, multi-zone. HomeKit Controller integration.", cost: 65, costLabel: "~£65", search: "Aqara FP2 presence sensor" },
      { id: "b16e", name: "OpenTherm Gateway", meta: "Between boiler & master stat — modulating boiler control via HA", cost: 80, costLabel: "~£80", search: "OpenTherm Gateway" },
      { id: "b16f", name: "5× Aqara E1 Zigbee TRVs", meta: "Master, bed 2, bed 3, landing, bathroom", cost: 200, costLabel: "~£200", search: "Aqara E1 radiator thermostat" },
    ],
  },
  {
    id: "4",
    title: "Phase 4 — Whole-house coverage",
    items: [
      { id: "b17", name: "HA Voice PE — Bedroom 2", cost: 55, costLabel: "~£55", url: "https://thepihut.com/search?q=home+assistant+voice+preview" },
      { id: "b18", name: "HA Voice PE — Bedroom 3", cost: 55, costLabel: "~£55", url: "https://thepihut.com/search?q=home+assistant+voice+preview" },
      { id: "b18a", name: "HA Voice PE — Conservatory", cost: 55, costLabel: "~£55", url: "https://thepihut.com/search?q=home+assistant+voice+preview" },
      { id: "b20", name: "PoE camera — Side of house", meta: "Reolink RLC-810A or 811A", cost: 90, costLabel: "~£90", search: "Reolink RLC-810A" },
      { id: "b25", name: "Remaining Zigbee lighting", meta: "Bulbs + relays for rest of house", cost: 300, costLabel: "~£300" },
      { id: "b26", name: "Zigbee scene buttons (Aqara × 4)", meta: "Top of stairs, bedside, bottom of stairs", cost: 60, costLabel: "~£60", search: "Aqara wireless switch" },
      { id: "b27", name: "WiiM Mini × 6 (other rooms)", meta: "Kitchen, conservatory, bed 1, garage + spares", cost: 540, costLabel: "~£540", search: "WiiM Mini" },
      { id: "b28", name: "Powered speakers for non-lounge rooms", meta: "e.g. Edifier R1280T", cost: 425, costLabel: "~£425", search: "Edifier R1280T" },
      { id: "b29", name: "Motion / contact / presence sensors", cost: 200, costLabel: "~£200" },
      { id: "b29a1", name: "Wall tablet — Lounge", meta: "AV control, scene selection, doorbell feed — secondhand", cost: 80, costLabel: "~£80" },
      { id: "b29a", name: "Wall tablet — Hall", meta: "Samsung Tab A8/A9 — secondhand", cost: 80, costLabel: "~£80" },
      { id: "b29b", name: "Wall tablet — Master bedroom", meta: "Samsung Tab A-series — secondhand", cost: 80, costLabel: "~£80" },
      { id: "b29c", name: "Additional tablet mounts + USB outlets (3 sets)", cost: 105, costLabel: "~£105" },
      { id: "b29i", name: "Aqara FP2 — Master bedroom", meta: "In-bed vs dressing zones", cost: 65, costLabel: "~£65", search: "Aqara FP2 presence sensor" },
      { id: "b29i1", name: "Aqara FP1E — Bathroom", meta: "Lights stay on through shower", cost: 40, costLabel: "~£40", search: "Aqara FP1E presence sensor" },
      { id: "b29j", name: "Aqara FP1E — Office (Bed 3, optional)", cost: 40, costLabel: "~£40", search: "Aqara FP1E presence sensor" },
    ],
  },
  {
    id: "5",
    title: "Phase 5 — Automation brain, comfort & resilience",
    items: [
      { id: "b22", name: "Motorised blinds — bedrooms (baseline)", meta: "The funded scope: master bay (3 motors) + bed 2 + bed 3 ≈ 5 motors — quote/bespoke", cost: 700, costLabel: "~£700" },
      { id: "b22a", name: "Lounge bay blinds (bonus)", meta: "South-facing bay, 3 motors — pairs with the cinema scene. Bonus tier, not in the committed total.", cost: 0, costLabel: "bonus ~£450" },
      { id: "b23", name: "Conservatory blinds (bonus)", meta: "Style + count TBC (thermal/pleated vs roller). Bonus tier, not in the committed total.", cost: 0, costLabel: "bonus ~£600" },
      { id: "b24", name: "Other room blinds (bonus)", meta: "Dining + kitchen. Bonus tier, not in the committed total.", cost: 0, costLabel: "bonus ~£450" },
      { id: "b29g", name: "Proactive Claude service (custom Python)", meta: "~200 lines, FastAPI + HA webhook listener", cost: 0, costLabel: "code only" },
      { id: "b29l", name: "HASS.Agent install on PC", meta: "Windows tray app, exposes PC sensors to HA via MQTT", cost: 0, costLabel: "free" },
      { id: "b29m", name: "Pinned browser dashboard config", meta: "Lovelace dashboard, pinned in corner of PC screen", cost: 0, costLabel: "free" },
      { id: "b29n", name: "Custom Tauri desktop overlay app (optional)", meta: "~1-2 weekends dev. Doorbell pop-up, urgent Claude messages.", cost: 0, costLabel: "code only" },
      { id: "b29x", name: "34\" ultrawide monitor (3440×1440, 144Hz)", meta: "Office second screen. USB-C input + built-in KVM is a bonus. LG 34GP/34GS, Dell, Gigabyte M34WQ, MSI.", cost: 450, costLabel: "~£350-550", search: "34 inch ultrawide monitor 3440x1440 144Hz" },
      { id: "b29y", name: "Basic dual-head KVM (DP 1.4 + USB-C)", meta: "Manual switch between work laptop & gaming PC (no HA control — chosen). DP1.4 for 3440×1440@144Hz; USB-C input avoids DisplayLink. Confirm the laptop can drive 2 displays natively first.", cost: 180, costLabel: "~£120-250", search: "dual monitor KVM switch DisplayPort 1.4" },
      { id: "b29z", name: "Steam Deck dock — JSAUX (owned)", meta: "Already owned — has Ethernet. Wire it to a lounge Cat6 drop, same VLAN as the gaming PC.", cost: 0, costLabel: "owned" },
      { id: "b29z1", name: "Sunshine + Moonlight (game streaming)", meta: "Host on the gaming PC + client on the Steam Deck. Free, open-source.", cost: 0, costLabel: "free" },
      { id: "b29w", name: "Focus mode — NFC tag + desk LED", meta: "Phone-mindfulness: NFC focus-dock + green→red accountability LED. Fixed 9–5:30 schedule, no work-laptop software needed.", cost: 15, costLabel: "~£12-17", search: "NFC tags NTAG215" },
      { id: "b29f", name: "Shelly EM + CT clamps (consumer unit)", meta: "Sparky install recommended", cost: 120, costLabel: "~£120", search: "Shelly EM" },
      { id: "b29o", name: "2× Shelly relays — UFH actuators", meta: "Lounge + dining zone control", cost: 40, costLabel: "~£40", search: "Shelly Plus 1" },
      { id: "b29p", name: "2× Aqara temp sensors — UFH rooms", cost: 30, costLabel: "~£30", search: "Aqara temperature humidity sensor" },
      { id: "b29q", name: "CO2/VOC sensors (5× IKEA Vindstyrka)", meta: "Lounge, bedrooms, kitchen, conservatory", cost: 200, costLabel: "~£200", url: "https://www.ikea.com/gb/en/search/?q=vindstyrka" },
      { id: "b29d", name: "Smart mirror DIY (bathroom)", meta: "Tablet + two-way acrylic + frame — DIY build", cost: 150, costLabel: "~£150" },
      { id: "b29e", name: "Aqara wireless button — by smart mirror", cost: 15, costLabel: "~£15", search: "Aqara wireless switch" },
      { id: "b29r1", name: "Second UPS — network gear", meta: "Keeps UCG-Max + core switch (SD-WAN/Tailscale) up during a server shutdown", cost: 90, costLabel: "~£90", search: "APC Back-UPS 650VA" },
      { id: "b29r2", name: "Off-site encrypted backup to Selby", meta: "restic/borg — HA snapshots + Immich photo library + memory, client-side encrypted over the SD-WAN. Config only.", cost: 0, costLabel: "code only" },
      { id: "b29r3", name: "Dead-man's-switch heartbeat (Healthchecks.io)", meta: "HA pings out every minute; external service alerts you if pings stop (catches array/power/HA-down). Free tier.", cost: 0, costLabel: "free", url: "https://healthchecks.io/" },
      { id: "b29r4", name: "Uptime Kuma at Selby (off-site probe)", meta: "Runs on dad's box over the SD-WAN, probing Woodhouse HA/Unraid/gateway — survives a total Woodhouse outage. Mutual.", cost: 0, costLabel: "free" },
      { id: "b29r", name: "Driveway beam sensor", meta: "Aqara T1 outdoor or wired IR beam", cost: 40, costLabel: "~£40", search: "driveway alarm beam sensor" },
      { id: "b29s", name: "ALPR — CodeProject.AI (Docker on Unraid)", meta: "License plate recognition, free", cost: 0, costLabel: "free" },
      { id: "b29t", name: "Adaptive Lighting (HACS)", meta: "Circadian lighting integration, free", cost: 0, costLabel: "free" },
      { id: "b29u", name: "Google Calendar integration", meta: "Calendar-driven anticipation", cost: 0, costLabel: "free" },
      { id: "b29v", name: "Energy dashboards setup", meta: "Octopus Agile + National Grid carbon intensity", cost: 0, costLabel: "free" },
    ],
  },
  {
    id: "6",
    title: "Phase 6 — Extras & signature behaviours",
    items: [
      { id: "b30", name: "Meross Matter plugs", meta: "Already owned — deploy as needed (lamp ✓, washer, immersion, bedroom)", cost: 0, costLabel: "owned" },
      { id: "b31", name: "Additional Meross Matter plugs (4-pack)", meta: "Kettle, coffee, TV stack, more lamps", cost: 40, costLabel: "~£40", search: "Meross Matter smart plug 4 pack" },
      { id: "b31a", name: "Safety smart plugs — straighteners, iron, etc.", meta: "Aqara Zigbee or more Meross, ~3-4 units", cost: 60, costLabel: "~£60", search: "Aqara smart plug" },
      { id: "b40", name: "Grocy install (Docker on Unraid)", meta: "Fridge inventory + meal planning", cost: 0, costLabel: "free" },
      { id: "b41", name: "USB barcode scanner (optional)", meta: "For Grocy — by the fridge", cost: 15, costLabel: "~£15", search: "USB barcode scanner" },
      { id: "b42", name: "Receipt OCR shortcut (phone)", meta: "Photo → HA → Claude vision → Grocy", cost: 0, costLabel: "free" },
      { id: "b43", name: "Cooking mode automation", meta: "Voice trigger + lighting + recipe + timers", cost: 0, costLabel: "free" },
      { id: "b44", name: "Delivery handling automations", meta: "Frigate + Claude doorbell speaker", cost: 0, costLabel: "free" },
      { id: "b45", name: "Guest mode automation", cost: 0, costLabel: "free" },
      { id: "b46", name: "Smart laundry workflow", meta: "Builds on smart plugs + proactive Claude", cost: 0, costLabel: "free" },
      { id: "b47", name: "Photo digest automation", meta: "Daily/weekly highlights from Frigate", cost: 0, costLabel: "free" },
      { id: "b48", name: "10× Xiaomi Mi Flora plant sensors", meta: "Soil moisture, light, temp, EC", cost: 180, costLabel: "~£180", search: "Xiaomi Mi Flora plant sensor" },
      { id: "b49", name: "Bluetooth Proxy ESP32", meta: "Reads BT plant sensors", cost: 20, costLabel: "~£20", search: "ESP32 development board" },
      { id: "b32", name: "Garden / outbuilding sensors", cost: 100, costLabel: "~£100" },
      { id: "b34", name: "Garage door relay automation", meta: "If car-in-garage commitment made. Shelly wired across door opener input.", cost: 30, costLabel: "~£30", search: "Shelly Plus 1" },
      { id: "bar1", name: "Garage bar — WLED kit (ESP32 + strip)", meta: "Back-bar lighting + scenes + goal-reactive flashes", cost: 25, costLabel: "~£25", search: "WS2812B addressable LED strip ESP32" },
      { id: "bar2", name: "NFC jukebox tags (pack)", meta: "Coaster/token song requests — tap to queue", cost: 5, costLabel: "~£5", search: "NFC tags NTAG215" },
      { id: "bar3", name: "Keg flow meter + ESP32", meta: "Pours, keg % remaining, per-person leaderboard", cost: 25, costLabel: "~£25", search: "beer flow meter sensor" },
      { id: "bar4", name: "Load cells + HX711 (bottle inventory)", meta: "Weigh spirit bottles — know when the gin's low", cost: 30, costLabel: "~£20-40", search: "load cell HX711 kit" },
      { id: "bar5", name: "Bar-fridge temp controller + contact sensor", meta: "Inkbird/Shelly + door-left-open alert", cost: 30, costLabel: "~£30", search: "Inkbird temperature controller" },
      { id: "bar6", name: "CO2 leak sensor (if keg CO2 cylinder)", meta: "Enclosed-garage safety — not optional with a CO2 keg", cost: 35, costLabel: "~£35", search: "CO2 monitor alarm" },
    ],
  },
  {
    id: "7",
    title: "Phase 7 — Optional / when-installed",
    items: [
      { id: "b50", name: "OpenSprinkler (outdoor irrigation)", meta: "Only if irrigation installed", cost: 150, costLabel: "~£150", search: "OpenSprinkler" },
      { id: "b51", name: "Garden moisture sensors (4-5 beds)", meta: "Aqara T1 outdoor or Ecowitt", cost: 80, costLabel: "~£80", search: "Ecowitt soil moisture sensor" },
      { id: "b52", name: "Airthings View Plus (master bedroom)", meta: "Proper CO2 + radon + PM2.5 — optional premium", cost: 250, costLabel: "~£250", search: "Airthings View Plus" },
    ],
  },
];
