# Claude + Home Assistant Integration Design

Technical design for the voice assistant pipeline. Companion to `smart_home_plan.md` (which covers the physical project — kit, rooms, costs, phasing).

## Overview

The home's voice assistant is built on Home Assistant (HA) as the orchestrator, with Claude as the conversation/reasoning layer. Voice nodes (HA Voice PE) in each room handle wake-word, mic and local TTS playback. Everything is local except the Claude API call itself.

## Software stack

| Layer | Choice | Notes |
|---|---|---|
| Smart home hub | **Home Assistant** | VM or Docker on Unraid |
| Voice satellites | **HA Voice Preview Edition** | Wyoming protocol, plug-and-play |
| Wake word | **openWakeWord** | Local, runs on each node |
| STT | **Whisper** (faster-whisper) | Local |
| LLM / conversation | **Claude API** | Tool use to call HA services |
| TTS | **Piper** (local) + **ElevenLabs** (premium) | Piper for "okay, done"; ElevenLabs sparingly |
| NVR | **Frigate** | Docker on Unraid (separate from voice stack) |

**Voice PE alternatives worth noting:** if the Voice PE underperforms (some users report it as a bit slow or short on far-field mic range), the M5Stack Atom Echo and ESP32-S3-BOX are well-supported by HA's Wyoming protocol and cheaper. The Voice PE remains the path of least resistance for phase 1.

## Conversation flow

```
Voice PE (kitchen) hears wake word
   → streams audio to HA over Wyoming
   → HA runs Whisper STT → "turn the lounge lights down to 30 percent"
   → HA sends text to Claude with tool definitions + room context
   → Claude responds with tool_use: light.turn_on(entity="light.lounge", brightness_pct=30)
   → HA executes the service call
   → HA returns result to Claude
   → Claude generates response text: "okay, lounge lights at 30 percent"
   → HA runs Piper TTS → audio to kitchen Voice PE
```

End-to-end target latency: **2-4 seconds**. Alexa is ~1.5s for comparison.

## Implementation route

Start with HA's **built-in Anthropic conversation agent integration**. Working in 10 minutes. Fork to a custom Python wrapper later if/when limitations bite.

Two-model approach to balance speed and capability:

- **Haiku** for routine control commands (fast, cheap)
- **Sonnet** for questions, multi-step reasoning, ambiguous requests

HA supports multiple agents per pipeline, so routing between them is feasible.

## Reactive vs proactive — two modes

The setup runs in two complementary modes:

- **Reactive** (phase 1+) — user speaks, Claude responds. Built on HA's built-in Anthropic integration. Everything else in this doc applies to this mode.
- **Proactive** (phase 5+) — Claude initiates. Volunteers info, warns about anomalies, addresses people by name. Built on a custom Python service running on Unraid because HA's built-in integration is reactive-only.

## Proactive Claude — custom service architecture

A small Python service subscribes to HA events and decides when Claude should speak unprompted.

### Flow

```
Event source (HA event bus, cron, sensor trigger)
   → Python service receives event
   → Builds context prompt (who's home, time, related state)
   → Calls Claude: "Worth saying something? If so, what? If not, return null."
   → If text returned: route TTS to the room the person is in
   → If null: do nothing
```

### Key design decisions

- **Self-suppression** — Claude itself decides whether to speak. Prompt instructs it to return empty for trivial or wrong-time triggers. Avoids being naggy.
- **Per-room routing** — target the room where the person actually is (via presence). Don't broadcast to empty rooms.
- **Quiet hours** — no proactive output between (say) 10pm and 7am except for genuine alerts (front door unlocked at 3am).
- **Throttling** — same trigger type can't fire more than once per N minutes.
- **Per-person addressing** when person ID is available.

### Example triggers

| Trigger | Source | Possible output |
|---|---|---|
| Person approaching home | HA Companion phone geofence | "Nova's about 10 minutes away" |
| Calendar event soon | Google Calendar integration | "Cam, your 10am in 5" |
| Weather change | Met Office / OpenWeather API | "Heavy rain in an hour" |
| Energy anomaly | Shelly EM CT clamp | "Immersion's been on 3 hours — turn off?" |
| Long-running state | HA state timer | "Front door unlocked 90 minutes" |
| Cycle complete | Smart plug power drop | "Washing machine's done" |
| Unexpected motion | Frigate detection | "Motion at the side gate" |

### Implementation outline

Roughly 200 lines of Python. FastAPI service receives HA webhooks, builds prompts, calls Claude API, returns TTS commands back to HA via REST. Runs in a Docker container on Unraid alongside HA itself.

### Output routing — the right surface for the moment

Proactive output doesn't always belong on a speaker. The service decides delivery channel based on context:

| Person state | Channel |
|---|---|
| At PC, on video call | Silent desktop toast only |
| At PC, not on call | Desktop toast + optional office TTS |
| In a room with a Voice PE | TTS to that room |
| In a room with a tablet | TTS + tablet visual |
| Away from home | Push notification to phone |
| Multiple people, contextual to one | Targeted (phone/PC of that person) |

Output channels available:

- **Voice PE TTS** — primary, room-specific
- **Wall tablets** — kitchen, hall, optional master
- **PC desktop overlay** — via HASS.Agent or custom Tauri app (phase 5+)
- **Phone push** — via HA Companion app
- **Smart mirror** — bathroom (Aqara button-driven, but can also receive proactive)

## Person identification

Three tiers, layered. Most use cases covered by tiers 1 and 2. Per-room presence (mmWave) sits alongside as a separate "where is someone" signal that combines with person ID.

### Tier 1 — Phone presence (free, day-one)

HA Companion app on each person's phone. Tracks zones (home, work, away). HA exposes entities like `person.cam`, `person.nova`.

**Uses:** "Is Nova home?", arrival/departure triggers, per-person context in Claude prompts.

### Tier 2 — Face recognition (free, phase 2+)

Frigate has built-in face recognition (and optional CompreFace integration for more accuracy). Train with a handful of photos per person.

**Uses:** "Cam just arrived" (front door cam), camera-driven welcome scenes, security context ("unknown person at the gate").

### Tier 3 — Voice biometrics (paid SDK, phase 6+, optional)

Picovoice Eagle or similar. Identifies the speaker from their voice signature.

**Uses:** per-person responses without needing phone proximity.

### Per-room presence — Aqara mmWave (phase 3+)

Not "who" but "where". Aqara FP2 (multi-zone) and FP1E (single zone) detect breathing-level micro-movement, so they correctly report occupancy when someone is sitting still on a sofa, reading, or in the shower.

Integrated via HA's **HomeKit Controller** — no cloud, no Aqara hub needed. Both sensors are HomeKit-native.

**Combined inference:** "Cam's phone is home + lounge FP2 reports sofa occupied + last front-door face recognition was Cam 2 minutes ago" → strong confidence Cam is in the lounge. Proactive Claude can route TTS to the lounge Voice PE and address him by name.

### PC activity — HASS.Agent (phase 5+)

Another presence signal worth knowing about. **HASS.Agent** runs on Windows and exposes ~30 sensors to HA via MQTT: active/idle/locked, focused window, webcam/mic in use, etc. Tells HA "the PC is being used" — combined with the office mmWave, gives a high-confidence "Cam's at his desk" signal.

Also doubles as an output surface — see "Output routing" below.

## Behaviour design

### Tone

Conversational and brief. Acknowledge the action, don't be robotic.

- ✅ "Got it, turning the lounge lights on."
- ✅ "Done — both doors locked."
- ❌ "I have successfully executed the command to turn on the lounge lights for you."
- ❌ "Lights on."

### Exposed entities — tiered

**Tier 1 — direct (no confirmation):**

- All lights
- All blinds
- All scenes and scripts
- Media players (Plex, WiiMs, AVR)
- Smart plugs (Meross + future)
- Non-critical switches

**Tier 2 — requires verbal confirmation before action:**

- All three door locks — front, conservatory, dining (lock and unlock)
- Heating / thermostat set-points
- Any alarm or siren
- Disarming any security state
- Anything that materially costs money or could wake people

**Enforcement is two-layered:**

1. **System prompt instruction** (phase 1, day one): *"Before locking or unlocking any door, changing heating set-points, or triggering an alarm, always confirm with the user first and wait for an explicit yes before acting."*

2. **Tool-layer enforcement for locks specifically** (phase 1, before locks are physically installed): wrap the lock service calls in a custom HA script that requires a `confirmed=true` parameter. Claude's tool definition for locks gets a confirmation-token parameter that must match a recently-issued challenge. Prompt-based confirmation is not bulletproof, and lock-by-mistake is a real failure mode. Heating and alarms can stay prompt-based for longer.

Memory across turns is the other piece needed to make confirmation work naturally — see "Open implementation questions".

### Vague commands — predefined scene library

Build these as HA scripts/scenes so Claude can call them as single tools:

| Trigger phrase(s) | Scene |
|---|---|
| "cosy" | Warm low lights, side lamps on, overheads off |
| "bright" | All overheads up to 100% |
| "movie" / "cinema" | TV-side lights dim, AVR on, source = Plex |
| "reading" | Main light dimmed, side lamps full |
| "goodnight" | All downstairs off → confirm → lock doors, heating to night |
| "good morning" | Gradual sunrise lights, kitchen on, blinds up |
| "away" | Everything off, locks on, cameras armed |
| "I'm cold" | Heating +1°C (Tier 2, asks first) |
| "I'm hot" | Fans on, blinds to shade, night-purge if cool outside |
| "party" | Colour-cycle in living areas |

System prompt instruction: *"When a vague command matches a predefined scene, use it. If the request is unclear and no scene matches, ask one short clarifying question."*

### Room awareness

Default scope is **the room the command came from**. The Voice PE tells HA which room; HA passes that to Claude as context.

Overrides Claude should recognise:

- *"in the lounge"* / *"in bedroom 1"* — apply there instead
- *"upstairs"* / *"downstairs"* — apply by floor
- *"everywhere"* / *"all rooms"* / *"the whole house"* — apply globally

System prompt instruction: *"Default device scope is the room the command originated from. If the user specifies another location, use that. 'Everywhere' means the whole house."*

### System prompt — first draft

```
You are the voice assistant for a home. You control lights, blinds, locks,
media, heating and scenes via tool calls.

Tone: conversational and brief. Acknowledge what you did. Don't be robotic
or overly chatty.

Room scope: default to the room the request came from (provided in context).
Override when the user names a different room. "Everywhere" means all rooms.

Confirmation required before: locking/unlocking doors, changing heating
set-points, triggering alarms. Ask first, wait for explicit yes.

Vague commands: prefer a matching predefined scene. If none matches and the
request is unclear, ask one short clarifying question.

Don't invent devices. If an entity isn't in your tool list, say so.
```

## Latency budget

Rough per-stage targets:

| Stage | Target | Notes |
|---|---|---|
| Wake word detection | <100ms | Local on Voice PE |
| STT (Whisper) | 500-1500ms | `faster-whisper` with `base` or `small` model |
| Claude API (Haiku) | 600-1200ms | Network + inference |
| Claude API (Sonnet) | 1000-2500ms | Slower, smarter |
| Tool execution (HA) | <100ms | Local |
| TTS (Piper) first audio | 200-500ms | Streaming starts as soon as first sentence ready |
| **Total perceived (Haiku path)** | **~2.0-3.5s** | Acceptable |
| **Total perceived (Sonnet path)** | **~2.5-5s** | Use only when needed |

Perceived latency improves significantly with **response streaming** — TTS starts speaking the first sentence while Claude is still generating the rest.

**Streaming TTS is in scope from phase 1, not deferred.** Piper supports it natively via Wyoming. Configure HA to begin TTS playback as soon as Claude streams the first sentence, rather than waiting for the full response. Perceived latency drops from 2-4s to feeling effectively instant for most acknowledgements.

## Costs

Claude API at typical home-control turn size:

- Input: ~1-3k tokens (system prompt + tool definitions + context + user message)
- Output: 100-300 tokens

Per request: **fractions of a penny** with Haiku, **a few pence** with Sonnet.

At ~200 requests/day:

- Haiku-only: **~£2-5/month**
- Sonnet-only: **~£15-30/month**
- Tiered (Haiku routine, Sonnet for the hard 10%): **~£5-10/month**

Negligible vs hardware budget.

## Entity exposure strategy

HA generates Claude's tool definitions automatically based on which entities are "exposed to Assist". Settings → Voice Assistants → Expose. Important because:

- Unexposed entities can't be controlled (intentional safety)
- More exposed entities = larger prompt = slower + more expensive
- Sensible defaults: lights, locks, blinds, scenes, scripts, media players. **Skip diagnostic sensors** (battery levels, signal strength, etc.) unless asked about explicitly.

Use **friendly names** in HA — Claude works much better with `kitchen_ceiling_light` than `light.0x00158d000abc1234`.

## Open implementation questions

- [x] ~~Conversational memory~~ → **resolved: full RAG from phase 1.** Jump path. See Memory architecture section below.
- [x] ~~Confirmation enforcement at the tool layer: locks~~ → **resolved: phase 1 task** (see Tier 2 above + Phase 1 checklist). Heating/alarms remain prompt-based, hardened in phase 2+.
- [x] ~~Multi-step / clarification turns~~ → **resolved naturally by the RAG memory layer** ("set a timer" → "for how long?" — the memory wrapper holds the open intent across turns). **🔁 Dependency-loop caveat:** don't make *safety-critical* multi-turn confirmation depend on the full Qdrant/Python RAG stack — if that service is down, "yes" loses its antecedent and either fails or (worse) attaches to the wrong intent. Hold the **short-term conversational buffer in HA itself** (a lightweight last-N-turns store), so "shall I unlock the front door?" / "yes" still resolves correctly during a memory-service outage. RAG is for *long-term* recall; the open-intent buffer that gates Tier-2 actions must survive without it.
- [ ] Per-user voice ID — relevant for per-person responses without phone proximity. Picovoice Eagle, ~£100/year. Worth phase 5 not phase 6 given two cohabitants want personalised behaviour
- [x] ~~Fallback when Claude API is slow/down~~ → **resolved: Phase-1 deliverable** (see plan → Resilience → Graceful degradation). Timeout → HA's built-in local intents; the fallback must cover **lights, goodnight, and a confirmed unlock** at minimum, and explicitly decide whether the local path is allowed to perform Tier-2 actions or defers to the physical key.
- [ ] Rate limit handling for the proactive service — bounded queue, throttle classes per trigger type, drop trivia first

## Memory architecture (RAG + structured)

The conversational buffer above is the floor — useful for "yes do that" but won't carry context across days or remember anything we said last winter. Properly long-term memory needs a real retrieval layer.

**Pure RAG is the wrong default.** Similarity search for structured facts ("lounge default is 21°C") will sometimes drift through paraphrasing and is always slower than a direct lookup. The right architecture is **hybrid** — structured store + vector store, queried in parallel.

### Components

| Layer | Pick | Why | Cost |
|---|---|---|---|
| Vector DB | **Qdrant** (Docker on Unraid) | Best perf/memory ratio for domestic scale. Mature Python client. | ~100MB RAM idle |
| Embedding model | **bge-small-en-v1.5** via Ollama | CPU-only, ~80MB model, ~50ms per embed | ~200MB RAM loaded |
| Structured store | **HA helpers + custom SQLite table** | HA already has SQLite. Custom table for memory schema. | Negligible |
| Orchestration | **Custom Python service** | The same proactive Claude service from phase 5. Memory layer ≈ 200-300 LOC. | — |

Total footprint on Unraid: ~400MB RAM and <1GB storage even after years. Effectively free.

### What goes where

**Structured store** — facts with clean keys:

- Per-person preferences (Cam: cool lighting, Nova: warm)
- Default temps, default scenes, DND hours
- Birthdays, anniversaries, allergies, dietary preferences
- Recurring routines and explicit decisions

**Vector store** — unstructured narrative:

- Conversation turns (every one, embedded + stored with timestamp + room + person)
- Observations Claude has noted ("Cam always works late on Wednesdays")
- Discussions and decisions ("we agreed not to use the conservatory in February")
- Tagged events with context ("doorbell at 14:23, Amazon delivery")

### Retrieval at query time

Both stores queried in parallel. Results joined and injected into Claude's context:

- Structured lookup: <1ms (direct query by user / room / topic)
- Vector search: ~30ms (top-5 cosine similarity, time-decay weighted)
- Both run async, joined before the Claude API call

Latency added: barely perceptible.

### What writes to memory

1. **Every conversation turn** → embedded + stored automatically
2. **"Remember that..."** → tagged as a fact, priority weight in retrieval
3. **Nightly distillation** — Claude reviews the day's conversations + events, writes summary observations as new memories. This is where pattern inference lives ("you tend to start work at 9 on Mondays, 8:30 on Fridays")
4. **State changes** — new device added, room change, new household member → written automatically

### Multi-person, multi-privacy

Every memory is tagged by person: `cam` / `nova` / `shared` / `private-cam` / `private-nova`.

At query time, voice ID (Picovoice Eagle, phase 5) determines whose memories surface:

- Cam's private memories only retrieved during Cam's conversations
- Shared memories visible to both
- Nova can have private-to-Nova memories Cam never sees
- Guest mode disables retrieval entirely (no personal memory surfaces while strangers in the house)

Plus a voice command **"Claude, forget that"** drops the last N turns for the speaker. **"Claude, what do you remember about X?"** triggers a transparent retrieval dump so the user can audit + delete entries.

### Time decay + garbage collection

- Recent memories weighted higher in retrieval (exponential decay over months)
- Memories older than 6 months without re-access get distilled into a summary memory, originals pruned
- Daily and weekly summaries become memories themselves — preserves the gist
- User-facing inspection UI shows what Claude knows, with delete buttons

### Phasing

**Decision: jump path chosen.** Phase 1 ships with full RAG (Qdrant + embeddings + retrieval), no buffer intermediate. ~1 weekend extra upfront vs no rework later.

| Phase | Memory layer |
|---|---|
| **1** | **Qdrant + embeddings from day one.** Conversation turns persisted. Basic vector retrieval. |
| 2 | Structured store added (SQLite + HA helpers). Hybrid retrieval — both stores queried in parallel. |
| 3 | Per-person tagging activated via voice ID (Picovoice Eagle). Private memories enforced. Guest mode. |
| 4 | Nightly distillation job. Pattern inference. Memory inspection UI. |

### Open implementation choices

- [x] ~~Vector DB choice~~ → **Qdrant.** Docker on Unraid, mature Python client, no auth overhead on LAN.
- [x] ~~Phasing approach~~ → **Jump.** Phase 1 = Qdrant + RAG direct.
- [ ] ~~Embedding model: bge-small vs nomic-embed-text~~ → **defer until benchmarking.** Install both, test against representative queries on Cam's actual data before committing.
- [ ] Memory inspection UI — HA Lovelace dashboard widget, or standalone web page on the proactive service?
- [ ] Autonomous write threshold — when can Claude write to long-term memory without explicit instruction? Daily summaries yes; arbitrary observations maybe; per-person opinions probably needs user opt-in
- [ ] Re-embedding strategy when models change (swap embedding model in future — re-embed everything, or just new memories?)

## Phase 1 implementation checklist

### Core install

1. Install HA on Unraid (VM or Docker)
2. Install HA Voice PE × 2 (kitchen + master bedroom), pair to HA
3. Configure voice pipeline: openWakeWord + Whisper + Piper (streaming TTS enabled)
4. Add Anthropic integration, paste API key
5. Pick Haiku as default agent, optionally Sonnet as secondary
6. Expose 4× Govee bulbs as test entities
7. Write minimal system prompt (use draft above)
8. Test: "turn on the lounge light" / "make it 20%" / "off"
9. Build first scene ("cosy") and test vague-command resolution
10. Build "goodnight" scene with confirmation step for door locks (once locks exist)
11. Install HA Companion app on all phones, set up Person entities and home zone (Tier 1 person ID)

### Memory layer (RAG, jump path)

12. Deploy Qdrant via Docker on Unraid. Allocate a separate volume for persistence. Confirm web UI is LAN-only.
13. Install Ollama (or sentence-transformers) for embeddings. Pull both bge-small-en-v1.5 and nomic-embed-text for benchmarking.
14. Build the Python wrapper service. Two hooks: (a) post-turn — embed + write to Qdrant; (b) pre-prompt — retrieve top-5 + inject into context. ~400-500 LOC total.
15. Define memory schema: `{text, embedding, timestamp, person, room, source, tags[]}`. Single collection in Qdrant for now.
16. Implement time-decay scoring: exponential decay weight applied to similarity score so recent memories rank higher when ties.
17. Benchmark bge-small vs nomic-embed-text. Pick winner based on retrieval quality on ~20 representative test queries against Cam's actual data.
18. Implement "remember that..." explicit-write recognition in the system prompt. Tag explicit writes with priority weight in retrieval.
19. Test end-to-end: "Claude, remember that the lounge default is 21°C" → wait an hour → "what's the lounge default?" — should retrieve correctly.
20. Test the cross-turn confirmation flow that motivated this: "shall I unlock the front door?" / pause / "yes" — Claude should infer the antecedent from the recent memory.
21. Set up a daily backup of the Qdrant volume to a separate Unraid share. Memory loss is a real failure mode.
