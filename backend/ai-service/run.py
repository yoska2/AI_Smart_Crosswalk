# PROVENANCE: [RACHE] sandbox helper (new) - manual test of the detector.
# ============================================================
# SANDBOX helper - quick manual test of the merged detector.
# Usage: python run.py <image_path>
# Prints the detections as JSON so you can see the AI service's output shape.
# ============================================================
import json
import sys
from detector import detect

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run.py <image_path>")
        sys.exit(1)
    result = detect(sys.argv[1])
    print(f"[INFO] {len(result)} detection(s):")
    print(json.dumps(result, indent=2, ensure_ascii=False))
