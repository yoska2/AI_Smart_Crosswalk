# PROVENANCE: [RACHE] your config, trimmed for images-only.
# ============================================================
# SANDBOX FILE - TRIMMED for images-only (was your vision/config.py).
# REMOVED (video/drawing, not needed for images): VIDEO_SOURCE, PROCESS_WIDTH,
#   COLOR_PERSON/VEHICLE/ROI/DANGER, WINDOW_NAME.
# KEPT: model, confidence, class ids, ROI, alert/API ids.
# NOTE (Option B): danger now runs in the BACKEND, so ROI / cooldown / API ids
#   really belong to the backend's danger+alert layer. Kept here for now;
#   move them to the backend when you wire the rules. The AI service itself
#   only needs MODEL_PATH + CONFIDENCE_THRESHOLD + the class allow-list.
# ============================================================

# --- Model (AI service needs this) ---
MODEL_PATH = "yolov8n.pt"     # lightweight model; swap for yolov8s.pt for accuracy
CONFIDENCE_THRESHOLD = 0.35   # ignore detections below this confidence

# --- Classes of interest (the detector's allow-list) ---
# NOTE: the final allow-list = the union of classes your DANGER EVENTS reference
# (still to define). cell phone (67) is included because distraction is a scenario.
PERSON_CLASS_ID = 0
VEHICLE_CLASS_IDS = {2, 3, 5, 7}   # car, motorcycle, bus, truck
PHONE_CLASS_ID = 67                # cell phone (for distraction rule)
TARGET_CLASS_IDS = {PERSON_CLASS_ID, PHONE_CLASS_ID} | VEHICLE_CLASS_IDS

# --- ROI (belongs to the backend danger layer under Option B) ---
ROI_POLYGON_NORM = [
    (0.25, 0.45),   # top-left
    (0.75, 0.45),   # top-right
    (0.92, 0.95),   # bottom-right
    (0.08, 0.95),   # bottom-left
]
ROI_ANCHOR = "bottom_center"       # "bottom_center" (feet) or "center"

# --- Alert debounce (belongs to the backend under Option B) ---
ALERT_COOLDOWN_SECONDS = 1.0

# --- Alert identity (belongs to the backend under Option B) ---
CROSSWALK_ID = "cw_001"
CAMERA_ID = "cam_101"
