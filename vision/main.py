"""
main.py
-------
Entry point for the vision "brain". Parses the --source argument and runs the
VideoProcessor loop (open video -> detect -> check ROI -> draw -> alert).
"""

import argparse
import sys

import config
from video_processor import VideoProcessor


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Smart Crosswalk vision brain.")
    parser.add_argument(
        "--source",
        default=None,
        help="Video source: webcam index (e.g. 0) or a file/RTSP path. "
             "Overrides config.VIDEO_SOURCE.",
    )
    return parser.parse_args()


def resolve_source(raw):
    """A bare integer string ('0') means a webcam index; anything else is a path."""
    if raw is None:
        return config.VIDEO_SOURCE
    return int(raw) if raw.isdigit() else raw


def main() -> int:
    args = parse_args()
    source = resolve_source(args.source)

    try:
        processor = VideoProcessor(source=source)
    except Exception as exc:
        # Most likely a model-loading failure at startup.
        print(f"[ERROR] Failed to initialize: {exc}")
        return 1

    processor.run()
    print("[INFO] Shutdown complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
