# PROVENANCE: [LIEL] Sprint 4 point 2 in code (new file). Implements the 12 risk cases agreed by
#             Liel + Rachel + the lecturer (13.9). Replaces Rachel's Sprint 3 roi_monitor.py
#             (one rule: "inside ROI") and the empty Node stub dangerAnalyzer.js.
"""
risk_rules.py
-------------
The "brain": turns a person's TRACK (tracker.py) into one of the 12 agreed risk
cases, or none.

Units (so that the rules do not depend on camera resolution or on how close the
person is to the camera):
  * distances  : body heights (h). dist > 0 = on the sidewalk, dist <= 0 = past the
                 curb line (inside Rachel's ROI polygon).
  * speeds     : body heights per second (h/s). Walking ~0.8-1.5, running >= 2.
  * times      : seconds of VIDEO time.
Metres are only produced when config.METERS_PER_H is calibrated for the camera.

Priority when several cases match one person: High before Medium before Low, and
inside a level: H1 > H2 > H3 > H4 > M4 > M2 > M3 > M1 > L4 > L1 > L3 > L2.
"""
from __future__ import annotations

from dataclasses import dataclass, field
import math
from statistics import median

import cv2
import numpy as np

import config


# ---------------------------------------------------------------- the 12 cases (single source of truth)
CASES: dict[str, tuple[str, str, str]] = {
    # id : (level, Hebrew name, short English reason)
    # --- Low (logged only, no LEDs) ---
    "L1": ("Low",    "הולך רגל נע במקביל לכביש",              "moving parallel to the road, not approaching"),
    "L2": ("Low",    "הולך רגל עומד רחוק מהשפה",              "standing still, not near the edge"),
    "L3": ("Low",    "הולך רגל מתרחק",                        "moving away from the crossing"),
    "L4": ("Low",    "המתנה שקטה (עומד במקום)",               "standing still at the edge"),
    "M1": ("Low",    "התקרבות רגילה למעבר",                   "normal walking approach to the crossing"),
    "M3": ("Low",    "קבוצת הולכי רגל מתקרבת",                "group of pedestrians approaching together"),
    "M4": ("Low",    "נוכחות באזור המעבר",                    "stepping into / standing in the crossing zone"),
    # --- Medium (early warning, LEDs) ---
    "M2": ("Medium", "הסחת דעת בהתקרבות לכביש (טלפון)",       "approaching the edge while holding a phone"),
    "M5": ("Medium", "התקרבות מהירה ללא האטה",                "brisk approach with no sign of slowing"),
    "MW": ("Medium", "כלי גלגלים מתקרב ומאט אך לא מספיק",     "wheeled approacher slowing but not enough"),
    "H2": ("Medium", "ילד מתקרב לכביש",                      "child approaching the edge"),
    # --- High (imminent, LEDs) ---
    "H1": ("High",   "התפרצות (מהירות גבוהה)",                "bursting toward the road at high speed"),
    "H3": ("High",   "מוסח דעת שלא עוצר בשפה",                "distracted by phone, not slowing at the edge"),
    "H4": ("High",   "הופעה פתאומית ומהירה בקרבת השפה",       "sudden appearance near the edge, moving toward it"),
    "H5": ("High",   "כניסה לכביש ללא עצירה",                 "fast approach, not slowing - entering without stopping"),
    "H6": ("High",   "ילד מתפרץ לכביש",                       "child running toward the edge"),
    "HW": ("High",   "כלי גלגלים מתקרב במהירות",              "wheeled approacher coming in fast / not slowing"),
}
# High first, then Medium, then Low; within a level, most specific/severe first.
PRIORITY = [
    "H6", "H1", "H5", "H3", "H4", "HW",          # High
    "H2", "M2", "M5", "MW",                        # Medium
    "M4", "L4", "M1", "L1", "L3", "L2", "M3",     # Low
]
LEVEL_RANK = {None: 0, "Low": 1, "Medium": 2, "High": 3}

# A polygon vertex this close to a frame border is treated as lying ON the border
# (Rachel's trapezoid ends at y = 0.95: that means "the bottom of the picture").
BORDER_EPS_Y = 0.05
BORDER_EPS_X = 0.01


# ---------------------------------------------------------------- geometry
class EdgeZone:
    """
    The curb-line region as a polygon in NORMALISED coordinates (0..1), converted to
    pixels for the frame being analysed. Default = Rachel's config.ROI_POLYGON_NORM.
    Per-camera calibration replaces the polygon, nothing else changes.
    """

    def __init__(self, polygon_norm=None):
        raw = list(polygon_norm or config.ROI_POLYGON_NORM)
        # Snap border-lying vertices onto the border so "inside" and "curb edges" agree.
        self.polygon_norm = [
            (0.0 if x <= BORDER_EPS_X else 1.0 if x >= 1.0 - BORDER_EPS_X else x,
             1.0 if y >= 1.0 - BORDER_EPS_Y else y)
            for x, y in raw
        ]

    def pixel_polygon(self, frame_w: int, frame_h: int) -> np.ndarray:
        return np.array([(x * frame_w, y * frame_h) for x, y in self.polygon_norm], dtype=np.float32)

    def curb_edges(self, frame_w: int, frame_h: int) -> list[tuple[np.ndarray, np.ndarray]]:
        """
        The polygon edges that represent the CURB LINE: every edge except those lying on a
        border of the frame (bottom / left / right). Distances are measured to these only, so
        a person deep inside the zone is "far past the curb", not "close to the picture's bottom".
        """
        pts = self.polygon_norm
        edges = []
        for i in range(len(pts)):
            (ax, ay), (bx, by) = pts[i], pts[(i + 1) % len(pts)]
            if (ay == 1.0 and by == 1.0) or (ax == 0.0 and bx == 0.0) or (ax == 1.0 and bx == 1.0):
                continue
            edges.append((np.array([ax * frame_w, ay * frame_h]), np.array([bx * frame_w, by * frame_h])))
        if not edges:                                    # degenerate polygon: fall back to all edges
            poly = self.pixel_polygon(frame_w, frame_h)
            edges = [(poly[i], poly[(i + 1) % len(poly)]) for i in range(len(poly))]
        return edges

    @staticmethod
    def _point_segment_distance(p: np.ndarray, a: np.ndarray, b: np.ndarray) -> float:
        ab = b - a
        denom = float(ab @ ab)
        u = 0.0 if denom == 0 else max(0.0, min(1.0, float((p - a) @ ab) / denom))
        return float(np.linalg.norm(p - (a + u * ab)))

    def signed_distance_px(self, point: tuple[float, float], frame_w: int, frame_h: int) -> float:
        """
        Distance from `point` to the curb line in pixels:  > 0 on the sidewalk (outside the
        zone), < 0 past the curb (inside the zone), 0 on the line.
        """
        poly = self.pixel_polygon(frame_w, frame_h)
        p = np.array([float(point[0]), float(point[1])])
        inside = cv2.pointPolygonTest(poly, (p[0], p[1]), False) >= 0
        d = min(self._point_segment_distance(p, a, b) for a, b in self.curb_edges(frame_w, frame_h))
        return -d if inside else d


# ---------------------------------------------------------------- results
@dataclass
class Kinematics:
    """Everything the rules look at, for one person, over the last RISK_WINDOW_SECONDS."""
    n_obs: int
    window_seconds: float
    motion_known: bool           # enough history (>= 2 frames spanning MIN_WINDOW_SECONDS) to judge motion
    dist_first: float            # h, at the start of the window
    dist_last: float             # h, now
    dist_max: float              # h, farthest point in the window
    approach_speed: float        # h/s, positive = getting closer to the edge (net over the window)
    lateral_speed: float         # h/s, component of the motion parallel to the curb
    speed: float                 # h/s, magnitude (net displacement / time)
    recent_speed: float          # h/s, over the last RECENT_SECONDS only (decides "standing" without lag)
    net_move_h: float            # h, net displacement over the window (box jitter stays below MIN_MOVE_H)
    last_approach: float         # h/s, approach over the last STEP_LOOKBACK_SECONDS
    time_to_edge: float          # s at the current approach speed (inf if not approaching)
    stationary: bool
    approaching: bool
    parallel: bool
    moving_away: bool
    receded: bool                # moved noticeably away at some point inside the window
    not_slowing: bool            # second half of the window at least as fast as the first half
    stepping_down: bool          # crossed from the sidewalk into the zone during the window, while approaching
    appeared_suddenly: bool      # entered from a frame border, already near, approaching, not a re-identified person
    phone_fraction: float
    has_phone: bool
    person_type: str             # 'child' | 'adult' | 'unknown'
    person_type_source: str      # 'calibration' | 'relative' | 'none'
    truncated_last: bool
    mean_confidence: float
    h_ref_px: float


@dataclass
class Assessment:
    """The verdict for one person (or for the group, track_id = -1)."""
    track_id: int
    level: str | None            # 'Low' | 'Medium' | 'High' | None
    case_id: str | None          # 'L1'..'H4' | None
    case_name: str | None        # Hebrew, as agreed
    reason: str
    confidence: int              # 0-100, how sure we are the case is real
    person_type: str
    distracted: bool
    metadata: dict = field(default_factory=dict)

    @property
    def danger(self) -> bool:
        """Two-threshold policy: only Medium/High ask for LEDs; Low is logged only."""
        return LEVEL_RANK[self.level] >= LEVEL_RANK["Medium"]


# ---------------------------------------------------------------- the engine
class RiskEngine:
    """Computes Kinematics for each track and applies the 12 rules."""

    def __init__(self, zone: EdgeZone | None = None, cfg=config, stream_start_t: float | None = None):
        self.zone = zone or EdgeZone()
        self.cfg = cfg
        # Video time at which analysis started: people already in the first frames did not
        # "appear suddenly" (H4), they were simply there when we started looking.
        self._stream_t0 = stream_start_t

    # -- public -----------------------------------------------------------------
    def evaluate(self, tracks, t: float, frame_w: int, frame_h: int,
                 all_live_tracks=None, recently_died_near=None) -> list[Assessment]:
        """
        Assess every track in `tracks` (the ones seen in this frame). `all_live_tracks`
        gives the child rule other people to compare heights with. Returns per-track
        assessments plus, when relevant, one group (M3) assessment with track_id -1,
        sorted from most to least severe.
        """
        if self._stream_t0 is None:
            self._stream_t0 = t
        all_live = all_live_tracks if all_live_tracks is not None else tracks
        results: list[Assessment] = []
        kins: list[tuple[object, Kinematics]] = []
        for tr in tracks:
            k = self.kinematics(tr, t, frame_w, frame_h, all_live, recently_died_near)
            kins.append((tr, k))
            if getattr(tr, "kind", "person") == "wheeled":
                results.append(self.assess_wheeled(tr.track_id, k))
            else:
                results.append(self.assess(tr.track_id, k))

        # Group rule only applies to pedestrians.
        group = self.assess_group([(tr, k) for tr, k in kins if getattr(tr, "kind", "person") == "person"])
        if group is not None:
            results.append(group)

        results.sort(key=lambda a: (LEVEL_RANK[a.level], -PRIORITY.index(a.case_id) if a.case_id else 0), reverse=True)
        return results

    # -- kinematics -------------------------------------------------------------
    def kinematics(self, track, t: float, frame_w: int, frame_h: int,
                   all_live_tracks, recently_died_near=None) -> Kinematics:
        cfg = self.cfg
        obs = track.window(t, cfg.RISK_WINDOW_SECONDS) or track.observations[-1:]
        h_ref = max(track.h_ref, 1e-6)
        truncated_last = self._bottom_truncated(obs[-1], frame_h)

        # A box cut by the BOTTOM of the frame has its feet outside the picture: its anchor
        # jumps to the frame border and would look like a huge leap toward the road.
        # Motion is therefore measured on the untruncated observations only.
        obs = [o for o in obs if not self._bottom_truncated(o, frame_h)] or obs[-1:]

        dists = [self.zone.signed_distance_px(o.anchor, frame_w, frame_h) / h_ref for o in obs]
        T = obs[-1].t - obs[0].t
        n = len(obs)
        motion_known = n >= 2 and T >= cfg.MIN_WINDOW_SECONDS

        approach = lateral = speed = recent_speed = net_move = last_approach = 0.0
        receded = not_slowing = stepping_down = False
        if n >= 2 and T > 0:
            approach = (dists[0] - dists[-1]) / T
            # Net displacement of the feet, in body heights, split into "toward the curb"
            # (approach) and "along the curb" (lateral). Works for a slanted curb line too.
            net_move = self._anchor_distance(obs[0], obs[-1]) / h_ref
            speed = net_move / T
            lateral = math.sqrt(max(0.0, speed * speed - approach * approach))
            recent_speed = self._segment_speed(obs, cfg.RECENT_SECONDS, h_ref)
            j = self._lookback_index(obs, cfg.STEP_LOOKBACK_SECONDS)
            dt_j = obs[-1].t - obs[j].t
            last_approach = (dists[j] - dists[-1]) / dt_j if dt_j > 0 else 0.0
            receded = any((dists[i + 1] - dists[i]) > cfg.EDGE_JITTER for i in range(n - 1))
            if n >= 3:                                  # not_slowing: compare the two halves of the window
                mid = n // 2
                T1, T2 = obs[mid].t - obs[0].t, obs[-1].t - obs[mid].t
                a1 = (dists[0] - dists[mid]) / T1 if T1 > 0 else 0.0
                a2 = (dists[mid] - dists[-1]) / T2 if T2 > 0 else 0.0
                not_slowing = a1 >= cfg.MOVING_MIN and a2 >= 0.8 * a1
            stepping_down = (dists[-1] <= 0.0 and max(dists) > cfg.EDGE_JITTER
                             and last_approach >= cfg.MOVING_MIN)

        stationary = motion_known and (recent_speed < cfg.MOVING_MIN or net_move < cfg.MIN_MOVE_H)
        moving = motion_known and not stationary
        parallel = moving and abs(approach) < cfg.PARALLEL_RATIO * speed
        approaching = moving and approach >= cfg.MOVING_MIN and not parallel
        moving_away = moving and approach <= -cfg.MOVING_MIN and not parallel
        tte = dists[-1] / approach if (approaching and dists[-1] > 0) else math.inf

        phone_count = sum(1 for o in obs if o.phone)
        phone_fraction = phone_count / n
        has_phone = phone_count >= cfg.PHONE_MIN_FRAMES and phone_fraction >= cfg.PHONE_MIN_FRACTION

        person_type, source = self._person_type(track, obs[-1], all_live_tracks, frame_h)
        appeared_suddenly = approaching and self._appeared_suddenly(track, t, n, T, frame_w, frame_h,
                                                                    h_ref, recently_died_near)

        return Kinematics(
            n_obs=n, window_seconds=T, motion_known=motion_known,
            dist_first=dists[0], dist_last=dists[-1], dist_max=max(dists),
            approach_speed=approach, lateral_speed=lateral, speed=speed, recent_speed=recent_speed,
            net_move_h=net_move, last_approach=last_approach, time_to_edge=tte,
            stationary=stationary, approaching=approaching, parallel=parallel, moving_away=moving_away,
            receded=receded, not_slowing=not_slowing, stepping_down=stepping_down,
            appeared_suddenly=appeared_suddenly, phone_fraction=phone_fraction, has_phone=has_phone,
            person_type=person_type, person_type_source=source, truncated_last=truncated_last,
            mean_confidence=sum(o.confidence for o in obs) / n, h_ref_px=h_ref,
        )

    # -- the 12 rules -------------------------------------------------------------
    def matching_cases(self, k: Kinematics) -> list[str]:
        """Every case whose condition holds, in priority order (first = the verdict)."""
        cfg = self.cfg
        if not k.motion_known:
            # Too little history to say anything about motion: wait, unless the person is
            # already past the curb line, which matters immediately.
            return ["M4"] if k.dist_last <= -cfg.EDGE_JITTER else []

        # Phone rules describe the approach to the curb; a phone alone never creates a case
        # for someone already walking in the road.
        at_or_before_curb = k.dist_last > -cfg.EDGE_JITTER or k.stepping_down
        is_child = k.person_type == "child"           # only true when the camera is calibrated (see _person_type)
        brisk = cfg.BRISK_MIN <= k.approach_speed < cfg.RUN_MIN
        rules = {
            # --- High ---
            "H6": k.approaching and is_child and k.approach_speed >= cfg.RUN_MIN,   # child darting
            "H1": k.approaching and k.approach_speed >= cfg.RUN_MIN,                # running/bursting
            # no-stop entry: brisk AND not slowing AND already near the edge (normal walk never triggers)
            "H5": (k.approaching and k.not_slowing and at_or_before_curb
                   and k.approach_speed >= cfg.BRISK_MIN and k.dist_last < cfg.NEAR_APPROACH),
            "H3": k.approaching and k.has_phone and k.dist_last < cfg.NEAR and k.not_slowing and at_or_before_curb,
            "H4": k.approaching and k.appeared_suddenly,
            "HW": False,                                     # wheeled rule, see matching_wheeled
            # --- Medium ---
            "H2": k.approaching and is_child                                        # child walking toward edge
                  and (k.dist_last < cfg.NEAR_APPROACH or k.time_to_edge <= cfg.TTE_MEDIUM),
            "M2": k.approaching and k.has_phone and k.dist_last < cfg.FAR and at_or_before_curb,
            # brisk + no braking, but not yet very close (that would be H5)
            "M5": (k.approaching and brisk and k.not_slowing
                   and k.dist_last >= cfg.NEAR and at_or_before_curb),
            "MW": False,                                     # wheeled rule, see matching_wheeled
            # --- Low ---
            "M4": k.stepping_down or (k.stationary and k.dist_last <= -cfg.EDGE_JITTER),
            "L4": k.stationary and -cfg.EDGE_JITTER < k.dist_last < cfg.NEAR,
            "M1": k.approaching and not k.receded and k.dist_last > -cfg.EDGE_JITTER
                  and (k.dist_last < cfg.NEAR_APPROACH or k.time_to_edge <= cfg.TTE_MEDIUM),
            "L1": k.parallel,
            "L3": k.moving_away,
            "L2": k.stationary and k.dist_last >= cfg.NEAR,
            "M3": False,                                     # group rule, evaluated across tracks
        }
        return [cid for cid in PRIORITY if rules[cid]]

    def matching_wheeled(self, k: Kinematics) -> list[str]:
        """Wheeled approacher (bicycle/motorcycle heading toward the crossing) -> HW / MW / none."""
        cfg = self.cfg
        if not k.motion_known or not k.approaching or k.dist_last >= cfg.WHEELED_NEAR:
            return []
        if k.approach_speed >= cfg.WHEELED_FAST or k.not_slowing:
            return ["HW"]                                    # fast, or not braking -> High
        if k.approach_speed >= cfg.WHEELED_MOVING_MIN:
            return ["MW"]                                    # slowing but still coming -> Medium
        return []

    def assess(self, track_id: int, k: Kinematics) -> Assessment:
        matched = self.matching_cases(k)
        case_id = matched[0] if matched else None
        level, name, reason = CASES[case_id] if case_id else (None, None, "no rule matched")
        # confidence: how sure the detector was, discounted when we saw only 1-2 frames
        confidence = int(round(100 * k.mean_confidence * min(1.0, k.n_obs / 3.0))) if case_id else 0
        return Assessment(
            track_id=track_id, level=level, case_id=case_id, case_name=name, reason=reason,
            confidence=max(1, min(100, confidence)) if case_id else 0,
            person_type=k.person_type, distracted=k.has_phone,
            metadata={
                "matchedCases": matched,
                "distanceToEdgeH": round(k.dist_last, 3),
                "approachSpeedHps": round(k.approach_speed, 3),
                "lateralSpeedHps": round(k.lateral_speed, 3),
                "speedHps": round(k.speed, 3),
                "recentSpeedHps": round(k.recent_speed, 3),
                "netMoveH": round(k.net_move_h, 3),
                "timeToEdgeSec": None if math.isinf(k.time_to_edge) else round(k.time_to_edge, 2),
                "windowSec": round(k.window_seconds, 2),
                "frames": k.n_obs,
                "phoneFraction": round(k.phone_fraction, 2),
                "personTypeSource": k.person_type_source,
                "truncated": k.truncated_last,
                "hRefPx": round(k.h_ref_px, 1),
                "note": "" if k.motion_known else "insufficient motion history",
            },
        )

    def assess_wheeled(self, track_id: int, k: Kinematics) -> Assessment:
        """Verdict for a wheeled approacher (bicycle/motorcycle)."""
        matched = self.matching_wheeled(k)
        case_id = matched[0] if matched else None
        level, name, reason = CASES[case_id] if case_id else (None, None, "no rule matched")
        confidence = int(round(100 * k.mean_confidence * min(1.0, k.n_obs / 3.0))) if case_id else 0
        return Assessment(
            track_id=track_id, level=level, case_id=case_id, case_name=name, reason=reason,
            confidence=max(1, min(100, confidence)) if case_id else 0,
            person_type="wheeled", distracted=False,
            metadata={
                "matchedCases": matched,
                "kind": "wheeled",
                "distanceToEdgeH": round(k.dist_last, 3),
                "approachSpeedHps": round(k.approach_speed, 3),
                "speedHps": round(k.speed, 3),
                "timeToEdgeSec": None if math.isinf(k.time_to_edge) else round(k.time_to_edge, 2),
                "frames": k.n_obs,
                "note": "" if k.motion_known else "insufficient motion history",
            },
        )

    def assess_group(self, kins: list[tuple[object, Kinematics]]) -> Assessment | None:
        """M3: several people approaching together, at least one of them not far."""
        cfg = self.cfg
        approaching = [(tr, k) for tr, k in kins if k.approaching and k.n_obs >= cfg.MIN_FRAMES_FOR_ALERT]
        if len(approaching) < cfg.GROUP_MIN or min(k.dist_last for _, k in approaching) >= cfg.FAR:
            return None
        level, name, reason = CASES["M3"]
        confidence = int(round(100 * sum(k.mean_confidence for _, k in approaching) / len(approaching)))
        return Assessment(
            track_id=-1, level=level, case_id="M3", case_name=name, reason=reason,
            confidence=max(1, min(100, confidence)),
            person_type="unknown", distracted=any(k.has_phone for _, k in approaching),
            metadata={"matchedCases": ["M3"], "trackIds": [tr.track_id for tr, _ in approaching],
                      "count": len(approaching),
                      "frames": min(k.n_obs for _, k in approaching),
                      "distanceToEdgeH": round(min(k.dist_last for _, k in approaching), 3),
                      "approachSpeedHps": round(sum(k.approach_speed for _, k in approaching) / len(approaching), 3)},
        )

    # -- helpers ------------------------------------------------------------------
    @staticmethod
    def _bottom_truncated(o, frame_h: int) -> bool:
        return o.y2 >= frame_h * (1.0 - config.TRUNCATION_MARGIN)

    @staticmethod
    def _anchor_distance(a, b) -> float:
        (ax, ay), (bx, by) = a.anchor, b.anchor
        return math.hypot(bx - ax, by - ay)

    @staticmethod
    def _lookback_index(obs, seconds: float) -> int:
        """Index of the first observation inside the last `seconds` (always < last index)."""
        for j, o in enumerate(obs):
            if o.t >= obs[-1].t - seconds and j < len(obs) - 1:
                return j
        return len(obs) - 2

    def _segment_speed(self, obs, seconds: float, h_ref: float) -> float:
        """Speed (h/s) over the most recent `seconds` of the window."""
        j = self._lookback_index(obs, seconds)
        dt = obs[-1].t - obs[j].t
        return self._anchor_distance(obs[j], obs[-1]) / h_ref / dt if dt > 0 else 0.0

    def _appeared_suddenly(self, track, t, n, T, frame_w, frame_h, h_ref, recently_died_near) -> bool:
        """
        H4: a person who ENTERED the picture (first box touched a side/top border), while the
        analysis was already running, is already near the curb and heading for it, and is not
        simply someone the tracker lost for a moment.
        """
        cfg = self.cfg
        first = track.observations[0]
        entered_from_border = first.truncated and not self._bottom_truncated(first, frame_h)
        if not entered_from_border:
            return False
        if self._stream_t0 is None or track.born_at - self._stream_t0 <= cfg.SUDDEN_MAX_AGE_SECONDS:
            return False                                 # cold start: they were there when we began
        # "young" must allow the MIN_FRAMES_FOR_ALERT frames to accumulate at the analysed rate
        dt_med = T / (n - 1) if n > 1 else cfg.SUDDEN_MAX_AGE_SECONDS
        age_bound = max(cfg.SUDDEN_MAX_AGE_SECONDS, (cfg.MIN_FRAMES_FOR_ALERT - 1) * dt_med * 1.05)
        if track.age(t) > age_bound:
            return False
        first_dist = self.zone.signed_distance_px(first.anchor, frame_w, frame_h) / h_ref
        if first_dist >= cfg.NEAR_APPROACH:
            return False
        if recently_died_near and recently_died_near(track.born_at, first.anchor, h_ref):
            return False
        return True

    def _person_type(self, track, last_obs, all_live_tracks, frame_h: int) -> tuple[str, str]:
        """
        child / adult / unknown.
          1. If the camera has ADULT_HEIGHT_REF calibration (adult height as a function of
             the feet position), compare with the expected adult height at this position.
          2. Otherwise compare with the tallest OTHER untruncated person seen in the SAME frame
             at a similar depth (feet within 10% of the frame height). No reference -> 'unknown'.
        Heights are the person's RECENT height (last few untruncated boxes), because a box
        grows as someone walks toward the camera. Truncated boxes are never classified.
        """
        cfg = self.cfg
        if last_obs.truncated:
            return "unknown", "none"
        recent = [o.height for o in track.observations[-3:] if not o.truncated]
        h = float(median(recent)) if recent else track.h_ref
        ref = cfg.ADULT_HEIGHT_REF
        if ref and len(ref) >= 2:
            (y1, h1), (y2, h2) = ref[0], ref[1]
            y = last_obs.anchor[1] / frame_h
            slope = (h2 - h1) / (y2 - y1) if y2 != y1 else 0.0
            expected = (h1 + slope * (y - y1)) * frame_h
            if expected > 0:
                return ("child" if h < cfg.CHILD_HEIGHT_RATIO * expected else "adult"), "calibration"
        # No calibration -> do NOT guess. The old relative-height heuristic mislabeled adults as
        # children (perspective, single-person frames), which fired false child alerts. Child cases
        # stay silent until ADULT_HEIGHT_REF is calibrated for the camera.
        return "unknown", "none"
