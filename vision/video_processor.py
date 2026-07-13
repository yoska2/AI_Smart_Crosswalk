import time

import cv2

import config
from detector import Detection, Detector
from roi_monitor import ROIMonitor
from alert_service import build_alert_service


class VideoProcessor:
    """Manages the capture-detect-evaluate-draw-display-alert loop."""

    def __init__(self, source=config.VIDEO_SOURCE, detector: Detector | None = None,
                 alert_service=None):
        self.source = source
        # Allow dependency injection for testing; otherwise build the defaults.
        self.detector = detector or Detector()
        self.alerts = alert_service or build_alert_service()
        self.cap: cv2.VideoCapture | None = None
        # Built lazily on the first frame, once we know the (resized) frame size.
        self.roi: ROIMonitor | None = None

    # Capture lifecycle 
    def _open(self) -> bool:
        """Open the video source. Returns True on success."""
        self.cap = cv2.VideoCapture(self.source)
        if not self.cap.isOpened():
            print(f"[ERROR] Could not open video source: {self.source!r}")
            return False
        print(f"[INFO] Video source opened: {self.source!r}")
        return True

    def _release(self) -> None:
        """Release the capture and close windows. Safe to call multiple times."""
        if self.cap is not None:
            self.cap.release()
            self.cap = None
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
        return cv2.resize(frame, (config.PROCESS_WIDTH, int(h * scale)),
                          interpolation=cv2.INTER_AREA)

    # Drawing 
    def _draw_detection(self, frame, det: Detection, in_danger: bool = False) -> None:
        """Draw one bounding box + label onto the frame in place."""
        if in_danger:
            color = config.COLOR_DANGER
        else:
            color = config.COLOR_PERSON if det.is_person else config.COLOR_VEHICLE
        cv2.rectangle(frame, (det.x1, det.y1), (det.x2, det.y2), color, 2)

        caption = f"{det.label} {det.confidence:.2f}"
        # Draw a filled label background so text stays readable over any scene.
        (tw, th), _ = cv2.getTextSize(caption, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(frame, (det.x1, det.y1 - th - 6),
                      (det.x1 + tw + 4, det.y1), color, -1)
        cv2.putText(frame, caption, (det.x1 + 2, det.y1 - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)

    def _handle_events(self, events) -> None:
        """Dispatch each validated danger event to the async alert service."""
        for ev in events:
            print(f"[ALERT] {ev.severity}: {ev.description} @ {ev.point}")
            self.alerts.send(ev)   # returns immediately; never blocks the loop

    def _process_frame(self, frame):
        """
        Detect objects, test them against the ROI, annotate, and dispatch any
        validated danger events.
        """
        # Build the ROI once we know the actual (resized) frame dimensions.
        if self.roi is None:
            h, w = frame.shape[:2]
            self.roi = ROIMonitor(w, h)

        detections = self.detector.detect(frame)
        in_roi, events = self.roi.evaluate(detections)
        danger_ids = {id(d) for d in in_roi}

        # Draw the ROI first (tinted red while occupied), then boxes on top.
        self.roi.draw(frame, active=bool(in_roi))
        for det in detections:
            self._draw_detection(frame, det, in_danger=id(det) in danger_ids)

        self._handle_events(events)
        return frame, detections

    # Main loop
    def run(self) -> None:
        """Open the source and process frames until the stream ends or 'q'."""
        if not self._open():
            return

        self.alerts.start()
        prev_time = time.time()

        try:
            while True:
                ok, frame = self.cap.read()
                if not ok:
                    print("[INFO] No more frames (end of stream or camera drop).")
                    break

                # Downscale before detection so ROI coordinates and the display
                # window all operate on the same manageable frame size.
                frame = self._resize(frame)
                frame, _ = self._process_frame(frame)

                # Overlay FPS.
                now = time.time()
                fps = 1.0 / (now - prev_time) if now != prev_time else 0.0
                prev_time = now
                cv2.putText(frame, f"FPS: {fps:.1f}", (10, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2,
                            cv2.LINE_AA)

                cv2.imshow(config.WINDOW_NAME, frame)

                if cv2.waitKey(1) & 0xFF == ord("q"):
                    print("[INFO] 'q' pressed - shutting down.")
                    break
        except KeyboardInterrupt:
            print("\n[INFO] Interrupted by user (Ctrl+C).")
        finally:
            # Always release resources and flush the alert queue.
            self.alerts.stop()
            self._release()
