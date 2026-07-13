# Vision "Brain" — Sprint 3

Python computer-vision module for the Smart City Crosswalk System. Processes a
video stream, detects pedestrians/vehicles with YOLOv8, evaluates a crosswalk
Region of Interest (ROI), and posts safety alerts to the Node.js backend.

## Setup

```bash
cd vision

# 1. Create & activate a virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# 2. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 3. Verify the install (Phase 1)
python verify_setup.py
```

`verify_setup.py` auto-downloads `yolov8n.pt` (~6 MB) and a sample image, runs
detection, and opens an annotated preview window.

## Progress

- [x] Phase 1 — Environment & PoC (`verify_setup.py`)
- [x] Phase 2 — Video stream processing loop (`main.py`, `video_processor.py`, `detector.py`, `config.py`)
- [x] Phase 3 — ROI & business logic (`roi_monitor.py`)
- [x] Phase 4 — Backend API integration (`alert_service.py`, POST → `http://localhost:5000/api/alerts`)

## Run (Phase 2)

```bash
python main.py                # uses config.VIDEO_SOURCE (webcam 0 by default)
python main.py --source 0     # explicit webcam index
python main.py --source clip.mp4
```

Press `q` in the window to quit.

## Module map

| File | Responsibility |
|------|----------------|
| `config.py` | All tunables: model, video source, target classes, colors |
| `detector.py` | `Detector` (YOLOv8 wrapper) + `Detection` dataclass |
| `video_processor.py` | `VideoProcessor` — capture/detect/evaluate/draw/display loop |
| `roi_monitor.py` | `ROIMonitor` + `DangerEvent` — ROI polygon, intersection test, alert cooldown |
| `alert_service.py` | `AlertService` — threaded, non-blocking POST sender + payload builder |
| `main.py` | CLI entry point |

## Backend alerts

Danger events are POSTed to `config.API_URL` on a background thread, so a slow
or down backend never stalls the video loop. Start the Sprint 2 server first:

```bash
# in the project root (Node backend)
node index.js
```

Payload schema:

```json
{
  "crosswalkId": "cw_001",
  "cameraId": "cam_101",
  "severity": "High",
  "description": "Pedestrian inside crosswalk ROI",
  "timestamp": "2026-07-06T13:22:09.432308+00:00"
}
```

Set `API_ENABLED = False` in `config.py` to run vision-only with no network calls.
