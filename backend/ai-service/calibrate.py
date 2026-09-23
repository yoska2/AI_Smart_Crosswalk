# PROVENANCE: [RACHE] calibration helper for child detection (ADULT_HEIGHT_REF).
"""
calibrate.py
------------
Derive the per-camera adult-height reference used to tell children from adults,
directly from a video. Because of perspective a person's pixel height depends on
where they stand, so we sample real pedestrians and fit the "typical adult height
at a given feet position" from two depth bands.

Most pedestrians are adults, so at each depth the adult height is the UPPER part of
the height distribution (children are shorter and a minority). We take a high
percentile per band to represent the adult.

Run (in the venv, with the backend NOT required):
    python calibrate.py --source samples/clip2.mp4            # print the value to paste
    python calibrate.py --source samples/clip2.mp4 --write    # also write it into config.py

Then child cases (H2 walking / H6 darting) switch on and become reliable.
"""
from __future__ import annotations

import argparse
import re
from statistics import median

import cv2

import config
from detector import detect          # loads YOLO once


def _percentile(values: list[float], pct: float) -> float:
    if not values:
        return 0.0
    s = sorted(values)
    k = max(0, min(len(s) - 1, int(round((pct / 100.0) * (len(s) - 1)))))
    return s[k]


def collect_samples(source, every_n: int) -> list[tuple[float, float]]:
    """Return (feet_y_norm, height_norm) for every untruncated person box in the video."""
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        raise SystemExit(f"[ERROR] cannot open {source!r}")
    samples: list[tuple[float, float]] = []
    idx = -1
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        idx += 1
        if idx % every_n:
            continue
        h, w = frame.shape[:2]
        mx, my = 0.02 * w, 0.02 * h
        for d in detect(frame):
            if d["classId"] != config.PERSON_CLASS_ID:
                continue
            x, y, bw, bh = d["x"], d["y"], d["width"], d["height"]
            if bh < config.MIN_PERSON_HEIGHT_PX:
                continue
            # skip boxes touching any border (their height is not the full body)
            if x <= mx or y <= my or x + bw >= w - mx or y + bh >= h - my:
                continue
            samples.append(((y + bh) / h, bh / h))
    cap.release()
    return samples


def fit_reference(samples: list[tuple[float, float]], pct: float = 70.0):
    """Two (feet_y_norm, adult_height_norm) points: one for the far band, one for the near band."""
    if len(samples) < 12:
        raise SystemExit(f"[ERROR] only {len(samples)} samples - need a clip with more pedestrians")
    samples.sort(key=lambda s: s[0])                 # by feet_y (far -> near)
    mid = len(samples) // 2
    bands = [samples[:mid], samples[mid:]]           # far half, near half
    ref = []
    for band in bands:
        fy = median(fy for fy, _ in band)
        hn = _percentile([hn for _, hn in band], pct)   # adults = upper part of the heights
        ref.append((round(fy, 4), round(hn, 4)))
    return ref


def write_into_config(ref) -> None:
    path = config.__file__
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    line = f"ADULT_HEIGHT_REF = {ref}"
    new, n = re.subn(r"^ADULT_HEIGHT_REF\s*=.*$", line, text, count=1, flags=re.M)
    if n == 0:
        raise SystemExit("[ERROR] could not find ADULT_HEIGHT_REF in config.py")
    with open(path, "w", encoding="utf-8") as f:
        f.write(new)
    print(f"[OK] wrote into {path}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Calibrate ADULT_HEIGHT_REF from a video.")
    ap.add_argument("--source", required=True, help="video file path")
    ap.add_argument("--every", type=int, default=5, help="analyse 1 of every N frames (default 5)")
    ap.add_argument("--pct", type=float, default=70.0, help="adult height percentile per band (default 70)")
    ap.add_argument("--write", action="store_true", help="write the result into config.py")
    args = ap.parse_args()

    samples = collect_samples(args.source, max(1, args.every))
    ref = fit_reference(samples, args.pct)
    print(f"[INFO] {len(samples)} person samples")
    print(f"ADULT_HEIGHT_REF = {ref}")
    if args.write:
        write_into_config(ref)
    else:
        print("[hint] re-run with --write to save it into config.py")


if __name__ == "__main__":
    main()
