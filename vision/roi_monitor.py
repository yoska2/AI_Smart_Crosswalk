import time
from dataclasses import dataclass

import cv2
import numpy as np

import config
from detector import Detection


@dataclass
class DangerEvent:
    """A validated danger, ready to be reported to the backend."""
    label: str            # e.g. "person", "car"
    severity: str         # "High" (pedestrian) or "Medium" (vehicle)
    description: str      # human-readable summary
    point: tuple          # the anchor point that was inside the ROI
    timestamp: float      # epoch seconds when it was detected


class ROIMonitor:
    """Owns the ROI polygon, the intersection test, and the alert cooldown."""

    def __init__(self, frame_width: int, frame_height: int):
        # Convert the normalized polygon into pixel coordinates for this frame
        # size. Stored as an int32 Nx2 array, the format OpenCV expects.
        self.polygon = np.array(
            [(int(x * frame_width), int(y * frame_height))
             for x, y in config.ROI_POLYGON_NORM],
            dtype=np.int32,
        )
        # Cooldown bookkeeping: last alert time per danger type (label).
        self._last_alert: dict[str, float] = {}
        self.cooldown = config.ALERT_COOLDOWN_SECONDS

    #Geometry 
    def _anchor(self, det: Detection) -> tuple[int, int]:
        """Pick the bounding-box point to test, per config.ROI_ANCHOR."""
        if config.ROI_ANCHOR == "center":
            return det.center
        return det.bottom_center

    def contains(self, point: tuple[int, int]) -> bool:
        """True if `point` is inside (or on the edge of) the ROI polygon."""
        # pointPolygonTest returns >0 inside, 0 on edge, <0 outside.
        return cv2.pointPolygonTest(self.polygon, (float(point[0]), float(point[1])), False) >= 0

    # Business logic
    @staticmethod
    def _severity_for(det: Detection) -> str:
        """A pedestrian in the zone is the highest concern."""
        return "High" if det.is_person else "Medium"

    @staticmethod
    def _description_for(det: Detection) -> str:
        if det.is_person:
            return "Pedestrian inside crosswalk ROI"
        return f"Vehicle ({det.label}) inside crosswalk ROI"

    def _cooldown_passed(self, label: str, now: float) -> bool:
        """True if enough time has elapsed to alert again for this danger type."""
        last = self._last_alert.get(label)
        if last is None or (now - last) >= self.cooldown:
            self._last_alert[label] = now
            return True
        return False

    def evaluate(self, detections: list[Detection]) -> tuple[list[Detection], list[DangerEvent]]:
        """
        Test all detections against the ROI.

        Returns:
            (objects_in_roi, events_to_alert)
            * objects_in_roi: every detection currently inside the zone, so the
              caller can highlight them (drawn every frame).
            * events_to_alert: only those that also passed the cooldown, so the
              caller fires at most one alert per danger type per cooldown window.
        """
        now = time.time()
        in_roi: list[Detection] = []
        events: list[DangerEvent] = []

        for det in detections:
            if not self.contains(self._anchor(det)):
                continue
            in_roi.append(det)

            if self._cooldown_passed(det.label, now):
                events.append(
                    DangerEvent(
                        label=det.label,
                        severity=self._severity_for(det),
                        description=self._description_for(det),
                        point=self._anchor(det),
                        timestamp=now,
                    )
                )
        return in_roi, events

    #Drawing 
    def draw(self, frame, active: bool = False) -> None:
        """
        Draw the ROI onto the frame in place.

        `active=True` (something is inside) tints the zone red; otherwise it is
        drawn as a translucent safe outline.
        """
        color = config.COLOR_DANGER if active else config.COLOR_ROI

        # Semi-transparent fill via an overlay blend.
        overlay = frame.copy()
        cv2.fillPoly(overlay, [self.polygon], color)
        cv2.addWeighted(overlay, 0.25, frame, 0.75, 0, frame)

        # Solid outline on top.
        cv2.polylines(frame, [self.polygon], isClosed=True, color=color, thickness=2)
        label = "DANGER ZONE" if active else "Crosswalk ROI"
        x, y = self.polygon[0]
        cv2.putText(frame, label, (x, max(20, y - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2, cv2.LINE_AA)
