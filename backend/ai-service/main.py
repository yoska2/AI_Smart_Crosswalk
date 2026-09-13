# PROVENANCE: [RACHE] Sprint 3 vision/main.py restored from git history (CLI entry, resolve_source).
#             [LIEL] added flags: --show, --no-api, --every, --crosswalk, --camera, --tracker; prints a
#             JSON summary at the end; relative paths resolve against this folder.
"""
main.py
-------
Analyse a video file with the Smart Crosswalk risk brain.

    python main.py --source samples/clip1.mp4              # analyse + POST alerts to the backend
    python main.py --source samples/clip1.mp4 --no-api     # analyse only, print the verdicts
    python main.py --source 0 --show                       # webcam, with a window ('q' quits)
"""
import argparse
import json
import os
import sys

import config


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Smart Crosswalk - video risk analysis (12 cases).")
    parser.add_argument("--source", default=None,
                        help="Video file path, or a webcam index (e.g. 0). Overrides config.VIDEO_SOURCE.")
    parser.add_argument("--show", action="store_true", help="Open a window with boxes and the edge zone.")
    parser.add_argument("--no-api", action="store_true", help="Do not POST alerts; just print them.")
    parser.add_argument("--every", type=int, default=config.PROCESS_EVERY_N_FRAMES,
                        help="Analyse 1 of every N frames (default from config).")
    parser.add_argument("--crosswalk", default=config.CROSSWALK_ID, help="crosswalkId for the alerts.")
    parser.add_argument("--camera", default=config.CAMERA_ID, help="cameraId for the alerts.")
    parser.add_argument("--tracker", choices=["simple", "yolo"], default=config.TRACKER,
                        help="simple = built-in matcher, yolo = ultralytics ByteTrack.")
    return parser.parse_args()


def resolve_source(raw):
    """A bare integer string ('0') means a webcam index; anything else is a path."""
    if raw is None:
        raw = config.VIDEO_SOURCE
    if isinstance(raw, int):
        return raw
    if str(raw).isdigit():
        return int(raw)
    if not os.path.isabs(raw):
        raw = os.path.join(os.path.dirname(os.path.abspath(__file__)), raw)
    return raw


def main() -> int:
    # Windows consoles default to cp1252; the summary contains Hebrew case names.
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass
    args = parse_args()
    config.TRACKER = args.tracker
    source = resolve_source(args.source)
    if not isinstance(source, int) and not os.path.isfile(source):
        print(f"[ERROR] Video file not found: {source}")
        return 1

    # Imported here so that `python main.py --help` works without loading YOLO.
    from alert_sender import build_alert_sender
    from video_processor import VideoProcessor

    try:
        processor = VideoProcessor(
            source=source,
            alert_sender=build_alert_sender(enabled=not args.no_api),
            show=args.show,
            every_n=args.every,
            crosswalk_id=args.crosswalk,
            camera_id=args.camera,
        )
    except Exception as exc:
        print(f"[ERROR] Failed to initialize: {exc}")     # most likely a model-loading failure
        return 1

    summary = processor.run()
    print("\n[SUMMARY]")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if "error" not in summary else 1


if __name__ == "__main__":
    sys.exit(main())
