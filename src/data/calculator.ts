// Cost calculator model — groups → fields → options, plus presets.
export interface CalcOption {
  value: number;
  label: string;
}
export interface CalcField {
  key: string;
  label: string;
  sub?: string;
  options: CalcOption[];
}
export interface CalcGroup {
  key: string;
  title: string;
  /** Fields contributing to this group's subtotal. Empty = fixed. */
  fields: CalcField[];
  /** Fixed amount (only the base group uses this). */
  fixed?: number;
  fixedNote?: string;
}

export const CALC_GROUPS: CalcGroup[] = [
  {
    key: "base",
    title: "Phase 1 base",
    fixed: 220,
    fixedNote: "Zigbee dongle, 2× Voice PE, Coral TPU, cables",
    fields: [],
  },
  {
    key: "audio",
    title: "Audio & AVR",
    fields: [
      {
        key: "avr",
        label: "AVR (secondhand)",
        options: [
          { value: 0, label: "None — skip" },
          { value: 275, label: "Budget Denon X3500H (~£275)" },
          { value: 350, label: "Mid X3600H/X3700H (~£350)" },
          { value: 475, label: "Premium Marantz (~£475)" },
        ],
      },
      {
        key: "speakers",
        label: "Lounge speakers",
        sub: "Front L/R + centre. Eltax as rears (free)",
        options: [
          { value: 0, label: "None — skip" },
          { value: 200, label: "Bargain (~£200)" },
          { value: 350, label: "Mid secondhand (~£350)" },
          { value: 600, label: "New mid-range (~£600)" },
        ],
      },
      {
        key: "atmos",
        label: "Atmos heights",
        options: [
          { value: 0, label: "Skip for now" },
          { value: 40, label: "Cable provision only (£40)" },
          { value: 250, label: "Budget upfiring (~£250)" },
          { value: 500, label: "In-ceiling + backing boxes (~£500)" },
        ],
      },
      {
        key: "sub",
        label: "Subwoofer (used)",
        options: [
          { value: 0, label: "None" },
          { value: 100, label: "Budget (~£100)" },
          { value: 150, label: "Mid (~£150)" },
          { value: 220, label: "Better (~£220)" },
        ],
      },
      {
        key: "wiim",
        label: "WiiM Mini count",
        options: [
          { value: 270, label: "3 units (£270)" },
          { value: 360, label: "4 units (£360)" },
          { value: 450, label: "5 units (£450)" },
          { value: 540, label: "6 units (£540) — incl. conservatory" },
        ],
      },
      {
        key: "powered",
        label: "Powered speakers (other rooms)",
        options: [
          { value: 200, label: "Budget (~£200)" },
          { value: 425, label: "Mid w/ conservatory (~£425)" },
          { value: 600, label: "Better (~£600)" },
        ],
      },
      {
        key: "audio-misc",
        label: "Cables, mounts, wall plates",
        options: [
          { value: 80, label: "Basic (£80)" },
          { value: 120, label: "Sensible (£120)" },
          { value: 150, label: "Generous (£150)" },
        ],
      },
    ],
  },
  {
    key: "cctv",
    title: "CCTV & network",
    fields: [
      {
        key: "poe",
        label: "PoE switch",
        options: [
          { value: 100, label: "8-port (~£100)" },
          { value: 200, label: "16-port (~£200)" },
          { value: 300, label: "24-port (~£300)" },
        ],
      },
      {
        key: "cam-count",
        label: "Camera count",
        options: [
          { value: 3, label: "3 cameras (confirmed)" },
          { value: 4, label: "4 cameras" },
          { value: 5, label: "5 cameras" },
          { value: 6, label: "6 cameras" },
        ],
      },
      {
        key: "cam-tier",
        label: "Camera tier (each)",
        options: [
          { value: 70, label: "Budget Reolink (£70)" },
          { value: 90, label: "4K Reolink (£90)" },
          { value: 130, label: "Amcrest/Dahua (£130)" },
          { value: 200, label: "Unifi Protect (£200)" },
        ],
      },
      {
        key: "doorbell",
        label: "Doorbell",
        options: [
          { value: 0, label: "Skip" },
          { value: 110, label: "Reolink PoE doorbell (£110)" },
        ],
      },
      {
        key: "cctv-misc",
        label: "Storage & accessories",
        options: [
          { value: 40, label: "Mounts only (£40)" },
          { value: 80, label: "Mounts + glands (£80)" },
          { value: 200, label: "+ Extra HDD (£200)" },
        ],
      },
    ],
  },
  {
    key: "light",
    title: "Lighting",
    fields: [
      {
        key: "light",
        label: "Zigbee lighting strategy",
        sub: "~13 zones total",
        options: [
          { value: 300, label: "Minimal (mains rooms only, ~£300)" },
          { value: 500, label: "Moderate (most rooms, ~£500)" },
          { value: 700, label: "Extensive (every zone, ~£700)" },
        ],
      },
    ],
  },
  {
    key: "locks",
    title: "Locks",
    fields: [
      {
        key: "locks",
        label: "Smart locks",
        options: [
          { value: 0, label: "None" },
          { value: 250, label: "Front door only — Yale Assure 2 (~£250)" },
          { value: 420, label: "2 doors — front + back (~£420)" },
          { value: 590, label: "3 doors — front + conservatory + dining (~£590)" },
          { value: 680, label: "3 doors — premium (~£680)" },
        ],
      },
    ],
  },
  {
    key: "blinds",
    title: "Blinds",
    fields: [
      {
        key: "blinds",
        label: "Motorisation scope",
        sub: "Baseline is bedrooms only; the rest is bonus",
        options: [
          { value: 0, label: "Skip — manual blinds" },
          { value: 700, label: "Bedrooms only (master bay + bed 2/3) — baseline" },
          { value: 1600, label: "Bedrooms + lounge bay" },
          { value: 2200, label: "Bedrooms + lounge bay + conservatory" },
          { value: 2800, label: "Whole house — standard rollers" },
          { value: 3400, label: "Whole house — incl. thermal conservatory" },
        ],
      },
    ],
  },
  {
    key: "voice",
    title: "Voice nodes (extra beyond phase 1)",
    fields: [
      {
        key: "voice",
        label: "Additional Voice PE units",
        sub: "2 already in phase 1",
        options: [
          { value: 0, label: "None extra" },
          { value: 220, label: "+4 (= 6 total)" },
          { value: 275, label: "+5 (= 7 total: lounge, bed 2/3, garage, conservatory)" },
          { value: 385, label: "+7 (= 9 total, with spares)" },
        ],
      },
      {
        key: "buttons",
        label: "Zigbee buttons (scene control)",
        options: [
          { value: 0, label: "None" },
          { value: 60, label: "4× Aqara buttons (£60)" },
          { value: 120, label: "8× buttons (£120)" },
        ],
      },
      {
        key: "sensors",
        label: "Sensors & misc Zigbee",
        options: [
          { value: 100, label: "Minimal (£100)" },
          { value: 200, label: "Sensible (£200)" },
          { value: 300, label: "Generous (£300)" },
        ],
      },
    ],
  },
  {
    key: "stark",
    title: "Displays & Stark extras",
    fields: [
      {
        key: "tablets",
        label: "Wall tablets",
        sub: "Samsung Tab A-series, secondhand",
        options: [
          { value: 0, label: "None" },
          { value: 80, label: "1× kitchen only (~£80)" },
          { value: 180, label: "2× kitchen + hall (~£180)" },
          { value: 240, label: "3× kitchen + lounge + hall (~£240)" },
          { value: 320, label: "4× kitchen + lounge + hall + master (~£320)" },
        ],
      },
      {
        key: "tablet-mounts",
        label: "Tablet mounts + USB outlets",
        options: [
          { value: 0, label: "Skip (skin mount)" },
          { value: 70, label: "2× sets (~£70)" },
          { value: 105, label: "3× sets (~£105)" },
          { value: 140, label: "4× sets, USB-in-wall (~£140)" },
        ],
      },
      {
        key: "mirror",
        label: "Smart mirror (bathroom)",
        options: [
          { value: 0, label: "Skip" },
          { value: 150, label: "DIY budget (~£150)" },
          { value: 200, label: "DIY nicer frame (~£200)" },
        ],
      },
      {
        key: "mmwave",
        label: "Aqara mmWave presence",
        options: [
          { value: 0, label: "None" },
          { value: 65, label: "1× FP2 lounge only (~£65)" },
          { value: 145, label: "2× FP2 lounge + master (~£145)" },
          { value: 185, label: "+ FP1E bathroom (~£185)" },
          { value: 250, label: "+ FP2 office (Bed 2, two-desk, ~£250)" },
        ],
      },
      {
        key: "energy",
        label: "Shelly EM energy monitoring",
        options: [
          { value: 0, label: "Skip" },
          { value: 80, label: "Basic (~£80)" },
          { value: 120, label: "With clamps + install kit (~£120)" },
        ],
      },
      {
        key: "garage",
        label: "Garage door automation",
        options: [
          { value: 0, label: "Skip (defer)" },
          { value: 30, label: "Shelly relay (~£30)" },
        ],
      },
    ],
  },
  {
    key: "windows",
    title: "Optional: Window motors",
    fields: [
      {
        key: "windows",
        label: "Motorised window scope",
        sub: "Requires cable runs in scope NOW",
        options: [
          { value: 0, label: "None" },
          { value: 200, label: "Bathroom only (~£200)" },
          { value: 900, label: "3-4 windows (~£900)" },
          { value: 1800, label: "All non-conservatory, battery actuators (~£1,800)" },
          { value: 2800, label: "All non-conservatory, mains actuators (~£2,800)" },
          { value: 3600, label: "All non-conservatory, mains + extras (~£3,600)" },
        ],
      },
    ],
  },
  {
    key: "cooling",
    title: "Optional: Cooling / AC",
    fields: [
      {
        key: "cooling",
        label: "AC infrastructure + units",
        sub: "Rough-in cheap during rewire; units deferrable",
        options: [
          { value: 0, label: "None" },
          { value: 300, label: "Rough-in only (4 positions, ~£300)" },
          { value: 1200, label: "Rough-in + master single-split (~£1,200)" },
          { value: 2500, label: "Rough-in + 2× single-splits (~£2,500)" },
          { value: 4500, label: "Rough-in + 3-head Daikin Comfora (~£4,500)" },
          { value: 6500, label: "Rough-in + 4-head Daikin Stylish (~£6,500)" },
        ],
      },
    ],
  },
];

export type CalcState = Record<string, number>;

export const PRESETS: Record<string, CalcState> = {
  minimal: {
    avr: 275, speakers: 200, atmos: 0, sub: 100, wiim: 270, powered: 200, "audio-misc": 80,
    poe: 100, "cam-count": 4, "cam-tier": 70, doorbell: 110, "cctv-misc": 40,
    light: 300, locks: 250, blinds: 700,
    voice: 220, buttons: 0, sensors: 100,
    tablets: 80, "tablet-mounts": 70, mirror: 0, mmwave: 65, energy: 0, garage: 0,
    windows: 200, cooling: 0,
  },
  balanced: {
    avr: 350, speakers: 350, atmos: 0, sub: 150, wiim: 540, powered: 425, "audio-misc": 120,
    poe: 200, "cam-count": 4, "cam-tier": 90, doorbell: 110, "cctv-misc": 80,
    light: 500, locks: 590, blinds: 700,
    voice: 275, buttons: 60, sensors: 200,
    tablets: 320, "tablet-mounts": 140, mirror: 150, mmwave: 250, energy: 120, garage: 0,
    windows: 1800, cooling: 300,
  },
  generous: {
    avr: 475, speakers: 600, atmos: 500, sub: 220, wiim: 540, powered: 600, "audio-misc": 150,
    poe: 300, "cam-count": 4, "cam-tier": 130, doorbell: 110, "cctv-misc": 200,
    light: 700, locks: 680, blinds: 3400,
    voice: 275, buttons: 120, sensors: 300,
    tablets: 320, "tablet-mounts": 160, mirror: 200, mmwave: 250, energy: 120, garage: 30,
    windows: 2800, cooling: 4500,
  },
};

export const PRESET_LABELS = [
  { key: "minimal", label: "Minimal" },
  { key: "balanced", label: "Balanced" },
  { key: "generous", label: "Generous" },
];

/** Compute per-group subtotals + grand total from a flat state. */
export function computeTotals(state: CalcState) {
  const v = (k: string) => state[k] || 0;
  const groups: Record<string, number> = {
    base: 220,
    audio: v("avr") + v("speakers") + v("atmos") + v("sub") + v("wiim") + v("powered") + v("audio-misc"),
    cctv: v("poe") + v("cam-count") * v("cam-tier") + v("doorbell") + v("cctv-misc"),
    light: v("light"),
    locks: v("locks"),
    blinds: v("blinds"),
    voice: v("voice") + v("buttons") + v("sensors"),
    stark: v("tablets") + v("tablet-mounts") + v("mirror") + v("mmwave") + v("energy") + v("garage"),
    windows: v("windows"),
    cooling: v("cooling"),
  };
  const grand = Object.values(groups).reduce((a, b) => a + b, 0);
  return { groups, grand };
}
