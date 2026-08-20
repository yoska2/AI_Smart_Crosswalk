# Sprint 4 — Design Decisions, Conclusions & Open Questions

Smart City Crosswalk System — AI "brain", server communication, and live frontend updates.
Working notes from the design review. "Locked" = agreed; "Open" = to settle with the team.

---

## 1. Physical setup (confirmed)

- Two cameras, one at **each edge of the crosswalk**, mounted where the crossing begins.
- Each looks **back along the sidewalk, ~3 m of approach**. The road/crosswalk surface itself is essentially out of frame.
- Output is **LEDs embedded in the road**, visible to **both drivers and pedestrians**.
- Consequence: this is a **predictive early-warning** system, not crosswalk-occupancy detection. We warn *before* someone steps off the curb.

---

## 2. Decisions locked

**Danger = kinematics, not appearance.**
The core signal is `distance-to-crosswalk + approach speed + deceleration/direction` → a predicted **unsafe entry**. Speed is the backbone; "a child bursting into the road" is fundamentally a *speed* event, not an age event.

**Two thresholds — decouple "record" from "light the road".**
- **Low threshold → log the event to the DB** (essentially every approach): feeds frontend segmentation, analytics, and the training dataset. Costs nothing on the street.
- **High threshold → actuate the road LEDs** (emergencies only): keeps the physical signal rare and meaningful, avoiding **alarm fatigue** (an LED that fires constantly gets ignored — the "cry wolf" effect).

**Person classification is a modifier, never a gate.**
- Child/adult and distracted/on-phone may **lower** the LED threshold (escalate earlier).
- They may **never suppress** an otherwise-emergency trigger. A misclassified sprinting child must still fire the LEDs. Escalate on classification; never gate on it.

**Child vs adult** — estimate **real-world height** via ground-plane calibration (< ~1.3–1.4 m → child). Rough but free now; fine-tune with collected data later.

**Distracted / on phone** — use the COCO **"cell phone" class (67)**: a phone detected near a person's hands is a cheap distraction signal. Optionally add head-pose ("looking down") later.

**Ground-plane calibration is the linchpin.**
A one-time homography (4 known ground points) **per camera** converts pixels → metres, which unlocks all three of: distance-to-crosswalk (required payload field), approach speed (lead time + risk), and real height (child/adult). Highest-value technical task in the sprint.

**Lead-time measurement — start physical, switch to empirical.**
- Now: `lead ≈ 3 m ÷ approach speed`. Worst case a runner ~0.8–1 s.
- Later: measured from tracked entry-to-curb times once footage accumulates.
- The conservative worst case is a **permanent floor**: only ever *tighten* thresholds with data, never loosen below the safe floor.

**The LED threshold is a policy dial, not a constant.**
It balances two real harms: too low → alarm fatigue; too high → missed accidents. Start conservative, log both false-alarm and near-miss rates, tune deliberately, and own it jointly with the crossing operator (municipality).

**Engineering essentials carried from the review (needed for a real camera):**
- **Object tracking** (e.g. ByteTrack via `model.track`) is required — presence-only ROI cannot express direction or speed.
- **Temporal persistence**: require N consecutive confirming frames before firing; emit a matching "danger cleared" event.
- **Live RTSP**: auto-reconnect on stream drop; process the *latest* frame (drop stale ones) — a late detection is a useless detection.
- **`eventId` (UUID)** on every event for idempotency / de-duplication.
- **Endpoint auth** for node → backend (nobody should be able to inject fake alerts).
- **Node heartbeat** so a dead/dark camera is itself detectable (a silent safety camera is a safety incident).

---

## 3. Sprint 4 backend tasks (refined from the brief)

1. **Live AI → server pipeline** — harden the Sprint 3 alert service into the production path.
2. **Danger model** — kinematic risk score (distance + speed + deceleration), producing the **two-threshold** output (log vs LED).
3. **Classifiers as modifiers** — child/adult (height), distraction (phone proximity); both carry confidence, default to `unknown`, never suppress a trigger.
4. **POST payload** (lock with frontend first): `eventId`, `nodeId`/`crosswalkId`, `cameraId`, `timestamp`, `distanceFromCrosswalk`, `approachSpeed`, `riskPercent`/`confidence`, `personType` (child/adult/unknown), `distracted`, `severity`/`ledTriggered`, `imageUrl`.
5. **Snapshot → Cloudinary** — upload annotated frame, store only the returned URL in the DB.
6. **DB schema** — `events` (and probably `nodes`) collections; image field holds the Cloudinary URL.
7. **Socket.io + MongoDB change stream** — on new event insert, push to the frontend in real time.
8. **LED actuation** — see open questions (ownership undecided).

---

## 4. Open questions for the team

**Product / policy**
- **LED actuation ownership**: backend calls an LED-controller endpoint, or the **node drives the LEDs directly** (faster, survives a backend/network outage)? *(Brigal to bring an answer.)*
- **LED threshold / policy**: starting value, who owns it (municipality?), and the tuning process.
- **Privacy & legal**: recording pedestrians is PII (Israel Privacy Protection Law applies in Holon). Lawful basis, retention period, access control, and whether face-containing snapshots are stored at all.

**Interfaces / architecture**
- **Payload schema sign-off with the frontend dev** before coding — their per-crosswalk segmentation depends on these exact fields.
- **Cloudinary upload path**: does the Python node upload directly, or send the image to the backend which uploads?
- **Data model**: separate `nodes` / `events` / `snapshots` collections? Retention?
- **Endpoint auth** mechanism: API key / token / mTLS for node → backend.
- **Two cameras per crossing**: how are their two views merged into one logical crossing, and how do we de-duplicate an event seen by both?
- **Heartbeat / health monitoring** design.

**Feasibility**
- **Latency budget**: given ~0.8–1 s worst-case lead, is CPU inference fast enough end-to-end (detection → LED), or is a GPU / edge device needed?
- **Model sufficiency**: is `yolov8n` good enough at night / in rain, or do we need a stronger model or an IR camera?
- **Calibration process**: how is the per-camera homography captured, and how do we recalibrate when a camera is bumped or moved?
