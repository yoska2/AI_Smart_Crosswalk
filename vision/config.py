"""
config.py
---------
Central configuration for the Smart Crosswalk vision "brain".
All tunables live here: model, video source, target classes, ROI polygon,
alert cooldown, drawing colors, and the backend API settings.
"""

# Model
MODEL_PATH = "yolov8n.pt"   # lightweight model; swap for yolov8s.pt for accuracy
CONFIDENCE_THRESHOLD = 0.35  # ignore detections below this confidence

# Video source
VIDEO_SOURCE = "dummy-dataset/clip1.mp4"

# Downscale each frame to this width (keeping aspect ratio) before processing..
# Set to None to disable resizing.
PROCESS_WIDTH = 960

#Classes of interest
PERSON_CLASS_ID = 0
VEHICLE_CLASS_IDS = {2, 3, 5, 7}  # car, motorcycle, bus, truck

# The full set we keep after inference (everything else is discarded).
TARGET_CLASS_IDS = {PERSON_CLASS_ID} | VEHICLE_CLASS_IDS

#Region of Interest (Crosswalk / Danger Zone)
ROI_POLYGON_NORM = [
    (0.25, 0.45),   # top-left
    (0.75, 0.45),   # top-right
    (0.92, 0.95),   # bottom-right
    (0.08, 0.95),   # bottom-left
]

# Which reference point of a bounding box is tested against the ROI.
# "bottom_center" (where the object meets the ground)
ROI_ANCHOR = "bottom_center"

#Alert debounce
ALERT_COOLDOWN_SECONDS = 1.0

#Drawing
# BGR colors (OpenCV order).
COLOR_PERSON = (0, 200, 0)      # green
COLOR_VEHICLE = (0, 140, 255)   # orange
COLOR_ROI = (255, 200, 0)       # cyan-ish outline for the safe ROI
COLOR_DANGER = (0, 0, 255)      # red: object inside the ROI
WINDOW_NAME = "Smart Crosswalk - Vision Brain"

#Backend API
API_URL = "http://localhost:3000/api/alerts"
API_TIMEOUT_SECONDS = 5          # per-request network timeout
API_ENABLED = True               # set False to run vision-only (no POST)

# Identifiers included in every alert payload.
CROSSWALK_ID = "cw_001"
CAMERA_ID = "cam_101"
