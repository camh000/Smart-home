# Smart Home Project — Working Plan

A bespoke, self-hosted replacement for Alexa, covering voice control, lighting, locks, blinds, and CCTV across the new house.

## Goals

- Replace Alexa entirely with a self-built voice assistant
- Control all lights, both external doors (locks), and blinds by voice
- Whole-house CCTV with local recording
- Video doorbell, local-only
- Voice control in all main rooms: lounge, kitchen, both downstairs… (see Voice Coverage below)
- Everything local-first where possible; cloud only where unavoidable

## Start now for £0

Roughly the entire *software* brain plus every device already owned can go in today, before spending another penny or moving house. The stuff that needs money is almost all physical sensors/actuators not yet owned.

**The brain — free Docker/VM on the existing Unraid:**

- **Home Assistant** itself — the foundation.
- **Full RAG memory layer** (the phase-1 "jump path"): **Qdrant** + **Ollama** (bge-small / nomic-embed) + the custom Python wrapper. Pure software, no hardware.
- **Frigate** — install/configure now (CPU/OpenVINO detection, no Coral needed; test with a phone-as-IP-camera) so it's ready when cameras arrive.
- **Grocy** — stand it up and start populating inventory.
- **Mosquitto MQTT** broker.
- **Unraid health monitoring** — **Glances + Scrutiny → HA**, immediately useful on the current box (SMART, capacity, temps, containers).

**Owned devices, integrated today:**

- **4× Govee bulbs** → HA → scenes (cosy/movie/reading) + **Adaptive Lighting** circadian.
- **4× Meross Matter plugs** → HA via Matter → control + **energy monitoring** + "washing's done" cycle detection + safety auto-off.
- **Apple TV** → media-player entity, auto-dim on play/pause, "what's playing".
- **Phones** → HA Companion → **Tier-1 presence** + push notifications.
- **Cam + Nova's PCs** → **HASS.Agent** → ~30 activity/presence sensors each + a pinned dashboard.

**Voice pipeline — prototype with no hardware:**

- **openWakeWord + Whisper + Piper** run locally on Unraid (free).
- Use the **HA Companion app's Assist on a phone** as the satellite to prove the full *wake → STT → reasoning → tool-call → TTS* loop and the memory retrieval — no Voice PE needed yet (and remember the Voice PE is Wi-Fi-only anyway).

**Network — when the UCG-Max lands (it's a gift, £0):** set it as root, Decos as APs, the 2× TP-Link switches as VLAN access switches, define the VLAN scheme, and bring up **Site Magic SD-WAN to Selby** with the off-site backups below.

**The one caveat:** using **Claude** as the brain is pay-per-use (fractions of a penny per request). For a *strict* £0 prototype, use HA's built-in **local conversation agent** first, then swap Claude in once a few pennies are acceptable.

**First things that actually cost money:** a **Zigbee coordinator dongle (~£20)** — the single gate that unlocks all Zigbee kit — then a **Voice PE (~£55)** for hands-free room voice.

## Foundation: structured cabling

The whole-house Cat6 install is being procured separately under the **Woodhouse Road Cabling Specification (May 2026)**. That spec is the physical backbone everything in this plan plugs into. Key points relevant here:

- **Cat6 throughout**, star topology, all runs return to a single head-end
- **Head-end: Bedroom 3** (the box room) — patch panel + active kit lives here
- **Drops already in spec:** lounge (4), dining (2), kitchen (2), conservatory (1), hall (1, Deco root), bed 1 (2), bed 2 (2), landing (1, Deco 2), external eave (1, future)
- **AV/HDMI-over-Cat6 runs:** lounge, dining, bed 1, bed 2
- **Garage:** fibre inter-building link, Deco 3 at far end
- **Patch panels:** client-supplied (reclaimed enterprise panels)
- **Active equipment:** all client-supplied (Unraid, switches, cameras, voice nodes — everything in this plan)

**Implication for this plan:** every voice node room has at least one Cat6 drop — valuable for wired endpoints, tablets and future kit. **Caveat (corrected):** the **HA Voice PE is Wi-Fi-only** — USB-C powered, **no Ethernet port** — so the voice nodes themselves run over Wi-Fi (a strong wired-backhaul mesh is what makes that reliable). If a genuinely *wired* mic is ever required, the fallback is an Ethernet-capable satellite (ESP32-S3-BOX or a Pi-based Wyoming satellite). The **WiiM Mini is likewise Wi-Fi-only** — step up to a **WiiM Pro** for a wired audio endpoint. So: wire the *room* for everything else, but don't assume the voice/audio nodes plug into it.

**Additions needed to the cabling scope** (see "Additions to cabling scope" below).

## Existing kit to reuse

- **Unraid server** — handles NVR, recordings, Home Assistant, Docker containers
- **UniFi Cloud Gateway Max (UCG-Max)** (gift from dad) — becomes the network root. Replaces Deco-as-gateway role. Decos demote to AP-only mode behind it. 5× 2.5GbE (1 WAN + 4 LAN), no built-in PoE (so the PoE switch stays in scope), no built-in WiFi (so the Decos stay as APs), full UniFi Network with IDS/IPS and VLANs. Runs **Site Magic SD-WAN** — the basis for the Selby inter-site link (see "Networking" below).
- **3× TP-Link Deco XE75** mesh, wired backhaul to router — repurposed as access points only once UniFi is in place
- **4× Govee H6008 bulbs** — keep, use in lounge for early testing
- **4× Meross Matter Smart Plug Mini (13A, energy monitoring)** — Matter-native, local, no cloud required. Pair direct to HA via built-in Matter integration.
- **2× Eltax C-205 floorstanders** — deploy as *rears* in the lounge surround setup
- **Apple TV** — integrates with HA via the Apple TV + HomeKit Controller integrations. Becomes a media player entity Claude can control. See "Apple TV integration" below.
- **2× TP-Link 9-port gigabit Easy Smart switches** — web-managed, 802.1Q VLAN-capable, non-PoE. Reused as VLAN-aware **access switches** (office desk, lounge AV stack, garage). See "Networking" below.
- **Echo Show + Echo** — being sold on (~£60-100 offset)

## Technical integration

See **`claude_ha_integration.md`** for the Claude + Home Assistant technical design — software stack, conversation flow, model choice, prompts, tool exposure strategy, latency budget, and API costs.

Headline points that affect this plan:

- Voice nodes are **HA Voice Preview Edition** (Wi-Fi + USB-C power — no Ethernet port; see the Foundation caveat)
- Frigate runs alongside HA on Unraid for CCTV
- Claude is the conversation/reasoning layer via HA's built-in Anthropic integration
- API cost is negligible (~£5-10/month tiered)

## Networking — gateway & inter-site SD-WAN

The network root is the **UniFi Cloud Gateway Max (UCG-Max)**, gifted by dad. It sits in front of the Decos (demoted to APs), runs the full UniFi Network application with IDS/IPS, and handles the VLAN segmentation this plan relies on (IoT / voice / CCTV / guest / main). All five ports are 2.5GbE — give the **Unraid ↔ gateway link a 2.5G path** at the head-end so Frigate/HA traffic isn't bottlenecked behind the gigabit PoE switch.

**No built-in PoE** → a PoE+ switch is **required** for the powered devices. **No built-in WiFi** → the 3× Deco stay on as APs; a later swap to UniFi APs (U6/U7) is optional for single-pane management and better roaming.

### Switching layer

- **Core PoE+ switch** (head-end, Bedroom 3) — feeds the PoE devices. In practice that's only the **4 cameras + doorbell** (the Voice PE units are Wi-Fi + USB-C, so they don't touch the switch at all). The 16-port in the shopping list is therefore mostly headroom — an 8-port PoE+ would technically cover the PoE load — but the extra ports and the option to run AP/tablet data drops off it are worth keeping.
- **2× TP-Link 9-port gigabit Easy Smart (owned)** — reused as **VLAN-aware access switches** where several non-PoE wired devices fan out off one drop: the **office desk** (two PCs + peripherals for Cam + Nova), the **lounge AV stack** (AVR, Apple TV, TV, console), and/or the **garage**. Configure 802.1Q on them (PVID + tagged/untagged) to match the UniFi VLAN IDs.
- **Caveats:** these are **gigabit, not 2.5G** (keep the Unraid uplink and the CCTV/backup path on the gateway's 2.5G ports), and they're **not UniFi-managed** (they won't appear in the UniFi controller — configure once in TP-Link's web UI and leave them). Free kit, zero added cost, and they cut how many home-run drops the core switch has to terminate.

### Inter-site SD-WAN — the Selby link

The aim is a site-to-site **SD-WAN between Woodhouse Road and dad's place in Selby**, using UniFi's **Site Magic** (one-click site-to-site SD-WAN between two UniFi gateways — automatic tunnel setup, route exchange and WAN failover, managed from a single UniFi account).

- **Both ends are UniFi** — UCG-Max here, an existing UniFi gateway in Selby — so Site Magic meshes them in a couple of clicks once both sites are under one UniFi account.
- **Woodhouse has a public dynamic IP** — that's the reachable endpoint. A static IP is **not** needed: the gateway reports its current WAN IP to UniFi's cloud, so the tunnel re-establishes automatically when the dynamic IP changes (no dynamic-DNS needed). Because our side is public, **CGNAT at the Selby end is fine** — that side dials out to us.
- **Plan non-overlapping subnets** — the one real to-do. Woodhouse and Selby must use different ranges (e.g. `10.10.x` vs `10.20.x`) or the SD-WAN routes collide. Settle this alongside the VLAN scheme, across both sites.
- **What it unlocks:** off-site backup is the headline — Qdrant memory store and Frigate footage backed up to dad's over the private link (and vice versa), plus remote support of each other's HA/Unraid/cameras. Complements the existing **Tailscale** (per-device overlay) with whole-subnet, gateway-to-gateway routing.

## Server health monitoring (Unraid)

HA also watches the Unraid box itself, so the server that runs the whole house (HA, Frigate, Qdrant, Docker) flags problems before they bite. This is the "server" sibling of the PC monitoring (HASS.Agent) elsewhere in the plan, and it backstops the SD-WAN off-site backups — you want to catch a failing disk *before* you're relying on the backup.

**Important caveat — the host can't monitor itself.** HA runs *on* Unraid (VM/container), and Glances/Scrutiny/the Unraid integration all run on that same box. So this layer only works **while Unraid + HA are up**. It's great for granular health *during* normal running (SMART, capacity, temps, parity), but it is **blind to its own failure**: if the array isn't started, the box loses power, or HA crashes, nothing here can tell you — the watcher is dead too. "Is it even up?" must be answered by an **independent, ideally off-site watchdog** — see "Watching the watcher" below.

### Stack (layered)

| Tool | Runs on | Gives HA |
|---|---|---|
| **Glances** | Docker on Unraid | Built-in HA integration. CPU/RAM/load, per-disk + array/cache **usage & remaining capacity**, uptime, temps. |
| **Scrutiny** | Docker on Unraid | Best-in-class **SMART** monitoring with *failure prediction* — warns on reallocated/pending sectors creeping up, not just pass/fail. Into HA via its API/MQTT. |
| **Unraid integration** (HACS, via the Unraid **Connect GraphQL API**) | HA | Array started/stopped, **parity check status/progress**, per-disk + cache fill, disk temps/fans, **Docker container states**. |
| **NUT** (Network UPS Tools) | Unraid + HA | Reads the head-end **UPS** — battery %, runtime, on-battery/low-battery events. Same UPS already in the plan; also drives clean-shutdown automation. |

### Alerts it enables

- 🔴 **SMART degrading** — "disk 3 has 12 reallocated sectors and climbing — replace soon" (Scrutiny prediction)
- 🟠 **Cache/array filling** — "cache pool is 90% full" (classic Unraid gotcha that stalls the mover/Docker)
- 🟠 **Disk temp** over threshold → notify / bump a fan
- 🟢 **Parity check** started/finished, errors found
- 🔌 **UPS on battery / low battery** → trigger clean shutdown + alert
- 📦 **Container down** (Frigate, Qdrant, etc.) → notify + optional auto-restart

(Note: "**Unraid/HA itself is down**" is deliberately **not** in this list — HA can't alert on its own death. That case is the external watchdog's job, below.)

Delivery rides the same rails as everything else: phone push (HA Companion), desktop toast (HASS.Agent), and — once the proactive Claude service exists (phase 3) — spoken/written anomalies in plain English.

**Exposure note:** keep these as **diagnostic sensors used by HA automations and the proactive service, but *not* exposed to Assist/Claude's tool list** — the entity-exposure strategy already says to skip diagnostic sensors so voice-turn prompts stay lean and fast. The proactive service can still read them directly when something's actually wrong; they just don't belong in every voice turn.

### Watching the watcher — independent, off-site monitoring

Because the in-HA monitoring above dies with the box, "is the house even up?" needs something **outside Unraid**. Three complementary layers, none of which depend on Woodhouse being healthy:

- **Dead-man's-switch heartbeat (best single fix).** HA pings an external service every minute (**Healthchecks.io** — free tier, or self-hosted). If the pings *stop* for N minutes, the **external** service alerts you (email / SMS / Telegram / push). Because the alert fires on *absence* of signal, it catches **everything** — array stopped, power cut, network down, HA crashed — and needs no inbound access to your house.
- **Off-site active probe at Selby.** Run **Uptime Kuma** on dad's box in Selby (it's already a peer over the SD-WAN) probing Woodhouse's HA, Unraid and gateway. Because Selby is a *separate site on separate power and internet*, it survives a total Woodhouse outage. Make it **mutual** — Woodhouse watches Selby too. This reuses the SD-WAN and pairs naturally with the off-site backups.
- **Gateway-level alerting.** The **UCG-Max** is independent of HA: have UniFi alert when **Unraid drops off the LAN**, and UniFi's cloud notifies if the **gateway/WAN itself** dies. (And the second small UPS on the network gear means the gateway can still send that alert during a server-only outage.)

Net effect: the in-HA layer gives you the *detail* while things run; the external watchdogs answer *"did it come back up?"* — the question HA structurally can't answer about itself.

## Voice coverage — rooms

7 nodes confirmed:

- Lounge
- Kitchen
- Conservatory (now confirmed as living space, not pass-through)
- Bedroom 1 (master)
- Bedroom 2
- Bedroom 3
- Garage (once wired in)

Open questions:

- **Landing** — no upstairs hallway mic. Cover with Zigbee buttons (Aqara) for "goodnight"/"good morning" scenes regardless

Routine scene buttons worth adding regardless of voice coverage:

- Top of stairs (goodnight → all lights off downstairs, lock doors)
- Bottom of stairs (good morning → kitchen/hall lights on)
- Bedside (sleep → bedroom off, lock check)

## Hub & radios (Unraid box)

- **Zigbee coordinator** — SkyConnect or Sonoff ZBDongle-E (~£20). Handles bulbs, locks, sensors, buttons.
- Z-Wave stick — only if we buy Z-Wave kit later
- Matter — supported natively by HA, no extra hardware

## Lighting

- **Existing 4× Govee H6008** — use in lounge for testing. Local control patchy; cloud API works as fallback.
- **Future bulbs** — Zigbee (Hue, Innr, Ikea Tradfri) or Matter, not WiFi
- **Switched fittings** — Shelly or Aqara Zigbee relays behind the switch where pendant fittings aren't worth replacing

Approx zones to cover: dining, kitchen, conservatory, lounge, hall, porch, landing, 3 bedrooms, bathroom, garage, front exterior, back exterior. **~14 zones** (counted from this list).

## Locks

**Three entries, three locks** (confirmed in Open questions): the **front door**, the **conservatory hinged door** (S wall), and the **dining French doors** (N wall). Zigbee/Z-Wave/Matter — not Wi-Fi.

- Candidates: Yale Assure 2 (front), Aqara U100 (conservatory Euro-cylinder retrofit), Aqara A100 Pro or Nuki 4 Pro (dining French-door multi-point cylinder)
- All three are Tier-2 (verbal confirmation before lock/unlock; tool-layer challenge token for locks specifically)
- **🔁 The secure-unlock gate must not depend on the cloud brain (dependency-loop trap).** The Tier-2 "say yes first" + the challenge token live in Claude + the memory service. If the internet/HA/memory is down you'd either be **unable to unlock** or the local fallback would **bypass the safety**. Two requirements: (a) every lock keeps a **physical key + lock-resident keypad codes** (codes stored *on* the lock, validated offline — not by HA in real time), so a software outage never locks you out and guest codes work without HA; (b) decide explicitly whether the local-intent fallback is *allowed* to do a confirmed unlock, or refuses Tier-2 entirely and defers to the physical key.

## Blinds

**Baseline scope: bedroom blinds only.** That's the priority — motorise the three bedrooms (master, bed 2, bed 3) and treat everything else as a *bonus tier if budget allows*. This keeps the blinds line small and certain rather than a £2-3k whole-house commitment.

- **Baseline (do this):** bedrooms — master, bed 2, bed 3. The master bay is 3 panes (3 motors); bed 2/3 are single windows. ≈ 5 motors, ~£700.
- **Bonus tier 1 (if money comes in):** lounge bay (showpiece, 3 panes/motors).
- **Bonus tier 2:** conservatory (5-7 panels — heat/glare; biggest single swing in cost) + dining/kitchen.
- **Note — motors vs openings:** count blinds in *motors* (one per pane → bays inflate the motor count) not windows. Blind motors (shading) are a **separate** device from any window-vent actuators (ventilation) in the optional Window-motors section — the two budget lines are not double-counting.
- Retrofit existing: SwitchBot Blind Tilt or Aqara Roller Shade Driver E1
- New install: IKEA Fyrtur (Zigbee) or Matter-over-Thread

Cabling note: because the *option* on the bonus tiers is only preserved while walls are open, still pull low-voltage DC / draw-string to **every** potential blind head now (see "Additions to cabling scope") even though only the bedrooms are funded today.

## Safety sensors (smoke, CO, water leak)

The most important gap the plan was missing. A JARVIS-grade home that promises to override its own DND "except for smoke" needs to actually *sense* smoke — and floors-open is the cheapest moment to protect against leaks.

**Smoke + CO (life safety):**

- Interlinked smart **smoke + heat + CO** alarms feeding HA — e.g. Zigbee **Frient**/**Heiman**, or mains **Ei Electronics** with a relay/contact module into HA. Keep them functioning as standalone alarms too (HA is a *notifier*, never the only line of defence).
- Unlocks the real version of Cinema-mode's "except smoke" override, plus per-room alerting, phone push when away, and a spoken Claude warning.

**Water leak (protect the build):**

- Zigbee **leak sensors** at the obvious sources: **UFH manifold**, **boiler**, under **kitchen/bathroom sinks**, behind the **washing machine/dishwasher**.
- Highest-ROI add: a **motorised stopcock** (e.g. Sonoff/Aqara valve or a proper actuator on the mains) so HA can auto-shut the water on a confirmed leak — the single best "catastrophe avoided" device in a smart home.

**Cost:** ~£15-25 per Zigbee sensor, ~£60-120 for a motorised stopcock. All on the Zigbee mesh, no new hub. Phase 2 with the rest of the Zigbee fleet (the coordinator must exist first).

## Heating &amp; climate control

New boiler being fitted; wet UFH not yet installed → full flexibility to spec for HA from the start. Per-zone control + modulating boiler = most efficient, comfortable, JARVIS-integrated result.

### Boiler — OpenTherm is a hard requirement

Tell the installer OpenTherm support is non-negotiable. Most modern condensing combis have it:

- Vaillant ecoTEC plus
- Worcester Bosch Greenstar Lifestyle
- Ideal Vogue
- Viessmann Vitodens

OpenTherm lets the boiler **modulate** — run at the lowest temp that satisfies demand rather than full-blast then cycling on/off. Quieter, more efficient, longer boiler life.

### Architecture

1. **Boiler** with OpenTherm support
2. **OpenTherm Gateway (~£80)** sits between boiler and the room sensor — exposes OpenTherm to HA, lets HA modulate boiler flow temp. Note: with OTGW + HA, **HA effectively *becomes* the thermostat** — you don't necessarily keep a separate smart wall stat. Boiler modulation driven by the TRV/zone *demand* isn't automatic; it needs a bit of HA logic (sum/!max of zone calls-for-heat → target flow temp). Keep a simple physical room stat as a fail-safe if HA is down.
3. **TRVs upstairs (5)** — Aqara E1 Zigbee on master, bed 2, bed 3, landing, bathroom
4. **UFH downstairs (2 zones)** — DIY control for lounge + dining

### Wet UFH — DIY zone control (lounge + dining)

For 2 zones, DIY is both cheaper and more JARVIS-friendly than Heatmiser/Wunda. No proprietary wall thermostats, everything is native HA.

**Per zone:**

- Standard wet UFH manifold actuator (installed with the system)
- **Shelly relay** controlling the actuator (~£20)
- **Aqara temperature sensor** in the room (~£15)
- **HA "Generic Thermostat"** entity ties it together — calls for heat when room temp &lt; target. **Caveat:** UFH is high-thermal-mass and slow; a naive on/off Generic Thermostat will overshoot badly. Use a PWM/TPI duty-cycle approach (Generic Thermostat's `min_cycle_duration` / a PID or `better_thermostat`-style control) so the floor doesn't keep cooking after the call-for-heat clears.

Target temp can be set per-person, per-time-of-day, per-occupancy state. mmWave presence directly influences heating (room occupied → warm; vacant for an hour → drop).

### What it unlocks proactively

- "I'm cold" → Claude knows which room Cam is in (mmWave + presence), bumps that zone (Tier 2 confirms first)
- "Conservatory's 28°C — open blinds for ventilation?"
- "Master bed still 22°C at midnight — drop to 18 for sleep?"
- "Boiler usage up 30% week-on-week" (via Shelly EM on boiler feed)
- Per-person preference: Cam likes office at 21°C, Nova prefers 19°C
- "Lounge is empty, dropping target by 2°C" — efficiency without thinking

### Cost

| Item | Est. |
|---|---|
| 5× Aqara E1 Zigbee TRVs | £200 |
| OpenTherm Gateway | £80 |
| 2× Shelly relays (UFH actuators) | £40 |
| 2× Aqara temp sensors (UFH rooms) | £30 |
| Misc cables / install bits | £30 |
| **Heating total** | **~£380** |

Plus the boiler itself, which is in the building budget separately.

### Phasing

- **During build:** boiler installed with OpenTherm support; UFH installed with manifold + actuators in lounge + dining
- **Phase 2:** OTGW + 5× TRVs deployed, HA controls boiler + upstairs heating
- **Phase 3:** UFH zone control wired in (Shelly + sensors), per-zone Generic Thermostats configured in HA

## Cooling / AC (optional)

Sheffield summers have crossed the line where AC in a semi is no longer ridiculous. Walls open now = cable/pipe runs cost pennies. Even if units are deferred, **rough in the routes during the rewire**.

**Heat pump = AC.** Modern air-to-air heat pumps and AC units are literally the same hardware — same refrigerant cycle, just reversible. Buying "AC" gets you supplementary heating in shoulder seasons for free.

### Options

**Multi-split heat pump (recommended)** — one outdoor unit feeds 2-5 indoor wall-mounted heads via small refrigerant pipes. Reversible. Quiet (modern units ~19-25 dB indoor). Brands with strong HA integration: Daikin, Mitsubishi Electric, Panasonic.

**Single splits** — same tech, one outdoor unit per indoor unit. Cheaper if only 1-2 rooms need it. More outdoor units = uglier external wall.

**Portable units** — avoid. Ugly, noisy, inefficient, vent hose problem.

**Cheap alternatives (do these as well, not instead):**
- External blinds / awnings — block sun before glass. ~£200-500 per window.
- Solar reflective film on conservatory glass — ~£200-400. Massive temp drop.
- Ceiling fans — circulation only, but combined with shading often enough. ~£100-200 per room.

### Where to install (priority order)

| Room | Priority | Why |
|---|---|---|
| Master bedroom | High | **South-facing** — heavy solar gain all afternoon + sleep quality. The room that'll cook in summer. |
| Lounge | High | **South-facing** — main living space + bay window picking up afternoon sun. |
| Bedroom 2 (office) | High | Two people working with two PCs + monitors = significant heat load during working hours. |
| Conservatory | Medium | **East-facing** — morning sun only, less brutal than south-facing. Manageable with solar film + shade alone for most days. |
| Bedroom 3 (head-end) | Low | No regular occupant. Equipment heat manageable with ventilation + quiet fan. |

### Specific recommendations

**Premium — Daikin Stylish 4-head multi-split** (master + lounge + office (bed 2) + conservatory). Sleek matte wall units, ~19 dB at lowest fan, official Daikin Onecta HA integration. **~£5,500-7,500 installed.**

**Mid — Daikin Comfora 3-head multi-split** (master + lounge + office). Skip conservatory unless really used in summer. Same internals as Stylish, plainer body. **~£3,800-5,200 installed.**

**Budget — 2× single splits** (master + office, OR master + lounge depending on whether you spend more time working from home or evenings downstairs). Mitsubishi or LG via local F-Gas installer. **~£1,800-3,000 installed.**

**Bare minimum — master bedroom single split only.** 2.5-3.5 kW unit. South-facing bedroom is the priority — sleep matters most. **~£900-1,500 installed.**

### Home Assistant integration

| Brand | HA integration | Quality |
|---|---|---|
| Daikin | Daikin Onecta (built-in core) | Excellent |
| Mitsubishi Electric | MELCloud (built-in) | Excellent |
| Panasonic | Comfort Cloud (HACS) | Good |
| LG | ThinQ (built-in) | OK — flaky cloud auth |
| Any IR-remote AC | Sensibo / SwitchBot Hub 2 / Tado AC Control | Good — retrofits smarts to cheap units |

### Smart automations this unlocks

- **Bedroom pre-cool before sleep** — forecast > 24°C tomorrow → cooling starts 22:00, target 19°C by midnight
- **Empty room auto-off** — mmWave detects nobody home → AC pauses after 15 min
- **Window/door open detection** → AC pauses in that room + phone notification
- **Octopus Agile cheapest-slot pre-cooling** — overnight cheap rate chills the thermal mass
- **Conservatory hot alert** — past 28°C with someone home → "shall I cool the conservatory?"
- **Office heat awareness** — head-end + PC heating Bed 3 → auto-cool when temp rises and PC is active
- **Shoulder-season heating** — chilly spring evening, boiler off, AC reverses to heat just the lounge for 2 hours. Cheaper than firing the boiler.

### Cabling and electrical (do NOW)

Even if units are deferred, install infrastructure now. Adding later means ripped walls.

- **Refrigerant pipe routes** — 8mm + 16mm copper pair with insulation. Run from each planned indoor location to outdoor unit position. Capped both ends.
- **Communication cable** — 4-core low-voltage between indoor and outdoor. Run alongside refrigerant.
- **Condensate drain** — gravity-fed flexible drain from each indoor head to nearest waste pipe or outside. Easier with floors up.
- **Outdoor unit power** — dedicated 13A or 16A circuit from consumer unit to outdoor location. Add to electrical scope.
- **Outdoor unit position** — back wall, side wall, or ground-mounted bracket. Needs clearance for airflow.

Rough-in cost during the rewire: maybe **£150-400** in conduit + pipe + cable. Adding later costs £500-1,500 per indoor head plus the unit. Massive difference.

### Open questions

- Which windows are south-facing? Determines which rooms will actually need cooling.
- Conservatory orientation — south-facing makes AC essential for summer use.
- Where will the outdoor unit live? Check planning constraints (semis sometimes have permitted-development limits on heat pump placement).
- How much do you actually feel the heat? Worth waiting one summer in the house before committing if budget's tight.

### Recommendation

Rough in the infrastructure for master + bed 3 + conservatory + lounge (4 positions) during the rewire — cheap insurance. Then defer the actual units until after one summer in the house. Summer 2027 will tell you what you need; the pipework will already be there.

## CCTV + doorbell

- **NVR**: Frigate on Unraid. **Detector: Coral TPU is optional now, not required** — Frigate also supports **OpenVINO on an Unraid iGPU** (or ONNX/CPU) for object detection, so don't let chronic Coral supply block the build. Use whichever the Unraid box can run; Coral is a nice-to-have for low CPU load.
- **Cameras**: PoE only. Reolink (budget), Amcrest/Dahua (mid), Unifi (premium). *Verify* the specific Reolink models stream cleanly to Frigate with internet egress fully blocked (some Reolink firmware misbehaves when firewalled).
- **Doorbell**: Reolink PoE Video Doorbell — works with Frigate, runs off PoE switch. *Verify* doorbell-press events reach HA/Frigate with egress blocked.
- **PoE switch** — 8-port minimum (TP-Link or Unifi)
- **Storage** — event recording + 24-48hr continuous buffer. Unraid has plenty.
- **VLAN** — cameras isolated from main network (good hygiene, not essential)

### Camera positions (confirmed)

4 PoE cameras + doorbell. Coverage focuses on the driveway/garage corridor (the only side passage on the property) and front/rear.

- **Front of house** — high, central mount, covers porch, bays, driveway entrance
- **Rear** — above conservatory, garden coverage
- **Side of house (driveway)** — house-mounted, looking down the side toward the garage. (The side opposite the garage has no passage.)
- **Above garage door** — garage-mounted, looking back toward house. Shares the fibre conduit. Bidirectional coverage of the driveway combined with the house-side camera above.
- **Doorbell** — Reolink PoE on the front door
- *Optional later: garage interior camera for workshop/storage*
- *Considered and skipped: second front-of-house camera on the opposite corner. Adds redundant coverage but introduces a blind spot directly below it; central front camera + doorbell cover the entry already.*

### Storage sizing (Unraid)

Frigate records continuously to a short-term buffer, then keeps anything where AI detected a person/car/etc. indefinitely. You get "rewindable last day" plus "every meaningful event for 30+ days" without storing 24/7 4K forever.

**Sizing for 4× 4K cameras + doorbell, Frigate event mode + 48hr buffer:**

| Item | Approx |
|---|---|
| 48hr continuous buffer | ~250-350 GB |
| 30 days of detected events | ~600 GB - 1.5 TB |
| Snapshots, thumbnails, database | ~50 GB |
| **Total reasonable allocation** | **~1-2 TB** |

Bump to **3-4 TB** for 60+ days retention, 6 cameras, or longer continuous buffer.

**Unraid setup:**

- Dedicated share (e.g. `/mnt/user/frigate`) — not mixed with media
- **SSD cache pool** for active recording (~£60-80 for 1TB). Frigate writes constantly; SSD massively extends HDD life and reduces noise. Long-term retention moves to array via Unraid's mover.
- **Don't put recordings on parity-protected drives** — recordings are replaceable, parity costs a drive. Set the share to unprotected or cache-only spilling to unprotected disk.
- Keep completely separate from Plex/media share — CCTV writes 24/7 and would spin up media drives constantly otherwise.

**Top-up cost if Unraid is currently tight:**

- 4TB HDD (used Red/Ironwolf): ~£60-100
- 1TB SSD cache: ~£60-80
- **Total: ~£120-180**

## Audio / music

Echoes are being sold on. Plex is the source of truth for music. Each room needs a network audio endpoint that HA can control.

### Lounge — AV receiver does it all

Buying secondhand off FB Marketplace. AVR acts as both surround processor AND the lounge music endpoint (no WiiM needed here). **Ecosystem — decided: deal-led** — grab whichever of **Denon/Marantz (HEOS)** or **Yamaha (MusicCast)** turns up cheap and clean; both integrate well with HA, so let price/condition pick the brand rather than committing up front.

**Target spec when hunting:**

- AirPlay 2 (Plex casts to it natively)
- HEOS (Denon/Marantz) or MusicCast (Yamaha) — both have solid HA integration
- **7.2 channels is plenty — the install is 5.1 only** (Atmos/heights were dropped in Open questions: no ceiling runs, no upfiring). Atmos-capable AVRs are fine as future-proofing, just don't pay extra for height channels you won't wire.
- HDMI 2.1 with 4K/120 passthrough
- eARC for TV audio

**Sensible models to watch for:**

- Denon AVR-X3500H / X3600H / X3700H (~£250-400 used)
- Marantz SR6013 / SR6014 / SR6015 (~£300-500 used)
- Yamaha RX-A1080 / A2080 / A4A (~£250-450 used)
- Nothing older than 2018-ish

**Avoid:** Sony AVRs (poor HA integration), lifestyle systems with proprietary connectors (Bose Acoustimass etc.), anything with foam-surround drivers older than ~10 years.

**Speakers — secondhand brands worth watching:**

- Q Acoustics (3000 series, 3050i floorstanders)
- KEF Q-series
- Monitor Audio Bronze / Silver
- Wharfedale Diamond
- Subs: BK Electronics, SVS, REL — barely age, bargain used

**Atmos heights:** ceiling speakers if cable runs are possible (Monitor Audio C165 etc.), otherwise upfiring modules on the front speakers.

**Marketplace strategy:** saved searches, collection-only filter, test every channel before paying, push cones gently (should move freely, no scraping).

### Lounge TV — TCL 65C6KS (65" QD-Mini LED, 2025)

The lounge display — the chosen set is the **TCL 65C6KS-UK** (C6K series, 2025), ~**£529**. A **QD-Mini LED** (Quantum Dot + Mini-LED backlight) is genuinely the *right* panel for this room: the lounge is **south-facing with a bay window catching afternoon sun**, and Mini-LED gets far brighter and shrugs off glare where **OLED** would wash out (and risks burn-in on static dashboards). Pair it with the bay blinds for film nights. Dolby Vision + Atmos, **AirPlay 2** (Plex casts straight to it), Google TV, Alexa/hands-free.

- **Gaming — fine for this use.** The C6K is TCL's *entry* QD-Mini LED, so it's likely a **60Hz** panel (the 120/144Hz + full VRR is on the dearer C7K/C8K). That's **perfectly adequate here**: Apple TV/film is 24-60fps and **Steam Deck streaming tops out ~60fps**, with **ALLM/Game Mode** for low lag. Only a future *directly-connected* console/PC wanting 4K120 would want a step-up model. *(Confirm the listed refresh rate so you know what you're getting.)*
- **Audio path:** connect to the 5.1 AVR over **HDMI eARC** so the TV's own apps still play through the surround system; route Apple TV + the Steam Deck dock *into the AVR* so it does the switching. *(Confirm the C6K has an eARC port — most do.)*
- **HA control:** TCL runs **Google TV** → HA's **Android TV / Google Cast** integration gives power, volume, app launch, playback state and "what's playing"; **HDMI-CEC** handles power/input in scenes. Drives **cinema mode**, **auto-dim on play / restore on pause**, **doorbell feed cast to the TV**, and **lounge gaming → Game Mode**.
- **Reliability note:** Android TVs can be flaky to *wake from standby* over the network — lean on **CEC through the AVR** in the cinema scene rather than network power-on. And keep the **Apple TV as the primary source**, treating TCL's Google TV (ads, occasional lag, update lifespan) as a backup — as the plan already has it.
- **Trade-offs to expect (entry-tier):** fewer local-dimming zones / lower peak brightness than the dearer models (still great in a bright room, just not reference HDR), and it's a **VA panel** (narrower viewing angles than OLED — fine straight-on from the sofa, worth a thought if seating fans wide across the bay).

### Other rooms — WiiM Mini endpoints

Each room gets a WiiM Mini (~£90) plugged into a powered speaker. Supports AirPlay 2, Chromecast, Spotify Connect, DLNA, Plex casting. HA controls them directly.

| Room | Endpoint | Speaker |
|---|---|---|
| Kitchen | WiiM Mini | Edifier R1280T or similar (~£100) |
| Conservatory | WiiM Mini | Powered bookshelf or weatherproof (~£100-150) |
| Bedroom 1 | WiiM Mini | Small powered speaker, or use HA Voice PE built-in |
| Bedroom 2 | Voice PE built-in initially | Upgrade later if used for music |
| Bedroom 3 | Voice PE built-in initially | Upgrade later if used for music |
| Garage | WiiM Mini | Rugged powered speaker |

### Multi-room sync

Lounge AVR (HEOS/MusicCast) won't sample-accurately sync with WiiMs in other rooms. Accepting that — rooms usually want different audio anyway. WiiMs sync between themselves when "play everywhere" is needed.

### Voice + music interaction

HA Voice PE listens, Claude resolves "play X in the kitchen," HA tells Plex to cast to the kitchen WiiM (or AVR for lounge). Voice PE's built-in speaker handles spoken acknowledgments ("okay, playing now") so it doesn't fight with the music output.

### Apple TV integration

Apple TV (already owned) sits in the lounge as the main TV-and-film source. Two HA integrations work together:

- **Apple TV integration** — controls playback, navigation, app launching. Exposes a media player entity.
- **HomeKit Controller** — exposes Apple TV's HomeKit features. Mostly useful alongside other HomeKit kit.

**What it unlocks:**

- **One-touch: just turn on the Apple TV → everything follows.** No more powering the TV, soundbar/AVR and Apple TV separately. Two layers make this bulletproof:
  - **Base layer — HDMI-CEC ("one-touch play"):** waking the Apple TV tells the TV to power on + switch to its input and the AVR (over ARC/eARC) to power on. This works *today* on the current setup — enable CEC on the TV (Anynet+/SimpLink/Bravia Sync/etc.), enable it on the soundbar via **HDMI-ARC** (not optical), and on the Apple TV turn on Settings → Remotes and Devices → Home Theater Control → **"Control TVs and Receivers."**
  - **Reliable layer — HA:** the Apple TV integration sees it turn on and runs the cinema scene — TV on, correct input, AVR on, optional lights/blinds — and corrects anything CEC fluffs. Reverse on idle: everything powers down.
- **"Movie" scene** orchestration — AVR on, Apple TV powers on, Plex launches, lights dim, blinds close. Triggered by the Apple TV waking *or* a single voice command.
- **"What's playing?"** — Claude can query state and tell you (artist, episode, time remaining)
- **Auto-pause on doorbell** — TV pauses, camera feed appears on kitchen/hall tablets or on the TV itself
- **Auto-dim on play / restore on pause** — lighting follows playback state
- **"Stop watching" / "next episode" / "skip intro"** via voice (works variably per app)
- **Presence signal** — if Apple TV is playing, someone's in the lounge

**Caveats:**

- Native app launching is patchy — Plex, Netflix, YouTube launch reliably; smaller apps sometimes don't
- Keyboard input via HA is fiddly — still want the Siri remote for passwords / search
- AirPlay 2 from Plex → Apple TV works great; can be used as a Plex client even where the native Apple TV Plex app isn't ideal

## Game streaming (office → lounge)

Stream PC games from the **gaming PC (office, Bed 2)** to the **lounge**, played on a **docked Steam Deck**. This is a *latency* problem, not a bandwidth one — a wired Gigabit LAN handles it with room to spare (1080p60 ≈ 20-30 Mbps, 4K60 < 100 Mbps; the bottleneck is jitter, which wired removes). Three things make it reliable:

1. **Wire both ends — not Wi-Fi.** Gaming PC on Ethernet (one of the Bed 2 desk drops). **Steam Deck dock** on a **lounge Cat6 drop** — the dock's Gigabit port bypasses the Deck's weaker built-in Wi-Fi, which is the usual cause of stutter. (Reserve a lounge drop for the dock — see "Additions to cabling scope".)
2. **Same VLAN for the PC and the Deck.** Steam Remote Play and Moonlight rely on local discovery (broadcast/mDNS); across VLANs it silently fails. Put both gaming endpoints on the **main/trusted VLAN together** (work laptop, IoT, cameras stay segmented) — captured in the Operations network scheme. Cross-VLAN is possible with mDNS reflection + opening the specific ports, but same-VLAN is the painless route.
3. **Host stack — decided: Steam Remote Play** (zero-setup, built into Steam and the Deck). Sunshine + Moonlight stays the optional upgrade later if you want lower latency / HDR / non-Steam games (its virtual display also lets the PC stream headless while the desk KVM is on the work laptop).

**Smart-home layer (the "lounge gaming" scene):** Deck docked → AVR on, TV/AVR switches to the Deck's HDMI input, lights to a gaming scene, Claude DND. **Wake-on-LAN** the gaming PC from HA ("fire up the gaming PC") before you sit down; it sleeps again after. The Deck is just another HDMI source alongside the Apple TV.

**Note:** the PC runs hard while you game in the lounge, adding heat to the office — reinforcing Bed 2 as an AC-priority room. **Cost: ~£0** — the **JSAUX dock (Ethernet) is already owned**, the lounge Cat6 is in scope, and the host software (Steam Remote Play / Sunshine + Moonlight) is free. **Phase 3.**

## Displays &amp; touch panels

Wall-mounted Android tablets and a DIY smart mirror — the visual layer that ties everything together. All running HA dashboards via Fully Kiosk Browser.

### Wall tablets

Four locations confirmed:

- **Kitchen** — workhorse. Timers, recipes, music control, doorbell auto-popup when someone rings.
- **Lounge** — AV control, scene selection, doorbell feed, ambient info while watching TV.
- **Hallway** — away/home modes, doorbell feed, status overview.
- **Master bedroom** — wake-up dashboard, sleep mode.

**Hardware:**

- Samsung Galaxy Tab A7 / A8 / A9 (10-11", ~£50-80 each on Marketplace)
- Avoid iPads — kiosk mode is painful, MDM required
- Flush wall mounts (~£20 each)
- USB outlet behind the wall for clean power (~£15 each)
- Look for tablets with "max charge 80%" setting (Samsung has it) — without it, battery swells over time

**Software:**

- **Fully Kiosk Browser** — purpose-built, handles screen-on, motion-wake, voice triggers. ~£6 one-off license.
- Each tablet shows a per-location HA dashboard
- Doorbell event → kitchen/hall tablet auto-switches to camera feed with talk-back

### Smart mirror — bathroom

Planned conversion of the wet room to a normal bathroom changes the calculus slightly — easier to do a DIY smart mirror in a standard bathroom (no constant steam, no risk of tablet failure). Build:

- Cheap Samsung tablet behind a two-way acrylic mirror sheet (~£40-80)
- Frame from IKEA mirror or custom-made
- Runs MagicMirror² or a custom HA dashboard (black background)
- Shows: time, weather, calendar, news headlines while you're brushing teeth

**Aqara wireless button** mounted next to it for hands-free triggers:

- Single press → news briefing (Claude generates, TTS plays through bathroom speaker)
- Double press → today's calendar
- Long press → traffic / commute info

The button gives "I want this *now*" speed — no wake-word delay. Voice still works ("Claude, news briefing") for hands-busy moments.

## Proactive automation

The "JARVIS factor" — Claude speaks and acts proactively, not just reactively. Built on event triggers + a custom Python service. Architecture details in `claude_ha_integration.md`.

Examples once running:

- "Nova's about 10 minutes away" (phone geofence)
- "Looking like rain at 6 — the washing's still out" (weather + washer state)
- "Energy spike — immersion's been on for 3 hours, want me to turn it off?" (Shelly EM)
- "Front door's been unlocked for 90 minutes" (lock state + threshold)
- "Your 10am meeting in 5 minutes" (calendar)

Calibrated so it's useful, not naggy: quiet hours, throttling, and Claude itself decides whether each trigger is worth speaking about.

Combined with **person identification** (phone presence + Frigate face recognition), Claude addresses people by name and tailors output to who's actually present. Both free and built-in:

- **Tier 1:** HA Companion app on each phone → who's home, who's away
- **Tier 2:** Frigate face recognition → who just walked through the front door

## Per-room presence (Aqara mmWave)

PIR motion sensors are infamously bad at "is someone in this room right now" — they only see movement, so they switch lights off when you sit still and need long timeouts to compensate. mmWave radar detects breathing-level micro-movement, which fixes all of that and unlocks per-room presence as a serious input layer.

### Why it matters for this project

- **Lights don't switch off mid-shower** because you're not waving your arms
- **Lights don't switch off when you're reading on the sofa** for 5 minutes
- **Faster "vacated" detection** — lights drop within seconds of you leaving, not 5-10 minutes later
- **Real-time per-room routing for proactive Claude** — knows which room you're actually in, beats "last voice interaction" guessing

### Two sensors worth knowing

- **Aqara FP2 (~£60-70)** — multi-zone. Single sensor divides a room into up to 30 zones, reports which zones are occupied. Mains-powered (USB-C).
- **Aqara FP1E (~£40)** — single zone. Just occupied/not. Mains-powered.

Both are HomeKit-native, so cleanest local integration is via HA's **HomeKit Controller** — no cloud, no Aqara hub needed.

### Deployment

| Room | Sensor | Why |
|---|---|---|
| **Lounge** | FP2 | Zones for sofa / TV-watching / doorway. "Movie" scene auto-engages when sofa zone occupied + TV on. Music pauses when doorway zone activates. |
| **Master bedroom** | FP2 | Zones for in-bed vs dressing area. Wake-up automation fires when leaving bed. Reading lights when in-bed but awake. |
| **Bathroom** | FP1E | Lights stay on through shower / bath. Standard bathroom (not wet room) makes mounting away from spray straightforward. |
| **Office / Bed 3** | FP1E (optional) | Desk presence for focus mode. |

**Note:** with the planned bathroom conversion (no longer a wet room), FP1E is straightforward — mount on the ceiling away from direct shower spray. Humidity sensor + PIR was a workaround for the wet room scenario; no longer needed.

### Layering with existing presence/ID

Three layers, all complementary:

1. **Whole-house presence** — phone (HA Companion)
2. **Per-room presence** — mmWave sensors (this section)
3. **Person ID at choke points** — Frigate face recognition (front door)

Combined inference: "Cam's phone says he's home + lounge is occupied + last face-recognised at front door 2 min ago" = strong confidence Cam is in the lounge. That's what enables proactive Claude to route to the right room and address the right person.

### Cost

- 2× FP2 (lounge + master): ~£120-140
- 1× FP1E (bathroom): ~£40
- 1× FP1E (office, optional): ~£40
- **Total: ~£200-220**

## PC integration

The PC becomes both an input layer (presence/activity) and an output surface (desktop overlay, doorbell pop-ups, ambient info). Both directions matter for the JARVIS feeling.

### As input — PC presence and activity

**HASS.Agent** (Windows, free, open source) runs in the system tray and exposes ~30 sensors per machine to HA over MQTT: active/idle/locked/asleep, focused window, webcam in use, mic in use, battery, CPU, network. iotlink is an alternative; HASS.Agent is better-maintained.

Combined with the office mmWave sensor, you get strong "Cam's at his desk" inference:

- PC active + office occupied + phone home = Cam at the PC
- Either signal alone is weaker — PC could be running a download while you're elsewhere

### As output — three overlay options, increasing in effort

| Approach | What it gives | Effort |
|---|---|---|
| HA Companion app for Windows | Basic toast notifications, dashboards | 5 min |
| Pinned browser dashboard | Ambient corner info that auto-refreshes | A few hours' HA Lovelace tinkering |
| Custom Tauri / Electron app | Native overlay, full control, talk-back to Claude | 1-2 weekends |

**Sweet spot is hybrid:** HASS.Agent for sensors + pinned browser dashboard for ambient info + small custom app for important interrupts (doorbell with camera feed, urgent Claude messages, calendar takeovers).

### What it enables

**Reactive:**

- Doorbell rings → camera feed + answer button overlays on whichever screen is active
- Motion at side gate → corner notification
- Washing machine done → toast

**Proactive (Claude-driven):**

- Claude routes to PC if you're at it, instead of Voice PE — useful when you're on a video call and don't want spoken interruption
- "Cam, Nova said she'll be home at 6" as silent toast
- Energy spike → desktop alert with "investigate / ignore" buttons

### Routing logic for proactive Claude

The proactive service learns where to deliver notifications based on context:

- PC active + on video call → silent visual only
- PC active + not on call → desktop toast + maybe TTS to office Voice PE
- PC idle + person in lounge → TTS to lounge Voice PE + lounge tablet
- Phone away from home → push notification only

### Cost and phasing

All software: **£0**. HASS.Agent (~10 min setup per PC) + pinned browser dashboard (HA Lovelace time) + optional custom Tauri app (~1-2 weekends dev time).

Belongs in **phase 3** — after proactive Claude service exists. Without proactive, PC integration is just "doorbell pops up", which is fine but not the Stark vision.

### Desk setup — dual monitors + KVM (office, Bed 2)

The office desk runs **two monitors** — one a **34" 21:9 ultrawide (3440×1440)** — shared between the **work laptop** and the **gaming PC** through a **KVM**, so either source can drive the pair (keyboard/mouse/webcam follow).

**The critical buy-time check (locked-down-laptop trap again):** a dual-monitor KVM only works if *each* source can actually output two displays. The gaming PC does this natively (2× DisplayPort). The **work laptop** outputs over **USB-C (DP Alt Mode)** and many corporate laptops only reliably drive **one** external display that way — two often needs **DisplayLink**, whose **driver can't be installed** on a locked-down machine. So:

- **Confirm the work laptop can run two external displays natively (DP Alt Mode + MST), no drivers.** If yes → a true dual-head KVM gives both monitors on either source. If no → fall back to *laptop drives the ultrawide only, gaming PC drives both*, and make the ultrawide the shared/primary.

**Kit:**

- **Monitor:** 34" **3440×1440** 21:9, **144-165Hz IPS** for work + gaming. Seek a **USB-C (~90W) input** (single cable to the laptop) and a **built-in KVM** (LG 34GP/34GS, Dell, Gigabyte M34WQ, MSI) — the monitor's own KVM can cover peripheral switching.
- **KVM — decided: a basic dual-head KVM** (manual button/hotkey switch, no HA control). Still needs **DisplayPort 1.4** (bandwidth for 3440×1440@144-165Hz), a **USB-C input** for the laptop (avoids DisplayLink) and **USB 3.0** peripherals. Aten / TESmart / ConnectPRO. *(An RS-232/TCP HA-switchable model remains a possible future upgrade, but isn't needed.)*

**Smart-home tie-ins:**

- **HA-switchable desk** — a network/RS-232 KVM (or its button wired to a Zigbee/Shelly relay) lets you say *"switch the desk to the gaming PC"*; the **9:00 work scene** (see Focus mode) can auto-flip it to the laptop.
- **Works with lounge game-streaming** — when streaming to the docked Steam Deck, the KVM stays on the laptop and the gaming PC streams **headless via a Sunshine virtual display**.
- **Heat/power** — ultrawide + gaming PC add desk load and heat, reinforcing Bed 2 as an AC-priority room and a candidate for a smart-plug "desk off when away" routine.

**Cost:** ~£350-550 for the ultrawide + ~£150-400 for a good dual-head DP 1.4 KVM (or less if the monitor's built-in KVM suffices). **Phase 3-4.**

## Smart plug deployment

4× Meross Matter plugs already owned. Each one turns a dumb appliance into something Claude can see, control, and react to. Three jobs a plug can do:

1. **Control** — turn things on/off remotely, by schedule, scene, or voice
2. **Monitor** — measure power draw, detect state changes (running / idle / done)
3. **Safety** — auto-off after a timeout, protect against forgotten-on appliances

The Meross plugs do all three (energy monitoring built in).

### Initial deployment — 4 owned plugs

| Plug | Appliance | Job | Triggers it enables |
|---|---|---|---|
| 1 | **Lounge lamp** (done) | Control | Voice on/off, "cosy" / "movie" scenes |
| 2 | **Washing machine** | Monitor | "Washing's done" announcement when power drops |
| 3 | **Immersion / dryer** | Monitor + safety | Anomaly alerts, cycle-complete notifications |
| 4 | **Bedroom lamp or kettle** | Control | "Good morning" scene, sleep routines |

The two energy-monitoring plays (washer + immersion or dryer) deliver the most proactive Claude value early — instant ROI on the JARVIS feeling.

### High-value future additions

In rough order of impact-per-pound:

**Daily use:**

- More lamps (bedrooms, side tables, dining)
- Kettle / coffee machine — warm-up on "good morning"
- TV / AV stack — true power-off, "away" scene
- Christmas tree lights — seasonal but the best smart-plug advert in December

**Monitoring without controlling:**

- Tumble dryer, dishwasher — cycle-complete alerts
- Boiler / immersion — biggest energy cost in most homes, most valuable to monitor
- Fridge/freezer — compressor health, door-left-open detection via power draw
- Computer / monitor — desk usage tracking

**Safety:**

- Hair straighteners / curling tongs — auto-off after 30 mins. Best "did I leave it on?" insurance.
- Iron, heated blankets, space heaters — max runtime caps
- Slow cooker — schedule + auto-off after Y hours

**Comedy / quality of life:**

- WiFi router — 4am daily restart solves 80% of weird internet issues
- Outdoor / patio festoon lights — sunset schedule, voice command
- Aquarium / vivarium — heater + light cycle
- Kids' devices — bedtime enforcement without arguments

### Where NOT to use smart plugs

- Anything safety-critical (medical, freezers with expensive food — use for *monitoring*, not control)
- Anything over 13A — the plug rating. High-wattage oil heaters, big space heaters
- Anything you want manual control of every day — defeats the point

### Proactive triggers each placement enables

Tied to the proactive Claude service (phase 3+):

| Appliance | Trigger | Possible output |
|---|---|---|
| Washing machine | Power drops below 5W after running | "The washing's done" |
| Tumble dryer | Same pattern | "Dryer's finished" |
| Immersion heater | On > 90 minutes | "Immersion's been on a while — turn off?" |
| Fridge/freezer | Power draw anomaly | "Fridge is drawing more than usual" |
| Iron / straighteners | On > 30 min | "Looks like the straighteners are still on" (auto-off too) |
| Slow cooker | Schedule + duration | "Slow cooker's done — turning off" |
| TV stack | Power > 50W after midnight | "TV's still on, you good?" |

### Buying more

Stick with Matter where possible. Three sensible options for expansion:

- **More Meross Matter Mini** (~£10 each in 4-packs) — same as owned, drop-in easy
- **Aqara Smart Plug Zigbee** (~£15-20 each) — uses Zigbee dongle, doesn't touch WiFi
- **Shelly Plug S Gen3** (~£20) — WiFi but with proper local API, energy monitoring

## Optional: Window motors

Not committed but worth knowing about while walls are still open. Candidates if interest is there:

- **Skylights** (if any) — Velux integrated motors, ~£200-300 each. Auto-close on rain, open for ventilation.
- **Bathroom** — chain actuator, CO2/humidity-driven ventilation. ~£150-300.
- **Conservatory** — heat dumping in summer. ~£150-400.
- **Bedroom** — auto-crack for sleep ventilation. ~£150-300.

If any are planned, cable runs (12V/24V DC) need adding to the cabling scope **now**.

**Cheaper alternative for most rooms:** smart extractor fans + CO2/humidity sensors. ~£100 per fan. Automates ventilation without motorising windows.

## Garage bar

The garage already gets a Voice PE, a WiiM + rugged speaker, Zigbee lighting, an exterior camera and the fibre link — so a bar is mostly **scenes + a few cheap sensors + Claude's personality** layered on kit that's already going in. *(Effort tags: ♻️ reuses planned kit · ➕ cheap add · 🔧 weekend project · 🚀 showpiece.)*

### Signature moments (build these six first)

1. **"The usual?"** ♻️ — voice-ID + presence + RAG memory: walk in → "Evening — pour you the usual?", with per-person drink/music/lighting prefs. The most *JARVIS-bar* moment, near-zero new kit.
2. **Keg flow-meter leaderboard** 🔧 — a hall-effect flow meter on the beer line → ESP32 → HA tracks pints poured, **keg % remaining** ("keg's at 15% — order a refill?") and *who* poured what. Gamified pint leaderboard.
3. **Claude bartender** ♻️ — a spirits/mixers inventory (Grocy) + "what can I make with what's in?" → Claude suggests a cocktail, **reads the recipe aloud step-by-step**, scales quantities, and does **"bartender's choice"** (invents one from stock and names it).
4. **Camera dart auto-scoring + pub-quiz host** 🔧/♻️ — reuse **CodeProject.AI** (already in the plan for ALPR) to score darts; Claude calls scores and keeps a league table. "Claude, start a pub quiz" → he runs rounds and keeps score with **Zigbee buttons as buzzers**.
5. **Goal-reactive team-colour WLED** ➕ — "put the match on"; a live-scores API flashes the bar's **WLED** in team colours on a goal. The party trick everyone remembers.
6. **NFC jukebox coasters** ➕ — cheap NFC tags in coasters/tokens; tap one on a reader to queue that song. Physical song requests for pennies a tag.

### Ambience & audio

- **"Open the bar" / "last orders" / "closing time" scenes** ♻️ — one phrase sets lights, back-bar bottle lighting, neon sign, music, heater and the TV/projector. An **"Open / Closed" status** mirrors bar-mode onto the house tablets so everyone knows it's live.
- **WLED behind the bar** ➕ (ESP32 + addressable strip, ~£25) — under-counter glow, bottle backlighting, shelf wash; music-reactive, holiday/team colour themes.
- **DJ Claude** ♻️ — "play something 90s", "read the room", "play everywhere" to sync the bar with the house for parties; conversation-aware ducking (reuse the cinema-mode trick).

### Drinks tech

- **Bar-fridge / kegerator temp control + door-left-open alert** ➕ (Inkbird/Shelly + contact sensor).
- **Load-cell bottle inventory** 🚀 — load cells (HX711 + ESP32) under the spirits shelf weigh each bottle, so HA *knows how full the gin is* and warns when it's low.
- **Auto-cocktail machine** 🚀 — peristaltic pumps + ESP32 (OpenBar/Bartendro style): "Claude, make a negroni." The ultimate stretch.
- ⚠️ **CO2 safety** — a keg CO2 cylinder in an enclosed garage needs a **CO2 leak sensor** (extend the plan's CO2 sensing here). Genuine safety item, not optional.

### Presence, games & banter

- **Mate recognition** ♻️ — Frigate face-rec on the garage cam → "Mark's here," his playlist starts, his tab opens. **Headcount scenes** via mmWave (1 = chill; 4+ = party mode). **Tab economy + ribbing** — Claude tracks rounds and banters "that's your round, Cam."
- **Sports mode / pub quiz / darts** — see signature moments 4 & 5.

### Proactive & practical

- **Proactive bartender** ♻️ — "Friday 5pm — open the bar?"; "Mark's 10 min out — start bar mode?"; "keg's low and the gin's nearly out, you're hosting Saturday — list updated." Opt-in **responsible pacing** tied to the calendar ("early start tomorrow — last one?").
- **Pre-warm for a session** ♻️ — set a bar night by voice/calendar → "bar's warming, ready in 20" (gives the cold detached garage a purpose-built answer).
- **Auto close-up** ♻️ — last person leaves + empty 15 min → everything off, heater off, **confirm garage locked**, Claude posts the night's stats (pints, top song, who came). Alert if the garage opens at odd hours.
- **Bridge to the house** ♻️ — route the **house doorbell + intercom** ("dinner's ready") to the bar (you won't hear them out there), and **path-light the route** house→garage at night.
- **Bar-night memory** ♻️ — Claude logs each session to RAG and produces a camera **highlight reel**; "remember the night we…" actually works.

### Resilience note

The bar leans on the **fibre link** for Claude/HA, so give the garage a **local fallback** — a few Zigbee buttons/scenes that work even if the tunnel drops — so the bar doesn't go dark mid-round. (Same dependency-loop thinking as the rest of the plan.)

### Cost

Mostly software/scenes on existing kit. New bits, roughly: WLED (~£25), NFC tags (~£5), keg flow meter + ESP32 (~£25), load cells + HX711 (~£20-40), CO2 leak sensor (~£35), smart scale (~£20). **~£100-150 for the lot**; the kegerator and auto-pour machine are separate splurges. **Phase 4-5**, after the house core is in.

## Focus mode / phone mindfulness

A gentle, opt-in system to stop the work-from-home phone doom-scroll — built to treat *attention* the way the rest of the plan treats *energy*. **Nudges over blocks**: environment design and a soft cue beat willpower, and it only ever fires in genuine work context so it never feels like surveillance.

### The constraints (and the no-install workarounds)

The work laptop is locked down (no HASS.Agent) and HA can't see the work calendar. Neither matters — the signals are substituted:

- **Work hours are fixed: a weekday schedule, 9:00–17:30 (Mon–Fri).** The focus regime **auto-arms at 9 and disarms at 5:30**, off all weekend. No daily input needed.
- **Lunch is the only spoken bit** — and it has a **default (e.g. 1:00–2:00)** you only override when it differs: "lunch at 12:30 today." Most days, say nothing.
- **No PC agent needed** — instead, the office **mmWave (FP2)** says *at desk*, and optionally the **work laptop's presence on Wi-Fi** (via the gateway / a ping tracker) is a rough *awake/working* proxy. No software on the work machine.
- **Phone signal** — the HA Companion app on the *personal* phone reports screen-on / pickups (and can flip the phone into a Focus / DND).

### The trigger

> weekday **09:00–17:30** · **not** in the lunch hour · **at the desk** (mmWave) · *(optionally laptop online)* · and the **personal phone screen has been on for X minutes** → nudge.

Outside those hours, at lunch, or away from the desk → silent; the phone's all yours.

### Interventions (all dodge the locked-down work PC)

- ➕ **Ambient desk light (the hero)** — a small LED/WLED that's **green while focused → amber → red** as phone-time climbs during a work block. Silent, glanceable, needs nothing on the laptop.
- ➕ **NFC focus-dock** — a tag on a phone stand: tap to start a **Pomodoro sprint** (25/5); phone goes face-down, and lifting it before the timer is the nudge.
- ♻️ **Auto-DND on the personal phone** during work blocks (HA Companion → Focus mode) — removes the *pull* so there's less to resist.
- ♻️ **Active prods run on the escalation ladder** (see below) — a gentle Voice PE chime / phone toast first, getting firmer only if ignored; throttled and self-suppressing.
- ♻️ **Weekly attention summary** — "phone-minutes per work hour," pickups, trend ("down to 14/hr from 22"). The energy-dashboard pattern aimed at attention.
- ♻️ **Carrot, not just stick** — hit the focus target → a small win (a light flourish, a streak, evening mode a touch earlier — or cheekily "you've earned a pint" routed to the garage bar).

### No gaming during work hours

A self-imposed rule — no gaming on the clock — that the smart home can actually help keep. **Easier to detect than the phone**, because the gaming kit is *yours*, not locked down:

**Signals (during the fixed 09:00–17:30 weekday window, minus lunch):**

- **HASS.Agent on the gaming PC** — it can go here (unlike the work laptop), reporting **foreground app** + **GPU load**, so "a game is *actually running*" is unambiguous (not just "PC is on" — avoids false positives from downloads/updates). This is the primary signal (the chosen KVM is a basic manual one, so HA can't read its state).
- **"Lounge gaming" scene / Steam Deck docked** — HA owns that scene, so it knows if you've wandered downstairs to stream.

**Interventions:** the work-hours guard, accountability light and weekly log all apply — but rather than a fixed firmness, they run on the **escalation ladder** below. The carrot still stands: a **clean work week** unlocks guilt-free evening/weekend gaming.

### Escalation ladder (decided)

Rather than one fixed firmness, the nudge **escalates the longer you ignore it** — gentle first, firmer only if you keep going. Same ladder for both phone-scrolling and gaming-on-the-clock:

1. **Subtle (immediate):** the accountability desk LED drifts **green → amber**. No sound, no message — just ambient.
2. **Gentle prod (~10 min ignored):** LED **red** + a single quiet cue — a desktop/phone toast or a soft **office Voice PE chime** ("back to it?"). Throttled, self-suppressing.
3. **Firm (still ignored):** a direct spoken/Claude message, and the **gaming triggers actively defer** — "fire up the gaming PC" / the lounge gaming scene refuse until 17:30 rather than just asking.
4. **Hard (opt-in, only if you want it):** a final step — e.g. a smart-plug cutoff of the gaming PC for the rest of the work block. Off by default; there if you decide you need the stick.

Escalation **resets** at lunch, at 17:30, and once you're back on task — it ratchets up *within* a lapse, never carries a grudge across the day.

Same keep-it-kind rules apply: only ever fires in work context, data local and personal to you.

### Keep-it-kind principles

- **Only nudges in real work context** (the fixed schedule minus lunch, at the desk) — no nagging evenings, weekends, lunch or away-from-desk.
- **Data stays local and personal** — your attention data lives on the local HA, tagged to you; Nova at the other desk doesn't see it. Not surveillance, a self-chosen nudge.

### Cost

New spend is just an **NFC tag (~£2)** and a **small desk LED (~£10-15)**. Everything else is config on the office kit (FP2, Voice PE, lighting, phone Companion) already in the plan. **Phase 3-4.**

## Signature behaviours

The "JARVIS feels" layer. These combine the infrastructure (voice + presence + lighting + heating + audio + cameras + Claude) into specific automations that feel like an attentive housemate rather than a smart-home dashboard. Most depend on phase 2-3 kit being in place; few need new hardware.

### Cinema mode plus

Triggers: voice ("movie time"), button, or auto-detected when Plex/Apple TV starts movie-length content.

**On engage:**

- Lounge: AVR up, Apple TV wake, lights to 5% warm, bay blinds close
- Whole-house dim: kitchen/hall to 10%, upstairs off unless mmWave shows occupancy
- Volume calibrated to time of day — post-10pm caps at -15dB
- **DND on Claude** — no announcements except urgent (doorbell, water leak, smoke)
- Phone push throttled via HA Companion DND
- Bathroom auto-lights to warm 30% on entry (no eye-shocking toilet breaks)

**During the film:**

- **Pause-aware:** lights up to 25% on pause, restored on resume
- **Doorway exit (mmWave):** small path-lighting raise in the route you're walking
- **Conversation detection:** sustained talking on the sofa → audio dips 3dB automatically
- **Doorbell ring** → film auto-pauses, feed pops onto the TV. Claude can voice-answer ("be a minute") through the doorbell speaker without you moving

**End:** auto on media-end or "stop cinema mode" → restores previous state.

Hardware: existing. Cost: **£0**. Phase 3.

### Whole-house intercom

**Targeted announcements:**

- "Tell Nova dinner's ready" → Claude finds Nova via phone + mmWave + last voice interaction, routes TTS to the nearest Voice PE
- Falls back to phone push if Nova's away
- Plays once, repeats louder after 30s, gives up after 2 tries

**Broadcasts:**

- "Broadcast: dinner everyone" → all Voice PEs simultaneously
- Bathroom and bedrooms opt-out per time of day (no Amazon parcel notifications at 6am in the bedroom)

**Reply tracking:**

- After "Nova, dinner's ready," Claude monitors target room's mic for response
- Relays "be right down" back to whoever sent the message

**Walkie-talkie mode (optional):**

- Hold a Zigbee button → push-to-talk → records and plays in chosen room
- Genuinely useful for "can you bring a drink up?" without shouting

Cost: **£0** (custom Python in the proactive service). Phase 3.

### Cooking mode + fridge inventory + meal planning

The big one. Three connected features that compound.

#### Cooking mode

Triggers: "I'm cooking" / "starting dinner" / "cooking [dish]".

- Kitchen lights to 5000K @ 100% — proper task lighting, you'll spot caramelising onions
- Other downstairs to complementary lower level
- Extractor fan on (Shelly relay)
- Recipe on kitchen tablet
- Cooking playlist on kitchen WiiM
- Voice PE in **attentive mode**: "next step", "timer 3 minutes pasta", "how much salt?", "substitute for pancetta?"
- Auto-deducts ingredients from inventory as you go

#### Fridge inventory — the recommended approach

**Grocy** (free, open-source, Docker on Unraid) + **receipt OCR via phone**.

- Grocy is the standard for HA-integrated household inventory. Tracks stock, expiry, batteries, chores, recipes.
- Phone shortcut: photo of receipt → shares to HA → custom Python uses Claude vision to parse line-items → adds to Grocy. ~10 seconds per shop.
- Voice deduction while cooking: "Claude, I'm using the last 2 eggs and the chicken" → deducts in Grocy
- Optional USB barcode scanner (~£15) by the fridge for awkward items

#### Meal planning + shopping list

Weekly flow (Saturday morning):

- Claude reads Grocy inventory, your dietary preferences (per-person), recent meals, expiring items, calendar (busy nights = quick meals)
- Generates a week's meal plan, e.g.:
  - Mon (gym night for Cam): quick stir-fry — uses up expiring broccoli
  - Tue: carbonara — eggs need using
  - Wed: leftovers
  - Thu (Nova late): soup + bread
  - Fri: pizza + salad
  - Sat: roast chicken
  - Sun: chicken curry from leftovers

**Cleverness:**

- Considers preferences — Cam likes spicy, Nova doesn't → averages or alternates
- Skips repetition
- Uses up expiring items
- Adapts to gym/late-working nights
- Shopping list auto-generates *only what's not in Grocy*

Voice: "show me Saturday's meal plan", "swap Tuesday's", "what's for dinner?"

Cost: **£0** software, £15 optional barcode scanner. Real cost is setup time (2-4 evenings to populate Grocy + dial in the meal plan prompt). Pays back continuously. Phase 4.

### Face-recognised doorbell with Claude responses

Doorbell becomes contextual rather than dumb.

**Known person at the door:**

- Frigate face recognition identifies them
- Claude generates a contextual greeting via doorbell speaker:
  - "Hi Mum, Cam's in the kitchen, I'll let him know"
  - "Hey Mark — Cam said you were coming over. He's on his way down"
- Simultaneously: Voice PE in the relevant room announces who's there

**Stranger:**

- Generic greeting: "Hi, can I help? Cam and Nova are inside, please ring the bell"
- Push notification with snapshot
- More cautious script late at night: "We're recording — please state your business"

**Voice talk-back from inside:**

- "Tell whoever's at the door I'll be 2 minutes" → plays through doorbell speaker
- "Ask if they need a signature" → routes question, recipient answers via doorbell mic, Claude relays back

**Repeat-visitor recognition:**

- Same unknown face 3+ times this month → flagged as "frequent unknown"
- Useful for noticing surveillance patterns

Cost: **£0** (existing kit). Phase 3.

### Delivery handling

Frigate detects person + parcel-shaped object + sometimes vehicle (mail van, Amazon, DPD).

**Standard delivery (no signature):**

- Detected approaching with package, no ring → Claude through doorbell: "Leave it by the porch please, you're being recorded. Thanks!"
- Snapshot saved with timestamp
- Push notification to phones: "package delivered at 14:23"
- Optional: ID the courier from uniform/vehicle, added to record

**Signature required:**

- Ring + courier context → immediate phone alert
- Quick voice options: "I'll be 30 seconds" or "open the door"
- Nobody home → pre-set: "leave with neighbour at number X"

**Package log:**

- Every event saved to log (HA dashboard + shared todo list)
- "Did my package arrive?" voice query → reads recent deliveries with timestamps
- 30-day searchable archive

**Missing / theft:**

- Package placed, no follow-up "collected" within hours → flagged
- Stranger taking package who isn't a known household member → alert

Cost: **£0**. Phase 3-4.

### Circadian lighting

Auto-shifts colour temperature through the day to match natural rhythm.

| Time | Colour temp | Brightness |
|---|---|---|
| 6-8am | 4500K | Low → high (gentle wake) |
| 9am-3pm | 5000K | High (alertness) |
| 3-6pm | 3500K | High |
| 6-9pm | 2700K | Medium (wind-down) |
| 9-11pm | 2200K | Low |
| 11pm+ | 1800K red shift | Very low |

**Per-room overrides:**

- Bathroom: stays cool when occupied (accurate lighting)
- Lounge: holds state during cinema mode
- Office (Bed 3): stays cool while you're working, even past sunset

**Layered extras:**

- **Wake-up gradual brighten:** bedroom lights start at 5% red 30 min before alarm, climb to 60% cool white at alarm. People throw their alarms away after this.
- **Sleep-mode night lights:** mmWave detects bedroom/landing/bathroom between midnight-6am → 2% dim red. Toilet trips don't wreck night vision.
- **Sunset chasing:** winter, indoor lights anticipate the dark gloom from 3:30pm.

Tech: HACS Adaptive Lighting integration (free).

Cost: **£0**. All planned bulbs/relays already support colour temp. Phase 2.

### Per-room CO2 + VOC monitoring

Cheap, high-impact on how you feel.

**Sensor options:**

- **IKEA Vindstyrka** (~£40) — temp, humidity, PM2.5, VOC, CO2-eq. Zigbee, built-in display.
- **Aqara TVOC sensor** (~£35) — temp, humidity, TVOC. Zigbee.
- **Airthings View Plus** (~£250) — proper CO2 + radon + PM2.5 + VOC. Premium pick for master bedroom only.

**Deployment:** one per main room — lounge, bedrooms, kitchen, conservatory, optional office.

**Automations:**

- **Bedroom CO2 climbs overnight** → crack motorised blinds slightly at 4am, or mention in wake-up briefing
- **Kitchen VOCs spike during cooking** → auto-bump extractor fan
- **Lounge stuffy after film night** → "lounge is at 1400ppm CO2, want to air it out before bed?"
- **Bathroom humidity stuck high** → extractor health alert
- **Trends:** "bedroom CO2 worse this week — door closed all week?"

People sleep noticeably better with proper ventilation. CO2 over 1000ppm during sleep is associated with grogginess.

Cost: **~£200-280** for 5-7 rooms with Vindstyrkas. Optional +£250 Airthings master. Phase 3.

### Driveway sensor

Two approaches, ideally combined.

**ALPR (license plate recognition):**

- **CodeProject.AI** (free, Docker on Unraid CPU) or **Plate Recognizer** (cloud, free tier usually enough)
- Trains on your specific plates (Cam, Nova, family, friends)
- Triggers: "Cam's car arrived", "Nova just left", "unknown plate at 11pm — recording"

**Driveway beam (most reliable):**

- Aqara T1 outdoor sensor (~£40) or wired IR beam
- Zero false positives, no AI required
- Catches anything crossing it

**Recommended: beam + ALPR.** Beam catches reliably; ALPR adds identity.

**Automations:**

- Cam's car detected entering → office preheat, lights to welcome scene, porch + hall warm 40% post-9pm
- Departure → "away" mode auto-engages if no other phones present
- Unknown car → snapshot, alert, higher-rate recording
- Repeat unknown plate (3+ times) → flagged as potential pattern

Cost: **~£30-40 beam** + free ALPR. Phase 3.

### Smart irrigation + plant care

Two flavours: outdoor garden, indoor plants. Indoor is the cooler one.

**Outdoor (if/when irrigation installed):**

- **OpenSprinkler** (~£150) — open-source, HA-integrated. Right answer for HA users.
- **Moisture sensors per bed:** Aqara T1 / Ecowitt (~£15-20 each)
- Skip watering if rained recently or forecast rain
- Different zones (lawn, veg bed, borders) on different schedules

**Indoor — per-plant Claude care:**

- **Xiaomi Mi Flora / FlowerCare** sensors (~£15-20 each) — soil moisture, light, temperature, soil EC. Bluetooth.
- **Bluetooth Proxy** (cheap ESP32, ~£15) in each main room reads sensors and forwards to HA
- **Plant profile database:** Open Plantbook API has 10,000+ species with optimal moisture/light/temp ranges
- Add a plant by voice: "Claude, this new plant is a Monstera deliciosa" → Claude finds profile, configures sensor thresholds

**Daily Claude check:**

- Morning briefing: "your monstera and the snake plant in the lounge need water today"
- "The fiddle leaf hasn't seen enough light this week — move closer to the window?"
- "Bedroom orchid is overwatered, hold off 3 days"
- New-plant onboarding via voice
- Death detection: sensor flat for 2 weeks → "is this plant still alive?"

Plants die because nobody notices in time. With this, Claude notices.

Cost:

- Indoor only (10 plants + BT proxy): **~£200**
- Outdoor irrigation: **+£150-300**
- Combined: ~£350-500

Phase 4 (indoor); phase 5 (outdoor, if installed).

### Guest mode

Triggers: voice ("guests coming Friday for 3 nights"), calendar event tagged "guests", or manual toggle.

**When active:**

- Temporary door code generated with expiry
- Guest bedroom climate pre-warmed to neutral target
- WiFi guest network QR code on kitchen tablet for easy sharing
- **Voice privacy:** guest bedroom voice doesn't trigger personal lookups (no reading Cam's calendar by accident)
- **Proactive Claude scaled back** — no personal announcements while guests are home
- Lighting defaults to more neutral (some people find warm/dim weird)
- Front door auto-unlock for face recognition **disabled** (guests don't expect that)

**Auto-disables** when guests' phone presence leaves AND date passes.

Cost: **£0**. Phase 4.

### Smart laundry workflow

Smart plugs on washer + dryer (existing Meross owned).

**Cycle complete detection** (already in smart plug section) — power drops below 5W after running → "washing's done" TTS in current room.

**Forgotten laundry escalation:**

- 30 min later, washer still has wet clothes: toast on PC if active + push to phone
- 2 hours later: stronger reminder ("towels need rewashing if you forget much longer")

**Workflow nudges:**

- Washer done → "want a reminder in 10 min to swap to dryer?"
- Dryer done → "go fold while warm" (works best with mmWave to know which room you're in)

**Octopus Agile integration (if subscribed):**

- "Run a wash today" → Claude picks cheapest electricity slot, activates plug at that time

**Wash-day awareness:**

- Tracks frequency: "haven't done a wash in 10 days, things piling up?"
- Day-of-week pattern: "usually Sunday — want to start one?"

Cost: existing kit. Phase 4 with smart plug deployment.

### Energy + cost dashboards

Beyond raw Shelly EM numbers — actual useful insights.

**Components:**

- Shelly EM (planned) for whole-house + circuit-level
- Per-appliance smart plugs (washer, dryer, immersion, TV stack)
- **Octopus Agile API** (free if on Agile tariff) — half-hourly pricing
- Solar export tracking (if/when added)

**Dashboards (HA Lovelace):**

- **Live overview:** what's drawing power right now by zone/appliance
- **Today vs typical:** "you're £2.30 over typical for this hour"
- **Month projection:** "on track for £140 vs £120 last month"
- **Highest cost contributors this week** — ranked list
- **Per-appliance cost:** "dishwasher ~£0.18/cycle"
- **Carbon intensity** (National Grid API): green/amber/red
- **Best-time-to-run advice:** "wait 90 min for cheapest 3-hour window"

**Proactive features:**

- **Anomaly alerts:** "boiler usage up 30% vs last week" → suggests service
- **Phantom load detection:** "80W idle overnight — something left on?"
- **Optimisation nudges:** "running washer + dryer simultaneously costs 2× — stagger?"
- **Monthly auto-summary**

If on Octopus Agile, this combo can save £100-300/year by auto-scheduling high-load appliances to cheapest slots.

Cost: **£0** software (Shelly EM already in plan, APIs free). Phase 3.

### Calendar-driven anticipation

Google Calendar integration (built into HA, free).

**Meeting prep:**

- 5 min before a meeting: office lights to focus mode, Claude DND, music auto-pauses
- "9am Zoom" detected → camera on, lighting calibrated for video
- 15 min before in-person: "leave in 15 min" with current traffic

**Travel:**

- Flight in calendar → "away mode" auto-engages from departure, returns from arrival
- Train ticket → arrival window watched, "back-from-trip" prep starts before you're home (heating, lights)

**Social context:**

- "Date night" event → cinema mode primed at the right time, ambient music
- "Friends over" → guest mode primed, drinks fridge cooler, lighting more social

**Routine awareness:**

- Recurring "gym Tue/Thu 7am" → wake earlier those days, briefing adjusted, kit-bag reminder Mon/Wed evening
- "Shop Saturday morning" → meal plan + list ready by Friday 9am

**Wind-down:**

- Last meeting of the day ends → "you're done — evening mode" → warm lights, music suggested

**Health/medical:**

- "Dentist 2pm tomorrow" → 90-min reminder with drive time

Cost: **£0**. Phase 3 with proactive Claude service.

### Photo digest

Daily/weekly summary of "what happened around the house" using Frigate snapshots + face recognition.

**Daily digest (delivered evenings):**

- 5-10 highlight frames from CCTV + doorbell events
- Claude generates captions:
  - "Cam came home at 6:23pm"
  - "Postman delivered at 11:15"
  - "Cat on the windowsill for 2 hours"
- Filter: skips routine, focuses on visitors, deliveries, anything unusual

**Weekly digest (Sunday morning):**

- Best of the week
- Sent as a notification with image carousel on phones

**Variations:**

- Time-lapse compilations (sunrise to sunset garden over a week)
- Bird-feeder log if Frigate trains on birds (genuinely doable)
- Cat / dog movement patterns if applicable

Privacy filter: option to exclude specific cameras (none planned in private spaces anyway).

Cost: **£0** — existing kit + light Claude API usage for captions. Phase 4.

### Cost summary — signature behaviours hardware

| Item | Est. |
|---|---|
| CO2/VOC sensors (5-7 rooms, Vindstyrkas) | £200-280 |
| Optional Airthings master bedroom | £250 |
| Indoor plant sensors (10) + Bluetooth proxy | £200 |
| Driveway beam sensor | £30-40 |
| Optional barcode scanner (Grocy) | £15 |
| Outdoor irrigation (if installed) | £150-300 |
| **Hardware total (without optional)** | **~£430-520** |
| **Hardware total (with optional)** | **~£845-1,085** |

Everything else is software/configuration time. Ongoing Claude API maybe +£2-3/month for the proactive features layered on top.

### Phasing summary

| Behaviour | Phase | Hardware needed? |
|---|---|---|
| Circadian lighting | 2 | No (existing bulbs) |
| Cinema mode plus | 3 | No (existing) |
| Whole-house intercom | 3 | No |
| Face-recognised doorbell | 3 | No (Frigate + doorbell) |
| Driveway sensor | 3 | Beam (~£40) |
| CO2/VOC monitoring | 3 | Sensors (~£200-280) |
| Energy + cost dashboards | 3 | No (Shelly EM in plan) |
| Calendar-driven anticipation | 3 | No |
| Cooking mode + Grocy + meal plan | 4 | Optional barcode scanner |
| Smart laundry workflow | 4 | No (smart plugs in plan) |
| Delivery handling | 4 | No |
| Guest mode | 4 | No |
| Photo digest | 4 | No |
| Indoor plant care | 4 | Sensors (~£200) |
| Outdoor irrigation | 5 (if installed) | OpenSprinkler (~£150) |

## Additions to cabling scope (NOT in current spec)

The cabling spec covers data, AV and audio for the house but does **not** include camera or doorbell runs. These need adding to the scope **before first fix**, while walls are open. Each is a Cat6 home run terminating at the head-end (Bedroom 3) for PoE.

| Run | Purpose | Notes |
|---|---|---|
| Front high (eave / soffit) | Front camera | Covers porch, bays, driveway |
| Rear high (above conservatory) | Rear camera | Garden coverage |
| Driveway side (house-mounted) | Driveway-side camera | Looks down the side passage toward the garage (confirmed — there's no passage on the opposite side) |
| Garage exterior | Above-garage camera | Garage-mounted, looking back at the house; shares the garage fibre conduit |
| Garage interior (optional) | Interior camera | Workshop / storage |
| Front door (low, near doorbell) | PoE doorbell | Cat6 to existing doorbell location |
| Lounge speaker positions | 5.1 surround | Speaker cable, not Cat6 — see Audio section (5.1 only, no Atmos) |
| **Every potential blind position** | Blind motor power option | Low-voltage DC / conduit / draw-string to every blind head — even though only the **bedrooms** are funded today, the *option* on the bonus tiers (lounge bay, conservatory, dining, kitchen) is only preserved while walls are open. |
| **AC rough-in** (master, lounge, bed 2/office, conservatory) | Refrigerant + comms + condensate + outdoor power | Pipe routes (8mm + 16mm pair, capped), 4-core comms, gravity condensate drain, and a dedicated outdoor-unit circuit — run **now** even though the AC units are deferred (see Cooling section). Adding later means ripped walls. |

**Plus a sensible "spare" or two** — pull extra Cat6 to any wall that might host a future TV, desk or wall-mounted tablet. Cheap now, impossible later.

**Add to "Information required before commencement" in the spec:**

- Camera positions confirmed (front, rear, sides, garage)
- Doorbell location and power source confirmed
- Audio architecture decision: networked endpoints (WiiM/AVR) — answered, see Audio section
- AV extender choice for the HDMI-over-Cat6 runs (still open)

## Pre-move-in wiring — additional considerations

Most cable runs are already in the spec. The remaining decisions are about **active kit placement and power**, not cable pulls:

- **Head-end is Bedroom 3** (per spec). Unraid sits here too — same room as patch panel + switch + voice node. Needs the mains spur, ventilation and clear cable route the spec already calls out.
- **UPS at the head-end is mandatory, not optional.** Unraid hates dirty power and brownout-induced unclean shutdowns can corrupt the array. Size for the head-end load (switch + Unraid + Decos + media converter + voice node): 1000-1500VA online or line-interactive is the right shape. APC Back-UPS Pro, CyberPower CP1500, or Eaton 5E equivalent. Budget £150-200. Position and socket are already called out in cabling spec §4 Rev B.
- **PoE switch** at head-end. Sized for: cameras (4-6), doorbell, voice nodes (6+), Decos (3 wired), AVR if networked. **Target 16-port PoE+ minimum**, e.g. Unifi USW-Lite-16-PoE or TP-Link TL-SG1218MP.
- **Speaker cable** to lounge surround / Atmos positions — separate from the Cat6 spec, runs while walls are open.
- **Mains for voice nodes** — each room with a Voice PE needs a socket nearby. Most rooms will have this anyway; flag any awkward locations (e.g. landing) to the sparky.
- **Power for Decos** — hall, landing, garage. Decos aren't PoE. Already noted in spec but worth checking sockets exist at planned Deco positions.

## Resilience: power, backup & fallback

The house *runs on* Unraid + the network + the Claude pipeline. Each needs a defined failure story — this was the biggest non-safety gap in the original plan.

### Power / UPS

- **Size the head-end UPS by *runtime*, not just VA.** "1000-1500VA" names apparent power, not minutes. With Unraid + a loaded PoE switch (cameras can pull 30-60W+) + Decos + media converter, a 1500VA unit may only give a few minutes. Compute the actual watt load and target a defined runtime (**≥15 min** to ride out blips + trigger a clean shutdown).
- **🔁 The shutdown must be driven by Unraid, not HA (dependency-loop trap).** Don't make "clean shutdown on power loss" an *HA automation* — HA runs *on* the box it would be shutting down, and a hung/updating HA may never fire it, risking a dirty stop and a corrupt array. Use **Unraid's own native UPS/NUT daemon** to self-shut-down; HA's role is *notification only*.
- **Consider a second small UPS for the network gear** (UCG-Max + core switch) so the **SD-WAN / remote access / off-site watchdog reachability stays up** even while the server is shutting down or rebooting.

### Backup & disaster recovery (3-2-1, with a *tested* restore)

Today only "a Qdrant volume backup" exists. That's not a backup strategy. Define:

- **Home Assistant** — automated, versioned full snapshots (config + DB + secrets), local **and** off-site.
- **Frigate** — config + recordings policy (recordings are replaceable; config and the event DB are not).
- **Memory layer** — Qdrant volume + the structured SQLite store.
- **Immich (family photos)** — the irreplaceable one. Back up the **Immich library + its Postgres DB**, **client-side encrypted**, **off-site to Selby over the SD-WAN**. Use **restic** or **borg** (or `rclone` with crypt) so the data is encrypted *before* it leaves the house — dad hosts the bytes but **cannot read the photos**. Keep a local fast copy too (3-2-1: ≥3 copies, 2 media, 1 off-site).
- **Off-site target = the Selby SD-WAN** for HA snapshots and the Immich/memory backups; private link, no public exposure.
- **🔁 Store the decryption key *off the box* (dependency-loop trap).** restic/borg encrypt client-side — but if the only copy of the passphrase lives on the Unraid box that died/burned/was stolen, the Selby backup is **unrecoverable ciphertext**. Keep the passphrase out-of-band: a password manager that syncs off-box, a paper copy, and a sealed copy at Selby. The restore drill must start *from the key store*, not from the box.
- **Rehearse a restore.** A backup you've never restored is a hope, not a plan. Do one real restore drill and write a short runbook.

### Graceful degradation & fallbacks

- **"Claude API slow/down" fallback is a Phase-1 deliverable, not an open question.** When the API times out, fall back to **HA's built-in local intents** for the essentials — lights, "goodnight", and a confirmed unlock — so the house still works offline.
- **"HA / Unraid down" story:** keep **physical switches live** (never fully remove dumb control); document that voice + automations degrade gracefully and the house remains hand-operable.
- **Head-end heat:** Bedroom 3 holds Unraid + a loaded PoE switch + UPS + patch panel — a real heat load. Spec **active extraction + a temperature alert** for that room specifically (PoE switches run hot under load); don't rely on "a quiet fan." **🔁 But note the loop:** that temp alert runs on HA/Unraid *inside* the head-end, so a thermal runaway that cooks the server also kills the warning. Give the head-end an **independent** alert path (a UPS/PDU temperature probe, or a sensor that alerts via the gateway/external watchdog), or accept that the dead-man's-switch only tells you *after* it's died.

### Dependency loops & single points of failure

A dedicated pass for the "depends on the very thing it's meant to protect/observe/recover" class of bug — the trap the HA-on-Unraid monitoring fell into. (Backup-key, UPS-shutdown and head-end-thermal loops are covered above.)

- **🔁 Remote-recovery access must not live on the box you're recovering.** If the Tailscale node runs as an Unraid container, then when Unraid is down you **can't VPN in to fix it**. Run the recovery VPN on the **UCG-Max** (UniFi's built-in WireGuard / Teleport) — independent of Unraid, and kept alive by the network UPS. Keep Tailscale too, but don't let it be the *only* way in.
- **🔁 Don't single-home DNS on the everything-box.** The classic next step is Pi-hole/AdGuard on Unraid — and then when Unraid is down the **whole house (and your phones) lose name resolution**, breaking even unrelated internet. Set a fallback resolver on the gateway/clients (or run DNS on the gateway), so a server outage doesn't take the internet with it.
- **🔁 Keep a doorbell chime that works with HA dead.** If the PoE doorbell's only alert path is Frigate/HA, an outage = a **silent doorbell**. Ensure a standalone/local chime so visitors still register without the smart stack.
- **🔁 Guest mode can't key off guest *presence*.** Guests aren't in your HA Companion, so "auto-disable when their phone leaves" is unreliable for exactly the people it's for. Drive guest mode off a **date window + a manual/host toggle**, not the presence of an untracked phone.
- **⚠️ One UCG-Max is the whole network (single point of failure).** Its death simultaneously takes internet, the SD-WAN, VLAN routing, remote access *and* the off-site watchdog's reachability — and the Decos can't route without it. Treat it as a conscious accepted risk: keep the old **Deco-as-router config documented as break-glass** (or a cheap spare gateway), so a dead UCG-Max is a swap, not a rebuild.
- See also: the **confirmed-unlock** and **multi-turn confirmation** loops in the Locks section and the integration doc — the security gate and the "yes" antecedent must not depend on a cloud/service that can be down.

### Monitoring beyond the server

The Unraid health section covers the box; also watch the **edges**: UCG-Max status, **SD-WAN tunnel up/down**, **WAN reachability**, and a **Claude-API error-rate** counter.

**Split by who's alerting, though** — anything reported *by HA* (push / toast / proactive Claude) only works while HA is up, so it can't tell you HA/Unraid is down. That "is it even up?" question belongs to the **independent off-site watchdog** (Healthchecks dead-man's-switch + Uptime Kuma at Selby + gateway-level offline alerts) described in [Server health monitoring → "Watching the watcher"](#server-health-monitoring-unraid). Use HA's rails for *detail while running*; the external watchdog for *availability*.

## Operations: network scheme, accounts & updates

### Network & IP scheme + as-built docs

- **Define the VLAN/IP scheme now** (IoT / voice / CCTV / guest / main), **non-overlapping with Selby** (e.g. `10.10.x` here, `10.20.x` there) — it's a prerequisite for the SD-WAN, guest isolation and the camera egress-blocking the privacy plan relies on.
- **🎮 Keep the gaming PC and the Steam Deck on the *same* VLAN** (the main/trusted one). Game-stream discovery (Steam Remote Play / Moonlight) uses broadcast/mDNS and silently breaks across VLANs — so don't split the office gaming PC from the lounge Deck dock. If they must be segmented, you'll need an **mDNS reflector** + the specific Remote Play/Moonlight ports opened on the UCG-Max. Bake this into the scheme so the segmentation doesn't quietly kill streaming. (See "Game streaming (office → lounge)".)
- Keep **as-built documentation**: a **patch-panel port map**, a **device/IP inventory**, and the VLAN plan. Cheap to do as you go, painful to reconstruct later. (The "friendly names" convention is good; this is the infrastructure equivalent.)

### Accounts, credentials & access

- **Secrets management** — decide where the Claude/ElevenLabs API keys, lock challenge tokens and UniFi/Unraid/Grocy/Immich logins live (HA `secrets.yaml` hygiene + a password manager), and a rotation policy.
- **Multi-admin + break-glass** — two cohabitants (Cam + Nova) plus a remote co-admin (dad, via the SD-WAN). Define HA admin accounts with **2FA** and a **recovery/break-glass** procedure if the primary owner is unavailable.
- **Per-person capability model** — who can do *what* by voice? Lock/unlock, heating, alarm disarm and "away" should be gated by person (and guests/children must **not** trigger Tier-2 actions). This is the voice-ID + presence work made into a policy.

### Software updates & change management

- **Don't auto-update the house.** HA's `x.0` releases break things; Frigate/Qdrant/Ollama move fast. **Pin container versions**, read release notes, and test major HA updates against a **backup/VM clone** before rolling forward. A broken update at 6pm shouldn't mean no lights.

### Privacy / compliance note (UK)

- Face recognition of visitors + **ALPR** of plates + 30-day digests edge into **UK GDPR** territory once you process/retain footage of non-household members or the street beyond your boundary. Note the **domestic-purposes exemption limits**, add **recording signage**, and set a **retention + lawful-basis** line for ALPR and face data. (See also the Privacy section below.)

## Privacy

### Cameras

- No cameras in bedrooms, bathroom or any private interior space. Coverage is exterior-only plus optional garage interior.
- 30-day event retention by default; 48hr continuous buffer. Configurable per camera.
- No cloud recording. Frigate is local-only on Unraid.
- Face recognition data stays local. Models trained on household members + invited regulars only.

### Voice

- Physical mute switch on every voice node (HA Voice PE has one).
- Wake word runs locally; audio only leaves the room after wake-word fires.
- Avoid wake words close to "Alexa" / "Hey Google" — neighbour and advert crosstalk.
- Voice transcripts are not retained beyond the conversation window. The HA conversation log is local-only.
- Only the post-wake-word transcribed text leaves the house (Claude API call). Raw audio never does.

### Guests

- Guest mode disables face-rec auto-unlock and personal proactive announcements.
- Guest WiFi is on a separate VLAN (see network segmentation).
- Face recognition does not silently identify or log guests.

### Network segmentation

- IoT/voice/CCTV/guest each on separate VLANs.
- Cameras specifically have no internet egress (firewalled to local NVR only).
- Work-from-home traffic on the main LAN, isolated from IoT.

### Data sovereignty summary

| Data type | Where it lives | Leaves the house? |
|-----------|----------------|-------------------|
| Camera footage | Unraid (Frigate) | No |
| Face recognition models | Unraid | No |
| Voice audio (post wake-word) | Voice PE → HA → discarded | No (raw audio); Yes (transcribed text to Claude) |
| Voice transcripts | HA local logs | Transcribed text to Claude API only |
| Sensor data (mmWave, temp, etc) | HA local DB | No |
| Smart plug power data | HA local DB | No |
| HA Companion phone presence | HA local | No |
| Claude conversation context | Claude API | Yes (turn-scoped) |

## Phased rollout

### Phase 0 — Pre-move testbed (current home)

The aim: prove the full pipeline (voice → Claude → tool calls → response) and the RAG memory layer on existing kit, in the current rented home, before the move. Everything bought here travels to Woodhouse.

- HA on existing Unraid (Docker or VM)
- 1× HA Voice PE in living room (~£55)
- Sonoff ZBDongle-E to start the Zigbee mesh (~£25) — moves with you
- 2× Innr Zigbee bulbs (~£30) — moves with you
- Migrate existing 4× Govee H6008 into HA (LAN API or cloud — no extra hardware)
- Claude API integration + full RAG memory layer (Qdrant + Ollama, free on existing Unraid)
- Validate end-to-end: wake word → STT → Claude → tool call → TTS
- Validate the cross-turn confirmation flow that motivated the RAG decision
- Sleep Cycle integration via HomeKit Bridge if pursued

**Total spend: ~£115.** Optional 2nd Voice PE (~£55) for multi-room handoff testing.

**Explicitly NOT buying yet:** UPS (sized for Woodhouse head-end), mmWave sensors (placement learning doesn't transfer), smart locks (rented doors), cameras + PoE switch (needs cabling and permanent install), wall tablets (flush-mount infrastructure), AV/audio gear (5.1 install). All of these wait until move.

**WiFi backhaul note:** Voice PE works fine on a WiFi-only Deco mesh. The Cat6 backhaul at Woodhouse is for latency margin and reliability, not a hard prerequisite — testbed can prove the pipeline on the current home's WiFi setup.

### Phase 1 — Prove the pipeline (post-move)

- **UPS in place at head-end** before Unraid is first powered on
- Unraid: install HA + Frigate
- Add Zigbee dongle
- 2× HA Voice PE: kitchen + master bedroom
- 4 Govee bulbs migrated into HA
- Claude API integration via HA tool use
- Wake word + STT + TTS + scene control working end to end
- **Memory layer** in place — Qdrant + RAG direct (jump path chosen, see [Memory architecture](./claude_ha_integration.md#memory-architecture-rag--structured))

### Phase 2 — Core coverage

- Add lounge, garage voice nodes
- PoE switch + first 2-3 cameras (front + back)
- Doorbell
- Front door lock
- Lounge lighting upgrade to Zigbee
- **First wall tablet** (kitchen)
- **Face recognition** set up in Frigate (free, just train it)
- **Phone presence** via HA Companion app on all phones
- **Frigate storage setup** — dedicated Unraid share, SSD cache, sized for 4 cameras
- **First Aqara FP2** (lounge) — proves mmWave concept
- **Heating control online** — OpenTherm Gateway, 5× Aqara E1 TRVs on upstairs radiators

### Phase 3 — Whole house

- Remaining bedroom voice nodes
- Remaining cameras
- Back door lock
- Blinds (start with bays or conservatory)
- Scene buttons on landing
- Motion sensors, contact sensors, presence detection
- **Remaining wall tablets** (hall + optional bedroom)
- **Smart mirror** in bathroom (DIY)
- **Scene buttons** next to mirror, plus more around the house
- **Proactive Claude service** deployed (custom Python on Unraid)
- **Energy monitoring** via Shelly EM on consumer unit
- **Second FP2** (master bedroom), optional FP1E (office)
- **PC integration** — HASS.Agent on Windows PC, pinned browser dashboard, optional custom Tauri overlay app
- **UFH zone control** — Shelly relays on lounge + dining actuators, Aqara temp sensors, HA Generic Thermostats configured

### Phase 4 — Extras

- Smart plugs for dumb appliances
- Robot vacuum integration
- Garden / outbuilding sensors
- **Garage door automation** (if car-in-garage commitment is made)
- Voice biometrics (optional, Picovoice Eagle or similar)
- Window motors (only if scope decided in phase 1 and cable provision made)

## Open questions

**Answered by the cabling spec:**

- ~~Unraid final location~~ → Bedroom 3 (with the head-end)
- ~~Garage cable run~~ → fibre, in duct, during groundworks (per spec §8)
- ~~Voice node wiring~~ → wired Cat6 from existing drops
- ~~Conservatory: living space or pass-through?~~ → **living space** (7th voice node, audio endpoint, full kit)
- ~~Wet room → bathroom?~~ → **planned conversion to standard bathroom** (simplifies presence sensing — FP1E direct)
- ~~Wall tablet locations~~ → **kitchen, lounge, hall, master bedroom (4 confirmed)**
- ~~Camera count/positions~~ → **4 + doorbell: front, rear (above conservatory), side passage, garage exterior, plus doorbell on front door**
- ~~Office location~~ → **Bedroom 2** (two desks for Cam + Nova). Bedroom 3 is head-end only.
- ~~Property orientation~~ → **front = south**. Master bedroom + lounge south-facing. Conservatory east-facing.
- ~~Back door / entry points~~ → **three entries**: front (porch), conservatory hinged door (S wall), dining French doors (N wall). All three get smart locks.
- ~~Remote access~~ → **Tailscale** already in place.
- ~~Doorbell location~~ → **front door**, confirmed.
- ~~Outdoor coverage extent~~ → **patio only.** Future external AP provision stays in cabling spec.
- ~~Side-passage camera feasibility~~ → **no passage opposite garage**; driveway-side + above-garage-door cameras confirmed in scope instead.
- ~~Lounge Atmos: in-ceiling vs upfiring~~ → **5.1 only.** No Atmos cable runs, no upfiring modules.
- ~~Window motors candidates~~ → **every non-conservatory window gets motor + blind** (~7-8 windows).
- ~~Desk layout in Bed 2~~ → **side-by-side on wall opposite window.** 4-6 Cat6 drops on the desk wall (cabling spec Rev C amendment).
- ~~FP2 mounting position in Bed 2~~ → **ceiling above middle of room** (or wall-mount on window wall facing desks). Zones split left/right.

**Still open — blocking or near-blocking:**

- [ ] House-to-garage distance and route measured (spec §11 blocker)
- [ ] AV extender brand chosen — affects Cat6 category/screening (spec §11 blocker)
- [ ] **Cabling spec Rev C amendment**: Bedroom 2 drops 2 → 4-6 on the desk wall

**Still open — needs deciding soon:**

- [ ] UPS model and sizing confirmed before head-end commissioning
- [ ] VLAN scheme defined (IoT / voice / CCTV / guest / main) — implementation now easy with the UCG-Max, just needs the scheme designed. **Must be planned across both sites** (Woodhouse + Selby) with non-overlapping subnets so the Site Magic SD-WAN routes don't collide — e.g. `10.10.x` here, `10.20.x` in Selby.
- [x] ~~**UniFi gateway model confirmed** from dad~~ → **resolved: UniFi Cloud Gateway Max (UCG-Max).** No built-in PoE → 16-port PoE switch stays required; no built-in WiFi → Decos stay as APs. Runs Site Magic SD-WAN for the Selby link (see "Networking").
- [ ] **Inter-site SD-WAN (Selby)** — confirm both sites are under one UniFi account, then enable Site Magic. Woodhouse public dynamic IP is the reachable endpoint (Selby CGNAT is fine). Blocker is only the cross-site subnet scheme above.
- [ ] Garage heated/insulated enough for voice node electronics in winter?
- [x] ~~AVR target brand (Denon/Marantz vs Yamaha)~~ → **resolved: deal-led** — buy whichever of HEOS (Denon/Marantz) or MusicCast (Yamaha) comes up cheap and clean secondhand; both integrate well with HA.
- [ ] Lounge speaker positions chalked on wall before plastering (5.1 positions only)
- [ ] Blind motor power: mains vs battery decision (deferred to contractor walk-through — but provision/conduit must be in place by then)
- [ ] **Window actuator power approach**: battery (~£200/window, 6-12mo battery) vs mains-powered (~£400/window, needs 13A spurs in electrical scope) vs PoE (rare, needs Cat6 spec amendment)
- [ ] **Window types confirmed** on site survey for motor compatibility (casement/tilt-and-turn straightforward; sash + bay sections need specialist actuators)
- [ ] Second front-of-house camera on opposite corner? *(My rec: skip — central front + doorbell already cover entry)*
- [ ] Conservatory blind count and style (thermal/pleated vs standard roller) — affects budget significantly
- [ ] Car-in-garage decision (affects garage door automation in phase 4)
- [ ] Boiler model confirmed with OpenTherm support — Vaillant ecoTEC plus / Worcester Greenstar / Ideal Vogue / Viessmann Vitodens
- [ ] UFH manifold spec — confirm 2 separate zones (lounge + dining) at install
- [ ] Conservatory heating — included in UFH (third zone), separate rad, or electric panel?

## Cost ballpark (very rough, UK, phase 1 only)

| Item | Est. |
|---|---|
| Zigbee dongle | £20 |
| 2× HA Voice PE | £110 |
| Coral USB TPU | £60 |
| Misc cables / power | £30 |
| **Phase 1 hardware total** | **~£220** |

Plus ongoing: Claude API usage (modest for home control), ElevenLabs if used sparingly.

### Audio (separate budget — secondhand where possible)

| Item | Est. |
|---|---|
| Lounge AVR (FB Marketplace) | £250-400 |
| Lounge 5.1 speaker package (used) | £400-600 |
| Atmos heights (4 channels) | £150-400 |
| Subwoofer (used) | £100-200 |
| Speaker cables, mounts, bits | £80-150 |
| **Lounge total target** | **~£1,000-1,500** |
| 6× WiiM Mini (kitchen, conservatory, bed 1, garage + 2 spares) | £540 |
| Powered speakers for non-lounge rooms (varies) | £250-600 |
| **Audio total** | **~£1,790-2,640** |

Offset: Echo resale ~£60-100.

### CCTV, doorbell and network kit

| Item | Est. |
|---|---|
| 16-port PoE+ switch (Unifi USW-Lite-16-PoE or TP-Link TL-SG1218MP) | £180-220 |
| 4× Reolink PoE cameras (RLC-810A / 811A, 4K) — front, rear, driveway-side, garage | £280-360 |
| 1× Reolink PoE doorbell | £100-120 |
| Coral USB TPU (optional — OpenVINO/iGPU is the free fallback) | 0-60 |
| Frigate storage top-up (4TB HDD + 1TB SSD cache, if Unraid is tight) | £120-180 |
| Mounts, weatherproof boxes, cable glands | £40-80 |
| **CCTV total** | **~£820-1,080** |

The build is **4 cameras + doorbell** (front, rear, driveway-side, above-garage), i.e. **5 PoE devices** — an 8-port PoE+ (~£100) would cover it, but the 16-port leaves headroom for future expansion.

### Lighting, locks, blinds (rough placeholders)

| Item | Est. |
|---|---|
| Zigbee bulbs / relays — ~14 zones (mix of Hue/Innr/Shelly/Aqara) | £400-700 |
| 3× smart locks (front + conservatory + dining) | £400-500 |
| Motorised blinds — **baseline: bedrooms only** (master bay 3 + bed 2/3 ≈ 5 motors) | £700 |
| Motorised blinds — *bonus, if budget allows* (lounge bay, conservatory, dining, kitchen) | +£1,500-2,700 |
| Sensors, buttons, misc Zigbee tat | £150-250 |
| **Lighting/locks/blinds total (baseline)** | **~£1,650-2,150** |
| **Lighting/locks/blinds total (with all blind bonuses)** | **~£3,150-4,850** |

### Heating &amp; climate

| Item | Est. |
|---|---|
| 5× Aqara E1 Zigbee TRVs | £200 |
| OpenTherm Gateway | £80 |
| 2× Shelly relays (UFH actuators) | £40 |
| 2× Aqara temp sensors (UFH rooms) | £30 |
| Misc cables / install bits | £30 |
| **Heating total** | **~£380** |

Boiler itself is in the building budget separately. Wet UFH manifold + actuators are part of the UFH install spec (commissioned by the heating engineer).

### Displays &amp; proactive extras

| Item | Est. |
|---|---|
| 4× wall tablets (secondhand Samsung Tab A-series) | £200-320 |
| Wall mounts + USB outlets (4 sets) | £140-160 |
| Smart mirror DIY (tablet + acrylic + frame) | £150-200 |
| Scene buttons (4-6 Aqara wireless) | £60-100 |
| Aqara mmWave presence (2× FP2 + 2× FP1E) | £200-220 |
| Shelly EM energy monitoring | £80-120 |
| Garage door automation (Shelly relay, deferred) | £30 |
| **Displays/extras total** | **~£860-1,150** |

### Optional: Window motors (separate budget)

| Item | Est. |
|---|---|
| Wet room chain actuator | £150-300 |
| Conservatory motor(s) | £150-400 |
| Bedroom auto-vent | £150-300 |
| Skylight motors (if any) | £200-300 each |
| Smart extractor fan alternative | £100 each |

### Whole-project ballpark

- Phase 1 hardware: **~£220**
- Audio: **~£1,790-2,640**
- CCTV (incl. storage top-up, 4 cams + doorbell): **~£740-960**
- Lighting / locks / blinds: **~£3,350-5,030**
- Heating &amp; climate: **~£380**
- Cooling / AC *(optional, deferred)*: **~£300 rough-in + £900-7,500 units**
- Displays / extras (incl. presence sensors): **~£860-1,150**
- Signature behaviours hardware (CO2, plant care, driveway): **~£430-520**
- Window motors (~7-8 actuators, every non-conservatory): **~£1,600-3,600**
- **Total range (excl. AC units): ~£9,820-14,975**

Plus optional add-ons (Airthings master ~£250, outdoor irrigation ~£150-300, window motors as scoped) if pursued.

Excludes: AV speaker cable (in cabling scope), AV extenders for HDMI-over-Cat6 runs (if used), any contingency.

Phases 2-4 budget separately as decisions firm up.
