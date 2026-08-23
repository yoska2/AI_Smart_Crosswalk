"""
detector.py
-----------
Thin wrapper around the Ultralytics YOLOv8 model. Loads the model once and
turns each frame into a clean list of `Detection` objects (person/vehicle
boxes above a confidence threshold), so the rest of the code never touches
YOLO internals.
"""

from dataclasses import dataclass

from ultralytics import YOLO

import config


@dataclass
class Detection:
    """A single detected object in a frame."""
    class_id: int
    label: str
    confidence: float
    # Bounding box in pixel coordinates.
    x1: int
    y1: int
    x2: int
    y2: int

    @property
    def center(self) -> tuple[int, int]:
        """Center point of the bounding box (used later for ROI checks)."""
        return (self.x1 + self.x2) // 2, (self.y1 + self.y2) // 2

    @property
    def bottom_center(self) -> tuple[int, int]:
        """
        Bottom-center of the box. For a person or car this is the point that
        touches the ground, which is a better proxy for "where the object is"
        than the geometric center when checking against a road-level ROI.
        """
        return (self.x1 + self.x2) // 2, self.y2

    @property
    def is_person(self) -> bool:
        return self.class_id == config.PERSON_CLASS_ID

    @property
    def is_vehicle(self) -> bool:
        return self.class_id in config.VEHICLE_CLASS_IDS


class Detector:
    """Loads YOLOv8 and produces filtered detections per frame."""

    def __init__(self, model_path: str = config.MODEL_PATH,
                 confidence: float = config.CONFIDENCE_THRESHOLD):
        self.confidence = confidence
        # Loading can fail (bad path, corrupt download); let the caller decide
        # how to handle a startup failure rather than swallowing it here.
        self.model = YOLO(model_path)
        self.names = self.model.names  # {class_id: label}

    def detect(self, frame) -> list[Detection]:
        """
        Run inference on one BGR frame and return filtered detections.

        `verbose=False` keeps Ultralytics from printing a line per frame, which
        would flood the console at video frame rates.
        """
        results = self.model(frame, verbose=False)[0]

        detections: list[Detection] = []
        for box in results.boxes:
            class_id = int(box.cls[0])
            if class_id not in config.TARGET_CLASS_IDS:
                continue

            confidence = float(box.conf[0])
            if confidence < self.confidence:
                continue

            x1, y1, x2, y2 = map(int, box.xyxy[0])
            detections.append(
                Detection(
                    class_id=class_id,
                    label=self.names[class_id],
                    confidence=confidence,
                    x1=x1, y1=y1, x2=x2, y2=y2,
                )
            )
        return detections
