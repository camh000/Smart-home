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

- **Home Assistant** ✅ **up** (fresh install) — the foundation. Empty is exactly the right starting state; see **"First moves on the empty box"** below for the order to bolt things on.
- **Full RAG memory layer** (the phase-1 "jump path"): **Qdrant** + **Ollama** (bge-small / nomic-embed) + the custom Python wrapper. Pure software, no hardware.
- **Frigate** — install/configure now (CPU/OpenVINO detection, no Coral needed; test with a phone-as-IP-camera) so it's ready when cameras arrive.
- **Grocy** ✅ **container up** — now populate inventory; the Claude meal-plan + receipt-OCR layer lands later with the proactive service (Phase 5–6).
- **Mosquitto MQTT** broker ✅ **up** — HA's MQTT integration linked. (Gotcha for next time: `eclipse-mosquitto:2` ships no usable config — needs a `mosquitto.conf` with `listener 1883` + `allow_anonymous true`, else it binds localhost-only and HA can't connect.)
- **Unraid health monitoring** — **Glances + Scrutiny → HA**, immediately useful on the current box (SMART, capacity, temps, containers). **Scrutiny ✅ container up** — next: point its notifications at HA (API/MQTT, or Shoutrrr → ntfy/HA webhook) and set the SMART thresholds so a climbing reallocated-sector count actually pings you. Remember it shares the **self-monitoring blind spot** (it's on the box it watches) — the off-site watchdog still does the "is it even up?" job.

**Owned devices, integrated today:**

- **4× Govee bulbs** ✅ **in HA** via **govee2mqtt** (Govee account creds + API key → control over the Platform API) → MQTT discovery. Full chain proven (HA→MQTT→govee2mqtt→Govee API returns 200). Next: scenes (cosy/movie/reading) + **Adaptive Lighting** circadian. Cloud-routed (laggy/rate-limited) — fine for test bulbs, why the house goes Zigbee.
  - *Setup gotchas:* the **454** login error is Govee rate-limiting repeated restarts — wait it out, don't restart-spam. A bulb that's discovered but won't respond with **"Device is offline"** is a **bulb/Wi-Fi** problem (check it's powered + online in the Govee app), not an HA one.
- **4× Meross Matter plugs** → HA via Matter → control + **energy monitoring** + "washing's done" cycle detection + safety auto-off. ✅ **Matter Server container up + first plug (bedroom lamp) commissioned** — fully **local**, no cloud/lag (the model the house runs on). *(Needs HA's Matter Server container on host networking + IPv6 on Unraid; commission via the phone Companion app on the same LAN. Multi-admin can share a plug already in Alexa/Apple Home, else factory-reset + scan its Matter QR. A plug exposes as a **switch**, not a light — use the **"Change device type for a switch"** helper to present a lamp-on-a-plug as a `light` (on/off only, no dimming).)*
- **Apple TV** → media-player entity, auto-dim on play/pause, "what's playing".
- **Phones** → HA Companion → **Tier-1 presence** + push notifications.
- **Cam + Nova's PCs** → **HASS.Agent** → ~30 activity/presence sensors each + a pinned dashboard.

**Voice pipeline — prototype with no hardware:**

- **openWakeWord + Whisper + Piper** run locally on Unraid (free).
- Use the **HA Companion app's Assist on a phone** as the satellite to prove the full *wake → STT → reasoning → tool-call → TTS* loop and the memory retrieval — no Voice PE needed yet (and remember the Voice PE is Wi-Fi-only anyway).

**Network — when the UCG-Max lands (it's a gift, £0):** set it as root, Decos as APs, the 2× TP-Link switches as VLAN access switches, define the VLAN scheme, and bring up **Site Magic SD-WAN to Selby** with the off-site backups below.

**The one caveat:** using **Claude** as the brain is pay-per-use (fractions of a penny per request). For a *strict* £0 prototype, use HA's built-in **local conversation agent** first, then swap Claude in once a few pennies are acceptable.

**First moves on the empty box (in order):** HA's up but bare — here's the sequence that builds momentum fastest, easy wins before big rocks.

1. **Basics + phones** — set home location/units and accounts, then install the **HA Companion app** on both phones. Instant **Tier-1 presence** + push notifications + a mobile dashboard, zero extra kit.
2. **HACS** — install the Home Assistant Community Store now; you'll need it for Adaptive Lighting, the Unraid integration, Grocy and more.
3. **Easy owned-device wins**: **Meross plugs** (via Matter) and the **Apple TV** media player are near-instant. The **4× Govee bulbs** are fiddlier — HA's *built-in* Govee integrations are **local-only** (**Govee Lights Local** via LAN, + Govee Bluetooth). Enable **LAN Control** per bulb in the Govee app and try **Govee Lights Local** first (no key needed). If the H6008 doesn't support LAN Control (it doesn't), the cloud route is **not** in core and isn't a HACS integration either — run **govee2mqtt** (a small Docker container/add-on on Unraid, like Grocy) that bridges Govee → MQTT → HA using a free **API key** (Govee app → *Apply for API Key*) + your Mosquitto broker.
4. **Wire in what you've already stood up** — the **Glances** + **Unraid** (HACS) integrations to surface Scrutiny/SMART/capacity in HA, the **Grocy** integration, and the **Mosquitto MQTT** broker add-on (backbone for HASS.Agent + future Zigbee).
5. **PC sensors** — **HASS.Agent** on the gaming PC (activity/presence; the foundation for the focus + no-gaming-during-work guards later).
6. **One real automation** so it earns its keep — a "cosy" scene, a presence notification, or "washing's done" off a Meross plug's power-drop. The dopamine that keeps you building.
7. **Then the big rocks** — the **Anthropic/Claude integration + RAG memory** (the brain) and the **voice pipeline** (openWakeWord + Whisper + Piper, with Assist on a phone as the satellite). These are the Phase-1 proof; tackle them once the easy wins are bedded in.

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

Delivery rides the same rails as everything else: phone push (HA Companion), desktop toast (HASS.Agent), and — once the proactive Claude service exists (phase 5) — spoken/written anomalies in plain English.

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

### Is Voice PE good enough? — hardware confidence + fallback

**Verdict: yes, it's the right call — but voice quality lives in the *backend pipeline*, not the puck.** The HA Voice PE (~£59) is purpose-built for exactly this: local wake word (microWakeWord), ESPHome-native, deep HA integration, and a hardware mute/dial/button for privacy. Crucially it carries an **XMOS XU316** doing acoustic echo cancellation + beamforming, so it still hears you while its own speaker is talking (barge-in works) — something the cheap ESP32 DIY satellites can't really do. There's no clearly-better *local voice puck* on the market right now; it's current best-in-class for this job.

**Where it can disappoint (and why it's usually not the hardware):**

- **Far-field in a big/noisy room** — it's a 2-mic array, not the 3–6 mics in an Echo/Nest. The **south-facing lounge with media playing** is the hardest test. This is the one genuine hardware limit.
- **STT accuracy + latency** — dominated by which Whisper model runs on the Unraid box, not the puck. A small quantised model is fast but fumbles names/accents; a bigger one is accurate but needs GPU to stay quick.
- **LLM in the loop** — if every utterance hits Ollama/Claude you'll feel 2–4 s lag. Simple commands ("lights on") must resolve via HA's **local intent matching in <1 s** and never touch the LLM.
- **Tiny onboard speaker** — fine for confirmations/timers, useless for music or room-filling TTS. Not a problem here: route TTS responses to the ceiling speakers.

**Fallback ladder (cheapest → most drastic):**

1. **Tune the backend first** — give Whisper the GPU (faster-whisper / whisper.cpp), keep the LLM out of the fast path, route TTS to ceiling audio. Fixes most "it's bad" complaints with no new hardware.
2. **Drop to HA Cloud (Nabu Casa) STT/TTS** — much higher accuracy, small latency, and it funds HA. Costs a privacy trade-off and ~£65/yr, and can be enabled **per room** rather than all-or-nothing.
3. **One bad room only?** Add a **Wyoming satellite on a Raspberry Pi + 4-mic ReSpeaker array** for that room — better far-field, less tidy. Keep Voice PE everywhere else.
4. **Last resort** — bridge an existing Echo/Nest via HA. Works, but it's cloud-bound and the opposite of the local-first ethos — only if all else fails.

**🛒 De-risking move: buy ONE first, not the full set.** Put it in the lounge (worst-case acoustics) with media playing and test wake-word reliability + recognition before committing to room-wide coverage. ~£59 to de-risk the whole voice layer — and it fits the phased rollout anyway.

## Hub & radios (Unraid box)

- **Zigbee coordinator** — SkyConnect or Sonoff ZBDongle-E (~£20). Handles bulbs, locks, sensors, buttons.
- Z-Wave stick — only if we buy Z-Wave kit later
- **Matter** — supported natively by HA, but it splits two ways: **Matter-over-Wi-Fi** (the Meross plugs — working today, no extra radio) vs **Matter-over-Thread** (low-power battery devices), which needs a **Thread Border Router (TBR)** the plan doesn't yet have. The **SkyConnect / ZBT-1 can run OpenThread BR** alongside Zigbee, or an **Apple TV / HomePod mini / Aqara hub** can be the TBR. **Decide Matter-over-Wi-Fi vs Thread per device** so you know whether a TBR is needed — see Open questions.

### USB passthrough — getting the dongle to HA on Unraid

**HA runs in a Docker container on Unraid** (confirmed deployment) — so it's the `--device` route below, and there's **no Supervisor/add-on store**: Mosquitto, govee2mqtt, the Matter Server and (later) Zigbee2MQTT all run as their **own Unraid containers**, and **backups are manual** — keep the HA config dir in the off-site backup set. The dongle plugs into the box's USB; standard setup, three gotchas that bite if missed:

- **Pass it through to HA (Docker route):** add the dongle in the container's *Extra Parameters* (e.g. `--device=/dev/serial/by-id/usb-ITead_Sonoff_Zigbee_3.0_USB_Dongle_Plus_…-if00-port0`). *(The HA-OS-in-a-VM alternative — ticking the dongle in the VM's USB Devices, which would also get the Supervisor + add-ons — isn't in play, since HA runs in Docker here.)*
- **🔌 Always use the stable `/dev/serial/by-id/…` path, never `/dev/ttyUSB0`** — the `ttyUSBx` number can change on reboot/replug and silently break Zigbee; the by-id path is pinned to that dongle.
- **📡 Put the dongle on a 0.5–1 m USB extension lead, away from the box (and ideally a USB 2.0 port).** This is the single biggest Zigbee reliability fix: 2.4 GHz Zigbee gets hammered by USB 3.0 ports, NVMe/drives and the metal case right next to it. Dangling it away from the server dramatically cuts dropouts.
- **💾 Back up the HA / Zigbee2MQTT config** (it's in the backup set) so the **network key + every device pairing survives a restore** — otherwise a rebuild means re-pairing all 30+ devices by hand.
- Coordinator note: SkyConnect / ZBDongle-E are Silicon Labs — fine with ZHA, and with Zigbee2MQTT select the **ember** adapter. (The TI-based ZBDongle-**P** is the alternative; either works, just match the driver.)

### 2.4 GHz coexistence &amp; Zigbee mesh — RF planning

The single biggest cause of a flaky smart home is **2.4 GHz congestion**, and this house piles a lot onto that band: **7 Wi-Fi Voice PEs**, Wi-Fi IoT, **Zigbee**, and (if used) **Thread** all share it. Plan the spectrum rather than leave it to luck:

- **Channel plan:** Wi-Fi APs on **1 / 6 / 11** only; **Zigbee on a channel in the gaps** (e.g. **15, 20 or 25**) so it doesn't sit directly under a Wi-Fi channel; give **Thread its own** channel too. Check which Wi-Fi channels are actually in use before pinning Zigbee.
- **Offload to 5 GHz / wired:** put everything that *can* go on 5 GHz Wi-Fi or Ethernet there (tablets, PCs, gaming) to free 2.4 GHz for the IoT that has no choice (Voice PE, Zigbee).
- **Zigbee is a mesh — and it needs routers.** Battery sensors don't repeat; **mains-powered Zigbee devices (bulbs, plugs, relays) are the repeaters.** Make sure there are enough, well-distributed, to carry the mesh out to the **garage** and far corners — don't expect the coordinator alone to reach.
- **Keep the coordinator off the noise floor** (the USB-lead tip above) and away from the Wi-Fi APs and the Unraid box.

## Lighting

- **Existing 4× Govee H6008** — use in lounge for testing. HA's two *built-in* Govee integrations are **local-only** (**Govee Lights Local** via LAN Control, and Govee Bluetooth) — enable LAN Control in the Govee app and try Lights Local first (no key). There is **no official cloud Govee integration in core** (and the H6008 doesn't expose LAN Control): the cloud/API-key route is **govee2mqtt** — a small Docker container/add-on (not a HACS integration) that bridges Govee → MQTT → HA with a free API key + the Mosquitto broker. Cloud + rate-limited either way — which is exactly why future lighting goes **Zigbee** (local, instant), not more Govee.
- **Future bulbs** — Zigbee (Hue, Innr, Ikea Tradfri) or Matter, not WiFi
- **Switched fittings** — Shelly or Aqara Zigbee relays behind the switch where pendant fittings aren't worth replacing

Approx zones to cover: dining, kitchen, conservatory, lounge, hall, porch, landing, 3 bedrooms, bathroom, garage, front exterior, back exterior. **~14 zones** (counted from this list).

## Locks

**Three entries, three locks** (confirmed in Open questions): the **front door**, the **conservatory hinged door** (S wall), and the **dining French doors** (N wall). Zigbee/Z-Wave/Matter — not Wi-Fi.

- Candidates:
  - **Front door — pick by door type.** A typical UK uPVC/composite front door is a **euro-cylinder multipoint**, which wants a **Yale Linus L2** (retrofit — keeps your existing key) or **Conexis L2** (multipoint replacement). The **Yale Assure 2** *does* list on Amazon UK (so it's buyable here — correction to an earlier claim), but it's a **US deadbolt** form factor — only the right pick if your front door actually takes a deadbolt. Confirm the door type before choosing.
  - **Conservatory** — **Aqara U200** (euro-cylinder retrofit — *not* the U100, which is a US deadbolt form factor).
  - **Dining French doors** — **Aqara A100 Pro or Nuki 4 Pro** (multi-point cylinder).
- **All keep a physical key as an optional fallback — but how depends on the type:**
  - **Retrofit (Nuki 4 Pro, Aqara U200)** — mounts on the *inside* over your existing thumb-turn and just motorises it; the original cylinder stays, so your **normal key works from outside as before**, no battery/software needed (a true fail-safe). ⚠️ Fit the anti-snap cylinder with the **"emergency &amp; escape" function** so the key turns from outside even while the thumb-turn/Nuki is engaged inside — a standard cylinder blocks that and locks you out.
  - **Replacement (Aqara A100/A100 Pro)** — replaces the cylinder, ships with a **mechanical keyway + keys** alongside fingerprint/keypad/NFC.
  - **Yale Assure 2** — comes **keyed** *or* **key-free** (no keyway; relies on codes + emergency 9 V terminals). Key-free removes the snap target but drops the "just use the key" escape hatch.
  - **Trade-off / decision:** keep the key (guaranteed offline/dead-battery backup, *but* the keyway is the snap/pick target) **vs** go key-free (no snap target, but 100% dependent on electronics + codes + emergency power). Given the dependency-loop safeguard below insists on a physical-key fallback, the plan's stance is **keep keys, on anti-snap cylinders**.
- **🔑 Anti-snap cylinders are non-negotiable — the lock is only as good as the cylinder it sits on.** **Lock snapping** is the #1 forced-entry method on UK uPVC/composite doors and takes seconds; a £200 smart lock on a £8 euro cylinder defeats itself (the Aqara/Nuki units mount *on* the existing cylinder/thumb-turn). Fit **TS007 3-star** (or **1-star cylinder + 2-star security handle**), or **Sold Secure Diamond (SS312 Diamond)** cylinders on all three doors. Cheap, and the single biggest physical-security upgrade in the plan.
- All three are Tier-2 (verbal confirmation before lock/unlock; tool-layer challenge token for locks specifically)
- **🔁 The secure-unlock gate must not depend on the cloud brain (dependency-loop trap).** The Tier-2 "say yes first" + the challenge token live in Claude + the memory service. If the internet/HA/memory is down you'd either be **unable to unlock** or the local fallback would **bypass the safety**. Two requirements: (a) every lock keeps a **physical key + lock-resident keypad codes** (codes stored *on* the lock, validated offline — not by HA in real time), so a software outage never locks you out and guest codes work without HA; (b) decide explicitly whether the local-intent fallback is *allowed* to do a confirmed unlock, or refuses Tier-2 entirely and defers to the physical key.

## Blinds

**Baseline scope: the master-bedroom bay only.** The one funded motorised blind is the 3-pane **bay in the master bedroom** — everything else (the other bedrooms, lounge bay, conservatory, dining/kitchen) is a *bonus tier if budget allows*. Keeps the blinds line small and certain rather than a £2-3k whole-house commitment.

- **Baseline (do this):** master-bedroom **bay** — 3 panes (3 motors), ~£450.
- **Bonus tier 1 (if money comes in):** lounge bay (showpiece, 3 panes/motors).
- **Bonus tier 2:** conservatory (5-7 panels — heat/glare; biggest single swing in cost) + dining/kitchen + the **other bedrooms** (bed 2/3, single windows).
- **Note — motors vs openings:** count blinds in *motors* (one per pane → bays inflate the motor count) not windows. Blind motors (shading) are a **separate** device from any window-vent actuators (ventilation) in the optional Window-motors section — the two budget lines are not double-counting.
- Retrofit existing: SwitchBot Blind Tilt or Aqara Roller Shade Driver E1
- New install: IKEA Fyrtur (Zigbee) or Matter-over-Thread

Cabling note: because the *option* on the bonus tiers is only preserved while walls are open, still pull low-voltage DC / draw-string to **every** potential blind head now (see "Additions to cabling scope") even though only the master-bedroom bay is funded today.

## Safety sensors (smoke, CO, water leak)

The most important gap the plan was missing. A JARVIS-grade home that promises to override its own DND "except for smoke" needs to actually *sense* smoke — and floors-open is the cheapest moment to protect against leaks.

**Smoke + CO (life safety):**

- Interlinked smart **smoke + heat + CO** alarms feeding HA — e.g. Zigbee **Frient**/**Heiman**, or mains **Ei Electronics** with a relay/contact module into HA. Keep them functioning as standalone alarms too (HA is a *notifier*, never the only line of defence).
- **⚠️ Meet building regs with the *primary* alarms — don't let cheap Zigbee units do the life-safety job.** A rewire/renovation triggers UK smoke-alarm regs (**BS 5839-6** — typically **Grade D mains-powered with battery backup, interlinked, at least one per storey + escape routes (LD3/LD2)**; **Scotland is stricter** — interlinked in every living room + hall + a heat alarm in the kitchen). Spec the **mains-interlinked Ei Electronics (or equiv.) as the compliant base layer**, with HA *reading* them via a relay/contact module — the Zigbee units are an *additional* sensing layer, not the legal one. Confirm the install meets your nation's regs with the sparky.
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
- **Phase 3:** OTGW + 5× TRVs deployed, HA controls boiler + upstairs heating
- **Phase 5:** UFH zone control wired in (Shelly + sensors), per-zone Generic Thermostats configured in HA

## Cooling (no AC — passive only)

**Decision: no air conditioning.** It's a 1960s house expected to be decently insulated, so overheating is unlikely to justify the cost/disruption — and dropping AC removes the single biggest line item from the budget. No refrigerant rough-in during the rewire.

Heat is instead managed passively (cheap, and most of it already in the plan):

- **Shading first** — bay/bedroom **blinds** and **solar-reflective film** on the east-facing conservatory glass block heat before it gets in.
- **Night-purge ventilation** — the **motorised window actuators + CO2/temp sensors** already in scope let HA crack windows overnight to flush heat.
- **Ceiling / extractor fans** — circulation where needed (~£100/room), far cheaper and quieter than units.
- **The head-end (Bed 3)** still gets its dedicated **temperature alert + active extraction** (server heat, not comfort cooling).

Revisit only if a summer in the house actually proves it's needed — but with no pipework committed, that's a clean future decision, not a now-cost.

## CCTV + doorbell

- **NVR**: Frigate on Unraid. **Detector: Coral TPU is optional now, not required** — Frigate also supports **OpenVINO on an Unraid iGPU** (or ONNX/CPU) for object detection, so don't let chronic Coral supply block the build. Use whichever the Unraid box can run; Coral is a nice-to-have for low CPU load.
- **Cameras**: PoE only. Reolink (budget), Amcrest/Dahua (mid), Unifi (premium). *Verify* the specific Reolink models stream cleanly to Frigate with internet egress fully blocked (some Reolink firmware misbehaves when firewalled).
- **Doorbell**: Reolink PoE Video Doorbell — works with Frigate, runs off PoE switch. *Verify* doorbell-press events reach HA/Frigate with egress blocked.
- **PoE switch** — 8-port minimum (TP-Link or Unifi)
- **Storage** — event recording + 24-48hr continuous buffer. Unraid has plenty.
- **VLAN** — cameras isolated from main network (good hygiene, not essential)
- **🕒 Egress-blocked cameras still need time + firmware.** Firewalling the cameras off the internet (good) also kills their **NTP time sync** — clocks drift and timestamps become useless as evidence — and their **firmware updates**. Run a **local NTP server** (the UCG-Max or Unraid can serve it) and point the cameras at it, and set a **manual firmware-update routine** (temporarily allow egress, or sideload). Verify each model accepts a custom NTP server.
- **⚡ Surge / lightning protection.** The outdoor cameras run **copper PoE back into the switch** — a classic surge/lightning entry path that can take out the PoE switch *and* Unraid behind it. Fit **PoE surge arrestors** (gas-discharge, earthed) on the outdoor camera runs, and a **head-end / whole-house SPD** (surge protection device) in the consumer unit. (The garage link already dodges this via fibre — see cabling spec §8.) Cheap insurance for thousands of pounds of kit.
- **🎥 Frigate detector sizing — detect on the substream, record on the mainstream.** Running object detection on full 4K from 4-5 cameras will swamp the CPU/iGPU. Configure each camera with a **low-res substream for Frigate detection** and the **4K mainstream for recording** — and size the detector (Coral / OpenVINO iGPU) for the *substream* count, not 4K.

### Camera positions (confirmed)

4 PoE cameras + doorbell. Coverage focuses on the driveway/garage corridor (the only side passage on the property) and front/rear.

- **Front of house** — high, central mount, covers porch, bays, driveway entrance
- **Rear** — above conservatory, garden coverage
- **Side of house (driveway)** — house-mounted, looking down the side toward the garage. (The side opposite the garage has no passage.)
- **Above garage door** — garage-mounted, looking back toward house. Shares the fibre conduit. Bidirectional coverage of the driveway combined with the house-side camera above.
- **Doorbell** — Reolink PoE on the front door
- *Optional later: garage interior camera for workshop/storage*
- *Considered and skipped: second front-of-house camera on the opposite corner. Adds redundant coverage but introduces a blind spot directly below it; central front camera + doorbell cover the entry already.*

### Night vision &amp; face recognition — the honest version

Detecting a *person* at night is easy; recognising *who* they are is a different, harder problem, and it's worth being clear-eyed about it (it underpins the doorbell greetings **and** the alarm's known-vs-stranger logic).

- **Standard IR night vision is monochrome** and tends to **wash out / blur faces** (skin and glasses bounce IR; moving subjects blur on the longer night exposures). Brilliant for "a person is here," poor for face *recognition*.
- **Recognition needs pixels on the face** — roughly **80-100px between the eyes**. A wide perimeter camera covering the whole driveway won't get that on a face at distance, day *or* night.
- **So the doorbell is the real face-rec point** — close (~1 m), the subject is stationary, and it's the use case that matters ("who's at the door"). That's exactly where the contextual-greeting feature lives, so the design already leans the right way.

**To get usable night identification where you want it:**

1. **Light the scene on night motion (the smart-home win):** HA flips the **porch / driveway / security lights** on when the beam, mmWave or camera detects motion after dark → a **full-colour, lit** image instead of grainy IR, *and* a deterrent. Cheap, and pure synergy with kit already in the plan.
2. **Use a white-light / colour-night-vision camera at the front/porch** — a **spotlight** model or a low-light **colour-night-vision** sensor (e.g. Reolink ColorX / f1.0) gives full-colour night footage. Worth it for the *one* camera you most want to ID faces from.
3. Mount that front/entry camera at a **face-height approach angle**, not just a high wide shot, if identity matters there.

**Verdict:** person *detection* (and the alarm trigger) work at night everywhere; face *recognition* (identity) is reliable only **close + lit** — the doorbell and a well-lit porch — **not** a distant IR perimeter cam at 2am. Treat night face-ID as a bonus on the perimeter, a dependable feature at the door.

### Storage sizing (Unraid)

Frigate records continuously to a short-term buffer, then keeps anything where AI detected a person/car/etc. for the longer event window. You get "rewindable last 48h" plus "every meaningful event for 30 days" without storing 24/7 4K forever. The design is a **two-tier store**: the hot 48h lives on the **SSD cache** (which absorbs the constant write load), and the long tail ages onto the **HDD array** via Unraid's mover.

**Sizing for 4× 4K cameras + doorbell, 48h continuous + 30-day events:**

| Item | Approx | Lives on |
|---|---|---|
| 48h continuous buffer | ~250-350 GB | SSD cache |
| Snapshots, thumbnails, **database** | ~50 GB | SSD cache |
| 30 days of detected events | ~600 GB - 1.5 TB | HDD array |
| **Total** | **~1-2 TB** | split |

Bump the array side to **3-4 TB** for 60+ days retention, 6 cameras, or a longer continuous buffer.

#### How Frigate actually splits continuous vs events (one folder, not two)

The thing that trips people up: Frigate does **not** have separate "continuous" and "events" folders you can point at different disks. There's **one recordings directory**, and *retention rules* decide how long each segment survives:

- `record.retain.days: 2` + `mode: all` → keep **everything** for 48h (true continuous)
- `record.alerts.retain.days: 30` / `record.detections.retain.days: 30` → keep the segments that **overlap a detection** for 30 days

So you can't tell Frigate "continuous → cache, events → array." Instead you tier the **whole share** physically with Unraid, and the retention rules do the splitting. The neat consequence: after 48h the *only* footage Frigate hasn't pruned is event-associated — so what physically ages onto the array **is**, in effect, your 30-day event archive. Frigate just sees one path; the cache↔array move happens underneath it.

#### Tier 1 — SSD cache (the hot 48h)

- **The existing 1TB M.2 NVMe is plenty** — the hot tier is only ~300-400 GB, so it sits about a third full. **No second SSD is needed for capacity.**
- Unraid pools can hold **multiple devices** (btrfs or ZFS): a **mirror** (RAID1, redundancy, usable = smaller drive), a **stripe** (RAID0, capacity + speed, no redundancy), or just a second **separate pool**.
- **Decision — share vs dedicate:** if that 1TB also hosts appdata/dockers/VMs, you *can* still use it (Mover Tuning rules are per-share, so Frigate is scoped without touching anything else). The tidier option is a cheap **2nd NVMe as a dedicated Frigate pool** — not for space, but to isolate the 24/7 write wear and I/O contention from the containers. Optional.
- Use a **decent-endurance (TLC) SSD** — 4 cameras continuous is ~20+ TB written/year; fine for TLC, hard on cheap QLC.
- **Keep Frigate's database (`/config`) on the SSD** — it does lots of tiny writes; never let the mover drag it onto a spinning disk.

#### The mover

- The **stock Unraid mover empties the whole cache** to the array on a schedule — it won't hold "exactly 48h."
- Install the **Mover Tuning** plugin and set *"move files older than 2 days"* on the frigate share, so the hot window stays on SSD and only the aged event footage spills to the array.

#### Tier 2 — HDD array (the 30-day events) — *the actual constraint*

This is where the month of events lands, and it's the tight bit: **the \*arr apps churn new media onto the array constantly, so free space bounces between ~0.5-2 TB.**

The framing flips here: the risk **isn't** CCTV growing without bound — **Frigate self-caps**, its retention deletes its own oldest footage so the event archive plateaus (~600 GB-1.5 TB). The risk is **media filling the disk so Frigate can't write that plateau.** So the job is to **fence media off a reserve**, not to limit CCTV.

**Plan — one 8-12 TB disk doing double duty (media + CCTV), added to the array** so it also expands media capacity. Reserve the camera slice in three layers:

1. **Unraid per-share "Minimum free space"** on the **media** shares — set it to **≥ the CCTV reserve (~1.5-2 TB)**. Unraid's allocator stops writing *new media* to a disk once its free space drops below that, fencing the tail of the disk for Frigate. (A soft fence on *new* writes, not a hard quota — but media is the churner, so fencing media is exactly the lever you want.)
2. **The \*arr apps' own "Minimum Free Space"** (Sonarr/Radarr → Media Management, per root folder) — so they **stop importing** when the disk nears the reserve instead of erroring. Media stalls; CCTV keeps its space.
3. **Pin the frigate share to that disk** (share → *Included disk(s)*) so the footage has a definite home and isn't scattered across the array.

> **Hard-guarantee caveat:** on a *shared* disk Unraid has no hard per-share quota — the above is a soft (but reliable) fence, reliable precisely because media is the churner you're capping. The only way to *guarantee* the slice with a hard wall is physical isolation — CCTV on **its own disk** (or the unprotected pool from before; a ZFS dataset quota is the advanced alternative, fiddlier than it's worth here). If the cameras ever feel cramped, that's the upgrade.

**Trade-offs you're accepting by sharing:** CCTV now lives on the **parity array** (a small write-penalty on event footage — fine, events are a fraction of the writes) and that disk **spins 24/7**. Still **keep CCTV in its own share**, never inside the Plex/media share.

> **Standing rule:** recordings are replaceable; parity costs a whole drive. Sharing the array disk is the pragmatic call here (you want the media capacity too) — just don't go *adding* a parity drive on CCTV's account.

**What to buy:** the **1TB NVMe cache is already owned** and sufficient. The new spend is the **8-12 TB array disk** (used Red/Ironwolf/Exos, ~£120-220) — media growth *and* the 30-day CCTV archive on one drive. (A 2nd NVMe for a dedicated cache pool stays optional, ~£60-80.)

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

### Is WiiM the right pick? — and how it differs from Voice PE

**First, the Voice PE comparison you're drawing — they're complementary, not the same job.** A Voice PE is *ears*: mic array + wake word + a tiny speaker that's only good for "okay, playing now" confirmations and timers. A WiiM is *output*: a network streamer that turns a powered speaker into a room-filling, HA-controllable music endpoint. You can't replace WiiMs with more Voice PEs (their speakers are too small for music); what you *do* get is the nice tie-in — **route TTS/announcements to the WiiM** so the assistant can talk through the good speaker, while the Voice PE just listens.

**Verdict: yes, WiiM is the right call — it's the audio analogue of the Voice PE decision.** Cheap, local-controllable, HA-native, and it speaks every casting protocol (AirPlay 2, Chromecast, Spotify/Tidal Connect, DLNA, Roon). It's effectively the **open, affordable Sonos** — punches well above its price on DAC quality, gets frequent firmware updates, and the **Music Assistant** add-on drives it from HA. Crucially, Music Assistant also drives Sonos / Chromecast / AirPlay / Snapcast, so **the brand is decoupled from the control plane** — you're not locked in.

**Where it can disappoint:**

- **The Mini is Wi-Fi-only** (like the Voice PE). In a room with a Cat6 drop, step up to the **WiiM Pro** (Ethernet + better DAC + sub-out) for wired reliability — see the networking caveat above.
- **Cloud-touch on setup** — initial config and some music-service logins go through WiiM's cloud. Day-to-day *control* via HA, plus AirPlay/DLNA/Roon playback, are fully local, but it isn't as purely local as a Pi running Music Assistant.
- **It's a streamer, not an amp** — the Mini needs a powered speaker. For a tidier install (kitchen/bathroom in-ceiling), a **WiiM Amp** is one box that streams *and* drives passive speakers.

**Pick the tier per room:** **Mini** (cheap, Wi-Fi, line/optical out) → **Pro** (Ethernet, sub-out — use in wired rooms) → **Amp** (built-in amplifier for passive/in-ceiling) → **Ultra** (touchscreen, phono). My rec: **Pro in the wired rooms** (kitchen, conservatory, garage), Mini for cheap secondary zones, consider an **Amp** anywhere you'd otherwise buy streamer + powered speaker.

**Fallback ladder if it underwhelms:**

1. **Right tier, same ecosystem** — Pro for wired reliability, Amp to lose the separate speaker box. Usually the fix is "the right WiiM," not a different brand.
2. **Music Assistant stays the control plane** — already decouples you, so you can mix in other endpoints without re-architecting.
3. **Fully-local DIY** — Raspberry Pi + Music Assistant + **Snapcast** for sample-accurate whole-house sync (and shairport-sync for AirPlay). More boxes, totally local, free-ish.
4. **Sonos** — only if you want plug-and-play polish and accept the cloud dependency, higher price, and their track record of bricking old kit. Against the local-first ethos.

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

**Note:** the PC runs hard while you game in the lounge, adding heat to the office — so the office wants decent ventilation / a fan. **Cost: ~£0** — the **JSAUX dock (Ethernet) is already owned**, the lounge Cat6 is in scope, and the host software (Steam Remote Play / Sunshine + Moonlight) is free. **Phase 5.**

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

## Alarm &amp; security

Spot on — once the presence layer is in, you've effectively built a **video-verified, presence-aware intruder alarm** for the price of a free HACS add-on. The sensors bought for comfort earn their keep twice.

**The kit already does the sensing:**

- **mmWave (FP2/FP1E)** + **PIR motion** + **door/window contacts** — interior + perimeter detection.
- **PoE cameras + Frigate** — person/car *detection* (not just "motion") + **face recognition** (household vs stranger). *Detection triggers reliably day or night; face-ID at night only works close + lit (doorbell / a light-on-motion porch) — see "Night vision & face recognition".*
- **Driveway beam + ALPR** — perimeter + known/unknown plates. **Smart locks** — entry state + tamper. **Phone presence** — who's home. **Voice PEs** — sirens + two-way talk.

**The brain — [Alarmo](https://github.com/nielsfaber/alarmo) (HACS):** a full alarm panel in HA — arm modes, entry/exit delays, per-mode sensor groups, code/NFC/phone arming, notifications.

- **Armed Away:** everything live, entry/exit delay on your usual door.
- **Armed Home/Night:** perimeter only (contacts + outdoor cameras) — interior motion off so you can move around.
- **Disarmed:** normal automation.

**Why it can beat a cheap alarm — sensor fusion + Claude:**

- A lone PIR trip = ignored; PIR **+** door contact **+** Frigate *person* **+** unknown face at 3am = real. Claude reasons across signals → **far fewer false alarms** (pets, curtains, sun) than a dumb PIR box.
- **Video-verified:** every trigger ships with a snapshot/clip — the thing that makes an alarm credible.
- **Presence auto-arm:** all phones leave + no mmWave → auto-arm. Never "forgot to set it." Auto-disarm on a known phone / recognised face / NFC tag.

**Response — escalation ladder (matches the nudge style):**

1. **Quiet:** log + snapshot + push ("person in the hall, 2:14am — photo attached").
2. **Challenge:** Claude speaks through the nearest Voice PE / doorbell ("You're being recorded, the owners are alerted").
3. **Full:** siren + strobe, all lights to 100%, cameras record, push to **all phones + Dad in Selby** over the SD-WAN — human redundancy a lone DIY alarm otherwise lacks.

**Be honest about the limits vs a professionally monitored system:**

- **No ARC / URN / guaranteed police response.** It alerts *you* (and Dad); it doesn't dispatch police. UK forces generally only auto-respond to approved-ARC-monitored systems with video verification. This is a deterrent + evidence + notification system, not a response contract.
- **Insurance:** if your policy *requires* an alarm it may specify an **NSI/SSAIB-approved installed** one — a DIY HA alarm might not satisfy it. **Check the policy** before relying on it.
- **The self-monitoring blind spot (again):** it runs on Unraid — cut the power or broadband and a naive setup goes dark. Mitigate: the **UPS** (planned) rides out power cuts, **4G/LTE WAN failover** on the gateway gets alerts out if broadband's cut, the **Selby Uptime-Kuma watchdog** notices Woodhouse going dark, and **battery Zigbee sensors** survive mains loss. **Wired PoE cameras** can't be Wi-Fi-jammed.
- **Visible deterrent:** add a real **siren/strobe + bell box** on the wall — burglars avoid a house that *looks* alarmed; they can't see your software.

**To make it a proper alarm, add:** Alarmo (free), a **Zigbee indoor siren** (~£25), an **external sounder/bell box + strobe** (~£30-50), a door **keypad** (Zigbee ~£25) or arm via tablet/NFC/phone, and **4G failover** on the gateway. Everything else is already in the plan. **Phase 4-5** — it switches on once the sensors + cameras are in and the proactive brain exists.

### Beyond the alarm — the full security layer

The fancy alarm can lull you into ignoring the unglamorous stuff that actually stops break-ins. Four fronts:

**Physical hardening (stops the entry itself):**

- **🔑 Anti-snap cylinders** on all three locks — *the* priority, see [Locks](#locks). The smart lock is worthless on a snappable cylinder.
- **Glass-break (acoustic) sensors** — contact sensors catch a window *opening*, not someone *smashing* it and climbing through. Closes that gap.
- **Vibration / tilt sensors** on the garage door, sheds and vulnerable windows — flag forced entry *before* it opens.
- **Door/window reinforcement** — hinge bolts, sash jammers, laminated/security-film glass on vulnerable panes; **letterbox guard + keep keys away from the door** (letterbox fishing for keys/thumb-turns is common).

**Smarter detection (mostly free software on kit already bought):**

- **🎥 Camera tamper / offline detection** — a burglar's first move is killing a camera, so a cam going **offline** or its view **blacking out/obscuring** must *itself* trigger the alarm, not pass unnoticed. High value, free.
- **🔊 Frigate audio detection** — Frigate can classify **breaking glass, a smoke alarm, shouting** — a free second sense alongside video.
- **Loiter detection** — someone dwelling at the front for >X minutes (Frigate zones + a timer) → alert even without a hard trigger.

**Securing the system itself (a smart home *is* an attack surface):**

- **🛡️ No inbound ports — remote access via Tailscale only** (already in place). Never port-forward HA or the cameras to the internet.
- **Cameras + IoT on an isolated VLAN with internet egress blocked** — cheap cameras phone home; firewall them local-only (ties into the Operations VLAN scheme).
- **HA 2FA, change every default password, patch firmware, disable router UPnP**, and **alert on unknown devices joining** the network (UniFi can).

**Evidence, deterrence & people:**

- **☁️ Instant off-site clip upload to Selby on an alarm event** — if they take the Unraid box the footage goes with it, *unless* event clips are pushed off-site the moment they trigger (you already have the SD-WAN link). Also **physically hide/secure the NVR**.
- **🏠 Occupancy simulation (away mode)** — randomised lights/TV/blinds so the empty house looks lived-in. One of the best burglary deterrents, and free. Plus visible deterrents (bell box, cameras, floodlights, optional **recorded dog-bark** through outdoor speakers on a night perimeter trip).
- **🆘 Panic button + duress code** — a bedside/by-door Zigbee button for instant full-alarm, and a **duress PIN** that *appears* to disarm but silently alerts (for being forced to open up).
- **🔥 Fire overrides lockdown** — critical interaction: the alarm locks doors, but on **smoke/CO** the house must **unlock exits + light the escape route + announce**. Life safety beats security — design it explicitly.
- **Acknowledgement escalation** — no ack on an alert within X minutes → escalate (call, then Dad/keyholder in Selby). Optionally **bridge to a paid monitored/ARC service** for actual police response (closes the gap above). Plus **auto-lock policies** — lock after X min / at night / when everyone leaves, and "door left unlocked or open" nags.

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

Belongs in **phase 5** — after proactive Claude service exists. Without proactive, PC integration is just "doorbell pops up", which is fine but not the Stark vision.

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
- **Heat/power** — ultrawide + gaming PC add desk load and heat, so the office wants good ventilation / a fan, and it's a candidate for a smart-plug "desk off when away" routine.

**Cost:** ~£350-550 for the ultrawide + ~£150-400 for a good dual-head DP 1.4 KVM (or less if the monitor's built-in KVM suffices). **Phase 5.**

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

Tied to the proactive Claude service (phase 5+):

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

Mostly software/scenes on existing kit. New bits, roughly: WLED (~£25), NFC tags (~£5), keg flow meter + ESP32 (~£25), load cells + HX711 (~£20-40), CO2 leak sensor (~£35), smart scale (~£20). **~£100-150 for the lot**; the kegerator and auto-pour machine are separate splurges. **Phase 6**, after the house core is in.

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

New spend is just an **NFC tag (~£2)** and a **small desk LED (~£10-15)**. Everything else is config on the office kit (FP2, Voice PE, lighting, phone Companion) already in the plan. **Phase 5.**

## Signature behaviours

The "JARVIS feels" layer. These combine the infrastructure (voice + presence + lighting + heating + audio + cameras + Claude) into specific automations that feel like an attentive housemate rather than a smart-home dashboard. Most depend on phase 2-5 kit being in place; few need new hardware.

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

Hardware: existing. Cost: **£0**. Phase 5.

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

Cost: **£0** (custom Python in the proactive service). Phase 5.

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

Cost: **£0** software, £15 optional barcode scanner. Real cost is setup time (2-4 evenings to populate Grocy + dial in the meal plan prompt). Pays back continuously. Phase 6.

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

Cost: **£0** (existing kit). Phase 5.

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

Cost: **£0**. Phase 5.

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

Cost: **£0**. All planned bulbs/relays already support colour temp. Phase 3.

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

Cost: **~£200-280** for 5-7 rooms with Vindstyrkas. Optional +£250 Airthings master. Phase 5.

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

Cost: **~£30-40 beam** + free ALPR. Phase 5.

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

Phase 6 (indoor); phase 7 (outdoor, if installed).

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

Cost: **£0**. Phase 6.

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

Cost: existing kit. Phase 6 with smart plug deployment.

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

Cost: **£0** software (Shelly EM already in plan, APIs free). Phase 5.

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

Cost: **£0**. Phase 5 with proactive Claude service.

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

Cost: **£0** — existing kit + light Claude API usage for captions. Phase 6.

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
| Circadian lighting | 3 | No (existing bulbs) |
| Cinema mode plus | 5 | No (existing) |
| Whole-house intercom | 5 | No |
| Face-recognised doorbell | 5 | No (Frigate + doorbell) |
| Driveway sensor | 5 | Beam (~£40) |
| CO2/VOC monitoring | 5 | Sensors (~£200-280) |
| Energy + cost dashboards | 5 | No (Shelly EM in plan) |
| Calendar-driven anticipation | 5 | No |
| Cooking mode + Grocy + meal plan | 6 | Optional barcode scanner |
| Smart laundry workflow | 6 | No (smart plugs in plan) |
| Delivery handling | 6 | No |
| Guest mode | 6 | No |
| Photo digest | 6 | No |
| Indoor plant care | 6 | Sensors (~£200) |
| Outdoor irrigation | 7 (if installed) | OpenSprinkler (~£150) |

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
- **🔌 Future-proof the first fix for solar / battery / EV — walls open is the only cheap moment.** Same logic as the blind cabling: provisioning now is just conduit; retrofitting later means re-chasing walls and a re-dig. Ask the sparky to leave: a **spare consumer-unit way** (or a slightly bigger board), a **duct/cable route to the loft/roof** for future **solar PV**, a **dedicated route to the driveway** for a future **EV charger** (a 32A radial / SWA), and **floor space + a cabling allowance** for a future **home battery** near the CU. The energy dashboards already assume Octopus Agile — solar/battery/EV is the obvious next step, and first-fix is when it's nearly free.
- **⚡ Surge protection is electrical scope** — have the sparky fit a **Type 2 SPD in the consumer unit** (cheap, protects every always-on device), plus **earthed PoE surge arrestors** on the outdoor camera runs at the head-end (see CCTV → surge).

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
- **Matter fabric + the supporting containers** — back up the **Matter Server's `/data`** (the fabric credentials): lose it in a rebuild and you **re-commission *every* Matter device by hand**. Same trap as the Zigbee network key (which the Hub section already protects) — but currently unguarded. Include **govee2mqtt, Mosquitto and Zigbee2MQTT/ZHA** configs in the set too.
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
- **⚠️ The Unraid box is the *compute* SPOF — and it takes the alarm + CCTV with it.** The *network* SPOF is handled above, but HA, Frigate, the **alarm brain** and RAG all run on one box, and RAID protects the *disks*, not the box. Its death = the whole house goes dumb **and CCTV + the alarm die at once** — exactly when you might want them (e.g. an intruder who pulls the server). Mitigate three ways: **(a)** keep critical control **local** (Zigbee groups, lock-resident codes — already in the plan); **(b)** a **break-glass standby** — a cheap **Raspberry Pi with a minimal HA + a spare Zigbee stick**, restorable from a recent backup, to run lights/locks/alarm essentials; **(c)** give the **siren a trigger path that doesn't depend on the box** (a Zigbee siren bound to a local group / coordinator-side rule) so "smash the server" can't silently disarm the house.
- See also: the **confirmed-unlock** and **multi-turn confirmation** loops in the Locks section and the integration doc — the security gate and the "yes" antecedent must not depend on a cloud/service that can be down.

### Monitoring beyond the server

The Unraid health section covers the box; also watch the **edges**: UCG-Max status, **SD-WAN tunnel up/down**, **WAN reachability**, and a **Claude-API error-rate** counter.

**Split by who's alerting, though** — anything reported *by HA* (push / toast / proactive Claude) only works while HA is up, so it can't tell you HA/Unraid is down. That "is it even up?" question belongs to the **independent off-site watchdog** (Healthchecks dead-man's-switch + Uptime Kuma at Selby + gateway-level offline alerts) described in [Server health monitoring → "Watching the watcher"](#server-health-monitoring-unraid). Use HA's rails for *detail while running*; the external watchdog for *availability*.

## Operations: network scheme, accounts & updates

### Network & IP scheme + as-built docs

- **Define the VLAN/IP scheme now** (IoT / voice / CCTV / guest / main), **non-overlapping with Selby** (e.g. `10.10.x` here, `10.20.x` there) — it's a prerequisite for the SD-WAN, guest isolation and the camera egress-blocking the privacy plan relies on.
- **🎮 Keep the gaming PC and the Steam Deck on the *same* VLAN** (the main/trusted one). Game-stream discovery (Steam Remote Play / Moonlight) uses broadcast/mDNS and silently breaks across VLANs — so don't split the office gaming PC from the lounge Deck dock. If they must be segmented, you'll need an **mDNS reflector** + the specific Remote Play/Moonlight ports opened on the UCG-Max. Bake this into the scheme so the segmentation doesn't quietly kill streaming. (See "Game streaming (office → lounge)".)
- **🔁 Matter / HomeKit / AirPlay / Cast can't be fully VLAN-isolated either — the security goal fights the protocol.** The hardening plan wants IoT on a segregated VLAN with egress blocked, but **Matter (the Meross plugs), AirPlay 2, Chromecast and the Matter Server all rely on mDNS/multicast that doesn't cross VLANs**, and the Matter Server must share the plugs' L2 (it commissions on the same subnet). So you **can't cleanly put Matter devices on a separate VLAN from HA.** Design the scheme around it: **keep Matter/AirPlay/Cast devices on HA's VLAN**, or run an **mDNS reflector + IGMP snooping** so discovery crosses the boundary. Decide this *before* drawing the VLAN map — it's the same trap as the gaming one above.
- Keep **as-built documentation**: a **patch-panel port map**, a **device/IP inventory**, and the VLAN plan. Cheap to do as you go, painful to reconstruct later. (The "friendly names" convention is good; this is the infrastructure equivalent.)

### Accounts, credentials & access

- **Secrets management** — decide where the Claude/ElevenLabs API keys, lock challenge tokens and UniFi/Unraid/Grocy/Immich logins live (HA `secrets.yaml` hygiene + a password manager), and a rotation policy.
- **Multi-admin + break-glass** — two cohabitants (Cam + Nova) plus a remote co-admin (dad, via the SD-WAN). Define HA admin accounts with **2FA** and a **recovery/break-glass** procedure if the primary owner is unavailable.
- **Per-person capability model** — who can do *what* by voice? Lock/unlock, heating, alarm disarm and "away" should be gated by person (and guests/children must **not** trigger Tier-2 actions). This is the voice-ID + presence work made into a policy.

### Software updates & change management

- **Don't auto-update the house.** HA's `x.0` releases break things; Frigate/Qdrant/Ollama move fast. **Pin container versions**, read release notes, and test major HA updates against a **backup/VM clone** before rolling forward. A broken update at 6pm shouldn't mean no lights.

### Running cost — always-on power

- **Budget the continuous draw, not just the kit price — and we now have real numbers.** The current smart meter shows **~358 kWh / £86 in May 2026 (≈£0.26/kWh all-in)**, i.e. the **whole home already averages ~480 W**, and **~1,962 kWh / £505 across Jan-Jun** (winter-weighted → roughly **3,500-3,800 kWh / £900-1,000 a full year**).
  - **The Unraid box is already owned and running** — measured at **~100 W idle, ~150 W under load** — so its draw is already *inside* that ~480 W figure today. It's a **fixed ~100-150 W**, not a "buy something efficient" decision.
  - **The genuinely *new* Woodhouse load** is therefore mostly the **2.5G gateway + PoE switch driving 4-5 cameras + doorbell + voice nodes + tablets ≈ ~120-160 W**, plus the **extra server load when Frigate runs full CCTV** (this is where a **Coral TPU earns its keep on power** — ~2 W for detection vs **+20-40 W** continuously on CPU/iGPU, every hour of every day).
  - **Net:** total always-on at Woodhouse ≈ **~220-300 W (~£500-680/yr)**, of which roughly **~£300-400/yr is new spend** over today. Still a meaningful bump — so it's worth (a) **HDD spin-down + the Coral** to keep the owned box near idle, (b) sanity-checking the **UPS runtime** maths, and (c) the **solar/battery provisioning** below, which now has real numbers behind it. Confirm the actual figure with one of the owned energy plugs once it's all running.

### Privacy / compliance note (UK)

- Face recognition of visitors + **ALPR** of plates + 30-day digests edge into **UK GDPR** territory once you process/retain footage of non-household members or the street beyond your boundary. Note the **domestic-purposes exemption limits**, add **recording signage**, and set a **retention + lawful-basis** line for ALPR and face data. (See also the Privacy section below.)

## 3D printing (mounts & enclosures)

For a build with this many sensors, cameras and DIY boards, a cheap 3D printer pays for itself — less as a strict "cheaper than buying brackets" sum, more because a lot of what's needed **can't be bought** and every DIY-electronics item needs a housing.

- **What it makes:** mmWave/PIR/contact-sensor mounts and corner wedges, camera angle adapters + cable-gland covers, Voice PE / WiiM / tablet mounts and bezels, **enclosures for the ESP32 boards** (BT proxies, WLED, keg flow-meter, load cells), Shelly relay boxes, the OpenTherm Gateway case, the NFC dock, smart-mirror frame parts, and head-end cable management (combs, raceway clips, DIN clips). Huge free libraries (Printables / MakerWorld) already have models for this exact kit.
- **Don't print:** load-bearing brackets (TV mounts — buy metal). Print housings, sensor mounts, bezels and cable management.
- **Kit:** a **Bambu Lab A1 Mini (~£200-250)** — appliance-tier, near-zero tuning — plus **PETG** for anything near heat/radiators and **ASA** for the few outdoor/sunny camera mounts (PLA sags in heat/UV; PETG/ASA don't).
- **Verdict:** ~£250 all-in, pays back across the dozens of mounts/enclosures in this plan and keeps earning afterwards. Phase 0 — useful from day one.

### AI-assistant layer (HA + Claude)

Once it's on the network the printer is just another entity, so it folds into the same HA + Claude layer as everything else:

- **HA integration** — Bambu printers expose to HA (HACS **Bambu Lab** integration): live progress %, time remaining, stage, nozzle/bed/chamber temps, **AMS** filament type + levels, and the camera. HA knows exactly what it's doing.
- **Proactive Claude** — "your print's done" (routed to desk/phone/voice by presence), "print failed — spaghetti at 40%", "AMS filament low — 8% left", "printer's been idle and hot for 2 hours." Same proactive rails as the washing-machine / keg triggers.
- **Voice queries + control** — "how long left on the print?", "what's the printer doing?"; pause / stop / chamber-light via the integration (**Tier-2 confirm for stop** — it bins the print).
- **Local AI failure detection** — Bambu's built-in first-layer/spaghetti detection, or self-host **Obico** on Unraid for camera-based AI failure detection that can **auto-pause + alert** (same local-AI theme as Frigate / CodeProject.AI).
- **🔥 Safety (it's a heater — highest-value bit)** — put the printer on a **power-monitoring smart plug** (an owned Meross): auto-cut power a set time after the print finishes and cools, flag "drawing power but finished hours ago", raise over-current/anomaly alerts, and put it in the **smoke-sensor** zone. Printers are a genuine fire risk left running unattended — this is the part not to skip.
- **Nice-to-haves** — per-print energy cost (via the plug), a "print done" camera snapshot to your phone, auto timelapse.

Cost: **£0 software** (HACS integration + Obico are free) on an owned Meross plug. Phase 5, alongside the proactive layer.

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

### Phase 2 — Security, entry & safety

The "make the house safe and watched" layer — everything that wants the PoE backbone in first.

- **PoE switch** + first 2-3 cameras (front + rear)
- PoE video **doorbell**
- **Smart locks on all three entries** — front door, conservatory door, dining French doors
- **Frigate storage setup** — dedicated Unraid share, SSD cache, sized for 4 cameras
- **Face recognition** set up in Frigate (free, just train it)
- **Phone presence** via HA Companion app on all phones
- **Life-safety sensors** — Zigbee smoke + CO alarms, water-leak sensors, motorised mains stopcock (auto-shut on a confirmed leak)

### Phase 3 — Living-space coverage & comfort

Turn the main living areas into proper smart spaces.

- Add **lounge + garage voice nodes**
- **Lounge lighting** upgrade to Zigbee
- **Lounge AV** — AVR (secondhand), 5.1 speakers + sub, the TCL 65" QD-Mini LED TV
- **First wall tablet** (kitchen)
- **First Aqara FP2** (lounge) — proves the mmWave concept
- **Heating control online** — OpenTherm Gateway, 5× Aqara E1 TRVs on upstairs radiators

### Phase 4 — Whole-house coverage

Fill in every remaining room so coverage is complete.

- Remaining **bedroom + conservatory voice nodes**
- Remaining **cameras** (side of house)
- **Multi-room audio** — WiiM endpoints + powered speakers in the other rooms
- **Scene buttons** on landing + bedside
- Motion / contact / presence sensors
- **Remaining wall tablets** (lounge, hall, master bedroom)
- **Second FP2** (master bedroom), FP1E (bathroom), optional FP1E (office)
- Remaining Zigbee lighting across the house

### Phase 5 — Automation brain, comfort & resilience

The custom software brain, plus the comfort and resilience layers that build on full coverage.

- **Blinds** — the master-bedroom bay is the funded baseline (3 motors); everything else (other bedrooms, lounge bay, conservatory, dining/kitchen) is a bonus tier if budget allows
- **Proactive Claude service** deployed (custom Python on Unraid)
- **PC integration** — HASS.Agent on the gaming PC, pinned browser dashboard, optional custom Tauri overlay app
- **Desk setup** — 34" ultrawide + dual-head KVM; game streaming office → lounge (Sunshine/Moonlight to the docked Steam Deck)
- **Focus mode** — NFC focus-dock + green→red accountability LED
- **Energy monitoring** via Shelly EM on the consumer unit
- **UFH zone control** — Shelly relays on lounge + dining actuators, Aqara temp sensors, HA Generic Thermostats configured
- **Air quality** — CO2/VOC sensors (feeds night-purge ventilation + comfort)
- **Smart mirror** in bathroom (DIY) + scene buttons next to it and around the house
- **Resilience** — second UPS for network gear, off-site encrypted backup to Selby, dead-man's-switch heartbeat, off-site Uptime Kuma probe
- Driveway beam + ALPR, adaptive lighting, calendar + energy dashboards

### Phase 6 — Extras & signature behaviours

- Smart plugs for dumb appliances (+ safety plugs for straighteners/iron)
- Grocy inventory + cooking / delivery / guest / laundry automations, photo digest
- Robot vacuum integration
- Garden / outbuilding + plant sensors
- **Garage bar** — WLED, NFC jukebox, keg flow + bottle inventory, bar-fridge + CO2 safety
- **Garage door automation** (if the car-in-garage commitment is made)
- Voice biometrics (optional, Picovoice Eagle or similar)
- Window motors (only if scope decided early and cable provision made)

### Phase 7 — Optional / when-installed

- Outdoor irrigation (OpenSprinkler) + garden moisture sensors
- Premium air quality (Airthings View Plus, master bedroom)

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
- [ ] VLAN scheme defined (IoT / voice / CCTV / guest / main) — implementation now easy with the UCG-Max, just needs the scheme designed. **Must be planned across both sites** (Woodhouse + Selby) with non-overlapping subnets so the Site Magic SD-WAN routes don't collide — e.g. `10.10.x` here, `10.20.x` in Selby. **Design in the mDNS/multicast traps:** Matter/AirPlay/Cast devices can't be cleanly isolated from HA's VLAN, and gaming discovery breaks across VLANs (mDNS reflector / IGMP snooping or keep them co-located). See Operations → Network scheme.
- [ ] **Matter: Wi-Fi vs Thread per device → is a Thread Border Router needed?** Matter-over-Wi-Fi (Meross) needs none; any Matter-over-Thread device does (OpenThread BR on the SkyConnect/ZBT-1, or an Apple TV/HomePod/Aqara hub). See Hub & radios.
- [ ] **2.4 GHz RF plan** — fix the Wi-Fi (1/6/11) + Zigbee (15/20/25) + Thread channels so they don't collide, and confirm enough **mains-powered Zigbee routers** to mesh out to the garage. See Hub & radios → RF planning.
- [ ] **Smoke/CO alarms meet building regs?** Confirm the *primary* alarms are **mains-interlinked Grade D (BS 5839-6 / your nation's spec)** with HA reading them — not cheap Zigbee units doing the life-safety job. See Safety sensors.
- [ ] **Solar PV / home battery / EV-charger first-fix provisioning** — decide what to rough in while walls are open (spare CU way, roof + driveway routes, battery space). Conduit now vs re-chase later. See Pre-move-in wiring.
- [x] ~~**UniFi gateway model confirmed** from dad~~ → **resolved: UniFi Cloud Gateway Max (UCG-Max).** No built-in PoE → 16-port PoE switch stays required; no built-in WiFi → Decos stay as APs. Runs Site Magic SD-WAN for the Selby link (see "Networking").
- [ ] **Inter-site SD-WAN (Selby)** — confirm both sites are under one UniFi account, then enable Site Magic. Woodhouse public dynamic IP is the reachable endpoint (Selby CGNAT is fine). Blocker is only the cross-site subnet scheme above.
- [ ] Garage heated/insulated enough for voice node electronics in winter?
- [ ] **Home insurance — does the policy require an *approved* (NSI/SSAIB) monitored alarm?** If so, the DIY HA/Alarmo system may not satisfy it on its own. Check before relying on it as *the* alarm. See "Alarm & security".
- [ ] **Do you want police response?** If yes, decide on a **paid monitored/ARC bridge** (the only route to a police URN) — otherwise the system stays self-monitored (alerts you + Dad in Selby). See "Alarm & security".
- [x] ~~CCTV HDD — dedicated unprotected disk vs array expansion~~ → **resolved: one 8-12 TB disk into the array, shared media + CCTV.** Reserve the camera slice with Minimum-Free-Space fences (Unraid media shares + the \*arr apps, ~1.5-2 TB) so media can't starve Frigate; pin the frigate share to the disk. See "Storage sizing (Unraid)". 1TB NVMe cache already owned.
- [ ] **Voice PE — confirm lounge performance before buying the full set.** Test one unit in the lounge with media playing (worst-case acoustics); decide STT route (local Whisper+GPU vs HA Cloud) off the back of it. See "Is Voice PE good enough?" above.
- [x] ~~AVR target brand (Denon/Marantz vs Yamaha)~~ → **resolved: deal-led** — buy whichever of HEOS (Denon/Marantz) or MusicCast (Yamaha) comes up cheap and clean secondhand; both integrate well with HA.
- [ ] Lounge speaker positions chalked on wall before plastering (5.1 positions only)
- [ ] **WiiM tier per room** — Mini (Wi-Fi) vs Pro (Ethernet, for the wired rooms: kitchen, conservatory, garage) vs Amp (drives passive/in-ceiling, no separate powered speaker). See "Is WiiM the right pick?" — affects the audio budget.
- [ ] Blind motor power: mains vs battery decision (deferred to contractor walk-through — but provision/conduit must be in place by then)
- [ ] **Window actuator power approach**: battery (~£200/window, 6-12mo battery) vs mains-powered (~£400/window, needs 13A spurs in electrical scope) vs PoE (rare, needs Cat6 spec amendment)
- [ ] **Window types confirmed** on site survey for motor compatibility (casement/tilt-and-turn straightforward; sash + bay sections need specialist actuators)
- [ ] Second front-of-house camera on opposite corner? *(My rec: skip — central front + doorbell already cover entry)*
- [ ] Conservatory blind count and style (thermal/pleated vs standard roller) — affects budget significantly
- [ ] Car-in-garage decision (affects garage door automation in phase 6)
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
| Motorised blinds — **baseline: master-bedroom bay only** (3 motors) | £450 |
| Motorised blinds — *bonus, if budget allows* (other bedrooms, lounge bay, conservatory, dining, kitchen) | +£1,750-2,950 |
| Sensors, buttons, misc Zigbee tat | £150-250 |
| **Lighting/locks/blinds total (baseline)** | **~£1,400-1,900** |
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
- Cooling: **£0 — no AC** (passive only: shading, fans, night-purge ventilation)
- Displays / extras (incl. presence sensors): **~£860-1,150**
- Signature behaviours hardware (CO2, plant care, driveway): **~£430-520**
- Window motors (~7-8 actuators, every non-conservatory): **~£1,600-3,600**
- **Total range: ~£9,820-14,975**

Plus optional add-ons (Airthings master ~£250, outdoor irrigation ~£150-300, window motors as scoped) if pursued.

Excludes: AV speaker cable (in cabling scope), AV extenders for HDMI-over-Cat6 runs (if used), any contingency.

Phases 2-4 budget separately as decisions firm up.
