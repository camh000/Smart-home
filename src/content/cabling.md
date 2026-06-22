# Woodhouse Road Cabling Specification (Rev B)

**Property:** Woodhouse Road, Sheffield, South Yorkshire, S12 — 3-bed semi-detached
**Works:** Whole-house refurbishment / rewire — structured data, AV and audio cabling
**Issued:** Revised May 2026 (Rev B — CCTV, doorbell, speaker cable and head-end UPS added; testing tightened)
**Status:** Issued to trades for pricing and scoping. Design intent only — see Section 11.
**This data, AV and audio cabling is a SEPARATE DELIVERABLE from the electrical installation and its certification. The electrical certificate does not sign off this work. Acceptance of this package is conditional on the testing and labelling in Section 9 being completed and evidenced.**

## 1. Scope and contractual note

This specification covers the structured cabling infrastructure to be installed during the refurbishment, while walls, floors and ceilings are open. It does not cover active network or AV equipment, which the client will provide and commission separately.
The contractor is responsible for supply (unless stated client-supplied), installation, termination, testing and labelling of all cabling and containment described herein. The following are explicitly in scope:
- All horizontal data cabling, terminated both ends, tested and labelled.
- Dedicated AV (HDMI-over-structured-cable) runs, installed as continuous home runs — see Section 6.
- Audio cabling provision to specified rooms — see Section 7.
- Speaker-level cabling to lounge surround / Atmos positions, installed during first fix — see Section 7.
- Cat6 runs for PoE cameras and PoE doorbell — see Section 5.
- External and inter-building containment (conduit/duct) installed during the open-wall and groundworks phases.
Patch panels are client-supplied (reclaimed enterprise panels). The contractor is to terminate to these panels and is responsible for confirming compatibility before first fix.

## 2. Phasing

The client's strategy is to install and prove the passive infrastructure first, then connect existing active equipment. No new networking hardware is required. The active equipment is the client's existing three TP-Link Deco XE75 mesh units, which will run on wired (Ethernet) backhaul over this cabling. Topology: one Deco as the gateway/root (ground floor, at the incoming internet connection), one Deco on the first floor, and one Deco in the garage — each on a dedicated wired drop back to the head-end. No UniFi or other equipment is needed for day-one operation. The contractor's deliverable is the tested passive plant; active equipment is client-supplied and out of scope.
- First fix: pull all cabling and install all containment before plasterboard. This is the point of no return.
- Second fix: terminate all cabling to keystones and to the client-supplied patch panels.
- Test and certify every run; label both ends; hand over results (Section 9).
- Client connects existing active equipment. Future equipment upgrade is out of scope.

## 3. Cable specification

### 3.1 Cable type

All data and AV runs are to be Cat6 (solid copper, U/UTP minimum; F/UTP where required by the chosen AV extender manufacturer). External and external/eave runs are to be UV-grade Cat6. Cat5e is not accepted for this installation.
Rationale (the cabling is installed once, in walls that will not be reopened):
- Cat6 is required to carry 4K HDMI-over-structured-cable at room distances; Cat5e caps this at 1080p.
- Cat6 supports current and emerging multi-gigabit (2.5G/5G/10G) rates at house run-lengths; Cat5e does not carry 10G usefully.
- The one-time termination effort is justified by a permanent, non-upgradable capability ceiling being avoided.

### 3.2 Termination method

Field-crimped RJ45 plugs onto solid-core cable are not accepted other than for unavoidable equipment tails. The structured installation is to be punch-down throughout:
- Room ends: punch down to Cat6 keystone jacks in faceplates.
- Head-end: punch down to the client-supplied patch panels.
- Equipment jumpers: factory-made Cat6 patch leads only.
Cat6a is not required and should not be substituted — there is no 10GbE-to-the-desk requirement and the additional stiffness/termination difficulty is not warranted.

## 4. Topology and comms head-end

Strict home-run (star) topology. Every run returns to a single comms head-end. No daisy-chaining and no spurs.
Recommended head-end: Bedroom 3 (the box room) — central on the upper floor and the intended home office/equipment location. Fallback: under-stairs cupboard in the hall.
The head-end requires, as part of the electrical scope but coordinated with this package:
- A dedicated mains spur with multiple socket outlets.
- **A position and dedicated socket for a UPS** (client-supplied; sized for the active equipment, NAS and any attached storage). UPS is mandatory at this position to prevent corruption of attached storage during brownouts or short cuts. The contractor is to allow physical space for a 1U/2U or tower UPS adjacent to the patch panel.
- Adequate ventilation — the location must not become a sealed thermal trap (it will house a switch, gateway, UPS, NAS and possibly a server). Consider passive ventilation grilles in the door or a low-noise extract fan; the room is small and the equipment is always-on.
- A clear, accessible cable route from both floors and from the external/garage entries.

## 5. Data drop schedule

Standard provision is two Cat6 drops per location; high-use locations are increased as below. Quantities are design intent. All cable lengths are to be measured on site — the source floor plan is explicitly not to scale.
CCTV camera positions, the PoE doorbell and external runs are included in the table below and are part of this scope. Final camera positions are subject to a site walk-through (see Section 11).

| **Location** | **Data drops (Cat6)** | **AV/HDMI runs** | **Notes** |
| --- | --- | --- | --- |
| **INTERIOR** |  |  |  |
| **Lounge** | 4 | 1 | Front room. Heavy AV: TV, console, streaming/Remote-Play box, spare. |
| **Dining Room** | 2 | 1 | Flexible / future desk or AV position. |
| **Kitchen** | 2 | 0 | Smart-home hub, appliance/future. |
| **Conservatory** | 1 | 0 | Optional, low priority. Glass room. |
| **Hall — Deco 1 (root)** | 1 | 0 | Root Deco at incoming internet connection. Surface/shelf or wall position (not ceiling). Standard data drop — Decos are not PoE. |
| **Bedroom 1 (master)** | 2 | 1 | Desk / wall-mounted TV. |
| **Bedroom 2 (office)** | 2 | 1 | Two desks for occupants both working from home. AV drop reserved for future display if desk layout changes. |
| **Bedroom 3 / head-end** | Head-end | 0 | Patch panel + active kit here. PC/server served direct. |
| **Landing — Deco 2** | 1 | 0 | First-floor Deco. Surface/shelf or wall position (not ceiling). Standard data drop — Decos are not PoE. |
| **Bathroom** | 0 | 0 | No data drop. Note: room was previously labelled as wet room on the floor plan; planned conversion to standard bathroom. |
| **EXTERIOR / CCTV / DOORBELL** |  |  |  |
| **Front (high eave/soffit)** | 1 (PoE camera) | 0 | Covers porch, bays, driveway. External-grade Cat6 in conduit. Terminates at head-end. |
| **Rear (above conservatory)** | 1 (PoE camera) | 0 | Garden coverage. External-grade Cat6 in conduit. |
| **Side passage** | 1 (PoE camera, subject to site) | 0 | Covers side approach. To confirm on site — may not be physically feasible on a semi. |
| **Front door (low)** | 1 (PoE doorbell) | 0 | PoE doorbell at standard doorbell height. Cat6 terminated for PoE injection at head-end. |
| **External wall/eave (future AP)** | 1 (future) | 0 | Future provision only. Existing Decos are not outdoor-rated and will NOT serve this. Install conduit/drop now (cheap with walls open) for a possible future outdoor AP; leave capped if unused. |
| **Garage exterior** | 1 (PoE camera) | 0 | Can share garage fibre conduit. External-grade Cat6. |
| **Garage interior (optional)** | 1 (PoE camera, optional) | 0 | Workshop/storage coverage. Client to confirm. |
| **Garage** | See §8 | — | Inter-building link. Fibre recommended — see Section 8. Deco 3 lives here on the wired link. |

Indicative head-end port count: approximately 22–25 with cameras, doorbell and future external AP included. A 24-port patch panel (minimum) is required; if a 48-port is available it provides useful headroom. Containment and back-boxes to be sized with spare capacity.

## 6. AV cabling (HDMI over structured cable)

AV runs are functionally different from data runs and must be installed accordingly. Getting this wrong produces 4K dropout and sparkle that cannot be fixed without re-cabling.
- Single cable per AV position. Modern HDBaseT carries video, audio and control over one Cat6 run. Do not install dual-cable baluns.
- AV runs are continuous home runs, point-to-point from source location to display location. They must NOT pass through the patch panel.
- Minimise connection points. Industry practice is a maximum of approximately two connection points on an HDBaseT link. Terminate as directly as possible to the extender; avoid intermediate keystones/junctions on AV runs.
- AV runs are to be separately labelled and clearly distinguished from data runs at both ends.
AV extender equipment is client-supplied. The contractor is to confirm the cable category/screening required by the client's chosen extender before first fix and flag any conflict with Section 3.

## 7. Audio cabling

Two separate cable types are in scope for audio: structured cable (Cat6) for line-level or networked audio endpoints, and speaker cable for the lounge surround / Atmos installation.

### 7.1 Cat6 for line-level / networked audio

Where audio distribution is specified to a room, cabling is to be provided as line-level / networked audio infrastructure, not speaker-level.
- Do not run speaker-level audio over structured cable — conductor resistance makes this lossy and unsatisfactory for permanent runs.
- Provide Cat6 to each audio position for either balanced line-level audio to a local amplifier, or a networked streaming endpoint.
- Final audio architecture (local amplification vs networked endpoints) to be confirmed with the client before first fix, as it changes the equipment at each end.

### 7.2 Speaker cable for lounge surround / Atmos

In addition to the Cat6 audio provision, dedicated speaker-level cabling is to be installed in the lounge during first fix:
- Surround / rear speaker positions: 2-core OFC speaker cable (minimum 2.5mm²) from the AV stack position to each surround speaker location.
- Atmos / overhead positions (if specified by client): same cable spec, run to in-ceiling or upfiring speaker positions.
- Cable to be left long-tailed at both ends with sufficient slack for final positioning and termination.
- Speaker cable to be clearly labelled and separated from data/AV runs.
The final lounge speaker layout (5.1, 5.1.2, 5.1.4 etc.) and exact speaker positions are to be confirmed and chalked on the wall by the client before first fix. Atmos overhead positions are critical to confirm before plasterboard, as retrofitting in-ceiling cable runs is not feasible without ripping the ceiling down.

## 8. Inter-building link to detached garage

This item cannot be priced or specified until the house-to-garage cable distance and route are measured on site. The duct/trench must be installed during the groundworks phase — not retrofitted.
The garage is a detached structure with its own electrical supply. A copper Ethernet run between two separately-earthed buildings is a recognised ground-potential-difference and surge risk.
- Recommended: a single fibre run between house and garage (armoured or in duct), with media conversion at each end. This eliminates the inter-building earthing risk entirely.
- At the house side: the fibre terminates into a media converter at the head-end (Bedroom 3). Internal route from the point of garage cable entry into the house up to the head-end must be measured on site — this may be a long internal run. Containment between cable entry and head-end is to be installed during first fix.
- Media converter power: the house-side converter requires a mains socket at the head-end (typically a 5–12V DC unit, 5–10W). Client-supplied; contractor to confirm socket provision in the head-end electrical scope.
- At the garage: the link terminates (fibre media converter if fibre is used) into the client's third Deco unit, powered from the garage's existing supply. No PoE or additional access point required — the Deco provides garage coverage. The garage camera run (see Section 5) can share the fibre conduit.
- If copper is used instead, it must be in dedicated duct and the inter-building earthing must be assessed and bonded by the electrical contractor — fibre is the preferred solution and avoids this.
- Install inter-building duct/conduit during groundworks regardless of the cable medium finally chosen.

## 9. Testing, labelling and acceptance

Acceptance of this package is conditional on the following being completed and evidenced. The electrical certificate does not cover this.
- **Permanent-link certification** of every data run to Cat6 (TIA-568.2-D / ISO/IEC 11801 Class E) using a recognised cable certifier such as Fluke Networks DSX-5000, DSX-8000 or equivalent. Continuity-only testers (tone & probe, basic LAN testers, e.g. Fluke MicroScanner) are NOT accepted for certification.
- **One PDF certificate per drop**, with each certificate identified by the labelling scheme. Combined output as a single PDF report is acceptable provided each run is individually identifiable.
- Every run labelled at both ends with a consistent scheme, matched to the patch panel. Labelling scheme to be agreed with the client before second fix.
- AV and audio runs separately identified and labelled. Speaker cable runs separately identified.
- Camera and doorbell runs identified by camera position (FRONT-HIGH, REAR-HIGH, etc.) at both ends.
- Inter-building and external runs confirmed installed in containment and tested.
- Test results and an as-installed drop list handed to the client before final sign-off.
- A visual inspection by or on behalf of the client before plasterboard is closed at first fix.

## 10. Materials summary (passive only)

- Cat6 solid-core cable (U/UTP; F/UTP where AV extender requires) — sufficient for all data, AV, camera and doorbell runs plus wastage.
- External/UV-grade Cat6 for the outdoor AP drop and all external camera and doorbell drops; in conduit.
- Inter-building fibre (preferred) or duct-grade copper for the garage link — quantity pending site measurement.
- Speaker cable (2-core OFC, minimum 2.5mm²) for lounge surround / Atmos positions — quantity pending confirmation of speaker layout.
- Cat6 keystone jacks, faceplates and back-boxes for all room ends.
- Patch panels: client-supplied (reclaimed). 24-port minimum required. Contractor to confirm compatibility.
- Containment: conduit/duct/trunking for external, inter-building and head-end routes.
Active equipment (gateway, switches, access points, AV extenders, audio endpoints, cameras, doorbell, PoE injectors/switch, UPS, media converters, NAS) is client-supplied and out of scope.

## 11. Information required before commencement

The following must be resolved before this package is priced or work begins. Items 1–3 are blocking.
- Confirmation of purchase completion (design assumes the client is the buyer).
- Measured house-to-garage distance and route (blocks Section 8).
- Confirmed property orientation (front/rear) for external AP, camera and drop placement.
- Head-end location confirmed (Section 4).
- On-site measurement of all run lengths — the source floor plan is not to scale and no dimension in this document is a cut length.
- Outdoor coverage extent (patio / whole plot / to garage) confirmed.
- Client's chosen AV extender confirmed, to verify cable category/screening (Section 6).
- Camera positions confirmed (front high, rear high, side passage if feasible, garage exterior, garage interior if required) — site walk-through with client before first fix.
- PoE doorbell location confirmed (typically front door / porch wall, mounted at standard doorbell height).
- Lounge surround / Atmos speaker layout confirmed and chalked on wall before plasterboard (Section 7.2).
- Coordination with electrical scope: head-end UPS socket, head-end ventilation, sockets at each Deco position, sockets at each voice-node position.
- Coordination with HVAC / mechanical scope: any refrigerant pipe routes, condensate drains or comms cables for planned AC / heat-pump units to be roughed in during first fix while walls are open. These are not within this package but the routes share the same opportunity window.
End of specification. This document is design intent issued for pricing. No dimension herein is to be used as a cable-cutting length; all runs are to be measured on site.
