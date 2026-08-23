"""
alert_service.py
----------------
Backend integration (Sprint 4): sends danger alerts to the Node server.
All HTTP runs on a background thread so the video loop never blocks; a slow or
down server degrades gracefully instead of freezing the stream.
"""

import queue
import threading
from datetime import datetime, timezone

import requests

import config
from roi_monitor import DangerEvent


class AlertService:
    """Background POST sender for danger alerts."""

    # Sentinel pushed onto the queue to tell the worker to exit.
    _STOP = object()

    def __init__(self, url: str = config.API_URL,
                 timeout: float = config.API_TIMEOUT_SECONDS,
                 max_queue: int = 100):
        self.url = url
        self.timeout = timeout
        self._queue: "queue.Queue" = queue.Queue(maxsize=max_queue)
        self._worker: threading.Thread | None = None
        # A reusable Session pools the TCP connection across many alerts.
        self._session = requests.Session()

    #  Lifecycle 
    def start(self) -> None:
        """Spin up the daemon worker thread."""
        if self._worker and self._worker.is_alive():
            return
        self._worker = threading.Thread(
            target=self._run, name="AlertWorker", daemon=True
        )
        self._worker.start()
        print(f"[INFO] AlertService started -> {self.url}")

    def stop(self, drain: bool = True) -> None:
        """Signal the worker to finish and wait briefly for it to exit."""
        if not self._worker:
            return
        if drain:
            # Let queued alerts flush before we insert the stop sentinel.
            self._queue.put(self._STOP)
        self._worker.join(timeout=self.timeout + 1)
        self._session.close()
        print("[INFO] AlertService stopped.")

    #  Public API 
    def send(self, event: DangerEvent) -> None:
        """
        Enqueue an alert for asynchronous delivery. Returns immediately.

        If the queue is full (backend backed up), we drop the alert rather than
        block the video loop - the newest state matters more than a backlog.
        """
        payload = self._build_payload(event)
        try:
            self._queue.put_nowait(payload)
        except queue.Full:
            print("[WARN] Alert queue full - dropping alert (backend slow/down?).")

    #  Internals
    @staticmethod
    def _build_payload(event: DangerEvent) -> dict:
        """Map a DangerEvent onto the backend's expected JSON schema."""
        return {
            "crosswalkId": config.CROSSWALK_ID,
            "cameraId": config.CAMERA_ID,
            "severity": event.severity,
            "description": event.description,
            # ISO-8601, UTC, e.g. "2026-07-06T16:20:00+00:00".
            "timestamp": datetime.fromtimestamp(
                event.timestamp, tz=timezone.utc
            ).isoformat(),
        }

    def _run(self) -> None:
        """Worker loop: pull payloads and POST them until told to stop."""
        while True:
            item = self._queue.get()
            try:
                if item is self._STOP:
                    return
                self._post(item)
            finally:
                self._queue.task_done()

    def _post(self, payload: dict) -> None:
        """POST a single payload with defensive error handling."""
        try:
            resp = self._session.post(self.url, json=payload, timeout=self.timeout)
            if resp.status_code >= 400:
                print(f"[WARN] Backend rejected alert ({resp.status_code}): "
                      f"{resp.text[:200]}")
            else:
                print(f"[INFO] Alert delivered ({resp.status_code}): "
                      f"{payload['severity']} - {payload['description']}")
        except requests.exceptions.ConnectionError:
            # Server down / not listening - most common in dev.
            print("[WARN] Alert failed: backend unreachable (is it running?).")
        except requests.exceptions.Timeout:
            print(f"[WARN] Alert failed: request timed out after {self.timeout}s.")
        except requests.exceptions.RequestException as exc:
            # Catch-all for any other requests error, so the worker never dies.
            print(f"[WARN] Alert failed: {exc}")


class NullAlertService:
    """No-op stand-in used when config.API_ENABLED is False (vision-only)."""

    def start(self) -> None: ...
    def stop(self, drain: bool = True) -> None: ...
    def send(self, event: DangerEvent) -> None: ...


def build_alert_service():
    """Factory: real service if enabled, otherwise a silent no-op."""
    return AlertService() if config.API_ENABLED else NullAlertService()
