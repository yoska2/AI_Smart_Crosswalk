from ultralytics import YOLO


# Load the YOLOv8 model exactly once, when this module is first imported.
# app.py imports this module a single time at startup, so the model is
# loaded once and reused for every request instead of being reloaded per image.
model = YOLO("yolov8n.pt")


def run_detection(image_path):

    # Run YOLOv8 inference on the given image path.
    results = model(image_path)

    detections = []

    # results is a list with one entry per input image; only one image is ever passed at a time.
    for result in results:

        # result.boxes holds one entry per detected object in that image.
        for box in result.boxes:

            # xyxy = [x1, y1, x2, y2] corner coordinates of the bounding box.
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "classId": int(box.cls[0]),
                "confidence": float(box.conf[0]),
                "x": x1,
                "y": y1,
                "width": x2 - x1,
                "height": y2 - y1
            })

    return detections
