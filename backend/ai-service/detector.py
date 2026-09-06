# PROVENANCE: [MERGE] Yossef's flat output format + your confidence threshold + config allow-list.
# ============================================================
# SANDBOX - MERGED pure detector (caller-agnostic: image -> detections).
# = Yossef's flat JSON output {classId,confidence,x,y,width,height}
#   + YOUR confidence threshold
#   + config-driven allow-list (config.TARGET_CLASS_IDS).
# Loads YOLO once. Knows nothing about FastAPI - app.py calls detect().
# NOTE: the allow-list is provisional until the danger events are defined.
# ============================================================

from ultralytics import YOLO
import config

# Load the model once (reused for every image).
model = YOLO(config.MODEL_PATH)


def detect(image):
    """
    Run YOLOv8 on one image (path or array) and return a list of detections.
    Each detection is a flat, JSON-friendly dict:
        {classId, confidence, x, y, width, height}
    Only classes in the allow-list and above the confidence threshold are kept.
    """
    results = model(image, verbose=False)[0]   # one image in -> one result

    detections = []
    for box in results.boxes:
        class_id = int(box.cls[0])
        # keep only the classes our danger rules care about
        if class_id not in config.TARGET_CLASS_IDS:
            continue

        confidence = float(box.conf[0])
        if confidence < config.CONFIDENCE_THRESHOLD:
            continue

        x1, y1, x2, y2 = (float(v) for v in box.xyxy[0])
        detections.append({
            "classId": class_id,
            "label": results.names[class_id],   # e.g. "person", "car", "cell phone"
            "confidence": round(confidence, 3),
            "x": x1,
            "y": y1,
            "width": x2 - x1,
            "height": y2 - y1,
        })

    return detections
