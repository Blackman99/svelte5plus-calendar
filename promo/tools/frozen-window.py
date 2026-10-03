#!/usr/bin/env python3
"""Stricter frozen-time check (from film critic 1): a moment counts as near-still when the picture
changes by less than THRESH/255 (mean absolute luma difference) over a WINDOW-second span.
Slow pushes pass the frame-to-frame check in frozen-time.sh but can still read as a hold.
Usage: tools/frozen-window.py film.mp4 [window=0.5] [thresh=3] [end=<ignore after, e.g. the CTA>]"""
import subprocess, sys
import numpy as np

f = sys.argv[1]
win = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
th = float(sys.argv[3]) if len(sys.argv) > 3 else 3.0
end = float(sys.argv[4]) if len(sys.argv) > 4 else 1e9
FPS, W, H = 10, 320, 180
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'fps={FPS},scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
k = int(win * FPS)
d = np.abs(fr[k:] - fr[:-k]).mean((1, 2))
still = [i / FPS for i, v in enumerate(d) if v < th and i / FPS < end]
runs, start, prev = [], None, None
for s in still:
    if start is None or s - prev > 1.01 / FPS:
        if start is not None:
            runs.append((start, prev))
        start = s
    prev = s
if start is not None:
    runs.append((start, prev))
print(' '.join(f'{a:.1f}–{b + win:.1f}' for a, b in runs) or 'none')
print(f'near-still over {win}s windows (<{th}/255): {len(still) / FPS:.1f}s' + (f' before {end}s' if end < 1e9 else ''))
