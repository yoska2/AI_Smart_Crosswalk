"""
verify_setup.py
---------------
Phase 1 install check: loads the lightweight YOLOv8 model and runs it on a
single test image to confirm OpenCV + Ultralytics are installed correctly.
"""

import argparse
import sys

try:
    import cv2
    from ultralytics import YOLO
except ImportError as exc:
    # Fail fast with a clear message instead of a raw traceback.
    print(f"[ERROR] Missing dependency: {exc.name}. "
          f"Did you activate the venv and run 'pip install -r requirements.txt'?")
    sys.exit(1)


# Ultralytics ships a hosted sample image ("bus.jpg") that is convenient for a
# smoke test. Passing this string lets YOLO fetch it automatically.
DEFAULT_SAMPLE = "https://ultralytics.com/images/bus.jpg"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="YOLOv8 installation smoke test.")
    parser.add_argument(
        "--image",
        default=DEFAULT_SAMPLE,
        help="Path or URL to a test image (defaults to Ultralytics' bus.jpg).",
    )
    parser.add_argument(
        "--model",
        default="yolov8n.pt",
        help="Model weights to load (default: yolov8n.pt).",
    )
    parser.add_argument(
        "--no-window",
        action="store_true",
        help="Skip opening a display window (useful on headless servers).",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    # 1. Load the model. Ultralytics downloads the weights on first use.
    print(f"[INFO] Loading model '{args.model}' ...")
    try:
        model = YOLO(args.model)
    except Exception as exc:  # broad catch: download / corrupt-weights failures
        print(f"[ERROR] Could not load model: {exc}")
        return 1

    # 2. Run inference on the test image.
    print(f"[INFO] Running inference on '{args.image}' ...")
    try:
        results = model(args.image)
    except Exception as exc:
        print(f"[ERROR] Inference failed: {exc}")
        return 1

    # 3. Report what was detected. `results` is a list (one entry per image).
    result = results[0]
    names = result.names  # {class_id: class_name}
    print(f"[INFO] Detected {len(result.boxes)} object(s):")
    for box in result.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        print(f"    - {names[class_id]:<12} conf={confidence:.2f}")

    # 4. Optionally display the annotated frame so we can eyeball the result.
    #    result.plot() returns a BGR numpy array with boxes already drawn.
    if not args.no_window:
        annotated = result.plot()
        cv2.imshow("YOLOv8 Verification - press any key to close", annotated)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    print("[SUCCESS] Environment verified. YOLOv8 + OpenCV are working.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
