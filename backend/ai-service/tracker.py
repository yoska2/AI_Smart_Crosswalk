# PROVENANCE: [LIEL] Sprint 4 point 1 (new file). Style follows Rachel's Sprint 3 vision/ modules.
"""
tracker.py
----------
Gives every detected PERSON a stable id across video frames, so risk_rules.py can
measure direction, speed and time-to-edge per person (YOLO alone sees each frame
independently and does not know that "the person in frame 12" is the same one
as in frame 11).

Two implementations behind one small interface  ->  tracker.process(t, frame):
  * SimpleTracker : our own matcher on top of detector.detect() (no extra dependencies,
                    fully unit-tested). Default (config.TRACKER = "simple").
  * YoloTracker   : ultralytics' built-in ByteTrack (model.track). Better on real
                    footage, needs ultralytics installed. config.TRACKER = "yolo".

Both return the SAME Track/Observation objects, plus the phones seen in the frame.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from statistics import median

import config


# ---------------------------------------------------------------- data model
@dataclass
class Observation:
    """One person in one analysed frame."""
    t: float                 # video time in seconds (frame_index / fps)
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    truncated: bool          # box touches a frame border -> its height is not the real body height
    phone: bool              # a cell phone was assigned to this person in this frame

    @property
    def width(self) -> float:
        return self.x2 - self.x1

    @property
    def height(self) -> float:
        return self.y2 - self.y1

    @property
    def anchor(self) -> tuple[float, float]:
        """Bottom-centre of the box = where the feet touch the ground (Rachel's ROI_ANCHOR)."""
        return (self.x1 + self.x2) / 2.0, self.y2

    @property
    def chest(self) -> tuple[float, float]:
        """Yossef's chest point (35% down from the top of the box), used for the phone rule."""
        return (self.x1 + self.x2) / 2.0, self.y1 + 0.35 * self.height


@dataclass
class Track:
    """One person followed over time."""
    track_id: int
    observations: list[Observation] = field(default_factory=list)

    @property
    def born_at(self) -> float:
        return self.observations[0].t

    @property
    def last(self) -> Observation:
        return self.observations[-1]

    def age(self, t: float) -> float:
        return t - self.born_at

    @property
    def h_ref(self) -> float:
        """
        Reference body height in pixels: the median height of the UNTRUNCATED
        observations (a box cut by the frame border is shorter than the person).
        Falls back to all observations when every box is truncated.
        """
        good = [o.height for o in self.observations if not o.truncated]
        return float(median(good if good else [o.height for o in self.observations]))

    def window(self, t: float, seconds: float) -> list[Observation]:
        """Observations from the last `seconds` of video time."""
        return [o for o in self.observations if o.t >= t - seconds]

    def trim(self, t: float) -> None:
        """
        Forget history nobody looks at any more (long videos / webcams would otherwise grow
        without bound). The FIRST observation is always kept: born_at and the H4 rule need it.
        """
        keep_from = t - max(config.RISK_WINDOW_SECONDS, 2 * config.TRACK_MAX_GAP_SECONDS) - 1.0
        if len(self.observations) > 2 and self.observations[1].t < keep_from:
            first = self.observations[0]
            self.observations = [first] + [o for o in self.observations[1:] if o.t >= keep_from]


# ---------------------------------------------------------------- helpers on raw detections
def is_truncated(det: dict, frame_w: int, frame_h: int, margin: float = config.TRUNCATION_MARGIN) -> bool:
    """True if the box touches any border of the frame (within `margin` of the frame size)."""
    mx, my = margin * frame_w, margin * frame_h
    return (det["x"] <= mx or det["y"] <= my
            or det["x"] + det["width"] >= frame_w - mx
            or det["y"] + det["height"] >= frame_h - my)


def iou(a: dict, b: dict) -> float:
    """Intersection-over-union of two detector boxes {x, y, width, height}."""
    ax2, ay2 = a["x"] + a["width"], a["y"] + a["height"]
    bx2, by2 = b["x"] + b["width"], b["y"] + b["height"]
    iw = max(0.0, min(ax2, bx2) - max(a["x"], b["x"]))
    ih = max(0.0, min(ay2, by2) - max(a["y"], b["y"]))
    inter = iw * ih
    union = a["width"] * a["height"] + b["width"] * b["height"] - inter
    return inter / union if union > 0 else 0.0


def suppress_duplicates(persons: list[dict], iou_threshold: float = config.DUPLICATE_IOU) -> list[dict]:
    """YOLO sometimes returns two boxes for one person; keep the more confident one."""
    kept: list[dict] = []
    for det in sorted(persons, key=lambda d: d["confidence"], reverse=True):
        if all(iou(det, k) < iou_threshold for k in kept):
            kept.append(det)
    return kept


def assign_phones(persons: list[dict], phones: list[dict],
                  max_dist_h: float = config.PHONE_MAX_DIST) -> set[int]:
    """
    Decide which persons are holding a phone in this frame. One phone -> one person
    (nearest first), so a single phone cannot light up a whole group.
    A phone counts if its centre is within `max_dist_h` body heights of the chest
    point, OR it lies inside the upper 60% of the person's box (hand at waist level).
    Returns the indices (into `persons`) that hold a phone.
    """
    candidates = []                                   # (distance_in_h, person_index, phone_index)
    for pi, p in enumerate(persons):
        h = p["height"] or 1.0
        cx, cy = p["x"] + p["width"] / 2.0, p["y"] + 0.35 * h
        for qi, q in enumerate(phones):
            qx, qy = q["x"] + q["width"] / 2.0, q["y"] + q["height"] / 2.0
            d = ((qx - cx) ** 2 + (qy - cy) ** 2) ** 0.5 / h
            inside_upper = (p["x"] <= qx <= p["x"] + p["width"]) and (p["y"] <= qy <= p["y"] + 0.6 * h)
            if d < max_dist_h or inside_upper:
                candidates.append((d, pi, qi))
    holders: set[int] = set()
    used_phones: set[int] = set()
    for d, pi, qi in sorted(candidates):
        if pi in holders or qi in used_phones:
            continue
        holders.add(pi)
        used_phones.add(qi)
    return holders


def split_detections(detections: list[dict]) -> tuple[list[dict], list[dict]]:
    """detector.detect() output -> (persons, phones). Vehicles are ignored here."""
    persons = [d for d in detections if d["classId"] == config.PERSON_CLASS_ID]
    phones = [d for d in detections if d["classId"] == config.PHONE_CLASS_ID]
    return persons, phones


# ---------------------------------------------------------------- SimpleTracker
class SimpleTracker:
    """
    Frame-to-frame matcher. For every live track we PREDICT where the person should
    be now (last position + last velocity * dt) and match the closest new box, as
    long as it is within a plausible distance (gate) and has a plausible size.
    Unmatched boxes start new tracks; tracks unseen for TRACK_MAX_GAP_SECONDS die.
    """

    def __init__(self, detect_fn=None):
        # Dependency injection: tests pass a stub, production uses detector.detect (YOLO).
        if detect_fn is None:
            from detector import detect as detect_fn       # lazy: importing detector loads YOLO
        self.detect = detect_fn
        self._tracks: dict[int, Track] = {}
        self._next_id = 1
        self._dead: list[tuple[float, tuple[float, float], float]] = []   # (t_death, anchor, h_ref)

    # -- public -----------------------------------------------------------------
    @property
    def live_tracks(self) -> list[Track]:
        return list(self._tracks.values())

    def process(self, t: float, frame) -> tuple[list[Track], list[dict]]:
        """
        Detect + match one frame. Returns (tracks seen in THIS frame, phone detections).
        """
        frame_h, frame_w = frame.shape[:2]
        persons, phones = split_detections(self.detect(frame))
        persons = [p for p in persons if p["height"] >= config.MIN_PERSON_HEIGHT_PX]
        persons = suppress_duplicates(persons)
        holders = assign_phones(persons, phones)

        observations = [
            Observation(
                t=t, x1=p["x"], y1=p["y"], x2=p["x"] + p["width"], y2=p["y"] + p["height"],
                confidence=p["confidence"],
                truncated=is_truncated(p, frame_w, frame_h),
                phone=(i in holders),
            )
            for i, p in enumerate(persons)
        ]

        self._expire(t)
        seen = self._match(t, observations)
        return seen, phones

    def recently_died_near(self, t: float, anchor: tuple[float, float], h_ref: float) -> bool:
        """
        True if a track ended a moment ago close to `anchor`. Used by risk_rules to
        avoid calling a re-identified person a "sudden appearance" (H4).
        """
        horizon = 2.0 * config.TRACK_MAX_GAP_SECONDS
        for t_death, dead_anchor, dead_h in self._dead:
            if t - t_death > horizon:
                continue
            dist = ((anchor[0] - dead_anchor[0]) ** 2 + (anchor[1] - dead_anchor[1]) ** 2) ** 0.5
            if dist <= 3.0 * max(h_ref, dead_h):
                return True
        return False

    # -- internals ----------------------------------------------------------------
    def _expire(self, t: float) -> None:
        """Retire tracks that have not been seen for TRACK_MAX_GAP_SECONDS."""
        for tid in [tid for tid, tr in self._tracks.items() if t - tr.last.t > config.TRACK_MAX_GAP_SECONDS]:
            tr = self._tracks.pop(tid)
            self._dead.append((tr.last.t, tr.last.anchor, tr.h_ref))
        self._dead = [d for d in self._dead if t - d[0] <= 4.0 * config.TRACK_MAX_GAP_SECONDS]

    @staticmethod
    def _predict(track: Track, t: float) -> tuple[float, float]:
        """Constant-velocity prediction of the anchor at time t."""
        obs = track.observations
        ax, ay = obs[-1].anchor
        if len(obs) < 2:
            return ax, ay
        px, py = obs[-2].anchor
        dt_prev = obs[-1].t - obs[-2].t
        if dt_prev <= 0:
            return ax, ay
        dt = t - obs[-1].t
        return ax + (ax - px) / dt_prev * dt, ay + (ay - py) / dt_prev * dt

    def _match(self, t: float, observations: list[Observation]) -> list[Track]:
        """Greedy global assignment: cheapest (track, observation) pairs first."""
        pairs = []                                                   # (cost, track_id, obs_index)
        for tid, tr in self._tracks.items():
            dt = max(t - tr.last.t, 1e-6)
            h_ref = tr.h_ref
            gate_px = max(config.TRACK_MATCH_SPEED_H_PER_S * dt * h_ref, config.TRACK_MIN_GATE_PX)
            pred = self._predict(tr, t)
            for oi, ob in enumerate(observations):
                if not (ob.truncated or tr.last.truncated):
                    ratio = ob.height / tr.last.height if tr.last.height > 0 else 1.0
                    lo, hi = config.TRACK_SIZE_RATIO
                    if not (lo <= ratio <= hi):
                        continue
                ax, ay = ob.anchor
                dist_px = ((ax - pred[0]) ** 2 + (ay - pred[1]) ** 2) ** 0.5
                if dist_px <= gate_px:
                    pairs.append((dist_px / h_ref, tid, oi))

        matched_tracks: set[int] = set()
        matched_obs: set[int] = set()
        seen: list[Track] = []
        for _cost, tid, oi in sorted(pairs):
            if tid in matched_tracks or oi in matched_obs:
                continue
            self._tracks[tid].observations.append(observations[oi])
            self._tracks[tid].trim(t)
            matched_tracks.add(tid)
            matched_obs.add(oi)
            seen.append(self._tracks[tid])

        for oi, ob in enumerate(observations):
            if oi in matched_obs:
                continue
            tr = Track(track_id=self._next_id, observations=[ob])
            self._next_id += 1
            self._tracks[tr.track_id] = tr
            seen.append(tr)
        return seen


# ---------------------------------------------------------------- YoloTracker (optional)
class YoloTracker:
    """
    Uses ultralytics' built-in tracker (ByteTrack) which assigns ids itself.
    Same interface as SimpleTracker. NOTE: not exercised by the unit tests on this
    machine (ultralytics is not installed here); it is the production option for
    real footage once the team installs requirements.txt.
    """

    def __init__(self, model=None, tracker_cfg: str = "bytetrack.yaml"):
        if model is None:
            from detector import model                        # the YOLO model Rachel's detector loads once
        self.model = model
        self.tracker_cfg = tracker_cfg
        self._tracks: dict[int, Track] = {}
        self._dead: list[tuple[float, tuple[float, float], float]] = []

    @property
    def live_tracks(self) -> list[Track]:
        return list(self._tracks.values())

    def process(self, t: float, frame) -> tuple[list[Track], list[dict]]:
        frame_h, frame_w = frame.shape[:2]
        results = self.model.track(frame, persist=True, verbose=False, tracker=self.tracker_cfg,
                                   conf=config.CONFIDENCE_THRESHOLD,
                                   classes=sorted(config.TARGET_CLASS_IDS))[0]
        persons, phones, ids = [], [], []
        for box in results.boxes:
            class_id = int(box.cls[0])
            x1, y1, x2, y2 = (float(v) for v in box.xyxy[0])
            det = {"classId": class_id, "confidence": float(box.conf[0]),
                   "x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1}
            if class_id == config.PERSON_CLASS_ID and box.id is not None:
                persons.append(det)
                ids.append(int(box.id[0]))
            elif class_id == config.PHONE_CLASS_ID:
                phones.append(det)
        holders = assign_phones(persons, phones)

        seen: list[Track] = []
        for i, (p, tid) in enumerate(zip(persons, ids)):
            if p["height"] < config.MIN_PERSON_HEIGHT_PX:
                continue
            ob = Observation(t=t, x1=p["x"], y1=p["y"], x2=p["x"] + p["width"], y2=p["y"] + p["height"],
                             confidence=p["confidence"], truncated=is_truncated(p, frame_w, frame_h),
                             phone=(i in holders))
            tr = self._tracks.setdefault(tid, Track(track_id=tid))
            tr.observations.append(ob)
            tr.trim(t)
            seen.append(tr)

        for tid in [tid for tid, tr in self._tracks.items() if t - tr.last.t > config.TRACK_MAX_GAP_SECONDS]:
            tr = self._tracks.pop(tid)
            self._dead.append((tr.last.t, tr.last.anchor, tr.h_ref))
        self._dead = [d for d in self._dead if t - d[0] <= 4.0 * config.TRACK_MAX_GAP_SECONDS]
        return seen, phones

    def recently_died_near(self, t: float, anchor: tuple[float, float], h_ref: float) -> bool:
        return SimpleTracker.recently_died_near(self, t, anchor, h_ref)   # same logic, same fields


def build_tracker(detect_fn=None):
    """Factory driven by config.TRACKER."""
    if config.TRACKER == "yolo":
        return YoloTracker()
    return SimpleTracker(detect_fn=detect_fn)
