# PROVENANCE: [RACHE] Sprint 3 vision/video_processor.py restored from git history (feat/api-founation):
#             class VideoProcessor, _open/_release/_resize, drawing helpers, run() loop, DI for tests.
#             [LIEL] adapted for Sprint 4: works with the MERGED detector (dicts) through tracker.py,
#             analyses 1 of N frames, uses VIDEO time (frame/fps), replaces the single "inside ROI"
#             rule with risk_rules.RiskEngine (12 cases), de-duplicates alerts per crosswalk incident, attaches a
#             JPEG snapshot, window is optional (default off: runs on a file, no desktop needed),
#             run() returns a summary.
"""
video_processor.py
------------------
The pipeline for one video:

    video file --> frames --> YOLO (detector.py) --> tracker.py (who is who) -->
    risk_rules.py (which of the 12 cases) --> alert_sender.py (POST /api/alerts)

Run:  python main.py --source path/to/clip.mp4            (see main.py for options)
"""
from __future__ import annotations

import base64
import math
import time
from collections import Counter
from dataclasses import replace

import cv2

import config
from alert_sender import RiskEvent, build_alert_sender
from risk_rules import LEVEL_RANK, PRIORITY, RiskEngine
from tracker import build_tracker


class VideoProcessor:
    """Manages the read-detect-track-classify-alert loop over a video source."""

    def __init__(self, source=config.VIDEO_SOURCE, tracker=None, engine=None, alert_sender=None,
                 show: bool = config.SHOW_WINDOW, every_n: int = config.PROCESS_EVERY_N_FRAMES,
                 crosswalk_id: str = config.CROSSWALK_ID, camera_id: str = config.CAMERA_ID):
        self.source = source
        # Dependency injection for testing; otherwise build the defaults.
        self.tracker = tracker or build_tracker()
        self.engine = engine or RiskEngine()
        self.alerts = alert_sender or build_alert_sender()
        self.show = show
        self.every_n = max(1, int(every_n))
        self.crosswalk_id = crosswalk_id
        self.camera_id = camera_id

        self.cap: cv2.VideoCapture | None = None
        self.fps: float = 25.0
        # De-duplication state: the active incident at this crosswalk (or None)
        self._incident: dict | None = None
        self.events: list[RiskEvent] = []
        self.frames_read = 0
        self.frames_analysed = 0

    # Capture lifecycle
    def _open(self) -> bool:
        """Open the video source. Returns True on success."""
        self.cap = cv2.VideoCapture(self.source)
        if not self.cap.isOpened():
            print(f"[ERROR] Could not open video source: {self.source!r}")
            return False
        fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.fps = fps if fps and fps > 0 else 25.0
        # The tracker forgets a person unseen for TRACK_MAX_GAP_SECONDS. Analysing too few
        # frames would break every track (and silence every alert), so clamp and say so.
        max_every = max(1, math.floor(config.TRACK_MAX_GAP_SECONDS * self.fps / 2))
        if self.every_n > max_every:
            print(f"[WARN] --every {self.every_n} is too sparse for {self.fps:.0f} fps; using {max_every}")
            self.every_n = max_every
        print(f"[INFO] Video source opened: {self.source!r} ({self.fps:.1f} fps, analysing 1 of {self.every_n} frames)")
        return True

    def _release(self) -> None:
        """Release the capture and close windows. Safe to call multiple times."""
        if self.cap is not None:
            self.cap.release()
            self.cap = None
        if self.show:
            cv2.destroyAllWindows()

    @staticmethod
    def _resize(frame):
        """Downscale a frame to config.PROCESS_WIDTH, preserving aspect ratio."""
        if config.PROCESS_WIDTH is None:
            return frame
        h, w = frame.shape[:2]
        if w <= config.PROCESS_WIDTH:
            return frame
        scale = config.PROCESS_WIDTH / w
        return cv2.resize(frame, (config.PROCESS_WIDTH, int(h * scale)), interpolation=cv2.INTER_AREA)

    # Alerts
    @staticmethod
    def _severity(assessment) -> tuple[int, int]:
        """Higher = worse: level first, then the case's place in PRIORITY (earlier = more severe)."""
        return LEVEL_RANK[assessment.level], -PRIORITY.index(assessment.case_id)

    def _should_send(self, assessment, t: float) -> bool:
        """
        One alert per crosswalk INCIDENT (not per person):
          * no active incident                          -> send, start the incident
          * a more severe level or case than so far     -> send (escalation)
          * otherwise                                   -> stay quiet
        The incident ends after config.INCIDENT_QUIET_SECONDS without any risky assessment.
        """
        inc = self._incident
        if inc is not None and (t - inc["last"]) >= config.INCIDENT_QUIET_SECONDS:
            inc = self._incident = None
        severity = self._severity(assessment)
        if inc is None:
            self._incident = {"severity": severity, "last": t}
            return True
        inc["last"] = t
        if severity > inc["severity"]:
            inc["severity"] = severity
            return True
        return False

    @staticmethod
    def _snapshot(frame) -> str | None:
        ok, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, config.SNAPSHOT_JPEG_QUALITY])
        return base64.b64encode(buf).decode("ascii") if ok else None

    def _handle_assessments(self, assessments, frame, t: float, frame_index: int) -> None:
        # Too early to judge: one or two frames say nothing about motion or a phone.
        risky = [a for a in assessments if a.level is not None
                 and (a.track_id == -1 or a.metadata.get("frames", 0) >= config.MIN_FRAMES_FOR_ALERT)]
        if not risky:
            return
        for a in [max(risky, key=self._severity)]:       # at most one alert per frame: the most severe
            if not self._should_send(a, t):
                continue
            # Only Medium/High alerts get a snapshot saved to Cloudinary (Low = no image, saves storage).
            snapshot = self._snapshot(frame) if a.level in ("Medium", "High") else None
            event = RiskEvent(assessment=a, crosswalk_id=self.crosswalk_id, camera_id=self.camera_id,
                              video_time=t, frame_index=frame_index, snapshot_base64=snapshot)
            self.events.append(replace(event, snapshot_base64=None))   # keep the summary light; the sender gets the image
            who = "group" if a.track_id == -1 else f"person #{a.track_id}"
            # Console line in English (Windows consoles often cannot print Hebrew); the Hebrew
            # case name travels in the alert payload (description) to the dashboard.
            print(f"[{a.level.upper():6}] t={t:6.2f}s {who}: {a.case_id} {a.reason} "
                  f"(dist={a.metadata.get('distanceToEdgeH', a.metadata.get('minDistanceToEdgeH'))}h, "
                  f"approach={a.metadata.get('approachSpeedHps', '-')}h/s, conf={a.confidence})")
            self.alerts.send(event)          # returns immediately; never blocks the loop

    # Drawing (only when show=True)
    def _draw(self, frame, tracks, assessments) -> None:
        h, w = frame.shape[:2]
        poly = self.engine.zone.pixel_polygon(w, h).astype(int).reshape((-1, 1, 2))
        overlay = frame.copy()
        cv2.fillPoly(overlay, [poly], (255, 200, 0))
        cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, frame)
        cv2.polylines(frame, [poly], isClosed=True, color=(255, 200, 0), thickness=2)

        verdict = {a.track_id: a for a in assessments if a.track_id != -1}
        colors = {None: (0, 200, 0), "Low": (0, 200, 200), "Medium": (0, 140, 255), "High": (0, 0, 255)}
        for tr in tracks:
            o = tr.last
            a = verdict.get(tr.track_id)
            color = colors[a.level if a else None]
            cv2.rectangle(frame, (int(o.x1), int(o.y1)), (int(o.x2), int(o.y2)), color, 2)
            caption = f"#{tr.track_id}" + (f" {a.case_id}" if a and a.case_id else "") + (" phone" if o.phone else "")
            cv2.putText(frame, caption, (int(o.x1) + 2, int(o.y1) - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2, cv2.LINE_AA)

        # Top banner when a Medium/High alert is active, so it's obvious an alert fired.
        active = [a for a in assessments if a.level in ("Medium", "High")]
        if active:
            worst = max(active, key=lambda a: LEVEL_RANK[a.level])
            banner = f"ALERT: {worst.level.upper()} - {worst.case_id}"
            cv2.rectangle(frame, (0, 0), (w, 34), (0, 0, 255), -1)
            cv2.putText(frame, banner, (10, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)

    # Per-frame work
    def _process_frame(self, frame, t: float, frame_index: int):
        """Detect + track + classify one frame and dispatch any new alerts."""
        h, w = frame.shape[:2]
        tracks_now, _phones = self.tracker.process(t, frame)
        assessments = self.engine.evaluate(
            tracks_now, t, w, h,
            all_live_tracks=self.tracker.live_tracks,
            recently_died_near=self.tracker.recently_died_near,
        )
        self._handle_assessments(assessments, frame, t, frame_index)
        if self.show:
            self._draw(frame, tracks_now, assessments)
        return assessments

    # Main loop
    def run(self) -> dict:
        """Process the whole source; return a summary (counts per case + the events)."""
        if not self._open():
            return {"error": f"could not open {self.source!r}"}

        self.alerts.start()
        started = time.monotonic()
        live = isinstance(self.source, int)                    # webcam: frames arrive in real time
        frame_index = -1
        try:
            while True:
                ok, frame = self.cap.read()
                if not ok:
                    print("[INFO] No more frames (end of video or camera drop).")
                    break
                frame_index += 1
                self.frames_read += 1
                if frame_index % self.every_n:
                    continue                                   # skip: CPU cannot do every frame

                # Video file: time = frame / fps (exact, independent of CPU speed).
                # Live camera: the wall clock, because slow inference drops frames.
                t = (time.monotonic() - started) if live else frame_index / self.fps
                frame = self._resize(frame)
                self._process_frame(frame, t, frame_index)
                self.frames_analysed += 1

                if self.show:
                    # Shrink only the DISPLAYED frame so tall videos fit the screen (processing is unaffected).
                    disp = frame
                    max_h = getattr(config, "SHOW_MAX_HEIGHT", None)
                    if max_h and disp.shape[0] > max_h:
                        scale = max_h / disp.shape[0]
                        disp = cv2.resize(disp, (int(disp.shape[1] * scale), max_h), interpolation=cv2.INTER_AREA)
                    cv2.imshow(config.WINDOW_NAME, disp)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        print("[INFO] 'q' pressed - shutting down.")
                        break
        except KeyboardInterrupt:
            print("\n[INFO] Interrupted by user (Ctrl+C).")
        finally:
            # Always flush the alert queue and release resources.
            self.alerts.stop()
            self._release()
        return self.summary(time.monotonic() - started)

    def summary(self, elapsed: float = 0.0) -> dict:
        by_case = Counter(e.assessment.case_id for e in self.events)
        by_level = Counter(e.assessment.level for e in self.events)
        return {
            "source": str(self.source),
            "framesRead": self.frames_read,
            "framesAnalysed": self.frames_analysed,
            "elapsedSec": round(elapsed, 1),
            "alerts": len(self.events),
            "byLevel": dict(by_level),
            "byCase": dict(by_case),
            "events": [
                {"t": round(e.video_time, 2), "track": e.assessment.track_id, "case": e.assessment.case_id,
                 "level": e.assessment.level, "confidence": e.assessment.confidence,
                 "personType": e.assessment.person_type, "distracted": e.assessment.distracted}
                for e in self.events
            ],
        }
